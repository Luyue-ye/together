// 主页 · 广场
import { S, B, t, h, svg, ICON, num, dayKey, fmtDate, fmtDur, fmtTime, toast, avatar, nameOf, mochi, colorOf, DEMO, clean, lang, store } from './core.js';

const mix = (a, b, k) => {
  const pa = [1, 3, 5].map(i => parseInt(a.slice(i, i + 2), 16)), pb = [1, 3, 5].map(i => parseInt(b.slice(i, i + 2), 16));
  return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * k).toString(16).padStart(2, '0')).join('');
};

export function moodFace(tired, happy) {
  const face = mix('#cdd3f7', '#ffd9a6', happy / 10);
  const eyeRy = Math.max(1.5, 7 - tired * 0.55).toFixed(1);
  // 嘴巴：0 分是一个小圆点，越开心越宽、越弯
  const half = 3 + happy * 2.1, depth = happy * 1.7;
  const mouth = happy <= 0 ? '<circle cx="56" cy="76" r="3.4" fill="#3a3550"/>' : `<path d="M${(56 - half).toFixed(1)} 76 Q56 ${(76 + depth * 2).toFixed(1)} ${(56 + half).toFixed(1)} 76" fill="none" stroke="#3a3550" stroke-width="4" stroke-linecap="round"/>`;
  const wrap = h('div', { class: 'mood-face' });
  wrap.append(h('div', { class: 'mood-halo', style: `background:${face}` }));
  if (tired >= 6) wrap.append(h('div', { class: 'mood-z', style: 'inset-inline-start:calc(50% + 62px);top:10px;font-size:15px', text: 'z' }), h('div', { class: 'mood-z', style: 'inset-inline-start:calc(50% + 72px);top:2px;font-size:12px;animation-delay:1.2s', text: 'z' }));
  if (happy >= 7) wrap.append(h('div', { class: 'mood-spark', style: 'inset-inline-start:calc(50% - 76px);top:8px;width:8px;height:8px' }), h('div', { class: 'mood-spark', style: 'inset-inline-start:calc(50% + 80px);top:34px;width:6px;height:6px;animation-delay:.7s' }), h('div', { class: 'mood-spark', style: 'inset-inline-start:calc(50% - 88px);top:72px;width:5px;height:5px;animation-delay:1.4s' }));
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.setAttribute('width', '112'); s.setAttribute('height', '112'); s.setAttribute('viewBox', '0 0 112 112'); s.setAttribute('class', 'mood-svg'); s.setAttribute('role', 'img'); s.setAttribute('aria-label', t('moodFace'));
  s.innerHTML = `<circle cx="56" cy="56" r="50" fill="${face}"/><ellipse cx="38" cy="50" rx="6" ry="${eyeRy}" fill="#3a3550"/><ellipse cx="74" cy="50" rx="6" ry="${eyeRy}" fill="#3a3550"/><circle cx="30" cy="66" r="7" fill="#f6a7a0" opacity="${(happy / 10 * .8).toFixed(2)}"/><circle cx="82" cy="66" r="7" fill="#f6a7a0" opacity="${(happy / 10 * .8).toFixed(2)}"/>${mouth}`;
  wrap.append(s);
  return wrap;
}
const feeling = (tt, hh) => tt >= 7 && hh <= 4 ? t('feel1') : tt >= 7 ? t('feel2') : hh >= 8 ? t('feel3') : hh <= 3 ? t('feel4') : t('feel0');

function moodCard(ctx) {
  const st = { tired: 0, happy: 0, saved: false, touched: false };
  const card = h('section', { class: 'mood', 'aria-label': t('howAreYou') });
  const faceBox = h('div'), feelBox = h('div', { style: 'text-align:center;font-size:14px;color:#4e5276;min-height:22px' });
  const mk = (key, label, grad) => {
    const val = h('span', { style: 'font-weight:600;color:#2f3566' });
    const fill = h('span', { class: 'fill', style: `background:linear-gradient(90deg,${grad})` });
    const input = h('input', { type: 'range', min: '0', max: '10', step: '1', 'aria-label': label, oninput: e => { st[key] = Number(e.target.value); st.touched = true; paint(); } });
    return { val, fill, input, el: h('label', { style: 'display:flex;flex-direction:column;gap:4px' }, h('span', { class: 'between', style: 'font-size:13px;color:#4e5276' }, h('span', { text: label }), val), h('span', { class: 'slider' }, h('span', { class: 'track' }), fill, input)) };
  };
  const T = mk('tired', t('tired'), '#c9cff5,#7a83c8'), H = mk('happy', t('happy'), '#ffe0b8,#f3a462');
  const save = h('button', { class: 'btn full', style: 'margin-top:16px', onclick: async () => {
    save.disabled = true;
    try { await B.set(`mood/${dayKey()}/${S.uid}`, { tired: st.tired, happy: st.happy, t: B.TS }); st.saved = true; toast(st.tired >= 8 ? t('careTiredToast') : t('moodSaved')); }
    catch (e) { toast(t('errGeneric')); }
    save.disabled = false; paint();
  } });
  function paint() {
    card.style.background = `linear-gradient(160deg,${mix('#eef0ff', '#fff6ea', st.happy / 10)},${mix('#e3e6fa', '#ffe9d3', st.happy / 10)})`;
    faceBox.replaceChildren(moodFace(st.tired, st.happy));
    feelBox.textContent = st.touched || st.saved ? feeling(st.tired, st.happy) : t('moodPrompt');
    for (const [o, v] of [[T, st.tired], [H, st.happy]]) { o.val.textContent = `${num(v)} / ${num(10)}`; o.fill.style.width = v * 10 + '%'; o.input.value = v; }
    save.textContent = st.saved ? t('moodUpdate') : t('moodSave');
  }
  card.append(
    h('div', { class: 'between' }, h('div', { style: 'font-family:var(--brand);font-weight:700;font-size:21px;color:#2f3566', text: t('howAreYou') }), h('div', { class: 'small', style: 'color:#6f7398', text: t('at9') })),
    faceBox, feelBox, h('div', { class: 'stack', style: 'gap:12px;margin-top:14px' }, T.el, H.el), save,
    h('div', { class: 'tiny', style: 'text-align:center;color:#6f7398;margin-top:8px', text: t('moodPrivacy') }));
  ctx.sub(`mood/${dayKey()}/${S.uid}`, v => { if (v && !st.touched) { st.tired = v.tired; st.happy = v.happy; st.saved = true; paint(); } });
  T.input.addEventListener('pointerdown', () => st.touched = true); H.input.addEventListener('pointerdown', () => st.touched = true);
  paint();
  return card;
}


// 关心提醒：太累、心情连续低落、学得太久、太晚，就温柔地提醒一下
const CARE = { url: 'https://counselingcenter.gsu.edu/contact-us/', phone: '404-413-1640' };
function careCard(ctx) {
  const box = h('div');
  const days = [0, 1, 2].map(i => dayKey(new Date(Date.now() - i * 864e5)));
  const mood = {}; let studyToday = 0;
  const paint = () => {
    const today = days[0], hr = new Date().getHours();
    const m = days.map(d => mood[d]).filter(Boolean);
    const all3 = m.length === 3;
    let key = null;
    if (all3 && m.every(x => x.happy <= 3)) key = 'low3';
    else if (all3 && m.every(x => x.tired >= 7)) key = 'tired3';
    else if (mood[today] && mood[today].tired >= 8) key = 'tiredToday';
    else if (studyToday >= 360) key = 'study6';
    else if (hr < 5) key = 'late';
    if (!key || store.get(`tg-care-${today}-${key}`, false)) { box.replaceChildren(); return; }
    const close = () => { store.set(`tg-care-${today}-${key}`, true); box.replaceChildren(); };
    const msg = key === 'study6' ? t('care_study6', fmtDur(studyToday)) : t('care_' + key);
    box.replaceChildren(h('section', { class: 'card stack care', style: 'gap:10px', role: 'note' },
      h('div', { class: 'row', style: 'gap:10px;align-items:flex-start' },
        h('div', { style: 'width:56px;height:56px;position:relative;flex:none' }, h('div', { style: 'position:absolute;left:-22px;top:-40px' }, mochi(key === 'late' ? 'dream' : key === 'study6' ? 'stretch' : 'water', colorOf(S.uid), .56))),
        h('div', { class: 'grow' }, h('div', { class: 'card-t', text: t('careTitle') }), h('div', { style: 'font-size:14px;line-height:1.7;margin-top:4px', text: msg }))),
      key === 'low3' ? h('div', { class: 'stack', style: 'gap:8px' },
        h('a', { class: 'btn sm soft', style: 'align-self:flex-start', href: CARE.url, target: '_blank', rel: 'noopener' }, t('careCounsel'), svg(ICON.out, 14)),
        h('div', { class: 'note', text: t('careUrgent') })) : null,
      h('div', { class: 'row' },
        key === 'tired3' || key === 'tiredToday' || key === 'study6' ? h('a', { class: 'btn sm warm', href: '#life', text: t('careGoLife') }) : null,
        h('button', { class: 'btn sm ghost', text: t('careGotIt'), onclick: close }))));
  };
  days.forEach(d => ctx.sub(`mood/${d}/${S.uid}`, v => { mood[d] = v; paint(); }));
  ctx.sub(`stats/${S.uid}/${days[0]}/study`, v => { studyToday = v || 0; paint(); });
  return box;
}

function memoCard(ctx) {
  const list = h('div', { class: 'stack', style: 'gap:12px' });
  const input = h('input', { class: 'inp', placeholder: t('memoPh'), maxlength: '120', 'aria-label': t('memoPh'), onkeydown: e => { if (e.key === 'Enter') add(); } });
  async function add() {
    const v = clean(input.value, 120); if (!v) return;
    input.value = '';
    await B.push(`memos/${S.uid}`, { text: v, done: false, day: dayKey(), t: B.TS }).catch(() => toast(t('errGeneric')));
  }
  ctx.sub(`memos/${S.uid}`, v => {
    const today = dayKey();
    const items = Object.entries(v || {}).map(([id, m]) => ({ id, ...m })).filter(m => !m.done || m.day === today).sort((a, b) => (a.t || 0) - (b.t || 0));
    if (!items.length) { list.replaceChildren(h('div', { class: 'note', text: t('memoEmpty') })); return; }
    list.replaceChildren(...items.map(m => h('div', { class: 'between' },
      h('label', { class: 'check grow' }, h('input', { type: 'checkbox', checked: m.done, onchange: e => B.update({ [`memos/${S.uid}/${m.id}/done`]: e.target.checked, [`memos/${S.uid}/${m.id}/day`]: today }) }), h('span', { class: (m.done ? 'done-text ' : '') + 'ugc', text: m.text })),
      h('button', { class: 'linkbtn', style: 'text-decoration:none;padding:4px', 'aria-label': t('delete'), onclick: () => B.remove(`memos/${S.uid}/${m.id}`) }, svg(ICON.x, 16)))));
  });
  return h('section', { class: 'card stack', style: 'gap:14px' },
    h('div', { class: 'card-t', text: t('memoTitle') }), list,
    h('div', { class: 'row' }, input, h('button', { class: 'btn sm soft', onclick: add, text: t('add') })));
}

// 团子跷跷板：这周哪边时间多，哪边往下沉；打开时晃两下才停稳，轻的那只会被颠起来，点一下会再晃
function seesaw() {
  const d = (cls, st, ...k) => h('div', { class: cls, style: st || '' }, ...k);
  const mS = d('ss-mo ss-l'), mL = d('ss-mo ss-r');
  const plank = d('ss-plank', '', d('ss-board'), mS, mL);
  const el = d('ss', '', d('ss-pivot'), plank);
  let cur = null;
  const wobble = () => { plank.classList.remove('ss-wob'); void plank.offsetWidth; plank.classList.add('ss-wob'); };
  el.addEventListener('click', wobble);
  el.update = (sShare, lShare, empty) => {
    const tilt = empty ? 0 : Math.max(-14, Math.min(14, (lShare - sShare) * 22));
    const key = tilt.toFixed(1) + (empty ? 'e' : '');
    if (key === cur) return;
    const first = cur === null; cur = key;
    plank.style.setProperty('--tilt', tilt + 'deg');
    const sc = x => (empty ? .78 : .62 + .36 * Math.sqrt(x)).toFixed(2);
    const sit = x => `bottom:${(8 - 10 * sc(x)).toFixed(1)}px`;
    mS.style.cssText = sit(sShare); mL.style.cssText = sit(lShare);
    mS.replaceChildren(h('div', { class: 'ss-hop' + (!empty && sShare < lShare ? ' on' : '') }, mochi('idle', '#cdd2f7', +sc(sShare))));
    mL.replaceChildren(h('div', { class: 'ss-hop' + (!empty && lShare < sShare ? ' on' : '') }, mochi('idle', '#ffd6b0', +sc(lShare))));
    if (first) wobble();
  };
  return el;
}

function balanceCard(ctx) {
  // 本周平衡（团子跷跷板）+ 昨晚汇总，合在一张卡片里
  const box = h('section', { class: 'card stack', style: 'gap:14px' });
  const stage = seesaw();
  let stats = {}, hang = {}, joins = {}, digests = {};
  const paint = () => {
    const keys = new Set(Array.from({ length: 7 }, (_, i) => dayKey(new Date(Date.now() - i * 864e5))));
    let study = 0; for (const [d, v] of Object.entries(stats || {})) if (keys.has(d)) study += (v && v.study) || 0;
    const weekAgo = Date.now() - 7 * 864e5;
    let life = 0; for (const [id, x] of Object.entries(hang || {})) { const j = (joins || {})[id] || {}; const at = x.mode === 'plan' ? x.whenAt : x.created; if (j[S.uid] && at >= weekAgo && at <= Date.now() + 864e5) life++; }
    const sH = study / 60, lH = life * 1.5, tot = sH + lH;
    const sShare = tot ? sH / tot : .5, lShare = tot ? lH / tot : .5;
    stage.update(sShare, lShare, !tot);
    const dk = Object.keys(digests || {}).sort(), lk = dk[dk.length - 1], d = lk ? digests[lk] : null;
    const lbl = lk ? (lk === dayKey() ? t('tonight') : t('lastNight')) : t('lastNight');
    const show = d && d.n >= 3;
    box.replaceChildren(
      h('div', { class: 'between' }, h('div', { class: 'card-t', text: t('balance') }), h('div', { class: 'small muted', text: t('last7') })),
      h('div', { class: 'bal-stage', role: 'img', 'aria-label': `${t('studyTogether')} ${fmtDur(study)}, ${t('lifeTogether')} ${t('timesN', num(life))}` }, stage),
      h('div', { class: 'two' },
        h('div', null, h('div', { class: 'small row', style: 'gap:6px;color:var(--muted)' }, h('i', { style: 'width:9px;height:9px;border-radius:50%;background:linear-gradient(150deg,#c9cff5,#7a83c8)' }), t('studyTogether')), h('div', { class: 'num', style: 'font-size:22px;color:#4a54a3;margin-top:2px', text: fmtDur(study) })),
        h('div', null, h('div', { class: 'small row', style: 'gap:6px;color:var(--muted)' }, h('i', { style: 'width:9px;height:9px;border-radius:50%;background:linear-gradient(150deg,#ffe0b8,#f3a462)' }), t('lifeTogether')), h('div', { class: 'num', style: 'font-size:22px;color:#b06a2c;margin-top:2px', text: t('timesN', num(life)) }))),
      sH >= 5 && life === 0 ? h('div', { class: 'small', style: 'background:var(--warm-soft);color:#8a5a2c;border-radius:14px;padding:10px 14px;line-height:1.6', text: t('tipBalance') }) : null,
      h('div', { style: 'height:1px;background:var(--line)' }),
      h('a', { href: '#digest', class: 'stack', style: 'gap:10px;text-decoration:none;color:inherit' },
        h('div', { class: 'between' }, h('div', { class: 'small', style: 'font-weight:600', text: `${lbl} 21:00` }), h('div', { class: 'small', style: 'color:var(--pri)', text: (d ? t('nCheckins', num(d.n)) + ' · ' : '') + t('boardLink') })),
        h('div', { class: 'two' },
          h('div', { style: 'background:var(--pri-soft);border-radius:18px;padding:12px 14px;color:#3f4887' }, h('div', { class: 'small', text: t('avgTired') }), h('div', { class: 'num', style: 'font-size:26px', text: show ? num(d.tired, 1) : '—' })),
          h('div', { style: 'background:var(--warm-soft);border-radius:18px;padding:12px 14px;color:var(--warm-ink)' }, h('div', { class: 'small', text: t('avgHappy') }), h('div', { class: 'num', style: 'font-size:26px', text: show ? num(d.happy, 1) : '—' }))),
        d ? null : h('div', { class: 'note', text: t('noDigest') })));
  };
  ctx.sub(`stats/${S.uid}`, v => { stats = v; paint(); });
  ctx.sub('hangouts', v => { hang = v; paint(); });
  ctx.sub('hangJoins', v => { joins = v; paint(); });
  ctx.sub('moodDigest', v => { digests = v; paint(); }, { limitLast: 2 });
  return box;
}

function nowCard(ctx) {
  const box = h('section', { class: 'stack', style: 'gap:12px' });
  let hang = {};
  const paint = () => {
    const here = Object.values(S.presence || {}).filter(p => p && p.room === 'public');
    const w = here.filter(p => p.st === 'w').length, b = here.filter(p => p.st === 'b').length;
    const next = Object.entries(hang || {}).map(([id, x]) => ({ id, ...x })).filter(x => x.mode === 'plan' && x.whenAt > Date.now() - 3600e3).sort((a, c) => a.whenAt - c.whenAt)[0];
    box.replaceChildren(
      h('a', { href: '#room/public', class: 'card between', style: 'text-decoration:none;color:var(--ink)' },
        h('div', { class: 'row' }, h('div', { style: 'width:64px;height:64px;position:relative;flex:none' }, h('div', { style: 'position:absolute;left:-18px;top:-36px' }, mochi('write', colorOf(S.uid), .64))),
          h('div', null, h('div', { style: 'font-weight:600', text: t('publicRoom') }), h('div', { class: 'small muted', text: t('roomCount', num(w), num(b)) }))),
        h('span', { class: 'small', style: 'color:var(--pri);font-weight:600', text: t('goSit') })),
      next ? h('a', { href: '#life', class: 'card between', style: 'text-decoration:none;color:var(--ink)' },
        h('div', null, h('div', { style: 'font-weight:600', text: next.title }), h('div', { class: 'small muted', text: `${fmtDate(new Date(next.whenAt), { weekday: 'short', month: 'short', day: 'numeric' })} ${fmtTime(new Date(next.whenAt))}` })),
        h('span', { class: 'small', style: 'color:#b06a2c;font-weight:600', text: t('look') })) : null);
  };
  ctx.sub('hangouts', v => { hang = v; paint(); });
  ctx.onPresence(paint);
  return box;
}

function pushCard() {
  if (S.pushOn || !B.pushSupported() || store.get('tg-push-dismiss', false)) return null;
  const card = h('section', { class: 'card row', style: 'align-items:flex-start' },
    h('div', { style: 'color:var(--pri);margin-top:2px' }, svg(ICON.bell, 22)),
    h('div', { class: 'grow stack', style: 'gap:10px' },
      h('div', null, h('div', { class: 'card-t', text: t('pushTitle') }), h('div', { class: 'note', text: t('pushBody') })),
      h('div', { class: 'row' },
        h('button', { class: 'btn sm', text: t('pushOn'), onclick: async () => { try { await B.enablePush(); S.pushOn = true; store.set('tg-push', true); card.remove(); toast(t('pushDone')); } catch (e) { toast(e.message === 'denied' ? t('pushDenied') : t('pushUnsupported')); } } }),
        h('button', { class: 'btn sm ghost', text: t('later'), onclick: () => { store.set('tg-push-dismiss', true); card.remove(); } }))));
  return card;
}

export function viewHome(ctx) {
  const hr = new Date().getHours();
  const g = hr < 5 ? 'greetNight' : hr < 11 ? 'greetMorning' : hr < 18 ? 'greetAfternoon' : 'greetEvening';
  const first = nameOf(S.uid);
  return h('div', { class: 'wrap stack', style: 'gap:18px' },
    h('div', { class: 'top', style: 'margin-bottom:0' },
      h('div', null,
        h('div', { class: 'wordmark' }, h('span', { class: 'brand', text: 'Together' }), h('span', { class: 'brand-zh', text: '同窗' })),
        h('div', { class: 'h-sub', style: 'margin-top:10px', text: fmtDate(new Date(), { weekday: 'long', month: 'long', day: 'numeric' }) }),
        h('h1', { class: 'h-title', style: 'margin-top:4px', text: t(g, first) })),
      h('a', { href: '#me', 'aria-label': t('me'), style: 'text-decoration:none' }, avatar(S.uid, 'av-lg'))),
    DEMO ? h('div', { class: 'demo', text: t('demoNote') }) : null,
    careCard(ctx), moodCard(ctx), pushCard(), memoCard(ctx), balanceCard(ctx), nowCard(ctx));
}
