import { beforeAll, describe, expect, it } from 'vitest';
import { appendFileSync } from 'node:fs';
import { contractOf } from '../src/engine/auction';
import { Seat, dealCards, makeRng, parseDeal } from '../src/engine/cards';
import { newTable, runBots } from '../src/engine/bidder';
import { System } from '../src/engine/rules';
import { bestContract, initSolver, resultFor, solveDeal } from '../src/engine/solver';
import { baseRules, defaultCard } from '../src/engine/system21';

beforeAll(async () => {
  await initSolver();
});

describe('double-dummy solver', () => {
  it('solves a known deal', () => {
    const d = parseDeal('K83.A72.KQ952.94', '96.J964.T74.AQ63', 'AQ754.K3.AJ6.T82', 'JT2.QT85.83.KJ75');
    const t0 = Date.now();
    const tt = solveDeal(d);
    const ms = Date.now() - t0;
    expect(tt[3][2]).toBe(11); // spades by South
    expect(tt[4][0]).toBe(9); // no-trumps by North
    expect(tt[1][0]).toBe(11); // diamonds by North
    const best = bestContract(tt, 0, false)!;
    expect(best.score).toBe(450);
    appendFileSync('tests/out.txt', `\nsolve one deal: ${ms} ms`);
  });

  it('bot contracts hold up against the solver', () => {
    const rand = makeRng(77);
    const sys: [System, System] = [new System(defaultCard(), baseRules()), new System(defaultCard(), baseRules())];
    let made = 0, n = 0, lostToBest = 0, missedGame = 0, gameAvail = 0, t0 = Date.now();
    const bad: string[] = [];
    for (let i = 0; i < 300; i++) {
      const deal = dealCards(rand);
      const t = newTable(deal, (i % 4) as Seat, sys);
      runBots(t, null);
      const c = contractOf(t.auction);
      if (!c) continue;
      const tt = solveDeal(deal);
      const r = resultFor(tt, c, false, false);
      n++;
      if (r.tricks >= c.level + 6) made++;
      const side = (c.declarer % 2) as 0 | 1;
      const best = bestContract(tt, side, false);
      const ours = side === 0 ? r.scoreNS : -r.scoreNS;
      if (best) {
        lostToBest += best.score - ours;
        if (best.score >= 400) { gameAvail++; if (ours < 300) missedGame++; }
      }
      if (ours <= -200 && bad.length < 25) bad.push(`${t.auction.calls.join(' ')}  -> ${ours}   ${deal.map((h) => h.map((s) => s.length).reverse().join('')).join(' ')}`);
    }
    const stats = { n, madeShare: (made / n).toFixed(2), avgLostToBest: Math.round(lostToBest / n), gameAvail, missedGame, msPerDeal: Math.round((Date.now() - t0) / 300) };
    appendFileSync('tests/out.txt', '\n' + JSON.stringify(stats) + '\n' + bad.join('\n'));
    expect(made / n).toBeGreaterThan(0.5);
  }, 600000);
});
