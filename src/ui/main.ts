import './style.css';
import './extra.css';
import { $, $$ } from './dom';
import { data, save } from './store';
import { initSystem } from './system';
import { initTable } from './table';

const root = document.documentElement;

function go(view: string): void {
  $$('.view').forEach((v) => v.classList.toggle('on', v.id === 'v-' + view));
  $$('.rb').forEach((b, i) => {
    const on = b.dataset.v === view;
    b.classList.toggle('on', on);
    if (on) $('#ind').style.transform = `translateY(${i * 68}px)`;
  });
  if (view !== 'table') $('#crumb').textContent = '';
  if (view === 'progress') renderProgress();
  $('main').scrollTop = 0;
}

function renderProgress(): void {
  const log = data.log;
  const calls = log.reduce((n, b) => n + b.calls, 0);
  const followed = log.reduce((n, b) => n + b.followed, 0);
  const silent = log.reduce((n, b) => n + b.silent, 0);
  const best = log.filter((b) => b.scoreNS >= b.bestNS).length;
  const ro = (k: string, v: string, small = ''): string => `<div class="ro"><span class="k">${k}</span><span class="v">${v} <small>${small}</small></span></div>`;
  $('#progress').innerHTML =
    ro('Boards bid', String(log.length)) +
    ro('Calls as on your card', calls ? `${Math.round((followed / calls) * 100)}%` : '—', calls ? `${followed} of ${calls}` : '') +
    ro('Card was silent', String(silent), 'calls') +
    ro('Reached your best contract', log.length ? `${Math.round((best / log.length) * 100)}%` : '—', log.length ? `${best} of ${log.length}` : '');
}

function applyTheme(): void {
  const dark = data.theme ? data.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  root.dataset.theme = dark ? 'dark' : 'light';
  $('#themeBtn').textContent = dark ? 'Light' : 'Dark';
  root.classList.toggle('four', data.four);
  $('#suitBtn').textContent = data.four ? '4 colours' : '2 colours';
}

$$('.rb').forEach((b) => (b.onclick = () => go(b.dataset.v!)));
$('#themeBtn').onclick = () => {
  data.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  save();
  applyTheme();
};
$('#suitBtn').onclick = () => {
  data.four = !data.four;
  save();
  applyTheme();
};
applyTheme();
initTable();
initSystem();

// Keep a copy on the device so the app opens without internet after the first visit.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').then(() => {
    window.setTimeout(async () => {
      const reg = await navigator.serviceWorker.ready;
      const urls = performance
        .getEntriesByType('resource')
        .map((r) => r.name)
        .filter((u) => u.startsWith(location.origin));
      reg.active?.postMessage({ cache: [location.href, 'how-to-use.html', ...urls] });
    }, 5000);
  }).catch(() => {
    // no offline copy in this browser; the app still works online
  });
}
