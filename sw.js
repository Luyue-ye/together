// Together service worker：缓存 App 外壳 + 接收 21:00 推送
// 每次更新文件后，把 VERSION 改个数字，大家的手机就会拿到新版本。
const VERSION = 'together-v14';
const SHELL = ['./', './index.html', './style.css', './app.js', './core.js', './home.js', './study.js', './room.js', './life.js', './digest.js', './me.js', './i18n.js', './conferences.js', './config.js', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

// ---------- 推送（Firebase Cloud Messaging） ----------
try {
  importScripts('./config.js');
  const cfg = self.TOGETHER_CONFIG || {};
  if (cfg.firebase && cfg.firebase.apiKey && !cfg.firebase.apiKey.startsWith('PASTE')) {
    importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js', 'https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');
    firebase.initializeApp(cfg.firebase);
    firebase.messaging(); // 带 notification 的消息会由 SDK 自动显示
  }
} catch (e) { /* 离线或未配置时忽略 */ }

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    for (const c of list) { if ('focus' in c) { c.navigate('./#digest'); return c.focus(); } }
    return clients.openWindow('./#digest');
  }));
});

// ---------- 缓存 ----------
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request, { cache: 'no-cache' }).then(res => {
      const copy = res.clone();
      caches.open(VERSION).then(c => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
