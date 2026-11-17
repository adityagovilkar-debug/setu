// The critic: deals a large number of hands, lets the bots bid them with the card, and reports
// where the card is silent, which rule cards clash or never come up, and how often each convention is used.
import { Call, isBid, isOver, toAct } from './auction';
import { botCall, isGame, newTable, play } from './bidder';
import { Hand, Seat, dealCards, makeRng, sideOf } from './cards';
import { Rule, System, SystemCard, buildCtx, ownToRule } from './rules';
import { baseRules, defaultCard } from './system21';

export interface Example {
  seed: number;
  dealer: Seat;
  seat: Seat;
  hand: Hand;
  call: Call;
  why: string;
}
/** A point in the auction where the card gave no answer and the bot had to judge. */
export interface SilentSpot {
  tokens: string[];
  /** the opponents have bid or doubled */
  contested: boolean;
  /** the card has rules for this auction, but none fitted the hand */
  covered: boolean;
  /** how often this point in the auction came up with the card silent */
  count: number;
  /** how often the bot then had to make a bid or double on judgment (not a pass) */
  bids: number;
  /** what the bot did, by call */
  calls: Record<string, number>;
  example: Example;
}
export interface OwnStat {
  id: string;
  rule: Rule;
  fired: number;
  /** the base card's call on the hands where this card fired ('—' when the base card was silent) */
  replaced: Record<string, number>;
  clashes: number;
  clashWith: string;
  example: Example | null;
}
export interface CriticReport {
  deals: number;
  /** bids and doubles made by the partnership (passes are not counted) */
  calls: number;
  /** how many of those were made on judgment because the card was silent */
  silent: number;
  spots: SilentSpot[];
  own: OwnStat[];
  /** number of deals on which each convention was used by the partnership */
  conv: Record<string, number>;
  unreadable: { after: string; call: string; error: string }[];
}

export class Critic {
  private sys: System;
  private base: System;
  private field: System;
  private spots = new Map<string, SilentSpot>();
  private own = new Map<string, OwnStat>();
  private conv: Record<string, number> = {};
  private deals = 0;
  private calls = 0;
  private silent = 0;
  private unreadable: CriticReport['unreadable'] = [];

  constructor(card: SystemCard, private seed = 1) {
    this.sys = new System(card, baseRules());
    this.base = new System({ ...card, own: [] }, baseRules());
    this.field = new System(defaultCard(), baseRules());
    for (const o of card.own) {
      try {
        const rule = ownToRule(o);
        this.own.set(o.id, { id: o.id, rule, fired: 0, replaced: {}, clashes: 0, clashWith: '', example: null });
      } catch (e) {
        this.unreadable.push({ after: o.after, call: o.call, error: (e as Error).message });
      }
    }
  }

  /** Deals and bids n more deals. */
  step(n: number): void {
    for (let k = 0; k < n; k++) {
      const seed = this.seed + this.deals;
      const dealer = (this.deals % 4) as Seat;
      const deal = dealCards(makeRng(seed));
      const t = newTable(deal, dealer, [this.sys, this.field]);
      const used = new Set<string>();
      while (!isOver(t.auction)) {
        const seat = toAct(t.auction);
        const meta = botCall(t, seat);
        if (sideOf(seat) === 0) {
          if (meta.call !== 'P') this.calls++;
          const ex = (): Example => ({ seed, dealer, seat, hand: deal[seat], call: meta.call, why: meta.text });
          if (meta.tag === 'bw' || meta.tag === 'bwr') {
            // the key-card ask and its answers are a convention, handled in code rather than on rule cards
            if (meta.tag === 'bw') used.add('rkcb');
          } else if (meta.src === 'judgment') {
            // a pass once game is reached is not a gap worth reporting
            let ourLast: Call | null = null;
            for (let i = t.metas.length - 1; i >= 0; i--) {
              if (sideOf(t.metas[i].seat) === 0 && isBid(t.metas[i].call)) {
                ourLast = t.metas[i].call;
                break;
              }
            }
            if (!(meta.call === 'P' && ourLast && isGame(ourLast))) {
              if (meta.call !== 'P') this.silent++;
              const ctx = buildCtx(t.auction, seat);
              const key = ctx.tokens.join(' ');
              let spot = this.spots.get(key);
              if (!spot) {
                spot = { tokens: ctx.tokens, contested: ctx.tokens.some((x) => x[0] === '('), covered: this.sys.covers(t.auction, seat), count: 0, bids: 0, calls: {}, example: ex() };
                this.spots.set(key, spot);
              }
              spot.count++;
              if (meta.call !== 'P') {
                if (!spot.bids) spot.example = ex();
                spot.bids++;
              }
              spot.calls[meta.call] = (spot.calls[meta.call] || 0) + 1;
            }
          } else if (meta.fired) {
            if (meta.fired.conv) used.add(meta.fired.conv);
            if (meta.fired.own) {
              const stat = this.own.get(meta.fired.id);
              if (stat) {
                stat.fired++;
                if (!stat.example) stat.example = ex();
                const b = this.base.find(t.auction, seat, deal[seat]);
                const was = b ? b.call : '—';
                stat.replaced[was] = (stat.replaced[was] || 0) + 1;
                for (const other of this.sys.ownMatches(t.auction, seat, deal[seat])) {
                  if (other.rule.id !== meta.fired.id && other.call !== meta.call) {
                    stat.clashes++;
                    stat.clashWith = other.rule.id;
                    break;
                  }
                }
              }
            }
          }
        }
        play(t, meta);
      }
      for (const c of used) this.conv[c] = (this.conv[c] || 0) + 1;
      this.deals++;
    }
  }

  report(): CriticReport {
    return {
      deals: this.deals,
      calls: this.calls,
      silent: this.silent,
      spots: [...this.spots.values()].filter((s) => s.bids > 0).sort((a, b) => b.bids - a.bids || b.count - a.count),
      own: [...this.own.values()],
      conv: this.conv,
      unreadable: this.unreadable,
    };
  }
}
