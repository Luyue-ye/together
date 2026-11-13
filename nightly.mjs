// 每晚 21:00（美东时间）由 GitHub Actions 运行：
// 1) 汇总当天的心情（只算平均值和分布）写进 moodDigest
// 2) 记录人数 ≥ 3 时给开启了推送的人发通知
// 3) 清理旧数据：聊天只留 2 天、心情原始记录只留 3 天、过期的在线状态
import admin from 'firebase-admin';

const TZ = 'America/New_York';
const FORCE = process.env.FORCE === 'true';
const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
const dbURL = process.env.FIREBASE_DB_URL;
const APP = (process.env.APP_URL || '').replace(/\/?$/, '/').replace(/^\/$/, ''); // 例如 https://luyue-ye.github.io/together/
if (!sa.project_id || !dbURL) { console.error('缺少 FIREBASE_SERVICE_ACCOUNT 或 FIREBASE_DB_URL'); process.exit(1); }
admin.initializeApp({ credential: admin.credential.cert(sa), databaseURL: dbURL });
const db = admin.database();

const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hour12: false }).formatToParts(new Date()).map(p => [p.type, p.value]));
const hour = Number(parts.hour) % 24;
const day = `${parts.year}-${parts.month}-${parts.day}`;
if (hour !== 21 && !FORCE) { console.log(`现在是美东 ${hour} 点，不是 21 点，跳过。`); process.exit(0); }

const val = async p => (await db.ref(p).get()).val();

// ---------- 1. 汇总 ----------
const moods = Object.values((await val(`mood/${day}`)) || {}).filter(m => m && typeof m.tired === 'number' && typeof m.happy === 'number');
const n = moods.length;
const hist = key => { const h = Array(11).fill(0); moods.forEach(m => h[Math.max(0, Math.min(10, Math.round(m[key])))]++); return h; };
const avg = key => n ? Math.round(moods.reduce((s, m) => s + m[key], 0) / n * 10) / 10 : 0;
const prev = (await val(`moodDigest/${day}`)) || {};
const digest = { n, tired: avg('tired'), happy: avg('happy'), tiredHist: hist('tired'), happyHist: hist('happy'), at: Date.now(), pushed: !!prev.pushed };
await db.ref(`moodDigest/${day}`).set(digest);
console.log(`汇总 ${day}: ${n} 人，疲惫 ${digest.tired}，开心 ${digest.happy}`);

// ---------- 2. 推送 ----------
const BODY = {
  zh: d => `今天 ${d.n} 位同窗记录了心情：平均疲惫 ${d.tired}，开心 ${d.happy}。辛苦了，早点休息。`,
  en: d => `${d.n} people checked in today: avg. tiredness ${d.tired}, happiness ${d.happy}. Rest well tonight.`,
  es: d => `Hoy se registraron ${d.n} personas: cansancio medio ${d.tired}, alegría ${d.happy}. Descansa bien.`,
  bn: d => `আজ ${d.n} জন জানিয়েছে: গড় ক্লান্তি ${d.tired}, আনন্দ ${d.happy}। আজ ভালো করে বিশ্রাম নাও।`,
  fa: d => `امروز ${d.n} نفر حالشان را ثبت کردند: میانگین خستگی ${d.tired}، شادی ${d.happy}. امشب خوب استراحت کن.`
};
if (n >= 3 && !digest.pushed) {
  const tokens = [];
  for (const [uid, list] of Object.entries((await val('tokens')) || {})) for (const [id, tk] of Object.entries(list || {})) if (tk && tk.token) tokens.push({ uid, id, token: tk.token, lang: BODY[tk.lang] ? tk.lang : 'en' });
  const msgs = tokens.map(x => ({ token: x.token, webpush: { notification: { title: 'Together 同窗 · 21:00', body: BODY[x.lang](digest), icon: APP ? APP + 'icon-192.png' : undefined }, ...(APP ? { fcmOptions: { link: APP + '#digest' } } : {}) } }));
  let ok = 0;
  for (let i = 0; i < msgs.length; i += 500) {
    const res = await admin.messaging().sendEach(msgs.slice(i, i + 500));
    res.responses.forEach((r, j) => {
      if (r.success) ok++;
      else if (['messaging/registration-token-not-registered', 'messaging/invalid-registration-token'].includes(r.error && r.error.code)) { const x = tokens[i + j]; db.ref(`tokens/${x.uid}/${x.id}`).remove(); }
    });
  }
  await db.ref(`moodDigest/${day}/pushed`).set(true);
  console.log(`推送 ${ok}/${msgs.length}`);
} else console.log(n < 3 ? '记录少于 3 人，不推送' : '今天已推送过');

// ---------- 3. 清理 ----------
const cut = Date.now() - 2 * 864e5;
for (const [room, list] of Object.entries((await val('chats')) || {})) {
  const upd = {}; for (const [id, m] of Object.entries(list || {})) if (!m || !m.t || m.t < cut) upd[`chats/${room}/${id}`] = null;
  if (Object.keys(upd).length) await db.ref().update(upd);
}
for (const d of Object.keys((await val('mood')) || {})) if (d < new Date(Date.now() - 3 * 864e5).toISOString().slice(0, 10)) await db.ref(`mood/${d}`).remove();
for (const d of Object.keys((await val('board')) || {})) if (d < new Date(Date.now() - 60 * 864e5).toISOString().slice(0, 10)) await db.ref(`board/${d}`).remove();
for (const [uid, p] of Object.entries((await val('presence')) || {})) if (!p || !p.t || p.t < Date.now() - 12 * 3600e3) await db.ref(`presence/${uid}`).remove();
console.log('清理完成');
process.exit(0);
