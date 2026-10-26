const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
const {chromium,simulatedPage,project,workspace}=require('./ui-harness.cjs');
const results=[];
const check=(name,fn)=>Promise.resolve().then(fn).then(()=>{results.push({name,pass:true});console.log('PASS '+name);});
async function bounds(page,selectors){
  for(const selector of selectors){
    const el=page.locator(selector).first();
    assert(await el.isVisible(),selector+' visible');
    const box=await el.boundingBox();
    const size=page.viewportSize();
    assert(box.x>=-1&&box.y>=-1&&box.x+box.width<=size.width+1&&box.y+box.height<=size.height+1,selector+' within viewport '+JSON.stringify(box));
  }
}
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.FP_CHROME,headless:true});
 try{
  for(const [width,height] of [[1080,660],[1360,860],[1920,1080]]){
   const {page,errors}=await simulatedPage(browser,path.join(project,'ui'),{width,height});
   await check(`${width}x${height} 主控和设置布局`,async()=>{
    assert(!(await page.locator('#settingsPane').isVisible()));
    await bounds(page,['#btnPlay','[data-act="screens"]','[data-act="monitor"]','.qk[data-q="speed"]','.qk[data-q="fontSize"]','[data-act="nextSeg"]','#previewStage']);
    const before=(await page.locator('#previewStage').boundingBox()).width;
    await page.locator('[data-act="screens"]').click();
    assert(await page.locator('#settingsPane').isVisible());
    assert(await page.locator('[data-tab="outputs"]').evaluate(e=>e.classList.contains('active')));
    await bounds(page,['#settingsPane','[data-act="closePanel"]','#btnPlay','#previewStage']);
    const footer=await page.locator('.preview-footer').boundingBox();
    const progress=await page.locator('#previewProgressInput').boundingBox();
    assert(progress.x+progress.width<=footer.x+footer.width+1,'进度条应保持在预览区域内');
    for(const tab of ['look','layout','info','roles','outputs','help']){await page.locator(`[data-tab="${tab}"]`).click();assert((await page.locator('#tabBody').innerText()).trim().length>0);}
    await page.locator('[data-act="closePanel"]').click();
    await page.waitForTimeout(100);
    assert(Math.abs((await page.locator('#previewStage').boundingBox()).width-before)<2);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    assert.deepEqual(errors,[]);
   });
   await page.screenshot({path:path.join(workspace,`ui-${width}.png`)});
   await page.close();
  }
  const {page,errors}=await simulatedPage(browser,path.join(project,'ui'),{width:1360,height:860});
  await check('缩放预览的跳段与拖动定位',async()=>{
   await page.waitForTimeout(450);
   assert.equal(await page.locator('#stCurrent').innerText(),'1/14','开头应为第1段');
   await page.locator('[data-act="nextSeg"]').click();await page.waitForTimeout(450);
   assert.equal(await page.locator('#stCurrent').innerText(),'2/14');
   await page.locator('[data-act="previewSeg"]').click();await page.waitForTimeout(450);
   assert.equal(await page.locator('#stCurrent').innerText(),'1/14');
   const progress=page.locator('#previewProgressInput');
   await progress.focus();await progress.press('Home');await progress.press('ArrowRight');
   assert((await page.evaluate(()=>window.__test.snap.playback.y))>0);
   await page.locator('[data-act="restart"]').click();
  });
  await check('播放持续滚动、暂停静止、计时递增',async()=>{
   await page.locator('#btnPlay').click();
   assert.equal(await page.locator('#btnPlay').getAttribute('aria-pressed'),'true');
   const first=await page.locator('#pvTrack').getAttribute('style');
   await page.waitForTimeout(1250);
   assert.notEqual(await page.locator('#pvTrack').getAttribute('style'),first);
   await page.waitForFunction(()=>document.getElementById('stElapsed').textContent!=='00:00',{},{timeout:2200});
   await page.locator('#btnPlay').click();
   await page.waitForTimeout(60);
   const paused=await page.locator('#pvTrack').getAttribute('style');
   await page.waitForTimeout(300);
   assert.equal(await page.locator('#pvTrack').getAttribute('style'),paused);
  });
  await check('精准输入、数值边界与键盘加减',async()=>{
   const speed=page.locator('.qk[data-q="speed"] input');
   await speed.fill('125');await speed.press('Tab');
   assert.equal(await page.evaluate(()=>window.__test.snap.playback.speed),125);
   await speed.fill('9999');await speed.press('Tab');
   assert.equal(await page.evaluate(()=>window.__test.snap.playback.speed),600);
   await speed.fill('');await speed.press('Tab');
   assert(Number.isFinite(await page.evaluate(()=>window.__test.snap.playback.speed)));
   const plus=page.locator('.qk[data-q="fontSize"] [data-step="2"]');
   const n=await page.evaluate(()=>window.__test.snap.settings.fontSize);
   const playing=await page.evaluate(()=>window.__test.snap.playback.playing);
   await plus.focus();await plus.press('Space');await page.waitForTimeout(100);
   assert.equal(await page.evaluate(()=>window.__test.snap.settings.fontSize),n+2);
   assert.equal(await page.evaluate(()=>window.__test.snap.playback.playing),playing,'空格加字号不能同时播放');
  });
  await check('编辑快捷键与参数预览同步',async()=>{
   const input=page.locator('#scriptInput');
   await input.focus();const playing=await page.evaluate(()=>window.__test.snap.playback.playing);
   await input.press('Space');await input.press('ArrowDown');
   assert.equal(await page.evaluate(()=>window.__test.snap.playback.playing),playing);
   const font=page.locator('.qk[data-q="fontSize"] input');
   await font.fill('90');await font.press('Tab');await page.waitForTimeout(150);
   assert.equal(await page.locator('#pvRoot').evaluate(e=>e.style.getPropertyValue('--fs')),'90px');
  });
  await check('三屏目标、投放与撤回使用明确操作',async()=>{
   assert((await page.locator('#outputOverview').innerText()).includes('1920×1080'));
   await page.locator('[data-over-open="main"]').click();
   assert.equal(await page.evaluate(()=>window.__test.snap.settings.outputs[0].open),true);
   if(await page.locator('[data-chip="main"]').isVisible())await page.locator('[data-chip="main"]').click();
   assert.equal(await page.evaluate(()=>window.__test.snap.settings.outputs[0].open),true,'状态入口不应关闭输出');
   if(await page.locator('#settingsPane').isVisible())await page.locator('[data-act="closePanel"]').click();
   await page.locator('[data-over-close="main"]').click();
   assert.equal(await page.evaluate(()=>window.__test.snap.settings.outputs[0].open),false);
  });
  await check('镜像、全屏、锁定与选择屏幕指令',async()=>{
   await page.locator('[data-act="screens"]').click();
   const mon=page.locator('select[data-oid="main"][data-ok="monitor"]');
   await mon.selectOption('2');
   assert.equal(await page.evaluate(()=>window.__test.snap.settings.outputs[0].monitor),2);
   assert(await page.evaluate(()=>window.__test.calls.some(c=>c.cmd==='place_output'&&c.args.id==='main')));
   for(const k of ['mirrorH','fullscreen','locked']){
    const input=page.locator(`input[data-oid="main"][data-ok="${k}"]`);
    const old=await input.isChecked();await input.locator('..').click();
    assert.equal(await page.evaluate(k=>window.__test.snap.settings.outputs[0][k],k),!old);
   }
   await page.locator('[data-act="closePanel"]').click();
  });
  await check('单屏提示与热插拔快照更新',async()=>{
   await page.evaluate(()=>{window.__test.snap.monitors=window.__test.snap.monitors.slice(0,1);window.__test.emit();});
   assert((await page.locator('#outputOverview').innerText()).includes('单屏'));
   assert.equal((await page.locator('#stMon').innerText()).trim(),'1');
  });
  await check('错误转义与新增屏幕入口',async()=>{
   await page.evaluate(()=>{window.__test.snap.settings.outputs[0].name='<img src=x onerror="window.__unsafe=1">';window.__test.emit();});
   assert.equal(await page.locator('#outputOverview img').count(),0);
   assert.equal(await page.evaluate(()=>window.__unsafe),undefined);
   await page.locator('[data-act="addOut"]').click();await page.waitForTimeout(100);
   assert(await page.locator('#settingsPane').isVisible());
   assert(await page.locator('[data-tab="outputs"]').evaluate(e=>e.classList.contains('active')));
  });
  assert.deepEqual(errors,[]);await page.close();
  const {page:empty,errors:emptyErrors}=await simulatedPage(browser,path.join(project,'ui'),{width:1080,height:660},true);
  await check('空文稿状态',async()=>{assert.equal(await empty.locator('#stChars').innerText(),'0');assert(await empty.locator('#previewProgressInput').isDisabled());assert.deepEqual(emptyErrors,[]);});
  await empty.screenshot({path:path.join(workspace,'empty-ui.png')});await empty.close();
  console.log(`RESULT ${results.length} checks passed`);
 }finally{
  fs.writeFileSync(path.join(workspace,'ui-results.json'),JSON.stringify(results,null,2));
  await browser.close();
 }
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
