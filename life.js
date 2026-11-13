// 一起生活：一起玩、需要帮忙
import { S, B, t, h, svg, ICON, num, fmtDate, fmtTime, timeAgo, toast, avatar, nameOf, openSheet, closeSheet, store, clean, DEFAULT_TAGS, dayKey } from './core.js';
import { confirmTap } from './study.js';

const tagLabel = k => k.startsWith('#') ? k : t('tag_' + k);

export function viewLife(ctx) {
  const body = h('div', { class: 'stack' });
  const tabs = ['hang', 'help'];
  const seg = h('div', { class: 'seg', role: 'tablist' });
  const fab = h('button', { class: 'fab', 'aria-label': t('postHang'), onclick: () => postSheet() }, svg(ICON.plus, 26, 2.2));
  const show = k => {
    S.tab.life = k; store.set('tg-tabs', S.tab);
    seg.replaceChildren(...tabs.map(x => h('button', { role: 'tab', 'aria-selected': String(x === k), class: x === k ? 'on' : '', text: t('tab_' + x), onclick: () => show(x) })));
    ctx.resetTab();
    fab.classList.toggle('hidden', k !== 'hang');
    body.replaceChildren(k === 'hang' ? hangTab(ctx) : helpTab(ctx));
  };
  const el = h('div', { class: 'wrap stack' }, h('h1', { class: 'h-title', text: t('lifeTogether') }), seg, body, fab);
  show(tabs.includes(S.tab.life) ? S.tab.life : 'hang');
  return el;
}

function hangTab(ctx) {
  const chips = h('div', { class: 'chips scroll' }), list = h('div', { class: 'stack', style: 'gap:12px' });
  let hang = {}, joins = {};
  const paint = () => {
    const now = Date.now();
    const arr = Object.entries(hang || {}).map(([id, x]) => ({ id, ...x, joiners: Object.keys((joins || {})[id] || {}) }))
      .filter(x => x.mode === 'plan' ? x.whenAt > now - 3 * 3600e3 : (x.created || 0) > now - 7 * 864e5);
    const custom = [...new Set(arr.flatMap(x => (x.tags || []).filter(g => g.startsWith('#'))))].slice(0, 8);
    chips.replaceChildren(...['all', ...DEFAULT_TAGS, ...custom].map(k => h('button', { class: 'chip' + (S.lifeTag === k ? ' on' : ''), text: k === 'all' ? t('all') : tagLabel(k), onclick: () => { S.lifeTag = k; paint(); } })));
    const shown = arr.filter(x => S.lifeTag === 'all' || (x.tags || []).includes(S.lifeTag))
      .sort((a, b) => (a.mode === 'plan' ? 0 : 1) - (b.mode === 'plan' ? 0 : 1) || (a.mode === 'plan' ? a.whenAt - b.whenAt : (b.created || 0) - (a.created || 0)));
    if (!shown.length) { list.replaceChildren(h('div', { class: 'empty', text: t('noHang') })); return; }
    list.replaceChildren(...shown.map(x => hangCard(x)));
  };
  const hangCard = x => {
    const inIt = x.joiners.includes(S.uid), isHost = x.host === S.uid;
    const cap = Math.max(2, Math.min(30, +x.cap || 6));
    const full = x.mode === 'plan' && x.joiners.length >= cap && !inIt;
    const toggle = () => inIt ? B.remove(`hangJoins/${x.id}/${S.uid}`) : B.set(`hangJoins/${x.id}/${S.uid}`, true);
    const cancel = (isHost || S.admin) ? h('button', { class: 'linkbtn danger', style: 'padding:0;font-size:12px', text: t('cancelHang'), onclick: e => confirmTap(e.target, () => B.update({ [`hangouts/${x.id}`]: null, [`hangJoins/${x.id}`]: null })) }) : null;
    if (x.mode === 'free') {
      return h('article', { class: 'card row' }, avatar(x.host, 'av-lg'),
        h('div', { class: 'grow' }, h('div', { style: 'font-weight:600', text: t('freeTitle', nameOf(x.host)) }), h('div', { class: 'small muted', text: x.title || t('freeSub') }),
          x.joiners.length > 1 ? h('div', { class: 'small', style: 'margin-top:4px;color:var(--pri-ink)', text: t('discussing', x.joiners.filter(u => u !== x.host).map(nameOf).join('、')) }) : null, cancel),
        isHost ? null : h('button', { class: 'btn sm ' + (inIt ? 'soft' : ''), text: inIt ? t('discussOn') : t('discuss'), onclick: toggle }));
    }
    const plan = x.mode === 'plan';
    return h('article', { class: 'card stack', style: 'gap:10px' },
      h('div', { class: 'between' }, h('span', { class: 'badge', style: plan ? 'background:var(--pri-soft);color:#2f3566' : 'background:var(--warm-soft);color:var(--warm-ink)', text: plan ? t('mode_plan') : t('mode_idea') }), h('span', { class: 'small muted', text: t('hostBy', nameOf(x.host)) })),
      h('div', { class: 'ugc', style: 'font-weight:700;font-size:17px;word-break:break-word', text: x.title }),
      h('div', { class: 'small', style: 'color:#4a4656', text: [plan ? `${fmtDate(new Date(x.whenAt), { weekday: 'short', month: 'short', day: 'numeric' })} ${fmtTime(new Date(x.whenAt))}` : x.whenText, x.where].filter(Boolean).join(' · ') || t('detailsTBD') }),
      (x.tags || []).length ? h('div', { class: 'chips', style: 'gap:6px' }, x.tags.map(g => h('span', { class: 'tag', text: tagLabel(g) }))) : null,
      h('div', { class: 'between' },
        h('div', { class: 'row', style: 'gap:6px' }, h('div', { class: 'avs' }, x.joiners.slice(0, 6).map(u => avatar(u))), h('span', { class: 'small muted', text: plan ? `${num(x.joiners.length)} / ${num(cap)}` : t('meTooN', num(x.joiners.length)) })),
        isHost ? cancel : h('button', { class: 'btn sm ' + (inIt ? 'soft' : plan ? 'green' : 'ghost'), disabled: full, text: plan ? (inIt ? t('joinedLeave') : full ? t('full') : t('join')) : (inIt ? t('meTooOn') : t('meToo')), onclick: toggle })),
      isHost ? null : cancel);
  };
  ctx.sub('hangouts', v => { hang = v; paint(); });
  ctx.sub('hangJoins', v => { joins = v; paint(); });
  return h('div', { class: 'stack' }, chips, list);
}

function postSheet() {
  let mode = 'plan';
  const tags = new Set();
  const err = h('div', { class: 'err' });
  const title = h('input', { maxlength: '80' });
  const date = h('input', { type: 'date', value: dayKey(new Date(Date.now() + 864e5)) });
  const time = h('input', { type: 'time', value: '17:00' });
  const whenText = h('input', { maxlength: '40', placeholder: t('whenTextPh') });
  const where = h('input', { maxlength: '60', placeholder: t('wherePh') });
  const cap = h('input', { type: 'number', min: '2', max: '30', value: '4', inputmode: 'numeric' });
  const customTag = h('input', { class: 'inp', maxlength: '12', placeholder: t('customTagPh'), style: 'height:36px;padding:0 12px;font-size:14px;width:130px;border-radius:999px' });
  const modes = h('div', { class: 'stack', style: 'gap:8px' }), tagBox = h('div', { class: 'chips' }), quick = h('div', { class: 'chips' }), fields = h('div', { class: 'stack' });
  const addCustom = () => { const v = clean(customTag.value, 12).replace(/^#/, ''); if (v) { tags.add('#' + v); customTag.value = ''; draw(); } };
  customTag.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addCustom(); } });
  function draw() {
    modes.replaceChildren(...['plan', 'idea', 'free'].map(k => h('button', { type: 'button', class: 'mode-card' + (mode === k ? ' on' : ''), onclick: () => { mode = k; draw(); } }, h('b', { text: t('mode_' + k) }), h('span', { text: t('mode_' + k + '_d') }))));
    tagBox.replaceChildren(...[...DEFAULT_TAGS, ...[...tags].filter(g => g.startsWith('#'))].map(k => h('button', { type: 'button', class: 'chip' + (tags.has(k) ? ' on' : ''), text: tagLabel(k), onclick: () => { tags.has(k) ? tags.delete(k) : tags.add(k); draw(); } })), customTag, h('button', { type: 'button', class: 'chip dash', text: '+', 'aria-label': t('addTag'), onclick: addCustom }));
    quick.replaceChildren(...['q1', 'q2', 'q3', 'q4', 'q5'].map(k => h('button', { type: 'button', class: 'chip', style: 'background:var(--warm-soft);border-color:transparent;color:var(--warm-ink)', text: t(k), onclick: () => { title.value = t(k); } })));
    fields.replaceChildren(...(mode === 'plan' ? [
      h('label', { class: 'field' }, t('whatPlay'), title),
      h('div', { class: 'two' }, h('label', { class: 'field' }, t('date'), date), h('label', { class: 'field' }, t('time'), time)),
      h('div', { class: 'two' }, h('label', { class: 'field' }, t('where'), where), h('label', { class: 'field' }, t('cap'), cap))
    ] : mode === 'idea' ? [
      h('label', { class: 'field' }, t('ideaWhat'), title),
      h('div', { class: 'two' }, h('label', { class: 'field' }, t('whenRough'), whenText), h('label', { class: 'field' }, t('where'), where))
    ] : [h('label', { class: 'field' }, t('freeNote'), title), h('div', { class: 'note', text: t('freeHint') })]));
  }
  draw();
  openSheet(t('postHang'), h('div', { class: 'stack' },
    h('div', { class: 'field' }, t('youAre'), modes), h('div', { class: 'field' }, t('tags'), tagBox),
    h('div', { class: 'field' }, t('quickFill'), quick), fields, err,
    h('button', { class: 'btn full warm', text: t('postIt'), onclick: async () => {
      const ttl = clean(title.value, 80);
      if (mode !== 'free' && !ttl) { err.textContent = t('needWhat'); return; }
      const v = { mode, title: ttl, tags: [...tags].slice(0, 6), host: S.uid, created: B.TS };
      if (mode === 'plan') { const at = new Date(`${date.value}T${time.value}`).getTime(); if (!isFinite(at)) { err.textContent = t('needWhen'); return; } v.whenAt = at; v.where = clean(where.value, 60); v.cap = Math.max(2, Math.min(30, Math.round(+cap.value) || 4)); }
      if (mode === 'idea') { v.whenText = clean(whenText.value, 40); v.where = clean(where.value, 60); }
      try { const id = await B.push('hangouts', v); await B.set(`hangJoins/${id}/${S.uid}`, true); closeSheet(); toast(t('posted')); }
      catch (e) { err.textContent = t('errGeneric'); }
    } })));
}

function helpTab(ctx) {
  const list = h('div', { class: 'stack', style: 'gap:12px' });
  const text = h('textarea', { maxlength: '300', placeholder: t('helpPh'), 'aria-label': t('helpPh') });
  let help = {}, offers = {};
  const paint = () => {
    const arr = Object.entries(help || {}).map(([id, x]) => ({ id, ...x, offers: Object.keys((offers || {})[id] || {}) }))
      .filter(x => !x.done || (x.t || 0) > Date.now() - 3 * 864e5).filter(x => (x.t || 0) > Date.now() - 30 * 864e5)
      .sort((a, b) => (a.done ? 1 : 0) - (b.done ? 1 : 0) || (b.t || 0) - (a.t || 0));
    if (!arr.length) { list.replaceChildren(h('div', { class: 'empty', text: t('noHelp') })); return; }
    list.replaceChildren(...arr.map(x => {
      const mine = x.by === S.uid, offered = x.offers.includes(S.uid);
      return h('article', { class: 'card stack', style: `gap:10px;${x.done ? 'opacity:.6' : ''}` },
        h('div', { class: 'row', style: 'align-items:flex-start' }, h('span', { style: 'color:#c4775f;margin-top:2px' }, svg(ICON.hand, 22)),
          h('div', { class: 'grow' }, h('div', { style: 'font-weight:500;line-height:1.6;word-break:break-word', class: (x.done ? 'done-text ' : '') + 'ugc', text: x.text }), h('div', { class: 'small muted', text: `${nameOf(x.by)} · ${timeAgo(x.t || Date.now())}${x.done ? ' · ' + t('solved') : ''}` }))),
        h('div', { class: 'between' },
          h('div', { class: 'row', style: 'gap:6px' }, x.offers.length ? [h('div', { class: 'avs' }, x.offers.slice(0, 6).map(u => avatar(u))), h('span', { class: 'small muted', text: t('canHelpN', num(x.offers.length)) })] : h('span', { class: 'small muted', text: t('noOffers') })),
          mine ? h('div', { class: 'row', style: 'gap:6px' },
            x.done ? null : h('button', { class: 'btn xs soft', text: t('markSolved'), onclick: () => B.set(`help/${x.id}/done`, true) }),
            h('button', { class: 'btn xs ghost', text: t('delete'), onclick: e => confirmTap(e.target, () => B.update({ [`help/${x.id}`]: null, [`helpOffers/${x.id}`]: null })) }))
            : x.done ? null : h('button', { class: 'btn sm ' + (offered ? 'soft' : ''), text: offered ? t('iCanHelpOn') : t('iCanHelp'), onclick: () => offered ? B.remove(`helpOffers/${x.id}/${S.uid}`) : B.set(`helpOffers/${x.id}/${S.uid}`, true) })),
        S.admin && !mine ? h('button', { class: 'linkbtn danger', style: 'align-self:flex-start;padding:0;font-size:12px', text: t('delete'), onclick: e => confirmTap(e.target, () => B.update({ [`help/${x.id}`]: null, [`helpOffers/${x.id}`]: null })) }) : null);
    }));
  };
  ctx.sub('help', v => { help = v; paint(); });
  ctx.sub('helpOffers', v => { offers = v; paint(); });
  return h('div', { class: 'stack' },
    h('div', { class: 'card stack', style: 'gap:10px' }, h('div', { class: 'card-t', text: t('needHelp') }), h('label', { class: 'field' }, text),
      h('button', { class: 'btn full', text: t('postHelp'), onclick: async () => { const v = clean(text.value, 300); if (!v) return; await B.push('help', { text: v, by: S.uid, t: B.TS, done: false }).catch(() => toast(t('errGeneric'))); text.value = ''; } })),
    list);
}
