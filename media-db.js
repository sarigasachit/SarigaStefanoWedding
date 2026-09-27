
const WeddingMediaDB = (() => {
  const DB_NAME = 'sarigaStefanoWeddingMedia';
  const DB_VERSION = 1;
  const STORE = 'media';

  function openDB(){
    return new Promise((resolve,reject)=>{
      const req=indexedDB.open(DB_NAME,DB_VERSION);
      req.onupgradeneeded=()=> {
        const db=req.result;
        if(!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
      };
      req.onsuccess=()=>resolve(req.result);
      req.onerror=()=>reject(req.error);
    });
  }

  async function get(key){
    const db=await openDB();
    return new Promise((resolve,reject)=>{
      const tx=db.transaction(STORE,'readonly');
      const req=tx.objectStore(STORE).get(key);
      req.onsuccess=()=>resolve(req.result||null);
      req.onerror=()=>reject(req.error);
    });
  }

  async function set(key,value){
    const db=await openDB();
    return new Promise((resolve,reject)=>{
      const tx=db.transaction(STORE,'readwrite');
      tx.objectStore(STORE).put(value,key);
      tx.oncomplete=()=>resolve();
      tx.onerror=()=>reject(tx.error);
    });
  }

  async function remove(key){
    const db=await openDB();
    return new Promise((resolve,reject)=>{
      const tx=db.transaction(STORE,'readwrite');
      tx.objectStore(STORE).delete(key);
      tx.oncomplete=()=>resolve();
      tx.onerror=()=>reject(tx.error);
    });
  }

  function srtToVtt(text){
    let t=String(text||'').replace(/\r/g,'').trim();
    if(!t) return 'WEBVTT\n\n';
    t=t.replace(/^\d+\s*\n(?=\d{2}:\d{2}:\d{2}[,.]\d{3}\s+-->)/gm,'');
    t=t.replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g,'$1.$2');
    if(!/^WEBVTT/i.test(t)) t='WEBVTT\n\n'+t;
    return t+'\n';
  }

  async function subtitleFileToVttBlob(file){
    const txt=await file.text();
    const isVtt=/\.vtt$/i.test(file.name) || /^WEBVTT/i.test(txt.trim());
    const vtt=isVtt ? txt : srtToVtt(txt);
    return new Blob([vtt],{type:'text/vtt'});
  }

  return {get,set,remove,subtitleFileToVttBlob};
})();
