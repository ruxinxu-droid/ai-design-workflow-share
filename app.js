const $=(s,c=document)=>c.querySelector(s);const $$=(s,c=document)=>[...c.querySelectorAll(s)];
const bar=$('#bar');addEventListener('scroll',()=>{const m=document.documentElement.scrollHeight-innerHeight;bar.style.width=`${m?scrollY/m*100:0}%`},{passive:true});

const previewImages=['original-kv.jpeg','heart-box.png','render-pair.png','final-kv.png'];
$$('[data-preview]').forEach((b,i)=>{b.onmouseenter=()=>{const p=$('#stepPreview');p.innerHTML=`<img src="./assets/${previewImages[i]}" alt="${b.dataset.preview}"><b>${b.dataset.preview}</b><small>PPT 现有素材·最终可按 4:3 替换</small>`;p.classList.add('show')};b.onmouseleave=()=>{$('#stepPreview').classList.remove('show')}});
const playDemo=$('#playDemo');
if(playDemo instanceof HTMLVideoElement){playDemo.addEventListener('play',()=>playDemo.classList.add('playing'));playDemo.addEventListener('pause',()=>playDemo.classList.remove('playing'));playDemo.addEventListener('ended',()=>playDemo.classList.remove('playing'))}
const renderSequence=$('.render-sequence');let renderStep=0;
const setRenderStep=next=>{renderStep=Math.max(0,Math.min(3,next));if(!renderSequence)return;renderSequence.dataset.renderStep=String(renderStep);$('[data-render-current]',renderSequence).textContent=String(renderStep).padStart(2,'0');$('[data-render-progress]',renderSequence).style.width=`${renderStep/3*100}%`;const active=$(`[data-render-card="${renderStep}"]`,renderSequence);const visual=active?.querySelector('.render-sequence__visual');if(active&&visual){active.style.setProperty('--scan-distance',`${visual.clientHeight}px`);active.classList.remove('is-scanning');void active.offsetWidth;active.classList.add('is-scanning')}};
$$('[data-render-card]',renderSequence).forEach(card=>{card.onclick=()=>setRenderStep(+card.dataset.renderCard);card.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setRenderStep(+card.dataset.renderCard)}}});
document.addEventListener('keydown',e=>{if(!renderSequence||document.documentElement.classList.contains('copy-editing'))return;const r=$('#p7').getBoundingClientRect();const active=r.top<innerHeight*.55&&r.bottom>innerHeight*.45;if(!active)return;if(e.key==='ArrowRight'){e.preventDefault();setRenderStep(renderStep+1)}if(e.key==='ArrowLeft'){e.preventDefault();setRenderStep(renderStep-1)}});
new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting&&entry.boundingClientRect.top>0)setRenderStep(0)}),{threshold:.08}).observe($('#p7'));

const rounds={
1:{average:'2.4%',peak:'2.7%',items:[['r1-01.jpeg',5463,144],['r1-02.jpeg',63102,1658],['r1-03.jpeg',5982,127],['r1-04.jpeg',7024,190],['r1-05.jpeg',18667,401]]},
2:{average:'2.3%',peak:'2.8%',items:[['r3-02.jpeg',58961,1202],['r3-04.jpeg',13020,365],['r3-05.jpeg',25216,654],['r3-06.jpeg',14903,331]]},
3:{average:'2.8%',peak:'4.5%',items:[['r2-01.jpeg',51499,1659],['r2-03.jpeg',224371,4672],['r2-04.jpeg',7914,360],['r2-05.jpeg',24289,803],['r2-06.jpeg',133560,2421]]},
4:{average:'2.9%',peak:'3.5%',items:[['r4-01.jpeg',58083,2053],['r4-02.jpeg',125956,3070],['r4-03.jpeg',21934,667],['r4-04.jpeg',735375,17442],['r4-05.jpeg',455528,15202]]}
};let currentRound=0;
$$('[data-round]').forEach(b=>b.onclick=()=>{currentRound=+b.dataset.round;const round=rounds[currentRound];$$('[data-round]').forEach(x=>x.classList.toggle('active',x===b));$('#roundImages').style.setProperty('--round-count',round.items.length);$('#roundImages').innerHTML=round.items.map(([image,views,clicks],i)=>{const ctr=clicks/views*100;return `<article class="round-image" data-ctr="${ctr}"><img src="./assets/rounds/${image}" alt="第 ${currentRound} 轮推广图 ${i+1}，CTR ${ctr.toFixed(2)}%"><div><b>CTR ${ctr.toFixed(2)}%</b></div></article>`}).join('')});

const legacyLoopDetail=$('#loopDetail'),legacyLightLoop=$('#lightLoop');
if(legacyLoopDetail&&legacyLightLoop){const loopData={production:'白模构图 → AI 建模 → AI 精准渲染 → PS 收口',launch:'多套推广图进入真实电商点位',data:'回收展现量、点击率，分析高点击画面共性',iteration:'保留有效变量，测试新视角与背景，输出新提示词'};$$('[data-loop]').forEach(b=>b.onclick=()=>{$$('[data-loop]').forEach(x=>x.classList.toggle('active',x===b));legacyLoopDetail.innerHTML=`<div><b>${b.textContent}</b><p>${loopData[b.dataset.loop]}</p></div>`});legacyLightLoop.onclick=()=>$('#p13').classList.toggle('lit')}
