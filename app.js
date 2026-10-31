(() => {
  'use strict';
  const sites = window.AVALON_SITES || [];
  const grid = document.querySelector('#site-grid');
  const storageKey = 'avalon-showcase-shortlist-v2';
  let restored = [];
  try { const raw = JSON.parse(localStorage.getItem(storageKey) || '[]'); if(Array.isArray(raw)) restored=raw.filter(id=>sites.some(s=>s.slug===id)).slice(0,3); } catch {}
  const saved = new Set(restored);
  const persist = () => {try {localStorage.setItem(storageKey,JSON.stringify([...saved]));} catch {const n=document.querySelector('#storage-note');n.textContent='Browser storage is unavailable. Your shortlist works for this visit; download it to keep a copy.';n.hidden=false;}};
  let active = 'all';
  const search = document.querySelector('#search');
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const href = site => site.url || `../sites/${site.slug}/`;
  const announce = message => { document.querySelector('#announcement').textContent = message; };
  function render() {
    const query = search.value.trim().toLocaleLowerCase();
    const visible = sites.filter(s => (active === 'all' || s.group === active) && `${s.name} ${s.sector} ${s.feature} ${s.style}`.toLocaleLowerCase().includes(query));
    grid.innerHTML = visible.map(s => `<article class="project" style="--accent:${escape(s.accent)}"><div class="project-media"><a href="${escape(href(s))}" aria-label="Explore ${escape(s.name)} ${escape(s.sector)} concept"><img src="assets/previews/${s.slug}.jpg" alt="${escape(s.name)} website preview" loading="lazy" width="1440" height="1000"><div class="fallback" aria-hidden="true"><span>${String(s.number).padStart(2,'0')} / ${escape(s.sector).toUpperCase()}</span><strong>${escape(s.name)}</strong><small>${escape(s.tagline)}</small></div></a><span class="site-open">Explore concept ↗</span></div><div class="project-data"><div><h3><span class="project-number">${String(s.number).padStart(2,'0')}</span>${escape(s.name)}</h3><p>${escape(s.sector)} · ${escape(s.style)}</p></div><button class="save" data-save="${s.slug}" aria-label="${saved.has(s.slug)?'Remove':'Save'} ${escape(s.name)} for comparison" aria-pressed="${saved.has(s.slug)}">${saved.has(s.slug)?'✓':'+'}</button></div><div class="project-feature"><i aria-hidden="true"></i> ${escape(s.feature)}</div><div class="project-actions"><button data-detail="${s.slug}">Concept overview +</button><a href="${escape(href(s))}">Open website ↗</a></div></article>`).join('');
    document.querySelector('#result-count').textContent = `${visible.length} creative world${visible.length === 1 ? '' : 's'}`;
    document.querySelector('#empty-state').hidden = visible.length > 0;
    document.querySelector('#clear').hidden = active === 'all' && !query;
    loadImages();
  }
  function loadImages() {
    document.querySelectorAll('img[src*="previews"]').forEach(img => {
      const done = () => {if(img.naturalWidth > 0) img.classList.add('loaded');};
      if(img.complete) done();
      img.addEventListener('load',done,{once:true});
      img.addEventListener('error',()=>{img.style.display='none';},{once:true});
    });
  }
  function updateSaved() {
    persist();
    document.querySelector('#shortlist').hidden = saved.size === 0;
    document.querySelector('#saved-count').textContent = saved.size;
    render();
  }
  grid.addEventListener('click',event => {
    const detail=event.target.closest('[data-detail]');if(detail){showDetail(detail.dataset.detail);return;}
    const button = event.target.closest('[data-save]'); if(!button) return;
    const slug=button.dataset.save;
    if(saved.has(slug)) {saved.delete(slug);announce('Concept removed from comparison.');}
    else if(saved.size < 3) {saved.add(slug);announce(`${sites.find(s=>s.slug===slug).name} saved. ${saved.size} of 3 concepts selected.`);}
    else {announce('You can compare up to three concepts. Remove one from the shortlist first.');return;}
    updateSaved();
    grid.querySelector(`[data-save="${slug}"]`)?.focus();
  });
  document.querySelectorAll('[data-group]').forEach(button => button.addEventListener('click',()=>{
    active=button.dataset.group;
    document.querySelectorAll('[data-group]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});
    render();
  }));
  search.addEventListener('input',render);
  function reset(){active='all';search.value='';document.querySelectorAll('[data-group]').forEach(b=>{b.classList.toggle('active',b.dataset.group==='all');b.setAttribute('aria-pressed',String(b.dataset.group==='all'));});render();}
  document.querySelector('#clear').addEventListener('click',reset);
  document.querySelector('#reset-search').addEventListener('click',reset);
  document.querySelector('#clear-saved').addEventListener('click',()=>{saved.clear();updateSaved();announce('Comparison cleared.');});
  const dialog=document.querySelector('#compare-dialog');
  function compare(){
    document.querySelector('#comparison').innerHTML = sites.filter(s=>saved.has(s.slug)).map(s=>`<article style="--accent:${escape(s.accent)}"><span class="eyebrow">${escape(s.sector)}</span><h3>${escape(s.name)}</h3><dl><dt>Visual direction</dt><dd>${escape(s.style)}</dd><dt>Working demonstration</dt><dd>${escape(s.feature)}</dd><dt>The idea</dt><dd>${escape(s.tagline)}</dd></dl><a href="${escape(href(s))}">Explore this concept ↗</a><button data-remove="${s.slug}" aria-label="Remove ${escape(s.name)} from comparison">Remove concept</button></article>`).join('');
  }
  document.querySelector('#compare').addEventListener('click',()=>{compare();dialog.showModal();});
  document.querySelector('#close-dialog').addEventListener('click',()=>dialog.close());
  document.querySelector('#comparison').addEventListener('click',event=>{const button=event.target.closest('[data-remove]');if(!button)return;saved.delete(button.dataset.remove);updateSaved();compare();if(!saved.size)dialog.close();});
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
  document.querySelectorAll('[data-site]').forEach(a=>{const s=sites.find(s=>s.slug===a.dataset.site);if(s)a.href=href(s);});
  const detailDialog=document.querySelector('#detail-dialog');
  function showDetail(slug){const site=sites.find(s=>s.slug===slug);if(!site)return;
    document.querySelector('#concept-detail').innerHTML=`<img src="assets/previews/${escape(site.slug)}.jpg" alt="${escape(site.name)} website preview"><div><span class="eyebrow">${escape(site.sector)}</span><h2>${escape(site.name)}</h2><p>${escape(site.tagline)}</p><p><strong>Design direction</strong><br>${escape(site.style)}</p><p><strong>Explore the experience</strong><br>${escape(site.feature)}</p><a class="visit" href="${escape(href(site))}">Enter this world ↗</a><p>Fictional Avalon concept. All planning, saved state and transactions are browser-local demonstrations. No real commercial service is provided.</p></div>`;
    detailDialog.showModal();}
  document.querySelector('#detail-close').addEventListener('click',()=>detailDialog.close());
  document.querySelector('#download-shortlist').addEventListener('click',()=>{
    const selected=sites.filter(s=>saved.has(s.slug));if(!selected.length){announce('Save a concept first.');return;}
    const content=['AVALON — YOUR CREATIVE SHORTLIST','Fictional website concepts for discussion.','',...selected.map(s=>`${s.name} | ${s.sector}\n${s.style}\nExplore: ${s.feature}\n${href(s)}\n`),'Explore the collection: https://emmanuelok.github.io/avalon-showcase/','This file was generated locally. Nothing was sent to Avalon.'].join('\n');
    const url=URL.createObjectURL(new Blob([content],{type:'text/plain'}));const a=document.createElement('a');a.href=url;a.download='avalon-creative-shortlist.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);announce('Shortlist downloaded.');
  });
  document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>{grid.classList.toggle('directory',button.dataset.view==='directory');document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));}));
  const worlds={
    'dune-house':{title:'A slower<br>kind of stay.',description:'Explore rooms. Shape a stay. Leave with a saved sample itinerary.',image:'assets/worlds/dune-house.webp'},
    'selvage':{title:'Wear your<br>point of view.',description:'Discover considered pieces. Find your fit. Build a collection that feels like you.',image:'assets/worlds/selvage.jpg'},
    'afterhours':{title:'Make the<br>night yours.',description:'Discover the lineup. Build a clash-free programme. Compose your own festival.',image:'assets/worlds/afterhours.jpg'}
  };
  let worldIndex=0;const worldKeys=Object.keys(worlds);const motionQuery=matchMedia('(prefers-reduced-motion: reduce)');let paused=motionQuery.matches;
  function setWorld(slug){const world=worlds[slug];const site=sites.find(s=>s.slug===slug);if(!world||!site)return;worldIndex=worldKeys.indexOf(slug);const img=document.querySelector('#stage-image');img.src=world.image;img.alt=slug==='afterhours'?'Afterhours festival concept preview':`${site.name} illustrative atmosphere`;
    document.querySelector('#stage-sector').textContent=`${String(site.number).padStart(2,'0')} / ${site.sector}`;document.querySelector('#stage-title').innerHTML=world.title;document.querySelector('#stage-description').textContent=world.description;document.querySelector('#stage-open').innerHTML=`Enter ${escape(site.name)} <span>↗</span>`;document.querySelector('#stage-open').href=href(site);document.querySelectorAll('[data-world]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.world===slug)));const copy=document.querySelector('.stage-copy');copy.classList.remove('stage-enter');requestAnimationFrame(()=>copy.classList.add('stage-enter'));
  }
  function motionState(){document.documentElement.classList.toggle('motion-paused',paused);const b=document.querySelector('#motion-toggle');b.textContent=paused?'Play motion':'Pause motion';b.setAttribute('aria-pressed',String(paused));}
  document.querySelector('#motion-toggle').addEventListener('click',()=>{paused=!paused;motionState();});motionQuery.addEventListener('change',e=>{paused=e.matches;motionState();});
  document.querySelectorAll('[data-world]').forEach(b=>b.addEventListener('click',()=>setWorld(b.dataset.world)));
  // Camera movement is decorative. Changing worlds remains user-controlled.
  motionState();setWorld('dune-house');updateSaved();
})();
