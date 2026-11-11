(()=>{const n=()=>Math.floor(Date.now()/1000);
let D=[{id:'A1B2C3D4E5F6',name:'گلخانه',tz:'Asia/Tehran',t:24.6,h:58,online:true,seen:n(),relays:'10100',rn:['پمپ آب','لامپ رشد','فن تهویه','','']},
{id:'0F1E2D3C4B5A',name:'انبار',tz:'Asia/Tehran',t:31.2,h:35,online:false,seen:n()-5400,relays:'00000',rn:['','','','','']}];
let S=[{id:1,relay:0,days:'1111111',t_on:'06:00',t_off:'08:00'},{id:2,relay:1,days:'1011101',t_on:'18:00',t_off:'23:30'}],sid=3,st=0;
const R=(o,c=200)=>new Response(typeof o=='string'?o:JSON.stringify(o),{status:c});
window.fetch=async(u,o={})=>{await new Promise(r=>setTimeout(r,120));const m=o.method||'GET',b=o.body&&typeof o.body=='string'&&o.body[0]=='{'?JSON.parse(o.body):{};let x;
 if(u=='/st')return R(++st>2?'ok':'wait');if(u=='/save'){st=0;return R('ok')}
 if(u=='/api/devices')return R(D);
 if(u=='/api/claim')return R({ok:1});
 if(x=u.match(/devices\/(\w+)\/relay/)){const d=D.find(d=>d.id==x[1]);d.relays=d.relays.slice(0,b.i)+(b.s?1:0)+d.relays.slice(+b.i+1);return R({relays:d.relays})}
 if(x=u.match(/devices\/(\w+)\/settings/)){Object.assign(D.find(d=>d.id==x[1]),{name:b.name,tz:b.tz,rn:b.rn});return R({ok:1})}
 if(x=u.match(/devices\/(\w+)\/schedules/)){if(m=='POST'){S.push({id:sid++,relay:b.relay,days:b.days,t_on:b.t_on,t_off:b.t_off});return R({ok:1})}return R(S)}
 if(x=u.match(/schedules\/(\d+)/)){S=S.filter(s=>s.id!=x[1]);return R({ok:1})}
 if(m=='DELETE'&&(x=u.match(/devices\/(\w+)$/))){D=D.filter(d=>d.id!=x[1]);return R({ok:1})}
 return R({},404)};
document.addEventListener('click',e=>{if(e.target.closest('a[href^="/"]'))e.preventDefault()});document.addEventListener('submit',e=>e.preventDefault());})();
