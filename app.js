'use strict';
const grid = document.querySelector('#project-grid');
const statusText = document.querySelector('#project-status');
const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeURL = value => {
  try { const u = new URL(value, location.href); return ['http:', 'https:'].includes(u.protocol) ? u.href : '#'; } catch { return '#'; }
};
function artwork(type) {
  const bar = '<div class="window-bar"><i></i><i></i><i></i></div>';
  if (type === 'scanner') return `<div class="mini-window">${bar}<div class="terminal-text">$ python scanner.py</div><div class="terminal-text green">&gt; Auditing dependencies_</div><div class="scan-line"></div><div class="scan-line short"></div><div class="terminal-text">OSV · vulnerability intelligence</div></div>`;
  if (type === 'balance') return '<div class="phone"><small>BizBalance / Overview</small><strong>My business.</strong><div class="chart"><i></i><i></i><i></i><i></i><i></i></div><small>Income & expenses</small><div class="phone-line"></div><div class="phone-line"></div></div>';
  if (type === 'planner') return '<div class="phone"><small>STUDENT PLANNER</small><strong>My week.</strong><div class="phone-line"></div><div class="phone-line"></div><div class="phone-line"></div><small>Plan. Learn. Repeat.</small></div>';
  if (type === 'volt') return '<div class="volt-logo">ϟ<small>VOLTIFY</small></div>';
  if (type === 'card') return '<div class="credit-card">SECURITY / DEMO<b>•••• •••• ••••</b>TEST DATA ONLY</div>';
  return `<div class="java-symbol">${type === 'list' ? '[ ]' : '{ }'}</div>`;
}
async function init() {
  try {
    const response = await fetch('content.json');
    if (!response.ok) throw new Error('Content unavailable');
    const content = await response.json();
    if (content.profilePhoto && /^assets\/profile-photo\.(png|jpe?g|webp)$/i.test(content.profilePhoto)) {
      const photo = document.querySelector('#profile-photo');
      photo.addEventListener('load', () => {
        document.querySelector('.system-visual').hidden = true;
        document.querySelector('#profile-portrait').hidden = false;
      });
      photo.src = content.profilePhoto;
    }
    const featured = content.featured || [];
    let projects = [...content.projects].sort((a,b) => {
      const ai = featured.indexOf(a.repo), bi = featured.indexOf(b.repo);
      return (ai < 0 ? 999 : ai) - (bi < 0 ? 999 : bi);
    });
    let activeFilter = 'All';
    function render(filter = activeFilter) {
      activeFilter = filter;
      const visible = projects.filter(p => filter === 'All' || (filter === 'Featured' ? featured.includes(p.repo) : p.category === filter));
      grid.innerHTML = visible.map(p => `<article class="project-card"><div class="project-art ${escapeHTML(p.visual)}" aria-hidden="true">${featured.includes(p.repo) ? '<span class="featured-label">★ FEATURED</span>' : ''}${artwork(p.visual)}<span class="art-caption">PROJECT INTERFACE / ILLUSTRATION</span></div><div class="project-content"><span class="project-category">${escapeHTML(p.category)}</span><h3>${escapeHTML(p.name)}</h3><p>${escapeHTML(p.description)}</p><div class="tags">${p.tags.map(t=>`<span>${escapeHTML(t)}</span>`).join('')}</div><a class="project-link" href="https://github.com/dinuka0987/${encodeURIComponent(p.repo)}" target="_blank" rel="noopener noreferrer" aria-label="View ${escapeHTML(p.name)} source on GitHub">Explore project <span></span></a></div></article>`).join('') || '<p>No projects in this selection yet.</p>';
      if (!visible.length) {
        grid.innerHTML = '<div class="ui-empty"><svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/></svg><p>No projects in this selection yet.</p><button class="button primary" type="button" data-clear-filters>Clear Filters</button></div>';
      }
      grid.setAttribute('aria-busy', 'false');
      statusText.textContent = `${visible.length} projects shown${filter === 'All' ? '' : ': ' + filter}.`;
    }
    render();
    let refreshing = false;
    async function refreshProjects() {
      if (refreshing) return;
      refreshing = true;
      try {
        const result = await GitHubProjects.load(content);
        projects = result.projects;
        render();
        document.querySelector('#project-sync-status').textContent = result.source === 'github'
          ? 'Projects updated from GitHub.'
          : 'Showing saved projects. GitHub updates are temporarily unavailable.';
      } finally {
        document.querySelector('#project-sync-status').setAttribute('aria-busy', 'false');
        refreshing = false;
      }
    }
    refreshProjects();
    setInterval(() => { if (!document.hidden) refreshProjects(); }, 5 * 60 * 1000);
    document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
      document.querySelectorAll('[data-filter]').forEach(b => { b.classList.toggle('active', b === button); b.setAttribute('aria-pressed', String(b === button)); });
      render(button.dataset.filter);
    }));
    // Empty-state action uses the existing filter button and its behavior.
    grid.addEventListener('click', event => {
      if (event.target.closest('[data-clear-filters]')) document.querySelector('[data-filter="All"]').click();
    });
    document.querySelectorAll('.ui-tooltip-trigger').forEach(trigger => {
      trigger.addEventListener('keydown', event => {
        if (event.key === 'Escape') trigger.classList.add('ui-tooltip-dismissed');
      });
      ['blur', 'pointerleave'].forEach(type => trigger.addEventListener(type, () => trigger.classList.remove('ui-tooltip-dismissed')));
    });
    if (content.resume) document.querySelectorAll('.resume-link').forEach(a => a.href = safeURL(content.resume));
    if (content.certificates?.length) {
  document.querySelector('#certificate-list').innerHTML =
    content.certificates.map(c => {
      const isImage = /\.(png|jpe?g|webp)(?:[?#]|$)/i.test(c.file || '');

      const preview = isImage
        ? `<img
            src="${escapeHTML(safeURL(c.file))}"
            alt="${escapeHTML(c.title)} certificate"
            loading="lazy">`
        : `<div class="certificate-artwork" aria-hidden="true">
            <span class="certificate-seal">✳</span>
            <small>CERTIFICATE</small>
            <strong>${escapeHTML(c.issuer)}</strong>
          </div>`;

      return `
        <article class="project-card certificate-card">
          <div class="project-art certificate-art">
            ${preview}
          </div>

          <div class="project-content">
            <span class="project-category">
              ${escapeHTML(c.issuer)}
            </span>

            <h3>${escapeHTML(c.title)}</h3>

            ${c.date ? `<p>${escapeHTML(c.date)}</p>` : ''}

            <div class="certificate-links">
              ${c.file ? `
                <a
                  class="project-link"
                  href="${escapeHTML(safeURL(c.file))}"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="View ${escapeHTML(c.title)} certificate">
                  View certificate <span></span>
                </a>
              ` : ''}

              ${c.url ? `
                <a
                  class="project-link"
                  href="${escapeHTML(safeURL(c.url))}"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Verify ${escapeHTML(c.title)} credential">
                  Verify credential <span></span>
                </a>
              ` : ''}
            </div>
          </div>
        </article>
      `;
    }).join('');
}
  } catch (error) {
    grid.setAttribute('aria-busy', 'false');
    document.querySelector('#project-sync-status').setAttribute('aria-busy', 'false');
    grid.innerHTML = '<p>Project details could not load. <a class="text-link" href="https://github.com/dinuka0987?tab=repositories">Explore my work on GitHub</a></p>';
    statusText.textContent = 'Project details unavailable.';
  }
}
document.querySelector('#year').textContent = new Date().getFullYear();
init();

/* Glass/3D presentation only. Project fetching, sorting, filtering and copy above
   are intentionally unchanged. Delegation also covers newly rendered cards. */
(() => {
  if (typeof window === 'undefined') return;
  const header = document.querySelector('.header');
  if (!header) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const mobile = window.matchMedia('(max-width: 700px)');
  const toggle = header.querySelector('.nav-toggle');
  const navigation = header.querySelector('#primary-navigation');
  let menuOpen = false;
  function setMenu(open, restoreFocus = false) {
    menuOpen = mobile.matches && open;
    navigation.hidden = mobile.matches && !menuOpen;
    navigation.inert = mobile.matches && !menuOpen;
    toggle.setAttribute('aria-expanded', String(menuOpen));
    toggle.setAttribute('aria-label', menuOpen ? 'Close navigation menu' : 'Open navigation menu');
    if (restoreFocus) toggle.focus();
  }
  header.classList.add('g3-enhanced');
  setMenu(false);
  toggle.addEventListener('click', () => setMenu(!menuOpen));
  header.addEventListener('click', event => {
    if (event.target.closest('a[href^="#"]')) setMenu(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menuOpen) setMenu(false, true);
  });
  document.addEventListener('pointerdown', event => {
    if (menuOpen && !header.contains(event.target)) setMenu(false);
  });
  mobile.addEventListener('change', () => setMenu(false));

  const sectionIds = ['home', 'about', 'projects', 'skills', 'credentials', 'contact'];
  const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);
  const sectionLinks = document.querySelectorAll('.header a[href^="#"], .g3-footer-links a[href^="#"]');
  function updateNavigation() {
    header.classList.toggle('is-scrolled', window.scrollY > 32);
    const line = header.getBoundingClientRect().bottom + 40;
    const atBottom = window.scrollY > 0 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
    const current = atBottom ? 'contact' : [...sections].reverse().find(section => section.getBoundingClientRect().top <= line)?.id || 'home';
    sectionLinks.forEach(link => {
      const active = link.getAttribute('href') === '#' + current;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver(updateNavigation, {rootMargin:'-110px 0px -45% 0px', threshold:[0,.1,.5]});
    sections.forEach(section => spy.observe(section));
  }
  let scrollFrame = 0;
  window.addEventListener('scroll', () => {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => { scrollFrame = 0; updateNavigation(); });
  }, {passive:true});
  updateNavigation();

  const tiltRoots = new WeakSet();
  function initTilt(root = document) {
    if (tiltRoots.has(root)) return () => {};
    tiltRoots.add(root);
    const selector = '[data-tilt], .project-card:not(.ui-skeleton-card), .skill-row, .education, .activities';
    let active = null, frame = 0, pending = null;
    function reset() {
      cancelAnimationFrame(frame); frame = 0; pending = null;
      if (!active) return;
      active.classList.remove('is-tilting');
      ['--tilt-x','--tilt-y','--glare-x','--glare-y'].forEach(name => active.style.removeProperty(name));
      active = null;
    }
    root.addEventListener('pointermove', event => {
      if (reduceMotion.matches || !finePointer.matches || event.pointerType !== 'mouse') return;
      const card = event.target.closest?.(selector);
      if (!card) { reset(); return; }
      if (active !== card) { reset(); active = card; }
      pending = {card, x:event.clientX, y:event.clientY};
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (!pending || reduceMotion.matches || !finePointer.matches) { reset(); return; }
        const {card,x,y} = pending, rect = card.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const px = Math.max(0, Math.min(1, (x-rect.left)/rect.width));
        const py = Math.max(0, Math.min(1, (y-rect.top)/rect.height));
        card.style.setProperty('--tilt-x', ((.5-py)*12).toFixed(2)+'deg');
        card.style.setProperty('--tilt-y', ((px-.5)*12).toFixed(2)+'deg');
        card.style.setProperty('--glare-x', (px*100).toFixed(1)+'%');
        card.style.setProperty('--glare-y', (py*100).toFixed(1)+'%');
        card.classList.add('is-tilting');
      });
    }, {passive:true});
    root.addEventListener('pointerout', event => {
      if (active && (!event.relatedTarget || !active.contains(event.relatedTarget))) reset();
    }, {passive:true});
    root.addEventListener('pointercancel', reset, {passive:true});
    window.addEventListener('blur', reset);
    finePointer.addEventListener('change', reset);
    reduceMotion.addEventListener('change', reset);
    return reset;
  }
  initTilt();
  // Reusable entry point for an optional future UI subtree; no dependencies.
  window.portfolioGlass = {initTilt};

  if ('IntersectionObserver' in window) {
    const seen = new WeakSet();
    const reveal = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-revealed'); reveal.unobserve(entry.target); }
      });
    }, {threshold:.06, rootMargin:'0px 0px -20px 0px'});
    function observeCards(scope) {
      const cards = scope.querySelectorAll('.about-copy, .project-card:not(.ui-skeleton-card), .skill-row, .education, .activities, .contact-bottom');
      cards.forEach((card,index) => {
        if (seen.has(card)) return;
        seen.add(card);
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--reveal-delay', (index%3)*45+'ms');
        card.classList.add('g3-reveal');
        if (reduceMotion.matches || rect.top < window.innerHeight) card.classList.add('is-revealed');
        else reveal.observe(card);
      });
    }
    observeCards(document);
    const watchCards = new MutationObserver(records => {
      records.forEach(record => {
        record.removedNodes.forEach(node => {
          if (node.nodeType === 1) reveal.unobserve(node);
        });
        observeCards(record.target);
      });
    });
    ['project-grid','certificate-list'].forEach(id => {
      const container = document.getElementById(id);
      if (container) watchCards.observe(container, {childList:true});
    });
    reduceMotion.addEventListener('change', () => {
      if (reduceMotion.matches) document.querySelectorAll('.g3-reveal').forEach(card => { card.classList.add('is-revealed'); reveal.unobserve(card); });
    });
  }
})();
