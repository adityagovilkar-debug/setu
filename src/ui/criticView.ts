// "Check this system": runs the critic over thousands of deals and lists what it finds, in plain words.
import { Critic, CriticReport, OwnStat, SilentSpot } from '../engine/critic';
import { CONVENTIONS } from '../engine/system21';
import { $, $$, callHtml, esc, handLines, suitsHtml } from './dom';
import { data } from './store';
import { ctxText, newRuleAfter, tokenText } from './system';
import { dealExample } from './table';

const DEALS = 10000;
const CHUNK = 400;
const WHO = ['Partner', 'East', 'You', 'West'];
let running = false;
let report: CriticReport | null = null;
let showAll = false;

const per = (count: number, deals: number): string =>
  count <= 0 ? 'never' : `about 1 deal in ${Math.max(1, Math.round(deals / count)).toLocaleString()}`;

/** Auction tokens written the way the rule card editor expects them. */
function editorSeq(tokens: string[]): string {
  return tokens
    .map((t) => {
      const opp = t.startsWith('(');
      let x = opp ? t.slice(1, -1) : t;
      x = x === 'P' ? 'Pass' : x === 'X' ? 'Dbl' : x === 'XX' ? 'Rdbl' : x.replace(/N$/, 'NT');
      return opp ? `(${x})` : x;
    })
    .join(' ');
}
function guesses(calls: Record<string, number>): string {
  const total = Object.values(calls).reduce((a, b) => a + b, 0);
  return Object.entries(calls)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([c, n]) => `<b class="mono">${callHtml(c)}</b> ${Math.round((n / total) * 100)}%`)
    .join(' · ');
}

function spotHtml(s: SilentSpot, i: number, deals: number): string {
  const tag = s.contested
    ? '<span class="tag t-play"><i></i>Hole when they bid</span>'
    : s.covered
      ? '<span class="tag t-judg"><i></i>Some hands not covered</span>'
      : '<span class="tag t-system"><i></i>No agreement</span>';
  const where = s.tokens.length ? `After ${ctxText(s.tokens)}` : 'Opening the bidding';
  const body = s.covered
    ? 'Your card has rules for this auction, but none of them fits some hands, so the bidder has to guess.'
    : 'Your card says nothing about this auction, so the bidder has to guess.';
  return `<div class="find"><span>${tag}</span><h3>${suitsHtml(where)}</h3><p>${body} What the bot chose: ${guesses(s.calls)}.</p>
    <span class="how">A bid without a rule here: ${per(s.bids, deals)}</span>
    <div class="acts"><button class="btn sm" data-ex="${i}">Show me a hand</button><button class="btn sm" data-add="${i}">Write a rule for this</button></div>
    <div class="exbox" id="ex${i}" hidden></div></div>`;
}

function ruleName(o: OwnStat): string {
  return suitsHtml(`${ctxText(o.rule.ctx)} → ${tokenText(o.rule.call)}`);
}
function ownHtml(o: OwnStat, r: CriticReport): string {
  const name = ruleName(o);
  if (o.fired === 0) {
    return `<div class="find"><span class="tag t-luck"><i></i>Never came up</span><h3>${name}</h3><p>In ${r.deals.toLocaleString()} deals no hand fitted this card at that point. The hand it asks for may be stricter than you meant, or the auction may be written differently from how it really goes.</p></div>`;
  }
  const total = Object.values(o.replaced).reduce((a, b) => a + b, 0);
  const was = Object.entries(o.replaced)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([c, n]) => `${c === '—' ? 'nothing (the base card is silent)' : `<b class="mono">${callHtml(c)}</b>`} ${Math.round((n / total) * 100)}%`)
    .join(' · ');
  let tag = '<span class="tag t-ok"><i></i>In use</span>';
  let clash = '';
  if (o.clashes > 0) {
    const other = r.own.find((x) => x.id === o.clashWith);
    tag = '<span class="tag t-play"><i></i>Clashes with another card</span>';
    clash = `<p>On ${o.clashes} hands your card ${other ? ruleName(other) : 'another of your cards'} also fitted and asked for a different bid. Only the card listed first is used, so the other one is ignored on those hands.</p>`;
  } else if (r.deals / o.fired > 300) {
    tag = '<span class="tag t-luck"><i></i>Rarely used</span>';
  }
  return `<div class="find"><span>${tag}</span><h3>${name}</h3>${clash}<p>Without this card your partner would have bid: ${was}.</p><span class="how">Used ${per(o.fired, r.deals)}</span></div>`;
}

function convHtml(r: CriticReport): string {
  const on = CONVENTIONS.filter((c) => data.card.conv[c.id]);
  if (!on.length) return '<p class="dim">No conventions are switched on.</p>';
  return on
    .map((c) => {
      const n = r.conv[c.id] || 0;
      const rare = n === 0 || r.deals / n > 300;
      return `<div class="drow" style="cursor:default"><span class="nm"><b>${esc(c.name)}</b>${rare ? ' <span class="tag t-luck"><i></i>rare — easy to forget</span>' : ''}</span><span class="val">${n ? per(n, r.deals) : 'never'}</span></div>`;
    })
    .join('');
}

function render(): void {
  const r = report;
  if (!r) return;
  // a gap that needs a bid at least once in a thousand deals is worth her attention; the rest are rarities
  const common = r.spots.filter((s) => s.bids * 1000 >= r.deals);
  const spots = showAll ? r.spots : common.length ? common.slice(0, 10) : r.spots.slice(0, 5);
  const contested = common.filter((s) => s.contested).length;
  const rare = r.spots.length - common.length;
  const share = r.calls ? (r.silent / r.calls) * 100 : 0;
  let h = `<div class="readouts" style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr));margin-bottom:6px">
    <div class="ro"><span class="k">Deals bid</span><span class="v">${r.deals.toLocaleString()}</span></div>
    <div class="ro"><span class="k">Bids made on judgment</span><span class="v">${share.toFixed(1)}% <small>${r.silent.toLocaleString()} of ${r.calls.toLocaleString()}</small></span></div>
    <div class="ro"><span class="k">Common gaps</span><span class="v">${common.length} <small>${contested} when they bid · ${rare} rare</small></span></div>
    <div class="ro"><span class="k">Your rule cards</span><span class="v">${data.card.own.length}</span></div></div>
    <p class="dim" style="margin:8px 0 0;font-size:13.5px">Your card was played by both you and partner; the opponents played stock 2/1. A gap is a point in the bidding where one of you had to make a bid with no rule to follow.</p>`;
  if (r.unreadable.length) {
    h += '<div class="sech"><span class="lbl">Rule cards that cannot be read</span></div>';
    h += r.unreadable.map((u) => `<div class="find"><span class="tag t-play"><i></i>Needs attention</span><h3>${esc(u.after || 'Opening')} → ${esc(u.call)}</h3><p>${esc(u.error)}. Open the card with Change and correct it.</p></div>`).join('');
  }
  h += `<div class="sech"><span class="lbl">${showAll ? 'Every gap, most frequent first' : 'The most frequent gaps'}</span></div>`;
  h += spots.length ? spots.map((s, i) => spotHtml(s, i, r.deals)).join('') : '<p class="dim">No gaps found: every bid followed a rule.</p>';
  if (!showAll && r.spots.length > spots.length) h += `<p class="dim" style="font-size:13.5px">${(r.spots.length - spots.length).toLocaleString()} more gaps came up, nearly all of them rarely — less than once in a thousand deals.</p><button class="btn sm" id="critAll">Show every gap</button>`;
  if (r.own.length) h += `<div class="sech"><span class="lbl">Your own rule cards</span></div>${r.own.map((o) => ownHtml(o, r)).join('')}`;
  h += `<div class="sech"><span class="lbl">How often each convention was used</span></div>${convHtml(r)}`;
  $('#findBody').innerHTML = h;
  $('#findMeta').textContent = `${r.deals.toLocaleString()} deals`;

  const all = document.getElementById('critAll');
  if (all) all.onclick = () => { showAll = true; render(); };
  $$('#findBody [data-add]').forEach((b) => (b.onclick = () => newRuleAfter(editorSeq(spots[Number(b.dataset.add)].tokens))));
  $$('#findBody [data-ex]').forEach((b) => (b.onclick = () => {
    const i = Number(b.dataset.ex);
    const s = spots[i];
    const box = $(`#ex${i}`);
    if (!box.hidden) { box.hidden = true; return; }
    const e = s.example;
    box.innerHTML = `<p><b>${WHO[e.seat]}</b> held:</p><div class="mono" style="line-height:1.6">${handLines(e.hand)}</div>
      <p>…and bid <b class="mono">${callHtml(e.call)}</b> on judgment: ${suitsHtml(e.why)}.</p>
      <button class="btn sm" data-deal="1">Bid this deal at the Table</button>`;
    box.hidden = false;
    $('[data-deal]', box).onclick = () => {
      dealExample(e.seed, e.dealer);
      window.dispatchEvent(new CustomEvent('setu:go', { detail: 'table' }));
    };
  }));
}

function run(): void {
  if (running) return;
  running = true;
  showAll = false;
  const btn = $<HTMLButtonElement>('#checkBtn');
  btn.disabled = true;
  const unit = $('#findings');
  unit.hidden = false;
  $('#findStale').hidden = true;
  $('#findBody').innerHTML = '<div class="scan"><span><span id="scanN">0</span> of ' + DEALS.toLocaleString() + ' deals dealt and bid…</span></div>';
  $('#findMeta').textContent = 'working';
  unit.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const critic = new Critic(JSON.parse(JSON.stringify(data.card)), 1 + Math.floor(Math.random() * 1e6));
  let done = 0;
  const tick = (): void => {
    critic.step(CHUNK);
    done += CHUNK;
    const n = document.getElementById('scanN');
    if (n) n.textContent = done.toLocaleString();
    if (done < DEALS) {
      window.setTimeout(tick, 0);
      return;
    }
    report = critic.report();
    running = false;
    btn.disabled = false;
    render();
  };
  window.setTimeout(tick, 30);
}

/** The card changed: the report on screen no longer describes it. */
export function criticStale(): void {
  if (report) $('#findStale').hidden = false;
}

export function initCritic(): void {
  $('#checkBtn').onclick = run;
  $('#findClose').onclick = () => { $('#findings').hidden = true; };
}
