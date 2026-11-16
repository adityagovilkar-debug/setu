// The auction: calls, legality, final contract, and duplicate scoring.
import { Seat, STRAIN_LETTER, sideOf } from './cards';

/** 'P', 'X', 'XX' or a bid such as '1C', '3N', '7S'. */
export type Call = string;

export interface Auction {
  dealer: Seat;
  calls: Call[];
}

export const isBid = (c: Call): boolean => c !== 'P' && c !== 'X' && c !== 'XX';
export const levelOf = (c: Call): number => Number(c[0]);
export const strainOf = (c: Call): number => STRAIN_LETTER.indexOf(c[1]);
export const bidRank = (c: Call): number => (levelOf(c) - 1) * 5 + strainOf(c);
export const makeBid = (level: number, strain: number): Call => `${level}${STRAIN_LETTER[strain]}`;

export const seatOf = (a: Auction, i: number): Seat => ((a.dealer + i) % 4) as Seat;
export const toAct = (a: Auction): Seat => seatOf(a, a.calls.length);

export function lastBid(a: Auction): { idx: number; call: Call; seat: Seat } | null {
  for (let i = a.calls.length - 1; i >= 0; i--) {
    if (isBid(a.calls[i])) return { idx: i, call: a.calls[i], seat: seatOf(a, i) };
  }
  return null;
}
/** The last call that was not a pass. */
function lastAction(a: Auction): { idx: number; call: Call; seat: Seat } | null {
  for (let i = a.calls.length - 1; i >= 0; i--) {
    if (a.calls[i] !== 'P') return { idx: i, call: a.calls[i], seat: seatOf(a, i) };
  }
  return null;
}

export function isLegal(a: Auction, call: Call): boolean {
  if (isOver(a)) return false;
  if (call === 'P') return true;
  const me = toAct(a);
  const act = lastAction(a);
  if (call === 'X') return !!act && isBid(act.call) && sideOf(act.seat) !== sideOf(me);
  if (call === 'XX') return !!act && act.call === 'X' && sideOf(act.seat) !== sideOf(me);
  const lb = lastBid(a);
  const lv = levelOf(call);
  if (!(lv >= 1 && lv <= 7) || strainOf(call) < 0) return false;
  return !lb || bidRank(call) > bidRank(lb.call);
}

/** The cheapest level at which this strain can legally be bid now (8 if none). */
export function cheapestLevel(a: Auction, strain: number): number {
  const lb = lastBid(a);
  if (!lb) return 1;
  const lv = levelOf(lb.call);
  return strain > strainOf(lb.call) ? lv : lv + 1;
}

export function isOver(a: Auction): boolean {
  const n = a.calls.length;
  if (n < 4) return false;
  if (a.calls.every((c) => c === 'P')) return true;
  return a.calls[n - 1] === 'P' && a.calls[n - 2] === 'P' && a.calls[n - 3] === 'P';
}

export interface Contract {
  level: number;
  strain: number;
  /** 0 undoubled, 1 doubled, 2 redoubled */
  dbl: 0 | 1 | 2;
  declarer: Seat;
}

/** The final contract, or null if the deal was passed out. */
export function contractOf(a: Auction): Contract | null {
  const lb = lastBid(a);
  if (!lb) return null;
  let dbl: 0 | 1 | 2 = 0;
  for (let i = lb.idx + 1; i < a.calls.length; i++) {
    if (a.calls[i] === 'X') dbl = 1;
    if (a.calls[i] === 'XX') dbl = 2;
  }
  const strain = strainOf(lb.call);
  const side = sideOf(lb.seat);
  let declarer = lb.seat;
  for (let i = 0; i <= lb.idx; i++) {
    const c = a.calls[i];
    if (isBid(c) && strainOf(c) === strain && sideOf(seatOf(a, i)) === side) {
      declarer = seatOf(a, i);
      break;
    }
  }
  return { level: levelOf(lb.call), strain, dbl, declarer };
}

/** Duplicate score for the declaring side. */
export function scoreContract(level: number, strain: number, dbl: 0 | 1 | 2, vul: boolean, tricks: number): number {
  const diff = tricks - (level + 6);
  if (diff < 0) {
    const down = -diff;
    if (!dbl) return -(vul ? 100 : 50) * down;
    let p = 0;
    for (let i = 1; i <= down; i++) p += vul ? (i === 1 ? 200 : 300) : i === 1 ? 100 : i <= 3 ? 200 : 300;
    return -(dbl === 2 ? 2 * p : p);
  }
  const per = strain <= 1 ? 20 : 30;
  let trick = per * level + (strain === 4 ? 10 : 0);
  trick *= dbl === 1 ? 2 : dbl === 2 ? 4 : 1;
  let s = trick + (trick >= 100 ? (vul ? 500 : 300) : 50);
  if (level === 6) s += vul ? 750 : 500;
  if (level === 7) s += vul ? 1500 : 1000;
  if (dbl) s += dbl === 1 ? 50 : 100;
  s += dbl ? (vul ? 200 : 100) * diff * (dbl === 2 ? 2 : 1) : per * diff;
  return s;
}

/** Dealer and vulnerability for a board number, as on a standard duplicate board. */
export function boardSetup(board: number): { dealer: Seat; vulNS: boolean; vulEW: boolean } {
  const n = (board - 1) % 16;
  const vul = ['-', 'NS', 'EW', 'B', 'NS', 'EW', 'B', '-', 'EW', 'B', '-', 'NS', 'B', '-', 'NS', 'EW'][n];
  return { dealer: (n % 4) as Seat, vulNS: vul === 'NS' || vul === 'B', vulEW: vul === 'EW' || vul === 'B' };
}
