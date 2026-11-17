// The Lab: bid the same deals with two versions of the card, solve the deals where they differ, and compare.
import { Contract, boardSetup } from '../engine/auction';
import { Seat, dealCards, makeRng, SUIT_SYMBOL } from '../engine/cards';
import { Diff, SITUATIONS, Summary, bidDeal, dealFits, finalContract, sameContract, summarise } from '../engine/lab';
import { resultFor } from '../engine/result';
import { System, SystemCard } from '../engine/rules';
import { baseRules, defaultCard } from '../engine/system21';
import { $, $$, callHtml, handLines, suitsHtml, toast } from './dom';
import { clearQueue, solveAsync } from './pool';
import { data, fieldSystem } from './store';
import { dealExample } from './table';

const WHO = ['Partner', 'East', 'You', 'West'];
let running = false;
let runId = 0;
let diffs: Diff[] = [];
let names = { a: '', b: '' };
let scoring: 'mp' | 'imp' = 'mp';
let seenVersions = -1;

function cardFor(v: string): SystemCard {
  if (v === 'now') return data.card;
  if (v === 'stock') return defaultCard('Stock 2/1');
  return data.versions[Number(v.slice(1))]?.card ?? data.card;
}
function labelFor(v: string): string {
  if (v === 'now') return 'My card now';
  if (v === 'stock') return 'Stock 2/1';
  return data.versions[Number(v.slice(1))]?.name ?? 'My card now';
}

/** Rebuilds the version lists (versions may have been saved since). */
export function refreshLab(): void {
  const opts = [['now', 'My card now'], ...data.versions.map((v, i) => [`v${i}`, `${v.name} (${new Date(v.date).toLocaleDateString()})`]), ['stock', 'Stock 2/1 — no own cards, stock switches']];
  const html = opts.map(([v, l]) => `<option value="${v}">${l.replace(/</g, '&lt;')}</option>`).join('');
  // a newly saved version is what she most likely wants to test against: make it A
  const fresh = data.versions.length !== seenVersions;
  seenVersions = data.versions.length;
  for (const [id, fallback] of [['#labA', data.versions.length ? 'v0' : 'stock'], ['#labB', 'now']]) {
    const sel = $<HTMLSelectElement>(id);
    const keep = fresh ? '' : sel.value;
    sel.innerHTML = html;
    sel.value = opts.some(([v]) => v === keep) ? keep : fallback;
  }
}

const signed = (n: number): string => (n > 0 ? '+' + n : n < 0 ? '−' + -n : '0');
const contractText = (c: Contract | null): string =>
  c ? `${c.level}${c.strain === 4 ? 'NT' : SUIT_SYMBOL[c.strain]}${c.dbl === 1 ? 'x' : c.dbl === 2 ? 'xx' : ''} by ${WHO[c.declarer] === 'You' ? 'you' : WHO[c.declarer]}` : 'Passed out';

function auctionGrid(calls: string[], dealer: Seat): string {
  let h = '<div class="auction"><div class="h">West</div><div class="h">Partner</div><div class="h">East</div><div class="h">You</div>';
  for (let i = 0; i < (dealer + 1) % 4; i++) h += '<div class="c"></div>';
  for (const c of calls) h += `<div class="c${c === 'P' ? ' pass' : ''}">${callHtml(c)}</div>`;
  return h + '</div>';
}

function showDeal(d: Diff): void {
  const deal = dealCards(makeRng(d.seed));
  const hd = (seat: Seat, k: string): string => `<div class="hd ${k}"><span class="lbl">${WHO[seat]}</span>${handLines(deal[seat])}</div>`;
  const vul = d.vulNS && d.vulEW ? 'Everyone vulnerable' : d.vulNS ? 'You are vulnerable' : d.vulEW ? 'They are vulnerable' : 'Nobody vulnerable';
  const box = $('#labDeal');
  box.innerHTML = `<div class="head"><h2>The deal</h2><span class="meta">Dealer ${WHO[d.dealer]} · ${vul}</span></div>
    <div class="deal">${hd(0, 'N')}${hd(3, 'W')}<div class="X"></div>${hd(1, 'E')}${hd(2, 'S')}</div>
    <div class="two" style="margin-top:14px">
      <div><div class="sech" style="margin-top:0"><span class="lbl">A · ${names.a.replace(/</g, '&lt;')}</span></div>${auctionGrid(d.callsA, d.dealer)}<p class="verdict" style="margin-top:10px">${suitsHtml(contractText(d.contractA))} · ${signed(d.scoreA)}</p></div>
      <div><div class="sech" style="margin-top:0"><span class="lbl">B · ${names.b.replace(/</g, '&lt;')}</span></div>${auctionGrid(d.callsB, d.dealer)}<p class="verdict" style="margin-top:10px">${suitsHtml(contractText(d.contractB))} · ${signed(d.scoreB)}</p></div>
    </div>
    <p class="dim" style="font-size:13.5px">Scores are for your side, with best play all round.</p>
    <button class="btn sm" id="labPractise">Bid this deal at the Table</button>`;
  box.hidden = false;
  $('#labPractise').onclick = () => {
    dealExample(d.seed, d.dealer);
    window.dispatchEvent(new CustomEvent('setu:go', { detail: 'table' }));
  };
  box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function rows(list: Diff[], el: string): void {
  $(el).innerHTML = list.length
    ? list.map((d, i) => `<button class="drow" data-i="${i}"><span class="nm">${suitsHtml(`A: ${contractText(d.contractA)} · B: ${contractText(d.contractB)}`)}</span><span class="val">${signed(d.scoreB - d.scoreA)}</span></button>`).join('')
    : '<p class="dim" style="margin:0">None.</p>';
  $$(`${el} .drow`).forEach((b) => (b.onclick = () => showDeal(list[Number(b.dataset.i)])));
}

function headline(s: Summary): [string, string] {
  const share = scoring === 'mp' ? `${s.pct.toFixed(1)}% of the matchpoints (± ${s.pctMargin.toFixed(1)})` : `${s.imp >= 0 ? '+' : '−'}${Math.abs(s.imp).toFixed(2)} IMPs a deal (± ${s.impMargin.toFixed(2)})`;
  if (s.n === 0) return ['The two versions bid every deal the same way.', 'In this situation the change never made a difference. Try another situation, or more deals.'];
  if (s.n < 30) return ['Too few deals were bid differently to tell.', `Only ${s.n} of ${s.bid.toLocaleString()} deals came out differently. Run more deals, or pick a situation where the change matters.`];
  const base = `On the ${s.n} deals where the two versions bid differently, B scored ${share}.`;
  if (s.verdict === 'open') return ['No clear winner.', `${base} That is inside the margin of error, so the change may help or hurt a little — run more deals to narrow it down.`];
  const who = s.verdict === 'B' ? `B — ${names.b}` : `A — ${names.a}`;
  return [`${who} scores better.`, base];
}

function draw(bid: number, target: number, pending: number, done: boolean): void {
  const s = summarise(diffs, bid, scoring);
  const dots = diffs.map((d) => `<i class="${d.scoreB > d.scoreA ? 'b' : d.scoreB < d.scoreA ? 'a' : 'eq'}"></i>`).join('');
  const [title, sub] = done ? headline(s) : ['Dealing, bidding and solving…', ''];
  const sure = '<span class="dots" style="--pen:var(--watch)">' + [0, 1, 2, 3, 4].map((i) => `<i${i < s.sure ? ' class="on"' : ''}></i>`).join('') + '</span>';
  const share = scoring === 'mp' ? `${s.pct.toFixed(1)}% <small>± ${isFinite(s.pctMargin) ? s.pctMargin.toFixed(1) : '—'}</small>` : `${s.imp >= 0 ? '+' : '−'}${Math.abs(s.imp).toFixed(2)} <small>± ${isFinite(s.impMargin) ? s.impMargin.toFixed(2) : '—'} IMPs</small>`;
  $('#labBody').innerHTML = `<p class="verdict${done ? '' : ' working'}">${suitsHtml(title)}</p>${sub ? `<p style="margin:0;color:var(--ink-2)">${suitsHtml(sub)}</p>` : ''}
    <div class="matrix">${dots}</div>
    <div class="legend"><span><i style="background:var(--pen-3)"></i>B did better · <b class="mono">${s.wins}</b></span><span><i style="background:var(--ink-3)"></i>Same score · <b class="mono">${s.ties}</b></span><span><i style="background:var(--pen-1)"></i>A did better · <b class="mono">${s.losses}</b></span></div>
    <div class="readouts" style="grid-template-columns:repeat(3,1fr);margin-top:14px">
      <div class="ro"><span class="k">Bid differently</span><span class="v">${s.n} <small>of ${bid.toLocaleString()}</small></span></div>
      <div class="ro"><span class="k">B's result</span><span class="v">${share}</span></div>
      <div class="ro"><span class="k">How sure</span><span class="v">${sure}</span></div></div>
    <div class="note"><span class="ring"></span><span>Each dot is one deal the versions bid differently, judged with best play all round. Matchpoints here compare A and B head to head: each deal is won, lost or tied.</span></div>`;
  $('#labMeta').textContent = done ? `${bid.toLocaleString()} deals` : `${bid.toLocaleString()} of ${target.toLocaleString()} bid · ${pending} solving`;
  if (done) {
    const sorted = [...diffs].sort((x, y) => y.scoreB - y.scoreA - (x.scoreB - x.scoreA));
    rows(sorted.filter((d) => d.scoreB > d.scoreA).slice(0, 6), '#labWins');
    rows(sorted.reverse().filter((d) => d.scoreB < d.scoreA).slice(0, 6), '#labLosses');
    $('#labLists').hidden = s.n === 0;
  }
}

function stop(): void {
  runId++;
  clearQueue();
}

async function run(): Promise<void> {
  if (running) {
    stop();
    return;
  }
  const a = $<HTMLSelectElement>('#labA').value;
  const b = $<HTMLSelectElement>('#labB').value;
  const cardA = cardFor(a);
  const cardB = cardFor(b);
  if (a === b || (JSON.stringify(cardA.conv) === JSON.stringify(cardB.conv) && JSON.stringify(cardA.own) === JSON.stringify(cardB.own))) {
    toast('Those two versions are the same card, so they would bid every deal the same way. Pick two that differ.');
    return;
  }
  const target = Number($('#labN .on').dataset.n);
  const situation = $<HTMLSelectElement>('#labSit').value;
  scoring = $('#labScore .on').dataset.s === 'imp' ? 'imp' : 'mp';
  names = { a: labelFor(a), b: labelFor(b) };
  const field = fieldSystem();
  const sysA = new System(JSON.parse(JSON.stringify(cardA)), baseRules());
  const sysB = new System(JSON.parse(JSON.stringify(cardB)), baseRules());
  const id = ++runId;
  running = true;
  diffs = [];
  $('#labRun').textContent = 'Stop';
  $('#labLists').hidden = true;
  $('#labDeal').hidden = true;
  const seed0 = Math.floor(Math.random() * 2 ** 30);
  let bid = 0;
  let tried = 0;
  let pending = 0;
  const jobs: Promise<void>[] = [];
  while (bid < target && tried < target * 80 && id === runId) {
    for (let k = 0; k < 120 && bid < target; k++) {
      tried++;
      const seed = seed0 + tried;
      const { dealer, vulNS, vulEW } = boardSetup(tried);
      const deal = dealCards(makeRng(seed));
      if (situation !== 'any' && !dealFits(deal, dealer, situation, [sysA, field])) continue;
      bid++;
      const tA = bidDeal(deal, dealer, [sysA, field]);
      const tB = bidDeal(deal, dealer, [sysB, field]);
      const cA = finalContract(tA);
      const cB = finalContract(tB);
      if (sameContract(cA, cB)) continue;
      const d: Diff = { seed, dealer, vulNS, vulEW, callsA: tA.auction.calls, callsB: tB.auction.calls, contractA: cA, contractB: cB, scoreA: 0, scoreB: 0 };
      pending++;
      jobs.push(
        solveAsync(deal)
          .then((tt) => {
            d.scoreA = resultFor(tt, cA, vulNS, vulEW).scoreNS;
            d.scoreB = resultFor(tt, cB, vulNS, vulEW).scoreNS;
            if (id === runId) diffs.push(d);
          })
          .catch(() => {})
          .finally(() => { pending--; }),
      );
    }
    draw(bid, target, pending, false);
    await new Promise((r) => window.setTimeout(r, 0));
  }
  while (pending > 0 && id === runId) {
    draw(bid, target, pending, false);
    await new Promise((r) => window.setTimeout(r, 250));
  }
  await Promise.allSettled(jobs);
  running = false;
  $('#labRun').textContent = 'Run the test';
  if (id !== runId) toast('Stopped. The result covers the deals finished so far.');
  if (situation !== 'any' && bid < target && id === runId) toast('Deals of that kind are rare, so fewer were found than asked for.');
  draw(bid, target, 0, true);
}

export function initLab(): void {
  const sit = $<HTMLSelectElement>('#labSit');
  sit.innerHTML = SITUATIONS.map(([v, l]) => `<option value="${v}">${l}</option>`).join('');
  for (const id of ['#labN', '#labScore']) {
    $$(`${id} button`).forEach((b) => (b.onclick = () => {
      if (running) return;
      $$(`${id} button`).forEach((x) => x.classList.toggle('on', x === b));
    }));
  }
  $('#labRun').onclick = () => void run();
  $('#labBody').innerHTML = '<div class="scan" style="height:auto;padding:24px 0;text-align:center">Choose two versions and press “Run the test”.<br>Each dot will be one deal where they bid differently.</div>';
  refreshLab();
}
