// 我：名字、团子颜色、语言、推送、安装、退出
import { showCreatorNote, noteTitle, showTour, tourTitle } from './intro.js';
import { S, B, t, h, svg, ICON, toast, mochi, colorOf, nameOf, COLORS, LANGS, lang, setLang, store, clean, DEMO } from './core.js';

const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
let deferredInstall = null;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredInstall = e; });

export function viewMe(ctx, rerender) {
  const name = h('input', { class: 'inp', maxlength: '24', value: nameOf(S.uid), 'aria-label': t('myName') });
  const msg = h('div', { class: 'err' });
  const me = S.profiles[S.uid] || {};
  const colors = h('div', { class: 'chips', style: 'gap:4px' }, COLORS.map(c => h('button', { 'aria-label': c, 'aria-pressed': String(colorOf(S.uid) === c), style: `border:2px solid ${colorOf(S.uid) === c ? 'var(--pri)' : 'transparent'};background:#fff;border-radius:18px;padding:0;width:68px;height:68px;overflow:hidden;display:flex;justify-content:center;align-items:flex-end`, onclick: async () => { const me = S.profiles[S.uid] = S.profiles[S.uid] || {}; const prev = me.color; me.color = c; rerender(); try { await B.set(`profiles/${S.uid}/color`, c); } catch (e) { me.color = prev; rerender(); toast(t('errGeneric')); } } }, h('div', { style: 'margin-bottom:-8px' }, mochi('idle', c, .62)))));
  const pushRow = () => {
    if (!B.pushSupported()) return h('div', { class: 'note', text: DEMO ? t('pushDemo') : isIOS() && !isStandalone() ? t('pushIOS') : t('pushUnsupported') });
    return S.pushOn ? h('button', { class: 'btn sm ghost', text: t('pushOff'), onclick: async () => { await B.disablePush().catch(() => { }); S.pushOn = false; store.set('tg-push', false); rerender(); } })
      : h('button', { class: 'btn sm', text: t('pushOn'), onclick: async () => { try { await B.enablePush(); S.pushOn = true; store.set('tg-push', true); toast(t('pushDone')); rerender(); } catch (e) { toast(e.message === 'denied' ? t('pushDenied') : t('pushUnsupported')); } } });
  };
  const steps = isIOS() ? ['ios1', 'ios2', 'ios3'] : ['and1', 'and2', 'and3'];
  return h('div', { class: 'wrap stack' },
    h('a', { href: '#home', class: 'row small', style: 'text-decoration:none;color:var(--muted);gap:4px' }, svg(ICON.back, 18), t('back')),
    h('section', { class: 'card row' }, h('div', { style: 'width:80px;height:80px;display:flex;justify-content:center;align-items:flex-end;overflow:hidden' }, mochi('idle', colorOf(S.uid), .8)),
      h('div', null, h('div', { style: 'font-family:var(--brand);font-weight:700;font-size:22px', text: nameOf(S.uid) }), h('div', { class: 'small muted', style: 'word-break:break-all', text: S.email }))),
    h('section', { class: 'card stack', style: 'gap:10px' }, h('label', { class: 'field' }, t('myName'), name), msg,
      h('button', { class: 'btn sm', style: 'align-self:flex-start', text: t('save'), onclick: async () => { const v = clean(name.value, 24); if (!v) return; try { await B.set(`profiles/${S.uid}/name`, v); msg.className = 'err ok'; msg.textContent = t('saved'); } catch (e) { msg.className = 'err'; msg.textContent = t('errGeneric'); } } })),
    h('section', { class: 'card stack', style: 'gap:10px' }, h('div', { class: 'card-t', text: t('myMochi') }), h('div', { class: 'note', text: t('myMochiSub') }), colors),
    h('section', { class: 'card stack', style: 'gap:10px' }, h('div', { class: 'card-t', text: t('language') }),
      h('div', { class: 'chips' }, LANGS.map(([c, l]) => h('button', { class: 'chip' + (lang === c ? ' on' : ''), lang: c, text: l, onclick: () => { setLang(c); if (S.uid) B.set(`profiles/${S.uid}/lang`, c).catch(() => { }); rerender(); } }))),
      h('div', { class: 'note', text: t('langNote') })),
    h('section', { class: 'card stack', style: 'gap:10px' }, h('div', { class: 'card-t', text: t('pushTitle') }), h('div', { class: 'note', text: t('pushBody') }), pushRow()),
    h('button', { class: 'card between', style: 'border:0;width:100%;text-align:start;font:inherit;color:inherit;cursor:pointer', onclick: () => showCreatorNote(true) }, h('div', { class: 'card-t', text: noteTitle() }), h('span', { class: 'small', style: 'color:var(--pri)', text: '›' })),
    h('button', { class: 'card between', style: 'border:0;width:100%;text-align:start;font:inherit;color:inherit;cursor:pointer', onclick: () => { location.hash = '#home'; setTimeout(() => showTour(true), 300); } }, h('div', { class: 'card-t', text: tourTitle() }), h('span', { class: 'small', style: 'color:var(--pri)', text: '›' })),
    h('section', { class: 'card stack', style: 'gap:10px' }, h('div', { class: 'card-t', text: t('install') }),
      isStandalone() ? h('div', { text: t('installed') }) : deferredInstall ? h('button', { class: 'btn sm', style: 'align-self:flex-start', text: t('installBtn'), onclick: async () => { deferredInstall.prompt(); await deferredInstall.userChoice.catch(() => { }); deferredInstall = null; rerender(); } })
        : h('ol', { style: 'margin:0;padding-inline-start:20px;line-height:1.9;font-size:14px' }, steps.map(s => h('li', { text: t(s) })))),
    S.admin ? h('div', { class: 'note', text: t('adminNote') }) : null,
    h('button', { class: 'btn ghost full', text: t('signOut'), onclick: () => B.signOut() }),
    h('div', { class: 'tiny muted', style: 'text-align:center', text: 'Together 同窗 · v1' }));
}
