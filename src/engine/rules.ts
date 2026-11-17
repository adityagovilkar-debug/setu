// Rule cards: the system is a list of rules, each one "in this auction, with this kind of hand, make this call".
// The bot, the explanations and (later) the critic all read the same list.
import { Auction, Call, cheapestLevel, isBid, isLegal, levelOf, seatOf, strainOf } from './auction';
import { Hand, Seat, SUIT_LETTER, SUIT_NAME, SUIT_SYMBOL, evaluate, goodSuit, partnerOf, sideOf, stopper } from './cards';

/** Suit variables bound while matching an auction pattern, e.g. { M: 3 } when "1M" matched 1♠. */
export type Bind = Record<string, number>;

/** What a call promises: a point range and a length range for each suit. */
export interface Shows {
  hcp: [number, number];
  lenMin: number[];
  lenMax: number[];
}
export const noShows = (): Shows => ({ hcp: [0, 37], lenMin: [0, 0, 0, 0], lenMax: [13, 13, 13, 13] });

type Cond =
  | { k: 'num'; what: 'hcp' | 'pts' | 'sup'; lo: number; hi: number }
  | { k: 'len'; v: string; lo: number; hi: number }
  | { k: 'cmp'; a: string; op: '>=' | '>'; b: string }
  | { k: 'flag'; name: string; arg?: string; neg: boolean };

export interface Rule {
  id: string;
  ctx: string[];
  call: string;
  conds: Cond[];
  text: string;
  /** 0 not forcing, 1 forcing for one round, 2 forcing to game */
  force: 0 | 1 | 2;
  conv?: string;
  notConv?: string;
  own: boolean;
  /** heading of the part of the card this rule belongs to */
  section?: string;
}

/** A rule card written by the player. */
export interface OwnRule {
  id: string;
  after: string;
  call: string;
  conds: string;
  text: string;
  force: 0 | 1 | 2;
}
export interface SystemCard {
  name: string;
  conv: Record<string, boolean>;
  own: OwnRule[];
}

const V = '(oM|om|[CDHSMmXYZ])';
const RE_NUM = /^(hcp|pts|sup)\s*(\d+)(?:(\+)|-(\d+))?$/;
const RE_LEN = new RegExp('^' + V + '(\\d+)(?:(\\+)|(-)(\\d+)?)?$');
const RE_CMP = new RegExp('^' + V + '(>=|>)' + V + '$');
const RE_FLAG = /^(!?)(bal|semibal|ph|pph|seat3|jump|nojump|anymaj4|nomaj4|min5|umaj4|tox|stopopp)$/;
const RE_FLAGV = new RegExp('^(!?)(good|stop)\\s+' + V + '$');

function parseCond(t: string): Cond {
  let m: RegExpExecArray | null;
  if ((m = RE_NUM.exec(t))) {
    const lo = Number(m[2]);
    return { k: 'num', what: m[1] as 'hcp', lo, hi: m[3] ? 40 : m[4] !== undefined ? Number(m[4]) : lo };
  }
  if ((m = RE_LEN.exec(t))) {
    const n = Number(m[2]);
    if (m[3]) return { k: 'len', v: m[1], lo: n, hi: 13 };
    if (m[4]) return m[5] !== undefined ? { k: 'len', v: m[1], lo: n, hi: Number(m[5]) } : { k: 'len', v: m[1], lo: 0, hi: n };
    return { k: 'len', v: m[1], lo: n, hi: n };
  }
  if ((m = RE_CMP.exec(t))) return { k: 'cmp', a: m[1], op: m[2] as '>', b: m[3] };
  if ((m = RE_FLAG.exec(t))) return { k: 'flag', name: m[2], neg: m[1] === '!' };
  if ((m = RE_FLAGV.exec(t))) return { k: 'flag', name: m[2], arg: m[3], neg: m[1] === '!' };
  throw new Error(`Cannot read the condition "${t}"`);
}
export function parseConds(text: string): Cond[] {
  return text
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map(parseCond);
}

const RE_TOKEN = /^\(?(P|X|XX|\*|[1-7](?:N|oM|om|[CDHSMmXYZ]))\)?$/;
export function parseCtx(text: string): string[] {
  const t = text.trim();
  if (!t || t === 'open') return [];
  const tokens = t.split(/\s+/);
  for (const tok of tokens) {
    if (!RE_TOKEN.test(tok) || tok.startsWith('(') !== tok.endsWith(')')) throw new Error(`Cannot read the call "${tok}"`);
  }
  return tokens;
}

let nextId = 1;
/** Reads rule lines: "context | call | conditions | meaning | flags". */
export function parseRules(text: string): Rule[] {
  const out: Rule[] = [];
  let section = '';
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (line.startsWith('# ====')) section = line.replace(/^#\s*=+\s*/, '');
    if (!line || line.startsWith('#')) continue;
    const f = line.split('|').map((s) => s.trim());
    if (f.length < 4) throw new Error(`Bad rule line: ${line}`);
    const rule: Rule = { id: 'b' + nextId++, ctx: parseCtx(f[0]), call: f[1], conds: parseConds(f[2]), text: f[3], force: 0, own: false, section };
    if (!RE_TOKEN.test(rule.call) || rule.call === '*') throw new Error(`Bad call in rule line: ${line}`);
    for (const flag of (f[4] || '').split(/\s+/).filter(Boolean)) {
      if (flag === 'F') rule.force = 1;
      else if (flag === 'GF') rule.force = 2;
      else if (flag.startsWith('conv:')) rule.conv = flag.slice(5);
      else if (flag.startsWith('!conv:')) rule.notConv = flag.slice(6);
      else throw new Error(`Unknown flag "${flag}" in: ${line}`);
    }
    out.push(rule);
  }
  return out;
}
export function ownToRule(o: OwnRule): Rule {
  return { id: o.id, ctx: parseCtx(o.after), call: o.call, conds: parseConds(o.conds), text: o.text, force: o.force, own: true };
}

/** The auction as seen by one player. */
export interface Ctx {
  /** Calls after the opening passes. Own side as written, opponents in brackets, opponents' passes left out. */
  tokens: string[];
  /** the player passed before anyone bid */
  ph: boolean;
  /** partner passed before anyone bid */
  pph: boolean;
  /** opening in third seat */
  seat3: boolean;
  oppSuits: number[];
  ownSuits: number[];
}
export function buildCtx(a: Auction, seat: Seat): Ctx {
  let lead = 0;
  while (lead < a.calls.length && a.calls[lead] === 'P') lead++;
  const ctx: Ctx = { tokens: [], ph: false, pph: false, seat3: false, oppSuits: [], ownSuits: [] };
  for (let i = 0; i < lead; i++) {
    if (seatOf(a, i) === seat) ctx.ph = true;
    if (seatOf(a, i) === partnerOf(seat)) ctx.pph = true;
  }
  for (let i = lead; i < a.calls.length; i++) {
    const c = a.calls[i];
    const own = sideOf(seatOf(a, i)) === sideOf(seat);
    if (own) ctx.tokens.push(c);
    else if (c !== 'P') ctx.tokens.push('(' + c + ')');
    if (isBid(c) && strainOf(c) < 4) {
      const list = own ? ctx.ownSuits : ctx.oppSuits;
      if (!list.includes(strainOf(c))) list.push(strainOf(c));
    }
  }
  ctx.seat3 = lead === 2 && ctx.tokens.length === 0;
  return ctx;
}

function suitOf(v: string, b: Bind): number | undefined {
  if (v === 'oM') return b.M === undefined ? undefined : 5 - b.M;
  if (v === 'om') return b.m === undefined ? undefined : 1 - b.m;
  const lit = SUIT_LETTER.indexOf(v);
  return lit >= 0 ? lit : b[v];
}
function unify(v: string, idx: number, b: Bind): boolean {
  const known = suitOf(v, b);
  if (known !== undefined) return known === idx;
  if (v === 'oM' || v === 'om') return false;
  if (v === 'M' && idx < 2) return false;
  if (v === 'm' && idx > 1) return false;
  for (const k in b) if (b[k] === idx) return false;
  b[v] = idx;
  return true;
}
function matchToken(p: string, t: string, b: Bind): boolean {
  if (p === '*') return true;
  if (p === 'P' || p === 'X' || p === 'XX' || !isBid(t)) return p === t;
  if (p[0] !== t[0]) return false;
  const ps = p.slice(1);
  if (ps === 'N' || t[1] === 'N') return ps === t[1];
  return unify(ps, SUIT_LETTER.indexOf(t[1]), b);
}
function matchCtx(pattern: string[], tokens: string[]): Bind | null {
  if (pattern.length !== tokens.length) return null;
  const b: Bind = {};
  for (let i = 0; i < pattern.length; i++) {
    const p = pattern[i];
    const t = tokens[i];
    const opp = p[0] === '(';
    if (opp !== (t[0] === '(')) return null;
    if (!matchToken(opp ? p.slice(1, -1) : p, opp ? t.slice(1, -1) : t, b)) return null;
  }
  return b;
}

/** Does a rule's auction pattern begin with these actual calls? Used to look an auction up on the card. */
export function ctxStartsWith(pattern: string[], tokens: string[]): boolean {
  return pattern.length >= tokens.length && matchCtx(pattern.slice(0, tokens.length), tokens) !== null;
}

/** The concrete calls a rule's call pattern can stand for (a free suit variable tries the longest suit first). */
function callOptions(pattern: string, bind: Bind, hand: Hand): { call: Call; bind: Bind }[] {
  if (!isBid(pattern) || pattern[1] === 'N') return [{ call: pattern, bind }];
  const sv = pattern.slice(1);
  const s = suitOf(sv, bind);
  if (s !== undefined) return [{ call: pattern[0] + SUIT_LETTER[s], bind }];
  const out: { call: Call; bind: Bind; len: number; idx: number }[] = [];
  for (let idx = 0; idx < 4; idx++) {
    const b = { ...bind };
    if (unify(sv, idx, b)) out.push({ call: pattern[0] + SUIT_LETTER[idx], bind: b, len: hand[idx].length, idx });
  }
  return out.sort((x, y) => y.len - x.len || y.idx - x.idx);
}

function testConds(rule: Rule, hand: Hand, bind: Bind, ctx: Ctx, call: Call, a: Auction): boolean {
  const ev = evaluate(hand);
  for (const c of rule.conds) {
    if (c.k === 'num') {
      const v = ev[c.what];
      if (v < c.lo || v > c.hi) return false;
    } else if (c.k === 'len') {
      const s = suitOf(c.v, bind);
      if (s === undefined || ev.len[s] < c.lo || ev.len[s] > c.hi) return false;
    } else if (c.k === 'cmp') {
      const x = suitOf(c.a, bind);
      const y = suitOf(c.b, bind);
      if (x === undefined || y === undefined) return false;
      if (c.op === '>=' ? ev.len[x] < ev.len[y] : ev.len[x] <= ev.len[y]) return false;
    } else {
      let r = false;
      const s = c.arg ? suitOf(c.arg, bind) : undefined;
      switch (c.name) {
        case 'bal': r = ev.bal; break;
        case 'semibal': r = ev.semibal; break;
        case 'ph': r = ctx.ph; break;
        case 'pph': r = ctx.pph; break;
        case 'seat3': r = ctx.seat3; break;
        case 'jump': r = isBid(call) && levelOf(call) === cheapestLevel(a, strainOf(call)) + 1; break;
        case 'nojump': r = isBid(call) && levelOf(call) === cheapestLevel(a, strainOf(call)); break;
        case 'anymaj4': r = ev.len[2] >= 4 || ev.len[3] >= 4; break;
        case 'nomaj4': r = ev.len[2] < 4 && ev.len[3] < 4; break;
        case 'min5': r = ev.len[0] >= 5 || ev.len[1] >= 5; break;
        case 'umaj4': {
          const un = [2, 3].filter((x) => !ctx.ownSuits.includes(x) && !ctx.oppSuits.includes(x));
          r = un.length > 0 && un.every((x) => ev.len[x] >= 4);
          break;
        }
        case 'tox':
          r = ctx.oppSuits.length > 0 && [0, 1, 2, 3].every((x) => (ctx.oppSuits.includes(x) ? ev.len[x] <= 2 : ev.len[x] >= 3));
          break;
        case 'stopopp': r = ctx.oppSuits.length > 0 && ctx.oppSuits.every((x) => stopper(hand, x)); break;
        case 'good': r = s !== undefined && goodSuit(hand, s); break;
        case 'stop': r = s !== undefined && stopper(hand, s); break;
      }
      if (r === c.neg) return false;
    }
  }
  return true;
}

/** What one rule promises about the hand. */
function showsOf(rule: Rule, bind: Bind, ctx: Ctx): Shows {
  const sh = noShows();
  for (const c of rule.conds) {
    if (c.k === 'num') {
      const lo = c.what === 'hcp' ? c.lo : Math.max(0, c.lo - (c.what === 'pts' ? 3 : 4));
      sh.hcp = [Math.max(sh.hcp[0], lo), Math.min(sh.hcp[1], c.hi)];
    } else if (c.k === 'len') {
      const s = suitOf(c.v, bind);
      if (s !== undefined) {
        sh.lenMin[s] = Math.max(sh.lenMin[s], c.lo);
        sh.lenMax[s] = Math.min(sh.lenMax[s], c.hi);
      }
    } else if (c.k === 'flag' && !c.neg) {
      if (c.name === 'bal') for (let s = 0; s < 4; s++) {
        sh.lenMin[s] = Math.max(sh.lenMin[s], 2);
        sh.lenMax[s] = Math.min(sh.lenMax[s], 5);
      }
      if (c.name === 'umaj4') for (const s of [2, 3]) {
        if (!ctx.ownSuits.includes(s) && !ctx.oppSuits.includes(s)) sh.lenMin[s] = Math.max(sh.lenMin[s], 4);
      }
      if (c.name === 'tox') for (let s = 0; s < 4; s++) {
        if (ctx.oppSuits.includes(s)) sh.lenMax[s] = Math.min(sh.lenMax[s], 2);
        else sh.lenMin[s] = Math.max(sh.lenMin[s], 3);
      }
    }
  }
  return sh;
}
function hull(list: Shows[]): Shows {
  const out = list[0];
  for (const sh of list.slice(1)) {
    out.hcp = [Math.min(out.hcp[0], sh.hcp[0]), Math.max(out.hcp[1], sh.hcp[1])];
    for (let s = 0; s < 4; s++) {
      out.lenMin[s] = Math.min(out.lenMin[s], sh.lenMin[s]);
      out.lenMax[s] = Math.max(out.lenMax[s], sh.lenMax[s]);
    }
  }
  return out;
}

const GENERIC: Record<string, string> = { M: 'the major', oM: 'the other major', m: 'the minor', om: 'the other minor', X: 'the suit', Y: 'their suit', Z: 'the new suit' };
const spoken = (v: string, s: number | undefined): string => (s === undefined ? 'in ' + (GENERIC[v] ?? v) : SUIT_NAME[s]);
/** Fills {M}, {oM}, {X}… in a meaning with the actual suit symbol. */
export function fillText(text: string, bind: Bind): string {
  return text.replace(/\{(oM|om|[MmXYZ])\}/g, (_, v: string) => {
    const s = suitOf(v, bind);
    return s === undefined ? GENERIC[v] : SUIT_SYMBOL[s];
  });
}
/** A rule's hand requirements in plain words. */
export function describeConds(rule: Rule, bind: Bind = {}): string {
  const name = (v: string): string => {
    const s = suitOf(v, bind);
    return s === undefined ? GENERIC[v] ?? v : SUIT_NAME[s];
  };
  const held = (v: string): string => spoken(v, suitOf(v, bind));
  const parts: string[] = [];
  for (const c of rule.conds) {
    if (c.k === 'num') {
      const unit = c.what === 'hcp' ? 'points' : c.what === 'pts' ? 'points counting length' : 'points counting shortness';
      parts.push(c.hi >= 37 ? `${c.lo}+ ${unit}` : c.lo === c.hi ? `${c.lo} ${unit}` : c.lo === 0 ? `up to ${c.hi} ${unit}` : `${c.lo}–${c.hi} ${unit}`);
    } else if (c.k === 'len') {
      parts.push(c.hi >= 13 ? `${c.lo}+ ${held(c.v)}` : c.lo === c.hi ? `exactly ${c.lo} ${held(c.v)}` : c.lo === 0 ? `at most ${c.hi} ${held(c.v)}` : `${c.lo}–${c.hi} ${held(c.v)}`);
    } else if (c.k === 'cmp') {
      parts.push(`${name(c.a)} ${c.op === '>' ? 'longer than' : 'at least as long as'} ${name(c.b)}`);
    } else if (c.neg && (c.name === 'ph' || c.name === 'pph')) {
      continue;
    } else {
      const words: Record<string, string> = {
        bal: 'balanced', semibal: 'balanced or nearly so', ph: 'a passed hand', pph: 'partner is a passed hand', seat3: 'third seat',
        jump: 'a jump', nojump: 'not a jump', anymaj4: 'a four-card major', nomaj4: 'no four-card major', min5: 'a five-card minor',
        umaj4: 'four cards in each unbid major', tox: 'short in their suit with support for the others', stopopp: 'a stopper in their suit',
        good: `a good suit in ${name(c.arg ?? '')}`, stop: `a stopper in ${name(c.arg ?? '')}`,
      };
      parts.push((c.neg ? 'not ' : '') + (words[c.name] ?? c.name));
    }
  }
  return parts.join(', ');
}

export interface Match {
  rule: Rule;
  bind: Bind;
}

export class System {
  readonly rules: Rule[];
  private byLen = new Map<number, Rule[]>();

  constructor(readonly card: SystemCard, base: Rule[]) {
    const own: Rule[] = [];
    for (const o of card.own) {
      try {
        own.push(ownToRule(o));
      } catch {
        // an unreadable card is skipped; the System room shows it as needing attention
      }
    }
    const active = base.filter((r) => (!r.conv || card.conv[r.conv]) && (!r.notConv || !card.conv[r.notConv]));
    this.rules = [...own, ...active];
    for (const r of this.rules) {
      const list = this.byLen.get(r.ctx.length);
      if (list) list.push(r);
      else this.byLen.set(r.ctx.length, [r]);
    }
  }

  private matching(ctx: Ctx): Match[] {
    const out: Match[] = [];
    for (const rule of this.byLen.get(ctx.tokens.length) ?? []) {
      const bind = matchCtx(rule.ctx, ctx.tokens);
      if (bind) out.push({ rule, bind });
    }
    return out;
  }

  /** Does the card say anything at all about this point in the auction? */
  covers(a: Auction, seat: Seat): boolean {
    return this.matching(buildCtx(a, seat)).length > 0;
  }

  /** Every one of the player's own rule cards that fits this hand here (to spot two cards claiming the same hand). */
  ownMatches(a: Auction, seat: Seat, hand: Hand): { rule: Rule; call: Call }[] {
    const ctx = buildCtx(a, seat);
    const out: { rule: Rule; call: Call }[] = [];
    for (const m of this.matching(ctx)) {
      if (!m.rule.own) continue;
      for (const opt of callOptions(m.rule.call, m.bind, hand)) {
        if (isLegal(a, opt.call) && testConds(m.rule, hand, opt.bind, ctx, opt.call, a)) {
          out.push({ rule: m.rule, call: opt.call });
          break;
        }
      }
    }
    return out;
  }

  /** The call the card prescribes for this hand: the first rule that fits wins. */
  find(a: Auction, seat: Seat, hand: Hand): { rule: Rule; call: Call; bind: Bind } | null {
    const ctx = buildCtx(a, seat);
    for (const m of this.matching(ctx)) {
      for (const opt of callOptions(m.rule.call, m.bind, hand)) {
        if (isLegal(a, opt.call) && testConds(m.rule, hand, opt.bind, ctx, opt.call, a)) return { rule: m.rule, call: opt.call, bind: opt.bind };
      }
    }
    return null;
  }

  /** Every rule under which this call could have been made, and what the call therefore promises. */
  explain(a: Auction, seat: Seat, call: Call): { matches: Match[]; shows: Shows | null; force: 0 | 1 | 2 } {
    const ctx = buildCtx(a, seat);
    const matches: Match[] = [];
    const shows: Shows[] = [];
    let force: 0 | 1 | 2 = 0;
    for (const m of this.matching(ctx)) {
      const b = { ...m.bind };
      if (!matchToken(m.rule.call, call, b)) continue;
      // conditions about the call itself (jump / not a jump) must hold for the rule to be a candidate
      const shape = m.rule.conds.filter((c) => c.k === 'flag' && (c.name === 'jump' || c.name === 'nojump'));
      if (shape.length && !testConds({ ...m.rule, conds: shape }, [[], [], [], []], b, ctx, call, a)) continue;
      matches.push({ rule: m.rule, bind: b });
      shows.push(showsOf(m.rule, b, ctx));
      if (m.rule.force > force) force = m.rule.force;
    }
    return { matches, shows: shows.length ? hull(shows) : null, force };
  }
}
