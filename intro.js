// 开屏标语 + 创作者的话
import { h, lang, store, mochi, colorOf, S } from './core.js';

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
  if (!force && store.get('tg-note-v1', false)) return Promise.resolve();
  let res; const p = new Promise(r => res = r);
  const n = NOTE[lang] || NOTE.en;
  const close = () => { store.set('tg-note-v1', true); bg.classList.add('out'); setTimeout(() => { bg.remove(); res(); }, 300); };
  const bg = h('div', { class: 'note-bg', onclick: e => { if (e.target === bg) close(); } },
    h('div', { class: 'note-card', role: 'dialog', 'aria-label': n.t },
      h('img', { src: 'icon-192.png', alt: '', class: 'note-icon' }),
      h('div', { class: 'note-title', text: n.t }),
      h('div', { class: 'note-body' }, n.b.map(p => h('p', { text: p }))),
      h('div', { class: 'note-sign', text: n.s }),
      h('button', { class: 'btn full', text: n.go, onclick: close })));
  document.body.append(bg);
  return p;
}

// 新手指引：小团子向导，一页一页介绍功能
const TOUR = {
  zh: { skip: '跳过', next: '下一步', done: '开始逛逛', steps: [
    ['嗨，我是你的团子向导！', '花一分钟，带你认识一下 Together 吧。', null, 'idle'],
    ['广场', '每天拖一拖滑块记下心情，写写备忘，看看这周学习和生活平不平衡。', 'home', 'water'],
    ['一起学习', '进自习室坐下，就有团子陪你一起写。还能开带密码的小房间，看会议日历，在资料室分享链接。', 'study', 'write'],
    ['一起生活', '约饭、运动、看电影都在这里发；遇到难处也可以发个求助，大家会来帮忙。', 'life', 'meal'],
    ['21:00 留言板', '每晚 9 点会汇总大家的心情。下面的留言板可以匿名，互相打打气。', 'home', 'music'],
    ['你的小角落', '点右上角的头像，可以改名字、换团子颜色、切换语言、打开推送。', 'me', 'idle'],
    ['就这些啦', '累了就去休息，这里没有人催你。很高兴你来了！', null, 'dream']] },
  en: { skip: 'Skip', next: 'Next', done: 'Start exploring', steps: [
    ['Hi, I’m your mochi guide!', 'Give me a minute to show you around Together.', null, 'idle'],
    ['Plaza', 'Slide to log your mood each day, jot down memos, and see how study and life balance out this week.', 'home', 'water'],
    ['Study together', 'Sit down in a study room and mochi will keep you company. You can also open a private room with a password, browse conferences, and share links in the library.', 'study', 'write'],
    ['Live together', 'Post meals, workouts, or movie nights here. If you need a hand, post a help request and people will pitch in.', 'life', 'meal'],
    ['9 pm board', 'Every night at 9 we share how everyone is feeling. The board below lets you cheer each other on, anonymously if you like.', 'home', 'music'],
    ['Your corner', 'Tap your avatar at the top right to change your name, mochi color, language, and notifications.', 'me', 'idle'],
    ['That’s it!', 'Rest when you’re tired. Nobody is rushing you here. So glad you came!', null, 'dream']] },
  es: { skip: 'Saltar', next: 'Siguiente', done: 'A explorar', steps: [
    ['¡Hola, soy tu guía mochi!', 'Dame un minuto para enseñarte Together.', null, 'idle'],
    ['Plaza', 'Cada día mueve los controles para anotar tu ánimo, escribe notas y mira si esta semana hubo equilibrio entre estudio y vida.', 'home', 'water'],
    ['Estudiar juntos', 'Siéntate en una sala de estudio y los mochis te harán compañía. También puedes abrir una sala privada con contraseña, ver congresos y compartir enlaces en la biblioteca.', 'study', 'write'],
    ['Vivir juntos', 'Publica aquí comidas, deporte o cine. Si necesitas ayuda, pídela y la gente se apuntará.', 'life', 'meal'],
    ['Tablón de las 21:00', 'Cada noche a las 9 resumimos cómo está todo el mundo. En el tablón podéis animaros, también de forma anónima.', 'home', 'music'],
    ['Tu rincón', 'Toca tu avatar arriba a la derecha para cambiar nombre, color del mochi, idioma y notificaciones.', 'me', 'idle'],
    ['¡Eso es todo!', 'Descansa cuando estés cansada/o. Aquí nadie te mete prisa. ¡Qué bien que hayas venido!', null, 'dream']] },
  bn: { skip: 'বাদ দাও', next: 'পরের', done: 'ঘুরে দেখি', steps: [
    ['হাই, আমি তোমার মোচি গাইড!', 'এক মিনিটে Together ঘুরিয়ে দেখাই।', null, 'idle'],
    ['প্লাজা', 'প্রতিদিন স্লাইডার টেনে মন কেমন লিখে রাখো, নোট লেখো, আর দেখো এই সপ্তাহে পড়া আর জীবনের ভারসাম্য কেমন।', 'home', 'water'],
    ['একসাথে পড়া', 'পড়ার ঘরে বসলেই মোচিরা সঙ্গ দেবে। পাসওয়ার্ড দিয়ে নিজেদের ঘর খুলতে পারো, কনফারেন্স দেখতে পারো, লাইব্রেরিতে লিংক শেয়ার করতে পারো।', 'study', 'write'],
    ['একসাথে জীবন', 'খাওয়া, খেলা, সিনেমার পরিকল্পনা এখানে দাও। সাহায্য লাগলে জানাও, সবাই এগিয়ে আসবে।', 'life', 'meal'],
    ['রাত ৯টার বোর্ড', 'প্রতি রাত ৯টায় সবার মনের খবর একসাথে দেখা যায়। নিচের বোর্ডে চাইলে নাম না দিয়েও একে অপরকে উৎসাহ দাও।', 'home', 'music'],
    ['তোমার কোণ', 'উপরে ডানদিকে তোমার ছবিতে চাপ দিয়ে নাম, মোচির রং, ভাষা আর নোটিফিকেশন বদলাও।', 'me', 'idle'],
    ['এই তো!', 'ক্লান্ত হলে বিশ্রাম নাও, এখানে কেউ তাড়া দেয় না। তুমি এসেছ, খুব ভালো লাগছে!', null, 'dream']] },
  fa: { skip: 'رد شدن', next: 'بعدی', done: 'بزن بریم', steps: [
    ['سلام، من راهنمای موچی تو هستم!', 'یک دقیقه وقت بده تا Together را نشانت بدهم.', null, 'idle'],
    ['میدان', 'هر روز با لغزنده‌ها حالت را ثبت کن، یادداشت بنویس و ببین این هفته درس و زندگی چقدر متعادل بوده.', 'home', 'water'],
    ['با هم درس بخوانیم', 'در اتاق مطالعه بنشین تا موچی‌ها همراهت باشند. می‌توانی اتاق خصوصی با رمز بسازی، کنفرانس‌ها را ببینی و در کتابخانه لینک بگذاری.', 'study', 'write'],
    ['با هم زندگی کنیم', 'برنامهٔ غذا، ورزش یا فیلم را اینجا بگذار. اگر کمک لازم داشتی بگو، بقیه می‌آیند.', 'life', 'meal'],
    ['تابلوی ساعت ۹', 'هر شب ساعت ۹ حال همه را با هم می‌بینیم. در تابلوی پایین می‌توانید، حتی بی‌نام، به هم دلگرمی بدهید.', 'home', 'music'],
    ['گوشهٔ تو', 'روی تصویرت بالا سمت راست بزن تا نام، رنگ موچی، زبان و اعلان‌ها را تغییر دهی.', 'me', 'idle'],
    ['همین!', 'خسته که شدی استراحت کن؛ اینجا کسی عجله ندارد. خیلی خوشحالم که آمدی!', null, 'dream']] }
};
export const tourTitle = () => ({ zh: '新手指引', en: 'Quick tour', es: 'Guía rápida', bn: 'ছোট্ট পরিচিতি', fa: 'راهنمای کوتاه' })[lang] || 'Quick tour';

export function showTour(force = false) {
  if (!force && store.get('tg-tour-v1', false)) return;
  const T = TOUR[lang] || TOUR.en;
  let i = 0;
  const card = h('div', { class: 'tour-card', role: 'dialog' });
  const bg = h('div', { class: 'tour-bg' }, card);
  const sel = { home: '.nav a[href="#home"]', study: '.nav a[href="#study"]', life: '.nav a[href="#life"]', me: 'a[href="#me"]' };
  const clearHi = () => { document.querySelectorAll('.tour-hi').forEach(e => e.classList.remove('tour-hi')); document.body.classList.remove('tour-on'); };
  const close = () => { store.set('tg-tour-v1', true); clearHi(); bg.classList.add('out'); setTimeout(() => bg.remove(), 300); };
  const draw = () => {
    const [title, body, target, act] = T.steps[i], last = i === T.steps.length - 1;
    clearHi();
    if (target) { const el = document.querySelector(sel[target]); if (el) { el.classList.add('tour-hi'); document.body.classList.add('tour-on'); } }
    card.replaceChildren(
      h('div', { class: 'tour-guide' }, h('div', { class: 'tour-mochi' }, mochi(act, S.uid ? colorOf(S.uid) : '#c9cff5', .95)),
        h('div', { class: 'tour-bubble' }, h('div', { class: 'tour-title', text: title }), h('div', { class: 'tour-text', text: body }))),
      h('div', { class: 'tour-dots' }, T.steps.map((_, k) => h('i', { class: k === i ? 'on' : '' }))),
      h('div', { class: 'tour-btns' },
        last ? null : h('button', { class: 'btn ghost', text: T.skip, onclick: close }),
        h('button', { class: 'btn', style: 'flex:1', text: last ? T.done : T.next, onclick: () => { if (last) close(); else { i++; draw(); } } })));
  };
  draw();
  document.body.append(bg);
}
