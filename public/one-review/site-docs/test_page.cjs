const {chromium}=require('playwright');
const SP='/tmp/claude-0/-home-user/e6a5f9db-9e0a-5989-ab70-045ce1a70716/scratchpad/';
(async()=>{const b=await chromium.launch();let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++;};
const ctx=await b.newContext({viewport:{width:390,height:844}});
const p=await ctx.newPage();const errs=[];const net=[];
p.on('pageerror',e=>errs.push(e.message));
p.on('request',r=>{const u=r.url();if(!u.startsWith('file:')&&!u.includes('fonts.g')&&!u.startsWith('data:'))net.push(u)});
await p.goto('file://'+process.argv[2]);await p.waitForTimeout(1200);
ok(errs.length===0,'no JS errors '+errs.join(';'));
ok(await p.evaluate(()=>document.documentElement.scrollWidth)<=390,'no sideways scroll at 390');
ok(await p.locator('#capmap .cap').count()===55,'55 capability cards');
ok(await p.locator('.claim').count()===14,'14 claims');
ok((await p.textContent('#heroCount')).includes('0</b>')||(await p.textContent('#heroCount')).includes('0 independently'),'hero count shows 0 independently verified');
// filter
await p.click('.chip[data-f="sim"]');const vis=await p.locator('#capmap .cap:not([hidden])').count();ok(vis>0&&vis<55,'filter sim shows '+vis);await p.click('.chip[data-f="all"]');
// lab spoof
await p.waitForFunction(()=>document.getElementById('labOut').textContent.includes('Ready'));
const btns=p.locator('#labBody button[data-i]');const n=await btns.count();
for(let i=0;i<n;i++){await btns.nth(i).click();await p.waitForTimeout(300);}
let t=await p.textContent('#labOut');
ok((t.match(/✗ Refused/g)||[]).length===4&&(t.match(/✓ Accepted/g)||[]).length===1,'spoof: 4 refused, 1 accepted');
for(const k of ['replay','race','inject','fail']){await p.click('#t-'+k);await p.click('#labReset');await p.waitForTimeout(400);const bb=p.locator('#labBody button[data-i]');const m=await bb.count();for(let i=0;i<m;i++){await bb.nth(i).click();await p.waitForTimeout(k==='race'?1900:400);}
 t=await p.textContent('#labOut');console.log('  '+k+': '+(t.match(/✓ Accepted/g)||[]).length+' accepted, '+(t.match(/✗ Refused/g)||[]).length+' refused');}
await p.click('#t-replay');await p.click('#labReset');await p.waitForTimeout(400);await p.locator('#labBody button[data-i]').nth(0).click();await p.waitForTimeout(400);t=await p.textContent('#labOut');ok(/Accepted[\s\S]*already used once/.test(t),'replay: second use refused');
await p.click('#t-race');await p.click('#labReset');await p.waitForTimeout(400);await p.locator('#labBody button[data-i]').nth(0).click();await p.waitForTimeout(2200);t=await p.textContent('#labOut');ok(!t.includes('Accepted')&&t.includes('STOP is on')&&t.includes('voided by stop'),'race: STOP wins, old approval stays dead');
await p.click('#t-fail');await p.click('#labReset');await p.waitForTimeout(400);await p.locator('#labBody button[data-i]').nth(0).click();await p.waitForTimeout(600);t=await p.textContent('#labOut');ok(!t.includes('Accepted')&&t.includes('fails closed'),'fail: closed');
// dev
for(let i=0;i<4;i++)await p.click('[data-dev="send_request"]');ok((await p.textContent('#devOut')).includes('429'),'dev: 4th request limited');
await p.click('[data-dev="approve"]');ok((await p.textContent('#devOut')).includes('403'),'dev: approve forbidden');
await p.click('#devStop');await p.click('[data-dev="send_request"]');ok((await p.textContent('#devOut')).includes('423'),'dev: STOP 423');
// original sim still works
await p.click('#aAsk');await p.waitForTimeout(500);ok(await p.locator('#queue .req').count()>=1,'original simulator: request appears');
await p.click('#stop');await p.waitForTimeout(300);ok((await p.textContent('#stopState')).length>0,'original STOP works');
// keyboard
await p.goto('file://'+process.argv[2]);await p.waitForTimeout(800);await p.keyboard.press('Tab');ok(await p.evaluate(()=>document.activeElement.className)==='skip','first Tab = skip link');
const tabs=[];for(let i=0;i<40;i++){await p.keyboard.press('Tab');tabs.push(await p.evaluate(()=>{const a=document.activeElement;return a.tagName+(a.id?'#'+a.id:'')}))}
ok(!tabs.includes('BODY'),'keyboard focus moves through controls');
ok(net.length===0,'no network calls except fonts: '+net.join(','));
// links
const links=await p.$$eval('a[href^="https://github.com/garthyoung45"]',a=>a.map(x=>x.href));console.log('  github links',links.length);
await p.screenshot({path:SP+'p_top.png'});
for (const id of ['lab','evidence','dev','gov','map']){await p.locator('#'+id).scrollIntoViewIfNeeded();await p.evaluate(()=>document.querySelectorAll('.reveal,#boChart').forEach(e=>e.classList.add('in')));await p.waitForTimeout(700);await p.screenshot({path:SP+'p_'+id+'.png'});}
const d=await b.newPage({viewport:{width:1280,height:900}});await d.goto('file://'+process.argv[2]);await d.waitForTimeout(800);await d.evaluate(()=>document.querySelectorAll('.reveal,#boChart').forEach(e=>e.classList.add('in')));
for (const id of ['lab','map']){await d.locator('#'+id).scrollIntoViewIfNeeded();await d.waitForTimeout(700);await d.screenshot({path:SP+'d_'+id+'.png'});}
const s320=await b.newPage({viewport:{width:320,height:700}});await s320.goto('file://'+process.argv[2]);await s320.waitForTimeout(800);ok(await s320.evaluate(()=>document.documentElement.scrollWidth)<=320,'no sideways scroll at 320');
console.log('FAILS',fails);await b.close();})();
