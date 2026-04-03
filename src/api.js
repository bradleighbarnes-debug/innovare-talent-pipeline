let _data = null;

async function getData() {
  if (_data) return _data;
  // Try API first, fall back to static JSON
  try {
    const res = await fetch('/api/stats');
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      _data = { mode: 'api' };
      return _data;
    }
  } catch {}
  // Static mode — load bundled data
  const res = await fetch('/data.json');
  _data = await res.json();
  _data.mode = 'static';
  return _data;
}

function matchesFilter(candidate, params) {
  if (params.search) {
    const s = params.search.toLowerCase();
    const name = `${candidate.first_name} ${candidate.last_name}`.toLowerCase();
    const title = (candidate.current_title || '').toLowerCase();
    const company = (candidate.current_company || '').toLowerCase();
    if (!name.includes(s) && !title.includes(s) && !company.includes(s)) return false;
  }
  if (params.company) {
    const c = params.company.toLowerCase();
    if (!(candidate.current_company || '').toLowerCase().includes(c) &&
        !(candidate.source_company || '').toLowerCase().includes(c)) return false;
  }
  if (params.seniority && candidate.seniority_level !== params.seniority) return false;
  if (params.category) {
    const cat = params.category.toLowerCase();
    if (!(candidate.source_company_category || '').toLowerCase().includes(cat) &&
        !(candidate.role_category || '').toLowerCase().includes(cat)) return false;
  }
  if (params.review === 'true' && !candidate.needs_manual_review) return false;
  if (params.review === 'false' && candidate.needs_manual_review) return false;
  return true;
}

function sortCandidates(candidates, sortBy, sortDir) {
  return [...candidates].sort((a, b) => {
    let va = a[sortBy] || '';
    let vb = b[sortBy] || '';
    if (typeof va === 'number' && typeof vb === 'number') {
      return sortDir === 'ASC' ? va - vb : vb - va;
    }
    va = String(va).toLowerCase();
    vb = String(vb).toLowerCase();
    return sortDir === 'ASC' ? va.localeCompare(vb) : vb.localeCompare(va);
  });
}

function groupBy(arr, key) {
  const map = {};
  arr.forEach(item => {
    const k = item[key] || 'Unknown';
    map[k] = (map[k] || 0) + 1;
  });
  return Object.entries(map).map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
}

export const api = {
  getStats: async () => {
    const data = await getData();
    if (data.mode === 'api') {
      const res = await fetch('/api/stats');
      return res.json();
    }
    const c = data.candidates;
    return {
      totalCandidates: c.length,
      passedFilters: c.filter(x => !x.needs_manual_review).length,
      reviewQueue: c.filter(x => x.needs_manual_review).length,
      existingDedup: data.stats.existingDedup,
      companiesSearched: data.stats.companiesSearched,
      companiesPending: data.stats.companiesPending,
      bySource: groupBy(c, 'current_company').slice(0, 20),
      byCategory: groupBy(c, 'source_company_category'),
      bySeniority: groupBy(c, 'seniority_level'),
      byReviewReason: groupBy(c.filter(x => x.needs_manual_review), 'manual_review_reason'),
      scoreDistribution: [
        { label: '80-100', count: c.filter(x => x.match_score >= 80).length },
        { label: '60-79', count: c.filter(x => x.match_score >= 60 && x.match_score < 80).length },
        { label: '40-59', count: c.filter(x => x.match_score >= 40 && x.match_score < 60).length },
        { label: '20-39', count: c.filter(x => x.match_score >= 20 && x.match_score < 40).length },
        { label: '0-19', count: c.filter(x => x.match_score < 20).length },
      ],
    };
  },

  getCandidates: async (params = {}) => {
    const data = await getData();
    if (data.mode === 'api') {
      const qs = new URLSearchParams(params).toString();
      const res = await fetch(`/api/candidates?${qs}`);
      return res.json();
    }
    let filtered = data.candidates.filter(c => matchesFilter(c, params));
    const total = filtered.length;
    filtered = sortCandidates(filtered, params.sortBy || 'match_score', params.sortDir || 'DESC');
    const page = parseInt(params.page || '1');
    const limit = parseInt(params.limit || '50');
    filtered = filtered.slice((page - 1) * limit, page * limit);
    return { total, page, limit, candidates: filtered };
  },

  getCandidate: async (id) => {
    const data = await getData();
    if (data.mode === 'api') {
      const res = await fetch(`/api/candidates/${id}`);
      return res.json();
    }
    return data.candidates.find(c => c.id === id) || null;
  },

  getCompanies: async () => {
    const data = await getData();
    if (data.mode === 'api') {
      const res = await fetch('/api/companies');
      return res.json();
    }
    const companies = data.companies.map(comp => {
      const nameLower = comp.company_name.toLowerCase();
      const actual = data.candidates.filter(c =>
        (c.current_company || '').toLowerCase().includes(nameLower) ||
        (c.source_company || '').toLowerCase().includes(nameLower)
      ).length;
      return { ...comp, actual_candidates: actual };
    });
    companies.sort((a, b) => b.actual_candidates - a.actual_candidates);
    return { total: companies.length, companies };
  },

  getJDs: async () => {
    const data = await getData();
    if (data.mode === 'api') {
      const res = await fetch('/api/jds');
      return res.json();
    }
    return { jds: data.jds };
  },

  getJDCandidates: async (id) => {
    const data = await getData();
    if (data.mode === 'api') {
      const res = await fetch(`/api/jds/${id}/candidates`);
      return res.json();
    }
    const jd = data.jds.find(j => j.id === id);
    if (!jd) return { jd: '', total: 0, candidates: [] };
    const jdTitle = `${jd.title} @ ${jd.company}`;
    const matched = data.candidates
      .filter(c => (c.best_fit_jd || '').includes(jdTitle))
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, 50);
    return { jd: jdTitle, total: matched.length, candidates: matched };
  },

  getReview: async (params = {}) => {
    const data = await getData();
    if (data.mode === 'api') {
      const qs = new URLSearchParams(params).toString();
      const res = await fetch(`/api/review?${qs}`);
      return res.json();
    }
    let filtered = data.candidates.filter(c => c.needs_manual_review);
    if (params.reason) filtered = filtered.filter(c => c.manual_review_reason === params.reason);
    const page = parseInt(params.page || '1');
    return { total: filtered.length, page, candidates: filtered.slice((page - 1) * 50, page * 50) };
  },

  approveCandidate: async (id) => {
    try { await fetch(`/api/review/${id}/approve`, { method: 'POST' }); } catch {}
  },
  rejectCandidate: async (id) => {
    try { await fetch(`/api/review/${id}/reject`, { method: 'POST' }); } catch {}
  },
  approveAll: async (reason) => {
    try { await fetch('/api/review/approve-all', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason }) }); } catch {}
  },

  exportCSV: (params = {}) => {
    // Generate CSV client-side from static data
    getData().then(data => {
      if (data.mode === 'api') {
        const qs = new URLSearchParams(params).toString();
        window.open(`/api/export?${qs}`, '_blank');
        return;
      }
      let filtered = data.candidates;
      if (params.category) filtered = filtered.filter(c =>
        (c.source_company_category || '').includes(params.category) ||
        (c.role_category || '').includes(params.category)
      );
      if (params.company) filtered = filtered.filter(c =>
        (c.current_company || '').toLowerCase().includes(params.company.toLowerCase())
      );

      const headers = ['Full Name', 'LinkedIn URL', 'Current Title', 'Current Company', 'Role Category', 'Seniority', 'Location', 'Match Score', 'Source', 'Email', 'Phone', 'Voice AI Summary'];
      const rows = filtered.map(c => [
        `${c.first_name} ${c.last_name}`,
        c.linkedin_url || '',
        c.current_title || '',
        c.current_company || '',
        c.source_company_category || c.role_category || '',
        c.seniority_level || '',
        [c.location_city, c.location_state].filter(Boolean).join(', '),
        c.match_score || 0,
        c.search_source || '',
        c.email || '',
        c.phone || '',
        c.voice_ai_summary || '',
      ]);

      const escape = (v) => {
        const s = String(v);
        return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
      };

      const csv = [headers.join(','), ...rows.map(r => r.map(escape).join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `innovare_${(params.category || 'all').replace(/\s+/g, '_')}_candidates.csv`;
      a.click();
      URL.revokeObjectURL(url);
    });
  },
};
