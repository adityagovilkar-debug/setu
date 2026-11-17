(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=`CDHS`,t=`CDHSN`,n=[`♣`,`♦`,`♥`,`♠`],r=[`clubs`,`diamonds`,`hearts`,`spades`],i=`23456789TJQKA`,a=e=>(e+2)%4,o=e=>e%2;function s(e){let t=e>>>0;return()=>{t=t+1831565813>>>0;let e=Math.imul(t^t>>>15,1|t);return e=e+Math.imul(e^e>>>7,61|e)^e,((e^e>>>14)>>>0)/4294967296}}function c(e){let t=Array.from({length:52},(e,t)=>t);for(let n=51;n>0;n--){let r=Math.floor(e()*(n+1)),i=t[n];t[n]=t[r],t[r]=i}let n=[];for(let e=0;e<4;e++){let r=[[],[],[],[]];for(let n of t.slice(e*13,e*13+13))r[Math.floor(n/13)].push(n%13);for(let e of r)e.sort((e,t)=>t-e);n.push(r)}return n}var l=[0,0,0,0,0,0,0,0,0,1,2,3,4],u=new WeakMap;function d(e){let t=u.get(e);if(t)return t;let n=0,r=0,i=0,a=e.map(e=>e.length);for(let t of e){for(let e of t)n+=l[e];t.length>4&&(r+=t.length-4),t.length<3&&(i+=3-t.length)}let o=[...a].sort((e,t)=>t-e).join(``),s=o===`4333`||o===`4432`||o===`5332`,c={hcp:n,len:a,bal:s,semibal:s||o===`5422`||o===`6322`,pts:n+r,sup:n+i};return u.set(e,c),c}function f(e,t){let n=e[t];return n.length?n[0]===12||n.includes(11)&&n.length>=2||n.includes(10)&&n.length>=3?!0:n.includes(9)&&n.length>=4:!1}function p(e,t){let n=e[t].filter(e=>e>=10).length,r=e[t].filter(e=>e>=8).length;return n>=2||r>=3}var m=e=>e.filter(e=>e[0]===12).length,h=(e,t)=>m(e)+ +!!e[t].includes(11),ee=(e,t)=>e[t].includes(10),g=(e,t=document)=>t.querySelector(e),_=(e,t=document)=>Array.from(t.querySelectorAll(e)),v=e=>e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`),y=t=>`<span class="s${e[t]}">${n[t]}</span>`;function b(t){return t===`P`?`Pass`:t===`X`?`Dbl`:t===`XX`?`Rdbl`:t[1]===`N`?t[0]+`NT`:t[0]+y(e.indexOf(t[1]))}function x(e){return v(e).replace(/[♣♦♥♠]/g,e=>y(n.indexOf(e)))}function te(t,r){let a=`23456789TJQKA`[r]===`T`?`10`:i[r];return`<div class="card s${e[t]}">${a}<span>${n[t]}</span></div>`}function ne(e){let t=``;for(let n of[3,2,1,0])for(let r of e[n])t+=te(n,r);return t}function re(e){return[3,2,1,0].map(t=>`${y(t)} ${e[t].length?e[t].map(e=>`23456789TJQKA`[e]===`T`?`10`:i[e]).join(` `):`—`}`).join(`<br>`)}function S(e){let t=[],[n,r]=e.hcp;(n>0||r<30)&&t.push(r>=30?`${n}+ points`:n===r?`${n} points`:`${n}–${r} points`);for(let n of[3,2,1,0])e.lenMin[n]>=3?t.push(`${e.lenMin[n]}+ ${y(n)}`):e.lenMax[n]<=2&&t.push(`at most ${e.lenMax[n]} ${y(n)}`);return t.length?t.join(` · `):`Nothing yet`}var C=0;function w(e){let t=g(`#toast`);t.textContent=e,t.classList.add(`on`),clearTimeout(C),C=window.setTimeout(()=>t.classList.remove(`on`),3200)}var T=e=>e!==`P`&&e!==`X`&&e!==`XX`,E=e=>Number(e[0]),D=e=>t.indexOf(e[1]),O=e=>(E(e)-1)*5+D(e),k=(e,n)=>`${e}${t[n]}`,A=(e,t)=>(e.dealer+t)%4,j=e=>A(e,e.calls.length);function ie(e){for(let t=e.calls.length-1;t>=0;t--)if(T(e.calls[t]))return{idx:t,call:e.calls[t],seat:A(e,t)};return null}function M(e){for(let t=e.calls.length-1;t>=0;t--)if(e.calls[t]!==`P`)return{idx:t,call:e.calls[t],seat:A(e,t)};return null}function N(e,t){if(P(e))return!1;if(t===`P`)return!0;let n=j(e),r=M(e);if(t===`X`)return!!r&&T(r.call)&&o(r.seat)!==o(n);if(t===`XX`)return!!r&&r.call===`X`&&o(r.seat)!==o(n);let i=ie(e),a=E(t);return!(a>=1&&a<=7)||D(t)<0?!1:!i||O(t)>O(i.call)}function ae(e,t){let n=ie(e);if(!n)return 1;let r=E(n.call);return t>D(n.call)?r:r+1}function P(e){let t=e.calls.length;return t<4?!1:e.calls.every(e=>e===`P`)?!0:e.calls[t-1]===`P`&&e.calls[t-2]===`P`&&e.calls[t-3]===`P`}function F(e){let t=ie(e);if(!t)return null;let n=0;for(let r=t.idx+1;r<e.calls.length;r++)e.calls[r]===`X`&&(n=1),e.calls[r]===`XX`&&(n=2);let r=D(t.call),i=o(t.seat),a=t.seat;for(let n=0;n<=t.idx;n++){let t=e.calls[n];if(T(t)&&D(t)===r&&o(A(e,n))===i){a=A(e,n);break}}return{level:E(t.call),strain:r,dbl:n,declarer:a}}function I(e,t,n,r,i){let a=i-(e+6);if(a<0){let e=-a;if(!n)return-(r?100:50)*e;let t=0;for(let n=1;n<=e;n++)t+=r?n===1?200:300:n===1?100:n<=3?200:300;return-(n===2?2*t:t)}let o=t<=1?20:30,s=o*e+(t===4?10:0);s*=n===1?2:n===2?4:1;let c=s+(s>=100?r?500:300:50);return e===6&&(c+=r?750:500),e===7&&(c+=r?1500:1e3),n&&(c+=n===1?50:100),c+=n?(r?200:100)*a*(n===2?2:1):o*a,c}function oe(e){let t=(e-1)%16,n=[`-`,`NS`,`EW`,`B`,`NS`,`EW`,`B`,`-`,`EW`,`B`,`-`,`NS`,`B`,`-`,`NS`,`EW`][t];return{dealer:t%4,vulNS:n===`NS`||n===`B`,vulEW:n===`EW`||n===`B`}}var L=()=>({hcp:[0,37],lenMin:[0,0,0,0],lenMax:[13,13,13,13]}),R=`(oM|om|[CDHSMmXYZ])`,se=/^(hcp|pts|sup)\s*(\d+)(?:(\+)|-(\d+))?$/,z=RegExp(`^`+R+`(\\d+)(?:(\\+)|(-)(\\d+)?)?$`),ce=RegExp(`^`+R+`(>=|>)`+R+`$`),le=/^(!?)(bal|semibal|ph|pph|seat3|jump|nojump|anymaj4|nomaj4|min5|umaj4|tox|stopopp)$/,ue=RegExp(`^(!?)(good|stop)\\s+`+R+`$`);function de(e){let t;if(t=se.exec(e)){let e=Number(t[2]);return{k:`num`,what:t[1],lo:e,hi:t[3]?40:t[4]===void 0?e:Number(t[4])}}if(t=z.exec(e)){let e=Number(t[2]);return t[3]?{k:`len`,v:t[1],lo:e,hi:13}:t[4]?t[5]===void 0?{k:`len`,v:t[1],lo:0,hi:e}:{k:`len`,v:t[1],lo:e,hi:Number(t[5])}:{k:`len`,v:t[1],lo:e,hi:e}}if(t=ce.exec(e))return{k:`cmp`,a:t[1],op:t[2],b:t[3]};if(t=le.exec(e))return{k:`flag`,name:t[2],neg:t[1]===`!`};if(t=ue.exec(e))return{k:`flag`,name:t[2],arg:t[3],neg:t[1]===`!`};throw Error(`Cannot read the condition "${e}"`)}function fe(e){return e.split(`,`).map(e=>e.trim()).filter(Boolean).map(de)}var pe=/^\(?(P|X|XX|\*|[1-7](?:N|oM|om|[CDHSMmXYZ]))\)?$/;function me(e){let t=e.trim();if(!t||t===`open`)return[];let n=t.split(/\s+/);for(let e of n)if(!pe.test(e)||e.startsWith(`(`)!==e.endsWith(`)`))throw Error(`Cannot read the call "${e}"`);return n}var he=1;function ge(e){let t=[],n=``;for(let r of e.split(`
`)){let e=r.trim();if(e.startsWith(`# ====`)&&(n=e.replace(/^#\s*=+\s*/,``)),!e||e.startsWith(`#`))continue;let i=e.split(`|`).map(e=>e.trim());if(i.length<4)throw Error(`Bad rule line: ${e}`);let a={id:`b`+he++,ctx:me(i[0]),call:i[1],conds:fe(i[2]),text:i[3],force:0,own:!1,section:n};if(!pe.test(a.call)||a.call===`*`)throw Error(`Bad call in rule line: ${e}`);for(let t of(i[4]||``).split(/\s+/).filter(Boolean))if(t===`F`)a.force=1;else if(t===`GF`)a.force=2;else if(t.startsWith(`conv:`))a.conv=t.slice(5);else if(t.startsWith(`!conv:`))a.notConv=t.slice(6);else throw Error(`Unknown flag "${t}" in: ${e}`);t.push(a)}return t}function _e(e){return{id:e.id,ctx:me(e.after),call:e.call,conds:fe(e.conds),text:e.text,force:e.force,own:!0}}function ve(e,t){let n=0;for(;n<e.calls.length&&e.calls[n]===`P`;)n++;let r={tokens:[],ph:!1,pph:!1,seat3:!1,oppSuits:[],ownSuits:[]};for(let i=0;i<n;i++)A(e,i)===t&&(r.ph=!0),A(e,i)===a(t)&&(r.pph=!0);for(let i=n;i<e.calls.length;i++){let n=e.calls[i],a=o(A(e,i))===o(t);if(a?r.tokens.push(n):n!==`P`&&r.tokens.push(`(`+n+`)`),T(n)&&D(n)<4){let e=a?r.ownSuits:r.oppSuits;e.includes(D(n))||e.push(D(n))}}return r.seat3=n===2&&r.tokens.length===0,r}function B(t,n){if(t===`oM`)return n.M===void 0?void 0:5-n.M;if(t===`om`)return n.m===void 0?void 0:1-n.m;let r=e.indexOf(t);return r>=0?r:n[t]}function ye(e,t,n){let r=B(e,n);if(r!==void 0)return r===t;if(e===`oM`||e===`om`||e===`M`&&t<2||e===`m`&&t>1)return!1;for(let e in n)if(n[e]===t)return!1;return n[e]=t,!0}function be(t,n,r){if(t===`*`)return!0;if(t===`P`||t===`X`||t===`XX`||!T(n))return t===n;if(t[0]!==n[0])return!1;let i=t.slice(1);return i===`N`||n[1]===`N`?i===n[1]:ye(i,e.indexOf(n[1]),r)}function xe(e,t){if(e.length!==t.length)return null;let n={};for(let r=0;r<e.length;r++){let i=e[r],a=t[r],o=i[0]===`(`;if(o!==(a[0]===`(`)||!be(o?i.slice(1,-1):i,o?a.slice(1,-1):a,n))return null}return n}function Se(e,t){return e.length>=t.length&&xe(e.slice(0,t.length),t)!==null}function Ce(t,n,r){if(!T(t)||t[1]===`N`)return[{call:t,bind:n}];let i=t.slice(1),a=B(i,n);if(a!==void 0)return[{call:t[0]+e[a],bind:n}];let o=[];for(let a=0;a<4;a++){let s={...n};ye(i,a,s)&&o.push({call:t[0]+e[a],bind:s,len:r[a].length,idx:a})}return o.sort((e,t)=>t.len-e.len||t.idx-e.idx)}function we(e,t,n,r,i,a){let o=d(t);for(let s of e.conds)if(s.k===`num`){let e=o[s.what];if(e<s.lo||e>s.hi)return!1}else if(s.k===`len`){let e=B(s.v,n);if(e===void 0||o.len[e]<s.lo||o.len[e]>s.hi)return!1}else if(s.k===`cmp`){let e=B(s.a,n),t=B(s.b,n);if(e===void 0||t===void 0||(s.op===`>=`?o.len[e]<o.len[t]:o.len[e]<=o.len[t]))return!1}else{let e=!1,c=s.arg?B(s.arg,n):void 0;switch(s.name){case`bal`:e=o.bal;break;case`semibal`:e=o.semibal;break;case`ph`:e=r.ph;break;case`pph`:e=r.pph;break;case`seat3`:e=r.seat3;break;case`jump`:e=T(i)&&E(i)===ae(a,D(i))+1;break;case`nojump`:e=T(i)&&E(i)===ae(a,D(i));break;case`anymaj4`:e=o.len[2]>=4||o.len[3]>=4;break;case`nomaj4`:e=o.len[2]<4&&o.len[3]<4;break;case`min5`:e=o.len[0]>=5||o.len[1]>=5;break;case`umaj4`:{let t=[2,3].filter(e=>!r.ownSuits.includes(e)&&!r.oppSuits.includes(e));e=t.length>0&&t.every(e=>o.len[e]>=4);break}case`tox`:e=r.oppSuits.length>0&&[0,1,2,3].every(e=>r.oppSuits.includes(e)?o.len[e]<=2:o.len[e]>=3);break;case`stopopp`:e=r.oppSuits.length>0&&r.oppSuits.every(e=>f(t,e));break;case`good`:e=c!==void 0&&p(t,c);break;case`stop`:e=c!==void 0&&f(t,c)}if(e===s.neg)return!1}return!0}function Te(e,t,n){let r=L();for(let i of e.conds)if(i.k===`num`){let e=i.what===`hcp`?i.lo:Math.max(0,i.lo-(i.what===`pts`?3:4));r.hcp=[Math.max(r.hcp[0],e),Math.min(r.hcp[1],i.hi)]}else if(i.k===`len`){let e=B(i.v,t);e!==void 0&&(r.lenMin[e]=Math.max(r.lenMin[e],i.lo),r.lenMax[e]=Math.min(r.lenMax[e],i.hi))}else if(i.k===`flag`&&!i.neg){if(i.name===`bal`)for(let e=0;e<4;e++)r.lenMin[e]=Math.max(r.lenMin[e],2),r.lenMax[e]=Math.min(r.lenMax[e],5);if(i.name===`umaj4`)for(let e of[2,3])!n.ownSuits.includes(e)&&!n.oppSuits.includes(e)&&(r.lenMin[e]=Math.max(r.lenMin[e],4));if(i.name===`tox`)for(let e=0;e<4;e++)n.oppSuits.includes(e)?r.lenMax[e]=Math.min(r.lenMax[e],2):r.lenMin[e]=Math.max(r.lenMin[e],3)}return r}function Ee(e){let t=e[0];for(let n of e.slice(1)){t.hcp=[Math.min(t.hcp[0],n.hcp[0]),Math.max(t.hcp[1],n.hcp[1])];for(let e=0;e<4;e++)t.lenMin[e]=Math.min(t.lenMin[e],n.lenMin[e]),t.lenMax[e]=Math.max(t.lenMax[e],n.lenMax[e])}return t}var De={M:`the major`,oM:`the other major`,m:`the minor`,om:`the other minor`,X:`the suit`,Y:`their suit`,Z:`the new suit`},Oe=(e,t)=>t===void 0?`in `+(De[e]??e):r[t];function ke(e,t){return e.replace(/\{(oM|om|[MmXYZ])\}/g,(e,r)=>{let i=B(r,t);return i===void 0?De[r]:n[i]})}function Ae(e,t={}){let n=e=>{let n=B(e,t);return n===void 0?De[e]??e:r[n]},i=e=>Oe(e,B(e,t)),a=[];for(let t of e.conds)if(t.k===`num`){let e=t.what===`hcp`?`points`:t.what===`pts`?`points counting length`:`points counting shortness`;a.push(t.hi>=37?`${t.lo}+ ${e}`:t.lo===t.hi?`${t.lo} ${e}`:t.lo===0?`up to ${t.hi} ${e}`:`${t.lo}–${t.hi} ${e}`)}else if(t.k===`len`)a.push(t.hi>=13?`${t.lo}+ ${i(t.v)}`:t.lo===t.hi?`exactly ${t.lo} ${i(t.v)}`:t.lo===0?`at most ${t.hi} ${i(t.v)}`:`${t.lo}–${t.hi} ${i(t.v)}`);else if(t.k===`cmp`)a.push(`${n(t.a)} ${t.op===`>`?`longer than`:`at least as long as`} ${n(t.b)}`);else if(t.neg&&(t.name===`ph`||t.name===`pph`))continue;else{let e={bal:`balanced`,semibal:`balanced or nearly so`,ph:`a passed hand`,pph:`partner is a passed hand`,seat3:`third seat`,jump:`a jump`,nojump:`not a jump`,anymaj4:`a four-card major`,nomaj4:`no four-card major`,min5:`a five-card minor`,umaj4:`four cards in each unbid major`,tox:`short in their suit with support for the others`,stopopp:`a stopper in their suit`,good:`a good suit in ${n(t.arg??``)}`,stop:`a stopper in ${n(t.arg??``)}`};a.push((t.neg?`not `:``)+(e[t.name]??t.name))}return a.join(`, `)}var V=class{card;rules;byLen=new Map;constructor(e,t){this.card=e;let n=[];for(let t of e.own)try{n.push(_e(t))}catch{}let r=t.filter(t=>(!t.conv||e.conv[t.conv])&&(!t.notConv||!e.conv[t.notConv]));this.rules=[...n,...r];for(let e of this.rules){let t=this.byLen.get(e.ctx.length);t?t.push(e):this.byLen.set(e.ctx.length,[e])}}matching(e){let t=[];for(let n of this.byLen.get(e.tokens.length)??[]){let r=xe(n.ctx,e.tokens);r&&t.push({rule:n,bind:r})}return t}covers(e,t){return this.matching(ve(e,t)).length>0}ownMatches(e,t,n){let r=ve(e,t),i=[];for(let t of this.matching(r))if(t.rule.own){for(let a of Ce(t.rule.call,t.bind,n))if(N(e,a.call)&&we(t.rule,n,a.bind,r,a.call,e)){i.push({rule:t.rule,call:a.call});break}}return i}find(e,t,n){let r=ve(e,t);for(let t of this.matching(r))for(let i of Ce(t.rule.call,t.bind,n))if(N(e,i.call)&&we(t.rule,n,i.bind,r,i.call,e))return{rule:t.rule,call:i.call,bind:i.bind};return null}explain(e,t,n){let r=ve(e,t),i=[],a=[],o=0;for(let t of this.matching(r)){let s={...t.bind};if(!be(t.rule.call,n,s))continue;let c=t.rule.conds.filter(e=>e.k===`flag`&&(e.name===`jump`||e.name===`nojump`));(!c.length||we({...t.rule,conds:c},[[],[],[],[]],s,r,n,e))&&(i.push({rule:t.rule,bind:s}),a.push(Te(t.rule,s,r)),t.rule.force>o&&(o=t.rule.force))}return{matches:i,shows:a.length?Ee(a):null,force:o}}},H=[{id:`stayman`,name:`Stayman`,on:!0,blurb:`2♣ over 1NT (3♣ over 2NT) asks for a four-card major.`},{id:`transfers`,name:`Jacoby transfers`,on:!0,blurb:`Over 1NT, 2♦ shows hearts and 2♥ shows spades.`},{id:`forcing1nt`,name:`Forcing 1NT`,on:!0,blurb:`1NT over a major is forcing. Off = semi-forcing: opener may pass a balanced minimum.`},{id:`jacoby2nt`,name:`Jacoby 2NT`,on:!0,blurb:`2NT over a major: four-card support, game forcing.`},{id:`bergen`,name:`Bergen raises`,on:!1,blurb:`3♣ and 3♦ over a major show four trumps; 3 of the major is weak.`},{id:`drury`,name:`Reverse Drury`,on:!0,blurb:`2♣ by a passed hand over a major shows a fit and 10–12.`},{id:`nmf`,name:`New minor forcing`,on:!0,blurb:`After 1 minor – 1 major – 1NT, the other minor asks about the major.`},{id:`inverted`,name:`Inverted minors`,on:!1,blurb:`A single raise of a minor is strong; a jump raise is weak.`},{id:`negdbl`,name:`Negative doubles`,on:!0,blurb:`Double of an overcall shows the unbid majors, not penalty.`},{id:`michaels`,name:`Michaels cue bid`,on:!0,blurb:`Bidding their suit shows two five-card suits.`},{id:`unusual`,name:`Unusual 2NT`,on:!0,blurb:`A jump to 2NT over their opening shows the two lowest unbid suits.`},{id:`rkcb`,name:`Roman Key Card 1430`,on:!0,blurb:`4NT asks for the five key cards. Off = plain Blackwood (aces only).`}];function U(e=`2/1 Game Force`){let t={};for(let e of H)t[e.id]=e.on;return{name:e,conv:t,own:[]}}var je=`
# ================= OPENING BIDS
open | 2C | hcp 22+ | Strong and artificial: 22 or more points, any shape | F
open | 2N | hcp 20-21, bal | 20–21 points, balanced
open | 1N | hcp 15-17, bal | 15–17 points, balanced. May include a five-card major
open | 1S | hcp 11-21, pts 13+, S5+, S>=H, S>=D, S>=C | Five or more spades, 12–21 points (11 with extra length)
open | 1H | hcp 11-21, pts 13+, H5+, H>=D, H>=C | Five or more hearts, 12–21 points (11 with extra length)
open | 1S | hcp 10-11, S5+, good S, seat3 | Light opening in third seat on a good five-card suit
open | 1H | hcp 10-11, H5+, good H, seat3 | Light opening in third seat on a good five-card suit
open | 1D | hcp 12-21, D4+, D>=C | Four or more diamonds, 12–21 points
open | 1D | hcp 12-21, D3, C2- | 12–21 points; only three diamonds when the shape is 4-4-3-2
open | 1C | hcp 12-21, C3+ | Three or more clubs, 12–21 points
open | 1D | hcp 11, pts 13+, D5+, D>=C | Diamonds, 11 points with extra length
open | 1C | hcp 11, pts 13+, C5+ | Clubs, 11 points with extra length
open | 2S | hcp 5-10, S6, good S | Weak two: a good six-card suit, 5–10 points
open | 2H | hcp 5-10, H6, good H | Weak two: a good six-card suit, 5–10 points
open | 2D | hcp 5-10, D6, good D | Weak two: a good six-card suit, 5–10 points
open | 3X | hcp 5-10, X7+, good X | Pre-empt: a seven-card suit, 5–10 points
open | P | hcp 0-11 | Not enough to open

# ================= OUR 1NT OPENING
1N | 2H | S5+, S>=H | Transfer: five or more spades, any strength | F conv:transfers
1N | 2D | H5+ | Transfer: five or more hearts, any strength | F conv:transfers
1N | 2C | hcp 8+, anymaj4 | Stayman: asks for a four-card major, 8+ points | F conv:stayman
1N | 3S | S5+, hcp 10+ | Five or more spades, forcing to game | GF !conv:transfers
1N | 3H | H5+, hcp 10+ | Five or more hearts, forcing to game | GF !conv:transfers
1N | 2S | S5+, hcp 0-7 | To play | !conv:transfers
1N | 2H | H5+, hcp 0-7 | To play | !conv:transfers
1N | 6N | hcp 18-19 | To play
1N | 4N | hcp 16-17 | Invites slam: 16–17 points, no major to show
1N | 3N | hcp 10-15 | To play
1N | 2N | hcp 8-9 | Invites game: 8–9 points
1N | P | hcp 0-7 | Nothing to add
1N 3M | 4M | M3+ | Three-card support | !conv:transfers
1N 3M | 3N | | No fit | !conv:transfers
1N 2C | 2H | H4+ | Four hearts (may also hold four spades)
1N 2C | 2S | S4+ | Four spades, not four hearts
1N 2C | 2D | | No four-card major
1N 2D | 3H | H4+, hcp 17 | Super-accept: four hearts and a maximum | conv:transfers
1N 2D | 2H | | Completes the transfer | conv:transfers
1N 2H | 3S | S4+, hcp 17 | Super-accept: four spades and a maximum | conv:transfers
1N 2H | 2S | | Completes the transfer | conv:transfers
1N 2C 2D | 6N | hcp 18+ | To play
1N 2C 2D | 4N | hcp 16-17 | Invites slam
1N 2C 2D | 3N | hcp 10-15 | To play
1N 2C 2D | 2N | hcp 8-9 | Invites game, no major fit
1N 2C 2M | 4M | M4+, hcp 10-15 | To play: a 4-4 fit
1N 2C 2M | 3M | M4+, hcp 8-9 | Invites game with four-card support
1N 2C 2M | 3N | hcp 10-15, M3- | To play; holds four of the other major
1N 2C 2M | 2N | hcp 8-9, M3- | Invites game; holds four of the other major
1N 2C 2D 2N | 3N | hcp 16-17 | Accepts
1N 2C 2D 2N | P | | Declines
1N 2C 2H 2N | 4S | S4+, hcp 16-17 | Accepts in the spade fit
1N 2C 2H 2N | 3S | S4+ | Declines, but shows four spades
1N 2C 2H 2N | 3N | hcp 16-17 | Accepts
1N 2C 2H 2N | P | | Declines
1N 2C 2S 2N | 3N | hcp 16-17 | Accepts
1N 2C 2S 2N | P | | Declines
1N 2C 2H 3N | 4S | S4+ | Corrects to the spade fit
1N 2C 2H 3N | P | | To play
1N 2C 2M 3M | 4M | hcp 16-17 | Accepts
1N 2C 2M 3M | P | | Declines
1N 2N | 3N | hcp 16-17 | Accepts
1N 2N | P | | Declines
1N 4N | 6N | hcp 17 | Accepts
1N 4N | P | | Declines
1N 2D 2H | P | hcp 0-7 | To play
1N 2D 2H | 3H | hcp 8-9, H6+ | Invites game with six hearts
1N 2D 2H | 2N | hcp 8-9 | Invites game with exactly five hearts
1N 2D 2H | 4H | hcp 10-15, H6+ | To play
1N 2D 2H | 3N | hcp 10-15 | Choice of games: exactly five hearts
1N 2H 2S | P | hcp 0-7 | To play
1N 2H 2S | 3S | hcp 8-9, S6+ | Invites game with six spades
1N 2H 2S | 2N | hcp 8-9 | Invites game with exactly five spades
1N 2H 2S | 4S | hcp 10-15, S6+ | To play
1N 2H 2S | 3N | hcp 10-15 | Choice of games: exactly five spades
1N 2D 3H | 4H | hcp 6+ | Accepts
1N 2D 3H | P | | Too weak for game
1N 2H 3S | 4S | hcp 6+ | Accepts
1N 2H 3S | P | | Too weak for game
1N 2D 2H 2N | 4H | H3+, hcp 16-17 | Accepts with three hearts
1N 2D 2H 2N | 3H | H3+ | Declines, prefers hearts
1N 2D 2H 2N | 3N | hcp 16-17 | Accepts with two hearts
1N 2D 2H 2N | P | | Declines
1N 2D 2H 3N | 4H | H3+ | Prefers the 5-3 heart fit
1N 2D 2H 3N | P | | Only two hearts
1N 2D 2H 3H | 4H | hcp 16-17 | Accepts
1N 2D 2H 3H | P | | Declines
1N 2H 2S 2N | 4S | S3+, hcp 16-17 | Accepts with three spades
1N 2H 2S 2N | 3S | S3+ | Declines, prefers spades
1N 2H 2S 2N | 3N | hcp 16-17 | Accepts with two spades
1N 2H 2S 2N | P | | Declines
1N 2H 2S 3N | 4S | S3+ | Prefers the 5-3 spade fit
1N 2H 2S 3N | P | | Only two spades
1N 2H 2S 3S | 4S | hcp 16-17 | Accepts
1N 2H 2S 3S | P | | Declines

# ================= OUR 2NT AND 2♣ OPENINGS
2N | 3H | S5+, S>=H | Transfer to spades | F conv:transfers
2N | 3D | H5+ | Transfer to hearts | F conv:transfers
2N | 3C | hcp 4+, anymaj4 | Stayman | F conv:stayman
2N | 4N | hcp 11-12 | Invites slam
2N | 3N | hcp 4-10 | To play
2N | P | hcp 0-3 | Nothing to add
2N 3C | 3H | H4+ | Four hearts
2N 3C | 3S | S4+ | Four spades
2N 3C | 3D | | No four-card major
2N 3C 3D | 3N | | To play
2N 3C 3M | 4M | M4+ | To play: a 4-4 fit
2N 3C 3M | 3N | | To play; holds the other major
2N 3C 3H 3N | 4S | S4+ | Corrects to the spade fit
2N 3C 3H 3N | P | | To play
2N 3D | 3H | | Completes the transfer | conv:transfers
2N 3H | 3S | | Completes the transfer | conv:transfers
2N 3D 3H | 4H | H6+ | To play
2N 3D 3H | 3N | hcp 4+ | Choice of games
2N 3D 3H | P | | To play
2N 3H 3S | 4S | S6+ | To play
2N 3H 3S | 3N | hcp 4+ | Choice of games
2N 3H 3S | P | | To play
2N 3D 3H 3N | 4H | H3+ | Prefers the heart fit
2N 3D 3H 3N | P | | Only two hearts
2N 3H 3S 3N | 4S | S3+ | Prefers the spade fit
2N 3H 3S 3N | P | | Only two spades
2C | 2D | | Waiting: says nothing about the hand yet | F
2C 2D | 3N | hcp 25-27, bal | 25–27 points, balanced
2C 2D | 2N | hcp 22-24, bal | 22–24 points, balanced
2C 2D | 2S | S5+, S>=H | Five or more spades, forcing to game | GF
2C 2D | 2H | H5+ | Five or more hearts, forcing to game | GF
2C 2D | 3D | D5+, D>=C | Five or more diamonds, forcing to game | GF
2C 2D | 3C | C5+ | Five or more clubs, forcing to game | GF
2C 2D | 2N | | 22+ points, no five-card suit
2C 2D 2N | 3N | hcp 3-10 | To play
2C 2D 2N | P | hcp 0-2 | Nothing at all

# ================= PARTNER OPENS 1♥ OR 1♠
1M | 2N | M4+, hcp 13+, !ph | Jacoby 2NT: four-card support, forcing to game | GF conv:jacoby2nt
1M | 2C | M3+, sup 10+, hcp 0-12, ph | Drury: a passed hand with a fit and 10–12 | F conv:drury
1M | 4M | M5+, hcp 0-9 | Weak raise to game on five trumps
1M | 3D | M4+, sup 10+, hcp 0-12 | Bergen: four trumps, 10–12 | F conv:bergen
1M | 3C | M4+, sup 7-9 | Bergen: four trumps, 7–9 | F conv:bergen
1M | 3M | M4+, hcp 0-6 | Bergen: four trumps and a weak hand | conv:bergen
1M | 3M | M4+, sup 10+, hcp 0-12 | Limit raise: four trumps, 10–12 | !conv:bergen
1M | 2M | M3+, sup 6-9 | Single raise: three or more trumps, 6–9
1S | 2H | H5+, hcp 13+, !ph | Five or more hearts, forcing to game | GF
1M | 2D | D5+, hcp 13+, !ph | Five or more diamonds, forcing to game | GF
1M | 2C | C5+, hcp 13+, !ph | Five or more clubs, forcing to game | GF
1H | 1S | S4+, hcp 6+ | Four or more spades, 6+ points | F
1M | 2D | D4+, D>C, hcp 13+, !ph | Diamonds, forcing to game | GF
1M | 2C | hcp 13+, !ph | Forcing to game: clubs, or a balanced hand with nothing better to bid | GF
1M | 1N | hcp 6-12 | Forcing for one round: 6–12 points, no better bid | F conv:forcing1nt
1M | 1N | hcp 6-12 | Semi-forcing: 6–12 points. Opener may pass with a balanced minimum | !conv:forcing1nt
1M | P | hcp 0-5 | Too weak to respond
1M 2M | 4M | pts 19+ | To play
1M 2M | 3M | pts 16-18 | Invites game
1M 2M | P | pts 0-15 | Content
1M 2M 3M | 4M | sup 8+ | Accepts
1M 2M 3M | P | | Declines
1M 3M | 4M | pts 14+ | Accepts the limit raise | !conv:bergen
1M 3M | 4M | pts 19+ | To play | conv:bergen
1M 3M | P | | Content
1M 3C | 4M | pts 17+ | To play | conv:bergen
1M 3C | 3M | | Sign-off | conv:bergen
1M 3C 3M | P | | As asked | conv:bergen
1M 3D | 4M | pts 14+ | Accepts | conv:bergen
1M 3D | 3M | | Declines | conv:bergen
1M 3D 3M | P | | As asked | conv:bergen
1M 4M | P | | Content
1M 2C | 4M | hcp 15+, pph | Drury reply: to play | conv:drury
1M 2C | 3M | hcp 13-14, pph | Drury reply: a sound opening, invites game | conv:drury
1M 2C | 2M | pph | Drury reply: minimum or light opening | conv:drury
1M 2C 2M | P | ph | Content | conv:drury
1M 2C 3M | 4M | sup 11+, ph | Accepts | conv:drury
1M 2C 3M | P | ph | Declines | conv:drury
1M 2N | 3C | C1- | Shortness: a singleton or void in clubs | conv:jacoby2nt
1M 2N | 3D | D1- | Shortness: a singleton or void in diamonds | conv:jacoby2nt
1M 2N | 3oM | oM1- | Shortness: a singleton or void in the other major | conv:jacoby2nt
1M 2N | 3M | hcp 18+ | Strong hand, no shortness | conv:jacoby2nt
1M 2N | 3N | hcp 15-17 | Medium hand, no shortness | conv:jacoby2nt
1M 2N | 4M | | Minimum, no shortness | conv:jacoby2nt
1M 1N | P | hcp 11-13, bal | Balanced minimum: passes the semi-forcing 1NT | !conv:forcing1nt
1M 1N | 4M | M6+, hcp 19+ | To play
1M 1N | 3M | M6+, hcp 16-18 | Six-card suit, invites game
1M 1N | 2M | M6+, hcp 10-15 | Six-card suit, minimum
1S 1N | 3H | H4+, hcp 19+ | Jump shift: forcing to game | GF
1M 1N | 3D | D4+, hcp 19+ | Jump shift: forcing to game | GF
1M 1N | 3C | C4+, hcp 19+ | Jump shift: forcing to game | GF
1H 1N | 2S | S4+, hcp 17+ | Reverse: four spades and extra strength | F
1M 1N | 2N | hcp 18-19, bal | 18–19 points, balanced
1S 1N | 2H | H4+, hcp 10-18 | Four or more hearts
1M 1N | 2D | D4+, D>C, hcp 10-18 | Four or more diamonds
1M 1N | 2C | C3+, hcp 10-18 | Clubs; may be only three
1M 1N | 2D | D3+, hcp 10-18 | Diamonds; may be only three
1M 1N | 2M | hcp 10-15 | Nothing better to bid
1M 1N 2m | 3M | M3+, sup 10+ | Three-card limit raise
1M 1N 2m | 2N | hcp 10-12 | Invites game, no fit
1M 1N 2m | 2M | M2 | Preference with a doubleton
1M 1N 2m | P | m4+ | Prefers the minor
1M 1N 2m | 2Z | Z6+ | Own six-card suit, weak
1M 1N 2m | 2M | | Preference
1S 1N 2H | 3S | S3+, sup 10+ | Three-card limit raise
1S 1N 2H | 3H | H4+, hcp 10-12 | Invites game in hearts
1S 1N 2H | 2N | hcp 10-12 | Invites game, no fit
1S 1N 2H | P | H3+, S1- | Prefers hearts
1S 1N 2H | 2S | | Preference
1M 1N 2M | 3M | M2+, hcp 10-12 | Invites game
1M 1N 2M | P | | Content
1M 1N 3M | 4M | hcp 8+ | Accepts
1M 1N 3M | P | | Declines
1M 1N 2N | 3N | hcp 7+ | Accepts
1M 1N 2N | P | | Declines
1S 2H | 3H | H3+, !pph | Heart support
1M 2m | 3m | m4+, !pph | Support for partner's minor
1S 2C | 2H | H4+, !pph | Four or more hearts
1M 2C | 2D | D4+, !pph | Four or more diamonds
1S 2D | 2H | H4+, !pph | Four or more hearts
1H 2m | 2S | S4+, !pph | Four spades
1M 2X | 2N | bal, hcp 11-14, !pph | Balanced minimum
1M 2X | 3N | bal, hcp 15-17, !pph | Balanced, 15–17
1M 2X | 2N | bal, hcp 18+, !pph | Balanced, 18–19
1S 2H | 3D | D4+, hcp 15+, !pph | Diamonds, extra strength
1M 2X | 3C | C4+, hcp 15+, C>D, !pph | Clubs, extra strength
1M 2X | 2M | !pph | Five or more; says nothing new and does not promise six
1M 2X * | 3M | M3+, hcp 16+, !ph | Sets trumps with interest in slam | F
1M 2X * | 4M | M3+, !ph | Fast arrival: support, but a minimum game force

1H 1S | 4S | S4+, pts 19+ | Four-card support, to play
1H 1S | 3S | S4+, pts 16-18 | Four-card support, invites game
1H 1S | 2S | S4+, hcp 10-15 | Four-card support, minimum
1H 1S | 3H | H6+, hcp 16-18 | Six-card suit, invites game
1H 1S | 3D | D4+, hcp 19+ | Jump shift: forcing to game | GF
1H 1S | 3C | C4+, hcp 19+ | Jump shift: forcing to game | GF
1H 1S | 2N | hcp 18-19, bal | 18–19 points, balanced
1H 1S | 1N | hcp 10-14, bal | Minimum, balanced
1H 1S | 2H | H6+, hcp 10-15 | Six-card suit, minimum
1H 1S | 2D | D4+, D>C, hcp 10-18 | Four or more diamonds
1H 1S | 2C | C4+, hcp 10-18 | Four or more clubs
1H 1S | 2S | S3, hcp 10-15 | Three-card support, minimum
1H 1S | 2H | hcp 10-15 | Minimum, nothing better
1H 1S | 2N | | Extra strength, nothing better
1H 1S 1N | 4S | S6+, hcp 12-17 | To play
1H 1S 1N | 3S | S6+, hcp 10-11 | Invites game with a six-card suit
1H 1S 1N | 2S | S5+, hcp 0-10 | To play
1H 1S 1N | 2H | H3+, hcp 0-10 | Preference for hearts
1H 1S 1N | 3H | H3+, hcp 11-12 | Invites game in hearts
1H 1S 1N | 4H | H3+, hcp 13-17 | To play
1H 1S 1N | 3N | hcp 13-17 | To play
1H 1S 1N | 2N | hcp 11-12 | Invites game
1H 1S 1N | P | | Content
1H 1S 1N 2N | 3N | hcp 14 | Accepts
1H 1S 1N 2N | P | | Declines
1H 1S 2N | 3N | | To play

# ================= PARTNER OPENS 1♣ OR 1♦
1m | 1S | S5+, S>=H, hcp 6+ | Four or more spades, 6+ points | F
1m | 1H | H4+, hcp 6+ | Four or more hearts, 6+ points | F
1m | 1S | S4+, hcp 6+ | Four or more spades, 6+ points | F
1C | 1D | D4+, hcp 6+ | Four or more diamonds, 6+ points, no four-card major | F
1D | 2C | C5+, hcp 13+, !ph | Five or more clubs, forcing to game | GF
1D | 2D | D4+, hcp 10+ | Inverted raise: a fit and 10+ points | F conv:inverted
1C | 2C | C5+, hcp 10+ | Inverted raise: a fit and 10+ points | F conv:inverted
1m | 3m | m5+, hcp 0-9 | Inverted raise: a fit and a weak hand | conv:inverted
1m | 3N | hcp 13-15, bal | 13–15 points, balanced, no major
1m | 2N | hcp 11-12, bal | 11–12 points, balanced, no major
1m | 3m | m5+, hcp 10-12 | Limit raise: five-card support, 10–12 | !conv:inverted
1D | 2D | D4+, hcp 6-9 | Single raise, 6–9 | !conv:inverted
1C | 2C | C5+, hcp 6-9 | Single raise, 6–9 | !conv:inverted
1m | 1N | hcp 6-10 | 6–10 points, no major
1m | 2N | hcp 11-12 | 11–12 points, no major
1m | 3N | hcp 13-17 | To play
1m | P | hcp 0-5 | Too weak to respond
1m 1M | 4M | M4+, pts 19+ | Four-card support, to play
1m 1M | 3M | M4+, pts 16-18 | Four-card support, invites game
1m 1M | 2M | M4+, hcp 11-15 | Four-card support, minimum
1m 1H | 1S | S4+, hcp 11-18 | Four spades
1m 1M | 2N | hcp 18-19, bal | 18–19 points, balanced
1m 1M | 1N | hcp 12-14, bal | 12–14 points, balanced
1C 1M | 2D | D4+, C5+, hcp 17+ | Reverse: extra strength, clubs longer than diamonds | F
1m 1S | 2H | H4+, m5+, hcp 17+ | Reverse: extra strength | F
1m 1M | 3m | m6+, hcp 16-18 | Six-card suit, invites game
1D 1M | 2C | C4+, hcp 11-18 | Four or more clubs
1m 1M | 2m | m5+, hcp 11-15 | Rebids the suit: minimum
1m 1M | 1N | hcp 11-15 | Minimum, nothing better
1m 1M | 2N | | Extra strength, nothing better
1C 1D | 1H | H4+, hcp 11-18 | Four hearts
1C 1D | 1S | S4+, hcp 11-18 | Four spades
1C 1D | 2N | hcp 18-19, bal | 18–19 points, balanced
1C 1D | 1N | hcp 12-14, bal | 12–14 points, balanced
1C 1D | 3D | D4+, pts 16-18 | Four-card support, invites
1C 1D | 2D | D4+, hcp 11-15 | Four-card support
1C 1D | 2C | C5+, hcp 11-15 | Rebids the suit
1C 1D | 1N | hcp 11-15 | Minimum, nothing better
1C 1D | 2N | | Extra strength, nothing better
1m 1M 1N | 2om | M5+, hcp 11+ | New minor forcing: five-card major, invitational or better | F conv:nmf
1m 1M 1N | 4M | M6+, hcp 12-17 | To play
1m 1M 1N | 3M | M6+, hcp 10-11 | Invites game with a six-card suit
1m 1M 1N | 2M | M5+, hcp 0-10 | To play
1m 1M 1N | 3N | hcp 13-17 | To play
1m 1M 1N | 2N | hcp 11-12 | Invites game
1m 1M 1N | P | | Content
1m 1M 1N 2om | 3M | M3+, hcp 14 | Three-card support, maximum | conv:nmf
1m 1M 1N 2om | 2M | M3+ | Three-card support, minimum | conv:nmf
1m 1M 1N 2om | 2oM | oM4+ | Four cards in the other major | conv:nmf
1m 1M 1N 2om | 2N | | No help in the majors | conv:nmf
1m 1M 1N 2N | 3N | hcp 14 | Accepts
1m 1M 1N 2N | P | | Declines
1m 1M 2N | 3N | | To play
1m 1N | 3N | hcp 19-21 | To play
1m 1N | 2N | hcp 17-18 | Invites game
1m 1N | 2m | m6+, hcp 11-16 | Six-card suit
1m 1N | P | hcp 11-16 | Content
1m 1N 2N | 3N | hcp 8+ | Accepts
1m 1N 2N | P | | Declines
1m 2N | 3N | hcp 14+ | Accepts
1m 2N | P | | Declines
1m 3N | P | | Content
1m 3m | 3N | hcp 14+, bal | To play | !conv:inverted
1m 3m | P | | Content
1m 2m | 3N | hcp 18-19, bal | To play | !conv:inverted
1m 2m | P | | Content | !conv:inverted

# ================= OUR WEAK TWOS AND PRE-EMPTS
2M | 4M | M3+, hcp 14+ | To play
2M | 4M | M4+ | Raises the pre-empt
2M | 3M | M3+ | Raises the pre-empt; not an invitation
2M | 2N | hcp 16+ | Asks about the weak two | F
2M | P | | Content
2M 2N | 4M | hcp 8-10 | Maximum
2M 2N | 3M | | Minimum
2M 2N 3M | 4M | hcp 18+ | To play
2M 2N 3M | P | | Content
2D | 3N | hcp 16+, bal | To play
2D | 3D | D3+ | Raises the pre-empt
2D | P | | Content
3M | 4M | M2+, hcp 14+ | To play
3X | P | | Content

# ================= THEY INTERFERE AFTER WE OPEN
1X (X) | XX | hcp 10+ | 10 or more points | F
1M (X) | 3M | M4+, hcp 0-9 | Pre-emptive raise
1M (X) | 2M | M3+, hcp 5-9 | Single raise
1X (X) | 1Z | Z4+, hcp 6+ | Four or more cards, 6+ points | F
1X (X) | 1N | hcp 6-9 | 6–9 points
1X (X) | P | | Nothing to say
1X (1N) | X | hcp 10+ | Penalty: 10 or more points
1X (1N) | P | | Nothing to say
1M (1Y) | 4M | M5+, hcp 0-9 | Weak raise to game
1M (1Y) | 3M | M4+, sup 10+, hcp 0-12 | Limit raise
1M (1Y) | 2M | M3+, sup 6-10 | Single raise
1M (1Y) | 2Z | Z5+, hcp 10+, nojump | New suit: five cards, 10+ points. Forcing one round, not to game | F
1M (1Y) | 3N | hcp 13-15, stopopp | To play
1M (1Y) | 2N | hcp 11-12, stopopp | Invites game with a stopper
1M (1Y) | 1N | hcp 7-10, stopopp | 7–10 points with a stopper
1M (1Y) | P | | Nothing to say
1M (2Y) | 4M | M5+, hcp 0-9 | Weak raise to game
1M (2Y) | 3M | M4+, sup 10+, hcp 0-12 | Limit raise
1M (2Y) | 2M | M3+, sup 6-10 | Single raise
1M (2Y) | 3M | M3+, sup 8-10 | Competitive raise
1M (2Y) | X | hcp 8+, umaj4 | Negative double: four cards in the other major | F conv:negdbl
1M (2Y) | 2Z | Z5+, hcp 10+, nojump | New suit: five cards, 10+ points. Forcing one round | F
1M (2Y) | 3N | hcp 13-15, stopopp | To play
1M (2Y) | 2N | hcp 11-12, stopopp | Invites game with a stopper
1M (2Y) | P | | Nothing to say
1m (1Y) | 1Z | Z5+, hcp 6+ | Five or more cards, 6+ points | F
1m (1Y) | X | hcp 6+, umaj4 | Negative double: four cards in each unbid major | F conv:negdbl
1m (1Y) | 1Z | Z4+, hcp 6+ | Four or more cards, 6+ points | F
1m (1Y) | 2Z | Z5+, hcp 10+, nojump | New suit: five cards, 10+ points. Forcing one round | F
1m (1Y) | 3N | hcp 13-15, stopopp | To play
1m (1Y) | 2N | hcp 11-12, stopopp | Invites game with a stopper
1m (1Y) | 1N | hcp 7-10, stopopp | 7–10 points with a stopper
1m (1Y) | 3m | m5+, hcp 10-12 | Limit raise
1m (1Y) | 2m | m5+, hcp 6-9 | Single raise
1m (1Y) | P | | Nothing to say
1m (2Y) | X | hcp 8+, umaj4 | Negative double: four cards in each unbid major | F conv:negdbl
1m (2Y) | 2Z | Z5+, hcp 10+, nojump | New suit: five cards, 10+ points. Forcing one round | F
1m (2Y) | 3N | hcp 13-15, stopopp | To play
1m (2Y) | 2N | hcp 11-12, stopopp | Invites game with a stopper
1m (2Y) | 3m | m5+, hcp 8-11 | Competitive raise
1m (2Y) | P | | Nothing to say

# ================= THEY OPEN
(1X) | 1N | hcp 15-18, bal, stop X | 15–18 points, balanced, with a stopper in their suit
(1m) | 2m | H5+, S5+, hcp 6+ | Michaels: at least five cards in each major | F conv:michaels
(1M) | 2M | oM5+, min5, hcp 6+ | Michaels: five of the other major and a five-card minor | F conv:michaels
(1M) | 2N | C5+, D5+, hcp 6+ | Unusual: at least five cards in each minor | F conv:unusual
(1C) | 2N | D5+, H5+, hcp 6+ | Unusual: diamonds and hearts, at least 5-5 | F conv:unusual
(1D) | 2N | C5+, H5+, hcp 6+ | Unusual: clubs and hearts, at least 5-5 | F conv:unusual
(1X) | X | hcp 18+ | Double: too strong to overcall
(1X) | 1Z | Z5+, hcp 8-17 | Overcall: five or more cards, 8–17 points
(1X) | 2Z | Z6+, hcp 10-17, nojump | Overcall: a six-card suit, 10–17 points
(1X) | 2Z | Z5+, hcp 11-17, good Z, nojump | Overcall: a good five-card suit, 11–17 points
(1X) | 2Z | Z6, hcp 5-10, good Z, jump | Weak jump overcall: a good six-card suit
(1X) | 3Z | Z7+, hcp 5-10, jump | Pre-emptive jump overcall
(1X) | X | hcp 12+, tox | Takeout double: opening values, short in their suit, support for the rest | F
(1X) | P | | Nothing to say
(1X) 1Z | 3Z | Z3+, sup 11-13 | Invites game with support
(1X) 1Z | 2Z | Z3+, sup 6-10 | Single raise
(1X) 1Z | 2N | hcp 12-13, stop X | Invites game with a stopper
(1X) 1Z | 1N | hcp 8-11, stop X | 8–11 points with a stopper
(1X) 1Z | P | | Nothing to say
(1X) 2Z | 3N | hcp 13+, stop X | To play
(1X) 2Z | 3Z | Z3+, hcp 8-11 | Raise
(1X) 2Z | 2N | hcp 10-12, stop X | Invites game with a stopper
(1X) 2Z | P | | Nothing to say
(1X) X | 4M | M4+, hcp 12+ | To play
(1X) X | 3N | hcp 13+, stop X | To play
(1X) X | 2Z | Z4+, hcp 9-11, jump | Jump: invitational, 9–11 points
(1X) X | 3Z | Z4+, hcp 9-11, jump | Jump: invitational, 9–11 points
(1X) X | 2N | hcp 10-12, stop X | Invites game with a stopper
(1X) X | 1N | hcp 6-9, stop X | 6–9 points with a stopper
(1X) X | 1Z | nojump | Forced reply to the double: longest suit, 0–8 points
(1X) X | 2Z | nojump | Forced reply to the double: longest suit, 0–8 points
(1m) 2m | 2H | H>=S | Prefers hearts | conv:michaels
(1m) 2m | 2S | | Prefers spades | conv:michaels
(1M) 2M | 2oM | | Takes the major | conv:michaels
(1M) 2M | 3oM | | Takes the major | conv:michaels
(1M) 2N | 3C | C>=D | Prefers clubs | conv:unusual
(1M) 2N | 3D | | Prefers diamonds | conv:unusual
(1C) 2N | 3H | H>D | Prefers hearts | conv:unusual
(1C) 2N | 3D | | Prefers diamonds | conv:unusual
(1D) 2N | 3H | H>C | Prefers hearts | conv:unusual
(1D) 2N | 3C | | Prefers clubs | conv:unusual
(1X) P | 1N | hcp 11-14, bal, stop X | Balancing: 11–14 points, balanced
(1X) P | 1Z | Z5+, hcp 7-15 | Balancing overcall
(1X) P | 2Z | Z5+, hcp 9-15, nojump | Balancing overcall
(1X) P | X | hcp 9+, tox | Balancing takeout double | F
(1X) P | P | | Nothing to say
(2C) | P | | Stays out of their strong auction
(2X) | 2N | hcp 15-18, bal, stop X | 15–18 points, balanced, with a stopper
(2X) | 2Z | Z5+, hcp 12-17, good Z, nojump | Overcall: a good suit and opening values
(2X) | 3Z | Z5+, hcp 12-17, good Z, nojump | Overcall: a good suit and opening values
(2X) | X | hcp 13+, tox | Takeout double | F
(2X) | X | hcp 19+ | Double: a very strong hand | F
(2X) | P | | Nothing to say
(2X) X | 4M | M4+, hcp 11+ | To play
(2X) X | 3N | hcp 11+, stop X | To play
(2X) X | 2Z | nojump | Forced reply to the double: longest suit
(2X) X | 3Z | nojump | Forced reply to the double: longest suit
(3X) | 3N | hcp 16+, stop X | To play
(3X) | 3Z | Z6+, hcp 12+, nojump | Overcall: a long suit and opening values
(3X) | X | hcp 15+, tox | Takeout double | F
(3X) | P | | Nothing to say
(3X) X | 4M | M4+, hcp 8+ | To play
(3X) X | 3N | hcp 8+, stop X | To play
(3X) X | 3Z | nojump | Forced reply to the double: longest suit
(3X) X | 4Z | nojump | Forced reply to the double: longest suit
(1N) | 2Z | Z6+, hcp 9-14 | Natural overcall on a six-card suit
(1N) | P | | Nothing to say
`,Me=null;function W(){return Me||=ge(je),Me}var Ne=`setu.v1`;function Pe(){let e={card:U(`My 2/1 card`),versions:[],four:!1,theme:null,board:1,situation:`any`,log:[]};try{let t=localStorage.getItem(Ne);if(!t)return e;let n={...e,...JSON.parse(t)};for(let e of H)typeof n.card.conv[e.id]!=`boolean`&&(n.card.conv[e.id]=e.on);return Array.isArray(n.card.own)||(n.card.own=[]),n}catch{return e}}var G=Pe();function K(){try{localStorage.setItem(Ne,JSON.stringify(G))}catch{}}var Fe=null,Ie=null;function Le(){return Fe||=new V(G.card,W()),Fe}function Re(){return Ie||=new V(U(),W()),Ie}function ze(){Fe=null,K()}function Be(e,t,n){return{deal:e,auction:{dealer:t,calls:[]},metas:[],systems:n}}function Ve(e){let t=[L(),L(),L(),L()];for(let n of e.metas){if(!n.shows)continue;let e=t[n.seat],r=Math.max(e.hcp[0],n.shows.hcp[0]),i=Math.min(e.hcp[1],n.shows.hcp[1]);e.hcp=r<=i?[r,i]:[n.shows.hcp[0],n.shows.hcp[1]];for(let t=0;t<4;t++)e.lenMin[t]=Math.max(e.lenMin[t],n.shows.lenMin[t]),e.lenMax[t]=Math.min(e.lenMax[t],n.shows.lenMax[t])}return t}function He(e,t){for(let n=e.metas.length-1;n>=0;n--)if(e.metas[n].seat===t)return e.metas[n];return null}function Ue(e,t){for(let n=e.metas.length-1;n>=0;n--){let r=e.metas[n];if(o(r.seat)===o(t)&&T(r.call)&&D(r.call)<4&&r.tag!==`bwr`)return D(r.call)}return null}function We(e,t,n){let r=e.systems[o(t)],i=r.explain(e.auction,t,n),s={call:n,seat:t,src:`human`,matches:i.matches,text:``,shows:i.shows,force:i.force};if(i.matches.length){let e=[];for(let t of i.matches){let n=ke(t.rule.text,t.bind);e.includes(n)||e.push(n)}return s.text=e.slice(0,3).join(` — or — `),s}let c=He(e,a(t)),l=e.metas[e.metas.length-1];return c?.tag===`bw`&&l?.call===`P`&&T(n)&&E(n)===5?(s.tag=`bwr`,s.text=`Answer to the key-card ask`):n===`4N`&&Ue(e,t)!==null?(s.tag=`bw`,s.force=1,s.text=r.card.conv.rkcb?`Asks for key cards (the four aces and the king of trumps)`:`Blackwood: asks for aces`):n===`P`?s.text=r.covers(e.auction,t)?`Pass: your card gives this no particular meaning`:`Pass`:(s.text=`No agreement on the card for this call`,T(n)&&D(n)<4&&(s.shows=L(),s.shows.lenMin[D(n)]=4)),s}var Ge=[11,11,10,10,9],Ke=e=>E(e)+6>=Ge[D(e)];function qe(e,t){let n=e.auction,i=e.deal[t],s=d(i),c=e.systems[o(t)],l=a(t),u=Ve(e),p=u[l],g=He(e,l),_=He(e,t),v=e.metas[e.metas.length-1],y=!v||v.call===`P`,b=e=>N(n,e),x=e=>({call:`P`,why:e});if(n.calls.length>32)return x(`The auction has gone on long enough`);if(g?.tag===`bw`&&y){let n=Ue(e,t)??3,r,a;if(c.card.conv.rkcb){let e=h(i,n);r=e===1||e===4?0:e===0||e===3?1:ee(i,n)?3:2,a=[`1 or 4 key cards`,`0 or 3 key cards`,`2 key cards without the trump queen`,`2 key cards with the trump queen`][r]}else{let e=m(i);r=e===4?0:e,a=[`0 or 4 aces`,`1 ace`,`2 aces`,`3 aces`][r]}return{call:k(5,r),why:`Answer to the ask: `+a,tag:`bwr`}}if(_?.tag===`bw`&&g?.tag===`bwr`&&y){let n=Ue(e,t)??3,r=D(g.call),a;if(c.card.conv.rkcb){let e=h(i,n),t=[1,0,2,2][r],o=[4,3,2,2][r];a=e+(e+t<=2&&e+o<=5?o:t)}else{let e=m(i);a=e+(r===0?e===0?4:0:r)+1}let o=k(6,n),s=k(5,n);return a>=4&&b(o)?{call:o,why:`Enough key cards: bids the slam`}:b(s)?{call:s,why:`Two key cards are missing: stops at the five level`}:g.call===s?x(`Two key cards are missing: stops at the five level`):b(o)?{call:o,why:`No room to stop below slam`}:x(`Nothing more to do`)}let te=u[(t+1)%4].hcp[0]+u[(t+3)%4].hcp[0],ne=p.hcp[0],re=Math.max(ne,Math.min(p.hcp[1],40-s.hcp-te,ne+9)),S=[0,1,2,3].map(e=>s.len[e]+Math.max(p.lenMin[e],s.len[e]>=6&&p.lenMax[e]>=2?2:0)),C=null;for(let e of[3,2])S[e]>=8&&(C===null||S[e]>S[C])&&(C=e);if(C===null)for(let e of[1,0])S[e]>=8&&(C===null||S[e]>S[C])&&(C=e);let w=C===null?s.hcp:s.len[C]>=3?Math.max(s.sup,s.pts):s.pts,O=w+ne,A=w+re,j=(O+A)/2,M=ie(n);if(!M)return x(`Nothing to bid`);let P=o(M.seat)===o(t),F=null;for(let n=e.metas.length-1;n>=0;n--)if(o(e.metas[n].seat)===o(t)&&T(e.metas[n].call)){F=e.metas[n].call;break}let I=e.metas.some(e=>o(e.seat)===o(t)&&e.force===2),oe=y&&!!g&&g.force>=1&&g.call!==`P`,L=C===null?``:r[C],R=()=>C!==null&&C>=2?k(4,C):C!==null&&O>=29&&!se()?k(5,C):`3N`,se=()=>[0,1,2,3].every(e=>f(i,e)||p.lenMin[e]>=4),z=e=>{let t=ae(n,e);return t<=7?k(t,e):null},ce=()=>{let e=[];C!==null&&e.push([z(C),`Shows the ${L} fit`]);let t=-1;for(let e=0;e<4;e++)p.lenMin[e]>=5&&s.len[e]>=2&&(t<0||p.lenMin[e]>p.lenMin[t])&&(t=e);t>=0&&e.push([z(t),`Preference for partner's ${r[t]}`]);for(let t=3;t>=0;t--)s.len[t]>=6&&e.push([z(t),`Rebids the long ${r[t]}`,t]);for(let t=3;t>=0;t--){let n=z(t);s.len[t]>=4&&n&&E(n)<=2&&!le(t)&&e.push([n,`Shows ${r[t]}`,t])}let n=z(4);n&&(E(n)<=2||I&&E(n)===3)&&e.push([n,`No fit and nothing new to show`]);for(let t=3;t>=0;t--)s.len[t]===Math.max(...s.len)&&e.push([z(t),`Longest suit: ${r[t]}`,t]);e.push([n,`Nothing better`]);for(let[t,n,r]of e)if(t&&b(t)&&E(t)<=5)return{call:t,why:n,showSuit:r};return x(`No sensible bid available`)},le=n=>e.metas.some(e=>o(e.seat)===o(t)&&T(e.call)&&D(e.call)===n);if(!P){if(g&&g.call===`X`&&y&&!g.matches.length)return x(`Leaves partner's double in`);if(I||O>=25){let e=R();return b(e)&&(e!==`3N`||M.call[1]===`N`||f(i,D(M.call))||p.lenMin[D(M.call)]>=4)?{call:e,why:`Enough combined strength for game`}:C!==null&&C>=2&&b(k(4,C))?{call:k(4,C),why:`Enough combined strength for game`}:b(`X`)&&E(M.call)>=3&&O>=25?{call:`X`,why:`Penalty: our side holds most of the points`}:x(`No safe game to bid over their call`)}if(C!==null){let e=z(C);if(e&&b(e)){let t=E(e);if(t<=S[C]-6&&t<=3&&j>=14+t*2&&(!F||D(F)!==C||E(F)<t))return{call:e,why:`Competes: a ${S[C]}-card ${L} fit`}}}return oe?ce():x(`Not enough to bid over their call`)}if(!F)return x(`Nothing to bid`);let ue=Ke(F);if(O>=33&&E(F)<6){if(C!==null&&b(`4N`)&&E(F)<=4)return{call:`4N`,why:`Slam values: asks for `+(c.card.conv.rkcb?`key cards`:`aces`),tag:`bw`,force:1};let e=k(6,C??4);if(b(e))return{call:e,why:`Enough combined strength for slam`}}if(ue)return C!==null&&C>=2&&F===`3N`&&b(k(4,C))&&D(F)!==C?{call:k(4,C),why:`Prefers the ${S[C]}-card ${L} fit to no-trumps`}:x(`Game has been reached`);if(I||O>=25||O>=24&&C!==null&&C>=2&&S[C]>=9){if(I&&C===null&&E(F)<3)for(let e of[3,2]){let n=z(e);if(s.len[e]>=5&&u[t].lenMin[e]<5&&n&&b(n)&&E(n)<=3&&!le(e))return{call:n,why:`Shows five ${r[e]} on the way to game`,force:1,showSuit:e}}let e=R();return b(e)?{call:e,why:C===null?`Enough combined strength for game`:`Game in the ${L} fit`}:C!==null&&b(k(4,C))?{call:k(4,C),why:`Game in the ${L} fit`}:oe?ce():x(`No game left to bid`)}if(g?.tag===`inv`&&y){let e=u[t].hcp;if(s.hcp*2>e[0]+Math.min(e[1],e[0]+6)){let e=R();if(b(e))return{call:e,why:`Accepts the invitation`}}return x(`Declines the invitation`)}if(A>=25&&_?.tag!==`inv`){if(j>=25){let e=R();if(b(e))return{call:e,why:`Likely enough for game`}}else if(j>=23.5){let e=C===null?`2N`:k(3,C);if(b(e)&&F!==e)return{call:e,why:`Invites game`,tag:`inv`}}}if(oe)return ce();if(C!==null&&D(F)!==C){let e=z(C);if(e&&b(e)&&E(e)<=(S[C]>=9?3:2))return{call:e,why:`Corrects to the ${L} fit`}}return x(`Content with the contract`)}function Je(e,t){let n=e.systems[o(t)],r=n.find(e.auction,t,e.deal[t]);if(r){let i=n.explain(e.auction,t,r.call);return{call:r.call,seat:t,src:`rule`,matches:i.matches,text:ke(r.rule.text,r.bind),shows:i.shows,force:i.force,fired:r.rule}}let i=qe(e,t),a={call:i.call,seat:t,src:`judgment`,matches:[],text:i.why,shows:null,force:i.force??0,tag:i.tag};return i.showSuit!==void 0&&(a.shows=L(),a.shows.lenMin[i.showSuit]=4),a}function Ye(e,t){e.auction.calls.push(t.call),e.metas.push(t)}function Xe(e,t,n){let r=We(e,t,n),i=e.systems[o(t)].find(e.auction,t,e.deal[t]);return r.cardCall=i?i.call:null,r.cardText=i?ke(i.rule.text,i.bind):``,r}function Ze(e,t){for(;!P(e.auction)&&j(e.auction)!==t;)Ye(e,Je(e,j(e.auction)))}var Qe=class{seed;sys;base;field;spots=new Map;own=new Map;conv={};deals=0;calls=0;silent=0;unreadable=[];constructor(e,t=1){this.seed=t,this.sys=new V(e,W()),this.base=new V({...e,own:[]},W()),this.field=new V(U(),W());for(let t of e.own)try{let e=_e(t);this.own.set(t.id,{id:t.id,rule:e,fired:0,replaced:{},clashes:0,clashWith:``,example:null})}catch(e){this.unreadable.push({after:t.after,call:t.call,error:e.message})}}step(e){for(let t=0;t<e;t++){let e=this.seed+this.deals,t=this.deals%4,n=c(s(e)),r=Be(n,t,[this.sys,this.field]),i=new Set;for(;!P(r.auction);){let a=j(r.auction),s=Je(r,a);if(o(a)===0){s.call!==`P`&&this.calls++;let c=()=>({seed:e,dealer:t,seat:a,hand:n[a],call:s.call,why:s.text});if(s.tag===`bw`||s.tag===`bwr`)s.tag===`bw`&&i.add(`rkcb`);else if(s.src===`judgment`){let e=null;for(let t=r.metas.length-1;t>=0;t--)if(o(r.metas[t].seat)===0&&T(r.metas[t].call)){e=r.metas[t].call;break}if(!(s.call===`P`&&e&&Ke(e))){s.call!==`P`&&this.silent++;let e=ve(r.auction,a),t=e.tokens.join(` `),n=this.spots.get(t);n||(n={tokens:e.tokens,contested:e.tokens.some(e=>e[0]===`(`),covered:this.sys.covers(r.auction,a),count:0,bids:0,calls:{},example:c()},this.spots.set(t,n)),n.count++,s.call!==`P`&&(n.bids||(n.example=c()),n.bids++),n.calls[s.call]=(n.calls[s.call]||0)+1}}else if(s.fired&&(s.fired.conv&&i.add(s.fired.conv),s.fired.own)){let e=this.own.get(s.fired.id);if(e){e.fired++,e.example||=c();let t=this.base.find(r.auction,a,n[a]),i=t?t.call:`—`;e.replaced[i]=(e.replaced[i]||0)+1;for(let t of this.sys.ownMatches(r.auction,a,n[a]))if(t.rule.id!==s.fired.id&&t.call!==s.call){e.clashes++,e.clashWith=t.rule.id;break}}}}Ye(r,s)}for(let e of i)this.conv[e]=(this.conv[e]||0)+1;this.deals++}}report(){return{deals:this.deals,calls:this.calls,silent:this.silent,spots:[...this.spots.values()].filter(e=>e.bids>0).sort((e,t)=>t.bids-e.bids||t.count-e.count),own:[...this.own.values()],conv:this.conv,unreadable:this.unreadable}}},$e=[[`any`,`Any deal`],[`iopen`,`I open`],[`popen`,`Partner opens`],[`major`,`We open 1♥ or 1♠`],[`nt`,`We open 1NT`],[`they`,`They open`],[`game`,`We have game values`],[`slam`,`We have slam values`]];function et(e,t,n,r){let i=Be(e,t,r);for(;!P(i.auction)&&i.auction.calls.every(e=>e===`P`);)Ye(i,Je(i,j(i.auction)));let a=i.metas[i.metas.length-1];if(!a||a.call===`P`)return!1;let s=d(e[0]).hcp+d(e[2]).hcp,c=o(a.seat)===0;switch(n){case`iopen`:return a.seat===2;case`popen`:return a.seat===0;case`major`:return c&&(a.call===`1H`||a.call===`1S`);case`nt`:return c&&a.call===`1N`;case`they`:return!c&&s>=16;case`game`:return s>=25;case`slam`:return s>=31;default:return!0}}function tt(e,t,n){let r=Be(e,t,n);return Ze(r,null),r}function nt(e,t){return!e||!t?e===t:e.level===t.level&&e.strain===t.strain&&e.dbl===t.dbl&&e.declarer===t.declarer}var rt=e=>F(e.auction),it=[20,50,90,130,170,220,270,320,370,430,500,600,750,900,1100,1300,1500,1750,2e3,2250,2500,3e3,3500,4e3];function at(e){let t=Math.abs(e),n=0;for(;n<it.length&&t>=it[n];)n++;return e<0?-n:n}function ot(e,t,n){let r=e.length,i=0,a=0,o=0,s=0,c=0,l=0,u=0;for(let t of e){let e=t.scoreB>t.scoreA?1:t.scoreB<t.scoreA?0:.5;e===1?i++:e===0?o++:a++,l+=e,u+=e*e;let n=at(t.scoreB-t.scoreA);s+=n,c+=n*n}let d=e=>r?e/r:0,f=(e,t)=>r>1?1.96*Math.sqrt(Math.max(0,t/r-(e/r)**2)/(r-1)):1/0,p=r?d(l)*100:50,m=f(l,u)*100,h=d(s),ee=f(s,c),g=n===`mp`?p-50:h,_=n===`mp`?m:ee,v=r>=30&&Math.abs(g)>_,y=r>=30&&_>0&&isFinite(_)?Math.abs(g)/_:0;return{bid:t,n:r,wins:i,ties:a,losses:o,pct:p,pctMargin:m,imp:h,impMargin:ee,verdict:v?g>0?`B`:`A`:`open`,sure:Math.max(0,Math.min(5,Math.round(y*2.5)))}}function st(e,t,n){let r=null;for(let i=0;i<5;i++)for(let a of[t,t+2]){let t=e[i][a],o=t-6;if(o<1)continue;let s=I(o,i,0,n,t);(!r||s>r.score)&&(r={level:o,strain:i,declarer:a,tricks:t,score:s})}return r}function ct(e,t,n,r){if(!t)return{tricks:0,scoreNS:0};let i=e[t.strain][t.declarer],a=o(t.declarer),s=I(t.level,t.strain,t.dbl,a===0?n:r,i);return{tricks:i,scoreNS:a===0?s:-s}}var q=2,lt=[`Partner`,`East`,`You`,`West`],J={dealer:0,table:null,seed:0,vulNS:!1,vulEW:!1,sel:-1,hinted:!1,tt:null,solveError:``,logged:!1},Y=null,ut=0;function dt(e){Y||(Y=new Worker(new URL(new URL(`solver.worker-CzYQuNf8.js`,import.meta.url).href,``+import.meta.url),{type:`module`}),Y.onmessage=e=>{e.data.id===ut&&(e.data.error?J.solveError=e.data.error:J.tt=e.data.tt,xt())},Y.onerror=()=>{J.solveError=`The solver could not start in this browser.`,xt()}),e?(ut++,Y.postMessage({id:ut,deal:e})):Y.postMessage({id:0,deal:null})}var ft=(e,t,n)=>et(e,t,n,[Le(),Re()]);function X(e,t){let n=oe(G.board),r=t??n.dealer,i=t!==void 0&&t!==n.dealer,a=!i&&n.vulNS,o=!i&&n.vulEW;J.dealer=r;let l=null,u=e??0;e!==void 0&&(l=c(s(e)));for(let e=0;!l&&e<6e3;e++){u=Math.floor(Math.random()*2**31);let e=c(s(u));ft(e,r,G.situation)&&(l=e)}l||(u=Math.floor(Math.random()*2**31),l=c(s(u)),w(`Could not find a deal of that kind quickly — here is an ordinary one.`)),J.table=Be(l,r,[Le(),Re()]),Object.assign(J,{seed:u,vulNS:a,vulEW:o,sel:-1,hinted:!1,tt:null,solveError:``,logged:!1}),Ze(J.table,q),J.sel=J.table.metas.length-1,pt(),xt()}function pt(){let e=J.table;P(e.auction)&&!J.tt&&dt(e.deal)}function mt(e){let t=J.table;!P(t.auction)&&j(t.auction)===q&&N(t.auction,e)&&(Ye(t,Xe(t,q,e)),Ze(t,q),J.sel=t.metas.length-1,pt(),xt())}var ht=e=>e?`${e.level}${e.strain===4?`NT`:n[e.strain]}${e.dbl===1?` doubled`:e.dbl===2?` redoubled`:``} by ${lt[e.declarer]===`You`?`you`:lt[e.declarer]}`:`Passed out`,Z=e=>e>0?`+`+e:e<0?`−`+-e:`0`;function gt(e,t){let n=``;if(e.matches.length){let t=e.matches[0],r=Ae(t.rule,t.bind);n=(t.rule.own?`Your own rule card`:`Base 2/1 card`+(t.rule.conv?` · convention`:``))+(r?` · needs ${r}`:``)}else n=e.tag?`Key-card convention`:e.src===`judgment`?`The card is silent here — the bot used its own judgment`:e.call===`P`?``:`Nothing on the card for this call`;let r=e.force===2?`<span class="tag t-system"><i></i>Forcing to game</span>`:e.force===1?`<span class="tag t-judg"><i></i>Forcing for one round</span>`:``,i=``;return t&&e.seat===q&&e.src===`human`&&(i=e.cardCall===null?`<p><span class="tag t-luck"><i></i>Card silent</span> Your card has no rule for this hand here, so the choice was yours.</p>`:e.cardCall===e.call?`<p><span class="tag t-ok"><i></i>As on your card</span></p>`:`<p><span class="tag t-judg"><i></i>Not your card's bid</span> Your card says <b class="mono">${b(e.cardCall)}</b>: ${x(e.cardText??``)}</p>`),`<div><b class="call">${b(e.call)}</b><span class="lbl">${lt[e.seat]}</span></div><p>${x(e.text)}</p>${r?`<p>${r}</p>`:``}${i}<div class="src">${x(n)}</div>`}function _t(e,t){let n=e=>(e?J.vulNS:J.vulEW)?` <i class="vul" title="Vulnerable"></i>`:``,r=`<div class="auction"><div class="h">West${n(!1)}</div><div class="h">Partner${n(!0)}</div><div class="h">East${n(!1)}</div><div class="h">You${n(!0)}</div>`;for(let t=0;t<(e.auction.dealer+1)%4;t++)r+=`<div class="c"></div>`;return e.metas.forEach((e,n)=>{let i=t&&e.seat===q&&e.src===`human`&&e.cardCall!==e.call?e.cardCall===null?` silent`:` off`:``;r+=`<button class="c${e.call===`P`?` pass`:``}${n===J.sel?` sel`:``}${i}" data-i="${n}">${b(e.call)}</button>`}),t||(r+=`<div class="c you">?</div>`),r+`</div>`}function vt(e){let t=`<div class="bbox">`;for(let n=1;n<=7;n++)for(let r=0;r<5;r++){let i=k(n,r);t+=`<button data-c="${i}"${N(e.auction,i)?``:` disabled`}>${b(i)}</button>`}return t+=`<div class="wide"><button data-c="P">Pass</button><button data-c="X"${N(e.auction,`X`)?``:` disabled`}>Dbl</button><button data-c="XX"${N(e.auction,`XX`)?``:` disabled`}>Rdbl</button></div></div>`,t+=`<div class="hintrow"><button class="btn sm" id="hintBtn">What does my card say?</button><span id="hintOut" class="dim"></span></div>`,t}function yt(e){let t=F(e.auction),r=e.metas.filter(e=>e.seat===q&&e.src===`human`),i=r.filter(e=>e.cardCall===e.call).length,a=r.filter(e=>e.cardCall===null).length,s=`<p class="verdict">${x(ht(t))}</p>`;if(J.solveError)s+=`<p class="dim">The solver is not available: ${x(J.solveError)}</p>`;else if(!J.tt)s+=`<p class="dim working">Solving the deal…</p>`;else{let e=ct(J.tt,t,J.vulNS,J.vulEW),c=st(J.tt,0,J.vulNS),l=c?c.score:0,u=``;if(!t)u=c?`Your side could have made ${c.level}${c.strain===4?`NT`:n[c.strain]} for ${Z(c.score)}.`:`Nothing was makeable for your side. A fair pass-out.`;else if(o(t.declarer)===0){let r=t.level+6-e.tricks;u=r>0?`With best defence this goes ${r} down. `+(c?`Your side can make ${c.level}${c.strain===4?`NT`:n[c.strain]} (${Z(c.score)}).`:`Nothing makes for your side on this deal.`):e.scoreNS>=l?`The best-scoring contract your side can make.`:`It makes, but ${c.level}${c.strain===4?`NT`:n[c.strain]} scores more (${Z(l)}).`}else{let r=t.level+6-e.tricks;u=r>0?`They go ${r} down with best defence.`+(l>e.scoreNS?` Your own best was ${c.level}${c.strain===4?`NT`:n[c.strain]} (${Z(l)}).`:` Defending was right.`):l>e.scoreNS&&c?`They make it. Your side could have made ${c.level}${c.strain===4?`NT`:n[c.strain]} (${Z(l)}).`:`They make it, and your side had nothing better.`}s+=`<p style="margin:0;color:var(--ink-2)">${x(u)}</p>`,s+=`<div class="readouts" style="grid-template-columns:1fr 1fr 1fr;margin-top:12px"><div class="ro"><span class="k">Tricks</span><span class="v">${t?e.tricks:`—`}</span></div><div class="ro"><span class="k">Your score</span><span class="v">${Z(e.scoreNS)}</span></div><div class="ro"><span class="k">Your best</span><span class="v">${Z(l)}</span></div></div>`,J.logged||(J.logged=!0,G.log.push({board:G.board,date:new Date().toISOString(),contract:ht(t),scoreNS:e.scoreNS,bestNS:l,calls:r.length,followed:i,silent:a,hinted:J.hinted}),G.log.length>2e3&&G.log.shift(),K())}if(r.length){let e=r.length-i-a;s+=`<div class="sech"><span class="lbl">Your calls against your card</span></div><p style="margin:0">${i} of ${r.length} as on your card${e?` · <span class="tag t-judg"><i></i>${e} different</span>`:``}${a?` · <span class="tag t-luck"><i></i>${a} where the card is silent</span>`:``}</p><p class="dim" style="margin:6px 0 0;font-size:13px">Tap a marked call in the auction to see what the card says.</p>`}return s+=`<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px"><button class="btn pri" id="nextBtn">Next deal</button><button class="btn" id="againBtn">Bid this deal again</button></div>`,s}function bt(e){let t=`<table class="tt"><tr><th></th>`+[4,3,2,1,0].map(e=>`<th>${e===4?`NT`:x(n[e])}</th>`).join(``)+`</tr>`;for(let[n,r]of[[`You two`,[0,2]],[`They`,[1,3]]])t+=`<tr><td>${n}</td>`+[4,3,2,1,0].map(t=>`<td>${Math.max(e[t][r[0]],e[t][r[1]])}</td>`).join(``)+`</tr>`;return t+`</table>`}function xt(){let e=J.table;if(!e)return;let t=P(e.auction),n=J.dealer,r=J.vulNS&&J.vulEW?`Everyone vulnerable`:J.vulNS?`You are vulnerable`:J.vulEW?`They are vulnerable`:`Nobody vulnerable`;g(`#tTitle`).textContent=`Board ${G.board}`,g(`#tSub`).textContent=`Dealer: ${n===q?`you`:lt[n]} · ${r}`,g(`#crumb`).innerHTML=`Board ${G.board} · <b>${t?`finished`:`bidding`}</b>`;let i=d(e.deal[q]);if(!t)g(`#felt`).innerHTML=`<div><div class="seat"><b>Partner</b> · bot, plays your card</div><div class="backs" style="margin-top:8px">${`<i></i>`.repeat(13)}</div></div><div class="mid"><div class="side"><b>West</b>bot</div><div>${_t(e,!1)}</div><div class="side"><b>East</b>bot</div></div><div><div class="hand">${ne(e.deal[q])}</div><div class="seat" style="margin-top:8px"><b>You</b> · ${i.hcp} points</div></div>`;else{let t=F(e.auction),n=(t,n)=>`<div class="hd ${n}"><span class="lbl">${lt[t]} · ${d(e.deal[t]).hcp}</span>${re(e.deal[t])}</div>`;g(`#felt`).innerHTML=_t(e,!0)+`<div class="deal">${n(0,`N`)}${n(3,`W`)}<div class="X"><div>${x(ht(t))}</div></div>${n(1,`E`)}${n(2,`S`)}</div>`+(J.tt?`<div><div class="sech"><span class="lbl">Tricks each side can take</span></div>${bt(J.tt)}</div>`:``)}let a=Ve(e);g(`#meaning`).innerHTML=(J.sel>=0&&e.metas[J.sel]?gt(e.metas[J.sel],t):`<p class="dim">You are first to speak.</p>`)+`<div class="sech"><span class="lbl">Shown so far</span></div><div class="shown"><div><span class="lbl">Partner</span>${S(a[0])}</div><div><span class="lbl">West</span>${S(a[3])}</div><div><span class="lbl">East</span>${S(a[1])}</div></div>`,g(`#boxTitle`).textContent=t?`Result`:`Your call`,g(`#boxMeta`).textContent=t?`solver`:`bidding box`,g(`#boxBody`).innerHTML=t?yt(e):vt(e),_(`#felt button.c`).forEach(e=>e.onclick=()=>{J.sel=Number(e.dataset.i),xt()}),_(`#boxBody button[data-c]`).forEach(e=>e.onclick=()=>mt(e.dataset.c));let o=document.getElementById(`hintBtn`);o&&(o.onclick=()=>{let t=Le().find(e.auction,q,e.deal[q]);J.hinted=!0,g(`#hintOut`).innerHTML=t?`<b class="mono">${b(t.call)}</b> — ${x(t.rule.text.replace(/\{\w+\}/g,`the suit`))}`:`Your card is silent here. Use your judgment.`});let s=document.getElementById(`nextBtn`);s&&(s.onclick=()=>{G.board++,K(),X()});let c=document.getElementById(`againBtn`);c&&(c.onclick=()=>X(J.seed,J.dealer))}function St(){let e=g(`#situation`);e.innerHTML=$e.map(([e,t])=>`<option value="${e}">${t}</option>`).join(``),e.value=$e.some(([e])=>e===G.situation)?G.situation:`any`,e.onchange=()=>{G.situation=e.value,K(),X()},g(`#newDeal`).onclick=()=>{G.board++,K(),X()},X(),dt(null)}function Ct(){X()}function wt(e,t){X(e,t)}var Tt={M:`♥/♠`,m:`♣/♦`,oM:` other major`,om:` other minor`,X:` suit`,Y:` suit`,Z:` new suit`};function Et(t){let r=t.startsWith(`(`),i=r?t.slice(1,-1):t,a;if(i===`P`)a=`Pass`;else if(i===`X`)a=`Dbl`;else if(i===`XX`)a=`Rdbl`;else if(i===`*`)a=`any`;else{let t=i.slice(1),r=e.indexOf(t);a=i[0]+(t===`N`?`NT`:t.length===1&&r>=0?n[r]:Tt[t]??t)}return r?`(${a})`:a}var Dt=e=>e.length?e.map(Et).join(` – `):`Opening the bidding`;function Ot(e){return e.replace(/♠/g,`S`).replace(/♥/g,`H`).replace(/♦/g,`D`).replace(/♣/g,`C`).replace(/[–—\-,;]/g,` `).replace(/\(\s*/g,`(`).replace(/\s*\)/g,`)`).split(/\s+/).filter(Boolean).map(e=>{let t=e.startsWith(`(`),n=(t?e.slice(1,-1):e).toUpperCase();return n=n===`PASS`?`P`:n===`DBL`||n===`DOUBLE`?`X`:n===`RDBL`||n===`REDOUBLE`?`XX`:n.replace(/NT$/,`N`),t?`(${n})`:n}).join(` `)}function kt(e){let t=Ae(e),n=e.force===2?` <span class="tag t-system"><i></i>game force</span>`:e.force===1?` <span class="tag t-judg"><i></i>forcing</span>`:``;return`<div class="rrow"><b class="mono">${x(Et(e.call))}</b><div><div>${x(e.text.replace(/\{(\w+)\}/g,(e,t)=>(Tt[t]??t).trim()))}${n}</div>${t?`<div class="dim">${v(t)}</div>`:``}</div></div>`}function At(){g(`#convs`).innerHTML=H.map(e=>`<button class="tog${G.card.conv[e.id]?` on`:``}" data-id="${e.id}"><span><b>${v(e.name)}</b><br><span class="dim">${x(e.blurb)}</span></span><span class="sw"></span></button>`).join(``),g(`#convMeta`).textContent=`${H.filter(e=>G.card.conv[e.id]).length} of ${H.length} on`,_(`#convs .tog`).forEach(e=>e.onclick=()=>{let t=e.dataset.id;G.card.conv[t]=!G.card.conv[t],Q()})}function jt(){let e=G.card.own;g(`#ownMeta`).textContent=e.length===1?`1 card`:`${e.length} cards`,g(`#rules`).innerHTML=e.length?e.map((e,t)=>{let n;try{let t=_e(e);n=`<div class="seq">${x(Dt(t.ctx))} → ${x(Et(t.call))}</div><p>${x(e.text)}</p><p class="dim">${v(Ae(t)||`any hand`)}${e.force===2?` · forcing to game`:e.force===1?` · forcing one round`:``}</p>`}catch(t){n=`<div class="seq">${v(e.after)} → ${v(e.call)}</div><p class="tag t-play"><i></i>Needs attention: ${v(String(t.message))}</p>`}return`<div class="rule">${n}<div class="racts"><button class="btn sm" data-edit="${t}">Change</button><button class="btn sm" data-del="${t}">Remove</button></div></div>`}).join(``):`<p class="dim" style="margin:0">None yet. A rule card says: after this auction, with this kind of hand, make this call. Your own cards are checked before the base card, so they win.</p>`,_(`#rules [data-edit]`).forEach(e=>e.onclick=()=>It(Number(e.dataset.edit))),_(`#rules [data-del]`).forEach(e=>e.onclick=()=>{let t=Number(e.dataset.del);confirm(`Remove this rule card?`)&&(G.card.own.splice(t,1),Q())})}function Mt(){g(`#versions`).innerHTML=G.versions.length?G.versions.map((e,t)=>`<div class="ver"><i></i><div><b>${v(e.name)}</b><br>${new Date(e.date).toLocaleDateString()} · ${e.card.own.length} own cards <button class="btn sm" data-restore="${t}" style="margin-left:6px">Restore</button></div></div>`).join(``):`<p class="dim" style="margin:0;font-size:13.5px">No saved versions. Save one before trying a change, so you can come back to it.</p>`,_(`#versions [data-restore]`).forEach(e=>e.onclick=()=>{let t=G.versions[Number(e.dataset.restore)];confirm(`Go back to "${t.name}"? Your current card will be replaced.`)&&(G.card=JSON.parse(JSON.stringify(t.card)),Q(),w(`Restored "${t.name}".`))})}function Nt(){let e=Ot(g(`#ruleSearch`).value).split(` `).filter(e=>/^\(?(P|X|XX|[1-7][CDHSN])\)?$/.test(e)),t=new Map,n=0;for(let r of Le().rules){let i=r.ctx.join(` `);if(e.length&&!Se(r.ctx,e))continue;let a=r.own?`MY OWN RULE CARDS`:r.section||`OTHER`;t.has(a)||t.set(a,new Map);let o=t.get(a);o.has(i)||o.set(i,[]),o.get(i).push(r),n++}let r=``;for(let[n,i]of t){r+=`<details${e.length?` open`:``}><summary>${x(n)} <span class="dim mono">${[...i.values()].reduce((e,t)=>e+t.length,0)}</span></summary>`;for(let[,e]of i)r+=`<div class="ctxh">${x(Dt(e[0].ctx))}</div>${e.map(kt).join(``)}`;r+=`</details>`}g(`#browser`).innerHTML=r||`<p class="dim">Nothing on the card for that auction.</p>`,g(`#browserMeta`).textContent=`${n} rules`}var Pt=-1;function Ft(e){It(-1,e)}function It(e,t=``){Pt=e;let n=e>=0?G.card.own[e]:null;g(`#fAfter`).value=n?n.after:t,g(`#fCall`).value=n?n.call:``;let r=n?/hcp\s*(\d+)(?:(\+)|-(\d+))?/.exec(n.conds):null;g(`#fMin`).value=r?r[1]:``,g(`#fMax`).value=r?r[2]?``:r[3]??r[1]:``;for(let e of`SHDC`){let t=n?RegExp(`(?:^|,)\\s*${e}(\\d+)(?:(\\+)|(-)(\\d+)?)?\\s*(?:,|$)`).exec(n.conds):null;g(`#fLo${e}`).value=t?t[3]&&t[4]===void 0?``:t[1]:``,g(`#fHi${e}`).value=t?t[2]?``:t[3]?t[4]??t[1]:t[1]:``}g(`#fBal`).checked=!!n&&/(^|,)\s*bal\s*(,|$)/.test(n.conds),g(`#fForce`).value=String(n?n.force:0),g(`#fText`).value=n?n.text:``,g(`#fErr`).textContent=``,g(`#modalTitle`).textContent=n?`Change rule card`:`New rule card`,zt(),g(`#scrim`).classList.add(`on`),g(`#modal`).classList.add(`on`)}function Lt(){g(`#scrim`).classList.remove(`on`),g(`#modal`).classList.remove(`on`)}function Rt(){let e=e=>g(e).value.trim(),t=[],n=e(`#fMin`),r=e(`#fMax`);(n||r)&&t.push(r?`hcp ${n||0}-${r}`:`hcp ${n}+`);for(let n of`SHDC`){let r=e(`#fLo${n}`),i=e(`#fHi${n}`);r&&i?t.push(r===i?`${n}${r}`:`${n}${r}-${i}`):r?t.push(`${n}${r}+`):i&&t.push(`${n}${i}-`)}g(`#fBal`).checked&&t.push(`bal`);let i=Ot(e(`#fAfter`)),a=Ot(e(`#fCall`));return{id:Pt>=0?G.card.own[Pt].id:`o`+Date.now(),after:i,call:a,conds:t.join(`, `),text:e(`#fText`),force:Number(g(`#fForce`).value)}}function zt(){let e=Rt();try{if(!e.call)throw Error(`Say which call this card is about.`);if(!/^(P|X|XX|[1-7][CDHSN])$/.test(e.call))throw Error(`"${e.call}" is not a call. Write it like 2H, 3NT, Pass or Dbl.`);let t=_e(e);if(t.ctx.some(e=>/[a-zXYZM*]/.test(e.replace(/^\(?(X|XX)\)?$/,``))))throw Error(`Write the auction with actual suits, like 1H or (2S).`);let n=Ae(t)||`any hand`;return g(`#fPreview`).innerHTML=`Reads as: <b>${x(Dt(t.ctx))}</b> → bid <b>${x(Et(t.call))}</b> with ${v(n)}.`,g(`#fErr`).textContent=``,e}catch(e){return g(`#fPreview`).textContent=``,g(`#fErr`).textContent=e.message,null}}function Bt(){let e=zt();e&&(e.text||=`My own agreement`,Pt>=0?G.card.own[Pt]=e:G.card.own.push(e),Lt(),Q(),w(`Rule card saved. Your partner at the Table now plays it.`))}function Q(){ze(),Vt(),Ct(),an()}function Vt(){g(`#cardName`).textContent=G.card.name,At(),jt(),Mt(),Nt()}function Ht(){Vt(),g(`#addRule`).onclick=()=>It(-1),g(`#closeModal`).onclick=Lt,g(`#scrim`).onclick=Lt,g(`#saveRule`).onclick=Bt,_(`#modal input, #modal select`).forEach(e=>e.addEventListener(`input`,()=>zt())),g(`#ruleSearch`).addEventListener(`input`,Nt),g(`#saveVersion`).onclick=()=>{let e=prompt(`Name this version`,`Version ${G.versions.length+1}`);e&&(G.versions.unshift({name:e,date:new Date().toISOString(),card:JSON.parse(JSON.stringify(G.card))}),K(),Mt(),w(`Version saved.`))},g(`#resetCard`).onclick=()=>{confirm(`Put every convention switch back to the stock 2/1 setting? Your own rule cards are kept.`)&&(G.card.conv=U().conv,Q())},g(`#exportCard`).onclick=()=>{let e=new Blob([JSON.stringify({setu:1,card:G.card,versions:G.versions},null,2)],{type:`application/json`}),t=document.createElement(`a`);t.href=URL.createObjectURL(e),t.download=`setu-system.json`,t.click(),URL.revokeObjectURL(t.href)};let e=g(`#importFile`);g(`#importCard`).onclick=()=>e.click(),e.onchange=async()=>{let t=e.files?.[0];if(e.value=``,t)try{let e=JSON.parse(await t.text());if(!e||e.setu!==1||!e.card||typeof e.card.conv!=`object`||!Array.isArray(e.card.own))throw Error(`not a Setu system file`);if(!confirm(`Replace your current card with the one in this file?`))return;G.card={name:String(e.card.name||`My 2/1 card`),conv:{...U().conv,...e.card.conv},own:e.card.own.map(e=>({id:String(e.id),after:String(e.after),call:String(e.call),conds:String(e.conds),text:String(e.text),force:Number(e.force)||0}))},Array.isArray(e.versions)&&(G.versions=e.versions),Q(),w(`System file loaded.`)}catch(e){w(`That file could not be read: `+e.message)}}}var Ut=1e4,Wt=400,Gt=[`Partner`,`East`,`You`,`West`],Kt=!1,qt=null,Jt=!1,Yt=(e,t)=>e<=0?`never`:`about 1 deal in ${Math.max(1,Math.round(t/e)).toLocaleString()}`;function Xt(e){return e.map(e=>{let t=e.startsWith(`(`),n=t?e.slice(1,-1):e;return n=n===`P`?`Pass`:n===`X`?`Dbl`:n===`XX`?`Rdbl`:n.replace(/N$/,`NT`),t?`(${n})`:n}).join(` `)}function Zt(e){let t=Object.values(e).reduce((e,t)=>e+t,0);return Object.entries(e).sort((e,t)=>t[1]-e[1]).slice(0,3).map(([e,n])=>`<b class="mono">${b(e)}</b> ${Math.round(n/t*100)}%`).join(` · `)}function Qt(e,t,n){let r=e.contested?`<span class="tag t-play"><i></i>Hole when they bid</span>`:e.covered?`<span class="tag t-judg"><i></i>Some hands not covered</span>`:`<span class="tag t-system"><i></i>No agreement</span>`,i=e.tokens.length?`After ${Dt(e.tokens)}`:`Opening the bidding`,a=e.covered?`Your card has rules for this auction, but none of them fits some hands, so the bidder has to guess.`:`Your card says nothing about this auction, so the bidder has to guess.`;return`<div class="find"><span>${r}</span><h3>${x(i)}</h3><p>${a} What the bot chose: ${Zt(e.calls)}.</p>
    <span class="how">A bid without a rule here: ${Yt(e.bids,n)}</span>
    <div class="acts"><button class="btn sm" data-ex="${t}">Show me a hand</button><button class="btn sm" data-add="${t}">Write a rule for this</button></div>
    <div class="exbox" id="ex${t}" hidden></div></div>`}function $t(e){return x(`${Dt(e.rule.ctx)} → ${Et(e.rule.call)}`)}function en(e,t){let n=$t(e);if(e.fired===0)return`<div class="find"><span class="tag t-luck"><i></i>Never came up</span><h3>${n}</h3><p>In ${t.deals.toLocaleString()} deals no hand fitted this card at that point. The hand it asks for may be stricter than you meant, or the auction may be written differently from how it really goes.</p></div>`;let r=Object.values(e.replaced).reduce((e,t)=>e+t,0),i=Object.entries(e.replaced).sort((e,t)=>t[1]-e[1]).slice(0,3).map(([e,t])=>`${e===`—`?`nothing (the base card is silent)`:`<b class="mono">${b(e)}</b>`} ${Math.round(t/r*100)}%`).join(` · `),a=`<span class="tag t-ok"><i></i>In use</span>`,o=``;if(e.clashes>0){let n=t.own.find(t=>t.id===e.clashWith);a=`<span class="tag t-play"><i></i>Clashes with another card</span>`,o=`<p>On ${e.clashes} hands your card ${n?$t(n):`another of your cards`} also fitted and asked for a different bid. Only the card listed first is used, so the other one is ignored on those hands.</p>`}else t.deals/e.fired>300&&(a=`<span class="tag t-luck"><i></i>Rarely used</span>`);return`<div class="find"><span>${a}</span><h3>${n}</h3>${o}<p>Without this card your partner would have bid: ${i}.</p><span class="how">Used ${Yt(e.fired,t.deals)}</span></div>`}function tn(e){let t=H.filter(e=>G.card.conv[e.id]);return t.length?t.map(t=>{let n=e.conv[t.id]||0,r=n===0||e.deals/n>300;return`<div class="drow" style="cursor:default"><span class="nm"><b>${v(t.name)}</b>${r?` <span class="tag t-luck"><i></i>rare — easy to forget</span>`:``}</span><span class="val">${n?Yt(n,e.deals):`never`}</span></div>`}).join(``):`<p class="dim">No conventions are switched on.</p>`}function nn(){let e=qt;if(!e)return;let t=e.spots.filter(t=>t.bids*1e3>=e.deals),n=Jt?e.spots:t.length?t.slice(0,10):e.spots.slice(0,5),r=t.filter(e=>e.contested).length,i=e.spots.length-t.length,a=e.calls?e.silent/e.calls*100:0,o=`<div class="readouts" style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr));margin-bottom:6px">
    <div class="ro"><span class="k">Deals bid</span><span class="v">${e.deals.toLocaleString()}</span></div>
    <div class="ro"><span class="k">Bids made on judgment</span><span class="v">${a.toFixed(1)}% <small>${e.silent.toLocaleString()} of ${e.calls.toLocaleString()}</small></span></div>
    <div class="ro"><span class="k">Common gaps</span><span class="v">${t.length} <small>${r} when they bid · ${i} rare</small></span></div>
    <div class="ro"><span class="k">Your rule cards</span><span class="v">${G.card.own.length}</span></div></div>
    <p class="dim" style="margin:8px 0 0;font-size:13.5px">Your card was played by both you and partner; the opponents played stock 2/1. A gap is a point in the bidding where one of you had to make a bid with no rule to follow.</p>`;e.unreadable.length&&(o+=`<div class="sech"><span class="lbl">Rule cards that cannot be read</span></div>`,o+=e.unreadable.map(e=>`<div class="find"><span class="tag t-play"><i></i>Needs attention</span><h3>${v(e.after||`Opening`)} → ${v(e.call)}</h3><p>${v(e.error)}. Open the card with Change and correct it.</p></div>`).join(``)),o+=`<div class="sech"><span class="lbl">${Jt?`Every gap, most frequent first`:`The most frequent gaps`}</span></div>`,o+=n.length?n.map((t,n)=>Qt(t,n,e.deals)).join(``):`<p class="dim">No gaps found: every bid followed a rule.</p>`,!Jt&&e.spots.length>n.length&&(o+=`<p class="dim" style="font-size:13.5px">${(e.spots.length-n.length).toLocaleString()} more gaps came up, nearly all of them rarely — less than once in a thousand deals.</p><button class="btn sm" id="critAll">Show every gap</button>`),e.own.length&&(o+=`<div class="sech"><span class="lbl">Your own rule cards</span></div>${e.own.map(t=>en(t,e)).join(``)}`),o+=`<div class="sech"><span class="lbl">How often each convention was used</span></div>${tn(e)}`,g(`#findBody`).innerHTML=o,g(`#findMeta`).textContent=`${e.deals.toLocaleString()} deals`;let s=document.getElementById(`critAll`);s&&(s.onclick=()=>{Jt=!0,nn()}),_(`#findBody [data-add]`).forEach(e=>e.onclick=()=>Ft(Xt(n[Number(e.dataset.add)].tokens))),_(`#findBody [data-ex]`).forEach(e=>e.onclick=()=>{let t=Number(e.dataset.ex),r=n[t],i=g(`#ex${t}`);if(!i.hidden){i.hidden=!0;return}let a=r.example;i.innerHTML=`<p><b>${Gt[a.seat]}</b> held:</p><div class="mono" style="line-height:1.6">${re(a.hand)}</div>
      <p>…and bid <b class="mono">${b(a.call)}</b> on judgment: ${x(a.why)}.</p>
      <button class="btn sm" data-deal="1">Bid this deal at the Table</button>`,i.hidden=!1,g(`[data-deal]`,i).onclick=()=>{wt(a.seed,a.dealer),window.dispatchEvent(new CustomEvent(`setu:go`,{detail:`table`}))}})}function rn(){if(Kt)return;Kt=!0,Jt=!1;let e=g(`#checkBtn`);e.disabled=!0;let t=g(`#findings`);t.hidden=!1,g(`#findStale`).hidden=!0,g(`#findBody`).innerHTML=`<div class="scan"><span><span id="scanN">0</span> of `+Ut.toLocaleString()+` deals dealt and bid…</span></div>`,g(`#findMeta`).textContent=`working`,t.scrollIntoView({behavior:`smooth`,block:`start`});let n=new Qe(JSON.parse(JSON.stringify(G.card)),1+Math.floor(Math.random()*1e6)),r=0,i=()=>{n.step(Wt),r+=Wt;let t=document.getElementById(`scanN`);t&&(t.textContent=r.toLocaleString()),r<Ut?window.setTimeout(i,0):(qt=n.report(),Kt=!1,e.disabled=!1,nn())};window.setTimeout(i,30)}function an(){qt&&(g(`#findStale`).hidden=!1)}function on(){g(`#checkBtn`).onclick=rn,g(`#findClose`).onclick=()=>{g(`#findings`).hidden=!0}}var sn=[],cn=[];function ln(){for(let e of sn)!e.job&&cn.length&&(e.job=cn.shift(),e.worker.postMessage({id:1,deal:e.job.deal}))}function un(){if(sn.length)return;let e=Math.max(1,Math.min(4,(navigator.hardwareConcurrency||2)-1));for(let t=0;t<e;t++){let e=new Worker(new URL(new URL(`solver.worker-CzYQuNf8.js`,import.meta.url).href,``+import.meta.url),{type:`module`}),t={worker:e,job:null};e.onmessage=e=>{let n=t.job;t.job=null,n&&(e.data.error?n.reject(Error(e.data.error)):n.resolve(e.data.tt)),ln()},e.onerror=()=>{let e=t.job;t.job=null,e&&e.reject(Error(`The solver stopped.`)),ln()},sn.push(t)}}function dn(e){return un(),new Promise((t,n)=>{cn.push({deal:e,resolve:t,reject:n}),ln()})}function fn(){for(let e of cn.splice(0))e.reject(Error(`stopped`))}var pn=[`Partner`,`East`,`You`,`West`],mn=!1,$=0,hn=[],gn={a:``,b:``},_n=`mp`,vn=-1;function yn(e){return e===`now`?G.card:e===`stock`?U(`Stock 2/1`):G.versions[Number(e.slice(1))]?.card??G.card}function bn(e){return e===`now`?`My card now`:e===`stock`?`Stock 2/1`:G.versions[Number(e.slice(1))]?.name??`My card now`}function xn(){let e=[[`now`,`My card now`],...G.versions.map((e,t)=>[`v${t}`,`${e.name} (${new Date(e.date).toLocaleDateString()})`]),[`stock`,`Stock 2/1 — no own cards, stock switches`]],t=e.map(([e,t])=>`<option value="${e}">${t.replace(/</g,`&lt;`)}</option>`).join(``),n=G.versions.length!==vn;vn=G.versions.length;for(let[r,i]of[[`#labA`,G.versions.length?`v0`:`stock`],[`#labB`,`now`]]){let a=g(r),o=n?``:a.value;a.innerHTML=t,a.value=e.some(([e])=>e===o)?o:i}}var Sn=e=>e>0?`+`+e:e<0?`−`+-e:`0`,Cn=e=>e?`${e.level}${e.strain===4?`NT`:n[e.strain]}${e.dbl===1?`x`:e.dbl===2?`xx`:``} by ${pn[e.declarer]===`You`?`you`:pn[e.declarer]}`:`Passed out`;function wn(e,t){let n=`<div class="auction"><div class="h">West</div><div class="h">Partner</div><div class="h">East</div><div class="h">You</div>`;for(let e=0;e<(t+1)%4;e++)n+=`<div class="c"></div>`;for(let t of e)n+=`<div class="c${t===`P`?` pass`:``}">${b(t)}</div>`;return n+`</div>`}function Tn(e){let t=c(s(e.seed)),n=(e,n)=>`<div class="hd ${n}"><span class="lbl">${pn[e]}</span>${re(t[e])}</div>`,r=e.vulNS&&e.vulEW?`Everyone vulnerable`:e.vulNS?`You are vulnerable`:e.vulEW?`They are vulnerable`:`Nobody vulnerable`,i=g(`#labDeal`);i.innerHTML=`<div class="head"><h2>The deal</h2><span class="meta">Dealer ${pn[e.dealer]} · ${r}</span></div>
    <div class="deal">${n(0,`N`)}${n(3,`W`)}<div class="X"></div>${n(1,`E`)}${n(2,`S`)}</div>
    <div class="two" style="margin-top:14px">
      <div><div class="sech" style="margin-top:0"><span class="lbl">A · ${gn.a.replace(/</g,`&lt;`)}</span></div>${wn(e.callsA,e.dealer)}<p class="verdict" style="margin-top:10px">${x(Cn(e.contractA))} · ${Sn(e.scoreA)}</p></div>
      <div><div class="sech" style="margin-top:0"><span class="lbl">B · ${gn.b.replace(/</g,`&lt;`)}</span></div>${wn(e.callsB,e.dealer)}<p class="verdict" style="margin-top:10px">${x(Cn(e.contractB))} · ${Sn(e.scoreB)}</p></div>
    </div>
    <p class="dim" style="font-size:13.5px">Scores are for your side, with best play all round.</p>
    <button class="btn sm" id="labPractise">Bid this deal at the Table</button>`,i.hidden=!1,g(`#labPractise`).onclick=()=>{wt(e.seed,e.dealer),window.dispatchEvent(new CustomEvent(`setu:go`,{detail:`table`}))},i.scrollIntoView({behavior:`smooth`,block:`nearest`})}function En(e,t){g(t).innerHTML=e.length?e.map((e,t)=>`<button class="drow" data-i="${t}"><span class="nm">${x(`A: ${Cn(e.contractA)} · B: ${Cn(e.contractB)}`)}</span><span class="val">${Sn(e.scoreB-e.scoreA)}</span></button>`).join(``):`<p class="dim" style="margin:0">None.</p>`,_(`${t} .drow`).forEach(t=>t.onclick=()=>Tn(e[Number(t.dataset.i)]))}function Dn(e){let t=_n===`mp`?`${e.pct.toFixed(1)}% of the matchpoints (± ${e.pctMargin.toFixed(1)})`:`${e.imp>=0?`+`:`−`}${Math.abs(e.imp).toFixed(2)} IMPs a deal (± ${e.impMargin.toFixed(2)})`;if(e.n===0)return[`The two versions bid every deal the same way.`,`In this situation the change never made a difference. Try another situation, or more deals.`];if(e.n<30)return[`Too few deals were bid differently to tell.`,`Only ${e.n} of ${e.bid.toLocaleString()} deals came out differently. Run more deals, or pick a situation where the change matters.`];let n=`On the ${e.n} deals where the two versions bid differently, B scored ${t}.`;return e.verdict===`open`?[`No clear winner.`,`${n} That is inside the margin of error, so the change may help or hurt a little — run more deals to narrow it down.`]:[`${e.verdict===`B`?`B — ${gn.b}`:`A — ${gn.a}`} scores better.`,n]}function On(e,t,n,r){let i=ot(hn,e,_n),a=hn.map(e=>`<i class="${e.scoreB>e.scoreA?`b`:e.scoreB<e.scoreA?`a`:`eq`}"></i>`).join(``),[o,s]=r?Dn(i):[`Dealing, bidding and solving…`,``],c=`<span class="dots" style="--pen:var(--watch)">`+[0,1,2,3,4].map(e=>`<i${e<i.sure?` class="on"`:``}></i>`).join(``)+`</span>`,l=_n===`mp`?`${i.pct.toFixed(1)}% <small>± ${isFinite(i.pctMargin)?i.pctMargin.toFixed(1):`—`}</small>`:`${i.imp>=0?`+`:`−`}${Math.abs(i.imp).toFixed(2)} <small>± ${isFinite(i.impMargin)?i.impMargin.toFixed(2):`—`} IMPs</small>`;if(g(`#labBody`).innerHTML=`<p class="verdict${r?``:` working`}">${x(o)}</p>${s?`<p style="margin:0;color:var(--ink-2)">${x(s)}</p>`:``}
    <div class="matrix">${a}</div>
    <div class="legend"><span><i style="background:var(--pen-3)"></i>B did better · <b class="mono">${i.wins}</b></span><span><i style="background:var(--ink-3)"></i>Same score · <b class="mono">${i.ties}</b></span><span><i style="background:var(--pen-1)"></i>A did better · <b class="mono">${i.losses}</b></span></div>
    <div class="readouts" style="grid-template-columns:repeat(3,1fr);margin-top:14px">
      <div class="ro"><span class="k">Bid differently</span><span class="v">${i.n} <small>of ${e.toLocaleString()}</small></span></div>
      <div class="ro"><span class="k">B's result</span><span class="v">${l}</span></div>
      <div class="ro"><span class="k">How sure</span><span class="v">${c}</span></div></div>
    <div class="note"><span class="ring"></span><span>Each dot is one deal the versions bid differently, judged with best play all round. Matchpoints here compare A and B head to head: each deal is won, lost or tied.</span></div>`,g(`#labMeta`).textContent=r?`${e.toLocaleString()} deals`:`${e.toLocaleString()} of ${t.toLocaleString()} bid · ${n} solving`,r){let e=[...hn].sort((e,t)=>t.scoreB-t.scoreA-(e.scoreB-e.scoreA));En(e.filter(e=>e.scoreB>e.scoreA).slice(0,6),`#labWins`),En(e.reverse().filter(e=>e.scoreB<e.scoreA).slice(0,6),`#labLosses`),g(`#labLists`).hidden=i.n===0}}function kn(){$++,fn()}async function An(){if(mn){kn();return}let e=g(`#labA`).value,t=g(`#labB`).value,n=yn(e),r=yn(t);if(e===t||JSON.stringify(n.conv)===JSON.stringify(r.conv)&&JSON.stringify(n.own)===JSON.stringify(r.own)){w(`Those two versions are the same card, so they would bid every deal the same way. Pick two that differ.`);return}let i=Number(g(`#labN .on`).dataset.n),a=g(`#labSit`).value;_n=g(`#labScore .on`).dataset.s===`imp`?`imp`:`mp`,gn={a:bn(e),b:bn(t)};let o=Re(),l=new V(JSON.parse(JSON.stringify(n)),W()),u=new V(JSON.parse(JSON.stringify(r)),W()),d=++$;mn=!0,hn=[],g(`#labRun`).textContent=`Stop`,g(`#labLists`).hidden=!0,g(`#labDeal`).hidden=!0;let f=Math.floor(Math.random()*2**30),p=0,m=0,h=0,ee=[];for(;p<i&&m<i*80&&d===$;){for(let e=0;e<120&&p<i;e++){m++;let e=f+m,{dealer:t,vulNS:n,vulEW:r}=oe(m),i=c(s(e));if(a!==`any`&&!et(i,t,a,[l,o]))continue;p++;let g=tt(i,t,[l,o]),_=tt(i,t,[u,o]),v=rt(g),y=rt(_);if(nt(v,y))continue;let b={seed:e,dealer:t,vulNS:n,vulEW:r,callsA:g.auction.calls,callsB:_.auction.calls,contractA:v,contractB:y,scoreA:0,scoreB:0};h++,ee.push(dn(i).then(e=>{b.scoreA=ct(e,v,n,r).scoreNS,b.scoreB=ct(e,y,n,r).scoreNS,d===$&&hn.push(b)}).catch(()=>{}).finally(()=>{h--}))}On(p,i,h,!1),await new Promise(e=>window.setTimeout(e,0))}for(;h>0&&d===$;)On(p,i,h,!1),await new Promise(e=>window.setTimeout(e,250));await Promise.allSettled(ee),mn=!1,g(`#labRun`).textContent=`Run the test`,d!==$&&w(`Stopped. The result covers the deals finished so far.`),a!==`any`&&p<i&&d===$&&w(`Deals of that kind are rare, so fewer were found than asked for.`),On(p,i,0,!0)}function jn(){let e=g(`#labSit`);e.innerHTML=$e.map(([e,t])=>`<option value="${e}">${t}</option>`).join(``);for(let e of[`#labN`,`#labScore`])_(`${e} button`).forEach(t=>t.onclick=()=>{mn||_(`${e} button`).forEach(e=>e.classList.toggle(`on`,e===t))});g(`#labRun`).onclick=()=>void An(),g(`#labBody`).innerHTML=`<div class="scan" style="height:auto;padding:24px 0;text-align:center">Choose two versions and press “Run the test”.<br>Each dot will be one deal where they bid differently.</div>`,xn()}var Mn=document.documentElement;function Nn(e){_(`.view`).forEach(t=>t.classList.toggle(`on`,t.id===`v-`+e)),_(`.rb`).forEach((t,n)=>{let r=t.dataset.v===e;t.classList.toggle(`on`,r),r&&(g(`#ind`).style.transform=`translateY(${n*68}px)`)}),e!==`table`&&(g(`#crumb`).textContent=``),e===`progress`&&Pn(),e===`lab`&&xn(),g(`main`).scrollTop=0}function Pn(){let e=G.log,t=e.reduce((e,t)=>e+t.calls,0),n=e.reduce((e,t)=>e+t.followed,0),r=e.reduce((e,t)=>e+t.silent,0),i=e.filter(e=>e.scoreNS>=e.bestNS).length,a=(e,t,n=``)=>`<div class="ro"><span class="k">${e}</span><span class="v">${t} <small>${n}</small></span></div>`;g(`#progress`).innerHTML=a(`Boards bid`,String(e.length))+a(`Calls as on your card`,t?`${Math.round(n/t*100)}%`:`—`,t?`${n} of ${t}`:``)+a(`Card was silent`,String(r),`calls`)+a(`Reached your best contract`,e.length?`${Math.round(i/e.length*100)}%`:`—`,e.length?`${i} of ${e.length}`:``)}function Fn(){let e=G.theme?G.theme===`dark`:matchMedia(`(prefers-color-scheme: dark)`).matches;Mn.dataset.theme=e?`dark`:`light`,g(`#themeBtn`).textContent=e?`Light`:`Dark`,Mn.classList.toggle(`four`,G.four),g(`#suitBtn`).textContent=G.four?`4 colours`:`2 colours`}_(`.rb`).forEach(e=>e.onclick=()=>Nn(e.dataset.v)),g(`#themeBtn`).onclick=()=>{G.theme=Mn.dataset.theme===`dark`?`light`:`dark`,K(),Fn()},g(`#suitBtn`).onclick=()=>{G.four=!G.four,K(),Fn()},Fn(),St(),Ht(),on(),jn(),window.addEventListener(`setu:go`,e=>Nn(e.detail)),`serviceWorker`in navigator&&navigator.serviceWorker.register(`sw.js`).then(()=>{window.setTimeout(async()=>{let e=await navigator.serviceWorker.ready,t=performance.getEntriesByType(`resource`).map(e=>e.name).filter(e=>e.startsWith(location.origin));e.active?.postMessage({cache:[location.href,`how-to-use.html`,...t]})},5e3)}).catch(()=>{});