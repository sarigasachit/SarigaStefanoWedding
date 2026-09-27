let CONTENT=null;
let activeDayIndex=0;

async function loadContent(){
  const draft=localStorage.getItem('weddingCreatorDraft');
  if(draft){try{CONTENT=JSON.parse(draft);render();return}catch(e){}}
  try{
    const r=await fetch('content.json?ts='+Date.now());
    CONTENT=await r.json(); render();
  }catch(e){
    document.body.innerHTML='<div style="padding:40px;color:#efe2cd;background:#17120d;min-height:100vh;font-family:Georgia,serif"><h2>Open the website using START_WEBSITE.bat</h2></div>';
  }
}
function esc(s=''){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function pauseAllVideos(){
  document.querySelectorAll('video').forEach(v=>{try{v.pause()}catch(e){}})
}
function playVisibleVideos(id){
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  if(id==='days'){
    const v=document.querySelector('.days-backgrounds video.active'); if(v) v.play().catch(()=>{});
  }else{
    const page=document.getElementById(id); const v=page?.querySelector('.living-media video'); if(v) v.play().catch(()=>{});
  }
}
function show(id){
  pauseAllVideos();
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  const p=document.getElementById(id); if(!p)return;
  p.classList.add('active');
  document.body.classList.toggle('intro-mode',id==='intro');
  document.body.classList.toggle('home-mode',id==='home');
  if(id==='home')requestAnimationFrame(positionHomeInteractions);
  if(id==='days')requestAnimationFrame(()=>{renderDay(activeDayIndex);playVisibleVideos('days')});
  else requestAnimationFrame(async()=>{
    if(['story','venue','care','cabinet'].includes(id)){
      const target=document.querySelector(`[data-feature-media="${id}"]`);
      const meta=CONTENT?.pages?.[id]||{};
      const poster=CONTENT?.pageMedia?.[id]?.poster||'';
      await buildFeaturePlayer(`page-${id}`,meta,target,poster);
    }
    playVisibleVideos(id);
  });
}
function bind(){
  document.querySelectorAll('[data-go]').forEach(el=>el.onclick=e=>{e.preventDefault();show(el.dataset.go)});
}
async function render(){
  const c=CONTENT;
  document.querySelector('[data-intro-quote]').textContent=c.intro.quote;
  document.querySelector('[data-grab]').textContent=c.intro.grab;
  document.querySelector('[data-intro-note]').textContent=c.intro.note;
  const n=document.querySelector('nav'); n.innerHTML='';
  c.nav.forEach(x=>{const a=document.createElement('a');a.href='#'+x.id;a.dataset.go=x.id;a.textContent=x.label;n.appendChild(a)});
  for(const [id,p] of Object.entries(c.pages||{})){
    const sec=document.getElementById(id); if(!sec)continue;
    const h=sec.querySelector('h1'); if(h)h.textContent=p.title||'';
    const k=sec.querySelector('.chapter-kicker'); if(k)k.textContent=p.kicker||'';
    const body=sec.querySelector('.body-copy')||sec.querySelector('.living-copy>p'); if(body)body.textContent=p.body||'';
    const note=sec.querySelector('.coming-note'); if(note)note.textContent='';
    const media=c.pageMedia?.[id];
    if(media && id!=='rituals'){
      const lm=sec.querySelector('.living-media');
      if(lm)lm.innerHTML=`<video muted loop playsinline preload="metadata" poster="${esc(media.poster)}"><source src="${esc(media.video)}" type="video/mp4"></video>`;
    }
  }
  renderLoveResponse(); renderCredits();
  renderThreeDays(); await renderUploadedPageMedia(); await renderRituals(); renderKeralaDestinations(); renderGuestCare(); renderVenueLinks();
  document.querySelectorAll('.interior-footer').forEach(el=>el.textContent=c.site?.footer||''); bind();
}
function renderHomeCards(){
  const layer=document.querySelector('.home-card-overlays');
  if(!layer)return;
  layer.innerHTML='';
  const cards=CONTENT.homeCards||[];
  cards.forEach((card,i)=>{
    const d=document.createElement('div');
    d.className='home-card-copy';
    d.dataset.cardIndex=i;
    d.innerHTML=`<span class="home-card-number">${esc(card.number||String(i+1).padStart(2,'0'))}</span>
      <span class="home-card-title">${esc(card.title||'')}</span>
      <span class="home-card-subtitle">${esc(card.subtitle||'')}</span>
      <span class="home-card-rule"></span>`;
    layer.appendChild(d);

    const hit=document.querySelector(`.home-card-hit[data-card-index="${i}"]`);
    if(hit){
      hit.dataset.go=card.id;
      hit.setAttribute('aria-label',card.title||card.id);
    }
  });
  requestAnimationFrame(positionHomeInteractions);
}

function renderThreeDays(){
  const t=CONTENT.threeDays;
  document.querySelector('[data-days-title]').textContent=t.title;
  document.querySelector('[data-days-intro]').textContent=t.intro;
  const tabs=document.querySelector('.day-tabs'); tabs.innerHTML='';
  const bg=document.querySelector('.days-backgrounds'); bg.innerHTML='';
  t.days.forEach((day,i)=>{
    const b=document.createElement('button'); b.className='day-tab'+(i===activeDayIndex?' active':''); b.type='button'; b.role='tab'; b.textContent=day.tab;
    b.setAttribute('aria-selected',i===activeDayIndex?'true':'false');
    b.onclick=()=>switchDay(i); tabs.appendChild(b);
    const v=document.createElement('video');
    v.muted=true;v.loop=true;v.playsInline=true;v.preload='metadata';v.poster=day.poster||'';
    v.innerHTML=`<source src="${esc(day.video)}" type="video/mp4">`;
    if(i===activeDayIndex)v.classList.add('active');bg.appendChild(v);
  });
  renderDay(activeDayIndex);
}
function switchDay(i){
  activeDayIndex=i;
  pauseAllVideos();
  document.querySelectorAll('.day-tab').forEach((b,j)=>{b.classList.toggle('active',j===i);b.setAttribute('aria-selected',j===i?'true':'false')});
  document.querySelectorAll('.days-backgrounds video').forEach((v,j)=>v.classList.toggle('active',j===i));
  renderDay(i); playVisibleVideos('days');
}
function renderDay(i){
  const day=CONTENT.threeDays.days[i]; if(!day)return;
  const panel=document.querySelector('.day-panel');
  panel.innerHTML=`<div class="day-heading"><h2>${esc(day.date)}</h2><div class="day-theme">${esc(day.theme||'')}</div></div>`;
  day.events.forEach((it,idx)=>{
    const row=document.createElement('div'); row.className='event-row'+(it.hospitality?' hospitality':'');
    row.innerHTML=`<button class="event-trigger" type="button" aria-expanded="false">
      <div class="event-time">${esc(it.time)}</div>
      <div><span class="event-title">${esc(it.title)}</span><span class="event-subtitle">${esc(it.subtitle||'')}</span></div>
      <span class="event-plus" aria-hidden="true">+</span>
    </button><div class="event-description">${esc(it.description||'')}</div>`;
    const btn=row.querySelector('.event-trigger');
    btn.onclick=()=>{const open=row.classList.toggle('open');btn.setAttribute('aria-expanded',open?'true':'false')};
    panel.appendChild(row);
  });
  renderUploadedDayMedia(day);
}

/* protected painted apple */
const apple=document.querySelector('.apple');let down=false,sx=0,sy=0,bx=0,by=0;
apple.addEventListener('pointerdown',e=>{down=true;sx=e.clientX;sy=e.clientY;const r=apple.getBoundingClientRect();bx=r.left;by=r.top;apple.classList.add('dragging');apple.setPointerCapture(e.pointerId)});
apple.addEventListener('pointermove',e=>{if(!down)return;apple.style.left=(bx+(e.clientX-sx)+apple.offsetWidth/2)+'px';apple.style.top=(by+(e.clientY-sy))+'px';apple.style.transform='translateX(-50%)'});
apple.addEventListener('pointerup',e=>{if(!down)return;down=false;apple.classList.remove('dragging');apple.removeAttribute('style');show('home')});
apple.addEventListener('click',()=>show('home'));

/* UPDATE 9 — exact click map for locked 1586 × 992 homepage PNG */
const HOME_W=1536, HOME_H=992, homeImg=document.querySelector('.home-bg');
const HOME_NAV_BOXES=[
 {x:790,y:0,w:58,h:49},{x:850,y:0,w:78,h:49},{x:930,y:0,w:105,h:49},{x:1036,y:0,w:120,h:49},{x:1157,y:0,w:164,h:49},{x:1320,y:0,w:104,h:49},{x:1424,y:0,w:110,h:49}
];
const HOME_BRAND_BOX={x:70,y:0,w:135,h:49};
const HOME_CARD_BOXES=[
 {x:300,y:650,w:154,h:205},{x:458,y:650,w:154,h:205},{x:616,y:650,w:154,h:205},{x:774,y:650,w:154,h:205},{x:932,y:650,w:154,h:205},{x:1090,y:650,w:154,h:205}
];
const HOME_MEDIA_BOXES={note:{x:25,y:385,w:205,h:410},short:{x:1320,y:680,w:180,h:135}};
const HOME_CREDITS_BOX={x:1400,y:865,w:120,h:65};

function nativeHomeTransform(){
  /* Map the transparent hit areas to the ACTUAL rendered homepage image.
     The approved artwork is 1586 px wide, while the historical click-map
     coordinates were authored on a 1536 × 992 reference.  Using separate
     X/Y scales keeps every word/card aligned on phones as well as desktop. */
  const rect=homeImg?.getBoundingClientRect();
  if(rect && rect.width && rect.height){
    return {
      scaleX:rect.width/HOME_W,
      scaleY:rect.height/HOME_H,
      ox:rect.left + window.scrollX,
      oy:rect.top + window.scrollY
    };
  }
  const cw=window.innerWidth, ch=window.innerHeight;
  const scale=Math.min(cw/HOME_W,ch/HOME_H);
  return {scaleX:scale,scaleY:scale,ox:(cw-HOME_W*scale)/2,oy:(ch-HOME_H*scale)/2};
}
function placeNative(el,b){
  if(!el||!b)return;
  const {scaleX,scaleY,ox,oy}=nativeHomeTransform();
  Object.assign(el.style,{
    left:(ox+b.x*scaleX)+'px',
    top:(oy+b.y*scaleY)+'px',
    width:(b.w*scaleX)+'px',
    height:(b.h*scaleY)+'px'
  });
}
function positionHomeInteractions(){
  const home=document.getElementById('home');
  if(!homeImg||!home?.classList.contains('active'))return;

  placeNative(document.querySelector('.home-brand-hit'),HOME_BRAND_BOX);
document.querySelectorAll('.home-nav-hit').forEach((el,i)=>{
    placeNative(el,HOME_NAV_BOXES[i]);
  });

  document.querySelectorAll('.home-card-hit').forEach((el,i)=>{
    placeNative(el,HOME_CARD_BOXES[i]);
  });

  placeNative(document.querySelector('[data-home-role="note"]'),HOME_MEDIA_BOXES.note);
  placeNative(document.querySelector('[data-home-role="short"]'),HOME_MEDIA_BOXES.short);
  placeNative(document.querySelector('.credits-hit'),HOME_CREDITS_BOX);

  if(window.innerWidth < 700 && window.innerHeight > window.innerWidth && !home.dataset.mobileCentered){
    requestAnimationFrame(()=>{
      home.scrollLeft=Math.max(0,(home.scrollWidth-home.clientWidth)/2);
      home.dataset.mobileCentered='1';
    });
  }
}
window.addEventListener('resize',positionHomeInteractions);
homeImg?.addEventListener('load',positionHomeInteractions);



/* ============================================================
   V7.3 — Kerala & Beyond
   ============================================================ */
function buildLinkedList(items){
  const wrap=document.createElement('div');
  (items||[]).forEach(item=>{
    const row=document.createElement(item.mapUrl?'a':'div');
    row.className='linked-place-item';
    if(item.mapUrl){
      row.href=item.mapUrl;
      row.target='_blank';
      row.rel='noopener noreferrer';
    }
    const name=document.createElement('strong');
    name.textContent=item.name||'';
    const note=document.createElement('span');
    note.textContent=item.note||'';
    row.append(name,note);
    if(item.mapUrl){
      const arrow=document.createElement('em');
      arrow.textContent='↗';
      row.appendChild(arrow);
    }
    wrap.appendChild(row);
  });
  return wrap;
}

function placeTile(place,index,type='kerala'){
  const b=document.createElement('button');
  b.type='button';
  b.className='destination-tile';
  b.innerHTML=`
    <span class="destination-eyebrow"></span>
    <strong></strong>
    <span class="destination-distance"></span>
    <span class="destination-open">Open the place <span aria-hidden="true">↗</span></span>`;
  b.querySelector('.destination-eyebrow').textContent=place.eyebrow||'';
  b.querySelector('strong').textContent=place.name||'';
  b.querySelector('.destination-distance').textContent=place.distance||'';
  if(type==='kerala') b.addEventListener('click',()=>openTravelPlace(index));
  return b;
}

function renderKeralaDestinations(){
  const cfg=CONTENT?.keralaBeyond||{};
  const grid=document.getElementById('destinationGrid');
  if(!grid) return;

  const title=document.getElementById('destinationSectionTitle');
  const note=document.getElementById('destinationSectionNote');
  if(title) title.textContent=cfg.sectionTitle||'Within Kerala';
  if(note) note.textContent=cfg.sectionNote||'';

  grid.innerHTML='';
  (cfg.destinations||[]).forEach((place,index)=>{
    grid.appendChild(placeTile(place,index,'kerala'));
  });

  renderBeyondJourneys();
}

function fillPlaceModal(place,prefix){
  document.getElementById(prefix+'Eyebrow').textContent=place.eyebrow||'';
  document.getElementById(prefix+'Title').textContent=place.name||'';
  const hist=document.getElementById(prefix+'History');
  if(hist) hist.textContent=place.history||'';
  const intro=document.getElementById(prefix==='travel'?'travelDo':'landmarkDoIntro');
  if(intro) intro.textContent=place.thingsIntro||place.thingsToDo||'';

  const spots=document.getElementById(prefix+'Spots');
  if(spots){
    spots.innerHTML='';
    spots.appendChild(buildLinkedList(place.spots||[]));
  }
  const stays=document.getElementById(prefix==='travel'?'travelStay':'landmarkStays');
  if(stays){
    stays.innerHTML='';
    const items=Array.isArray(place.stays)
      ? place.stays
      : String(place.stays||'').split(/\n+/).filter(Boolean).map(x=>({name:x,note:'',mapUrl:''}));
    stays.appendChild(buildLinkedList(items));
  }
  const map=document.getElementById(prefix+'MapLink');
  if(map){
    if(place.mapUrl){
      map.href=place.mapUrl;
      map.style.display='inline-flex';
    }else{
      map.removeAttribute('href');
      map.style.display='none';
    }
  }
}

function openTravelPlace(index){
  const place=CONTENT?.keralaBeyond?.destinations?.[index];
  if(!place) return;

  document.getElementById('travelEyebrow').textContent=place.eyebrow||'Kerala';
  document.getElementById('travelTitle').textContent=place.name||'';
  document.getElementById('travelDistance').textContent=place.distance||'';
  document.getElementById('travelHistory').textContent=place.history||'';
  document.getElementById('travelDo').textContent=place.thingsIntro||place.thingsToDo||'';

  const spots=document.getElementById('travelSpots');
  if(spots){ spots.innerHTML=''; spots.appendChild(buildLinkedList(place.spots||[])); }

  const stay=document.getElementById('travelStay');
  stay.innerHTML='';
  const stayItems=Array.isArray(place.stays)
    ? place.stays
    : String(place.stays||'').split(/\n+/).filter(Boolean).map(x=>({name:x,note:'',mapUrl:''}));
  stay.appendChild(buildLinkedList(stayItems));

  const map=document.getElementById('travelMapLink');
  if(place.mapUrl){
    map.href=place.mapUrl;
    map.style.display='inline-flex';
  }else{
    map.removeAttribute('href');
    map.style.display='none';
  }

  const modal=document.getElementById('travelModal');
  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');
}

function closeTravel(){
  const modal=document.getElementById('travelModal');
  modal?.classList.remove('open');
  modal?.setAttribute('aria-hidden','true');
}
document.getElementById('travelClose')?.addEventListener('click',closeTravel);
document.getElementById('travelModal')?.addEventListener('click',e=>{
  if(e.target===e.currentTarget) closeTravel();
});

/* Beyond — four route cards */
let ACTIVE_JOURNEY_INDEX=null;

function renderBeyondJourneys(){
  const cfg=CONTENT?.beyond||{};
  const title=document.getElementById('beyondSectionTitle');
  const note=document.getElementById('beyondSectionNote');
  const grid=document.getElementById('journeyGrid');
  if(title) title.textContent=cfg.sectionTitle||'Beyond Kerala';
  if(note) note.textContent=cfg.sectionNote||'';
  if(!grid) return;
  grid.innerHTML='';

  (cfg.journeys||[]).forEach((journey,index)=>{
    const b=document.createElement('button');
    b.type='button';
    b.className='journey-tile';
    b.innerHTML=`
      <span class="destination-eyebrow"></span>
      <strong></strong>
      <span class="journey-route-mini"></span>
      <span class="journey-duration-mini"></span>
      <span class="destination-open">Open the journey <span aria-hidden="true">↗</span></span>`;
    b.querySelector('.destination-eyebrow').textContent=journey.eyebrow||'';
    b.querySelector('strong').textContent=journey.name||'';
    b.querySelector('.journey-route-mini').textContent=journey.route||'';
    b.querySelector('.journey-duration-mini').textContent=journey.recommendedDuration||'';
    b.addEventListener('click',()=>openJourney(index));
    grid.appendChild(b);
  });
}

function shortDuration(text,prefix){
  return String(text||'').replace(new RegExp('\\s*'+prefix+'\\s*$','i'),'').trim();
}

function openJourney(index){
  const journey=CONTENT?.beyond?.journeys?.[index];
  if(!journey) return;
  ACTIVE_JOURNEY_INDEX=index;

  document.getElementById('journeyEyebrow').textContent=journey.eyebrow||'Beyond Kerala';
  document.getElementById('journeyTitle').textContent=journey.name||'';
  document.getElementById('journeyRoute').textContent=journey.route||'';
  document.getElementById('journeyRecommended').textContent=shortDuration(journey.recommendedDuration,'recommended');
  document.getElementById('journeyPossible').textContent=shortDuration(journey.possibleDuration,'possible');
  document.getElementById('journeyBestFor').textContent=journey.bestFor||'';
  document.getElementById('journeyDescription').textContent=journey.description||'';
  document.getElementById('journeyTravel').textContent=journey.travelNotes||'';
  document.getElementById('journeyDeparture').textContent=journey.departure||'';

  const grid=document.getElementById('journeyLandmarkGrid');
  grid.innerHTML='';
  (journey.landmarks||[]).forEach((place,li)=>{
    const b=placeTile(place,li,'journey');
    b.classList.add('journey-landmark-tile');
    b.querySelector('.destination-distance').textContent='';
    b.addEventListener('click',()=>openJourneyLandmark(index,li));
    grid.appendChild(b);
  });

  const modal=document.getElementById('journeyModal');
  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');
}

function closeJourney(){
  closeLandmark();
  const modal=document.getElementById('journeyModal');
  modal?.classList.remove('open');
  modal?.setAttribute('aria-hidden','true');
  ACTIVE_JOURNEY_INDEX=null;
}
document.getElementById('journeyClose')?.addEventListener('click',closeJourney);
document.getElementById('journeyModal')?.addEventListener('click',e=>{
  if(e.target===e.currentTarget) closeJourney();
});

function openJourneyLandmark(ji,li){
  const place=CONTENT?.beyond?.journeys?.[ji]?.landmarks?.[li];
  if(!place) return;

  document.getElementById('landmarkEyebrow').textContent=place.eyebrow||'Along the journey';
  document.getElementById('landmarkTitle').textContent=place.name||'';
  document.getElementById('landmarkHistory').textContent=place.history||'';
  document.getElementById('landmarkDoIntro').textContent=place.thingsIntro||'';

  const spots=document.getElementById('landmarkSpots');
  spots.innerHTML='';
  spots.appendChild(buildLinkedList(place.spots||[]));

  const stays=document.getElementById('landmarkStays');
  stays.innerHTML='';
  stays.appendChild(buildLinkedList(place.stays||[]));

  const map=document.getElementById('landmarkMapLink');
  if(place.mapUrl){
    map.href=place.mapUrl;
    map.style.display='inline-flex';
  }else{
    map.removeAttribute('href');
    map.style.display='none';
  }

  const modal=document.getElementById('landmarkModal');
  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');
}

function closeLandmark(){
  const modal=document.getElementById('landmarkModal');
  modal?.classList.remove('open');
  modal?.setAttribute('aria-hidden','true');
}
document.getElementById('landmarkClose')?.addEventListener('click',closeLandmark);
document.getElementById('landmarkModal')?.addEventListener('click',e=>{
  if(e.target===e.currentTarget) closeLandmark();
});

window.addEventListener('keydown',e=>{
  if(e.key!=='Escape') return;
  if(document.getElementById('landmarkModal')?.classList.contains('open')) closeLandmark();
  else if(document.getElementById('journeyModal')?.classList.contains('open')) closeJourney();
  else closeTravel();
});

/* ============================================================
   V7.2 — Guest Care / questionnaire
   ============================================================ */
function safeExternalLink(label,url,cls='care-link'){
  if(!url) return null;
  const a=document.createElement('a');
  a.className=cls;
  a.href=url;
  a.target='_blank';
  a.rel='noopener noreferrer';
  a.textContent=label||url;
  return a;
}

function renderGuestCare(){
  const cfg=CONTENT?.guestCare||{}, hub=document.getElementById('guestCareHub'); if(!hub)return; hub.innerHTML='';
  const make=(title,text,linkLabel,url)=>{const x=document.createElement('section');x.className='reception-box';const h=document.createElement('h3');h.textContent=title||'';const p=document.createElement('p');p.textContent=text||'';x.append(h,p);if(url){const a=safeExternalLink(linkLabel,url,'care-primary-link');if(a)x.appendChild(a)}return x};
  hub.appendChild(make(cfg.journeyTitle||'Journey organization',cfg.journeyText||'',cfg.formButtonLabel||'Open journey form',cfg.formUrl));
  hub.appendChild(make(cfg.visaTitle||'Visa',cfg.visaText||'',cfg.visaButtonLabel||'Official India Visa Information',cfg.visaUrl));
}
/* Creator-uploaded foreground videos + subtitles.
   Same IndexedDB technique as the working V7.3 baseline. */
const FEATURE_OBJECT_URLS=[];

function clearFeatureObjectUrls(){
  while(FEATURE_OBJECT_URLS.length){
    try{URL.revokeObjectURL(FEATURE_OBJECT_URLS.pop())}catch(e){}
  }
}

function linkifyReference(text,url){
  const wrap=document.createElement('div');
  wrap.className='feature-reference';
  if(text){
    const span=document.createElement('span');
    span.textContent=text;
    wrap.appendChild(span);
  }
  if(url){
    const a=document.createElement('a');
    a.href=url;
    a.target='_blank';
    a.rel='noopener noreferrer';
    a.textContent=text ? 'Source' : url;
    wrap.appendChild(a);
  }
  return wrap;
}

/* Published foreground films on GitHub Pages. Localhost keeps using Creator/IndexedDB. */
const PUBLISHED_PAGE_MEDIA={
  'page-story': {
    video: 'Artvideos/sovietMermaid.mp4'
  },
  'page-venue': {
    video: 'Artvideos/Легенда! Говорящие руки Траванкора (1981) со Смоктуновским.mp4',
    subtitle: 'Artvideos/The_Speaking_Hands_of_Travancore_1981_English.vtt'
  },
  'page-cabinet': {
    video: 'Artvideos/Excerpt from Hans Christian Andersens The Wild Swans directed by Bernard Evslin (1962)%23sovietun.mp4'
  }
};

const PUBLISHED_HOME_MEDIA={
  note: 'Artvideos/Everything has a purpose (The Fool - Gelsomina).mp4',
  short: 'Artvideos/Sabin Balasa -The Galaxy (1973).mp4'
};

function usePublishedMedia(){
  return location.hostname.toLowerCase().endsWith('github.io');
}

async function buildFeaturePlayer(key, meta, target, poster=''){
  if(!target) return;
  target.innerHTML='';

  const published=usePublishedMedia() ? PUBLISHED_PAGE_MEDIA[key] : null;
  let saved=null;
  if(!published){
    try{ saved=await WeddingMediaDB.get(key); }catch(e){}
  }
  if(!published && !saved?.videoBlob) return;

  const figure=document.createElement('figure');
  figure.className='feature-film';

  const video=document.createElement('video');
  video.controls=true;
  video.playsInline=true;
  video.preload=published ? 'auto' : 'metadata';
  if(poster) video.poster=poster;

  if(published){
    video.src=published.video;
  }else{
    const vurl=URL.createObjectURL(saved.videoBlob);
    FEATURE_OBJECT_URLS.push(vurl);
    video.src=vurl;
  }

  if(published?.subtitle){
    const track=document.createElement('track');
    track.kind='subtitles';
    track.srclang='en';
    track.label='English';
    track.default=true;
    track.src=published.subtitle;
    video.appendChild(track);
  }else if(saved?.subtitleBlob){
    const track=document.createElement('track');
    track.kind='subtitles';
    track.srclang='en';
    track.label='English';
    track.default=true;
    const turl=URL.createObjectURL(saved.subtitleBlob);
    FEATURE_OBJECT_URLS.push(turl);
    track.src=turl;
    video.appendChild(track);
  }

  figure.appendChild(video);

  if(meta?.mediaTitle){
    const cap=document.createElement('figcaption');
    cap.className='feature-caption';
    cap.textContent=meta.mediaTitle;
    figure.appendChild(cap);
  }

  if(meta?.mediaReference || meta?.mediaReferenceUrl){
    figure.appendChild(linkifyReference(meta.mediaReference||'',meta.mediaReferenceUrl||''));
  }

  target.appendChild(figure);
}

async function renderUploadedPageMedia(){
  clearFeatureObjectUrls();
  if(!CONTENT) return;
  for(const id of ['story','venue','kerala','care','cabinet']){
    const target=document.querySelector(`[data-feature-media="${id}"]`);
    const meta=CONTENT.pages?.[id]||{};
    const poster=CONTENT.pageMedia?.[id]?.poster||'';
    await buildFeaturePlayer(`page-${id}`,meta,target,poster);
  }
  await renderRituals();
}

async function renderUploadedDayMedia(day){
  const panel=document.querySelector('.day-panel');
  if(!panel||!day)return;
  let holder=panel.querySelector('.day-feature-media');
  if(!holder){
    holder=document.createElement('div');
    holder.className='day-feature-media';
    const heading=panel.querySelector('.day-heading');
    if(heading) heading.insertAdjacentElement('afterend',holder);
    else panel.prepend(holder);
  }
  await buildFeaturePlayer(`day-${day.id}`,day,holder,day.poster||'');
}

/* Homepage films — local Creator uploads from IndexedDB */
const filmModal=document.getElementById('filmModal');
const filmTitle=document.getElementById('filmTitle');
const filmKicker=document.getElementById('filmKicker');
const filmMessage=document.getElementById('filmMessage');
const filmPlayer=document.getElementById('filmPlayer');
const filmReference=document.getElementById('filmReference');
let HOME_FILM_URLS=[];

function clearHomeFilmUrls(){
  HOME_FILM_URLS.forEach(u=>{try{URL.revokeObjectURL(u)}catch(e){}});
  HOME_FILM_URLS=[];
}

async function openHomeFilm(kind){
  clearHomeFilmUrls();
  filmPlayer.innerHTML='';
  filmReference.innerHTML='';

  const meta=CONTENT?.homeMedia?.[kind]||{};
  filmKicker.textContent=meta.kicker || (kind==='note'?'A Note From Us':'A Short Film');
  filmTitle.textContent=(meta.title||'').trim() || (kind==='note'?'A letter in moving images':'A small film for our guests');

  const published=usePublishedMedia() ? PUBLISHED_HOME_MEDIA[kind] : null;
  let saved=null;
  if(!published){
    try{saved=await WeddingMediaDB.get(`home-${kind}`)}catch(e){}
  }

  if(published || saved?.videoBlob){
    filmMessage.textContent='';

    const video=document.createElement('video');
    video.controls=true;
    video.playsInline=true;
    video.preload=published ? 'auto' : 'metadata';
    video.autoplay=true;

    if(published){
      video.src=published;
    }else{
      const vurl=URL.createObjectURL(saved.videoBlob);
      HOME_FILM_URLS.push(vurl);
      video.src=vurl;
    }

    if(!published && saved?.subtitleBlob){
      const track=document.createElement('track');
      track.kind='subtitles';
      track.srclang='en';
      track.label='English';
      track.default=true;
      const turl=URL.createObjectURL(saved.subtitleBlob);
      HOME_FILM_URLS.push(turl);
      track.src=turl;
      video.appendChild(track);
    }
    filmPlayer.appendChild(video);
    video.play().catch(()=>{});
  }else{
    filmMessage.textContent=kind==='note'
      ? 'Your personal video note will play here once you upload it in Creator Mode.'
      : 'Your short film will play here once you upload it in Creator Mode.';
  }

  if(meta.reference || meta.referenceUrl){
    const wrap=document.createElement('div');
    wrap.className='film-reference-line';
    if(meta.reference){
      const span=document.createElement('span');
      span.textContent=meta.reference;
      wrap.appendChild(span);
    }
    if(meta.referenceUrl){
      const a=document.createElement('a');
      a.href=meta.referenceUrl;
      a.target='_blank';
      a.rel='noopener noreferrer';
      a.textContent=meta.reference ? 'Reference' : meta.referenceUrl;
      wrap.appendChild(a);
    }
    filmReference.appendChild(wrap);
  }

  filmModal.classList.add('open');
  filmModal.setAttribute('aria-hidden','false');
}

document.querySelectorAll('[data-media]').forEach(el=>el.addEventListener('click',()=>{
  openHomeFilm(el.dataset.media);
}));

function closeFilm(){
  const v=filmPlayer?.querySelector('video');
  if(v){try{v.pause()}catch(e){}}
  filmModal.classList.remove('open');
  filmModal.setAttribute('aria-hidden','true');
  clearHomeFilmUrls();
}
document.getElementById('filmClose').addEventListener('click',closeFilm);
filmModal.addEventListener('click',e=>{if(e.target===filmModal)closeFilm()});
window.addEventListener('keydown',e=>{if(e.key==='Escape')closeFilm()});
window.addEventListener('storage',e=>{if(e.key==='weddingCreatorDraft'&&e.newValue){try{CONTENT=JSON.parse(e.newValue);render()}catch(err){}}});

async function renderRituals(){
  const cfg=CONTENT?.ritualsInfo||{}, sec=document.getElementById('rituals'); if(!sec)return;
  const left=cfg.left||{}, right=cfg.right||{};
  const leftBox=document.getElementById('ritualsLeftContent');
  const rightBox=document.getElementById('ritualsRightContent');
  const align=v=>['left','center','right'].includes(v)?v:'left';
  const textBlock=(title,body,alignment='left',cls='')=>{
    if(!title&&!body)return '';
    return `<section class="ritual-text-block ${cls}" style="text-align:${align(alignment)}">${title?`<h2>${esc(title)}</h2>`:''}${body?`<p>${esc(body)}</p>`:''}</section>`;
  };
  const accordion=(item,extra='',cls='')=>{
    if(!item)return '';
    const title=item.title||'', sub=item.verses||item.subtitle||item.reference||'';
    if(!title&&!sub&&!item.body&&!extra)return '';
    return `<div class="ritual-accordion ${cls}"><button class="ritual-trigger" type="button" aria-expanded="false"><span><strong>${esc(title)}</strong>${sub?`<small>${esc(sub)}</small>`:''}</span><span class="ritual-plus" aria-hidden="true">+</span></button><div class="ritual-expand">${item.heading?`<h3>${esc(item.heading)}</h3>`:''}${item.body?`<p>${esc(item.body)}</p>`:''}${extra}${item.comparison?`<div class="ritual-comparison">${esc(item.comparison)}</div>`:''}${item.source?`<div class="ritual-source">${esc(item.source)}</div>`:''}</div></div>`;
  };

  if(leftBox){
    const keys=['cosmic','preparation','chariot','journey','handFire','threeHusbands','authority'];
    const hymn=(left.hymnButtons||{});
    leftBox.innerHTML=
      textBlock(left.openingTitle,left.openingText,left.openingAlign,'ritual-opening')+
      textBlock(left.storyTitle,left.storyText,left.storyAlign,'ritual-story')+
      (left.bridgeText?`<p class="ritual-bridge">${esc(left.bridgeText)}</p>`:'')+
      `<section class="ritual-hymn"><h2>${esc(left.hymnTitle||'')}</h2>${left.hymnSubtitle?`<p class="ritual-section-subtitle">${esc(left.hymnSubtitle)}</p>`:''}<div class="ritual-accordion-list">${keys.map(k=>accordion(hymn[k])).join('')}</div></section>`+
      accordion(left.atharvaveda,'','ritual-atharvaveda')+
      textBlock(left.closingTitle,[left.closingText,left.finalLine].filter(Boolean).join('\n\n'),left.closingAlign,'ritual-closing');
  }

  if(rightBox){
    const rs=right.rituals||{};
    const fallbackOrder=['varapuja','kanyadana','panigrahana','agniParikrama','saptapadi','lajaHoma','ashmarohana'];
    const order=Array.isArray(right.ritualOrder)&&right.ritualOrder.length?right.ritualOrder.filter(k=>rs[k]):fallbackOrder.filter(k=>rs[k]);
    const sap=rs.saptapadi||{};
    const steps=sap.steps||{};
    const stepHtml=Object.keys(steps).sort((a,b)=>(+a.replace(/\D/g,''))-(+b.replace(/\D/g,''))).map((k,i)=>{
      const st=steps[k]||{}; if(!st.sanskrit&&!st.meaning)return '';
      return `<div class="saptapadi-step"><span>${String(i+1).padStart(2,'0')}</span>${st.sanskrit?`<div class="saptapadi-sanskrit">${esc(st.sanskrit)}</div>`:''}${st.meaning?`<p>${esc(st.meaning)}</p>`:''}</div>`;
    }).join('');
    rightBox.innerHTML=`<section class="wedding-ritual-head" style="text-align:${align(right.align)}"><h2>${esc(right.title||'')}</h2>${right.intro?`<p>${esc(right.intro)}</p>`:''}</section><div class="ritual-accordion-list wedding-ritual-list">${order.map(k=>{
      const it=rs[k]; if(!it)return ''; const extra=k==='saptapadi'?`${sap.intro?`<p>${esc(sap.intro)}</p>`:''}<div class="saptapadi-steps">${stepHtml}</div>`:''; return accordion(it,extra,k==='saptapadi'?'saptapadi-accordion':'');
    }).join('')}</div>`;
  }

  sec.querySelectorAll('.ritual-trigger').forEach(btn=>btn.onclick=()=>{
    const row=btn.closest('.ritual-accordion'); const open=row.classList.toggle('open');
    btn.setAttribute('aria-expanded',open?'true':'false'); const plus=btn.querySelector('.ritual-plus'); if(plus)plus.textContent=open?'−':'+';
  });

  const cr=document.getElementById('ritualCredit'); if(cr){cr.innerHTML='';if(cfg.creditText){const a=document.createElement(cfg.creditUrl?'a':'span');a.textContent=cfg.creditText;if(cfg.creditUrl){a.href=cfg.creditUrl;a.target='_blank';a.rel='noopener noreferrer'}cr.appendChild(a)}}
  const bg=sec.querySelector('.rituals-background'); if(!bg)return;
  bg.innerHTML='';
  let saved=null;
  try{saved=await WeddingMediaDB.get('page-rituals')}catch(e){}
  const v=document.createElement('video');
  v.muted=true; v.loop=true; v.playsInline=true; v.autoplay=true; v.preload='metadata';
  if(saved?.videoBlob){const u=URL.createObjectURL(saved.videoBlob);FEATURE_OBJECT_URLS.push(u);v.src=u;}
  else{v.src='assets/video/rituals-background.mp4';v.addEventListener('error',()=>{v.remove();},{once:true});}
  bg.appendChild(v); if(sec.classList.contains('active'))v.play().catch(()=>{});
}
function renderLoveResponse(){
 const cfg=CONTENT?.loveResponse||{}; const t=document.getElementById('loveQuestionTitle'), a=document.getElementById('loveAnswer'), b=document.getElementById('loveSend'), f=document.getElementById('loveAnswerForm'), st=document.getElementById('loveStatus');
 if(t)t.textContent=cfg.title||'What is LOVE to you?'; if(a)a.placeholder=cfg.placeholder||'Write your answer here…'; if(b)b.textContent=cfg.sendLabel||'Send';
 if(f)f.onsubmit=async e=>{e.preventDefault();if(!a?.value.trim())return; if(!cfg.endpoint||!cfg.fieldName){st.textContent='The response form will be connected here once its submission link is added in Creator Mode.';return} const data=new FormData();data.append(cfg.fieldName,a.value.trim());try{await fetch(cfg.endpoint,{method:'POST',mode:'no-cors',body:data});st.textContent='Thank you — your answer has been sent.';a.value=''}catch(err){st.textContent='The answer could not be sent. Please try again.'}};
}
function renderCredits(){const c=CONTENT?.credits||{};const t=document.getElementById('creditsTitle'),b=document.getElementById('creditsBody');if(t)t.textContent=c.title||'Credits';if(b)b.textContent=c.body||''}
function openCredits(){document.getElementById('creditsModal')?.classList.add('open');document.getElementById('creditsModal')?.setAttribute('aria-hidden','false')}
function closeCredits(){document.getElementById('creditsModal')?.classList.remove('open');document.getElementById('creditsModal')?.setAttribute('aria-hidden','true')}
document.getElementById('creditsHit')?.addEventListener('click',openCredits);document.getElementById('creditsClose')?.addEventListener('click',closeCredits);document.getElementById('creditsModal')?.addEventListener('click',e=>{if(e.target.id==='creditsModal')closeCredits()});
loadContent();


function renderVenueLinks(){
  const box=document.getElementById('venueLinks');
  if(!box)return;
  const v=CONTENT?.venueInfo||{};
  box.innerHTML='';
  [
    [v.mapLabel||'Open in Google Maps',v.mapUrl],
    [v.officialLabel||'River Retreat Website',v.officialUrl]
  ].forEach(([label,url])=>{
    if(!url)return;
    const a=document.createElement('a');
    a.className='venue-link';
    a.href=url;
    a.target='_blank';
    a.rel='noopener noreferrer';
    a.textContent=label;
    box.appendChild(a);
  });
}

