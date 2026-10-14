const V='exteee-system-v2',F=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(F)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
/* Network-first: always get the newest files when online, fall back to the saved copy when offline */
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const same=new URL(e.request.url).origin===self.location.origin;
  e.respondWith(
    fetch(e.request,same?{cache:'no-cache'}:undefined).then(res=>{
      if(res&&(res.ok||res.type==='opaque')){const c=res.clone();caches.open(V).then(x=>x.put(e.request,c))}
      return res;
    }).catch(()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||caches.match('index.html')))
  );
});
/* Tapping a reminder notification opens the app */
self.addEventListener('notificationclick',e=>{
  e.notification.close();
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{
    for(const c of list){if('focus' in c)return c.focus()}
    return self.clients.openWindow('./');
  }));
});
