// A small pool of solver workers, so the Lab can solve several deals at once.
import { Deal } from '../engine/cards';
import type { TrickTable } from '../engine/result';

interface Job {
  deal: Deal;
  resolve: (tt: TrickTable) => void;
  reject: (e: Error) => void;
}
interface Slot {
  worker: Worker;
  job: Job | null;
}

const slots: Slot[] = [];
const queue: Job[] = [];

function pump(): void {
  for (const slot of slots) {
    if (slot.job || !queue.length) continue;
    slot.job = queue.shift()!;
    slot.worker.postMessage({ id: 1, deal: slot.job.deal });
  }
}
function ensure(): void {
  if (slots.length) return;
  const n = Math.max(1, Math.min(4, (navigator.hardwareConcurrency || 2) - 1));
  for (let i = 0; i < n; i++) {
    const worker = new Worker(new URL('../solver.worker.ts', import.meta.url), { type: 'module' });
    const slot: Slot = { worker, job: null };
    worker.onmessage = (e: MessageEvent) => {
      const job = slot.job;
      slot.job = null;
      if (job) {
        if (e.data.error) job.reject(new Error(e.data.error));
        else job.resolve(e.data.tt);
      }
      pump();
    };
    worker.onerror = () => {
      const job = slot.job;
      slot.job = null;
      if (job) job.reject(new Error('The solver stopped.'));
      pump();
    };
    slots.push(slot);
  }
}

export function solveAsync(deal: Deal): Promise<TrickTable> {
  ensure();
  return new Promise((resolve, reject) => {
    queue.push({ deal, resolve, reject });
    pump();
  });
}
/** Drops every deal still waiting (used when a Lab run is stopped). */
export function clearQueue(): void {
  for (const job of queue.splice(0)) job.reject(new Error('stopped'));
}
