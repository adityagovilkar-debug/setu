// Everything Setu remembers lives in this browser only (localStorage). Nothing is sent anywhere.
import { SystemCard, System } from '../engine/rules';
import { baseRules, CONVENTIONS, defaultCard } from '../engine/system21';

export interface BoardLog {
  board: number;
  date: string;
  contract: string;
  scoreNS: number;
  bestNS: number;
  calls: number;
  followed: number;
  silent: number;
  hinted: boolean;
}
export interface Version {
  name: string;
  date: string;
  card: SystemCard;
}
interface Saved {
  card: SystemCard;
  versions: Version[];
  four: boolean;
  theme: 'light' | 'dark' | null;
  board: number;
  situation: string;
  log: BoardLog[];
}

const KEY = 'setu.v1';
function load(): Saved {
  const fresh: Saved = { card: defaultCard('My 2/1 card'), versions: [], four: false, theme: null, board: 1, situation: 'any', log: [] };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return fresh;
    const s = { ...fresh, ...JSON.parse(raw) } as Saved;
    for (const c of CONVENTIONS) if (typeof s.card.conv[c.id] !== 'boolean') s.card.conv[c.id] = c.on;
    if (!Array.isArray(s.card.own)) s.card.own = [];
    return s;
  } catch {
    return fresh;
  }
}

export const data: Saved = load();
export function save(): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // storage unavailable (private window): the app still works for this visit
  }
}

let mine: System | null = null;
let field: System | null = null;
/** The player's card (used by her and her bot partner). */
export function mySystem(): System {
  if (!mine) mine = new System(data.card, baseRules());
  return mine;
}
/** The opponents always play the stock 2/1 card. */
export function fieldSystem(): System {
  if (!field) field = new System(defaultCard(), baseRules());
  return field;
}
export function cardChanged(): void {
  mine = null;
  save();
}
