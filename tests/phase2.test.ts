import { describe, expect, it } from 'vitest';
import { Critic } from '../src/engine/critic';
import { imps, summarise, Diff } from '../src/engine/lab';
import { defaultCard } from '../src/engine/system21';

describe('critic', () => {
  it('finds where the stock card is silent', () => {
    const c = new Critic(defaultCard(), 500);
    c.step(4000);
    const r = c.report();
    expect(r.deals).toBe(4000);
    expect(r.silent).toBeGreaterThan(0);
    expect(r.silent / r.calls).toBeLessThan(0.2);
    // opponents overcalling our 1NT is a known hole in the base card
    expect(r.spots.some((s) => s.tokens[0] === '1N' && s.contested)).toBe(true);
    expect(r.conv.stayman).toBeGreaterThan(20);
    expect(r.conv.transfers).toBeGreaterThan(20);
  });

  it('reports use, replacement and clashes of own rule cards', () => {
    const card = defaultCard();
    card.own.push({ id: 'a', after: '1H', call: '3N', conds: 'hcp 13-15, bal, H3', text: 'x', force: 0 });
    card.own.push({ id: 'b', after: '1H', call: '2N', conds: 'hcp 13-14, bal', text: 'y', force: 0 });
    card.own.push({ id: 'c', after: '7N', call: 'P', conds: '', text: 'never', force: 0 });
    card.own.push({ id: 'd', after: '1Q', call: 'P', conds: '', text: 'bad', force: 0 });
    const c = new Critic(card, 900);
    c.step(6000);
    const r = c.report();
    const a = r.own.find((o) => o.id === 'a')!;
    expect(a.fired).toBeGreaterThan(0);
    expect(Object.keys(a.replaced).length).toBeGreaterThan(0);
    expect(a.clashes).toBeGreaterThan(0);
    expect(a.clashWith).toBe('b');
    expect(r.own.find((o) => o.id === 'c')!.fired).toBe(0);
    expect(r.unreadable.length).toBe(1);
  });
});

describe('lab', () => {
  it('converts score differences to IMPs', () => {
    expect(imps(0)).toBe(0);
    expect(imps(10)).toBe(0);
    expect(imps(30)).toBe(1);
    expect(imps(420 - 170)).toBe(6);
    expect(imps(-620)).toBe(-12);
    expect(imps(5000)).toBe(24);
  });
  it('gives a verdict only when the evidence supports one', () => {
    const mk = (a: number, b: number): Diff => ({ seed: 0, dealer: 0, vulNS: false, vulEW: false, callsA: [], callsB: [], contractA: null, contractB: null, scoreA: a, scoreB: b });
    const clear = Array.from({ length: 200 }, (_, i) => (i % 4 === 0 ? mk(420, 170) : mk(170, 420)));
    const s1 = summarise(clear, 5000, 'mp');
    expect(s1.verdict).toBe('B');
    expect(s1.pct).toBe(75);
    const even = Array.from({ length: 200 }, (_, i) => (i % 2 === 0 ? mk(420, 170) : mk(170, 420)));
    expect(summarise(even, 5000, 'mp').verdict).toBe('open');
    expect(summarise(clear.slice(0, 10), 5000, 'mp').verdict).toBe('open');
    expect(summarise(clear, 5000, 'imp').verdict).toBe('B');
  });
});
