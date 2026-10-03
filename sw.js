// 교재 뷰어 서비스 워커(2026-10-03 사용자 지시 「오프라인에서도 열리게」): 화면(view.html 등)은 인터넷 우선 → 끊기면 마지막으로 받은 것.
// 책 쪽(books/*.bin)은 뷰어가 Cache Storage(lb:<책>:<판>)에서 먼저 꺼내므로 여기서는 인터넷이 끊겼을 때만 같은 저장소에서 찾아 준다.
const SHELL = 'lb-shell', FILES = ['./', 'view.html', 'index.html'];
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(SHELL).then(c => c.addAll(FILES)).catch(() => {})); });
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  if (r.mode === 'navigate') {
    const name = new URL(r.url).pathname.split('/').pop() || 'index.html';
    e.respondWith(fetch(r).then(res => {
      if (res.ok) { const cp = res.clone(); caches.open(SHELL).then(c => c.put(name, cp)).catch(() => {}); }
      return res;
    }).catch(() => caches.open(SHELL).then(c => c.match(name)).then(m => m || caches.match(r, {ignoreSearch: true})).then(m => m ||
      new Response('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><body style="font:17px/1.7 -apple-system,sans-serif;padding:56px 24px;text-align:center">인터넷에 연결되어 있지 않고, 이 기기에 저장된 교재 화면도 없습니다.<br>인터넷이 될 때 한 번 열어 두세요.</body>', {headers: {'Content-Type': 'text/html; charset=utf-8'}}))));
    return;
  }
  if (/\/books\/.+\.bin$/.test(r.url)) e.respondWith(fetch(r).catch(() => caches.match(r, {ignoreSearch: true}).then(m => m || Response.error())));
});
// build 1791030368
