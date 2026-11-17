// The system notebook: convention switches, the player's own rule cards, saved versions, and the whole card to read.
import { SUIT_LETTER, SUIT_SYMBOL } from '../engine/cards';
import { OwnRule, Rule, ctxStartsWith, describeConds, ownToRule } from '../engine/rules';
import { CONVENTIONS, defaultCard } from '../engine/system21';
import { $, $$, esc, suitsHtml, toast } from './dom';
import { cardChanged, data, mySystem, save } from './store';
import { criticStale } from './criticView';
import { restartTable } from './table';

const VAR_WORDS: Record<string, string> = { M: '♥/♠', m: '♣/♦', oM: ' other major', om: ' other minor', X: ' suit', Y: ' suit', Z: ' new suit' };
export function tokenText(tok: string): string {
  const opp = tok.startsWith('(');
  const t = opp ? tok.slice(1, -1) : tok;
  let out: string;
  if (t === 'P') out = 'Pass';
  else if (t === 'X') out = 'Dbl';
  else if (t === 'XX') out = 'Rdbl';
  else if (t === '*') out = 'any';
  else {
    const sv = t.slice(1);
    const lit = SUIT_LETTER.indexOf(sv);
    out = t[0] + (sv === 'N' ? 'NT' : sv.length === 1 && lit >= 0 ? SUIT_SYMBOL[lit] : VAR_WORDS[sv] ?? sv);
  }
  return opp ? `(${out})` : out;
}
export const ctxText = (ctx: string[]): string => (ctx.length ? ctx.map(tokenText).join(' – ') : 'Opening the bidding');

/** Turns what she types ("1♥ - 2nt", "1S (2H)", "pass") into the card's notation. */
export function normaliseSeq(text: string): string {
  return text
    .replace(/♠/g, 'S').replace(/♥/g, 'H').replace(/♦/g, 'D').replace(/♣/g, 'C')
    .replace(/[–—\-,;]/g, ' ')
    .replace(/\(\s*/g, '(').replace(/\s*\)/g, ')')
    .split(/\s+/)
    .filter(Boolean)
    .map((raw) => {
      const opp = raw.startsWith('(');
      let t = (opp ? raw.slice(1, -1) : raw).toUpperCase();
      if (t === 'PASS') t = 'P';
      else if (t === 'DBL' || t === 'DOUBLE') t = 'X';
      else if (t === 'RDBL' || t === 'REDOUBLE') t = 'XX';
      else t = t.replace(/NT$/, 'N');
      return opp ? `(${t})` : t;
    })
    .join(' ');
}

function ruleRow(r: Rule): string {
  const needs = describeConds(r);
  const force = r.force === 2 ? ' <span class="tag t-system"><i></i>game force</span>' : r.force === 1 ? ' <span class="tag t-judg"><i></i>forcing</span>' : '';
  return `<div class="rrow"><b class="mono">${suitsHtml(tokenText(r.call))}</b><div><div>${suitsHtml(r.text.replace(/\{(\w+)\}/g, (_, v: string) => (VAR_WORDS[v] ?? v).trim()))}${force}</div>${needs ? `<div class="dim">${esc(needs)}</div>` : ''}</div></div>`;
}

function renderConventions(): void {
  $('#convs').innerHTML = CONVENTIONS.map(
    (c) => `<button class="tog${data.card.conv[c.id] ? ' on' : ''}" data-id="${c.id}"><span><b>${esc(c.name)}</b><br><span class="dim">${suitsHtml(c.blurb)}</span></span><span class="sw"></span></button>`,
  ).join('');
  $('#convMeta').textContent = `${CONVENTIONS.filter((c) => data.card.conv[c.id]).length} of ${CONVENTIONS.length} on`;
  $$('#convs .tog').forEach((b) => (b.onclick = () => {
    const id = b.dataset.id!;
    data.card.conv[id] = !data.card.conv[id];
    changed();
  }));
}

function renderOwn(): void {
  const own = data.card.own;
  $('#ownMeta').textContent = own.length === 1 ? '1 card' : `${own.length} cards`;
  $('#rules').innerHTML = own.length
    ? own.map((o, i) => {
        let body: string;
        try {
          const r = ownToRule(o);
          body = `<div class="seq">${suitsHtml(ctxText(r.ctx))} → ${suitsHtml(tokenText(r.call))}</div><p>${suitsHtml(o.text)}</p><p class="dim">${esc(describeConds(r) || 'any hand')}${o.force === 2 ? ' · forcing to game' : o.force === 1 ? ' · forcing one round' : ''}</p>`;
        } catch (e) {
          body = `<div class="seq">${esc(o.after)} → ${esc(o.call)}</div><p class="tag t-play"><i></i>Needs attention: ${esc(String((e as Error).message))}</p>`;
        }
        return `<div class="rule">${body}<div class="racts"><button class="btn sm" data-edit="${i}">Change</button><button class="btn sm" data-del="${i}">Remove</button></div></div>`;
      }).join('')
    : '<p class="dim" style="margin:0">None yet. A rule card says: after this auction, with this kind of hand, make this call. Your own cards are checked before the base card, so they win.</p>';
  $$('#rules [data-edit]').forEach((b) => (b.onclick = () => openEditor(Number(b.dataset.edit))));
  $$('#rules [data-del]').forEach((b) => (b.onclick = () => {
    const i = Number(b.dataset.del);
    if (!confirm('Remove this rule card?')) return;
    data.card.own.splice(i, 1);
    changed();
  }));
}

function renderVersions(): void {
  $('#versions').innerHTML = data.versions.length
    ? data.versions.map((v, i) => `<div class="ver"><i></i><div><b>${esc(v.name)}</b><br>${new Date(v.date).toLocaleDateString()} · ${v.card.own.length} own cards <button class="btn sm" data-restore="${i}" style="margin-left:6px">Restore</button></div></div>`).join('')
    : '<p class="dim" style="margin:0;font-size:13.5px">No saved versions. Save one before trying a change, so you can come back to it.</p>';
  $$('#versions [data-restore]').forEach((b) => (b.onclick = () => {
    const v = data.versions[Number(b.dataset.restore)];
    if (!confirm(`Go back to "${v.name}"? Your current card will be replaced.`)) return;
    data.card = JSON.parse(JSON.stringify(v.card));
    changed();
    toast(`Restored "${v.name}".`);
  }));
}

function renderBrowser(): void {
  const q = normaliseSeq($<HTMLInputElement>('#ruleSearch').value).split(' ').filter((t) => /^\(?(P|X|XX|[1-7][CDHSN])\)?$/.test(t));
  const groups = new Map<string, Map<string, Rule[]>>();
  let shown = 0;
  for (const r of mySystem().rules) {
    const key = r.ctx.join(' ');
    if (q.length && !ctxStartsWith(r.ctx, q)) continue;
    const sec = r.own ? 'MY OWN RULE CARDS' : r.section || 'OTHER';
    if (!groups.has(sec)) groups.set(sec, new Map());
    const g = groups.get(sec)!;
    if (!g.has(key)) g.set(key, []);
    g.get(key)!.push(r);
    shown++;
  }
  let h = '';
  for (const [sec, ctxs] of groups) {
    h += `<details${q.length ? ' open' : ''}><summary>${suitsHtml(sec)} <span class="dim mono">${[...ctxs.values()].reduce((n, l) => n + l.length, 0)}</span></summary>`;
    for (const [, list] of ctxs) h += `<div class="ctxh">${suitsHtml(ctxText(list[0].ctx))}</div>${list.map(ruleRow).join('')}`;
    h += '</details>';
  }
  $('#browser').innerHTML = h || '<p class="dim">Nothing on the card for that auction.</p>';
  $('#browserMeta').textContent = `${shown} rules`;
}

// ---------- rule card editor
let editing = -1;
/** Opens a new rule card with the auction already filled in (used by the critic). */
export function newRuleAfter(after: string): void {
  openEditor(-1, after);
}
function openEditor(i: number, prefill = ''): void {
  editing = i;
  const o: OwnRule | null = i >= 0 ? data.card.own[i] : null;
  const get = (re: RegExp): string => (o ? (re.exec(o.conds)?.[1] ?? '') : '');
  $<HTMLInputElement>('#fAfter').value = o ? o.after : prefill;
  $<HTMLInputElement>('#fCall').value = o ? o.call : '';
  const hcp = o ? /hcp\s*(\d+)(?:(\+)|-(\d+))?/.exec(o.conds) : null;
  $<HTMLInputElement>('#fMin').value = hcp ? hcp[1] : '';
  $<HTMLInputElement>('#fMax').value = hcp ? (hcp[2] ? '' : hcp[3] ?? hcp[1]) : '';
  for (const s of 'SHDC') {
    const m = o ? new RegExp(`(?:^|,)\\s*${s}(\\d+)(?:(\\+)|(-)(\\d+)?)?\\s*(?:,|$)`).exec(o.conds) : null;
    $<HTMLInputElement>(`#fLo${s}`).value = m ? (m[3] && m[4] === undefined ? '' : m[1]) : '';
    $<HTMLInputElement>(`#fHi${s}`).value = m ? (m[2] ? '' : m[3] ? m[4] ?? m[1] : m[1]) : '';
  }
  void get;
  $<HTMLInputElement>('#fBal').checked = !!o && /(^|,)\s*bal\s*(,|$)/.test(o.conds);
  $<HTMLSelectElement>('#fForce').value = String(o ? o.force : 0);
  $<HTMLInputElement>('#fText').value = o ? o.text : '';
  $('#fErr').textContent = '';
  $('#modalTitle').textContent = o ? 'Change rule card' : 'New rule card';
  preview();
  $('#scrim').classList.add('on');
  $('#modal').classList.add('on');
}
function closeEditor(): void {
  $('#scrim').classList.remove('on');
  $('#modal').classList.remove('on');
}
function readForm(): OwnRule {
  const v = (id: string): string => $<HTMLInputElement>(id).value.trim();
  const conds: string[] = [];
  const lo = v('#fMin');
  const hi = v('#fMax');
  if (lo || hi) conds.push(hi ? `hcp ${lo || 0}-${hi}` : `hcp ${lo}+`);
  for (const s of 'SHDC') {
    const a = v(`#fLo${s}`);
    const b = v(`#fHi${s}`);
    if (a && b) conds.push(a === b ? `${s}${a}` : `${s}${a}-${b}`);
    else if (a) conds.push(`${s}${a}+`);
    else if (b) conds.push(`${s}${b}-`);
  }
  if ($<HTMLInputElement>('#fBal').checked) conds.push('bal');
  const after = normaliseSeq(v('#fAfter'));
  const call = normaliseSeq(v('#fCall'));
  const rule: OwnRule = { id: editing >= 0 ? data.card.own[editing].id : 'o' + Date.now(), after, call, conds: conds.join(', '), text: v('#fText'), force: Number($<HTMLSelectElement>('#fForce').value) as 0 | 1 | 2 };
  return rule;
}
function preview(): OwnRule | null {
  const o = readForm();
  try {
    if (!o.call) throw new Error('Say which call this card is about.');
    if (!/^(P|X|XX|[1-7][CDHSN])$/.test(o.call)) throw new Error(`"${o.call}" is not a call. Write it like 2H, 3NT, Pass or Dbl.`);
    const r = ownToRule(o);
    if (r.ctx.some((t) => /[a-zXYZM*]/.test(t.replace(/^\(?(X|XX)\)?$/, '')))) throw new Error('Write the auction with actual suits, like 1H or (2S).');
    const needs = describeConds(r) || 'any hand';
    $('#fPreview').innerHTML = `Reads as: <b>${suitsHtml(ctxText(r.ctx))}</b> → bid <b>${suitsHtml(tokenText(r.call))}</b> with ${esc(needs)}.`;
    $('#fErr').textContent = '';
    return o;
  } catch (e) {
    $('#fPreview').textContent = '';
    $('#fErr').textContent = (e as Error).message;
    return null;
  }
}
function saveRule(): void {
  const o = preview();
  if (!o) return;
  if (!o.text) o.text = 'My own agreement';
  if (editing >= 0) data.card.own[editing] = o;
  else data.card.own.push(o);
  closeEditor();
  changed();
  toast('Rule card saved. Your partner at the Table now plays it.');
}

function changed(): void {
  cardChanged();
  renderAll();
  restartTable();
  criticStale();
}
function renderAll(): void {
  $('#cardName').textContent = data.card.name;
  renderConventions();
  renderOwn();
  renderVersions();
  renderBrowser();
}

export function initSystem(): void {
  renderAll();
  $('#addRule').onclick = () => openEditor(-1);
  $('#closeModal').onclick = closeEditor;
  $('#scrim').onclick = closeEditor;
  $('#saveRule').onclick = saveRule;
  $$('#modal input, #modal select').forEach((el) => el.addEventListener('input', () => preview()));
  $('#ruleSearch').addEventListener('input', renderBrowser);
  $('#saveVersion').onclick = () => {
    const name = prompt('Name this version', `Version ${data.versions.length + 1}`);
    if (!name) return;
    data.versions.unshift({ name, date: new Date().toISOString(), card: JSON.parse(JSON.stringify(data.card)) });
    save();
    renderVersions();
    toast('Version saved.');
  };
  $('#resetCard').onclick = () => {
    if (!confirm('Put every convention switch back to the stock 2/1 setting? Your own rule cards are kept.')) return;
    data.card.conv = defaultCard().conv;
    changed();
  };
  $('#exportCard').onclick = () => {
    const blob = new Blob([JSON.stringify({ setu: 1, card: data.card, versions: data.versions }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'setu-system.json';
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const file = $<HTMLInputElement>('#importFile');
  $('#importCard').onclick = () => file.click();
  file.onchange = async () => {
    const f = file.files?.[0];
    file.value = '';
    if (!f) return;
    try {
      const j = JSON.parse(await f.text());
      if (!j || j.setu !== 1 || !j.card || typeof j.card.conv !== 'object' || !Array.isArray(j.card.own)) throw new Error('not a Setu system file');
      if (!confirm('Replace your current card with the one in this file?')) return;
      data.card = { name: String(j.card.name || 'My 2/1 card'), conv: { ...defaultCard().conv, ...j.card.conv }, own: j.card.own.map((o: OwnRule) => ({ id: String(o.id), after: String(o.after), call: String(o.call), conds: String(o.conds), text: String(o.text), force: (Number(o.force) || 0) as 0 | 1 | 2 })) };
      if (Array.isArray(j.versions)) data.versions = j.versions;
      changed();
      toast('System file loaded.');
    } catch (e) {
      toast('That file could not be read: ' + (e as Error).message);
    }
  };
}
