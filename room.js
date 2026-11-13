// 自习室：场景、团子、计时、休息、聊天、递茶
import { S, B, t, h, svg, ICON, num, dayKey, fmtMMSS, fmtTime, toast, nameOf, colorOf, mochi, openSheet, closeSheet, store, clean, startOfToday, kindLabel, KINDS, DURS, BREAKS, BREAK_DURS, CHEERS } from './core.js';
import { joinRoomFlow } from './study.js';
import { fmtDur } from './core.js';
const fmtDurShort = m => fmtDur(Math.floor(m / 30) * 30);

/* ---------------- 计时引擎（全局） ---------------- */
const saveMine = () => store.set('tg-mine', S.mine);
export function presenceObj() {
  const m = S.mine;
  return { room: m.room || null, st: m.st === 'writing' ? 'w' : m.st === 'break' ? 'b' : 'i', k: m.kind, a: m.act, s: m.s || 0, e: m.e || 0, t: B.TS };
}
export function pushPresence() { saveMine(); if (S.uid) B.set('presence/' + S.uid, presenceObj()).catch(() => { }); }
const logStudy = mins => { if (mins >= 1) B.txn(`stats/${S.uid}/${dayKey(new Date(S.mine.s))}/study`, v => Math.min(1440, (v || 0) + mins)).catch(() => { }); };

const BREAK_RESET = 10 * 60000, IDLE_RESET = 30 * 60000;
function closeBreak() { const m = S.mine; if (m.st === 'break' && B.now() - m.s >= BREAK_RESET) m.streak = 0; }
const addStreak = mins => { const m = S.mine; m.streak = (m.streak || 0) + Math.max(0, mins); m.lastAct = B.now(); };
export const continuousMin = () => { const m = S.mine; return (m.streak || 0) + (m.st === 'writing' ? Math.max(0, (B.now() - m.s) / 60000) : 0); };
export function startRound() { const m = S.mine; closeBreak(); if (m.lastAct && B.now() - m.lastAct > IDLE_RESET) m.streak = 0; m.warned = m.warned || 0; m.lastAct = B.now(); m.st = 'writing'; m.s = B.now(); m.e = m.dur ? m.s + m.dur * 60000 : 0; pushPresence(); emitChange(); }
export function endRound(goBreak) {
  const m = S.mine, end = m.e ? Math.min(B.now(), m.e) : B.now();
  const mins = Math.min(600, Math.round((end - m.s) / 60000));
  logStudy(mins); addStreak(mins); if (mins >= 1) toast(t('roundDone', num(mins)));
  if (goBreak) { m.st = 'break'; m.s = B.now(); m.e = m.s + m.bdur * 60000; } else { m.st = 'idle'; m.s = 0; m.e = 0; }
  pushPresence(); emitChange();
}
export function startBreak() {
  const m = S.mine;
  if (m.st === 'writing') { const end = m.e ? Math.min(B.now(), m.e) : B.now(); const mm = Math.min(600, Math.round((end - m.s) / 60000)); logStudy(mm); addStreak(mm); }
  m.st = 'break'; m.s = B.now(); m.e = m.s + m.bdur * 60000; pushPresence(); emitChange();
}
export function stopAll() { const m = S.mine; closeBreak(); m.lastAct = B.now(); m.st = 'idle'; m.s = 0; m.e = 0; pushPresence(); emitChange(); }
const changeCbs = new Set();
export const onMineChange = fn => { changeCbs.add(fn); return () => changeCbs.delete(fn); };
const emitChange = () => changeCbs.forEach(f => f());

export function tick() {
  const n = B ? B.now() : Date.now();
  if (S.mine.st === 'writing') { const c = continuousMin(), mile = c >= 120 ? Math.floor((c - 120) / 60) + 1 : 0; if (mile > (S.mine.warned || 0)) { S.mine.warned = mile; saveMine(); toast(t('careStreak', fmtDurShort(c))); emitChange(); } }
  else if (S.mine.streak === 0) S.mine.warned = 0;
  document.querySelectorAll('[data-tick]').forEach(el => {
    const s = +el.dataset.s, e = +el.dataset.e;
    el.textContent = e ? fmtMMSS(e - n) : fmtMMSS(n - s);
  });
  const m = S.mine;
  if (m.st !== 'idle' && m.e && n >= m.e) {
    if (m.st === 'writing') { const mins = Math.min(600, Math.round((m.e - m.s) / 60000)); logStudy(mins); addStreak(mins); toast(t('roundDone', num(mins))); m.st = 'break'; m.s = n; m.e = n + m.bdur * 60000; pushPresence(); emitChange(); }
    else { toast(t('breakOver')); stopAll(); }
  }
}
export function restoreTimer() {
  const m = S.mine, n = B.now();
  if (m.st !== 'idle' && m.e && n > m.e) { if (m.st === 'writing') logStudy(Math.min(600, Math.round((m.e - m.s) / 60000))); m.st = 'idle'; m.s = 0; m.e = 0; }
  if (m.st === 'idle') m.room = null;
}

/* ---------------- 场景 ---------------- */
export const SCENES = {
  day: { sky: ['#bfe3ff', '#eef8ff'], wall: '#f6efe4', floor: '#efe2d0', frame: '#ffffff', label: '#5a5766', sun: [250, 22, '#ffe08a', 'rgba(255,224,138,.6)'], clouds: 1 },
  night: { sky: ['#1d2450', '#3b4680'], wall: '#40456e', floor: '#363a5f', frame: '#5a6091', label: '#dfe2fb', moon: 1, stars: 1 },
  beach: { sky: ['#9fdcf5', '#e9f8ff'], wall: '#eef6f4', floor: '#e6efe9', frame: '#ffffff', label: '#4f5a5a', sun: [60, 14, '#fff1b0', 'rgba(255,241,176,.6)'], sea: 1, clouds: 1 },
  stars: { sky: ['#0c1030', '#2a1f55'], wall: '#2e2b52', floor: '#262446', frame: '#4a4677', label: '#dcd9f5', stars: 1, shoot: 1 },
  sunset: { sky: ['#f7a688', '#fbd9a8'], wall: '#f6e2d4', floor: '#efd5c3', frame: '#ffffff', label: '#6a4c40', sun: [130, 70, '#ffcf7a', 'rgba(255,170,90,.6)'], hills: 1 },
  forest: { sky: ['#d9eecf', '#f2f8ec'], wall: '#eef2e6', floor: '#e3e9d6', frame: '#ffffff', label: '#4b5a44', trees: 1, clouds: 1, sun: [270, 16, '#fff3c4', 'rgba(255,243,196,.6)'] }
};
const STARS = [[8, 20, 2, 0], [18, 60, 1.5, .6], [28, 30, 2, 1.2], [40, 12, 1.5, .3], [52, 48, 2, 1.8], [60, 22, 1.5, .9], [70, 64, 2, .4], [78, 14, 2, 1.5], [88, 40, 1.5, 2], [94, 70, 1.5, .7], [34, 72, 1.5, 2.2], [12, 82, 2, 1]];
const TREES = [[-6, 18, 70, '#7fae7a', 0], [30, 14, 54, '#9cc28f', .5], [78, 20, 80, '#6f9f6c', 1], [200, 16, 60, '#9cc28f', .3], [240, 22, 86, '#7fae7a', .8], [290, 14, 58, '#6f9f6c', 1.2]];
function sceneWindow(c) {
  const w = h('div', { class: 'window', style: `background:linear-gradient(180deg,${c.sky[0]},${c.sky[1]})` });
  if (c.sun) w.append(h('div', { style: `position:absolute;left:${c.sun[0]}px;top:${c.sun[1]}px;width:38px;height:38px;border-radius:50%;background:${c.sun[2]};box-shadow:0 0 30px 8px ${c.sun[3]}` }));
  if (c.moon) w.append(h('div', { style: 'position:absolute;right:40px;top:20px;width:30px;height:30px;border-radius:50%;background:#fff6dc;box-shadow:0 0 20px 4px rgba(255,246,220,.35)' }), h('div', { style: `position:absolute;right:32px;top:15px;width:30px;height:30px;border-radius:50%;background:${c.sky[0]}` }));
  if (c.stars) STARS.forEach(([x, y, r, d]) => w.append(h('div', { class: 'd-star', style: `left:${x}%;top:${y}%;width:${r}px;height:${r}px;animation-delay:${d}s` })));
  if (c.shoot) w.append(h('div', { class: 'd-shoot' }));
  if (c.clouds) w.append(h('div', { class: 'd-cloud', style: 'left:30px;top:30px;width:60px;height:18px' }), h('div', { class: 'd-cloud', style: 'left:170px;top:54px;width:44px;height:14px;animation-delay:-3s' }));
  if (c.sea) w.append(h('div', { style: 'position:absolute;left:0;right:0;bottom:26px;height:40px;background:#6cc3df' }), h('div', { class: 'd-wave', style: 'bottom:56px' }), h('div', { style: 'position:absolute;left:0;right:0;bottom:0;height:28px;background:#f3e1b9' }));
  if (c.hills) w.append(h('div', { style: 'position:absolute;left:-30px;bottom:-40px;width:220px;height:90px;border-radius:50%;background:#8f6f8f' }), h('div', { style: 'position:absolute;right:-40px;bottom:-50px;width:260px;height:100px;border-radius:50%;background:#6f5577' }));
  if (c.trees) TREES.forEach(([x, wd, ht, col, d]) => w.append(h('div', { class: 'd-tree', style: `left:${x}px;border-left:${wd}px solid transparent;border-right:${wd}px solid transparent;border-bottom:${ht}px solid ${col};animation-delay:${d}s` })));
  w.append(h('div', { style: `position:absolute;left:50%;top:0;bottom:0;width:4px;margin-left:-2px;background:${c.frame}` }));
  return w;
}

/* ---------------- 自习室页面 ---------------- */
export function viewRoom(ctx, id) {
  const isPub = id === 'public';
  const title = h('div', { style: 'font-weight:600;font-size:17px', text: isPub ? t('publicRoom') : '…' });
  const sub = h('div', { class: 'small muted' });
  const scene = h('div', { class: 'scene' });
  const sceneBtns = h('div', { class: 'scenes' });
  const timerBox = h('div');
  const careBox = h('div');
  const msgs = h('div', { class: 'msgs', 'aria-live': 'polite' });
  const input = h('input', { class: 'inp', maxlength: '500', placeholder: t('chatPh'), 'aria-label': t('chatPh'), onkeydown: e => { if (e.key === 'Enter' && !e.isComposing) send(); } });
  let openCheer = null;
  const seenCheer = new Set();

  const enter = () => { if (S.mine.room !== id) { S.mine.room = id; pushPresence(); } };
  if (isPub) enter();
  else B.get(`myRooms/${S.uid}/${id}`).then(ok => {
    if (!ok) { location.hash = '#study'; B.get('rooms/' + id).then(r => r && joinRoomFlow(id, r.name)); return; }
    enter();
  });
  if (!isPub) ctx.sub('rooms/' + id, r => { title.textContent = r ? r.name : t('roomGone'); });
  ctx.cleanup(() => { if (S.mine.st === 'idle' && S.mine.room === id) { S.mine.room = null; pushPresence(); } });

  const paintScene = () => {
    const c = SCENES[S.scene] || SCENES.day;
    scene.style.background = c.wall;
    const residents = [{ uid: S.uid, me: true, p: presenceObj() }];
    for (const [uid, p] of Object.entries(S.presence || {})) if (uid !== S.uid && p && p.room === id) residents.push({ uid, p });
    const rank = p => ({ w: 3, b: 2 }[p.st] || 1);
    residents.sort((a, b) => (b.me ? 1 : 0) - (a.me ? 1 : 0) || rank(b.p) - rank(a.p));
    const w = residents.filter(r => r.p.st === 'w').length;
    sub.textContent = t('roomHere', num(residents.length), num(w));
    const seats = h('div', { class: 'seats' });
    residents.slice(0, 9).forEach(r => {
      const p = r.p, act = p.st === 'w' ? 'write' : p.st === 'b' ? (BREAKS.includes(p.a) ? p.a : 'water') : 'idle';
      const what = p.st === 'w' ? kindLabel(p.k) : p.st === 'b' ? t('brk_' + act) : t('justHere');
      const seat = h('div', { class: 'seat' + (r.me ? '' : ' other'), 'data-uid': r.uid },
        h('div', { style: 'position:absolute;top:-8px' }, mochi(act, colorOf(r.uid))),
        h('div', { class: 'desk' }),
        h('div', { class: 'lbl', style: `color:${c.label}`, text: `${r.me ? t('you') : nameOf(r.uid)} · ${what}` }));
      if (!r.me) {
        seat.setAttribute('role', 'button'); seat.setAttribute('tabindex', '0'); seat.setAttribute('aria-label', t('cheerFor', nameOf(r.uid)));
        seat.onclick = e => { e.stopPropagation(); openCheer = openCheer === r.uid ? null : r.uid; paintScene(); };
        if (openCheer === r.uid) seat.append(h('div', { class: 'cheerbar' }, CHEERS.map((emo, i) => h('button', { 'aria-label': emo, text: emo, onclick: ev => { ev.stopPropagation(); openCheer = null; B.push(`cheers/${r.uid}`, { from: S.uid, e: i, t: B.TS }).catch(() => { }); paintScene(); floatAt(r.uid, emo); } }))));
      }
      seats.append(seat);
    });
    scene.replaceChildren(sceneWindow(c), h('div', { class: 'floor', style: `background:${c.floor}` }), seats);
  };
  const floatAt = (uid, emo) => { const s = scene.querySelector(`[data-uid="${CSS.escape(uid)}"]`); if (!s) return; const f = h('div', { class: 'float', text: emo }); s.append(f); setTimeout(() => f.remove(), 1900); };
  ctx.onCheer(c => floatAt(S.uid, CHEERS[c.e]));
  const docClick = () => { if (openCheer) { openCheer = null; paintScene(); } };
  document.addEventListener('click', docClick); ctx.cleanup(() => document.removeEventListener('click', docClick));

  const paintSceneBtns = () => sceneBtns.replaceChildren(...Object.entries(SCENES).map(([k, c]) => h('button', { class: 'scene-btn' + (S.scene === k ? ' on' : ''), 'aria-pressed': String(S.scene === k), onclick: () => { S.scene = k; store.set('tg-scene', k); paintSceneBtns(); paintScene(); } }, h('span', { style: `background:linear-gradient(180deg,${c.sky[0]},${c.sky[1]})` }), t('scene_' + k))));

  const paintCare = () => {
    const m = S.mine, hr = new Date().getHours(), c = continuousMin();
    const late = m.st === 'writing' && (hr >= 23 || hr < 5);
    if (m.st !== 'writing' || (c < 120 && !late)) { careBox.replaceChildren(); return; }
    careBox.replaceChildren(h('div', { class: 'card row care', role: 'note', style: 'gap:12px' },
      h('div', { style: 'width:52px;height:52px;position:relative;flex:none' }, h('div', { style: 'position:absolute;left:-24px;top:-44px' }, mochi('stretch', colorOf(S.uid), .52))),
      h('div', { class: 'grow', style: 'font-size:14px;line-height:1.6', text: c >= 120 ? t('careStreak', fmtDurShort(c)) : t('careLateWriting') }),
      h('button', { class: 'btn sm warm', text: t('careBreak10'), onclick: () => { m.bdur = 10; if (!BREAKS.includes(m.act)) m.act = 'walk'; startBreak(); } })));
  };
  const careTimer = setInterval(paintCare, 30000); ctx.cleanup(() => clearInterval(careTimer));
  const paintTimer = () => {
    const m = S.mine;
    paintCare();
    if (m.st === 'idle') {
      const kinds = h('div', { class: 'chips' }), durs = h('div', { class: 'chips' });
      const draw = () => {
        const mineK = store.get('tg-kinds', []);
        const pick = k => h('button', { class: 'chip' + (m.kind === k ? ' on' : ''), text: kindLabel(k), onclick: () => { m.kind = k; saveMine(); draw(); } });
        const del = k => h('button', { class: 'chip', style: 'padding:0 9px;color:var(--muted)', 'aria-label': t('delete'), text: '×', onclick: () => { store.set('tg-kinds', mineK.filter(x => x !== k)); if (m.kind === k) { m.kind = KINDS[0]; saveMine(); } draw(); } });
        const inp = h('input', { class: 'inp', maxlength: '12', placeholder: t('customTagPh'), style: 'height:36px;padding:0 12px;font-size:14px;width:130px;border-radius:999px' });
        const add = () => { const v = clean(inp.value, 12); if (!v) return; const k = 'c:' + v; if (!mineK.includes(k)) store.set('tg-kinds', [...mineK, k].slice(-8)); m.kind = k; saveMine(); draw(); };
        inp.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); add(); } };
        kinds.replaceChildren(...KINDS.map(pick), ...mineK.flatMap(k => m.kind === k ? [pick(k), del(k)] : [pick(k)]), inp, h('button', { type: 'button', class: 'chip dash', 'aria-label': t('addTag'), text: '+', onclick: add }));
        durs.replaceChildren(...DURS.map(d => h('button', { class: 'chip' + (m.dur === d ? ' on' : ''), text: d ? t('minN', num(d)) : t('open'), onclick: () => { m.dur = d; saveMine(); draw(); } })));
      };
      draw();
      timerBox.replaceChildren(h('div', { class: 'card stack', style: 'gap:14px' },
        h('div', { class: 'field' }, t('doing'), kinds), h('div', { class: 'field' }, t('howLong'), durs),
        h('button', { class: 'btn full', text: t('startWriting'), onclick: () => { enter(); startRound(); } }),
        h('div', { class: 'note', text: t('privacyWriting') })));
    } else {
      const writing = m.st === 'writing';
      timerBox.replaceChildren(h('div', { class: 'card row', style: 'gap:12px' },
        h('div', { class: 'grow' },
          h('div', { class: 'small muted', text: writing ? `${kindLabel(m.kind)} · ${m.dur ? t('minN', num(m.dur)) : t('open')}` : `${t('onBreak')} · ${t('brk_' + m.act)}` }),
          h('div', { class: 'timer-big', 'data-tick': '1', 'data-s': m.s, 'data-e': m.e, 'aria-live': 'off', text: '00:00' })),
        writing ? h('button', { class: 'btn sm soft', text: t('takeBreak'), onclick: breakSheet }) : h('button', { class: 'btn sm soft', text: t('again'), onclick: startRound }),
        h('button', { class: 'btn sm', text: writing ? t('end') : t('lightsOff'), onclick: () => writing ? endRound(false) : stopAll() })));
      tick();
    }
  };
  const breakSheet = () => {
    const m = S.mine;
    const acts = h('div', { class: 'acts' }), durs = h('div', { class: 'chips' });
    const draw = () => {
      acts.replaceChildren(...BREAKS.map(k => h('button', { class: 'act' + (m.act === k ? ' on' : ''), 'aria-pressed': String(m.act === k), onclick: () => { m.act = k; saveMine(); draw(); } },
        h('span', { style: 'display:block;width:84px;height:84px;position:relative;overflow:visible' }, h('span', { style: 'position:absolute;left:-8px;top:-8px;display:block' }, mochi(k, colorOf(S.uid), .84))), t('brk_' + k))));
      durs.replaceChildren(...BREAK_DURS.map(d => h('button', { class: 'chip' + (m.bdur === d ? ' on' : ''), text: t('minN', num(d)), onclick: () => { m.bdur = d; saveMine(); draw(); } })));
    };
    draw();
    openSheet(t('breakTitle'), h('div', { class: 'stack' }, h('div', { class: 'note', style: 'margin-top:-8px', text: t('breakSub') }), acts, h('div', { class: 'field' }, t('breakLen'), durs),
      h('button', { class: 'btn full', text: t('startBreak'), onclick: () => { closeSheet(); startBreak(); } })));
  };

  async function send() {
    const v = clean(input.value, 500); if (!v) return;
    input.value = '';
    await B.push(`chats/${id}`, { uid: S.uid, text: v, t: B.TS }).catch(() => toast(t('errGeneric')));
  }
  ctx.sub(`chats/${id}`, v => {
    const since = startOfToday();
    const arr = Object.values(v || {}).filter(m => m && m.t >= since).sort((a, b) => a.t - b.t);
    if (!arr.length) { msgs.replaceChildren(h('div', { class: 'sys', text: t('chatEmpty') })); return; }
    const atBottom = msgs.scrollHeight - msgs.scrollTop - msgs.clientHeight < 40;
    msgs.replaceChildren(...arr.map(m => {
      const me = m.uid === S.uid;
      return h('div', { class: 'msg' + (me ? ' me' : '') }, me ? null : h('span', { class: 'av', style: `background:${colorOf(m.uid)}`, text: [...nameOf(m.uid)][0] }),
        h('div', { style: `display:flex;flex-direction:column;${me ? 'align-items:flex-end' : ''};max-width:80%` }, h('div', { class: 'who', text: `${me ? t('you') : nameOf(m.uid)} · ${fmtTime(new Date(m.t))}` }), h('div', { class: 'bub', style: 'max-width:100%', text: m.text })));
    }));
    if (atBottom || arr[arr.length - 1].uid === S.uid) msgs.scrollTop = msgs.scrollHeight;
  }, { limitLast: 100 });

  ctx.onPresence(paintScene);
  ctx.cleanup(onMineChange(() => { paintTimer(); paintScene(); }));
  paintScene(); paintSceneBtns(); paintTimer();
  return h('div', { class: 'wrap stack' },
    h('div', { class: 'row' }, h('a', { href: '#study', class: 'btn ghost', style: 'width:44px;padding:0', 'aria-label': t('back') }, svg(ICON.back, 20)), h('div', { class: 'grow' }, title, sub)),
    scene,
    h('div', { class: 'stack', style: 'gap:8px' }, h('div', { class: 'small muted', text: t('sceneNote') }), sceneBtns),
    careBox, timerBox,
    h('section', { class: 'card stack', style: 'gap:12px' },
      h('div', { class: 'between' }, h('div', { class: 'card-t', text: t('chat') }), h('div', { class: 'small muted', text: t('chatToday') })),
      msgs, h('div', { class: 'row' }, input, h('button', { class: 'btn sm', text: t('send'), onclick: send }))));
}
