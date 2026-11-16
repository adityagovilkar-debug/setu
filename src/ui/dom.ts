// Small helpers shared by the rooms.
import { Call } from '../engine/auction';
import { Hand, RANK_CHARS, SUIT_LETTER, SUIT_SYMBOL } from '../engine/cards';
import { Shows } from '../engine/rules';

export const $ = <T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = document): T => root.querySelector(sel) as T;
export const $$ = <T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = document): T[] => Array.from(root.querySelectorAll(sel)) as T[];

export const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const suitSpan = (s: number): string => `<span class="s${SUIT_LETTER[s]}">${SUIT_SYMBOL[s]}</span>`;

/** A call as HTML: 1♠, 3NT, Pass, Dbl. */
export function callHtml(c: Call): string {
  if (c === 'P') return 'Pass';
  if (c === 'X') return 'Dbl';
  if (c === 'XX') return 'Rdbl';
  return c[1] === 'N' ? c[0] + 'NT' : c[0] + suitSpan(SUIT_LETTER.indexOf(c[1]));
}
/** Colours any suit symbols in a piece of text (the text is escaped first). */
export function suitsHtml(text: string): string {
  return esc(text).replace(/[♣♦♥♠]/g, (m) => suitSpan(SUIT_SYMBOL.indexOf(m)));
}
export function cardHtml(suit: number, rank: number): string {
  const r = RANK_CHARS[rank] === 'T' ? '10' : RANK_CHARS[rank];
  return `<div class="card s${SUIT_LETTER[suit]}">${r}<span>${SUIT_SYMBOL[suit]}</span></div>`;
}
/** A hand as thirteen cards, spades first. */
export function handCards(h: Hand): string {
  let out = '';
  for (const s of [3, 2, 1, 0]) for (const r of h[s]) out += cardHtml(s, r);
  return out;
}
/** A hand as four lines of text, for the deal diagram. */
export function handLines(h: Hand): string {
  return [3, 2, 1, 0]
    .map((s) => `${suitSpan(s)} ${h[s].length ? h[s].map((r) => (RANK_CHARS[r] === 'T' ? '10' : RANK_CHARS[r])).join(' ') : '—'}`)
    .join('<br>');
}
/** What a player has shown so far, in a few words. */
export function showsHtml(sh: Shows): string {
  const parts: string[] = [];
  const [lo, hi] = sh.hcp;
  if (lo > 0 || hi < 30) parts.push(hi >= 30 ? `${lo}+ points` : lo === hi ? `${lo} points` : `${lo}–${hi} points`);
  for (const s of [3, 2, 1, 0]) {
    if (sh.lenMin[s] >= 3) parts.push(`${sh.lenMin[s]}+ ${suitSpan(s)}`);
    else if (sh.lenMax[s] <= 2) parts.push(`at most ${sh.lenMax[s]} ${suitSpan(s)}`);
  }
  return parts.length ? parts.join(' · ') : 'Nothing yet';
}

let toastTimer = 0;
export function toast(text: string): void {
  const e = $('#toast');
  e.textContent = text;
  e.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => e.classList.remove('on'), 3200);
}
