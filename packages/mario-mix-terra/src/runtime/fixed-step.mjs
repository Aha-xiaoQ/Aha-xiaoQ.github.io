/** Fixed tick driver. No DOM, no wall-clock queries; callers provide every dependency.
 * Preserve the baseline .1 s clamp, six-step ceiling and manual-mode behavior.
 */
export function createFixedStep({update,draw,isManual,requestFrame}){
  for(const f of [update,draw,isManual,requestFrame])if(typeof f!=='function')throw new TypeError('Clock callbacks are required');
  let last=0,accumulator=0,running=false;
  function tick(now){
    if(!last)last=now;
    const elapsed=Math.min((now-last)/1000,.1);last=now;
    if(!isManual()){
      accumulator+=elapsed;let n=0;
      while(accumulator>=1/60&&n<6){update();accumulator-=1/60;n++;}
      draw();
    }
  }
  function loop(now){if(!running)return;tick(now);if(running)requestFrame(loop);}
  return {tick,start(){if(!running){running=true;requestFrame(loop);}},stop(){running=false;},snapshot(){return {last,accumulator,running};}};
}
