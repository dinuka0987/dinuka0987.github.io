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
    const projects = [...content.projects].sort((a,b) => {
      const ai = featured.indexOf(a.repo), bi = featured.indexOf(b.repo);
      return (ai < 0 ? 999 : ai) - (bi < 0 ? 999 : bi);
    });
    function render(filter = 'All') {
      const visible = projects.filter(p => filter === 'All' || (filter === 'Featured' ? featured.includes(p.repo) : p.category === filter));
      grid.innerHTML = visible.map(p => `<article class="project-card"><div class="project-art ${escapeHTML(p.visual)}" aria-hidden="true">${featured.includes(p.repo) ? '<span class="featured-label">★ FEATURED</span>' : ''}${artwork(p.visual)}<span class="art-caption">PROJECT INTERFACE / ILLUSTRATION</span></div><div class="project-content"><span class="project-category">${escapeHTML(p.category)}</span><h3>${escapeHTML(p.name)}</h3><p>${escapeHTML(p.description)}</p><div class="tags">${p.tags.map(t=>`<span>${escapeHTML(t)}</span>`).join('')}</div><a class="project-link" href="https://github.com/dinuka0987/${encodeURIComponent(p.repo)}" target="_blank" rel="noopener noreferrer" aria-label="View ${escapeHTML(p.name)} source on GitHub">Explore project <span>↗</span></a></div></article>`).join('') || '<p>No projects in this selection yet.</p>';
      statusText.textContent = `${visible.length} projects shown${filter === 'All' ? '' : ': ' + filter}.`;
    }
    render();
    document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
      document.querySelectorAll('[data-filter]').forEach(b => { b.classList.toggle('active', b === button); b.setAttribute('aria-pressed', String(b === button)); });
      render(button.dataset.filter);
    }));
    if (content.resume) document.querySelectorAll('.resume-link').forEach(a => a.href = safeURL(content.resume));
    if (content.certificates?.length) {
      document.querySelector('#certificate-list').innerHTML = content.certificates.map(c => `<article class="certificate-item"><h3>${escapeHTML(c.title)}</h3><p>${escapeHTML(c.issuer)}${c.date ? ' · ' + escapeHTML(c.date) : ''}</p>${c.file ? `<a class="text-link" href="${escapeHTML(safeURL(c.file))}" target="_blank" rel="noopener noreferrer">View certificate ↗</a>` : ''}${c.url ? ` <a class="text-link" href="${escapeHTML(safeURL(c.url))}" target="_blank" rel="noopener noreferrer">Verify credential ↗</a>` : ''}</article>`).join('');
    }
  } catch (error) {
    grid.innerHTML = '<p>Project details could not load. <a class="text-link" href="https://github.com/dinuka0987?tab=repositories">Explore my work on GitHub ↗</a></p>';
    statusText.textContent = 'Project details unavailable.';
  }
}
document.querySelector('#year').textContent = new Date().getFullYear();
init();
