(function (root) {
  'use strict';
  const username = 'dinuka0987';
  const cacheKey = 'portfolio.github-projects.v1.' + username;
  function validate(repos) {
    if (!Array.isArray(repos) || repos.some(r => !r || typeof r.name !== 'string' || !/^[\w.-]+$/.test(r.name))) throw new Error('Invalid GitHub repository response');
    return repos;
  }
  function categoryFor(repo) {
    const topics = Array.isArray(repo.topics) ? repo.topics : [];
    const labels = [repo.name, ...topics].join(' ').toLowerCase();
    if (/security|vulnerab|cyber|pentest|network|ctf/.test(labels)) return 'Security';
    if (/flutter|android|ios|mobile/.test(labels) || ['Dart','Kotlin','Swift'].includes(repo.language)) return 'Mobile';
    if (/website|webapp|frontend|react|laravel|nextjs|vue/.test(labels) || ['JavaScript','TypeScript','HTML','CSS','PHP'].includes(repo.language)) return 'Web';
    return 'Software';
  }
  function merge(repos, content) {
    validate(repos);
    const overrides = new Map((content.projects || []).map(p => [p.repo.toLowerCase(), p]));
    const excluded = new Set((content.github?.excludeRepos || []).map(s => s.toLowerCase()));
    const featured = (content.featured || []).map(s => s.toLowerCase());
    const seen = new Set();
    return repos.filter(r => {
      const key = r.name.toLowerCase();
      if (r.private || excluded.has(key) || seen.has(key)) return false;
      seen.add(key); return true;
    }).map(r => {
      const override = overrides.get(r.name.toLowerCase()) || {};
      const category = categoryFor(r);
      return {
        name: r.name.replace(/[-_]+/g, ' '),
        description: r.description?.trim() || (r.language ? `A ${r.language} project. Explore the source code on GitHub.` : 'Explore this project and its source code on GitHub.'),
        category,
        tags: [...new Set([r.language, ...(r.topics || []).slice(0, 3)].filter(Boolean))],
        visual: category === 'Security' ? 'scanner' : category === 'Mobile' ? 'planner' : 'java',
        ...override,
        repo: r.name,
        createdAt: r.created_at || override.createdAt || ''
      };
    }).sort((a,b) => {
      const ai = featured.indexOf(a.repo.toLowerCase()), bi = featured.indexOf(b.repo.toLowerCase());
      return (ai < 0 ? Infinity : ai) - (bi < 0 ? Infinity : bi) ||
        (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0) || a.repo.localeCompare(b.repo);
    });
  }
  async function load(content, options = {}) {
    const fetcher = options.fetch || root.fetch.bind(root);
    let storage;
    try { storage = options.storage === undefined ? root.localStorage : options.storage; } catch { /* Storage can be disabled. */ }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    try {
      const repos = [];
      for (let page = 1; ; page++) {
        const response = await fetcher(`https://api.github.com/users/${username}/repos?type=owner&sort=created&direction=desc&per_page=100&page=${page}`, {
          headers: {Accept: 'application/vnd.github+json'}, cache: 'no-store', signal: controller.signal
        });
        if (!response.ok) throw new Error('GitHub unavailable: ' + response.status);
        const batch = validate(await response.json());
        repos.push(...batch);
        if (batch.length < 100) break;
      }
      const projects = merge(repos, content);
      try { storage?.setItem(cacheKey, JSON.stringify(repos)); } catch { /* Quota or privacy settings. */ }
      return {projects, source: 'github'};
    } catch {
      try {
        const cached = storage?.getItem(cacheKey);
        if (cached) return {projects: merge(JSON.parse(cached), content), source: 'cache'};
      } catch { /* Ignore invalid caches. */ }
      const excluded = new Set((content.github?.excludeRepos || []).map(s => s.toLowerCase()));
      return {projects: (content.projects || []).filter(p => !excluded.has(p.repo.toLowerCase())), source: 'snapshot'};
    } finally { clearTimeout(timer); }
  }
  const api = {load, merge, categoryFor};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GitHubProjects = api;
})(typeof globalThis === 'undefined' ? this : globalThis);
