// 一起学习：自习室列表、会议日历、资料室
import { S, B, t, h, svg, ICON, num, dayKey, parseDay, fmtMD, fmtDate, toast, avatar, nameOf, colorOf, mochi, openSheet, closeSheet, sha256, clean, store } from './core.js';
import { CONFERENCES, FIELDS } from './conferences.js';

export function viewStudy(ctx) {
  const body = h('div', { class: 'stack' });
  const tabs = ['rooms', 'conf', 'lib'];
  const seg = h('div', { class: 'seg', role: 'tablist' });
  const show = k => {
    S.tab.study = k; store.set('tg-tabs', S.tab);
    seg.replaceChildren(...tabs.map(x => h('button', { role: 'tab', 'aria-selected': String(x === k), class: x === k ? 'on' : '', text: t('tab_' + x), onclick: () => show(x) })));
    ctx.resetTab();
    body.replaceChildren(k === 'rooms' ? roomsTab(ctx) : k === 'conf' ? confTab(ctx) : libTab(ctx));
  };
  const el = h('div', { class: 'wrap stack' }, h('h1', { class: 'h-title', text: t('studyTogether') }), seg, body);
  show(tabs.includes(S.tab.study) ? S.tab.study : 'rooms');
  return el;
}

/* ================= 自习室 ================= */
export async function joinRoomFlow(id, name) {
  const err = h('div', { class: 'err' });
  const pw = h('input', { class: 'inp', type: 'password', autocomplete: 'off', placeholder: t('roomPw'), 'aria-label': t('roomPw') });
  const go = h('button', { class: 'btn full', text: t('enter'), onclick: async () => {
    go.disabled = true; err.textContent = '';
    try {
      const hash = await sha256(`${id}:${pw.value}`);
      await B.set(`roomMembers/${id}/${S.uid}`, hash);
      await B.set(`myRooms/${S.uid}/${id}`, true);
      closeSheet(); location.hash = '#room/' + id;
    } catch (e) { err.textContent = t('pwWrong'); go.disabled = false; }
  } });
  pw.addEventListener('keydown', e => { if (e.key === 'Enter') go.click(); });
  openSheet(name || t('privateRoom'), h('div', { class: 'stack' }, h('div', { class: 'note', text: t('pwAsk') }), pw, err, go));
  setTimeout(() => pw.focus(), 60);
}

function createRoomSheet() {
  const err = h('div', { class: 'err' });
  const name = h('input', { maxlength: '40', placeholder: t('roomNamePh') });
  const when = h('input', { maxlength: '40', placeholder: t('roomWhenPh') });
  const pw = h('input', { maxlength: '40', placeholder: t('roomPwPh'), autocomplete: 'off' });
  const go = h('button', { class: 'btn full', text: t('create'), onclick: async () => {
    const n = clean(name.value, 40), p = pw.value.trim();
    if (!n) { err.textContent = t('needName'); return; }
    if (p.length < 4) { err.textContent = t('pwShort'); return; }
    go.disabled = true;
    try {
      const id = B.newKey('rooms');
      const hash = await sha256(`${id}:${p}`);
      await B.set(`rooms/${id}`, { name: n, when: clean(when.value, 40), host: S.uid, created: B.TS });
      await B.set(`roomSecrets/${id}`, hash);
      await B.set(`roomMembers/${id}/${S.uid}`, hash);
      await B.set(`myRooms/${S.uid}/${id}`, true);
      closeSheet(); location.hash = '#room/' + id;
    } catch (e) { err.textContent = t('errGeneric'); go.disabled = false; }
  } });
  openSheet(t('createRoom'), h('div', { class: 'stack' },
    h('label', { class: 'field' }, t('roomName'), name),
    h('div', { class: 'two' }, h('label', { class: 'field' }, t('roomWhen'), when), h('label', { class: 'field' }, t('roomPw'), pw)),
    h('div', { class: 'note', text: t('roomPwNote') }), err, go));
}

function roomsTab(ctx) {
  const pub = h('div'), list = h('div', { class: 'stack', style: 'gap:12px' });
  let rooms = {}, mine = {};
  const paintPub = () => {
    const here = Object.entries(S.presence || {}).filter(([, p]) => p && p.room === 'public');
    const w = here.filter(([, p]) => p.st === 'w').length, b = here.filter(([, p]) => p.st === 'b').length;
    const show = here.slice(0, 3);
    pub.replaceChildren(h('a', { href: '#room/public', class: 'card', style: 'display:block;padding:0;overflow:hidden;text-decoration:none;color:var(--ink)' },
      h('div', { style: 'height:150px;position:relative;background:linear-gradient(180deg,#d7ecff,#f4faff)' },
        h('div', { style: 'position:absolute;inset-inline-end:28px;top:18px;width:30px;height:30px;border-radius:50%;background:#ffe08a;box-shadow:0 0 24px 6px rgba(255,224,138,.55)' }),
        h('div', { class: 'd-cloud', style: 'left:30px;top:26px;width:54px;height:15px' }),
        h('div', { style: 'position:absolute;left:0;right:0;bottom:0;height:34px;background:#efe2d0' }),
        h('div', { style: 'position:absolute;left:14px;right:14px;bottom:4px;display:flex;justify-content:space-around' },
          (show.length ? show : [['x', { st: 'i' }]]).map(([uid, p]) => h('div', { style: 'width:84px;height:84px;position:relative;display:flex;justify-content:center' },
            mochi(p.st === 'w' ? 'write' : p.st === 'b' ? (p.a || 'water') : 'idle', uid === 'x' ? '#e8ddd0' : colorOf(uid), .84),
            h('div', { style: 'position:absolute;left:6px;right:6px;bottom:0;height:6px;border-radius:3px;background:#d8b996' }))))),
      h('div', { class: 'between', style: 'padding:16px 18px 18px' },
        h('div', null, h('div', { style: 'font-weight:600;font-size:17px', text: t('publicRoom') }), h('div', { class: 'small muted', style: 'margin-top:2px', text: t('publicRoomSub', num(w), num(b)) })),
        h('span', { class: 'btn sm', text: t('goSit') }))));
  };
  const paintList = () => {
    const arr = Object.entries(rooms || {}).map(([id, r]) => ({ id, ...r })).sort((a, b) => (b.created || 0) - (a.created || 0));
    if (!arr.length) { list.replaceChildren(h('div', { class: 'note', text: t('noRooms') })); return; }
    list.replaceChildren(...arr.map(r => {
      const inRoom = Object.values(S.presence || {}).filter(p => p && p.room === r.id).length;
      const member = !!(mine || {})[r.id];
      return h('div', { class: 'card row' },
        h('div', { style: 'width:44px;height:44px;border-radius:14px;background:var(--pri-soft);color:var(--pri-ink);display:flex;align-items:center;justify-content:center;flex:none' }, svg(ICON.lock, 20)),
        h('div', { class: 'grow' }, h('div', { style: 'font-weight:600', text: r.name }), h('div', { class: 'small muted', style: 'margin-top:2px', text: [t('createdBy', nameOf(r.host)), r.when, t('inRoomN', num(inRoom))].filter(Boolean).join(' · ') })),
        h('div', { class: 'stack', style: 'gap:4px;align-items:flex-end' },
          member ? h('a', { class: 'btn sm', href: '#room/' + r.id, text: t('enter') }) : h('button', { class: 'btn sm ghost', text: t('enterPw'), onclick: () => joinRoomFlow(r.id, r.name) }),
          r.host === S.uid || S.admin ? h('button', { class: 'linkbtn danger', style: 'padding:2px;font-size:12px', text: t('delete'), onclick: e => confirmTap(e.target, () => B.update({ [`rooms/${r.id}`]: null, [`roomSecrets/${r.id}`]: null, [`chats/${r.id}`]: null })) }) : null));
    }));
  };
  ctx.sub('rooms', v => { rooms = v; paintList(); });
  ctx.sub(`myRooms/${S.uid}`, v => { mine = v; paintList(); });
  ctx.onPresence(() => { paintPub(); paintList(); });
  paintPub();
  return h('div', { class: 'stack' }, pub,
    h('div', { class: 'between', style: 'margin-top:6px' }, h('div', { class: 'card-t', text: t('privateRooms') }), h('button', { class: 'btn sm', text: '+ ' + t('create'), onclick: createRoomSheet })),
    h('div', { class: 'note', style: 'margin-top:-6px', text: t('privateRoomsNote') }), list);
}

export function confirmTap(btn, fn) {
  if (btn.dataset.confirm) { fn(); return; }
  btn.dataset.confirm = '1'; const old = btn.textContent; btn.textContent = t('sure');
  setTimeout(() => { if (btn.isConnected) { delete btn.dataset.confirm; btn.textContent = old; } }, 3500);
}

/* ================= 会议日历 ================= */
function confStatus(c) {
  const today = dayKey();
  if (c.deadline) return c.deadline >= today ? 'open' : 'closed';
  return c.closed ? 'closed' : 'tba';
}
const daysLeft = d => Math.round((parseDay(d) - parseDay(dayKey())) / 864e5);
function fmtRange(s) {
  if (!s) return '';
  const [a, b] = s.split('/'); const da = parseDay(a), db = b ? parseDay(b) : null;
  return db ? `${fmtDate(da, { year: 'numeric', month: 'short', day: 'numeric' })} – ${fmtMD(db)}` : fmtDate(da, { year: 'numeric', month: 'short', day: 'numeric' });
}

function collabSheet(c, existing) {
  const note = h('textarea', { maxlength: '200', placeholder: t('collabPh') }); note.value = existing ? existing.note || '' : '';
  openSheet(t('collabTitle', c.short), h('div', { class: 'stack' },
    h('div', { class: 'note', text: t('collabNote') }),
    h('label', { class: 'field' }, t('collabLbl'), note),
    h('button', { class: 'btn full', text: existing ? t('save') : t('collabPost'), onclick: async () => { await B.set(`confCollab/${c.id}/${S.uid}`, { note: clean(note.value, 200), t: B.TS }); closeSheet(); } }),
    existing ? h('button', { class: 'btn full ghost', text: t('collabStop'), onclick: async () => { await B.remove(`confCollab/${c.id}/${S.uid}`); closeSheet(); } }) : null));
}

function addConfSheet() {
  const err = h('div', { class: 'err' });
  const f = { short: h('input', { maxlength: '30', placeholder: 'e.g. ICA' }), full: h('input', { maxlength: '100' }), place: h('input', { maxlength: '60' }), dates: h('input', { maxlength: '40', placeholder: t('confDatesPh') }), deadline: h('input', { type: 'date' }), url: h('input', { type: 'url', maxlength: '300', placeholder: 'https://' }) };
  const tags = new Set();
  const chips = h('div', { class: 'chips' });
  const draw = () => chips.replaceChildren(...FIELDS.map(k => h('button', { type: 'button', class: 'chip' + (tags.has(k) ? ' on' : ''), text: t('field_' + k), onclick: () => { tags.has(k) ? tags.delete(k) : tags.add(k); draw(); } })));
  draw();
  openSheet(t('addConf'), h('div', { class: 'stack' },
    h('div', { class: 'two' }, h('label', { class: 'field' }, t('confShort'), f.short), h('label', { class: 'field' }, t('confDeadline'), f.deadline)),
    h('label', { class: 'field' }, t('confFull'), f.full),
    h('div', { class: 'two' }, h('label', { class: 'field' }, t('confPlace'), f.place), h('label', { class: 'field' }, t('confDates'), f.dates)),
    h('label', { class: 'field' }, t('confUrl'), f.url),
    h('div', { class: 'field' }, t('confFields'), chips), err,
    h('button', { class: 'btn full', text: t('add'), onclick: async () => {
      const short = clean(f.short.value, 30); const url = f.url.value.trim();
      if (!short) { err.textContent = t('needName'); return; }
      if (url && !/^https?:\/\//i.test(url)) { err.textContent = t('badUrl'); return; }
      await B.push('customConfs', { short, full: clean(f.full.value, 100), place: clean(f.place.value, 60), datesText: clean(f.dates.value, 40), deadline: f.deadline.value || null, url: url.slice(0, 300), tags: [...tags], by: S.uid, t: B.TS });
      closeSheet();
    } })));
}

function confTab(ctx) {
  const chips = h('div', { class: 'chips scroll' }), list = h('div', { class: 'stack', style: 'gap:12px' });
  let custom = {}, follows = {}, collab = {};
  const paint = () => {
    chips.replaceChildren(
      h('button', { class: 'chip' + (S.confMine ? ' on' : ''), onclick: () => { S.confMine = !S.confMine; paint(); } }, svg(ICON.star, 14, 2), t('myFollowed')),
      ...['all', ...FIELDS].map(k => h('button', { class: 'chip' + (S.confField === k ? ' on' : ''), text: k === 'all' ? t('all') : t('field_' + k), onclick: () => { S.confField = k; paint(); } })));
    const all = [...CONFERENCES, ...Object.entries(custom || {}).map(([id, c]) => ({ id: 'c_' + id, cid: id, custom: true, year: '', ...c }))];
    const rank = { open: 0, tba: 1, closed: 2 };
    let arr = all.map(c => ({ ...c, status: confStatus(c), fol: Object.keys((follows || {})[c.id] || {}), col: (collab || {})[c.id] || {} }))
      .filter(c => S.confField === 'all' || (c.tags || []).includes(S.confField))
      .filter(c => !S.confMine || c.fol.includes(S.uid))
      .sort((a, b) => rank[a.status] - rank[b.status] || (a.deadline || '9').localeCompare(b.deadline || '9'));
    if (!arr.length) { list.replaceChildren(h('div', { class: 'empty', text: t('noConf') })); return; }
    list.replaceChildren(...arr.map(c => {
      const followed = c.fol.includes(S.uid), myCol = c.col[S.uid];
      const badge = c.status === 'open' ? h('div', { class: 'conf-date', style: 'background:var(--pri);color:#fff' }, t('deadline'), h('b', { text: fmtMD(parseDay(c.deadline)) }), t('daysLeft', num(daysLeft(c.deadline))))
        : c.status === 'tba' ? h('div', { class: 'conf-date', style: 'background:var(--pri-soft);color:var(--pri-ink)' }, t('deadline'), h('b', { style: 'font-size:13px', text: t('tba') }))
          : h('div', { class: 'conf-date', style: 'background:var(--chip);color:var(--muted)' }, h('b', { style: 'font-size:13px', text: t('closed') }), c.deadline ? fmtMD(parseDay(c.deadline)) : '');
      const place = c.placeTBA || !c.place ? t('placeTBA') : c.place + (c.placeCheck ? ' ' + t('placeCheck') : '');
      const colEntries = Object.entries(c.col);
      return h('article', { class: 'card stack', style: 'gap:10px' },
        h('div', { class: 'row', style: 'align-items:flex-start;gap:12px' }, badge,
          h('div', { class: 'grow' },
            h('div', { class: 'row', style: 'gap:6px;align-items:baseline' }, h('span', { style: 'font-weight:700;font-size:17px', text: c.short }), h('span', { class: 'small muted', text: String(c.year || '') })),
            c.full ? h('div', { class: 'small muted', style: 'margin-top:2px', text: c.full }) : null,
            h('div', { class: 'small row', style: 'gap:4px;margin-top:4px' }, svg(ICON.pin, 14), place),
            c.dates || c.datesText ? h('div', { class: 'small muted', style: 'margin-top:2px', text: c.dates ? fmtRange(c.dates) : c.datesText }) : null,
            c.status === 'tba' && c.prev ? h('div', { class: 'small muted', style: 'margin-top:2px', text: t('prevDeadline', fmtMD(new Date(2026, Number(c.prev.slice(0, 2)) - 1, Number(c.prev.slice(3))))) }) : null)),
        (c.tags || []).length ? h('div', { class: 'chips', style: 'gap:6px' }, c.tags.map(k => h('span', { class: 'tag', text: t('field_' + k) }))) : null,
        colEntries.length ? h('div', { class: 'collab' }, h('div', { style: 'font-weight:600', text: t('whoCollab') }),
          colEntries.map(([uid, x]) => h('div', { class: 'row', style: 'gap:8px;align-items:flex-start' }, avatar(uid), h('span', null, h('b', { text: nameOf(uid) }), x.note ? `：${x.note}` : '')))) : null,
        h('div', { class: 'row' },
          h('button', { class: 'btn sm ' + (followed ? 'warm' : 'ghost'), style: 'flex:1', onclick: () => followed ? B.remove(`confFollows/${c.id}/${S.uid}`) : B.set(`confFollows/${c.id}/${S.uid}`, true) }, svg(ICON.star, 15, 2), (followed ? t('followed') : t('follow')) + ' · ' + num(c.fol.length)),
          h('button', { class: 'btn sm ' + (myCol ? 'soft' : 'ghost'), style: 'flex:1', text: t('seekCollab') + ' · ' + num(colEntries.length), onclick: () => collabSheet(c, myCol) }),
          c.url ? h('a', { class: 'btn sm ghost', href: c.url, target: '_blank', rel: 'noopener', 'aria-label': t('officialSite') }, svg(ICON.out, 16)) : null),
        c.custom && (c.by === S.uid || S.admin) ? h('button', { class: 'linkbtn danger', style: 'align-self:flex-start;padding:0', text: t('delete'), onclick: e => confirmTap(e.target, () => B.remove('customConfs/' + c.cid)) }) : null,
        c.custom ? h('div', { class: 'tiny muted', text: t('addedBy', nameOf(c.by)) }) : null);
    }));
  };
  ctx.sub('customConfs', v => { custom = v; paint(); });
  ctx.sub('confFollows', v => { follows = v; paint(); });
  ctx.sub('confCollab', v => { collab = v; paint(); });
  paint();
  return h('div', { class: 'stack' }, chips,
    h('div', { class: 'between' }, h('div', { class: 'small muted', text: t('confSort') }), h('button', { class: 'btn sm', text: '+ ' + t('addConf'), onclick: addConfSheet })),
    list, h('div', { class: 'note', text: t('confDisclaimer') }));
}

/* ================= 资料室 ================= */
function newFolderSheet() {
  const err = h('div', { class: 'err' });
  const name = h('input', { maxlength: '40' }), desc = h('textarea', { maxlength: '200' });
  let kind = 'co';
  const kinds = h('div', { class: 'stack', style: 'gap:8px' });
  const draw = () => kinds.replaceChildren(...['co', 'own'].map(k => h('button', { type: 'button', class: 'mode-card' + (kind === k ? ' on' : ''), onclick: () => { kind = k; draw(); } }, h('b', { text: t('kind_' + k) }), h('span', { text: t('kind_' + k + '_d') }))));
  draw();
  openSheet(t('newFolder'), h('div', { class: 'stack' },
    h('label', { class: 'field' }, t('folderName'), name), h('label', { class: 'field' }, t('folderDesc'), desc), kinds, err,
    h('button', { class: 'btn full', text: t('create'), onclick: async () => {
      const n = clean(name.value, 40); if (!n) { err.textContent = t('needName'); return; }
      const id = await B.push('folders', { name: n, desc: clean(desc.value, 200), kind, owner: S.uid, created: B.TS });
      closeSheet(); location.hash = '#folder/' + id;
    } })));
}

function libTab(ctx) {
  const seg = h('div', { class: 'chips' }), grid = h('div', { class: 'grid2' });
  let folders = {}, links = {};
  const paint = () => {
    seg.replaceChildren(...['all', 'co', 'own'].map(k => h('button', { class: 'chip' + (S.libFilter === k ? ' on' : ''), text: k === 'all' ? t('all') : t('kind_' + k), onclick: () => { S.libFilter = k; paint(); } })));
    const arr = Object.entries(folders || {}).map(([id, f]) => ({ id, ...f })).filter(f => S.libFilter === 'all' || f.kind === S.libFilter).sort((a, b) => (b.created || 0) - (a.created || 0));
    if (!arr.length) { grid.replaceChildren(h('div', { class: 'empty', style: 'grid-column:1/-1', text: t('noFolders') })); return; }
    const colors = ['#f3b27a', '#8f98d8', '#7fae92', '#c79bd6', '#e8a0a0', '#88bcd0'];
    grid.replaceChildren(...arr.map((f, i) => h('a', { href: '#folder/' + f.id, class: 'folder', style: 'text-decoration:none;color:var(--ink)' },
      h('div', { class: 'between' }, h('span', { style: `color:${colors[i % colors.length]}` }, svg(ICON.folder, 30, 1.6)), h('span', { class: 'badge', style: f.kind === 'co' ? 'background:var(--green-soft);color:#3e7a58' : 'background:var(--pri-soft);color:#2f3566', text: t('kind_' + f.kind) })),
      h('div', { style: 'font-weight:600;font-size:15px;line-height:1.35', text: f.name }),
      f.desc ? h('div', { class: 'small muted', style: 'line-height:1.5', text: f.desc }) : null,
      h('div', { class: 'small', style: 'margin-top:auto;color:#4a4656', text: t('folderMeta', nameOf(f.owner), num(Object.keys((links || {})[f.id] || {}).length)) }))));
  };
  ctx.sub('folders', v => { folders = v; paint(); });
  ctx.sub('links', v => { links = v; paint(); });
  paint();
  return h('div', { class: 'stack' }, h('div', { class: 'between' }, seg, h('button', { class: 'btn sm', text: '+ ' + t('folder'), onclick: newFolderSheet })), h('div', { class: 'note', text: t('libNote') }), grid);
}

export function viewFolder(ctx, id) {
  const head = h('div', { class: 'stack', style: 'gap:6px' }), list = h('div', { class: 'stack', style: 'gap:10px' }), addBox = h('div');
  let folder = null;
  const title = h('input', { class: 'inp', maxlength: '100', placeholder: t('linkTitle'), 'aria-label': t('linkTitle') });
  const url = h('input', { class: 'inp', type: 'url', maxlength: '500', placeholder: 'https://…', 'aria-label': 'URL' });
  const err = h('div', { class: 'err' });
  const add = h('button', { class: 'btn full', text: t('addLink'), onclick: async () => {
    const u = url.value.trim();
    if (!/^https?:\/\/\S+$/i.test(u)) { err.textContent = t('badUrl'); return; }
    err.textContent = '';
    await B.push(`links/${id}`, { title: clean(title.value, 100) || u.replace(/^https?:\/\//, '').slice(0, 60), url: u.slice(0, 500), by: S.uid, t: B.TS }).catch(() => { err.textContent = t('errGeneric'); });
    title.value = ''; url.value = '';
  } });
  ctx.sub('folders/' + id, f => {
    folder = f;
    if (!f) { head.replaceChildren(h('div', { class: 'empty', text: t('folderGone') })); addBox.replaceChildren(); return; }
    const canAdd = f.kind === 'co' || f.owner === S.uid;
    head.replaceChildren(
      h('div', { class: 'row', style: 'gap:8px' }, h('h1', { class: 'h-title', style: 'font-size:24px', text: f.name }), h('span', { class: 'badge', style: f.kind === 'co' ? 'background:var(--green-soft);color:#3e7a58' : 'background:var(--pri-soft);color:#2f3566', text: t('kind_' + f.kind) })),
      f.desc ? h('div', { class: 'muted', style: 'font-size:14px;line-height:1.6', text: f.desc }) : null,
      h('div', { class: 'small muted', text: t('createdBy', nameOf(f.owner)) + ' · ' + t(f.kind === 'co' ? 'kind_co_d' : 'kind_own_d') }),
      f.owner === S.uid || S.admin ? h('button', { class: 'linkbtn danger', style: 'align-self:flex-start;padding:0', text: t('deleteFolder'), onclick: e => confirmTap(e.target, async () => { await B.update({ [`folders/${id}`]: null, [`links/${id}`]: null }); location.hash = '#study'; }) }) : null);
    addBox.replaceChildren(canAdd ? h('div', { class: 'card stack', style: 'gap:10px' }, h('div', { class: 'card-t', text: t('addLink') }), title, url, err, add, h('div', { class: 'note', text: t('linkNote') })) : h('div', { class: 'note', text: t('ownOnly') }));
  });
  ctx.sub('links/' + id, v => {
    const arr = Object.entries(v || {}).map(([lid, l]) => ({ lid, ...l })).sort((a, b) => (b.t || 0) - (a.t || 0));
    if (!arr.length) { list.replaceChildren(h('div', { class: 'empty', text: t('noLinks') })); return; }
    list.replaceChildren(...arr.map(l => h('div', { class: 'row' },
      h('a', { class: 'linkrow grow', href: /^https?:/i.test(l.url) ? l.url : '#', target: '_blank', rel: 'noopener noreferrer' }, svg(ICON.link, 18),
        h('span', { class: 'grow' }, h('span', { class: 'ugc', style: 'display:block;font-size:14px;font-weight:500;word-break:break-word', text: l.title }), h('span', { class: 'small muted', style: 'display:block', text: `${(l.url.match(/^https?:\/\/([^/]+)/i) || [, ''])[1]} · ${t('addedBy', nameOf(l.by))}` }))),
      l.by === S.uid || (folder && folder.owner === S.uid) || S.admin ? h('button', { class: 'btn xs ghost', 'aria-label': t('delete'), onclick: e => confirmTap(e.currentTarget, () => B.remove(`links/${id}/${l.lid}`)) }, svg(ICON.x, 14)) : null)));
  });
  return h('div', { class: 'wrap stack' },
    h('a', { href: '#study', class: 'row small', style: 'text-decoration:none;color:var(--muted);gap:4px' }, svg(ICON.back, 18), t('back')),
    head, addBox, h('div', { class: 'card-t', style: 'margin-top:6px', text: t('links') }), list);
}
