"""Optional full-game integration comparison. Requires installed Playwright+Chromium.
Run both local servers first. No automatic dependency/browser download. This uses
real game hooks, but virtual input and seeded RNG: not physical gamepad/audio QA.
"""
import argparse, json, sys, urllib.parse
from pathlib import Path

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--candidate',default='http://127.0.0.1:4180')
    ap.add_argument('--reference',default='http://127.0.0.1:4181')
    ap.add_argument('--output',default='.local/browser-comparison.json')
    args=ap.parse_args()
    for url in (args.candidate,args.reference):
        u=urllib.parse.urlparse(url)
        if u.scheme!='http' or u.hostname!='127.0.0.1' or u.path not in ('','/') or u.query or u.fragment:
            raise ValueError('Only local loopback server origins are accepted')
    from playwright.sync_api import sync_playwright
    report={'schemaVersion':1,'kind':'full-game-virtual-input-comparison','status':'not-run','cases':[],
            'limits':['No physical gamepad/touch validation','No audible audio validation','Seeded RNG and virtual stepping','No full campaign completion']}
    output=Path(args.output); output.parent.mkdir(parents=True,exist_ok=True)
    try:
        with sync_playwright() as pw:
            browser=pw.chromium.launch(headless=True)
            pages=[];errors=[]
            for origin,expected in [(args.reference,'original-reference'),(args.candidate,'candidate')]:
                ctx=browser.new_context()
                ctx.add_init_script("let seed=913; Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};")
                page=ctx.new_page(); page.on('pageerror',lambda e: errors.append(str(e)))
                meta=ctx.request.get(origin+'/__r05/build.json').json()
                if meta['mode']!=expected: raise RuntimeError('Server mode mismatch: '+expected)
                report[expected]=meta
                page.goto(origin+'/games/mario-mix/play.html?test=1',wait_until='load')
                page.wait_for_function('Boolean(window.__test && window.__mixTest)',timeout=15000)
                page.evaluate('async()=>{await window.__mixReady;}')
                pages.append(page)
            for hero in ['mario','bill','megaman']:
                for page in pages: page.evaluate('(hero)=>window.__mixTest.select(hero)',hero)
                for name,frames,action in [('settle',10,{}),('run',20,{'right':True}),('jump',10,{'right':True,'jump':True}),('air-down',8,{'down':True,'run':True}),('release',15,{}),('down-jump',2,{'down':True,'jump':True}),('opposed',2,{'left':True,'right':True,'up':True,'down':True})]:
                    results=[]
                    for page in pages:
                        results.append(page.evaluate('([n,i])=>({core:window.__test.step(n,i),mix:window.__mixTest.state()})',[frames,action]))
                    same=results[0]==results[1]
                    row={'hero':hero,'case':name,'frames':frames,'input':action,'equal':same}
                    if not same: row['reference'],row['candidate']=results
                    report['cases'].append(row)
                    if not same: raise AssertionError(hero+'/'+name+' diverged')
            if errors: raise RuntimeError('Browser errors: '+str(errors))
            browser.close()
            report['status']='passed'
    except Exception as e:
        report['status']='failed-or-blocked';report['error']=str(e)
        raise
    finally:
        output.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(str(output))
if __name__=='__main__':
    try: main()
    except Exception as exc: print(str(exc),file=sys.stderr);sys.exit(1)
