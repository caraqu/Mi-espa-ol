const APP_VERSION = 'v52.0';
const CACHE_PREFIX = 'mi-espanol-';
const CACHE_NAME = CACHE_PREFIX + APP_VERSION;
const CORE = ['./index.html'];
const OPTIONAL = ['./manifest.json','./icon.svg','./icon-180.png','./icon-192.png','./icon-512.png'];
self.addEventListener('install', event => {
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE_NAME);
    await cache.addAll(CORE);
    await Promise.allSettled(OPTIONAL.map(url=>cache.add(url)));
  })());
});
self.addEventListener('message', event=>{
  if(event.data?.type==='SKIP_WAITING')self.skipWaiting();
});
self.addEventListener('activate', event=>{
  event.waitUntil((async()=>{
    await Promise.all((await caches.keys()).filter(key=>key.startsWith(CACHE_PREFIX)&&key!==CACHE_NAME).map(key=>caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET'||new URL(request.url).origin!==self.location.origin)return;
  if(request.mode==='navigate'){
    event.respondWith((async()=>{
      const cache=await caches.open(CACHE_NAME);
      try{
        const response=await fetch(request,{cache:'no-store'});
        if(response.ok)await cache.put('./index.html',response.clone());
        return response;
      }catch(error){
        const offline=await cache.match('./index.html');
        return offline||new Response('Offline. Open Mi Español online once to save this version.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
      }
    })());
  }else{
    event.respondWith((async()=>{
      const cache=await caches.open(CACHE_NAME),cached=await cache.match(request);
      if(cached)return cached;
      const response=await fetch(request);
      if(response.ok)await cache.put(request,response.clone());
      return response;
    })());
  }
});
