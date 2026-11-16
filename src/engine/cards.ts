// Cards, hands, deals and hand evaluation.

export type Seat = 0 | 1 | 2 | 3; // North, East, South, West
export const SEAT_NAMES = ['North', 'East', 'South', 'West'];
export const SEAT_LETTER = 'NESW';
export const SUIT_LETTER = 'CDHS'; // suit index 0..3, low to high
export const STRAIN_LETTER = 'CDHSN';
export const SUIT_SYMBOL = ['♣', '♦', '♥', '♠'];
export const SUIT_NAME = ['clubs', 'diamonds', 'hearts', 'spades'];
export const RANK_CHARS = '23456789TJQKA';

/** A hand: for each suit (0 = clubs .. 3 = spades) the ranks held, high to low (12 = ace). */
export type Hand = number[][];
export type Deal = [Hand, Hand, Hand, Hand];

export const partnerOf = (s: Seat): Seat => ((s + 2) % 4) as Seat;
export const sideOf = (s: number): 0 | 1 => (s % 2) as 0 | 1; // 0 = North-South, 1 = East-West

/** Small seeded random number generator (mulberry32), so deals can be reproduced. */
export function makeRng(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function dealCards(rand: () => number): Deal {
  const deck = Array.from({ length: 52 }, (_, i) => i);
  for (let i = 51; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = deck[i];
    deck[i] = deck[j];
    deck[j] = tmp;
  }
  const hands: Hand[] = [];
  for (let s = 0; s < 4; s++) {
    const h: Hand = [[], [], [], []];
    for (const c of deck.slice(s * 13, s * 13 + 13)) h[Math.floor(c / 13)].push(c % 13);
    for (const suit of h) suit.sort((a, b) => b - a);
    hands.push(h);
  }
  return hands as Deal;
}

/** "AQ754.K3.AJ6.T82" — spades, hearts, diamonds, clubs. */
export function handToPbn(h: Hand): string {
  return [3, 2, 1, 0].map((s) => h[s].map((r) => RANK_CHARS[r]).join('')).join('.');
}
export function parseHand(text: string): Hand {
  const parts = text.trim().split('.');
  const h: Hand = [[], [], [], []];
  [3, 2, 1, 0].forEach((s, i) => {
    h[s] = (parts[i] || '')
      .split('')
      .map((ch) => RANK_CHARS.indexOf(ch.toUpperCase()))
      .filter((r) => r >= 0)
      .sort((a, b) => b - a);
  });
  return h;
}
export function dealToPbn(d: Deal): string {
  return 'N:' + d.map(handToPbn).join(' ');
}
export function parseDeal(n: string, e: string, s: string, w: string): Deal {
  return [parseHand(n), parseHand(e), parseHand(s), parseHand(w)];
}

export interface Eval {
  hcp: number;
  len: number[];
  bal: boolean;
  semibal: boolean;
  /** high-card points plus one for every card over four in a suit */
  pts: number;
  /** high-card points plus shortness (void 3, singleton 2, doubleton 1): for raising partner */
  sup: number;
}
const HCP = [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4];
const cache = new WeakMap<Hand, Eval>();

export function evaluate(h: Hand): Eval {
  const hit = cache.get(h);
  if (hit) return hit;
  let hcp = 0;
  let lenPts = 0;
  let shortPts = 0;
  const len = h.map((s) => s.length);
  for (const suit of h) {
    for (const r of suit) hcp += HCP[r];
    if (suit.length > 4) lenPts += suit.length - 4;
    if (suit.length < 3) shortPts += 3 - suit.length;
  }
  const shape = [...len].sort((a, b) => b - a).join('');
  const bal = shape === '4333' || shape === '4432' || shape === '5332';
  const semibal = bal || shape === '5422' || shape === '6322';
  const ev = { hcp, len, bal, semibal, pts: hcp + lenPts, sup: hcp + shortPts };
  cache.set(h, ev);
  return ev;
}

export function stopper(h: Hand, s: number): boolean {
  const r = h[s];
  if (!r.length) return false;
  if (r[0] === 12) return true;
  if (r.includes(11) && r.length >= 2) return true;
  if (r.includes(10) && r.length >= 3) return true;
  return r.includes(9) && r.length >= 4;
}
/** Two of the top three honours, or three of the top five. */
export function goodSuit(h: Hand, s: number): boolean {
  const top3 = h[s].filter((r) => r >= 10).length;
  const top5 = h[s].filter((r) => r >= 8).length;
  return top3 >= 2 || top5 >= 3;
}
export const aces = (h: Hand): number => h.filter((s) => s[0] === 12).length;
export const keyCards = (h: Hand, trump: number): number => aces(h) + (h[trump].includes(11) ? 1 : 0);
export const trumpQueen = (h: Hand, trump: number): boolean => h[trump].includes(10);
