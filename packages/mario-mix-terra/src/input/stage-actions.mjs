/** Reads the shared binding snapshot, no browser or mutable global dependency. */
export function readStageActions({codes,pad,bindings,normalizeStick}) {
  const pressed=i=>!!(pad?.buttons?.[i]?.pressed||pad?.buttons?.[i]?.value>.5);
  const action=name=>{const b=bindings.actions?.[name]||bindings.binds?.[name]||bindings.bindings?.[name]||bindings[name];return !!b&&(b.keys.some(k=>codes.has(k))||b.pad.some(pressed));};
  const dz=bindings.deadzone??.28,stick=normalizeStick(pad?.axes?.[0]||0,pad?.axes?.[1]||0,dz);
  return{x:Math.max(-1,Math.min(1,(action('right')?1:0)-(action('left')?1:0)+stick[0])),down:action('down')||stick[1]>.35,jump:action('jump'),attack:action('attack'),interact:action('interact'),pause:action('pause')};
}
