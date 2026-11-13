// Together 同窗 — 启动、登录、路由
import { S, B, initBackend, t, h, svg, ICON, $, toast, applyLang, lang, setLang, LANGS, EMAIL_OK, store, COLORS, DEMO, clean } from './core.js';
import { viewHome } from './home.js';
import { viewStudy, viewFolder } from './study.js';
import { viewRoom, tick, pushPresence, restoreTimer } from './room.js';
import { viewLife } from './life.js';
import { viewDigest } from './digest.js';
import { viewMe } from './me.js';
import { showSplash, showCreatorNote, showTour } from './intro.js';

applyLang();
const splashDone = showSplash();
const authErr = e => { const k = 'err_' + String((e && e.code) || '').replace('auth/', '').replace(/-/g, '_'); const v = t(k); return v === k ? t('errGeneric') : v; };

/* ---------------- 登录 / 验证 ---------------- */
function renderAuth(mode = 'login') {
  const err = h('div', { class: 'err', role: 'alert' });
  const name = h('input', { maxlength: '24', autocomplete: 'nickname' });
  const email = h('input', { type: 'email', autocomplete: 'email', inputmode: 'email', placeholder: 'you@example.com' });
  const pw = h('input', { type: 'password', autocomplete: mode === 'login' ? 'current-password' : 'new-password', placeholder: t('pwPh') });
  const go = h('button', { class: 'btn full', text: mode === 'login' ? t('login') : t('signupSend') });
  go.onclick = async () => {
    err.className = 'err'; err.textContent = '';
    const em = email.value.trim().toLowerCase();
    if (!EMAIL_OK.test(em)) { err.textContent = t('onlyGsu'); return; }
    if (pw.value.length < 8) { err.textContent = t('pwShort8'); return; }
    if (mode === 'signup' && !clean(name.value, 24)) { err.textContent = t('needName'); return; }
    go.disabled = true;
    try { if (mode === 'signup') { store.set('tg-pending-name', clean(name.value, 24)); await B.signUp(em, pw.value); } else await B.signIn(em, pw.value); }
    catch (e) { err.textContent = authErr(e); go.disabled = false; }
  };
  const forgot = h('button', { class: 'linkbtn', text: t('forgot'), onclick: async () => {
    const em = email.value.trim().toLowerCase(); err.className = 'err';
    if (!EMAIL_OK.test(em)) { err.textContent = t('onlyGsu'); return; }
    try { await B.reset(em); err.className = 'err ok'; err.textContent = t('resetSent'); } catch (e) { err.textContent = authErr(e); }
  } });
  $('app').replaceChildren(h('main', { class: 'auth' },
    h('div', { class: 'auth-hero' },
      h('div', { class: 'wordmark', style: 'font-size:30px' }, h('span', { class: 'brand', text: 'Together' }), h('span', { class: 'brand-zh', text: '同窗' })),
      h('div', { class: 'muted', style: 'font-size:14px;line-height:1.7;white-space:pre-line', text: t('heroLine') })),
    h('div', { class: 'seg' }, ['login', 'signup'].map(m => h('button', { class: mode === m ? 'on' : '', text: t(m), onclick: () => renderAuth(m) }))),
    mode === 'signup' ? h('label', { class: 'field' }, t('nameLbl'), name) : null,
    h('label', { class: 'field' }, t('gsuEmail'), email), h('label', { class: 'field' }, t('password'), pw),
    err, go, mode === 'login' ? forgot : null,
    h('div', { class: 'chips', style: 'justify-content:center' }, LANGS.map(([c, l]) => h('button', { class: 'chip' + (lang === c ? ' on' : ''), lang: c, text: l, onclick: () => { setLang(c); renderAuth(mode); } })))));
}
function renderVerify(email) {
  const msg = h('div', { class: 'err', role: 'status' });
  $('app').replaceChildren(h('main', { class: 'auth' },
    h('div', { class: 'auth-hero' }, h('div', { style: 'font-family:var(--brand);font-weight:700;font-size:24px', text: t('verifyTitle') }), h('div', { class: 'muted', style: 'font-size:14px;line-height:1.7', text: t('verifyBody', email) })),
    msg,
    h('button', { class: 'btn full', text: t('iVerified'), onclick: async e => {
      e.currentTarget.disabled = true; const b = e.currentTarget; msg.className = 'err';
      try { if (await B.checkVerified()) startApp(B.current()); else msg.textContent = t('notYet'); } catch (er) { msg.textContent = authErr(er); }
      b.disabled = false;
    } }),
    h('div', { class: 'two' },
      h('button', { class: 'btn ghost', text: t('resend'), onclick: async () => { try { await B.resend(); msg.className = 'err ok'; msg.textContent = t('resent'); } catch (e) { msg.className = 'err'; msg.textContent = authErr(e); } } }),
      h('button', { class: 'btn ghost', text: t('otherAccount'), onclick: () => B.signOut() }))));
}

/* ---------------- 路由 ---------------- */
let route = null;
const presenceCbs = new Set(), cheerCbs = new Set();
function makeCtx() {
  const ctx = { subs: [], tabSubs: [], cleanups: [], inTab: false };
  ctx.sub = (p, cb, o) => { const u = B.on(p, cb, o); (ctx.inTab ? ctx.tabSubs : ctx.subs).push(u); return u; };
  ctx.onPresence = fn => { presenceCbs.add(fn); (ctx.inTab ? ctx.tabSubs : ctx.subs).push(() => presenceCbs.delete(fn)); };
  ctx.onCheer = fn => { cheerCbs.add(fn); ctx.subs.push(() => cheerCbs.delete(fn)); };
  ctx.cleanup = fn => ctx.cleanups.push(fn);
  ctx.resetTab = () => { ctx.tabSubs.forEach(f => f()); ctx.tabSubs = []; ctx.inTab = true; };
  ctx.destroy = () => { [...ctx.subs, ...ctx.tabSubs].forEach(f => { try { f(); } catch (e) { } }); ctx.cleanups.forEach(f => { try { f(); } catch (e) { } }); };
  return ctx;
}
function nav(active) {
  const a = (href, key, icon, label, cls = '') => h('a', { href, class: (active === key ? 'on ' : '') + cls, 'aria-current': active === key ? 'page' : null }, svg(icon, 22, 1.6), label);
  return h('nav', { class: 'nav', 'aria-label': 'Together' }, a('#study', 'study', ICON.study, t('studyTogether')), a('#home', 'home', ICON.home, t('plaza')), a('#life', 'life', ICON.life, t('lifeTogether'), 'life'));
}
function mount() {
  if (!S.uid) return;
  if (route) route.destroy();
  $('sheetRoot').replaceChildren(); document.body.classList.remove('sheet-open');
  const [name, arg] = (location.hash.replace(/^#/, '') || 'home').split('/');
  const ctx = route = makeCtx();
  let view, active = name;
  if (name === 'study') view = viewStudy(ctx);
  else if (name === 'folder' && arg) { view = viewFolder(ctx, arg); active = 'study'; }
  else if (name === 'room' && arg) { view = viewRoom(ctx, arg); active = 'study'; }
  else if (name === 'life') view = viewLife(ctx);
  else if (name === 'digest') { view = viewDigest(ctx); active = 'home'; }
  else if (name === 'me') { view = viewMe(ctx, mount); active = 'home'; }
  else { view = viewHome(ctx); active = 'home'; }
  $('app').replaceChildren(view, nav(active));
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', mount);
setInterval(() => { if (S.uid) tick(); }, 1000);

/* ---------------- 启动 ---------------- */
let started = null, globalSubs = [];
function startApp(u) {
  if (started === u.uid) return;
  started = u.uid; S.uid = u.uid; S.email = u.email || '';
  splashDone.then(() => new Promise(r => setTimeout(r, 400))).then(() => showCreatorNote()).then(() => setTimeout(() => showTour(), 250));
  globalSubs.forEach(f => f()); globalSubs = [];
  let first = true;
  globalSubs.push(B.on('profiles', v => {
    S.profiles = v || {};
    if (first) {
      first = false;
      if (!S.profiles[S.uid]) B.set('profiles/' + S.uid, { name: store.get('tg-pending-name', '') || S.email.split('@')[0] || 'PhD', color: COLORS[Math.floor(Math.random() * COLORS.length)], lang }).catch(() => { });
      else if (S.profiles[S.uid].lang && !store.get('tg-lang', null)) setLang(S.profiles[S.uid].lang);
      mount();
    }
  }));
  globalSubs.push(B.on('presence', v => { S.presence = v || {}; presenceCbs.forEach(f => f()); }));
  globalSubs.push(B.on('admins/' + S.uid, v => { S.admin = v === true; }));
  globalSubs.push(B.on('cheers/' + S.uid, v => {
    for (const [id, c] of Object.entries(v || {})) {
      if (c && typeof c.e === 'number') { cheerCbs.forEach(f => f(c)); toast(t('cheerGot', (S.profiles[c.from] || {}).name || t('someone'), ['🍵', '✨', '💪', '🌙'][c.e] || '')); }
      B.remove(`cheers/${S.uid}/${id}`).catch(() => { });
    }
  }));
  globalSubs.push(B.onConnected(ok => { S.connected = ok; if (ok) { B.removeOnDisconnect('presence/' + S.uid); pushPresence(); } }));
  restoreTimer(); pushPresence();
}
(async () => {
  try { await initBackend(); }
  catch (e) { $('app').replaceChildren(h('main', { class: 'auth' }, h('div', { class: 'err', text: '⚠️ ' + (e && e.message || e) }))); return; }
  B.onAuth(u => {
    if (!u) { started = null; S.uid = null; globalSubs.forEach(f => f()); globalSubs = []; if (route) route.destroy(); renderAuth('login'); return; }
    if (!u.emailVerified) { started = null; renderVerify(u.email || ''); return; }
    startApp(u);
  });
})();
