// The practice table: bid a deal with a bot partner who plays your card, then see what the solver says.
import { Call, Contract, boardSetup, contractOf, isLegal, isOver, makeBid, seatOf, toAct } from '../engine/auction';
import { CallMeta, Table, botCall, humanCall, inferences, newTable, play, runBots } from '../engine/bidder';
import { Deal, SEAT_NAMES, STRAIN_LETTER, SUIT_SYMBOL, Seat, dealCards, evaluate, makeRng, sideOf } from '../engine/cards';
import { SITUATIONS, dealFits } from '../engine/lab';
import { describeConds } from '../engine/rules';
import type { TrickTable } from '../engine/solver';
import { bestContract, resultFor } from '../engine/result';
import { $, $$, callHtml, handCards, handLines, showsHtml, suitsHtml, toast } from './dom';
import { data, fieldSystem, mySystem, save } from './store';

const ME: Seat = 2;
const WHO = ['Partner', 'East', 'You', 'West'];

interface State {
  dealer: Seat;
  table: Table | null;
  seed: number;
  vulNS: boolean;
  vulEW: boolean;
  sel: number;
  hinted: boolean;
  tt: TrickTable | null;
  solveError: string;
  logged: boolean;
}
const st: State = { dealer: 0, table: null, seed: 0, vulNS: false, vulEW: false, sel: -1, hinted: false, tt: null, solveError: '', logged: false };

// ---------- solver worker
let worker: Worker | null = null;
let jobId = 0;
function solve(deal: Deal | null): void {
  if (!worker) {
    worker = new Worker(new URL('../solver.worker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (e: MessageEvent) => {
      if (e.data.id !== jobId) return;
      if (e.data.error) st.solveError = e.data.error;
      else st.tt = e.data.tt;
      render();
    };
    worker.onerror = () => {
      st.solveError = 'The solver could not start in this browser.';
      render();
    };
  }
  if (!deal) {
    worker.postMessage({ id: 0, deal: null }); // load the solver ahead of the first result
    return;
  }
  jobId++;
  worker.postMessage({ id: jobId, deal });
}

// ---------- dealing
const fits = (deal: Deal, dealer: Seat, situation: string): boolean => dealFits(deal, dealer, situation, [mySystem(), fieldSystem()]);
function start(seed?: number, dealerOverride?: Seat): void {
  const setup = boardSetup(data.board);
  const dealer = dealerOverride ?? setup.dealer;
  const custom = dealerOverride !== undefined && dealerOverride !== setup.dealer;
  const vulNS = !custom && setup.vulNS;
  const vulEW = !custom && setup.vulEW;
  st.dealer = dealer;
  let deal: Deal | null = null;
  let used = seed ?? 0;
  if (seed !== undefined) deal = dealCards(makeRng(seed));
  for (let i = 0; !deal && i < 6000; i++) {
    used = Math.floor(Math.random() * 2 ** 31);
    const d = dealCards(makeRng(used));
    if (fits(d, dealer, data.situation)) deal = d;
  }
  if (!deal) {
    used = Math.floor(Math.random() * 2 ** 31);
    deal = dealCards(makeRng(used));
    toast('Could not find a deal of that kind quickly — here is an ordinary one.');
  }
  st.table = newTable(deal, dealer, [mySystem(), fieldSystem()]);
  Object.assign(st, { seed: used, vulNS, vulEW, sel: -1, hinted: false, tt: null, solveError: '', logged: false });
  runBots(st.table, ME);
  st.sel = st.table.metas.length - 1;
  afterCalls();
  render();
}
function afterCalls(): void {
  const t = st.table!;
  if (isOver(t.auction) && !st.tt) solve(t.deal);
}
function bid(call: Call): void {
  const t = st.table!;
  if (isOver(t.auction) || toAct(t.auction) !== ME || !isLegal(t.auction, call)) return;
  play(t, humanCall(t, ME, call));
  runBots(t, ME);
  st.sel = t.metas.length - 1;
  afterCalls();
  render();
}

// ---------- text
const contractText = (c: Contract | null): string =>
  c ? `${c.level}${c.strain === 4 ? 'NT' : SUIT_SYMBOL[c.strain]}${c.dbl === 1 ? ' doubled' : c.dbl === 2 ? ' redoubled' : ''} by ${WHO[c.declarer] === 'You' ? 'you' : WHO[c.declarer]}` : 'Passed out';
const signed = (n: number): string => (n > 0 ? '+' + n : n < 0 ? '−' + -n : '0');

function meaningHtml(m: CallMeta, done: boolean): string {
  let src = '';
  if (m.matches.length) {
    const first = m.matches[0];
    const needs = describeConds(first.rule, first.bind);
    src = (first.rule.own ? 'Your own rule card' : 'Base 2/1 card' + (first.rule.conv ? ' · convention' : '')) + (needs ? ` · needs ${needs}` : '');
  } else if (m.tag) src = 'Key-card convention';
  else if (m.src === 'judgment') src = 'The card is silent here — the bot used its own judgment';
  else src = m.call === 'P' ? '' : 'Nothing on the card for this call';
  const force = m.force === 2 ? '<span class="tag t-system"><i></i>Forcing to game</span>' : m.force === 1 ? '<span class="tag t-judg"><i></i>Forcing for one round</span>' : '';
  let verdict = '';
  if (done && m.seat === ME && m.src === 'human') {
    if (m.cardCall === null) verdict = '<p><span class="tag t-luck"><i></i>Card silent</span> Your card has no rule for this hand here, so the choice was yours.</p>';
    else if (m.cardCall === m.call) verdict = '<p><span class="tag t-ok"><i></i>As on your card</span></p>';
    else verdict = `<p><span class="tag t-judg"><i></i>Not your card's bid</span> Your card says <b class="mono">${callHtml(m.cardCall!)}</b>: ${suitsHtml(m.cardText ?? '')}</p>`;
  }
  return `<div><b class="call">${callHtml(m.call)}</b><span class="lbl">${WHO[m.seat]}</span></div><p>${suitsHtml(m.text)}</p>${force ? `<p>${force}</p>` : ''}${verdict}<div class="src">${suitsHtml(src)}</div>`;
}

function auctionHtml(t: Table, done: boolean): string {
  const vul = (ns: boolean): string => ((ns ? st.vulNS : st.vulEW) ? ' <i class="vul" title="Vulnerable"></i>' : '');
  let h = `<div class="auction"><div class="h">West${vul(false)}</div><div class="h">Partner${vul(true)}</div><div class="h">East${vul(false)}</div><div class="h">You${vul(true)}</div>`;
  for (let i = 0; i < (t.auction.dealer + 1) % 4; i++) h += '<div class="c"></div>';
  t.metas.forEach((m, i) => {
    const flag = done && m.seat === ME && m.src === 'human' && m.cardCall !== m.call ? (m.cardCall === null ? ' silent' : ' off') : '';
    h += `<button class="c${m.call === 'P' ? ' pass' : ''}${i === st.sel ? ' sel' : ''}${flag}" data-i="${i}">${callHtml(m.call)}</button>`;
  });
  if (!done) h += '<div class="c you">?</div>';
  return h + '</div>';
}

function boxHtml(t: Table): string {
  let h = '<div class="bbox">';
  for (let lv = 1; lv <= 7; lv++) {
    for (let s = 0; s < 5; s++) {
      const c = makeBid(lv, s);
      h += `<button data-c="${c}"${isLegal(t.auction, c) ? '' : ' disabled'}>${callHtml(c)}</button>`;
    }
  }
  h += `<div class="wide"><button data-c="P">Pass</button><button data-c="X"${isLegal(t.auction, 'X') ? '' : ' disabled'}>Dbl</button><button data-c="XX"${isLegal(t.auction, 'XX') ? '' : ' disabled'}>Rdbl</button></div></div>`;
  h += `<div class="hintrow"><button class="btn sm" id="hintBtn">What does my card say?</button><span id="hintOut" class="dim"></span></div>`;
  return h;
}

function resultHtml(t: Table): string {
  const c = contractOf(t.auction);
  const mine = t.metas.filter((m) => m.seat === ME && m.src === 'human');
  const followed = mine.filter((m) => m.cardCall === m.call).length;
  const silent = mine.filter((m) => m.cardCall === null).length;
  let h = `<p class="verdict">${suitsHtml(contractText(c))}</p>`;
  if (st.solveError) {
    h += `<p class="dim">The solver is not available: ${suitsHtml(st.solveError)}</p>`;
  } else if (!st.tt) {
    h += '<p class="dim working">Solving the deal…</p>';
  } else {
    const r = resultFor(st.tt, c, st.vulNS, st.vulEW);
    const best = bestContract(st.tt, 0, st.vulNS);
    const bestScore = best ? best.score : 0;
    let line = '';
    if (!c) line = best ? `Your side could have made ${best.level}${best.strain === 4 ? 'NT' : SUIT_SYMBOL[best.strain]} for ${signed(best.score)}.` : 'Nothing was makeable for your side. A fair pass-out.';
    else if (sideOf(c.declarer) === 0) {
      const down = c.level + 6 - r.tricks;
      if (down > 0) line = `With best defence this goes ${down} down. ` + (best ? `Your side can make ${best.level}${best.strain === 4 ? 'NT' : SUIT_SYMBOL[best.strain]} (${signed(best.score)}).` : 'Nothing makes for your side on this deal.');
      else if (r.scoreNS >= bestScore) line = 'The best-scoring contract your side can make.';
      else line = `It makes, but ${best!.level}${best!.strain === 4 ? 'NT' : SUIT_SYMBOL[best!.strain]} scores more (${signed(bestScore)}).`;
    } else {
      const down = c.level + 6 - r.tricks;
      if (down > 0) line = `They go ${down} down with best defence.` + (bestScore > r.scoreNS ? ` Your own best was ${best!.level}${best!.strain === 4 ? 'NT' : SUIT_SYMBOL[best!.strain]} (${signed(bestScore)}).` : ' Defending was right.');
      else line = bestScore > r.scoreNS && best ? `They make it. Your side could have made ${best.level}${best.strain === 4 ? 'NT' : SUIT_SYMBOL[best.strain]} (${signed(bestScore)}).` : 'They make it, and your side had nothing better.';
    }
    h += `<p style="margin:0;color:var(--ink-2)">${suitsHtml(line)}</p>`;
    h += `<div class="readouts" style="grid-template-columns:1fr 1fr 1fr;margin-top:12px"><div class="ro"><span class="k">Tricks</span><span class="v">${c ? r.tricks : '—'}</span></div><div class="ro"><span class="k">Your score</span><span class="v">${signed(r.scoreNS)}</span></div><div class="ro"><span class="k">Your best</span><span class="v">${signed(bestScore)}</span></div></div>`;
    if (!st.logged) {
      st.logged = true;
      data.log.push({ board: data.board, date: new Date().toISOString(), contract: contractText(c), scoreNS: r.scoreNS, bestNS: bestScore, calls: mine.length, followed, silent, hinted: st.hinted });
      if (data.log.length > 2000) data.log.shift();
      save();
    }
  }
  if (mine.length) {
    const off = mine.length - followed - silent;
    h += `<div class="sech"><span class="lbl">Your calls against your card</span></div><p style="margin:0">${followed} of ${mine.length} as on your card${off ? ` · <span class="tag t-judg"><i></i>${off} different</span>` : ''}${silent ? ` · <span class="tag t-luck"><i></i>${silent} where the card is silent</span>` : ''}</p><p class="dim" style="margin:6px 0 0;font-size:13px">Tap a marked call in the auction to see what the card says.</p>`;
  }
  h += '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px"><button class="btn pri" id="nextBtn">Next deal</button><button class="btn" id="againBtn">Bid this deal again</button></div>';
  return h;
}

function tricksHtml(tt: TrickTable): string {
  let h = '<table class="tt"><tr><th></th>' + [4, 3, 2, 1, 0].map((s) => `<th>${s === 4 ? 'NT' : suitsHtml(SUIT_SYMBOL[s])}</th>`).join('') + '</tr>';
  for (const [name, seats] of [['You two', [0, 2]], ['They', [1, 3]]] as [string, number[]][]) {
    h += `<tr><td>${name}</td>` + [4, 3, 2, 1, 0].map((s) => `<td>${Math.max(tt[s][seats[0]], tt[s][seats[1]])}</td>`).join('') + '</tr>';
  }
  return h + '</table>';
}

function render(): void {
  const t = st.table;
  if (!t) return;
  const done = isOver(t.auction);
  const dealer = st.dealer;
  const vulText = st.vulNS && st.vulEW ? 'Everyone vulnerable' : st.vulNS ? 'You are vulnerable' : st.vulEW ? 'They are vulnerable' : 'Nobody vulnerable';
  $('#tTitle').textContent = `Board ${data.board}`;
  $('#tSub').textContent = `Dealer: ${dealer === ME ? 'you' : WHO[dealer]} · ${vulText}`;
  $('#crumb').innerHTML = `Board ${data.board} · <b>${done ? 'finished' : 'bidding'}</b>`;
  const ev = evaluate(t.deal[ME]);
  if (!done) {
    $('#felt').innerHTML =
      `<div><div class="seat"><b>Partner</b> · bot, plays your card</div><div class="backs" style="margin-top:8px">${'<i></i>'.repeat(13)}</div></div>` +
      `<div class="mid"><div class="side"><b>West</b>bot</div><div>${auctionHtml(t, false)}</div><div class="side"><b>East</b>bot</div></div>` +
      `<div><div class="hand">${handCards(t.deal[ME])}</div><div class="seat" style="margin-top:8px"><b>You</b> · ${ev.hcp} points</div></div>`;
  } else {
    const c = contractOf(t.auction);
    const hd = (seat: Seat, k: string): string => `<div class="hd ${k}"><span class="lbl">${WHO[seat]} · ${evaluate(t.deal[seat]).hcp}</span>${handLines(t.deal[seat])}</div>`;
    $('#felt').innerHTML =
      auctionHtml(t, true) +
      `<div class="deal">${hd(0, 'N')}${hd(3, 'W')}<div class="X"><div>${suitsHtml(contractText(c))}</div></div>${hd(1, 'E')}${hd(2, 'S')}</div>` +
      (st.tt ? `<div><div class="sech"><span class="lbl">Tricks each side can take</span></div>${tricksHtml(st.tt)}</div>` : '');
  }
  const info = inferences(t);
  $('#meaning').innerHTML =
    (st.sel >= 0 && t.metas[st.sel] ? meaningHtml(t.metas[st.sel], done) : '<p class="dim">You are first to speak.</p>') +
    `<div class="sech"><span class="lbl">Shown so far</span></div><div class="shown"><div><span class="lbl">Partner</span>${showsHtml(info[0])}</div><div><span class="lbl">West</span>${showsHtml(info[3])}</div><div><span class="lbl">East</span>${showsHtml(info[1])}</div></div>`;
  $('#boxTitle').textContent = done ? 'Result' : 'Your call';
  $('#boxMeta').textContent = done ? 'solver' : 'bidding box';
  $('#boxBody').innerHTML = done ? resultHtml(t) : boxHtml(t);

  $$('#felt button.c').forEach((b) => (b.onclick = () => { st.sel = Number(b.dataset.i); render(); }));
  $$('#boxBody button[data-c]').forEach((b) => (b.onclick = () => bid(b.dataset.c!)));
  const hint = document.getElementById('hintBtn');
  if (hint) hint.onclick = () => {
    const hit = mySystem().find(t.auction, ME, t.deal[ME]);
    st.hinted = true;
    $('#hintOut').innerHTML = hit ? `<b class="mono">${callHtml(hit.call)}</b> — ${suitsHtml(hit.rule.text.replace(/\{\w+\}/g, 'the suit'))}` : 'Your card is silent here. Use your judgment.';
  };
  const next = document.getElementById('nextBtn');
  if (next) next.onclick = () => { data.board++; save(); start(); };
  const again = document.getElementById('againBtn');
  if (again) again.onclick = () => start(st.seed, st.dealer);
}

export function initTable(): void {
  const sel = $<HTMLSelectElement>('#situation');
  sel.innerHTML = SITUATIONS.map(([v, l]) => `<option value="${v}">${l}</option>`).join('');
  sel.value = SITUATIONS.some(([v]) => v === data.situation) ? data.situation : 'any';
  sel.onchange = () => { data.situation = sel.value; save(); start(); };
  $('#newDeal').onclick = () => { data.board++; save(); start(); };
  start();
  solve(null);
}
/** Called when the card changes: deal afresh so the bots use the new card. */
export function restartTable(): void {
  start();
}
/** Deals one particular deal (an example found by the critic or the Lab). */
export function dealExample(seed: number, dealer: Seat): void {
  start(seed, dealer);
}
export { seatOf, SEAT_NAMES, STRAIN_LETTER };
