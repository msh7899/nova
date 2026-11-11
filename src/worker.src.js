// Cloudflare Worker + D1 — سرور ESP32 (چند دستگاه، چند کاربر، زمان‌بندی)
const DASH = __DASH__;
const LOGIN = __LOGIN__;
const ONLINE = 45, DEF_TZ = "Asia/Tehran";
const enc = new TextEncoder();
const J = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "Content-Type": "application/json" } });
const E = (m, s = 400) => J({ error: m }, s);
const txt = (t, s = 200) => new Response(t, { status: s, headers: { "Content-Type": "text/plain" } });
const html = (h) => new Response(h, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
const hex = (b) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
const sha = async (s) => hex(await crypto.subtle.digest("SHA-256", enc.encode(s)));
const eq = (a, b) => { if (a.length !== b.length) return false; let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i); return r === 0; };
async function pbk(pw, salt) {
  const k = await crypto.subtle.importKey("raw", enc.encode(pw), "PBKDF2", false, ["deriveBits"]);
  return hex(await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: enc.encode(salt), iterations: 100000 }, k, 256));
}
async function hmac(secret, msg) {
  const k = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return hex(await crypto.subtle.sign("HMAC", k, enc.encode(msg)));
}
async function startSession(uid, env) {
  const exp = Math.floor(Date.now() / 1000) + 2592000;
  const sig = await hmac(env.SECRET, uid + "." + exp);
  return new Response(null, { status: 302, headers: { Location: "/", "Set-Cookie": `s=${uid}.${exp}.${sig}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=2592000` } });
}
async function getUid(req, env) {
  const c = (req.headers.get("Cookie") || "").match(/(?:^|;\s*)s=([^;]+)/);
  if (!c) return null;
  const [uid, exp, sig] = c[1].split(".");
  if (!sig || +exp < Date.now() / 1000) return null;
  return eq(sig, await hmac(env.SECRET, uid + "." + exp)) ? +uid : null;
}
async function limited(env, k, n, sec) {
  const now = Math.floor(Date.now() / 1000);
  await env.DB.batch([env.DB.prepare("delete from hits where ts<?").bind(now - 3600), env.DB.prepare("insert into hits(k,ts) values(?,?)").bind(k, now)]);
  const c = await env.DB.prepare("select count(*) c from hits where k=? and ts>?").bind(k, now - sec).first();
  return c.c > n;
}
function authPage(mode, err, allowReg) {
  const reg = mode === "register";
  const sw = reg ? '<p class="sw">قبلا ثبت‌نام کرده‌اید؟ <a href="/login">ورود</a></p>' : allowReg ? '<p class="sw">حساب ندارید؟ <a href="/register">ثبت‌نام</a></p>' : "";
  const map = { "{{TITLE}}": reg ? "ساخت حساب جدید" : "ورود به پنل", "{{SUB}}": reg ? "در چند ثانیه حساب بسازید و دستگاه‌هایتان را اضافه کنید" : "برای کنترل دستگاه‌هایتان وارد شوید",
    "{{BTN}}": reg ? "ثبت‌نام" : "ورود", "{{AUTOC}}": reg ? "new-password" : "current-password", "{{ERR}}": err ? '<div class="err">' + err + "</div>" : "", "{{SWITCH}}": sw };
  let h = LOGIN;
  for (const k in map) h = h.split(k).join(map[k]);
  return h;
}
async function auth(req, env, mode) {
  let err = "";
  const allow = env.ALLOW_REGISTER !== "0";
  if (req.method === "POST") {
    const f = await req.formData();
    const u = (f.get("u") || "").trim().toLowerCase(), p = f.get("p") || "";
    if (await limited(env, "a" + (req.headers.get("CF-Connecting-IP") || "x"), 10, 300)) err = "تلاش زیاد؛ چند دقیقه بعد دوباره امتحان کنید";
    else if (mode === "register") {
      if (!allow) return E("ثبت‌نام بسته است", 403);
      if (!/^[a-z0-9_.@-]{3,40}$/.test(u) || p.length < 6) err = "نام کاربری انگلیسی (حداقل ۳ حرف) و رمز حداقل ۶ کاراکتر لازم است";
      else {
        const salt = hex(crypto.getRandomValues(new Uint8Array(16)));
        try {
          const r = await env.DB.prepare("insert into users(username,pw) values(?,?)").bind(u, salt + ":" + (await pbk(p, salt))).run();
          return startSession(r.meta.last_row_id, env);
        } catch (e) { err = "این نام کاربری قبلا ثبت شده"; }
      }
    } else {
      const r = await env.DB.prepare("select * from users where username=?").bind(u).first();
      if (r) { const [salt, h] = r.pw.split(":"); if (eq(h, await pbk(p, salt))) return startSession(r.id, env); }
      err = "نام کاربری یا رمز اشتباه است";
    }
  }
  return html(authPage(mode, err, allow));
}

// ---------------- ESP32 ----------------
async function device(req, env) {
  const f = await req.formData().catch(() => null);
  if (!f) return txt("bad", 400);
  const id = f.get("id") || "", sec = f.get("secret") || "", cl = f.get("claim") || "";
  if (!/^[0-9A-F]{12}$/.test(id) || !/^[0-9A-F]{32}$/.test(sec) || !/^[0-9A-F]{8}$/.test(cl)) return txt("bad", 400);
  const sh = await sha(sec), now = Math.floor(Date.now() / 1000);
  let t = parseFloat(f.get("t")), h = parseFloat(f.get("h"));
  if (isNaN(t) || isNaN(h)) t = h = null;
  const row = await env.DB.prepare("select * from devices where dev_id=?").bind(id).first();
  if (!row) {
    await env.DB.prepare("insert or ignore into devices(dev_id,secret_hash,claim,tz,seen,t,h) values(?,?,?,?,?,?,?)").bind(id, sh, cl, DEF_TZ, now, t, h).run();
    return txt("00000");
  }
  if (!eq(row.secret_hash, sh)) return txt("forbidden", 403);
  // برای کم کردن نوشتن در دیتابیس: فقط وقتی مقدار عوض شده یا ۲۰ ثانیه از آخرین ثبت گذشته
  if ((t !== null && (t !== row.t || h !== row.h)) || now - row.seen >= 20)
    await env.DB.prepare("update devices set seen=?1,t=coalesce(?2,t),h=coalesce(?3,h) where id=?4").bind(now, t, h, row.id).run();
  return txt(row.relays);
}

// ---------------- پنل ----------------
const dj = (r) => {
  let rn = [];
  try { rn = JSON.parse(r.rnames || "[]"); } catch (e) {}
  return { id: r.dev_id, name: r.name, tz: r.tz, t: r.t, h: r.h, online: Date.now() / 1000 - r.seen < ONLINE, seen: r.seen, relays: r.relays, rn };
};
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const tzOk = (tz) => { try { new Intl.DateTimeFormat("en", { timeZone: tz }); return true; } catch (e) { return false; } };

async function api(req, env, p, m, uid) {
  let body = {};
  if (m === "POST") {
    if (!(req.headers.get("content-type") || "").includes("application/json")) return E("bad");
    body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") return E("bad json");
  }
  if (p === "/api/devices" && m === "GET") {
    const { results } = await env.DB.prepare("select * from devices where owner=? order by id").bind(uid).all();
    return J(results.map(dj));
  }
  if (p === "/api/claim" && m === "POST") {
    if (await limited(env, "c" + uid, 8, 600)) return E("تلاش زیاد؛ بعدا امتحان کنید", 429);
    const id = String(body.id || "").trim().toUpperCase(), cl = String(body.claim || "").trim().toUpperCase();
    const r = await env.DB.prepare("select * from devices where dev_id=?").bind(id).first();
    if (!r) return E("این شناسه هنوز به سرور وصل نشده؛ دستگاه را روشن و به اینترنت وصل کنید", 404);
    if (r.owner) return E("این دستگاه قبلا به یک حساب متصل شده", 409);
    if (!eq(r.claim, cl)) return E("کد اتصال اشتباه است", 403);
    await env.DB.prepare("update devices set owner=? where id=? and owner is null").bind(uid, r.id).run();
    return J({ ok: 1 });
  }
  let x = p.match(/^\/api\/schedules\/(\d+)$/);
  if (x && m === "DELETE") {
    await env.DB.prepare("delete from schedules where id=? and device in (select id from devices where owner=?)").bind(+x[1], uid).run();
    return J({ ok: 1 });
  }
  x = p.match(/^\/api\/devices\/([0-9A-Fa-f]{12})(?:\/(relay|settings|schedules))?$/);
  if (!x) return E("not found", 404);
  const d = await env.DB.prepare("select * from devices where dev_id=? and owner=?").bind(x[1].toUpperCase(), uid).first();
  if (!d) return E("دستگاه پیدا نشد", 404);
  const sub = x[2];
  if (!sub && m === "DELETE") {
    await env.DB.batch([env.DB.prepare("delete from schedules where device=?").bind(d.id),
      env.DB.prepare("update devices set owner=null, name='دستگاه من' where id=?").bind(d.id)]);
    return J({ ok: 1 });
  }
  if (sub === "relay" && m === "POST") {
    const i = parseInt(body.i), s = body.s ? 1 : 0;
    if (!(i >= 0 && i <= 4)) return E("bad");
    await env.DB.prepare("update devices set relays=substr(relays,1,?1)||?2||substr(relays,?3) where id=?4").bind(i, String(s), i + 2, d.id).run();
    const r = await env.DB.prepare("select relays from devices where id=?").bind(d.id).first();
    return J({ relays: r.relays });
  }
  if (sub === "settings" && m === "POST") {
    const name = String(body.name || "").trim().slice(0, 40) || "دستگاه من", tz = String(body.tz || DEF_TZ);
    if (!tzOk(tz)) return E("منطقه زمانی نامعتبر");
    const rn = (Array.isArray(body.rn) ? body.rn : []).slice(0, 5).map((s) => String(s || "").trim().slice(0, 20));
    while (rn.length < 5) rn.push("");
    await env.DB.prepare("update devices set name=?, tz=?, rnames=? where id=?").bind(name, tz, JSON.stringify(rn), d.id).run();
    return J({ ok: 1 });
  }
  if (sub === "schedules" && m === "GET") {
    const { results } = await env.DB.prepare("select id,relay,days,t_on,t_off from schedules where device=? order by relay,t_on").bind(d.id).all();
    return J(results);
  }
  if (sub === "schedules" && m === "POST") {
    const rl = parseInt(body.relay), days = String(body.days || ""), a = String(body.t_on || ""), b = String(body.t_off || "");
    if (!(rl >= 0 && rl <= 4) || !/^[01]{7}$/.test(days) || !days.includes("1")) return E("حداقل یک روز را انتخاب کنید");
    if (!TIME.test(a) || !TIME.test(b) || a === b) return E("ساعت شروع و پایان معتبر و متفاوت وارد کنید");
    const c = await env.DB.prepare("select count(*) c from schedules where device=?").bind(d.id).first();
    if (c.c >= 30) return E("حداکثر ۳۰ زمان‌بندی");
    await env.DB.prepare("insert into schedules(device,relay,days,t_on,t_off) values(?,?,?,?,?)").bind(d.id, rl, days, a, b).run();
    return J({ ok: 1 });
  }
  return E("not found", 404);
}

// ---------------- زمان‌بندی (Cron هر دقیقه) ----------------
function localTime(tz) {
  const p = new Intl.DateTimeFormat("en-US", { timeZone: tz, weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date());
  const g = (t) => p.find((x) => x.type === t).value;
  return { wd: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(g("weekday")), m: +g("hour") * 60 + +g("minute") };
}
const hm = (t) => +t.slice(0, 2) * 60 + +t.slice(3);
function isActive(s, L) {
  const a = hm(s.t_on), b = hm(s.t_off), ok = (d) => s.days[d] === "1", y = (L.wd + 6) % 7;
  return a < b ? ok(L.wd) && a <= L.m && L.m < b : (ok(L.wd) && L.m >= a) || (ok(y) && L.m < b);
}
async function tick(env) {
  const { results } = await env.DB.prepare("select s.*, d.tz from schedules s join devices d on d.id=s.device").all();
  const cache = {}, st = [];
  for (const s of results) {
    if (!cache[s.tz]) { try { cache[s.tz] = localTime(s.tz); } catch (e) { cache[s.tz] = localTime(DEF_TZ); } }
    const act = isActive(s, cache[s.tz]) ? 1 : 0;
    if (act !== s.last_active) {   // فقط لحظه تغییر وضعیت، پس تغییر دستی وسط بازه هم ممکن است
      st.push(env.DB.prepare("update devices set relays=substr(relays,1,?1)||?2||substr(relays,?3) where id=?4").bind(s.relay, String(act), s.relay + 2, s.device));
      st.push(env.DB.prepare("update schedules set last_active=? where id=?").bind(act, s.id));
    }
  }
  if (st.length) await env.DB.batch(st);
}

export default {
  async fetch(req, env) {
    try {
      const u = new URL(req.url), p = u.pathname, m = req.method;
      if (p === "/api/device" && m === "POST") return await device(req, env);
      if (p === "/login" || p === "/register") return await auth(req, env, p.slice(1));
      if (p === "/logout") return new Response(null, { status: 302, headers: { Location: "/login", "Set-Cookie": "s=; Max-Age=0; Path=/" } });
      const uid = await getUid(req, env);
      if (p === "/") return uid ? html(DASH) : Response.redirect(u.origin + "/login", 302);
      if (!p.startsWith("/api/")) return txt("Not found", 404);
      if (!uid) return E("login", 401);
      return await api(req, env, p, m, uid);
    } catch (e) {
      console.log("error", e && e.stack || e);
      return E("خطای سرور", 500);
    }
  },
  async scheduled(ev, env, ctx) { ctx.waitUntil(tick(env)); },
};
