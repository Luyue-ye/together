// 开屏标语 + 创作者的话
import { h, lang, store } from './core.js';

const ORDER = ['zh', 'en', 'es', 'bn', 'fa'];
export const SLOGAN = {
  zh: ['PhD 的路上，幸好有你', '不比快慢，只是同行'],
  en: ['On the PhD road, glad you’re here', 'Not a race. Just walking together.'],
  es: ['En el camino del doctorado, qué suerte tenerte', 'No es una carrera: caminamos juntos.'],
  bn: ['পিএইচডির পথে, ভাগ্যিস তুমি আছো', 'এটা দৌড় নয়, শুধু একসাথে হাঁটা।'],
  fa: ['در مسیر دکتری، خوشحالم که هستی', 'مسابقه نیست؛ فقط با هم قدم می‌زنیم.']
};

const NOTE = {
  zh: { t: '创作者的话', b: ['嗨，我是 Lulu，GSU 传播学的博士生。', '读博很多时候是一个人的事：一个人读文献，一个人改稿，一个人在深夜怀疑自己。我做 Together，是想让这段路不那么孤单。', '这里没有排行榜，也不比谁学得多。自习室里的小团子只是想告诉你：此刻有人和你一起坐在桌前。累了就去休息，想说话就去留言板，想出门就约一顿饭。', '希望你在这里感到的是陪伴，而不是催促。'], s: '—— Lulu', go: '开始吧' },
  en: { t: 'A note from the creator', b: ['Hi, I’m Lulu, a PhD student in Communication at GSU.', 'So much of a PhD is done alone: reading alone, revising alone, doubting yourself alone at midnight. I made Together so the road feels a little less lonely.', 'There are no rankings here, and no one is counting who works more. The mochi in the study room are just a way of saying: someone is sitting at the desk with you right now. Rest when you’re tired, leave a note when you want to talk, and grab a meal when you need to get out.', 'I hope this place feels like company, not pressure.'], s: '— Lulu', go: 'Let’s begin' },
  es: { t: 'Unas palabras de la creadora', b: ['Hola, soy Lulu, estudiante de doctorado en Comunicación en GSU.', 'Gran parte del doctorado se vive en soledad: leer sola, corregir sola, dudar de una misma a medianoche. Hice Together para que el camino se sienta un poco menos solitario.', 'Aquí no hay rankings ni nadie cuenta quién trabaja más. Los mochis de la sala de estudio solo quieren decirte: ahora mismo alguien está sentado a la mesa contigo. Descansa cuando estés cansada/o, deja un mensaje cuando quieras hablar y queda para comer cuando necesites salir.', 'Ojalá este lugar se sienta como compañía, no como presión.'], s: '— Lulu', go: 'Empecemos' },
  bn: { t: 'নির্মাতার কথা', b: ['হাই, আমি লুলু, GSU-তে কমিউনিকেশনে পিএইচডি করছি।', 'পিএইচডির অনেকটাই একা কাটে: একা পড়া, একা সংশোধন, মাঝরাতে একা নিজেকে নিয়ে সন্দেহ। পথটা যেন একটু কম একাকী লাগে, তাই Together বানিয়েছি।', 'এখানে কোনো র‍্যাংকিং নেই, কে বেশি কাজ করল তা কেউ গোনে না। পড়ার ঘরের মোচিরা শুধু বলতে চায়: এই মুহূর্তে কেউ তোমার সাথে টেবিলে বসে আছে। ক্লান্ত হলে বিশ্রাম নাও, কথা বলতে চাইলে বার্তা রেখে যাও, বাইরে যেতে চাইলে একসাথে খেতে যাও।', 'আশা করি এই জায়গাটা চাপ নয়, সঙ্গের মতো লাগবে।'], s: '— লুলু', go: 'শুরু করি' },
  fa: { t: 'سخنی از سازنده', b: ['سلام، من لولو هستم، دانشجوی دکتری ارتباطات در GSU.', 'بخش بزرگی از دکتری در تنهایی می‌گذرد: تنها خواندن، تنها بازنویسی، و نیمه‌شب تنها به خود شک کردن. Together را ساختم تا این راه کمی کمتر تنها باشد.', 'اینجا رتبه‌بندی نیست و کسی نمی‌شمارد چه کسی بیشتر کار می‌کند. موچی‌های اتاق مطالعه فقط می‌خواهند بگویند: همین حالا کسی کنار تو پشت میز نشسته است. خسته که شدی استراحت کن، دلت حرف زدن خواست یادداشت بگذار، و هوس بیرون رفتن کردی با هم غذا بخورید.', 'امیدوارم اینجا برایت همراهی باشد، نه فشار.'], s: '— لولو', go: 'شروع کنیم' }
};

export const noteTitle = () => (NOTE[lang] || NOTE.en).t;

// 开屏：每次打开 App 显示一次（同一次使用中不重复），点一下就跳过
export function showSplash() {
  try { if (sessionStorage.getItem('tg-splash')) return Promise.resolve(); sessionStorage.setItem('tg-splash', '1'); } catch (e) { }
  const order = [lang, ...ORDER.filter(l => l !== lang)];
  const el = h('div', { class: 'splash', role: 'dialog', 'aria-label': SLOGAN[lang][0] },
    h('img', { src: 'icon-512.png', alt: '', class: 'splash-icon' }),
    h('div', { class: 'splash-lines' }, order.map((l, i) => h('div', { class: 'splash-line' + (i === 0 ? ' main' : ''), lang: l, dir: l === 'fa' ? 'rtl' : 'ltr', style: `animation-delay:${0.25 + i * 0.28}s`, text: SLOGAN[l][0] }))),
    h('div', { class: 'splash-sub', style: `animation-delay:${0.35 + order.length * 0.28}s`, text: SLOGAN[lang][1] }),
    h('div', { class: 'splash-brand' }, h('span', { class: 'brand', text: 'Together' }), ' ', h('span', { class: 'brand-zh', text: '同窗' })));
  document.body.append(el);
  return new Promise(res => {
    let done = false;
    const close = () => { if (done) return; done = true; el.classList.add('out'); setTimeout(() => { el.remove(); res(); }, 450); };
    el.addEventListener('click', close);
    setTimeout(close, 3600);
  });
}

// 创作者的话：第一次进 App 时弹出一次；「我」页面里可以再看
export function showCreatorNote(force = false) {
  if (!force && store.get('tg-note-v1', false)) return;
  const n = NOTE[lang] || NOTE.en;
  const close = () => { store.set('tg-note-v1', true); bg.classList.add('out'); setTimeout(() => bg.remove(), 300); };
  const bg = h('div', { class: 'note-bg', onclick: e => { if (e.target === bg) close(); } },
    h('div', { class: 'note-card', role: 'dialog', 'aria-label': n.t },
      h('img', { src: 'icon-192.png', alt: '', class: 'note-icon' }),
      h('div', { class: 'note-title', text: n.t }),
      h('div', { class: 'note-body' }, n.b.map(p => h('p', { text: p }))),
      h('div', { class: 'note-sign', text: n.s }),
      h('button', { class: 'btn full', text: n.go, onclick: close })));
  document.body.append(bg);
}
