import { describe, expect, it } from 'vitest';
import { writeFileSync } from 'node:fs';
import { contractOf, isLegal, isOver, scoreContract, boardSetup } from '../src/engine/auction';
import { Deal, Seat, dealCards, evaluate, makeRng, parseDeal, handToPbn } from '../src/engine/cards';
import { Table, botCall, humanCall, newTable, play, runBots } from '../src/engine/bidder';
import { System } from '../src/engine/rules';
import { baseRules, defaultCard } from '../src/engine/system21';

const std = () => new System(defaultCard(), baseRules());
const systems = (): [System, System] => [std(), std()];

function bidOut(deal: Deal, dealer: Seat, sys = systems()): Table {
  const t = newTable(deal, dealer, sys);
  runBots(t, null);
  return t;
}
const seq = (t: Table) => t.auction.calls.join(' ');

describe('scoring', () => {
  it('scores common contracts', () => {
    expect(scoreContract(4, 3, 0, false, 10)).toBe(420);
    expect(scoreContract(4, 3, 0, false, 11)).toBe(450);
    expect(scoreContract(3, 4, 0, true, 9)).toBe(600);
    expect(scoreContract(6, 2, 0, false, 12)).toBe(980);
    expect(scoreContract(2, 2, 0, false, 9)).toBe(140);
    expect(scoreContract(4, 3, 1, true, 8)).toBe(-500);
    expect(scoreContract(2, 3, 1, false, 8)).toBe(470);
    expect(scoreContract(1, 4, 0, false, 7)).toBe(90);
    expect(scoreContract(5, 0, 0, false, 11)).toBe(400);
  });
  it('knows board 7', () => {
    expect(boardSetup(7)).toEqual({ dealer: 2, vulNS: true, vulEW: true });
  });
});

describe('2/1 auctions', () => {
  it('bids a two-over-one game force', () => {
    const d = parseDeal('K83.AJ2.KQ952.94', '96.9764.T74.AQ63', 'AQ754.K3.AJ6.T82', 'JT2.QT85.83.KJ75');
    const t = bidOut(d, 2);
    expect(seq(t)).toBe('1S P 2D P 2N P 4S P P P');
    const c = contractOf(t.auction)!;
    expect(c.declarer).toBe(2);
    expect(t.metas[2].force).toBe(2);
  });
  it('uses Stayman and finds the 4-4 fit', () => {
    const d = parseDeal('KQ52.A84.KJ3.Q92', '94.T73.9862.KT84', 'AJ73.K962.Q5.J75', 'T86.QJ5.AT74.A63');
    expect(seq(bidOut(d, 0))).toBe('1N P 2C P 2S P 4S P P P');
  });
  it('transfers with a weak hand', () => {
    const d = parseDeal('KQ5.A84.KJ3.Q942', 'A94.T7.9862.KT85', '73.J96532.Q5.J73', 'JT862.KQ.AT74.A6');
    const t = bidOut(d, 0);
    expect(seq(t).startsWith('1N P 2D')).toBe(true);
  });
  it('switching a convention off changes the bidding', () => {
    const card = defaultCard();
    card.conv.stayman = false;
    const d = parseDeal('KQ52.A84.KJ3.Q92', '94.T73.9862.KT84', 'AJ73.K962.Q5.J75', 'T86.QJ5.AT74.A63');
    const t = bidOut(d, 0, [new System(card, baseRules()), std()]);
    expect(seq(t)).toBe('1N P 3N P P P');
  });
  it('an own rule card takes priority', () => {
    const card = defaultCard();
    card.own.push({ id: 'o1', after: '1H', call: '3N', conds: 'hcp 13-15, bal, H3', text: 'Balanced 13–15 with three hearts', force: 0 });
    const d = parseDeal('A5.KQJ84.Q83.J92', '94.T7.9762.KT854', 'KJ7.962.KJ5.AQ73', 'QT8632.A53.AT4.6');
    const t = bidOut(d, 0, [new System(card, baseRules()), std()]);
    expect(seq(t).startsWith('1H P 3N')).toBe(true);
    expect(t.metas[2].text).toContain('three hearts');
  });
  it('compares the player\'s call with the card', () => {
    const d = parseDeal('K83.A72.KQ952.94', '96.J964.T74.AQ63', 'AQ754.K3.AJ6.T82', 'JT2.QT85.83.KJ75');
    const t = newTable(d, 2, systems());
    const m = humanCall(t, 2, '1N');
    expect(m.cardCall).toBe('1S');
    play(t, m);
    expect(t.metas[0].text).toContain('15–17');
  });
});

describe('mass bidding', () => {
  it('bids 3000 random deals legally to an end', () => {
    const rand = makeRng(20261116);
    const sys = systems();
    const levels: Record<string, number> = {};
    let passedOut = 0, judgment = 0, calls = 0, games25 = 0, n25 = 0, over = 0, long = 0;
    const samples: string[] = [];
    for (let i = 0; i < 3000; i++) {
      const deal = dealCards(rand);
      const t = newTable(deal, (i % 4) as Seat, sys);
      while (!isOver(t.auction)) {
        const seat = ((t.auction.dealer + t.auction.calls.length) % 4) as Seat;
        const m = botCall(t, seat);
        expect(isLegal(t.auction, m.call), `illegal ${m.call} after ${seq(t)}`).toBe(true);
        play(t, m);
        calls++;
        if (m.src === 'judgment' && m.call !== 'P') judgment++;
        expect(t.auction.calls.length).toBeLessThan(40);
      }
      if (t.auction.calls.length > 20) long++;
      const c = contractOf(t.auction);
      const hcp = deal.map((h) => evaluate(h).hcp);
      const ns = hcp[0] + hcp[2];
      if (!c) passedOut++;
      else {
        const key = c.level + 'NESW'[c.declarer % 2 === 0 ? 0 : 1];
        levels[c.level] = (levels[c.level] || 0) + 1;
        const side = c.declarer % 2;
        const sidePts = side === 0 ? ns : 40 - ns;
        const game = c.level + 6 >= [11, 11, 10, 10, 9][c.strain];
        if (sidePts >= 26) { n25++; if (game) games25++; }
        if (sidePts <= 17 && c.level >= 4) over++;
        void key;
      }
      if (i < 40) samples.push(`${deal.map(handToPbn).join(' | ')}  d=${'NESW'[i % 4]}  ::  ${seq(t)}`);
    }
    const stats = { passedOut, levels, judgmentShare: (judgment / calls).toFixed(3), gameWith26: (games25 / n25).toFixed(2), highOnWeak: over, long };
    writeFileSync('tests/out.txt', samples.join('\n') + '\n' + JSON.stringify(stats));
    expect(passedOut).toBeLessThan(450);
  });
});
