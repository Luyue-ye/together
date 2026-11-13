// 21:00 汇总与留言板
import { S, B, t, h, svg, ICON, num, dayKey, parseDay, fmtDate, fmtDur, toast, nameOf, clean, timeAgo } from './core.js';
import { confirmTap } from './study.js';

const STICKY = ['#fde7c9', '#dfe3fb', '#e3f0dc', '#f7dde4', '#eee3f7', '#fbeec3'];

export function viewDigest(ctx) {
  const today = dayKey();
  let digests = {}, idx = -1;
  const top = h('div'), boardBox = h('div', { class: 'stack' });
  let unsubBoard = null;
  const paint = () => {
    const keys = Object.keys(digests || {}).sort();
    if (idx < 0 || idx >= keys.length) idx = keys.length - 1;
    const k = keys[idx], d = k ? digests[k] : null;
    const nav = h('div', { class: 'row', style: 'gap:6px' },
      h('button', { class: 'btn xs', style: 'background:#2b3266', 'aria-label': t('prevDay'), disabled: idx <= 0, onclick: () => { idx--; paint(); loadBoard(); } }, svg('<path d="M15 18l-6-6 6-6"/>', 16)),
      h('button', { class: 'btn xs', style: 'background:#2b3266', 'aria-label': t('nextDay'), disabled: idx >= keys.length - 1, onclick: () => { idx++; paint(); loadBoard(); } }, svg('<path d="M9 18l6-6-6-6"/>', 16)));
    const hist = (arr, col) => h('div', { class: 'hist', style: 'margin-top:12px' }, (arr || Array(11).fill(0)).map(v => h('i', { style: `height:${Math.max(3, v / Math.max(1, ...(arr || [1])) * 66)}px;background:${col}` })));
    top.replaceChildren(h('section', { class: 'night stack', style: 'gap:14px' }, h('div', { class: 'moon' }),
      h('div', null, h('div', { class: 'small', style: 'color:#9ea3d4', text: k ? fmtDate(parseDay(k), { weekday: 'long', month: 'long', day: 'numeric' }) : '' }),
        h('div', { style: 'font-family:var(--brand);font-weight:700;font-size:26px;color:#fff;margin-top:2px', text: t('digestTitle') })),
      !d ? h('div', { class: 'ncard', style: 'line-height:1.7', text: t('noDigestYet') }) :
        d.n < 3 ? h('div', { class: 'ncard', style: 'line-height:1.7', text: t('digestFew') }) : [
          h('div', { style: 'display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px' },
            h('div', { class: 'ncard' }, h('div', { class: 'small', style: 'color:#9ea3d4', text: t('checkins') }), h('div', { class: 'num', style: 'font-size:24px;color:#fff', text: num(d.n) })),
            h('div', { class: 'ncard' }, h('div', { class: 'small', style: 'color:#9ea3d4', text: t('avgTired') }), h('div', { class: 'num', style: 'font-size:24px;color:#b9c4ff', text: num(d.tired, 1) })),
            h('div', { class: 'ncard' }, h('div', { class: 'small', style: 'color:#9ea3d4', text: t('avgHappy') }), h('div', { class: 'num', style: 'font-size:24px;color:#ffd27a', text: num(d.happy, 1) }))),
          h('div', { class: 'ncard' }, h('div', { style: 'font-weight:600;color:#fff', text: t('tiredDist') }), hist(d.tiredHist, '#8e9cf0'), h('div', { class: 'between tiny', style: 'color:#9ea3d4;margin-top:4px' }, h('span', { text: t('tiredLo') }), h('span', { text: t('tiredHi') }))),
          h('div', { class: 'ncard' }, h('div', { style: 'font-weight:600;color:#fff', text: t('happyDist') }), hist(d.happyHist, '#ffd27a'), h('div', { class: 'between tiny', style: 'color:#9ea3d4;margin-top:4px' }, h('span', { text: t('happyLo') }), h('span', { text: t('happyHi') })))],
      h('div', { class: 'between' }, h('div', { class: 'tiny', style: 'color:#9ea3d4;line-height:1.6', text: t('digestPrivacy') }), keys.length > 1 ? nav : null)));
  };
  const loadBoard = () => {
    const keys = Object.keys(digests || {}).sort();
    const k = idx >= 0 && keys[idx] ? keys[idx] : today;
    const day = k === dayKey(new Date(Date.now() - 864e5)) || k === today ? today : k; // 最新一页总是今天的留言板
    if (unsubBoard) unsubBoard();
    unsubBoard = ctx.sub('board/' + day, v => paintBoard(day, v));
  };
  const text = h('input', { class: 'inp', maxlength: '140', placeholder: t('boardPh'), 'aria-label': t('boardPh') });
  const anon = h('input', { type: 'checkbox', checked: true, style: 'width:18px;height:18px;accent-color:var(--pri)' });
  const paintBoard = (day, v) => {
    const arr = Object.entries(v || {}).map(([id, x]) => ({ id, ...x })).sort((a, b) => (b.t || 0) - (a.t || 0));
    const canPost = day === today;
    boardBox.replaceChildren(
      h('div', { class: 'between', style: 'margin-top:6px' }, h('div', { style: 'font-family:var(--brand);font-weight:700;font-size:22px', text: t('board') }), h('div', { class: 'small muted', text: canPost ? t('boardSub') : fmtDate(parseDay(day), { month: 'short', day: 'numeric' }) })),
      arr.length ? h('div', { class: 'board' }, arr.map((x, i) => {
        const hugs = Object.keys(x.hugs || {}), hugged = hugs.includes(S.uid);
        return h('div', { class: 'sticky', style: `background:${STICKY[i % STICKY.length]};transform:rotate(${((i % 3) - 1) * 0.9}deg)` },
          h('div', { text: x.text }),
          h('div', { class: 'between small', style: 'color:#6a6580' },
            h('span', { text: x.anon ? t('anon') : nameOf(x.by) }),
            h('button', { class: 'btn xs', style: `background:${hugged ? '#fff' : 'rgba(255,255,255,.65)'};color:#3a3550;font-weight:${hugged ? 700 : 500}`, 'aria-pressed': String(hugged), text: t('hug', num(hugs.length)), onclick: () => hugged ? B.remove(`board/${day}/${x.id}/hugs/${S.uid}`) : B.set(`board/${day}/${x.id}/hugs/${S.uid}`, true) })),
          (x.by && x.by === S.uid) || S.admin ? h('button', { class: 'linkbtn', style: 'padding:0;font-size:11px;align-self:flex-start;color:#8a7a8a', text: t('delete'), onclick: e => confirmTap(e.target, () => B.remove(`board/${day}/${x.id}`)) }) : null);
      })) : h('div', { class: 'empty', text: t('boardEmpty') }),
      canPost ? h('div', { class: 'card stack', style: 'gap:10px' }, text,
        h('div', { class: 'between' }, h('label', { class: 'row small', style: 'gap:8px' }, anon, t('postAnon')),
          h('button', { class: 'btn sm', text: t('stick'), onclick: async () => {
            const v = clean(text.value, 140); if (!v) return;
            const obj = anon.checked ? { text: v, anon: true, t: B.TS } : { text: v, by: S.uid, t: B.TS };
            await B.push(`board/${today}`, obj).catch(() => toast(t('errGeneric'))); text.value = '';
          } }))) : null,
      h('div', { class: 'note', text: t('boardNote') }));
  };
  ctx.sub('moodDigest', v => { const first = digests === null || !Object.keys(digests || {}).length; digests = v || {}; if (first) idx = -1; paint(); if (first) loadBoard(); }, { limitLast: 14 });
  loadBoard();
  return h('div', { class: 'wrap stack' }, top, boardBox);
}
