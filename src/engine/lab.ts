// The Lab: bid the same deals with two versions of a card and compare the results.
import { Contract, contractOf, isOver, toAct } from './auction';
import { Table, botCall, newTable, play, runBots } from './bidder';
import { Deal, Seat, evaluate, sideOf } from './cards';
import { System } from './rules';

export const SITUATIONS: [string, string][] = [
  ['any', 'Any deal'],
  ['iopen', 'I open'],
  ['popen', 'Partner opens'],
  ['major', 'We open 1♥ or 1♠'],
  ['nt', 'We open 1NT'],
  ['they', 'They open'],
  ['game', 'We have game values'],
  ['slam', 'We have slam values'],
];

/** Is this deal of the kind asked for? (North-South are "we"; South is "I".) Passed-out deals never fit. */
export function dealFits(deal: Deal, dealer: Seat, situation: string, systems: [System, System]): boolean {
  const probe = newTable(deal, dealer, systems);
  while (!isOver(probe.auction) && probe.auction.calls.every((c) => c === 'P')) play(probe, botCall(probe, toAct(probe.auction)));
  const first = probe.metas[probe.metas.length - 1];
  if (!first || first.call === 'P') return false;
  const ns = evaluate(deal[0]).hcp + evaluate(deal[2]).hcp;
  const ours = sideOf(first.seat) === 0;
  switch (situation) {
    case 'iopen': return first.seat === 2;
    case 'popen': return first.seat === 0;
    case 'major': return ours && (first.call === '1H' || first.call === '1S');
    case 'nt': return ours && first.call === '1N';
    case 'they': return !ours && ns >= 16;
    case 'game': return ns >= 25;
    case 'slam': return ns >= 31;
    default: return true;
  }
}

/** Bids a whole deal with bots in all four seats. */
export function bidDeal(deal: Deal, dealer: Seat, systems: [System, System]): Table {
  const t = newTable(deal, dealer, systems);
  runBots(t, null);
  return t;
}

export function sameContract(a: Contract | null, b: Contract | null): boolean {
  if (!a || !b) return a === b;
  return a.level === b.level && a.strain === b.strain && a.dbl === b.dbl && a.declarer === b.declarer;
}
export const finalContract = (t: Table): Contract | null => contractOf(t.auction);

const IMP_STEPS = [20, 50, 90, 130, 170, 220, 270, 320, 370, 430, 500, 600, 750, 900, 1100, 1300, 1500, 1750, 2000, 2250, 2500, 3000, 3500, 4000];
/** International match points for a score difference. */
export function imps(diff: number): number {
  const d = Math.abs(diff);
  let i = 0;
  while (i < IMP_STEPS.length && d >= IMP_STEPS[i]) i++;
  return diff < 0 ? -i : i;
}

/** One deal on which the two versions reached different contracts. Scores are North-South's. */
export interface Diff {
  seed: number;
  dealer: Seat;
  vulNS: boolean;
  vulEW: boolean;
  callsA: string[];
  callsB: string[];
  contractA: Contract | null;
  contractB: Contract | null;
  scoreA: number;
  scoreB: number;
}

export interface Summary {
  bid: number;
  n: number;
  wins: number;
  ties: number;
  losses: number;
  /** version B's share of the matchpoints on the deals that differed, 0–100 */
  pct: number;
  pctMargin: number;
  /** version B's average gain in IMPs on the deals that differed */
  imp: number;
  impMargin: number;
  /** which version the evidence favours: 'B', 'A', or 'open' when it is not settled */
  verdict: 'A' | 'B' | 'open';
  /** 0–5: how firmly the result is established */
  sure: number;
}

export function summarise(diffs: Diff[], bid: number, scoring: 'mp' | 'imp'): Summary {
  const n = diffs.length;
  let wins = 0, ties = 0, losses = 0, impSum = 0, impSq = 0, mpSum = 0, mpSq = 0;
  for (const d of diffs) {
    const x = d.scoreB > d.scoreA ? 1 : d.scoreB < d.scoreA ? 0 : 0.5;
    if (x === 1) wins++;
    else if (x === 0) losses++;
    else ties++;
    mpSum += x;
    mpSq += x * x;
    const i = imps(d.scoreB - d.scoreA);
    impSum += i;
    impSq += i * i;
  }
  const mean = (sum: number): number => (n ? sum / n : 0);
  const margin = (sum: number, sq: number): number => (n > 1 ? 1.96 * Math.sqrt(Math.max(0, sq / n - (sum / n) ** 2) / (n - 1)) : Infinity);
  const pct = n ? mean(mpSum) * 100 : 50;
  const pctMargin = margin(mpSum, mpSq) * 100;
  const imp = mean(impSum);
  const impMargin = margin(impSum, impSq);
  const edge = scoring === 'mp' ? pct - 50 : imp;
  const m = scoring === 'mp' ? pctMargin : impMargin;
  const settled = n >= 30 && Math.abs(edge) > m;
  const ratio = n >= 30 && m > 0 && isFinite(m) ? Math.abs(edge) / m : 0;
  return {
    bid, n, wins, ties, losses, pct, pctMargin, imp, impMargin,
    verdict: settled ? (edge > 0 ? 'B' : 'A') : 'open',
    sure: Math.max(0, Math.min(5, Math.round(ratio * 2.5))),
  };
}
