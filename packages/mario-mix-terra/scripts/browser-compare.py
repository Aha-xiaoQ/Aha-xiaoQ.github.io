"""Complete uploaded-game script comparison in an offline DOM fixture.
Not a substitute for HTTP module loading, real devices, audio or natural playthrough.
Requires Python Playwright + Chromium already installed. Does not install dependencies
or change browser policy. Outputs go to .local/browser, excluded from source archives.
"""
from pathlib import Path
import argparse, json, shutil, hashlib, sys
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent.parent
OUT=ROOT/'.local/browser'
def main():
    parser=argparse.ArgumentParser();parser.add_argument('--chromium',default=shutil.which('chromium') or shutil.which('chromium-browser'));args=parser.parse_args()
    OUT.mkdir(parents=True,exist_ok=True);runs={};errors={};screens={}
    scenario=r'''() => {
      const t=window.__trioTest,states=[];
      function snap(name){const s=t.state();states.push({name,state:s});}
      t.start();snap('start-world');
      t.step(90,{x:1});snap('walk');
      t.step(24,{x:1,jump:true});snap('jump');
      t.step(30,{action:true});snap('weapon');
      t.pause();snap('pause');t.native(30);snap('pause-no-advance');t.pause();
      t.step(30,{x:-1});snap('resume');
      t.start();let q=t.state().pipe,p=t.state().p;
      if(!q)throw Error('No mainline pipe');
      t.player({x:q.x+(q.w-p.w)/2,y:q.y-p.h,grounded:true,vx:0,vy:0});t.fixture({interactLock:0});
      if(!t.enterHidden())throw Error('Pipe entry rejected');t.step(61,{});
      if(!t.state().r05Arena)throw Error('Did not reach hidden arena');snap('hidden-preparation');
      if(!t.r05Construction())throw Error('Builder not created');t.r05BuildAt(80,240);snap('construction-result');
      t.fixture({t12SummonGate:true});if(!t.r05Summon()||!t.state().eye)throw Error('Boss not summoned');snap('boss-summon');
      t.step(120,{x:1,action:true});snap('arena-combat');
      t.r05HitEye(100000);if(!t.state().bossClear)throw Error('Boss not defeated');snap('boss-reward');
      q=t.state().pipe;p=t.state().p;t.player({x:q.x+(q.w-p.w)/2,y:q.y-p.h,grounded:true,vx:0,vy:0});t.fixture({interactLock:0});
      if(!t.exitHidden())throw Error('Exit rejected');t.step(61,{});if(t.state().r05Arena)throw Error('Did not return');snap('return-world');
      return states;
    }'''
    with sync_playwright() as p:
        opts={'headless':True,'args':['--no-sandbox']}
        if args.chromium:opts['executable_path']=args.chromium
        browser=p.chromium.launch(**opts)
        for variant,filename in [('reference','reference.html'),('candidate','MarioMix_Terraria_M07.html')]:
            context=browser.new_context(viewport={'width':1280,'height':800});page=context.new_page();errors[variant]=[]
            page.on('pageerror',lambda e,v=variant:errors[v].append(e.stack))
            page.route('https://**/*',lambda r:r.abort())
            page.route('http://**/*',lambda r:r.abort())
            html=(ROOT/'dist'/filename).read_text(encoding='utf-8').replace('<html lang="zh-CN">','<html lang="zh-CN" data-test="1">')
            seed="Math.random=(()=>{let s=123456;return ()=>{s=(Math.imul(1664525,s)+1013904223)>>>0;return s/4294967296;};})();"
            html=html.replace('<script>',f'<script>{seed}</script><script>',1)
            page.set_content(html,wait_until='domcontentloaded',timeout=25000)
            page.wait_for_function('() => !!(window.__trioTest && window.__test)',timeout=15000)
            page.evaluate('window.__trioTest.ready');page.evaluate('window.__trioTest.r06AssetReady')
            page.wait_for_timeout(600)
            runs[variant]=page.evaluate(scenario)
            if variant=='candidate':
                page.evaluate('window.__trioTest.start();window.__trioTest.step(45,{x:1});')
                page.screenshot(path=str(OUT/'candidate-desktop.png'),full_page=True)
                button=page.locator('#t21BindingButton');button.click()
                assert page.locator('#t21Bindings').evaluate('(e)=>e.open')
                assert page.locator('#t21BindRows tr').count()>=10
                page.locator('#t21BindClose').click()
                assert not page.locator('#t21Bindings').evaluate('(e)=>e.open')
                for width in [390,768]:
                    page.set_viewport_size({'width':width,'height':844});page.wait_for_timeout(100)
                    screens[str(width)]=page.evaluate('({width:innerWidth,scroll:document.documentElement.scrollWidth})')
                page.set_viewport_size({'width':390,'height':844});page.screenshot(path=str(OUT/'candidate-mobile.png'),full_page=True)
            context.close()
        browser.close()
    mismatches=[]
    def compare(a,b,path=''):
        if type(a)!=type(b):mismatches.append(path+': type');return
        if isinstance(a,dict):
            if a.keys()!=b.keys():mismatches.append(path+': keys');return
            for key in a:compare(a[key],b[key],path+'.'+key)
        elif isinstance(a,list):
            if len(a)!=len(b):mismatches.append(path+': length');return
            for i,(x,y) in enumerate(zip(a,b)):compare(x,y,path+f'[{i}]')
        elif a!=b:mismatches.append(path)
    compare(runs['reference'],runs['candidate'])
    report={'mode':'offline-full-script-fixture','scenarioCount':len(runs['candidate']),'scenarios':[s['name'] for s in runs['candidate']],
            'mismatches':mismatches[:100],'pageErrors':errors,'layout':screens,'result':'pass' if not mismatches and not any(errors.values()) else 'fail',
            'scope':'Actual baseline and candidate scripts, full embedded game assets, deterministic input and seed. HTTP/file navigation not tested; all external requests blocked; storage may be unavailable.',
            'ui':'Binding dialog opens, renders >=10 actions and closes; screenshots use embedded game resources and system fonts.',
            'candidateSha256':hashlib.sha256((ROOT/'dist/MarioMix_Terraria_M07.html').read_bytes()).hexdigest()}
    (OUT/'comparison.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    (OUT/'states.json').write_text(json.dumps(runs,ensure_ascii=False),encoding='utf-8')
    print(json.dumps(report,ensure_ascii=False,indent=2))
    if report['result']!='pass':sys.exit(1)
if __name__=='__main__':main()
