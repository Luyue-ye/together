// Together 同窗 — 共用核心：状态、后端（Firebase / 预览模式）、多语言、小工具、团子组件
import { STR } from './i18n.js';

export const CFG = self.TOGETHER_CONFIG || {};
const FB = 'https://www.gstatic.com/firebasejs/10.12.2/';
export const DEMO = !CFG.firebase || !CFG.firebase.apiKey || String(CFG.firebase.apiKey).startsWith('PASTE') || !CFG.firebase.databaseURL;
export const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const COLORS = ['#c9cff5', '#ffd9b0', '#cfe8c6', '#f8cdd6', '#bfe3f2', '#f6e6a6', '#dccdf0', '#e8ddd0'];
export const KINDS = ['diss', 'read', 'revise', 'teach', 'data', 'course'];
export const DURS = [25, 50, 90, 0];
export const BREAKS = ['water', 'dream', 'music', 'meal', 'stretch', 'walk'];
export const BREAK_DURS = [5, 10, 15, 30];
export const DEFAULT_TAGS = ['sport', 'food', 'outdoor', 'movie', 'party'];
export const CHEERS = ['🍵', '✨', '💪', '🌙'];
export const LANGS = [['zh', '中文'], ['en', 'English'], ['es', 'Español'], ['bn', 'বাংলা'], ['fa', 'فارسی']];

/* ---------------- 本地存储 ---------------- */
export const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
};

/* ---------------- 多语言 ---------------- */
function detectLang() {
  const saved = store.get('tg-lang', null); if (saved) return saved;
  const n = (navigator.language || 'zh').toLowerCase();
  for (const [c] of LANGS) if (n.startsWith(c)) return c;
  return 'en';
}
export let lang = detectLang();
export function setLang(l) { lang = l; store.set('tg-lang', l); applyLang(); }
export function applyLang() {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
}
export const t = (k, ...a) => {
  let v = (STR[lang] || {})[k];
  if (v === undefined) v = STR.en[k];
  if (v === undefined) v = STR.zh[k];
  if (v === undefined) return k;
  return typeof v === 'function' ? v(...a) : v;
};
export const loc = () => ({ zh: 'zh-CN', en: 'en-US', es: 'es-ES', bn: 'bn-BD', fa: 'fa-IR-u-ca-gregory' })[lang] || 'en-US';
export const num = (n, d = 0) => new Intl.NumberFormat(loc(), { maximumFractionDigits: d, minimumFractionDigits: d }).format(n);

/* ---------------- 时间 ---------------- */
export const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const startOfToday = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime(); };
export const parseDay = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
export const fmtMMSS = ms => { ms = Math.max(0, ms); const s = Math.round(ms / 1000); return `${num(Math.floor(s / 60)).padStart(2, num(0))}:${num(s % 60).padStart(2, num(0))}`; };
export const fmtDate = (d, o) => new Intl.DateTimeFormat(loc(), o).format(d);
export const fmtMD = d => fmtDate(d, { month: 'short', day: 'numeric' });
export const fmtTime = d => fmtDate(d, { hour: '2-digit', minute: '2-digit' });
export const fmtDur = m => { m = Math.round(m); const hh = Math.floor(m / 60), mm = m % 60; return hh ? (mm ? t('durHM', num(hh), num(mm)) : t('durH', num(hh))) : t('durM', num(mm)); };
export const timeAgo = ms => {
  const s = (Date.now() - ms) / 1000;
  if (s < 90) return t('agoNow');
  if (s < 3600) return t('agoMin', num(Math.round(s / 60)));
  if (s < 86400) return t('agoHour', num(Math.round(s / 3600)));
  return t('agoDay', num(Math.round(s / 86400)));
};

/* ---------------- DOM 小工具 ---------------- */
// 让 replaceChildren / append 自动跳过 null、false，方便写条件内容
for (const P of [Element.prototype, DocumentFragment.prototype]) for (const m of ['replaceChildren', 'append']) {
  const orig = P[m]; P[m] = function (...k) { return orig.apply(this, k.flat(9).filter(x => x != null && x !== false)); };
}
export const $ = id => document.getElementById(id);
export function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  if (attrs) for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'text') el.textContent = v;
    else if (k === 'style') el.style.cssText = v;
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat(9)) { if (c == null || c === false) continue; el.append(c.nodeType ? c : document.createTextNode(String(c))); }
  return el;
}
export const svg = (inner, size = 22, sw = 1.7) => { const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('width', size); s.setAttribute('height', size); s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('fill', 'none'); s.setAttribute('stroke', 'currentColor'); s.setAttribute('stroke-width', sw); s.setAttribute('stroke-linecap', 'round'); s.setAttribute('stroke-linejoin', 'round'); s.setAttribute('aria-hidden', 'true'); s.innerHTML = inner; if (inner === ICON.back) s.classList.add('flip-rtl'); return s; };
export const ICON = {
  study: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 5.5v16"/>',
  home: '<rect x="5" y="4" width="14" height="17" rx="1.5"/><path d="M12 4v17M5 12.5h14"/>',
  life: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  back: '<path d="M15 18l-6-6 6-6"/>', lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', star: '<path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/>',
  pin: '<path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>', hand: '<path d="M3 13h4l3 3h4a2 2 0 0 0 0-4h-3"/><path d="M7 13l5-5a2 2 0 0 1 3 0l5 5"/>',
  folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 3h8a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>', bell: '<path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
  out: '<path d="M7 17L17 7M8 7h9v9"/>'
};
export function toast(msg) { const el = h('div', { class: 'toast', text: msg, role: 'status' }); document.body.append(el); setTimeout(() => el.remove(), 2800); }
export function openSheet(title, ...content) {
  const close = () => $('sheetRoot').replaceChildren();
  const bg = h('div', { class: 'sheet-bg', onclick: e => { if (e.target === bg) close(); } },
    h('div', { class: 'sheet', role: 'dialog', 'aria-label': title }, h('div', { class: 'grab' }), title ? h('h3', { text: title }) : null, ...content));
  $('sheetRoot').replaceChildren(bg);
  return close;
}
export const closeSheet = () => $('sheetRoot').replaceChildren();
export async function sha256(s) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
}
export const clean = (s, n) => String(s || '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, n);

/* ---------------- 全局状态 ---------------- */
export const S = {
  uid: null, email: '', profiles: {}, presence: {}, admin: false, connected: true,
  mine: Object.assign({ st: 'idle', kind: 'diss', dur: 50, act: 'water', bdur: 5, s: 0, e: 0, room: null }, store.get('tg-mine', {})),
  scene: store.get('tg-scene', 'day'), tab: store.get('tg-tabs', { study: 'rooms', life: 'hang' }),
  confField: 'all', confMine: false, libFilter: 'all', lifeTag: 'all', pushOn: store.get('tg-push', false)
};
export const nameOf = uid => (uid && S.profiles[uid] && S.profiles[uid].name) || t('someone');
export const colorOf = uid => (uid && S.profiles[uid] && S.profiles[uid].color) || COLORS[[...String(uid || '?')].reduce((a, c) => a + c.charCodeAt(0), 0) % COLORS.length];
export const avatar = (uid, cls = '') => h('span', { class: 'av ' + cls, style: `background:${colorOf(uid)}`, title: nameOf(uid), text: [...nameOf(uid)][0] || '?' });

/* ---------------- 团子 ---------------- */
const MO = {
  write: { laptop: 1, eyes: 'open', anim: 'a-write' }, idle: { eyes: 'open', anim: 'a-breathe' },
  water: { cup: 1, eyes: 'happy', anim: 'a-breathe' }, dream: { dream: 1, eyes: 'sleepy', anim: 'a-sway-slow' },
  music: { music: 1, phones: 1, eyes: 'happy', anim: 'a-sway' }, meal: { meal: 1, eyes: 'open', mouthO: 1, anim: 'a-breathe' },
  stretch: { arms: 1, eyes: 'happy', anim: 'a-stretch' }, walk: { feet: 1, eyes: 'open', anim: 'a-walk' }
};
export function mochi(action = 'idle', color = COLORS[0], scale = 1) {
  const a = MO[action] || MO.idle;
  const d = (cls, st, ...k) => h('div', { class: cls, style: st }, ...k);
  const body = d('mo-body ' + a.anim, '',
    d('mo-skin', `background:${color}`), d('mo-shine'),
    a.phones ? [d('mo-phones'), d('mo-pad', 'left:-8px'), d('mo-pad', 'left:63px')] : null,
    d('mo-eye ' + (a.eyes === 'open' ? '' : a.eyes), `left:${a.eyes === 'open' ? 20 : 18}px`),
    d('mo-eye ' + (a.eyes === 'open' ? '' : a.eyes), `left:${a.eyes === 'open' ? 38 : 37}px`),
    d('mo-blush', 'left:9px'), d('mo-blush', 'left:46px'),
    d('mo-mouth' + (a.mouthO ? ' o' : '')));
  const el = h('div', { class: 'mochi', 'aria-hidden': 'true', style: scale !== 1 ? `transform:scale(${scale});transform-origin:50% 100%` : '' },
    d('mo-shadow'),
    a.dream ? [d('mo-dot a-float'), h('div', { class: 'mo-bubble a-float' }, h('span', { class: 'a-d1' }), h('span', { class: 'a-d2' }), h('span', { class: 'a-d3' }))] : null,
    a.music ? [d('mo-note a-note', 'left:76px;top:20px;color:#f3a462', '♪'), d('mo-note a-note2', 'left:82px;top:28px;color:#7a83c8;font-size:12px', '♫')] : null,
    a.feet ? [d('mo-foot a-foot1', `left:32px;background:${color}`), d('mo-foot a-foot2', `left:55px;background:${color}`)] : null,
    a.arms ? [d('mo-arm a-armL', `left:15px;background:${color}`), d('mo-arm a-armR', `left:75px;background:${color}`)] : null,
    body,
    a.laptop ? d('mo-laptop') : null,
    a.cup ? d('mo-cup a-sip') : null,
    a.meal ? [d('mo-steam a-steam', 'left:72px'), d('mo-steam a-steam2', 'left:80px'), d('mo-bowl')] : null);
  return el;
}

/* ---------------- 后端 ---------------- */
export let B = null;
export async function initBackend() { B = DEMO ? await demoBackend() : await firebaseBackend(); return B; }

async function firebaseBackend() {
  const [{ initializeApp }, A, D] = await Promise.all([import(FB + 'firebase-app.js'), import(FB + 'firebase-auth.js'), import(FB + 'firebase-database.js')]);
  const app = initializeApp(CFG.firebase);
  const auth = A.getAuth(app);
  const db = D.getDatabase(app);
  let offset = 0;
  D.onValue(D.ref(db, '.info/serverTimeOffset'), s => { offset = s.val() || 0; });
  const R = p => D.ref(db, p);
  const Q = (p, o = {}) => {
    const c = [];
    if (o.orderBy) c.push(D.orderByChild(o.orderBy));
    if (o.startAt !== undefined) c.push(D.startAt(o.startAt));
    if (o.limitLast) c.push(D.limitToLast(o.limitLast));
    return c.length ? D.query(R(p), ...c) : R(p);
  };
  return {
    demo: false,
    onAuth: cb => A.onAuthStateChanged(auth, cb),
    current: () => auth.currentUser,
    signUp: async (e, p) => { const c = await A.createUserWithEmailAndPassword(auth, e, p); await A.sendEmailVerification(c.user); },
    signIn: (e, p) => A.signInWithEmailAndPassword(auth, e, p),
    resend: () => A.sendEmailVerification(auth.currentUser),
    checkVerified: async () => { await auth.currentUser.reload(); if (auth.currentUser.emailVerified) { await auth.currentUser.getIdToken(true); return true; } return false; },
    reset: e => A.sendPasswordResetEmail(auth, e),
    signOut: async () => { try { await D.remove(R('presence/' + S.uid)); } catch (e) { } await A.signOut(auth); },
    on: (p, cb, o) => D.onValue(Q(p, o), s => cb(s.val()), () => cb(null)),
    get: async p => (await D.get(R(p))).val(),
    set: (p, v) => D.set(R(p), v),
    update: obj => D.update(D.ref(db), obj),
    push: async (p, v) => { const r = D.push(R(p)); await D.set(r, v); return r.key; },
    newKey: p => D.push(R(p)).key,
    remove: p => D.remove(R(p)),
    txn: (p, fn) => D.runTransaction(R(p), fn),
    now: () => Date.now() + offset,
    get TS() { return D.serverTimestamp(); },
    onConnected: cb => D.onValue(R('.info/connected'), s => cb(s.val() === true)),
    removeOnDisconnect: p => D.onDisconnect(R(p)).remove(),
    pushSupported: () => 'Notification' in window && 'serviceWorker' in navigator && !!CFG.vapidKey,
    enablePush: async () => {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') throw new Error('denied');
      const M = await import(FB + 'firebase-messaging.js');
      if (!(await M.isSupported())) throw new Error('unsupported');
      const reg = await navigator.serviceWorker.ready;
      const messaging = M.getMessaging(app);
      const token = await M.getToken(messaging, { vapidKey: CFG.vapidKey, serviceWorkerRegistration: reg });
      const id = (await sha256(token)).slice(0, 24);
      await D.set(R(`tokens/${S.uid}/${id}`), { token, lang, t: D.serverTimestamp() });
      store.set('tg-push-id', id);
      M.onMessage(messaging, p => toast((p.notification && p.notification.body) || ''));
    },
    disablePush: async () => { const id = store.get('tg-push-id', null); if (id) await D.remove(R(`tokens/${S.uid}/${id}`)); }
  };
}

/* ---- 预览模式：数据只存在这台设备上，楼里是示例同窗 ---- */
async function demoBackend() {
  const KEY = 'tg-demo-v1';
  let T = store.get(KEY, null);
  if (!T) T = await demoSeed();
  refreshDemoPresence(T);
  const listeners = new Set();
  const parts = p => p.split('/').filter(Boolean);
  const clone = v => v == null ? null : JSON.parse(JSON.stringify(v));
  const getP = p => { let n = T; for (const k of parts(p)) { if (n == null || typeof n !== 'object') return null; n = n[k]; } return n === undefined ? null : clone(n); };
  const setP = (p, v) => {
    const ks = parts(p); let n = T;
    for (let i = 0; i < ks.length - 1; i++) { if (typeof n[ks[i]] !== 'object' || n[ks[i]] === null) n[ks[i]] = {}; n = n[ks[i]]; }
    const last = ks[ks.length - 1];
    if (v == null) delete n[last]; else n[last] = clone(v);
  };
  const applyQ = (v, o = {}) => {
    if (!v || typeof v !== 'object') return v;
    let ents = Object.entries(v);
    if (o.orderBy) { ents = ents.filter(([, x]) => x && x[o.orderBy] !== undefined && (o.startAt === undefined || x[o.orderBy] >= o.startAt)); ents.sort((a, b) => a[1][o.orderBy] - b[1][o.orderBy]); }
    if (o.limitLast) ents = ents.slice(-o.limitLast);
    return ents.length ? Object.fromEntries(ents) : null;
  };
  let timer = null;
  const emit = () => { store.set(KEY, T); clearTimeout(timer); timer = setTimeout(() => { for (const l of listeners) l.cb(applyQ(getP(l.p), l.o)); }, 0); };
  const deny = () => Object.assign(new Error('PERMISSION_DENIED'), { code: 'PERMISSION_DENIED' });
  const guard = (p, v) => {
    const m = p.match(/^roomMembers\/([^/]+)\/[^/]+$/);
    if (m && v != null && getP('roomSecrets/' + m[1]) !== v) throw deny();
  };
  let n = 0;
  return {
    demo: true,
    onAuth: cb => setTimeout(() => cb({ uid: 'me', email: 'you@student.gsu.edu', emailVerified: true }), 0),
    current: () => ({ uid: 'me', email: 'you@student.gsu.edu' }),
    signOut: async () => toast(t('demoNoSignOut')),
    on: (p, cb, o) => { const l = { p, cb, o }; listeners.add(l); setTimeout(() => cb(applyQ(getP(p), o)), 0); return () => listeners.delete(l); },
    get: async p => getP(p),
    set: async (p, v) => { guard(p, v); setP(p, v); emit(); },
    update: async obj => { for (const [p, v] of Object.entries(obj)) guard(p, v); for (const [p, v] of Object.entries(obj)) setP(p, v); emit(); },
    push: async (p, v) => { const k = 'd' + Date.now().toString(36) + (n++); setP(p + '/' + k, v); emit(); return k; },
    newKey: () => 'd' + Date.now().toString(36) + (n++),
    remove: async p => { setP(p, null); emit(); },
    txn: async (p, fn) => { setP(p, fn(getP(p))); emit(); },
    now: () => Date.now(),
    get TS() { return Date.now(); },
    onConnected: cb => setTimeout(() => cb(true), 0),
    removeOnDisconnect: async () => { },
    pushSupported: () => false,
    enablePush: async () => { throw new Error('demo'); },
    disablePush: async () => { }
  };
}

function refreshDemoPresence(T) {
  const now = Date.now();
  T.presence = Object.assign({}, T.presence || {}, {
    a: { room: 'public', st: 'w', k: 'read', s: now - 12 * 60000, e: now + 38 * 60000, t: now },
    b: { room: 'public', st: 'b', a: 'water', s: now - 60000, e: now + 4 * 60000, t: now },
    c: { room: 'public', st: 'w', k: 'revise', s: now - 30 * 60000, e: now + 20 * 60000, t: now },
    d: { room: 'public', st: 'b', a: 'music', s: now - 2 * 60000, e: now + 8 * 60000, t: now },
    e: { room: 'public', st: 'b', a: 'dream', s: now - 60000, e: now + 9 * 60000, t: now }
  });
}

async function demoSeed() {
  const now = Date.now(), today = dayKey(), yest = dayKey(new Date(now - 864e5));
  const day = (off, hh, mm = 0) => { const d = new Date(); d.setDate(d.getDate() + off); d.setHours(hh, mm, 0, 0); return d.getTime(); };
  const secret = await sha256('room1:1234');
  return {
    profiles: {
      me: { name: 'Lulu', color: '#c9cff5' }, a: { name: 'Mia', color: '#f8cdd6' }, b: { name: '小林', color: '#cfe8c6' },
      c: { name: 'Jordan', color: '#ffd9b0' }, d: { name: 'Ana', color: '#dccdf0' }, e: { name: 'Kai', color: '#bfe3f2' }
    },
    rooms: { room1: { name: 'Methods 互助写作', when: '今晚 19:00–22:00', host: 'c', created: now - 3600e3 } },
    roomSecrets: { room1: secret },
    chats: { public: {
      m1: { uid: 'a', text: '今晚目标 1000 字，谁一起冲', t: now - 40 * 60000 },
      m2: { uid: 'c', text: '+1，我在改 R&R 的回复信', t: now - 35 * 60000 },
      m3: { uid: 'b', text: '我先去倒杯水 🍵', t: now - 2 * 60000 } } },
    confFollows: { ica27: { a: true, c: true, e: true }, aejmcmw27: { b: true }, dchc27: { a: true, d: true } },
    confCollab: { ica27: { a: { note: '想找人合写老龄化 × 平台研究的 panel', t: now - 864e5 } }, dchc27: { d: { note: '有问卷数据，缺做质性分析的合作者', t: now - 2 * 864e5 } } },
    folders: {
      f1: { name: '数字民族志方法', desc: '方法论文章、课程大纲、好用的工具', kind: 'co', owner: 'me', created: now - 5 * 864e5 },
      f2: { name: 'Comps 阅读清单', desc: '我自己的备考书单', kind: 'own', owner: 'c', created: now - 9 * 864e5 },
      f3: { name: '求职材料范例', desc: 'Cover letter、teaching statement', kind: 'co', owner: 'a', created: now - 2 * 864e5 }
    },
    links: {
      f1: { l1: { title: 'Digital ethnography 课程大纲', url: 'https://example.com/syllabus', by: 'me', t: now - 4 * 864e5 }, l2: { title: '田野笔记模板', url: 'https://example.com/notes', by: 'c', t: now - 864e5 } },
      f2: { l3: { title: 'Comps 书单（第一版）', url: 'https://example.com/list', by: 'c', t: now - 8 * 864e5 } }
    },
    hangouts: {
      h1: { mode: 'plan', title: 'Piedmont Park 慢跑 5K', whenAt: day(1, 17), where: 'Piedmont Park 12th St 入口', cap: 4, tags: ['sport', 'outdoor'], host: 'me', created: now - 7200e3 },
      h2: { mode: 'idea', title: '周末想去山里或者湖边走走', whenText: '周六或周日', tags: ['outdoor'], host: 'a', created: now - 5 * 3600e3 },
      h3: { mode: 'free', title: '', tags: [], host: 'e', created: now - 3600e3 },
      h4: { mode: 'plan', title: 'Buford Hwy 吃火锅', whenAt: day(2, 18, 30), where: 'Buford Highway', cap: 6, tags: ['food', '#火锅'], host: 'b', created: now - 3 * 3600e3 }
    },
    hangJoins: { h1: { me: true, c: true }, h2: { a: true, b: true, d: true }, h3: { e: true }, h4: { b: true } },
    help: {
      p1: { text: '周日上午搬家，想借一辆车', by: 'b', t: now - 2 * 3600e3, done: false },
      p2: { text: '有人能帮我看一下 IRB 申请吗？', by: 'd', t: now - 864e5, done: false }
    },
    helpOffers: { p1: { c: true } },
    moodDigest: { [yest]: { n: 12, tired: 6.4, happy: 5.8, tiredHist: [0, 0, 0, 1, 1, 2, 2, 3, 2, 1, 0], happyHist: [0, 0, 1, 1, 2, 3, 2, 2, 1, 0, 0] } },
    board: { [yest]: {
      b1: { text: '今天写不出来也没关系，明天继续。', anon: true, t: now - 864e5, hugs: { a: true, c: true, d: true } },
      b2: { text: 'Comps 准备的同学加油！周六自习室见', by: 'c', t: now - 864e5 + 3600e3, hugs: { me: true } } },
      [today]: { b3: { text: '被 reviewer 2 打击了，但还在坚持', anon: true, t: now - 1800e3, hugs: { a: true, b: true } } } },
    memos: { me: {
      m1: { text: '回复合作者的邮件', done: true, day: today, t: now - 5 * 3600e3 },
      m2: { text: '写完 methods 一节', done: false, day: today, t: now - 4 * 3600e3 } } },
    stats: { me: { [dayKey(new Date(now - 3 * 864e5))]: { study: 180 }, [dayKey(new Date(now - 2 * 864e5))]: { study: 240 }, [yest]: { study: 150 } } }
  };
}
