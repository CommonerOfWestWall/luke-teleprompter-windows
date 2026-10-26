const assert = require('node:assert/strict');
const path = require('node:path');
const {chromium, simulatedPage, project, workspace} = require('./ui-harness.cjs');
(async()=>{
  const browser=await chromium.launch({executablePath:process.env.FP_CHROME,headless:true});
  try {
    const root=path.join(project,'ui');
    const {page,errors}=await simulatedPage(browser,root,{width:820,height:620},false,'monitor.html');
    await page.locator('#mPlay').click();
    const start=await page.locator('#mvTrack').getAttribute('style');
    await page.waitForTimeout(500);
    const moving=await page.locator('#mvTrack').getAttribute('style');
    assert.notEqual(moving,start,'监控画面应在无新广播时持续滚动');
    await page.locator('#mPlay').click();
    await page.waitForTimeout(60);
    const paused=await page.locator('#mvTrack').getAttribute('style');
    await page.waitForTimeout(300);
    assert.equal(await page.locator('#mvTrack').getAttribute('style'),paused,'暂停后应保持静止');
    assert.deepEqual(errors,[]);
    console.log('PASS: monitor advances without broadcasts, pauses without drift, no JS exceptions');
  }finally{await browser.close();}
})().catch(e=>{console.error(e.message);process.exitCode=1;});
