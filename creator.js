
const PASSWORD='saggu-stefano';
let DATA=null;

function clone(x){return JSON.parse(JSON.stringify(x))}
function getByPath(obj,path){return path.split('.').reduce((a,k)=>a?.[k],obj)}
function setByPath(obj,path,value){
  const parts=path.split('.');
  let o=obj;
  parts.slice(0,-1).forEach(k=>{
    if(o[k]==null || typeof o[k]!=='object') o[k]={};
    o=o[k];
  });
  o[parts.at(-1)]=value;
}
function esc(s=''){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}

async function baseContent(){
  const r=await fetch('content.json?ts='+Date.now());
  return await r.json();
}

async function loadData(){
  const raw=localStorage.getItem('weddingCreatorDraft');
  if(raw){try{return JSON.parse(raw)}catch(e){}}
  return await baseContent();
}

function fillStaticFields(){
  document.querySelectorAll('[data-path]').forEach(el=>{
    const v=getByPath(DATA,el.dataset.path);
    el.value=v??'';
    el.addEventListener('input',()=>{
      setByPath(DATA,el.dataset.path,el.value);
    });
  });
}

function renderNav(){
  const box=document.getElementById('navEditor');
  box.innerHTML='';
  DATA.nav.forEach((n,i)=>{
    const d=document.createElement('div');
    d.className='field';
    d.innerHTML=`<label>${esc(n.id)}</label><input value="${esc(n.label)}" data-nav-index="${i}">`;
    box.appendChild(d);
  });
  box.querySelectorAll('[data-nav-index]').forEach(inp=>{
    inp.addEventListener('input',()=>DATA.nav[+inp.dataset.navIndex].label=inp.value);
  });
}

function dayUploadBlock(day){
  return `
    <div class="section">
      <h2>${esc(day.tab)} — ${esc(day.date)}</h2>
      <div class="field"><label>Tab label</label><input data-day-field="tab" value="${esc(day.tab)}"></div>
      <div class="field"><label>Date</label><input data-day-field="date" value="${esc(day.date)}"></div>
      <div class="field"><label>Theme</label><input data-day-field="theme" value="${esc(day.theme||'')}"></div>

      <div class="subsection">
        <h3>Day video & subtitles</h3>
        <div class="field"><label>Video title / caption</label><input data-day-field="mediaTitle" value="${esc(day.mediaTitle||'')}"></div>
        <div class="field"><label>Reference / citation text</label><textarea data-day-field="mediaReference">${esc(day.mediaReference||'')}</textarea></div>
        <div class="field"><label>Reference URL</label><input data-day-field="mediaReferenceUrl" value="${esc(day.mediaReferenceUrl||'')}"></div>
        <div class="upload-grid">
          <div class="upload-box">
            <label>Video file</label>
            <input type="file" accept="video/mp4,video/webm,video/ogg" data-video-upload="day-${esc(day.id)}">
            <div class="upload-status" data-media-status="day-${esc(day.id)}"></div>
          </div>
          <div class="upload-box">
            <label>Subtitle file</label>
            <input type="file" accept=".vtt,.srt,text/vtt,application/x-subrip" data-subtitle-upload="day-${esc(day.id)}">
            <div class="upload-status" data-sub-status="day-${esc(day.id)}"></div>
          </div>
        </div>
        <div class="actions media-actions"><button class="secondary" data-clear-media="day-${esc(day.id)}">Remove uploaded video/subtitles</button></div>
      </div>

      <div class="subsection">
        <h3>Events</h3>
        <div class="events-editor"></div>
        <button class="secondary add-event" type="button">+ Add event</button>
      </div>
    </div>`;
}



function linkedItemsEditor(items, label, onChange){
  const holder=document.createElement('div');
  holder.className='linked-editor-block';

  const head=document.createElement('div');
  head.className='linked-editor-head';
  head.innerHTML=`<h4>${esc(label)}</h4>`;
  holder.appendChild(head);

  const rows=document.createElement('div');
  holder.appendChild(rows);

  function render(){
    rows.innerHTML='';
    items.forEach((item,ii)=>{
      const row=document.createElement('div');
      row.className='linked-editor-row';
      row.innerHTML=`
        <div class="field"><label>Name</label><input data-li="name" value="${esc(item.name||'')}"></div>
        <div class="field"><label>Short note</label><input data-li="note" value="${esc(item.note||'')}"></div>
        <div class="field"><label>Google Maps URL</label><input data-li="mapUrl" value="${esc(item.mapUrl||'')}"></div>
        <button type="button" class="secondary remove-linked">Remove</button>`;
      rows.appendChild(row);
      row.querySelectorAll('[data-li]').forEach(inp=>{
        inp.addEventListener('input',()=>{
          item[inp.dataset.li]=inp.value;
          onChange?.();
        });
      });
      row.querySelector('.remove-linked').onclick=()=>{
        items.splice(ii,1);
        render();
        onChange?.();
      };
    });
  }
  render();

  const add=document.createElement('button');
  add.type='button';
  add.className='secondary compact-add';
  add.textContent=`+ Add ${label==='What to do links'?'spot':'stay'}`;
  add.onclick=()=>{
    items.push({name:'',note:'',mapUrl:''});
    render();
    onChange?.();
  };
  holder.appendChild(add);
  return holder;
}

function placeEditorCard(place,title,onRemove){
  if(!Array.isArray(place.spots)) place.spots=[];
  if(!Array.isArray(place.stays)){
    place.stays=String(place.stays||'').split(/\n+/).filter(Boolean).map(x=>({name:x,note:'',mapUrl:''}));
  }

  const wrap=document.createElement('div');
  wrap.className='event-editor destination-editor-card';
  wrap.innerHTML=`
    <h3>${esc(title)}</h3>
    <div class="field"><label>Name</label><input data-place="name" value="${esc(place.name||'')}"></div>
    <div class="field"><label>Small label</label><input data-place="eyebrow" value="${esc(place.eyebrow||'')}"></div>
    ${place.hasOwnProperty('distance')?`<div class="field"><label>Travel time / distance</label><input data-place="distance" value="${esc(place.distance||'')}"></div>`:''}
    <div class="field"><label>History / context</label><textarea class="large-text" data-place="history">${esc(place.history||'')}</textarea></div>
    <div class="field"><label>What to do — introduction</label><textarea data-place="thingsIntro">${esc(place.thingsIntro||place.thingsToDo||'')}</textarea></div>
    <div class="linked-spots-slot"></div>
    <div class="linked-stays-slot"></div>
    <div class="field"><label>General Open in Maps URL</label><input data-place="mapUrl" value="${esc(place.mapUrl||'')}"></div>
    <button type="button" class="secondary remove-place-editor">Remove ${title.toLowerCase()}</button>
  `;
  wrap.querySelectorAll('[data-place]').forEach(el=>{
    el.addEventListener('input',()=>place[el.dataset.place]=el.value);
  });
  wrap.querySelector('.linked-spots-slot').appendChild(linkedItemsEditor(place.spots,'What to do links'));
  wrap.querySelector('.linked-stays-slot').appendChild(linkedItemsEditor(place.stays,'Where to stay links'));
  wrap.querySelector('.remove-place-editor').onclick=onRemove;
  return wrap;
}

function renderDestinationEditor(){
  const box=document.getElementById('destinationEditor');
  if(!box) return;
  if(!DATA.keralaBeyond) DATA.keralaBeyond={sectionTitle:'Within Kerala',sectionNote:'',destinations:[]};
  if(!Array.isArray(DATA.keralaBeyond.destinations)) DATA.keralaBeyond.destinations=[];

  box.innerHTML='';
  DATA.keralaBeyond.destinations.forEach((place,pi)=>{
    const card=placeEditorCard(place,`Destination ${pi+1}`,()=>{
      DATA.keralaBeyond.destinations.splice(pi,1);
      renderDestinationEditor();
    });
    box.appendChild(card);
  });
}

function renderJourneyEditor(){
  const box=document.getElementById('journeyEditor');
  if(!box) return;
  if(!DATA.beyond) DATA.beyond={sectionTitle:'Beyond Kerala',sectionNote:'',journeys:[]};
  if(!Array.isArray(DATA.beyond.journeys)) DATA.beyond.journeys=[];
  box.innerHTML='';

  DATA.beyond.journeys.forEach((journey,ji)=>{
    if(!Array.isArray(journey.landmarks)) journey.landmarks=[];
    const wrap=document.createElement('div');
    wrap.className='journey-editor-card';
    wrap.innerHTML=`
      <div class="journey-editor-title">
        <h3>Journey ${ji+1}</h3>
        <button type="button" class="secondary remove-journey">Remove journey</button>
      </div>
      <div class="field"><label>Journey name</label><input data-journey="name" value="${esc(journey.name||'')}"></div>
      <div class="field"><label>Small label</label><input data-journey="eyebrow" value="${esc(journey.eyebrow||'')}"></div>
      <div class="field"><label>Route line</label><input data-journey="route" value="${esc(journey.route||'')}"></div>
      <div class="field"><label>Recommended duration</label><input data-journey="recommendedDuration" value="${esc(journey.recommendedDuration||'')}"></div>
      <div class="field"><label>Possible duration</label><input data-journey="possibleDuration" value="${esc(journey.possibleDuration||'')}"></div>
      <div class="field"><label>Best for</label><input data-journey="bestFor" value="${esc(journey.bestFor||'')}"></div>
      <div class="field"><label>Route description</label><textarea class="large-text" data-journey="description">${esc(journey.description||'')}</textarea></div>
      <div class="field"><label>How to travel / rail notes</label><textarea class="large-text" data-journey="travelNotes">${esc(journey.travelNotes||'')}</textarea></div>
      <div class="field"><label>Return to Europe / departure advice</label><textarea data-journey="departure">${esc(journey.departure||'')}</textarea></div>
      <div class="subsection journey-landmark-editor">
        <h3>Landmark tiles inside this journey</h3>
        <div class="landmark-editor-list"></div>
        <button type="button" class="secondary add-landmark">+ Add landmark</button>
      </div>
    `;
    box.appendChild(wrap);

    wrap.querySelectorAll('[data-journey]').forEach(inp=>{
      inp.addEventListener('input',()=>journey[inp.dataset.journey]=inp.value);
    });
    wrap.querySelector('.remove-journey').onclick=()=>{
      DATA.beyond.journeys.splice(ji,1);
      renderJourneyEditor();
    };

    const list=wrap.querySelector('.landmark-editor-list');
    function renderLandmarks(){
      list.innerHTML='';
      journey.landmarks.forEach((place,li)=>{
        const card=placeEditorCard(place,`Landmark ${li+1}`,()=>{
          journey.landmarks.splice(li,1);
          renderLandmarks();
        });
        list.appendChild(card);
      });
    }
    renderLandmarks();
    wrap.querySelector('.add-landmark').onclick=()=>{
      journey.landmarks.push({
        name:'New landmark',eyebrow:'',history:'',thingsIntro:'',
        spots:[],stays:[],mapUrl:''
      });
      renderLandmarks();
    };
  });
}

function renderDays(){
  const box=document.getElementById('daysEditor');
  box.innerHTML='';
  DATA.threeDays.days.forEach((day,di)=>{
    const wrap=document.createElement('div');
    wrap.className='day-editor';
    wrap.dataset.dayIndex=di;
    wrap.innerHTML=dayUploadBlock(day);
    box.appendChild(wrap);

    wrap.querySelectorAll('[data-day-field]').forEach(el=>{
      el.addEventListener('input',()=>day[el.dataset.dayField]=el.value);
    });

    const eventsBox=wrap.querySelector('.events-editor');
    function renderEvents(){
      eventsBox.innerHTML='';
      day.events.forEach((ev,ei)=>{
        const row=document.createElement('div');
        row.className='event-editor';
        row.innerHTML=`
          <div class="field"><label>Time</label><input data-ev="time" value="${esc(ev.time||'')}"></div>
          <div class="field"><label>Title</label><input data-ev="title" value="${esc(ev.title||'')}"></div>
          <div class="field"><label>Subtitle</label><input data-ev="subtitle" value="${esc(ev.subtitle||'')}"></div>
          <div class="field"><label>Description</label><textarea data-ev="description">${esc(ev.description||'')}</textarea></div>
          <label class="check"><input type="checkbox" data-ev="hospitality" ${ev.hospitality?'checked':''}> Hospitality / meal</label>
          <button class="secondary remove-event" type="button">Remove event</button>`;
        eventsBox.appendChild(row);
        row.querySelectorAll('[data-ev]').forEach(inp=>{
          const key=inp.dataset.ev;
          const fn=()=>ev[key]=inp.type==='checkbox'?inp.checked:inp.value;
          inp.addEventListener('input',fn);
          inp.addEventListener('change',fn);
        });
        row.querySelector('.remove-event').onclick=()=>{day.events.splice(ei,1);renderEvents()};
      });
    }
    renderEvents();

    wrap.querySelector('.add-event').onclick=()=>{
      day.events.push({time:'',title:'',subtitle:'',description:'',hospitality:false});
      renderEvents();
    };
  });
  bindMediaInputs();
}

async function refreshMediaStatus(key){
  let item=null;
  try{item=await WeddingMediaDB.get(key)}catch(e){}
  const ms=document.querySelector(`[data-media-status="${CSS.escape(key)}"]`);
  const ss=document.querySelector(`[data-sub-status="${CSS.escape(key)}"]`);
  if(ms) ms.textContent=item?.videoName ? `Uploaded: ${item.videoName}` : 'No uploaded video';
  if(ss) ss.textContent=item?.subtitleName ? `Uploaded: ${item.subtitleName}` : 'No subtitles uploaded';
}

async function bindMediaInputs(){
  document.querySelectorAll('[data-video-upload]').forEach(inp=>{
    if(inp.dataset.bound)return;
    inp.dataset.bound='1';
    inp.addEventListener('change',async()=>{
      const file=inp.files?.[0]; if(!file)return;
      const key=inp.dataset.videoUpload;
      const old=await WeddingMediaDB.get(key)||{};
      old.videoBlob=file;
      old.videoName=file.name;
      await WeddingMediaDB.set(key,old);
      await refreshMediaStatus(key);
    });
  });

  document.querySelectorAll('[data-subtitle-upload]').forEach(inp=>{
    if(inp.dataset.bound)return;
    inp.dataset.bound='1';
    inp.addEventListener('change',async()=>{
      const file=inp.files?.[0]; if(!file)return;
      const key=inp.dataset.subtitleUpload;
      const old=await WeddingMediaDB.get(key)||{};
      old.subtitleBlob=await WeddingMediaDB.subtitleFileToVttBlob(file);
      old.subtitleName=file.name;
      await WeddingMediaDB.set(key,old);
      await refreshMediaStatus(key);
    });
  });

  document.querySelectorAll('[data-clear-media]').forEach(btn=>{
    if(btn.dataset.bound)return;
    btn.dataset.bound='1';
    btn.addEventListener('click',async()=>{
      const key=btn.dataset.clearMedia;
      await WeddingMediaDB.remove(key);
      await refreshMediaStatus(key);
    });
  });

  const keys=[
    'home-note','home-short',
    'page-story','page-venue','page-kerala','page-care','page-cabinet',
    ...DATA.threeDays.days.map(d=>'day-'+d.id)
  ];
  keys.forEach(refreshMediaStatus);
}

function ensureRitualOrder(){
  if(!DATA.ritualsInfo) DATA.ritualsInfo={};
  if(!DATA.ritualsInfo.right) DATA.ritualsInfo.right={};
  const right=DATA.ritualsInfo.right;
  if(!right.rituals || typeof right.rituals!=='object') right.rituals={};
  const preferred=['varapuja','kanyadana','panigrahana','agniParikrama','saptapadi','lajaHoma','ashmarohana'];
  if(!Array.isArray(right.ritualOrder)) right.ritualOrder=[];
  // Preserve existing content and establish an order without deleting anything.
  preferred.forEach(k=>{if(right.rituals[k] && !right.ritualOrder.includes(k)) right.ritualOrder.push(k)});
  Object.keys(right.rituals).forEach(k=>{if(!right.ritualOrder.includes(k)) right.ritualOrder.push(k)});
  right.ritualOrder=right.ritualOrder.filter((k,i,a)=>right.rituals[k] && a.indexOf(k)===i);
}
function ritualEditorCard(key,item,index,total){
  const card=document.createElement('div'); card.className='event-editor ritual-editor-card';
  const isSap=key==='saptapadi';
  card.innerHTML=`<div class="ritual-editor-head"><h3>${esc(item.title||'Untitled ritual')}</h3><div class="ritual-order-actions"><button type="button" class="secondary ritual-up" ${index===0?'disabled':''}>↑ Move Up</button><button type="button" class="secondary ritual-down" ${index===total-1?'disabled':''}>↓ Move Down</button><button type="button" class="secondary ritual-delete">Delete</button></div></div>
    <div class="field"><label>Ritual title</label><input data-rf="title" value="${esc(item.title||'')}"></div>
    <div class="field"><label>Short line</label><input data-rf="subtitle" value="${esc(item.subtitle||'')}"></div>
    ${isSap?`<div class="field"><label>Expanded introduction</label><textarea data-rf="intro">${esc(item.intro||'')}</textarea></div><div class="saptapadi-editor-steps"></div>`:`<div class="field"><label>Expanded text</label><textarea class="large-text" data-rf="body">${esc(item.body||'')}</textarea></div>`}
    <div class="field"><label>Source / note</label><textarea data-rf="source">${esc(item.source||'')}</textarea></div>`;
  card.querySelectorAll('[data-rf]').forEach(el=>el.addEventListener('input',()=>{item[el.dataset.rf]=el.value;if(el.dataset.rf==='title')card.querySelector('h3').textContent=el.value||'Untitled ritual'}));
  if(isSap){
    const box=card.querySelector('.saptapadi-editor-steps'); const steps=item.steps||{}; item.steps=steps;
    for(let i=1;i<=7;i++){const sk='step'+i; if(!steps[sk])steps[sk]={sanskrit:'',meaning:''}; const st=steps[sk]; const d=document.createElement('div');d.className='subsection';d.innerHTML=`<h3>Step ${i}</h3><div class="field"><label>Sanskrit</label><textarea data-sf="sanskrit">${esc(st.sanskrit||'')}</textarea></div><div class="field"><label>Meaning / interpretation</label><textarea data-sf="meaning">${esc(st.meaning||'')}</textarea></div>`;d.querySelectorAll('[data-sf]').forEach(el=>el.addEventListener('input',()=>st[el.dataset.sf]=el.value));box.appendChild(d)}
  }
  card.querySelector('.ritual-up').onclick=()=>{const a=DATA.ritualsInfo.right.ritualOrder;[a[index-1],a[index]]=[a[index],a[index-1]];renderRitualOrderEditor()};
  card.querySelector('.ritual-down').onclick=()=>{const a=DATA.ritualsInfo.right.ritualOrder;[a[index+1],a[index]]=[a[index],a[index+1]];renderRitualOrderEditor()};
  card.querySelector('.ritual-delete').onclick=()=>{if(!confirm(`Delete “${item.title||'this ritual'}” from the Wedding Ritual list?`))return;delete DATA.ritualsInfo.right.rituals[key];DATA.ritualsInfo.right.ritualOrder.splice(index,1);renderRitualOrderEditor()};
  return card;
}
function renderRitualOrderEditor(){
  const box=document.getElementById('ritualOrderEditor'); if(!box)return; ensureRitualOrder(); box.innerHTML='';
  const right=DATA.ritualsInfo.right, order=right.ritualOrder;
  order.forEach((key,i)=>box.appendChild(ritualEditorCard(key,right.rituals[key],i,order.length)));
}
function addRitual(){
  ensureRitualOrder(); const right=DATA.ritualsInfo.right;
  let n=1,key='custom'+Date.now(); while(right.rituals[key])key='custom'+Date.now()+(n++);
  right.rituals[key]={title:'New Ritual',subtitle:'',body:'',source:''}; right.ritualOrder.push(key); renderRitualOrderEditor();
  document.getElementById('ritualOrderEditor')?.lastElementChild?.scrollIntoView({behavior:'smooth',block:'center'});
}

function saveDraft(){
  localStorage.setItem('weddingCreatorDraft',JSON.stringify(DATA));
  const btn=document.getElementById('saveLocal');
  const old=btn.textContent;
  btn.textContent='Saved';
  setTimeout(()=>btn.textContent=old,1000);
}

function downloadJson(){
  const blob=new Blob([JSON.stringify(DATA,null,2)],{type:'application/json'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='content.json';
  a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}

function tabs(){
  document.querySelectorAll('.creator-tab').forEach(btn=>{
    btn.onclick=()=>{
      document.querySelectorAll('.creator-tab').forEach(x=>x.classList.remove('active'));
      document.querySelectorAll('.creator-panel').forEach(x=>x.classList.remove('active'));
      btn.classList.add('active');
      document.querySelector(`[data-panel-view="${btn.dataset.panel}"]`)?.classList.add('active');
    };
  });
}

async function initEditor(){
  DATA=await loadData();
  fillStaticFields();
  renderNav();
  renderDestinationEditor();
  renderJourneyEditor();
  renderDays();
  renderRitualOrderEditor();
  bindMediaInputs();
  tabs();

  const addRitualBtn=document.getElementById('addRitual');
  if(addRitualBtn) addRitualBtn.onclick=addRitual;

  const addDestination=document.getElementById('addDestination');
  if(addDestination) addDestination.onclick=()=>{
    if(!DATA.keralaBeyond) DATA.keralaBeyond={sectionTitle:'Within Kerala',sectionNote:'',destinations:[]};
    DATA.keralaBeyond.destinations.push({
      name:'New place',eyebrow:'',distance:'',history:'',thingsIntro:'',
      spots:[],stays:[],mapUrl:''
    });
    renderDestinationEditor();
  };

  const addJourney=document.getElementById('addJourney');
  if(addJourney) addJourney.onclick=()=>{
    if(!DATA.beyond) DATA.beyond={sectionTitle:'Beyond Kerala',sectionNote:'',journeys:[]};
    DATA.beyond.journeys.push({
      name:'New journey',eyebrow:'',route:'',recommendedDuration:'',
      possibleDuration:'',bestFor:'',description:'',travelNotes:'',departure:'',
      landmarks:[]
    });
    renderJourneyEditor();
  };

  document.getElementById('saveLocal').onclick=saveDraft;
  document.getElementById('downloadJson').onclick=downloadJson;
  document.getElementById('resetDraft').onclick=async()=>{
    if(!confirm('Reset all Creator text edits back to content.json? Uploaded videos/subtitles will remain unless you remove them from their page editor.'))return;
    localStorage.removeItem('weddingCreatorDraft');
    location.reload();
  };
  document.getElementById('refreshPreview').onclick=()=>{
    saveDraft();
    document.getElementById('previewFrame').src='index.html?v=18beyond&t='+Date.now();
  };
}

document.getElementById('unlock').onclick=async()=>{
  if(document.getElementById('password').value!==PASSWORD){
    document.getElementById('lockMsg').textContent='Incorrect password.';
    return;
  }
  document.getElementById('lock').hidden=true;
  document.getElementById('editor').hidden=false;
  await initEditor();
};
document.getElementById('password').addEventListener('keydown',e=>{
  if(e.key==='Enter') document.getElementById('unlock').click();
});
