const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require(process.env.FP_PLAYWRIGHT || 'playwright');
const project = path.resolve(__dirname, '..');
const workspace = process.env.FP_TEST_OUTPUT || path.join(require('node:os').tmpdir(), 'freeprompter-ui-validation');
fs.mkdirSync(workspace, {recursive:true});
const defaults = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/default-settings.json'), 'utf8'));
const script = fs.readFileSync(path.join(project, 'ui/示例文稿.txt'), 'utf8');
const monitors = [
  {index:0,name:'控制屏',x:0,y:0,width:1920,height:1080,scale:1,primary:true},
  {index:1,name:'主持人屏',x:-1920,y:0,width:1920,height:1080,scale:1,primary:false},
  {index:2,name:'监看屏',x:1920,y:-180,width:2560,height:1440,scale:1.5,primary:false},
];

async function simulatedPage(browser, uiRoot, size, empty = false, filename = 'console.html') {
  const page = await browser.newPage({viewport:size});
  const errors=[];
  page.on('pageerror', e=>errors.push(String(e)));
  await page.addInitScript(({defaults,script,monitors,empty})=>{
    const listeners=[];
    const snap={settings:structuredClone(defaults),playback:{playing:false,y:0,speed:60,anchorMs:Date.now(),contentH:5000,viewH:1080,segment:0,elapsed:0,seq:1},monitors,version:'2.1.0'};
    snap.settings.scriptText=empty?'':script;
    snap.settings.outputs[0].monitor=1;
    snap.settings.outputs[0].open=false;
    window.__test={snap,calls:[],emit(){listeners.forEach(f=>f({payload:structuredClone(snap)}));}};
    window.__TAURI__={core:{async invoke(cmd,args={}){
      window.__test.calls.push({cmd,args});
      const s=snap.settings,p=snap.playback,o=s.outputs.find(o=>o.id===args.id);
      const now=Date.now();
      if(p.playing){const dt=Math.max(0,now-p.anchorMs)/1000;p.y+=dt*p.speed;p.elapsed+=dt;}
      p.anchorMs=now;
      switch(cmd){
        case 'get_snapshot': return structuredClone(snap);
        case 'list_monitors': return snap.monitors;
        case 'app_info': return {version:'2.1.0',dataDir:'isolated-test'};
        case 'set_playing': p.playing=args.on; break;
        case 'set_speed': p.speed=s.speed=Math.max(5,Math.min(600,args.speed));break;
        case 'set_script':s.scriptText=args.text;break;
        case 'patch':Object.assign(s,args.patch);break;
        case 'update_output':Object.assign(o,args.patch);break;
        case 'open_output':o.open=true;break;
        case 'close_output':o.open=false;break;
        case 'restart':p.y=p.elapsed=0;break;
        case 'seek':p.y=args.y;p.segment=args.segment??p.segment;break;
        case 'nudge':p.y=Math.max(0,p.y+args.dy);break;
        case 'add_output':s.outputs.push({...s.outputs[0],id:'added',name:'提词屏 2',open:false,monitor:2});break;
        case 'report_metrics':return structuredClone(snap);
      }
      p.seq++;window.__test.emit();return structuredClone(snap);
    }},event:{async listen(name,fn){if(name==='state')listeners.push(fn);return ()=>{};}}};
  },{defaults,script,monitors,empty});
  await page.goto(pathToFileURL(path.join(uiRoot,filename)).href);
  await page.waitForFunction(()=>window.FP?.snap);
  await page.waitForTimeout(200);
  return {page,errors};
}

module.exports={simulatedPage,project,workspace,chromium};
