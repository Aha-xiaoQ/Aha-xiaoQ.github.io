// No administrative credentials. Tokens stay in memory; only a device ID persists.
export function createGuestbookClient({env, accessKey, fetchImpl = fetch, storage = localStorage, uuid = () => crypto.randomUUID()}) {
  if (!/^[a-z0-9-]+$/.test(env) || !accessKey) throw new Error('CONFIG_INVALID');
  const base = `https://${env}.api.tcloudbasegateway.com`;
  let session, expires = 0, signingIn, creatorMode=false;
  const storageKey = `guestbook-device:${env}`;
  let device;
  try { device = storage.getItem(storageKey); } catch { throw new Error('STORAGE_UNAVAILABLE'); }
  if (!device) {
    device = uuid();
    try { storage.setItem(storageKey, device); } catch { throw new Error('STORAGE_UNAVAILABLE'); }
  }
  async function request(path, token, body, extra = {}) {
    const response = await fetchImpl(base + path, {
      method:'POST', headers:{'Content-Type':'application/json', ...(token ? {Authorization:`Bearer ${token}`} : {}), ...extra},
      body:JSON.stringify(body), signal:AbortSignal.timeout(15000), redirect:'error'
    });
    const data = await response.json();
    if (!response.ok) {
      const known = ['LOGIN_REQUIRED','SUBMISSIONS_PAUSED','RATE_LIMITED','WALL_CAPACITY_REACHED','INVALID_NOTE','INVALID_POSITION','REQUEST_CONFLICT','REQUEST_RETIRED','REQUEST_ID_REQUIRED','NO_SPACE_NEARBY','STALE_NOTE','NOT_OWNED','EDIT_NOT_ALLOWED'];
      throw new Error(known.includes(data?.message) ? data.message : `REQUEST_FAILED_${response.status}`);
    }
    return data;
  }
  async function identity() {
    if (session && Date.now() < expires) return session;
    if(creatorMode)throw new Error('CREATOR_LOGIN_EXPIRED');
    if (!signingIn) signingIn = (async () => {
      const data = await request('/auth/v1/signin/anonymously', null, {}, {'x-device-id':device});
      if (!data?.access_token) throw new Error('LOGIN_FAILED');
      session = data.access_token;
      expires = Date.now() + Math.max(0, Math.min(Number(data.expires_in) || 300, 3600) - 30) * 1000;
      return session;
    })().finally(() => { signingIn = null; });
    return signingIn;
  }
  async function rpc(name, payload, own = false) {
    return request(`/v1/rdb/rest/rpc/${name}`, own ? await identity() : accessKey, payload);
  }
  async function page(own, before = null, reservations = false) {
    const rows = await rpc(own ? 'gb_mine' : reservations ? 'gb_wall' : 'gb_list', {p_before:before}, own);
    if (!Array.isArray(rows) || rows.length > 100) throw new Error('INVALID_RESPONSE');
    for (const row of rows) {
      if ((reservations || row.layout_version != null) && (row.layout_version !== 1 || !Number.isInteger(row.width) || !Number.isInteger(row.height) || row.width<260 || row.width>900 || row.height<200 || row.height>900)) throw new Error('INVALID_RESPONSE');
      if (!/^[1-9]\d*$/.test(row.id) || typeof row.body !== 'string' || [...row.body].length > 500 ||
          typeof row.nickname !== 'string' || !/^#[a-f\d]{6}$/i.test(row.color) ||
          !['square','round','heart','ticket'].includes(row.shape) ||
          !Number.isInteger(row.x) || !Number.isInteger(row.y) || Math.abs(row.x)>1000000 || Math.abs(row.y)>1000000 ||
          !Number.isFinite(Date.parse(row.created_at))) throw new Error('INVALID_RESPONSE');
    }
    return {rows, next:rows.length === 100 ? rows.at(-1).id : null};
  }
  return {
    creatorLogin:async(username,password)=>{
      if(signingIn)await signingIn;
      const data=await request('/auth/v1/signin',null,{username,password},{'x-device-id':device});
      if(!data.access_token)throw Error('LOGIN_FAILED');
      const allowed=await request('/v1/rdb/rest/rpc/gb_creator_status',data.access_token,{});
      if(allowed!==true)throw Error('CREATOR_REQUIRED');
      session=data.access_token;expires=Date.now()+Math.max(0,Math.min(Number(data.expires_in)||300,3600)-30)*1000;creatorMode=true;
    },
    creatorLogout:()=>{session=null;expires=0;creatorMode=false;},
    list:(before) => page(false,before), wall:(before) => page(false,before,true), mine:(before) => page(true,before),
    submit:note => {
      note.requestId ??= uuid();
      return rpc('gb_submit_once',{p_request_id:note.requestId,p_body:note.body,p_nickname:note.nickname,p_color:note.color,p_shape:note.shape,p_x:Math.round(note.x),p_y:Math.round(note.y)},true);
    },
    edit:(id,revision,note) => rpc('gb_edit',{p_id:String(id),p_revision:revision,p_body:note.body,p_nickname:note.nickname,p_color:note.color,p_shape:note.shape},true),
    move:(id,x,y) => rpc('gb_move',{p_id:String(id),p_x:Math.round(x),p_y:Math.round(y)},true),
    remove:id => rpc('gb_delete',{p_id:String(id)},true)
  };
}
