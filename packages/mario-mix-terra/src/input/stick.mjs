/** Preserve radial deadzone and clamping from the uploaded build. */
export function normalizeStick(x,y,d=.22){const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));x=Number.isFinite(x)?clamp(x,-1,1):0;y=Number.isFinite(y)?clamp(y,-1,1):0;const len=Math.hypot(x,y);if(len<=d)return [0,0];const m=Math.min(1,(len-d)/(1-d));return [x/len*m,y/len*m];}
