(() => {
  'use strict';
  const sites = window.AVALON_SITES || [];
  const grid = document.querySelector('#site-grid');
  const saved = new Set();
  let active = 'all';
  const search = document.querySelector('#search');
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const href = site => site.url || `../sites/${site.slug}/`;
  const announce = message => { document.querySelector('#announcement').textContent = message; };
  function render() {
    const query = search.value.trim().toLocaleLowerCase();
    const visible = sites.filter(s => (active === 'all' || s.group === active) && `${s.name} ${s.sector} ${s.feature} ${s.style}`.toLocaleLowerCase().includes(query));
    grid.innerHTML = visible.map(s => `<article class="project" style="--accent:${escape(s.accent)}"><div class="project-media"><a href="${escape(href(s))}" aria-label="Explore ${escape(s.name)} ${escape(s.sector)} concept"><img src="assets/previews/${s.slug}.jpg" alt="${escape(s.name)} website preview" loading="lazy" width="1440" height="1000"><div class="fallback" aria-hidden="true"><span>${String(s.number).padStart(2,'0')} / ${escape(s.sector).toUpperCase()}</span><strong>${escape(s.name)}</strong><small>${escape(s.tagline)}</small></div></a><span class="site-open">Explore concept ↗</span></div><div class="project-data"><div><h3><span class="project-number">${String(s.number).padStart(2,'0')}</span>${escape(s.name)}</h3><p>${escape(s.sector)} · ${escape(s.style)}</p></div><button class="save" data-save="${s.slug}" aria-label="${saved.has(s.slug)?'Remove':'Save'} ${escape(s.name)} for comparison" aria-pressed="${saved.has(s.slug)}">${saved.has(s.slug)?'✓':'+'}</button></div><div class="project-feature"><i aria-hidden="true"></i> Try it: ${escape(s.feature)}</div></article>`).join('');
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
    document.querySelector('#shortlist').hidden = saved.size === 0;
    document.querySelector('#saved-count').textContent = saved.size;
    render();
  }
  grid.addEventListener('click',event => {
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
  render();
})();
