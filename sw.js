const SUPA = "https://wzrrohbdghzodolllzfa.supabase.co", KEY = "sb_publishable_g2IUcMe1smY9QT4zVuGImQ_AHuBdEfV";
let tok = null;
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("message", e => { if(e.data && "tok" in e.data) tok = e.data.tok; });
async function askTok(){
  for(const c of await self.clients.matchAll({ type: "window" })){
    const t = await new Promise(r => { const ch = new MessageChannel(); ch.port1.onmessage = ev => r(ev.data); c.postMessage("tok?", [ch.port2]); setTimeout(() => r(null), 2000); });
    if(t) return (tok = t);
  }
  return null;
}
async function blob(id){
  for(let i = 0; i < 2; i++){
    const t = tok || await askTok(); if(!t) break;
    const r = await fetch(`${SUPA}/storage/v1/object/authenticated/assets/${id}`, { headers: { Authorization: "Bearer " + t, apikey: KEY } });
    if(r.ok) return new Response(r.body, { status: 200, headers: { "Content-Type": r.headers.get("Content-Type") || "application/octet-stream", "Cache-Control": "private, max-age=86400" } });
    tok = null;
  }
  return new Response("", { status: 404 });
}
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if(u.origin === self.location.origin && u.pathname.startsWith("/_blob/")) e.respondWith(blob(u.pathname.slice(7)));
});
