const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium,simulatedPage,project,workspace}=require('./ui-harness.cjs');
const checks=[];
const patch=(page,values)=>page.evaluate(values=>FP.invoke('patch',{patch:values}),values);
const seek=(page,y)=>page.evaluate(y=>FP.invoke('seek',{y}),y);
async function inspect(page,rootId,trackId,layerId){
 return page.evaluate(({rootId,trackId,layerId})=>{
  const root=document.getElementById(rootId),track=document.getElementById(trackId),layer=document.getElementById(layerId);
  const rr=root.getBoundingClientRect();
  const rects=[];const walker=document.createTreeWalker(track,NodeFilter.SHOW_TEXT);let node;
  while(node=walker.nextNode()){
   if(!node.textContent.trim())continue;
   const range=document.createRange();range.selectNodeContents(node);
   for(const r of range.getClientRects())if(r.width>.1&&r.height>.1&&r.bottom>rr.top&&r.top<rr.bottom)rects.push({top:r.top,bottom:r.bottom,center:(r.top+r.bottom)/2});
  }
  rects.sort((a,b)=>a.top-b.top);
  const rows=[];
  for(const r of rects){const last=rows.at(-1);if(last&&Math.abs(last.center-r.center)<Math.min(last.bottom-last.top,r.bottom-r.top)*.35){last.top=Math.min(last.top,r.top);last.bottom=Math.max(last.bottom,r.bottom);last.center=(last.top+last.bottom)/2;}else rows.push({...r});}
  const matrix=new DOMMatrix(getComputedStyle(layer.parentElement).transform);
  const anchor=Number(layer.dataset.anchorY)/100;
  const target=rr.top+rr.height*(matrix.d<0?1-anchor:anchor);
  rows.sort((a,b)=>Math.abs(a.center-target)-Math.abs(b.center-target));
  const band=layer.querySelector('.rg-band');
  const arrows=[...layer.querySelectorAll('.rg-arrow')].filter(a=>getComputedStyle(a).display!=='none');
  return {active:getComputedStyle(layer).display!=='none',index:Number(layer.dataset.line),expected:rows[0]||null,band:band&&getComputedStyle(band).display!=='none'?band.getBoundingClientRect().toJSON():null,arrows:arrows.map(a=>({rect:a.getBoundingClientRect().toJSON(),opacity:getComputedStyle(a).opacity})),root:rr.toJSON(),mode:layer.dataset.mode};
 },{rootId,trackId,layerId});
}
function aligned(value){
 assert(value.active&&value.expected,'visible text and guide');
 if(value.band){assert(Math.abs(value.band.top-value.expected.top)<1,'band top follows actual glyph row');assert(Math.abs(value.band.bottom-value.expected.bottom)<1,'band bottom follows actual glyph row');assert(Math.abs(value.band.width-value.root.width)<1,'band spans reading area');}
 else {assert.equal(value.arrows.length,2);for(const arrow of value.arrows)assert(Math.abs((arrow.rect.top+arrow.rect.bottom)/2-value.expected.center)<1,'triangles point at current line');}
}
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.FP_CHROME||undefined});
 try{
 const ui=path.join(project,'ui');
 const {page:consolePage,errors:consoleErrors}=await simulatedPage(browser,ui,{width:1360,height:860});
 await consolePage.locator('#readingGuideMode').selectOption('invert');
 await consolePage.waitForFunction(()=>FP.snap.settings.guideMode==='invert');
 await consolePage.waitForTimeout(80);
 aligned(await inspect(consolePage,'pvRoot','pvTrack','pvGuide'));
 checks.push('控制台快速切换反色，实际视觉行对齐');
 await consolePage.locator('[data-act="settings"]').click();
 await consolePage.locator('[data-tab="layout"]').click();
 assert.equal(await consolePage.locator('[data-guide-mode]').inputValue(),'invert');
 await consolePage.locator('[data-guide-mode]').selectOption('triangle');
 await consolePage.waitForTimeout(100);
 assert.equal(await consolePage.locator('#readingGuideMode').inputValue(),'triangle');
 for(const [key,value] of [['guideOpacity','25'],['guideSize','30'],['anchorY','60']]){
  await consolePage.locator(`input[type=number][data-k="${key}"]`).fill(value);
  await consolePage.waitForTimeout(100);
 }
 let detail=await inspect(consolePage,'pvRoot','pvTrack','pvGuide');aligned(detail);
 assert.equal(detail.arrows[0].opacity,'0.25');
 assert(Math.abs(detail.arrows[0].rect.height-30*detail.root.height/1080)<.1);
 checks.push('排版与快捷入口同步，暂停时大小/透明度/位置立即更新');
 await consolePage.locator('[data-act="closePanel"]').click();
 await consolePage.locator('#btnPreviewMirror').click();
 aligned(await inspect(consolePage,'pvRoot','pvTrack','pvGuide'));
 await consolePage.locator('#btnPreviewMirror').click();
 await consolePage.locator('#readingGuideMode').selectOption('off');
 await consolePage.waitForTimeout(80);
 assert(!(await inspect(consolePage,'pvRoot','pvTrack','pvGuide')).active);
 checks.push('预览镜像对齐，关闭后无提示残留');
 for(const width of [1080,1360,1920]){
  await consolePage.setViewportSize({width,height:width===1080?660:860});
  await consolePage.waitForTimeout(60);
  const box=await consolePage.locator('#readingGuideMode').boundingBox();
  assert(box.x>=0&&box.x+box.width<=width);
  assert.equal(await consolePage.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 }
 checks.push('三种控制台尺寸均可操作，无新增水平溢出');
 await consolePage.setViewportSize({width:1360,height:860});
 const prompter=await simulatedPage(browser,ui,{width:1280,height:720},false,'prompter.html');
 const monitor=await simulatedPage(browser,ui,{width:1360,height:860},false,'monitor.html');
 const pages=[consolePage,prompter.page,monitor.page];
 const ids=[['pvRoot','pvTrack','pvGuide'],['root','track','guide'],['mvRoot','mvTrack','mvGuide']];
 const longText='这是一段需要连续阅读的文稿，阅读提示跟随实际折行，帮助你在停顿和继续播报时找到当前位置。'.repeat(70)+'\n\n@男 **重点内容**，保持自然的表达。\n\n# 接下来继续播报\n\n'+ '结束之前也要保持阅读提示准确。'.repeat(30);
 for(const page of pages)await patch(page,{scriptText:longText,showGuide:true,guideMode:'invert',fontSize:72,lineHeight:1.5,anchorY:50,bg:'#000000',fg:'#ffffff',showFade:false});
 await prompter.page.waitForTimeout(120);
 const metrics=await prompter.page.evaluate(()=>({contentH:document.getElementById('track').scrollHeight,viewH:innerHeight}));
 for(const page of pages)await page.evaluate(metrics=>{Object.assign(__test.snap.playback,metrics);__test.emit();},metrics);
 for(let i=0;i<pages.length;i++){await seek(pages[i],(metrics.contentH-metrics.viewH)*.82);await pages[i].waitForTimeout(70);detail=await inspect(pages[i],...ids[i]);aligned(detail);assert(detail.index>40,'must select far below initial screen');}
 checks.push('长段换行后，三种窗口跳至后半稿仍指向正确单行');
 const playingBands=[];
 for(let i=0;i<pages.length;i++){
  playingBands.push((await inspect(pages[i],...ids[i])).band.top);
  await pages[i].evaluate(()=>FP.invoke('set_playing',{on:true}));
 }
 await consolePage.waitForTimeout(450);
 for(let i=0;i<pages.length;i++){
  detail=await inspect(pages[i],...ids[i]);aligned(detail);
  assert(Math.abs(detail.band.top-playingBands[i])>1,'guide follows continuous scrolling');
  await pages[i].evaluate(()=>FP.invoke('set_playing',{on:false}));
 }
 await consolePage.waitForTimeout(60);
 const paused=await Promise.all(pages.map((page,i)=>inspect(page,...ids[i])));
 await consolePage.waitForTimeout(250);
 for(let i=0;i<pages.length;i++)assert(Math.abs((await inspect(pages[i],...ids[i])).band.top-paused[i].band.top)<.1,'paused guide stays still');
 checks.push('三种窗口连续滚动时提示跟随，暂停后无漂移');
 for(const guideMode of ['triangle','invert']){
  await patch(prompter.page,{guideMode});
  for(const mirrored of [[true,false],[false,true],[true,true]]){
   await prompter.page.evaluate(([mirrorH,mirrorV])=>FP.invoke('update_output',{id:'main',patch:{mirrorH,mirrorV}}),mirrored);
   await prompter.page.waitForTimeout(40);
   detail=await inspect(prompter.page,...ids[1]);aligned(detail);
   if(guideMode==='triangle'){
    const arrows=detail.arrows.map(a=>a.rect).sort((a,b)=>a.left-b.left);
    assert(Math.abs(arrows[0].left-detail.root.left)<1);
    assert(Math.abs(arrows[1].right-detail.root.right)<1);
   }
  }
 }
 checks.push('反色与三角均支持水平/垂直/双向镜像，三角留在两侧边缘');
 for(const page of pages){await patch(page,{fontSize:90,lineHeight:1.9,anchorY:38,bg:'#ffffff',fg:'#141414'});await page.waitForTimeout(70);}
 for(let i=0;i<pages.length;i++)aligned(await inspect(pages[i],...ids[i]));
 checks.push('改字号/行距/阅读位置与白底主题后重新对齐');
 await patch(prompter.page,{bg:'#000000',fg:'#ffffff',fontSize:72,lineHeight:1.5,anchorY:50,scriptText:'让阅读的位置更清楚。\n\n清晰的提示，帮助自然播报。\n\n可以轻一点，也可以完全关闭。'});
 await prompter.page.evaluate(()=>FP.invoke('update_output',{id:'main',patch:{mirrorH:false,mirrorV:false}}));
 await seek(prompter.page,0);await prompter.page.waitForTimeout(80);
 for(const mode of ['off','triangle','invert']){await patch(prompter.page,{showGuide:mode!=='off',guideMode:mode==='off'?'triangle':mode,guideOpacity:65,guideSize:16});await prompter.page.waitForTimeout(60);await prompter.page.screenshot({path:path.join(workspace,`guide-${mode}.png`)});}
 detail=await inspect(prompter.page,...ids[1]);
 fs.writeFileSync(path.join(workspace,'guide-invert-box.json'),JSON.stringify(detail));
 await prompter.page.evaluate(()=>FP.invoke('update_output',{id:'main',patch:{mode:'media',media:{kind:'image',url:'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"/>'}}}));
 await prompter.page.waitForTimeout(60);assert(!(await inspect(prompter.page,...ids[1])).active);
 await prompter.page.evaluate(()=>FP.invoke('update_output',{id:'main',patch:{mode:'prompter',media:null}}));
 await prompter.page.waitForTimeout(60);aligned(await inspect(prompter.page,...ids[1]));
 checks.push('素材投放隐藏阅读提示，返回文稿恢复');
 for(const page of pages){await patch(page,{scriptText:'',showGuide:true});await page.waitForTimeout(40);}
 for(let i=0;i<pages.length;i++)assert(!(await inspect(pages[i],...ids[i])).active,'empty text must hide markers');
 checks.push('三种窗口空稿均隐藏提示');
 assert.deepEqual([...consoleErrors,...prompter.errors,...monitor.errors],[]);
 fs.writeFileSync(path.join(workspace,'reading-guide-integration.json'),JSON.stringify({passed:checks},null,2));
 checks.forEach(name=>console.log('PASS '+name));
 console.log('Reading guide integration:',checks.length,'passed');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
