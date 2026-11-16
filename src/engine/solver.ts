// Double-dummy solver: the exact number of tricks each side can take in every contract, all four hands in view.
// Wraps the open-source DDS solver (compiled to WebAssembly by the bridge-dds package).
import { Dds, loadDds } from 'bridge-dds';
import { Deal, dealToPbn } from './cards';
import type { TrickTable } from './result';
export * from './result';

let dds: Dds | null = null;
export async function initSolver(): Promise<void> {
  if (!dds) dds = new Dds(await loadDds());
}

export function solveDeal(deal: Deal): TrickTable {
  if (!dds) throw new Error('Solver not loaded');
  // DDS orders strains spades, hearts, diamonds, clubs, no-trumps and seats North, East, South, West.
  const res = dds.CalcDDTablePBN({ cards: dealToPbn(deal) }).resTable;
  return [res[3], res[2], res[1], res[0], res[4]];
}

