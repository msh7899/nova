// Cloudflare Worker + D1 — سرور ESP32 (چند دستگاه، چند کاربر، زمان‌بندی)
const DASH = "<!doctype html><html lang=\"fa\" dir=\"rtl\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1,viewport-fit=cover\"><meta name=\"theme-color\" content=\"#0d9488\">\n<title>پنل · نووا</title><style>:root{--bg:#f6f7f9;--sf:#fff;--sf2:#f1f3f6;--tx:#0f172a;--mut:#64748b;--bd:#e4e7ec;--ac:#0d9488;--ac2:#14b8a6;--dn:#dc2626;--ok:#16a34a;--sh:0 1px 2px #0f172a0d,0 10px 30px #0f172a0b;--r:18px}\n@media(prefers-color-scheme:dark){:root:not([data-theme=light]){--bg:#0a0e13;--sf:#121820;--sf2:#1a222c;--tx:#e8edf3;--mut:#8995a6;--bd:#222c37;--sh:0 1px 2px #0008}}\n:root[data-theme=dark]{--bg:#0a0e13;--sf:#121820;--sf2:#1a222c;--tx:#e8edf3;--mut:#8995a6;--bd:#222c37;--sh:0 1px 2px #0008}\n*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}[hidden]{display:none!important}\nhtml{font-size:15px;color-scheme:light dark}:root[data-theme=dark]{color-scheme:dark}:root[data-theme=light]{color-scheme:light}\nbody{margin:0;background:var(--bg);color:var(--tx);font-family:Vazirmatn,\"Segoe UI\",Tahoma,system-ui,sans-serif;line-height:1.65}\n.ic{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;flex:none}\n.logo{width:36px;height:36px;border-radius:12px;background:linear-gradient(135deg,var(--ac2),var(--ac));display:grid;place-items:center;color:#fff;flex:none}\n.mut{color:var(--mut)}\n.card{background:var(--sf);border:1px solid var(--bd);border-radius:var(--r);box-shadow:var(--sh)}\n.btn{border:0;border-radius:12px;padding:10px 16px;font:inherit;font-weight:600;cursor:pointer;background:var(--ac);color:#fff;display:inline-flex;align-items:center;justify-content:center;gap:6px;transition:.15s;text-decoration:none}\n.btn:active{transform:scale(.97)}.btn.g{background:var(--sf2);color:var(--tx)}.btn.d{background:#dc262617;color:var(--dn)}.btn.sm{padding:7px 12px;font-size:.85rem}.btn.ic{padding:9px}.btn.full{width:100%;padding:13px}\ninput,select{width:100%;padding:12px 14px;border-radius:12px;border:1px solid var(--bd);background:var(--sf);color:var(--tx);font:inherit;outline:none;transition:.15s}\ninput:focus,select:focus{border-color:var(--ac);box-shadow:0 0 0 3px color-mix(in srgb,var(--ac) 20%,transparent)}\nlabel.f{display:block;font-size:.82rem;color:var(--mut);margin:14px 0 6px}\n.pill{display:inline-flex;align-items:center;gap:6px;font-size:.78rem;padding:3px 10px;border-radius:99px;background:var(--sf2);color:var(--mut)}\n.pill i{width:7px;height:7px;border-radius:50%;background:#94a3b8}.pill.on{color:var(--ok);background:#16a34a15}.pill.on i{background:var(--ok);box-shadow:0 0 0 3px #16a34a30}\n.spin{width:34px;height:34px;border-radius:50%;border:3px solid var(--bd);border-top-color:var(--ac);animation:sp 1s linear infinite;margin:0 auto 14px}@keyframes sp{to{transform:rotate(360deg)}}\n\n.bar{position:sticky;top:0;z-index:5;background:color-mix(in srgb,var(--bg) 82%,transparent);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-bottom:1px solid var(--bd)}\n.bar>div{max-width:1040px;margin:auto;padding:11px 16px;display:flex;align-items:center;gap:10px}.brand{font-weight:800;font-size:1.05rem;flex:1}\n.wrap{max-width:1040px;margin:auto;padding:18px 16px 70px}\n.grid{display:grid;gap:16px;grid-template-columns:repeat(auto-fill,minmax(min(100%,430px),1fr))}\n.dv{padding:18px;display:flex;flex-direction:column;gap:14px}.ch{display:flex;justify-content:space-between;align-items:flex-start;gap:10px}.ch h3{margin:0 0 6px;font-size:1.1rem}.acts{display:flex;gap:6px}\n.sn{display:grid;grid-template-columns:1fr 1fr;gap:10px}.tl{background:var(--sf2);border-radius:14px;padding:14px}\n.lb{display:flex;align-items:center;gap:6px;color:var(--mut);font-size:.82rem}.lb .ic{width:16px;height:16px}\n.tl b{display:block;font-size:2rem;font-weight:300;letter-spacing:-.02em;margin-top:2px;line-height:1.4}.tl sup{font-size:.85rem;color:var(--mut);margin-right:3px}\n.bar2{height:5px;border-radius:9px;background:var(--bd);overflow:hidden;margin-top:6px}.bar2 i{display:block;height:100%;background:var(--ac);width:0;transition:width .5s}\n.rs{display:grid;grid-template-columns:repeat(auto-fill,minmax(112px,1fr));gap:10px}\n.rt{border:1px solid var(--bd);background:var(--sf2);border-radius:14px;padding:12px;text-align:right;cursor:pointer;font:inherit;color:var(--tx);display:flex;flex-direction:column;gap:10px;transition:.18s}\n.rt .pw{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:var(--sf);color:var(--mut);transition:.18s}\n.rt .rn{display:block;font-weight:600;font-size:.92rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.rt .st{font-size:.76rem;opacity:.7}\n.rt.on{background:var(--ac);border-color:var(--ac);color:#fff;box-shadow:0 6px 18px color-mix(in srgb,var(--ac) 35%,transparent)}.rt.on .pw{background:#ffffff33;color:#fff}\n.dv.off .sn,.dv.off .rs{opacity:.55}.note{display:none;font-size:.82rem;color:var(--mut);margin:0}.dv.off .note{display:block}\n.empty{text-align:center;padding:42px 22px}.empty h3{margin:12px 0 4px}.empty ol{text-align:right;max-width:340px;margin:14px auto 22px;color:var(--mut);padding-right:20px}\n.sk{height:300px;animation:pl 1.2s infinite}@keyframes pl{50%{opacity:.5}}\ndialog{border:0;padding:0;border-radius:22px;width:min(520px,calc(100% - 24px));background:var(--sf);color:var(--tx);box-shadow:0 24px 70px #0007;max-height:88vh;overflow:auto}\ndialog::backdrop{background:#0b1220a0;backdrop-filter:blur(3px)}\n@media(max-width:600px){dialog{margin:auto auto 0;width:100%;border-radius:22px 22px 0 0}.hm{display:none}}\n.dh{display:flex;justify-content:space-between;align-items:center;padding:14px 18px;border-bottom:1px solid var(--bd);font-weight:700;position:sticky;top:0;background:var(--sf);z-index:1}.db{padding:4px 18px 20px}\n.row2{display:grid;grid-template-columns:1fr 1fr;gap:10px}.g5{display:grid;gap:8px}\n.si{display:flex;align-items:center;gap:10px;padding:12px;background:var(--sf2);border-radius:14px;margin:8px 0}.si>div:first-child{flex:1;min-width:0}.tm{font-size:.82rem;color:var(--mut);text-align:left}\n.addbox{margin-top:18px;padding-top:4px;border-top:1px solid var(--bd)}.addbox>b{display:block;margin:12px 0 8px}\n.chips{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0}.chips label{cursor:pointer}.chips input{display:none}\n.chips span{display:block;padding:6px 11px;border-radius:99px;background:var(--sf2);color:var(--mut);font-size:.82rem;border:1px solid var(--bd)}.chips input:checked+span{background:var(--ac);border-color:var(--ac);color:#fff}\n#toast{inset:auto;bottom:22px;left:50%;margin:0;transform:translateX(-50%);border:0;background:var(--tx);color:var(--bg);padding:11px 18px;border-radius:12px;font:inherit;font-size:.9rem;max-width:90vw;display:none}#toast.show{display:block}\n</style></head><body>\n<svg width=\"0\" height=\"0\" style=\"position:absolute\"><defs>\n<symbol id=\"i-bolt\" viewBox=\"0 0 24 24\"><path d=\"M13 2 4 14h7l-1 8 9-12h-7z\"/></symbol>\n<symbol id=\"i-power\" viewBox=\"0 0 24 24\"><path d=\"M12 2v10\"/><path d=\"M18.4 6.6a9 9 0 1 1-12.8 0\"/></symbol>\n<symbol id=\"i-therm\" viewBox=\"0 0 24 24\"><path d=\"M14 14.8V4a2 2 0 1 0-4 0v10.8a4 4 0 1 0 4 0z\"/></symbol>\n<symbol id=\"i-drop\" viewBox=\"0 0 24 24\"><path d=\"M12 2.7s6 6.2 6 10.8a6 6 0 0 1-12 0C6 8.9 12 2.7 12 2.7z\"/></symbol>\n<symbol id=\"i-clock\" viewBox=\"0 0 24 24\"><circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 7v5l3 2\"/></symbol>\n<symbol id=\"i-sliders\" viewBox=\"0 0 24 24\"><path d=\"M4 6h8M18 6h2M4 12h2M12 12h8M4 18h10M20 18h0\"/><circle cx=\"15\" cy=\"6\" r=\"2\"/><circle cx=\"9\" cy=\"12\" r=\"2\"/><circle cx=\"17\" cy=\"18\" r=\"2\"/></symbol>\n<symbol id=\"i-plus\" viewBox=\"0 0 24 24\"><path d=\"M12 5v14M5 12h14\"/></symbol>\n<symbol id=\"i-x\" viewBox=\"0 0 24 24\"><path d=\"M18 6 6 18M6 6l12 12\"/></symbol>\n<symbol id=\"i-trash\" viewBox=\"0 0 24 24\"><path d=\"M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14\"/></symbol>\n<symbol id=\"i-out\" viewBox=\"0 0 24 24\"><path d=\"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9\"/></symbol>\n</defs></svg>\n<header class=\"bar\"><div><div class=\"logo\"><svg class=\"ic\" style=\"fill:#fff3\"><use href=\"#i-bolt\"/></svg></div><span class=\"brand\">نووا</span>\n<button class=\"btn sm\" onclick=\"addSheet()\"><svg class=\"ic\" style=\"width:16px;height:16px\"><use href=\"#i-plus\"/></svg><span class=\"hm\">افزودن دستگاه</span></button>\n<a class=\"btn g ic sm\" href=\"/logout\" title=\"خروج\"><svg class=\"ic\" style=\"width:18px;height:18px\"><use href=\"#i-out\"/></svg></a></div></header>\n<main class=\"wrap\"><div class=\"grid\" id=\"list\"><div class=\"card sk\"></div></div></main>\n<dialog id=\"dlg\"></dialog><div id=\"toast\" popover=\"manual\"></div>\n<script>\nconst $=s=>document.querySelector(s),D=$('#dlg');\nconst esc=s=>String(s).replace(/[&<>\"']/g,c=>'&#'+c.charCodeAt(0)+';');\nconst fd=s=>String(s).replace(/\\d/g,x=>'۰۱۲۳۴۵۶۷۸۹'[x]);\nconst nf=n=>Number(n).toLocaleString('fa-IR',{maximumFractionDigits:1});\nconst ic=n=>`<svg class=\"ic\"><use href=\"#i-${n}\"/></svg>`;\nconst DN={5:'شنبه',6:'یکشنبه',0:'دوشنبه',1:'سه‌شنبه',2:'چهارشنبه',3:'پنجشنبه',4:'جمعه'},ORD=[5,6,0,1,2,3,4];\nconst TZ=[['Asia/Tehran','تهران'],['Asia/Dubai','دبی'],['Asia/Baghdad','بغداد'],['Europe/Istanbul','استانبول'],['Europe/London','لندن'],['UTC','UTC']];\nlet devs=[],key='',first=true;\nconst rname=(d,i)=>(d.rn&&d.rn[i])||'رله '+fd(i+1);\nfunction toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');try{t.hidePopover();t.showPopover()}catch(e){}clearTimeout(toast.k);toast.k=setTimeout(()=>{t.classList.remove('show');try{t.hidePopover()}catch(e){}},2800)}\nasync function api(u,m='GET',b){\n try{const r=await fetch(u,{method:m,headers:{'Content-Type':'application/json'},body:b?JSON.stringify(b):undefined});\n if(r.status==401){location='/login';return}\n const j=await r.json().catch(()=>({}));if(!r.ok){toast(j.error||'خطا در ارتباط');return}return j}catch(e){toast('ارتباط با سرور برقرار نشد')}}\nfunction sheet(t,h){D.innerHTML=`<div class=\"dh\"><span>${t}</span><button class=\"btn g ic sm\" onclick=\"D.close()\" aria-label=\"بستن\">${ic('x')}</button></div><div class=\"db\">${h}</div>`;if(!D.open)D.showModal()}\nfunction ask(msg,ok){return new Promise(res=>{sheet('تأیید',`<p>${msg}</p><div class=\"row2\"><button class=\"btn d\" id=\"yes\">${ok}</button><button class=\"btn g\" id=\"no\">انصراف</button></div>`);\n $('#yes').onclick=()=>{res(true);D.close()};$('#no').onclick=()=>D.close();D.addEventListener('close',()=>res(false),{once:true})})}\nfunction ago(s){if(!s)return 'هرگز';const d=Math.floor(Date.now()/1000)-s,f=(n,u)=>fd(n)+' '+u+' پیش';return d<60?'لحظاتی پیش':d<3600?f(Math.floor(d/60),'دقیقه'):d<86400?f(Math.floor(d/3600),'ساعت'):f(Math.floor(d/86400),'روز')}\nfunction card(d){return `<section class=\"card dv\" id=\"c-${d.id}\">\n<div class=\"ch\"><div><h3 class=\"nm\"></h3><span class=\"pill\"><i></i><span class=\"os\"></span></span></div>\n<div class=\"acts\"><button class=\"btn g ic sm\" title=\"زمان‌بندی\" onclick=\"schedSheet('${d.id}')\">${ic('clock')}</button><button class=\"btn g ic sm\" title=\"تنظیمات\" onclick=\"setSheet('${d.id}')\">${ic('sliders')}</button></div></div>\n<div class=\"sn\"><div class=\"tl\"><div class=\"lb\">${ic('therm')} دما</div><b class=\"t\"></b></div><div class=\"tl\"><div class=\"lb\">${ic('drop')} رطوبت</div><b class=\"h\"></b><div class=\"bar2\"><i></i></div></div></div>\n<div class=\"rs\">${[0,1,2,3,4].map(i=>`<button class=\"rt\" data-i=\"${i}\" onclick=\"tog('${d.id}',${i})\"><span class=\"pw\">${ic('power')}</span><span><span class=\"rn\"></span><span class=\"st\"></span></span></button>`).join('')}</div>\n<p class=\"note\">دستگاه آفلاین است؛ دستورها پس از اتصال مجدد اعمال می‌شوند.</p></section>`}\nconst empty=()=>`<div class=\"card empty\" style=\"grid-column:1/-1\"><div class=\"logo\" style=\"width:56px;height:56px;border-radius:18px;margin:auto\"><svg class=\"ic\" style=\"width:28px;height:28px;fill:#fff3\"><use href=\"#i-bolt\"/></svg></div>\n<h3>هنوز دستگاهی اضافه نکرده‌اید</h3><p class=\"mut\" style=\"margin:0\">با سه قدم ساده شروع کنید:</p>\n<ol><li>دستگاه را روشن کنید و به هات‌اسپات آن وصل شوید.</li><li>وای‌فای خانه را در صفحه‌ای که باز می‌شود وارد کنید.</li><li>شناسه و کد اتصال نمایش‌داده‌شده را اینجا وارد کنید.</li></ol>\n<button class=\"btn\" onclick=\"addSheet()\">${ic('plus')} افزودن دستگاه</button></div>`;\nfunction patch(){devs.forEach(d=>{const c=$('#c-'+d.id);if(!c)return;\n c.querySelector('.nm').textContent=d.name;c.querySelector('.pill').className='pill'+(d.online?' on':'');\n c.querySelector('.os').textContent=d.online?'آنلاین':'آفلاین · '+ago(d.seen);c.classList.toggle('off',!d.online);\n c.querySelector('.t').innerHTML=d.t==null?'--':nf(d.t)+'<sup>°C</sup>';c.querySelector('.h').innerHTML=d.h==null?'--':nf(d.h)+'<sup>٪</sup>';\n c.querySelector('.bar2 i').style.width=Math.max(0,Math.min(100,d.h||0))+'%';\n c.querySelectorAll('.rt').forEach(b=>{const i=+b.dataset.i,on=d.relays[i]=='1';b.classList.toggle('on',on);b.querySelector('.rn').textContent=rname(d,i);b.querySelector('.st').textContent=on?'روشن':'خاموش'})})}\nasync function refresh(){if(document.hidden&&!first)return;const l=await api('/api/devices');if(!l)return;devs=l;first=false;\n const k=l.map(d=>d.id).join();if(k!=key){key=k;$('#list').innerHTML=l.length?l.map(card).join(''):empty()}patch()}\nasync function tog(id,i){const d=devs.find(x=>x.id==id),s=d.relays[i]=='1'?0:1,old=d.relays;\n d.relays=old.slice(0,i)+s+old.slice(i+1);patch();\n const r=await api(`/api/devices/${id}/relay`,'POST',{i,s});d.relays=r?r.relays:old;patch();\n if(r&&!d.online)toast('دستگاه آفلاین است؛ پس از اتصال اعمال می‌شود')}\nfunction addSheet(){sheet('افزودن دستگاه',`<p class=\"mut\" style=\"margin:10px 0 0;font-size:.88rem\">شناسه و کد اتصال در صفحه راه‌اندازی دستگاه (هات‌اسپات) نمایش داده می‌شود.</p>\n<label class=\"f\">شناسه دستگاه</label><input id=\"cid\" dir=\"ltr\" placeholder=\"A1B2C3D4E5F6\" autocapitalize=\"characters\">\n<label class=\"f\">کد اتصال</label><input id=\"ccl\" dir=\"ltr\" placeholder=\"1A2B3C4D\" autocapitalize=\"characters\">\n<button class=\"btn full\" style=\"margin-top:20px\" onclick=\"addDev()\">افزودن</button>`)}\nasync function addDev(){const r=await api('/api/claim','POST',{id:$('#cid').value,claim:$('#ccl').value});if(r){D.close();toast('دستگاه اضافه شد');key='';refresh()}}\nfunction setSheet(id){const d=devs.find(x=>x.id==id),z=TZ.some(x=>x[0]==d.tz);\n sheet('تنظیمات دستگاه',`<label class=\"f\">نام دستگاه</label><input id=\"n\" maxlength=\"40\" value=\"${esc(d.name)}\">\n<label class=\"f\">نام رله‌ها</label><div class=\"g5\">${[0,1,2,3,4].map(i=>`<input class=\"rnm\" maxlength=\"20\" placeholder=\"رله ${fd(i+1)}\" value=\"${esc((d.rn&&d.rn[i])||'')}\">`).join('')}</div>\n<label class=\"f\">منطقه زمانی (برای زمان‌بندی)</label><select id=\"z\">${TZ.map(([v,n])=>`<option value=\"${v}\" ${v==d.tz?'selected':''}>${n}</option>`).join('')}${z?'':`<option selected>${esc(d.tz)}</option>`}</select>\n<label class=\"f\">شناسه دستگاه</label><input readonly dir=\"ltr\" value=\"${d.id}\" onclick=\"this.select()\">\n<div class=\"row2\" style=\"margin-top:20px\"><button class=\"btn\" onclick=\"save('${id}')\">ذخیره</button><button class=\"btn d\" onclick=\"rel('${id}')\">${ic('trash')} حذف</button></div>`)}\nasync function save(id){const r=await api(`/api/devices/${id}/settings`,'POST',{name:$('#n').value,tz:$('#z').value,rn:[...document.querySelectorAll('.rnm')].map(x=>x.value)});if(r){D.close();toast('ذخیره شد');refresh()}}\nasync function rel(id){if(await ask('این دستگاه از حساب شما حذف شود؟ زمان‌بندی‌های آن هم پاک می‌شود.','حذف')){if(await api(`/api/devices/${id}`,'DELETE')){toast('دستگاه حذف شد');key='';refresh()}}}\nfunction schedSheet(id){const d=devs.find(x=>x.id==id);\n sheet('زمان‌بندی خودکار',`<div id=\"sl\"></div><div class=\"addbox\"><b>زمان‌بندی جدید</b>\n<select id=\"sr\">${[0,1,2,3,4].map(i=>`<option value=\"${i}\">${esc(rname(d,i))}</option>`).join('')}</select>\n<div class=\"chips\">${ORD.map(i=>`<label><input type=\"checkbox\" class=\"dy\" value=\"${i}\" checked><span>${DN[i]}</span></label>`).join('')}</div>\n<div class=\"row2\"><div><label class=\"f\" style=\"margin-top:0\">روشن شدن</label><input type=\"time\" id=\"a\" value=\"18:00\"></div><div><label class=\"f\" style=\"margin-top:0\">خاموش شدن</label><input type=\"time\" id=\"b\" value=\"22:00\"></div></div>\n<button class=\"btn full\" style=\"margin-top:16px\" onclick=\"addS('${id}')\">${ic('plus')} افزودن زمان‌بندی</button></div>`);loadS(id)}\nasync function loadS(id){const d=devs.find(x=>x.id==id),l=await api(`/api/devices/${id}/schedules`);if(!l)return;\n $('#sl').innerHTML=l.length?l.map(s=>`<div class=\"si\"><div><b>${esc(rname(d,s.relay))}</b><div class=\"mut\" style=\"font-size:.82rem\">${s.days=='1111111'?'هر روز':ORD.filter(i=>s.days[i]=='1').map(i=>DN[i]).join('، ')}</div></div><div class=\"tm\">${fd(s.t_on)}<br>تا ${fd(s.t_off)}</div><button class=\"btn d ic sm\" onclick=\"delS(${s.id},'${id}')\" aria-label=\"حذف\">${ic('trash')}</button></div>`).join(''):'<p class=\"mut\" style=\"text-align:center;margin:20px 0\">هنوز زمان‌بندی‌ای ندارید.</p>'}\nasync function addS(id){const days=Array(7).fill('0');document.querySelectorAll('.dy:checked').forEach(x=>days[x.value]='1');\n const r=await api(`/api/devices/${id}/schedules`,'POST',{relay:+$('#sr').value,days:days.join(''),t_on:$('#a').value,t_off:$('#b').value});if(r){toast('زمان‌بندی اضافه شد');loadS(id)}}\nasync function delS(sid,id){await api('/api/schedules/'+sid,'DELETE');loadS(id)}\nrefresh();setInterval(refresh,3000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});\n</script></body></html>\n";
const LOGIN = "<!doctype html><html lang=\"fa\" dir=\"rtl\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><meta name=\"theme-color\" content=\"#0d9488\">\n<title>{{TITLE}} · نووا</title><style>:root{--bg:#f6f7f9;--sf:#fff;--sf2:#f1f3f6;--tx:#0f172a;--mut:#64748b;--bd:#e4e7ec;--ac:#0d9488;--ac2:#14b8a6;--dn:#dc2626;--ok:#16a34a;--sh:0 1px 2px #0f172a0d,0 10px 30px #0f172a0b;--r:18px}\n@media(prefers-color-scheme:dark){:root:not([data-theme=light]){--bg:#0a0e13;--sf:#121820;--sf2:#1a222c;--tx:#e8edf3;--mut:#8995a6;--bd:#222c37;--sh:0 1px 2px #0008}}\n:root[data-theme=dark]{--bg:#0a0e13;--sf:#121820;--sf2:#1a222c;--tx:#e8edf3;--mut:#8995a6;--bd:#222c37;--sh:0 1px 2px #0008}\n*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}[hidden]{display:none!important}\nhtml{font-size:15px;color-scheme:light dark}:root[data-theme=dark]{color-scheme:dark}:root[data-theme=light]{color-scheme:light}\nbody{margin:0;background:var(--bg);color:var(--tx);font-family:Vazirmatn,\"Segoe UI\",Tahoma,system-ui,sans-serif;line-height:1.65}\n.ic{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;flex:none}\n.logo{width:36px;height:36px;border-radius:12px;background:linear-gradient(135deg,var(--ac2),var(--ac));display:grid;place-items:center;color:#fff;flex:none}\n.mut{color:var(--mut)}\n.card{background:var(--sf);border:1px solid var(--bd);border-radius:var(--r);box-shadow:var(--sh)}\n.btn{border:0;border-radius:12px;padding:10px 16px;font:inherit;font-weight:600;cursor:pointer;background:var(--ac);color:#fff;display:inline-flex;align-items:center;justify-content:center;gap:6px;transition:.15s;text-decoration:none}\n.btn:active{transform:scale(.97)}.btn.g{background:var(--sf2);color:var(--tx)}.btn.d{background:#dc262617;color:var(--dn)}.btn.sm{padding:7px 12px;font-size:.85rem}.btn.ic{padding:9px}.btn.full{width:100%;padding:13px}\ninput,select{width:100%;padding:12px 14px;border-radius:12px;border:1px solid var(--bd);background:var(--sf);color:var(--tx);font:inherit;outline:none;transition:.15s}\ninput:focus,select:focus{border-color:var(--ac);box-shadow:0 0 0 3px color-mix(in srgb,var(--ac) 20%,transparent)}\nlabel.f{display:block;font-size:.82rem;color:var(--mut);margin:14px 0 6px}\n.pill{display:inline-flex;align-items:center;gap:6px;font-size:.78rem;padding:3px 10px;border-radius:99px;background:var(--sf2);color:var(--mut)}\n.pill i{width:7px;height:7px;border-radius:50%;background:#94a3b8}.pill.on{color:var(--ok);background:#16a34a15}.pill.on i{background:var(--ok);box-shadow:0 0 0 3px #16a34a30}\n.spin{width:34px;height:34px;border-radius:50%;border:3px solid var(--bd);border-top-color:var(--ac);animation:sp 1s linear infinite;margin:0 auto 14px}@keyframes sp{to{transform:rotate(360deg)}}\n\nbody{min-height:100vh;display:grid;place-items:center;padding:20px;background:radial-gradient(800px 460px at 90% -10%,color-mix(in srgb,var(--ac) 20%,transparent),transparent),radial-gradient(640px 380px at -10% 110%,color-mix(in srgb,var(--ac2) 16%,transparent),transparent),var(--bg)}\n.box{width:100%;max-width:400px;padding:32px 26px}.logo.big{width:54px;height:54px;border-radius:17px;margin:0 auto 16px}.logo.big .ic{width:28px;height:28px}\nh1{font-size:1.4rem;margin:0;text-align:center}.sub{color:var(--mut);text-align:center;margin:6px 0 20px;font-size:.92rem}\n.pwd{position:relative}.pwd input{padding-left:74px}.pwd button{position:absolute;left:6px;top:50%;transform:translateY(-50%)}\n.err{background:#dc262615;color:var(--dn);padding:10px 12px;border-radius:12px;margin-top:14px;font-size:.88rem}\n.sw{text-align:center;color:var(--mut);margin:18px 0 0;font-size:.92rem}.sw a{color:var(--ac);font-weight:700;text-decoration:none}\n.ft{text-align:center;color:var(--mut);font-size:.78rem;margin-top:18px}\n</style></head><body><div style=\"width:100%;max-width:400px\">\n<form class=\"card box\" method=\"post\">\n<div class=\"logo big\"><svg class=\"ic\" viewBox=\"0 0 24 24\" style=\"fill:#fff3\"><path d=\"M13 2 4 14h7l-1 8 9-12h-7z\"/></svg></div>\n<h1>{{TITLE}}</h1><p class=\"sub\">{{SUB}}</p>\n<label class=\"f\" for=\"u\">نام کاربری</label><input id=\"u\" name=\"u\" dir=\"ltr\" autocapitalize=\"none\" autocomplete=\"username\" required>\n<label class=\"f\" for=\"p\">رمز عبور</label><div class=\"pwd\"><input id=\"p\" name=\"p\" type=\"password\" dir=\"ltr\" autocomplete=\"{{AUTOC}}\" required><button type=\"button\" class=\"btn g sm\" onclick=\"var p=document.getElementById('p'),s=p.type=='password';p.type=s?'text':'password';this.textContent=s?'پنهان':'نمایش'\">نمایش</button></div>\n{{ERR}}<button class=\"btn full\" style=\"margin-top:20px\">{{BTN}}</button>{{SWITCH}}</form>\n<div class=\"ft\">نووا · کنترل هوشمند دستگاه‌ها</div></div></body></html>\n";
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
