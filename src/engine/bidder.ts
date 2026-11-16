// The bidder: follows the rule cards where they speak, and uses plain judgment where they are silent.
import { Auction, Call, cheapestLevel, isBid, isLegal, isOver, lastBid, levelOf, makeBid, seatOf, strainOf, toAct } from './auction';
import { Deal, Hand, Seat, SUIT_NAME, SUIT_SYMBOL, aces, evaluate, keyCards, partnerOf, sideOf, stopper, trumpQueen } from './cards';
import { Match, Shows, System, fillText, noShows } from './rules';

export interface CallMeta {
  call: Call;
  seat: Seat;
  /** rule = from a rule card; judgment = the card was silent; human = made by the player */
  src: 'rule' | 'judgment' | 'human';
  matches: Match[];
  /** plain-language meaning */
  text: string;
  shows: Shows | null;
  force: 0 | 1 | 2;
  /** bw = asks for key cards, bwr = answer to that, inv = an invitation made on judgment */
  tag?: 'bw' | 'bwr' | 'inv';
  /** for a human call: what the card prescribed for the hand (null if the card was silent) */
  cardCall?: Call | null;
  cardText?: string;
}

export interface Table {
  deal: Deal;
  auction: Auction;
  metas: CallMeta[];
  /** systems[0] is North-South's card, systems[1] East-West's */
  systems: [System, System];
}

export function newTable(deal: Deal, dealer: Seat, systems: [System, System]): Table {
  return { deal, auction: { dealer, calls: [] }, metas: [], systems };
}

/** What each seat has shown so far, folded from the meaning of every call. */
export function inferences(t: Table): Shows[] {
  const info = [noShows(), noShows(), noShows(), noShows()];
  for (const m of t.metas) {
    if (!m.shows) continue;
    const cur = info[m.seat];
    const lo = Math.max(cur.hcp[0], m.shows.hcp[0]);
    const hi = Math.min(cur.hcp[1], m.shows.hcp[1]);
    cur.hcp = lo <= hi ? [lo, hi] : [m.shows.hcp[0], m.shows.hcp[1]];
    for (let s = 0; s < 4; s++) {
      cur.lenMin[s] = Math.max(cur.lenMin[s], m.shows.lenMin[s]);
      cur.lenMax[s] = Math.min(cur.lenMax[s], m.shows.lenMax[s]);
    }
  }
  return info;
}

const callText = (c: Call): string => (c === 'P' ? 'Pass' : c === 'X' ? 'Double' : c === 'XX' ? 'Redouble' : c[0] + (c[1] === 'N' ? 'NT' : SUIT_SYMBOL[strainOf(c)]));

function lastMetaOf(t: Table, seat: Seat): CallMeta | null {
  for (let i = t.metas.length - 1; i >= 0; i--) if (t.metas[i].seat === seat) return t.metas[i];
  return null;
}
/** The suit our side last bid: the working trump suit for a key-card ask. */
function agreedSuit(t: Table, seat: Seat): number | null {
  for (let i = t.metas.length - 1; i >= 0; i--) {
    const m = t.metas[i];
    if (sideOf(m.seat) === sideOf(seat) && isBid(m.call) && strainOf(m.call) < 4 && m.tag !== 'bwr') return strainOf(m.call);
  }
  return null;
}

/** Looks a call up on the card of the side making it. Used for the player's calls and for explanations. */
export function describeCall(t: Table, seat: Seat, call: Call): CallMeta {
  const sys = t.systems[sideOf(seat)];
  const ex = sys.explain(t.auction, seat, call);
  const meta: CallMeta = { call, seat, src: 'human', matches: ex.matches, text: '', shows: ex.shows, force: ex.force };
  if (ex.matches.length) {
    const texts: string[] = [];
    for (const m of ex.matches) {
      const tx = fillText(m.rule.text, m.bind);
      if (!texts.includes(tx)) texts.push(tx);
    }
    meta.text = texts.slice(0, 3).join(' — or — ');
    return meta;
  }
  const partner = lastMetaOf(t, partnerOf(seat));
  const rho = t.metas[t.metas.length - 1];
  if (partner?.tag === 'bw' && rho?.call === 'P' && isBid(call) && levelOf(call) === 5) {
    meta.tag = 'bwr';
    meta.text = 'Answer to the key-card ask';
  } else if (call === '4N' && agreedSuit(t, seat) !== null) {
    meta.tag = 'bw';
    meta.force = 1;
    meta.text = sys.card.conv.rkcb ? 'Asks for key cards (the four aces and the king of trumps)' : 'Blackwood: asks for aces';
  } else if (call === 'P') {
    meta.text = sys.covers(t.auction, seat) ? 'Pass: your card gives this no particular meaning' : 'Pass';
  } else {
    meta.text = 'No agreement on the card for this call';
    if (isBid(call) && strainOf(call) < 4) {
      meta.shows = noShows();
      meta.shows.lenMin[strainOf(call)] = 4;
    }
  }
  return meta;
}

interface Verdict {
  call: Call;
  why: string;
  tag?: 'bw' | 'bwr' | 'inv';
  force?: 0 | 1 | 2;
  showSuit?: number;
}

const GAME_RANK = [11, 11, 10, 10, 9]; // tricks needed for game by strain: 5C 5D 4H 4S 3N
const isGame = (c: Call): boolean => levelOf(c) + 6 >= GAME_RANK[strainOf(c)];

/** Judgment for auctions the card does not cover. */
function judge(t: Table, seat: Seat): Verdict {
  const a = t.auction;
  const hand = t.deal[seat];
  const ev = evaluate(hand);
  const sys = t.systems[sideOf(seat)];
  const partner = partnerOf(seat);
  const info = inferences(t);
  const P = info[partner];
  const pMeta = lastMetaOf(t, partner);
  const myMeta = lastMetaOf(t, seat);
  const rho = t.metas[t.metas.length - 1];
  const rhoPassed = !rho || rho.call === 'P';
  const legal = (c: Call): boolean => isLegal(a, c);
  const pass = (why: string): Verdict => ({ call: 'P', why });
  if (a.calls.length > 32) return pass('The auction has gone on long enough');

  // --- key-card ask and answer
  if (pMeta?.tag === 'bw' && rhoPassed) {
    const trump = agreedSuit(t, seat) ?? 3;
    let step: number;
    let why: string;
    if (sys.card.conv.rkcb) {
      const kc = keyCards(hand, trump);
      step = kc === 1 || kc === 4 ? 0 : kc === 0 || kc === 3 ? 1 : trumpQueen(hand, trump) ? 3 : 2;
      why = ['1 or 4 key cards', '0 or 3 key cards', '2 key cards without the trump queen', '2 key cards with the trump queen'][step];
    } else {
      const n = aces(hand);
      step = n === 4 ? 0 : n;
      why = ['0 or 4 aces', '1 ace', '2 aces', '3 aces'][step];
    }
    return { call: makeBid(5, step), why: 'Answer to the ask: ' + why, tag: 'bwr' };
  }
  if (myMeta?.tag === 'bw' && pMeta?.tag === 'bwr' && rhoPassed) {
    const trump = agreedSuit(t, seat) ?? 3;
    const step = strainOf(pMeta.call);
    let total: number;
    if (sys.card.conv.rkcb) {
      const mine = keyCards(hand, trump);
      const low = [1, 0, 2, 2][step];
      const high = [4, 3, 2, 2][step];
      total = mine + (mine + low <= 2 && mine + high <= 5 ? high : low);
    } else {
      const mine = aces(hand);
      total = mine + (step === 0 ? (mine === 0 ? 4 : 0) : step) + 1; // aces only: treat the trump king as held
    }
    const slam = makeBid(6, trump);
    const stop = makeBid(5, trump);
    if (total >= 4 && legal(slam)) return { call: slam, why: 'Enough key cards: bids the slam' };
    if (legal(stop)) return { call: stop, why: 'Two key cards are missing: stops at the five level' };
    if (pMeta.call === stop) return pass('Two key cards are missing: stops at the five level');
    return legal(slam) ? { call: slam, why: 'No room to stop below slam' } : pass('Nothing more to do');
  }

  // --- the general picture: fit and combined strength
  const oppMin = info[(seat + 1) % 4].hcp[0] + info[(seat + 3) % 4].hcp[0];
  const pMin = P.hcp[0];
  const pMax = Math.max(pMin, Math.min(P.hcp[1], 40 - ev.hcp - oppMin, pMin + 9));
  // a six-card suit of one's own is treated as playable opposite the two cards partner usually has
  const total = [0, 1, 2, 3].map((s) => ev.len[s] + Math.max(P.lenMin[s], ev.len[s] >= 6 && P.lenMax[s] >= 2 ? 2 : 0));
  let trump: number | null = null;
  for (const s of [3, 2]) if (total[s] >= 8 && (trump === null || total[s] > total[trump])) trump = s;
  if (trump === null) for (const s of [1, 0]) if (total[s] >= 8 && (trump === null || total[s] > total[trump])) trump = s;
  const mine = trump !== null ? (ev.len[trump] >= 3 ? Math.max(ev.sup, ev.pts) : ev.pts) : ev.hcp;
  const lo = mine + pMin;
  const hi = mine + pMax;
  const mid = (lo + hi) / 2;

  const lb = lastBid(a);
  if (!lb) return pass('Nothing to bid');
  const oursLast = sideOf(lb.seat) === sideOf(seat);
  let current: Call | null = null; // our side's latest bid
  for (let i = t.metas.length - 1; i >= 0; i--) {
    if (sideOf(t.metas[i].seat) === sideOf(seat) && isBid(t.metas[i].call)) {
      current = t.metas[i].call;
      break;
    }
  }
  const gf = t.metas.some((m) => sideOf(m.seat) === sideOf(seat) && m.force === 2);
  const forced = rhoPassed && !!pMeta && pMeta.force >= 1 && pMeta.call !== 'P';
  const trumpName = trump !== null ? SUIT_NAME[trump] : '';

  const gameCall = (): Call => {
    if (trump !== null && trump >= 2) return makeBid(4, trump);
    if (trump !== null && lo >= 29 && !stoppedAll()) return makeBid(5, trump);
    return '3N';
  };
  const stoppedAll = (): boolean => [0, 1, 2, 3].every((s) => stopper(hand, s) || P.lenMin[s] >= 4);
  const cheapest = (strain: number): Call | null => {
    const lv = cheapestLevel(a, strain);
    return lv <= 7 ? makeBid(lv, strain) : null;
  };
  /** Something sensible to bid when partner's call may not be passed. */
  const mustBid = (): Verdict => {
    const tries: [Call | null, string, number?][] = [];
    if (trump !== null) tries.push([cheapest(trump), `Shows the ${trumpName} fit`]);
    let pBest = -1;
    for (let s = 0; s < 4; s++) if (P.lenMin[s] >= 5 && ev.len[s] >= 2 && (pBest < 0 || P.lenMin[s] > P.lenMin[pBest])) pBest = s;
    if (pBest >= 0) tries.push([cheapest(pBest), `Preference for partner's ${SUIT_NAME[pBest]}`]);
    for (let s = 3; s >= 0; s--) if (ev.len[s] >= 6) tries.push([cheapest(s), `Rebids the long ${SUIT_NAME[s]}`, s]);
    for (let s = 3; s >= 0; s--) {
      const c = cheapest(s);
      if (ev.len[s] >= 4 && c && levelOf(c) <= 2 && !ownBid(s)) tries.push([c, `Shows ${SUIT_NAME[s]}`, s]);
    }
    const nt = cheapest(4);
    if (nt && (levelOf(nt) <= 2 || (gf && levelOf(nt) === 3))) tries.push([nt, 'No fit and nothing new to show']);
    for (let s = 3; s >= 0; s--) if (ev.len[s] === Math.max(...ev.len)) tries.push([cheapest(s), `Longest suit: ${SUIT_NAME[s]}`, s]);
    tries.push([nt, 'Nothing better']);
    for (const [c, why, show] of tries) {
      if (c && legal(c) && levelOf(c) <= 5) return { call: c, why, showSuit: show };
    }
    return pass('No sensible bid available');
  };
  const ownBid = (s: number): boolean => t.metas.some((m) => sideOf(m.seat) === sideOf(seat) && isBid(m.call) && strainOf(m.call) === s);

  // --- they hold the bidding
  if (!oursLast) {
    if (pMeta && pMeta.call === 'X' && rhoPassed && !pMeta.matches.length) return pass("Leaves partner's double in");
    if (gf || lo >= 25) {
      const g = gameCall();
      if (legal(g) && (g !== '3N' || lb.call[1] === 'N' || stopper(hand, strainOf(lb.call)) || P.lenMin[strainOf(lb.call)] >= 4)) {
        return { call: g, why: 'Enough combined strength for game' };
      }
      if (trump !== null && trump >= 2 && legal(makeBid(4, trump))) return { call: makeBid(4, trump), why: 'Enough combined strength for game' };
      if (legal('X') && levelOf(lb.call) >= 3 && lo >= 25) return { call: 'X', why: 'Penalty: our side holds most of the points' };
      return pass('No safe game to bid over their call');
    }
    if (trump !== null) {
      const c = cheapest(trump);
      if (c && legal(c)) {
        const lv = levelOf(c);
        if (lv <= total[trump] - 6 && lv <= 3 && mid >= 14 + lv * 2 && (!current || strainOf(current) !== trump || levelOf(current) < lv)) {
          return { call: c, why: `Competes: a ${total[trump]}-card ${trumpName} fit` };
        }
      }
    }
    if (forced) return mustBid();
    return pass('Not enough to bid over their call');
  }

  // --- we hold the bidding
  if (!current) return pass('Nothing to bid');
  const atGame = isGame(current);
  if (lo >= 33 && levelOf(current) < 6) {
    if (trump !== null && legal('4N') && levelOf(current) <= 4) {
      return { call: '4N', why: 'Slam values: asks for ' + (sys.card.conv.rkcb ? 'key cards' : 'aces'), tag: 'bw', force: 1 };
    }
    const slam = makeBid(6, trump ?? 4);
    if (legal(slam)) return { call: slam, why: 'Enough combined strength for slam' };
  }
  if (atGame) {
    if (trump !== null && trump >= 2 && current === '3N' && legal(makeBid(4, trump)) && strainOf(current) !== trump) {
      return { call: makeBid(4, trump), why: `Prefers the ${total[trump]}-card ${trumpName} fit to no-trumps` };
    }
    return pass('Game has been reached');
  }
  if (gf || lo >= 25 || (lo >= 24 && trump !== null && trump >= 2 && total[trump] >= 9)) {
    if (gf && trump === null && levelOf(current) < 3) {
      for (const s of [3, 2]) {
        const c = cheapest(s);
        if (ev.len[s] >= 5 && info[seat].lenMin[s] < 5 && c && legal(c) && levelOf(c) <= 3 && !ownBid(s)) {
          return { call: c, why: `Shows five ${SUIT_NAME[s]} on the way to game`, force: 1, showSuit: s };
        }
      }
    }
    const g = gameCall();
    if (legal(g)) return { call: g, why: trump !== null ? `Game in the ${trumpName} fit` : 'Enough combined strength for game' };
    if (trump !== null && legal(makeBid(4, trump))) return { call: makeBid(4, trump), why: `Game in the ${trumpName} fit` };
    return forced ? mustBid() : pass('No game left to bid');
  }
  if (pMeta?.tag === 'inv' && rhoPassed) {
    const shown = info[seat].hcp;
    if (ev.hcp * 2 > shown[0] + Math.min(shown[1], shown[0] + 6)) {
      const g = gameCall();
      if (legal(g)) return { call: g, why: 'Accepts the invitation' };
    }
    return pass('Declines the invitation');
  }
  if (hi >= 25 && !(myMeta?.tag === 'inv')) {
    if (mid >= 25) {
      const g = gameCall();
      if (legal(g)) return { call: g, why: 'Likely enough for game' };
    } else if (mid >= 23.5) {
      const inv = trump !== null ? makeBid(3, trump) : '2N';
      if (legal(inv) && current !== inv) return { call: inv, why: 'Invites game', tag: 'inv' };
    }
  }
  if (forced) return mustBid();
  if (trump !== null && strainOf(current) !== trump) {
    const c = cheapest(trump);
    if (c && legal(c) && levelOf(c) <= (total[trump] >= 9 ? 3 : 2)) return { call: c, why: `Corrects to the ${trumpName} fit` };
  }
  return pass('Content with the contract');
}

/** The call a bot makes, with its meaning. */
export function botCall(t: Table, seat: Seat): CallMeta {
  const sys = t.systems[sideOf(seat)];
  const hit = sys.find(t.auction, seat, t.deal[seat]);
  if (hit) {
    const ex = sys.explain(t.auction, seat, hit.call);
    return { call: hit.call, seat, src: 'rule', matches: ex.matches, text: fillText(hit.rule.text, hit.bind), shows: ex.shows, force: ex.force };
  }
  const v = judge(t, seat);
  const meta: CallMeta = { call: v.call, seat, src: 'judgment', matches: [], text: v.why, shows: null, force: v.force ?? 0, tag: v.tag };
  if (v.showSuit !== undefined) {
    meta.shows = noShows();
    meta.shows.lenMin[v.showSuit] = 4;
  }
  return meta;
}

/** Records a call at the table. */
export function play(t: Table, meta: CallMeta): void {
  t.auction.calls.push(meta.call);
  t.metas.push(meta);
}

/** The player's call: looked up on the card, and compared with what the card prescribed. */
export function humanCall(t: Table, seat: Seat, call: Call): CallMeta {
  const meta = describeCall(t, seat, call);
  const hit = t.systems[sideOf(seat)].find(t.auction, seat, t.deal[seat]);
  meta.cardCall = hit ? hit.call : null;
  meta.cardText = hit ? fillText(hit.rule.text, hit.bind) : '';
  return meta;
}

/** Lets the bots bid until it is the given seat's turn (or the auction ends). Pass null to bid the whole deal. */
export function runBots(t: Table, human: Seat | null): void {
  while (!isOver(t.auction) && toAct(t.auction) !== human) play(t, botCall(t, toAct(t.auction)));
}

export { callText, seatOf };
