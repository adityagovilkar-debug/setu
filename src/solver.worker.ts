// Runs the double-dummy solver off the main thread so the screen never freezes.
import { initSolver, solveDeal } from './engine/solver';

self.onmessage = async (e: MessageEvent) => {
  const { id, deal } = e.data;
  try {
    await initSolver();
    (self as unknown as Worker).postMessage({ id, tt: solveDeal(deal) });
  } catch (err) {
    (self as unknown as Worker).postMessage({ id, error: String(err) });
  }
};
