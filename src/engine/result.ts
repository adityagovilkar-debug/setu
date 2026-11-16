// Reading a solved deal: best contract for a side, and the score of the contract actually reached.
import { Contract, scoreContract } from './auction';
import { Seat, sideOf } from './cards';

/** tricks[strain][seat]: strain 0 = clubs .. 3 = spades, 4 = no-trumps; seat 0 = North .. 3 = West. */
export type TrickTable = number[][];

export interface Best {
  level: number;
  strain: number;
  declarer: Seat;
  tricks: number;
  score: number;
}
/** The highest-scoring contract a side can make with best play all round (ignoring sacrifices). */
export function bestContract(tt: TrickTable, side: 0 | 1, vul: boolean): Best | null {
  let best: Best | null = null;
  for (let strain = 0; strain < 5; strain++) {
    for (const declarer of [side, side + 2] as Seat[]) {
      const tricks = tt[strain][declarer];
      const level = tricks - 6;
      if (level < 1) continue;
      const score = scoreContract(level, strain, 0, vul, tricks);
      if (!best || score > best.score) best = { level, strain, declarer, tricks, score };
    }
  }
  return best;
}

/** Score of the final contract with best play all round, from North-South's point of view. */
export function resultFor(tt: TrickTable, c: Contract | null, vulNS: boolean, vulEW: boolean): { tricks: number; scoreNS: number } {
  if (!c) return { tricks: 0, scoreNS: 0 };
  const tricks = tt[c.strain][c.declarer];
  const side = sideOf(c.declarer);
  const s = scoreContract(c.level, c.strain, c.dbl, side === 0 ? vulNS : vulEW, tricks);
  return { tricks, scoreNS: side === 0 ? s : -s };
}
