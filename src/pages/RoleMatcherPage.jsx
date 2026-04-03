import { useState, useEffect, useCallback } from 'react';
import { api } from '../api.js';
import DetailPanel from '../components/DetailPanel.jsx';

const ROLES = [
  { id: 'Speech & Audio ML Engineer', short: 'Speech & Audio ML' },
  { id: 'ML Engineer', short: 'ML Engineer' },
  { id: 'AI Engineer', short: 'AI Engineer' },
  { id: 'Research Scientist', short: 'Research Scientist' },
  { id: 'Forward Deployed Engineer', short: 'Forward Deployed' },
  { id: 'NLP Engineer', short: 'NLP Engineer' },
  { id: 'Staff Software Engineer', short: 'Staff SWE' },
  { id: 'Senior Software Engineer', short: 'Senior SWE' },
  { id: 'Software Engineer', short: 'SWE' },
  { id: 'Product Engineer', short: 'Product Eng' },
  { id: 'Engineering Leadership', short: 'Leadership' },
  { id: 'Data Scientist / Engineer', short: 'Data Scientist' },
  { id: 'Solutions Engineer', short: 'Solutions Eng' },
  { id: 'Other Engineering', short: 'Other' },
];

export default function RoleMatcherPage({ onSelectRole }) {
  const [stats, setStats] = useState(null);
  const [activeRole, setActiveRole] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('current_company');
  const [sortDir, setSortDir] = useState('ASC');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => { api.getStats().then(setStats); }, []);
  const getCount = (role) => stats?.byCategory?.find(c => c.label === role)?.count || 0;
  const totalCandidates = stats?.totalCandidates || 0;

  const loadCandidates = useCallback(async () => {
    if (!activeRole) return;
    const params = { page, limit: 100, sortBy, sortDir, category: activeRole };
    if (search) params.search = search;
    const data = await api.getCandidates(params);
    setCandidates(data.candidates);
    setTotal(data.total);
  }, [activeRole, page, sortBy, sortDir, search]);

  useEffect(() => { loadCandidates(); }, [loadCandidates]);

  const selectRole = (role) => {
    if (activeRole === role) { setActiveRole(null); return; }
    setActiveRole(role);
    setPage(1);
    setSearch('');
  };

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'DESC' ? 'ASC' : 'DESC');
    else { setSortBy(col); setSortDir('ASC'); }
  };

  const SortArrow = ({ col }) => {
    if (sortBy !== col) return null;
    return <span className="ml-1 text-brand-light">{sortDir === 'ASC' ? '↑' : '↓'}</span>;
  };

  const seniorityColor = (s) => {
    const map = { 'Director+': 'bg-danger/15 text-danger', 'Staff/Principal': 'bg-purple/15 text-purple', 'Lead/Manager': 'bg-warning/15 text-warning', 'Senior': 'bg-brand-light/15 text-brand-light', 'Mid-Level': 'bg-text-dim/15 text-text-muted' };
    return map[s] || 'bg-text-dim/10 text-text-dim';
  };

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Source by Role</h1>
          <p className="text-sm text-text-muted mt-1">Select a role to view candidates. {totalCandidates.toLocaleString()} total across {ROLES.length} categories.</p>
        </div>
        <button onClick={() => api.exportCSV({})}
          className="px-4 py-2 bg-surface border border-border rounded-lg text-sm text-text-muted hover:text-text-primary hover:border-brand-mid/40 transition-all">
          Export CSV
        </button>
      </div>

      {/* Role Filter Chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveRole(null)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            !activeRole ? 'bg-brand-mid text-white' : 'bg-surface border border-border text-text-muted hover:text-text-primary hover:border-brand-mid/40'
          }`}
        >
          All Roles
        </button>
        {ROLES.map(role => {
          const count = getCount(role.id);
          if (count === 0) return null;
          return (
            <button
              key={role.id}
              onClick={() => selectRole(role.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeRole === role.id
                  ? 'bg-brand-mid text-white'
                  : 'bg-surface border border-border text-text-muted hover:text-text-primary hover:border-brand-mid/40'
              }`}
            >
              {role.short} <span className="ml-1 opacity-60">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Export Bar — shows when role selected */}
      {activeRole && (
        <div className="bg-brand-mid/10 border border-brand-mid/30 rounded-xl px-5 py-4 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-brand-light animate-pulse" />
            <span className="text-sm font-medium text-text-primary">
              {total} <span className="text-brand-light">{ROLES.find(r => r.id === activeRole)?.id}</span> candidates ready
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => api.exportCSV({ category: activeRole })}
              className="px-5 py-2.5 bg-brand-mid text-white rounded-lg text-sm font-semibold hover:bg-brand-deep transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export All {total} as CSV
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text" placeholder="Search candidate..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-surface border border-border text-text-primary pl-10 pr-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-brand-mid/60 transition-colors"
          />
          <svg className="absolute left-3 top-3 w-4 h-4 text-text-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <span className="text-sm text-text-dim">
          {activeRole ? `${total} of ${totalCandidates.toLocaleString()} candidates` : `${totalCandidates.toLocaleString()} candidates`}
        </span>
      </div>

      {/* Table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-2/50">
              <th className="px-4 py-3 text-left text-[11px] text-text-dim uppercase tracking-wider font-semibold cursor-pointer hover:text-text-muted select-none" onClick={() => toggleSort('first_name')}>
                Name<SortArrow col="first_name" />
              </th>
              <th className="px-4 py-3 text-left text-[11px] text-text-dim uppercase tracking-wider font-semibold">Title</th>
              <th className="px-4 py-3 text-left text-[11px] text-text-dim uppercase tracking-wider font-semibold cursor-pointer hover:text-text-muted select-none" onClick={() => toggleSort('current_company')}>
                Company<SortArrow col="current_company" />
              </th>
              <th className="px-4 py-3 text-left text-[11px] text-text-dim uppercase tracking-wider font-semibold">Role</th>
              <th className="px-4 py-3 text-left text-[11px] text-text-dim uppercase tracking-wider font-semibold cursor-pointer hover:text-text-muted select-none" onClick={() => toggleSort('seniority_level')}>
                Seniority<SortArrow col="seniority_level" />
              </th>
              <th className="px-4 py-3 text-left text-[11px] text-text-dim uppercase tracking-wider font-semibold">Source</th>
              <th className="px-4 py-3 text-left text-[11px] text-text-dim uppercase tracking-wider font-semibold">LinkedIn</th>
            </tr>
          </thead>
          <tbody>
            {(activeRole ? candidates : []).map((c, i) => (
              <tr key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={`border-b border-border/30 cursor-pointer transition-colors hover:bg-surface-2/60 ${i % 2 === 0 ? '' : 'bg-surface-2/20'}`}
              >
                <td className="px-4 py-3 font-medium text-text-primary">{c.first_name} {c.last_name}</td>
                <td className="px-4 py-3 text-text-muted max-w-[250px] truncate" title={c.current_title}>{c.current_title || '-'}</td>
                <td className="px-4 py-3 text-text-primary">{c.current_company || '-'}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-brand-light/10 text-brand-light">{c.source_company_category || '-'}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${seniorityColor(c.seniority_level)}`}>{c.seniority_level || '-'}</span>
                </td>
                <td className="px-4 py-3 text-text-dim text-xs">{c.search_source || '-'}</td>
                <td className="px-4 py-3">
                  {c.linkedin_url ? (
                    <a href={c.linkedin_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                      className="text-brand-light hover:text-brand-mid text-xs">Link</a>
                  ) : <span className="text-text-dim text-xs">-</span>}
                </td>
              </tr>
            ))}
            {!activeRole && (
              <tr>
                <td colSpan={7} className="px-4 py-16 text-center text-text-dim">
                  <div className="text-lg mb-2">Select a role above to view candidates</div>
                  <div className="text-sm">Click any role chip to filter the table</div>
                </td>
              </tr>
            )}
            {activeRole && candidates.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-text-dim">No candidates found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {activeRole && total > 100 && (
        <div className="flex justify-between items-center mt-4 text-sm text-text-dim">
          <span>Page {page} of {Math.ceil(total / 100)}</span>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 bg-surface border border-border rounded-lg disabled:opacity-30 hover:border-brand-mid/40 transition-colors">Prev</button>
            <button disabled={page * 100 >= total} onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 bg-surface border border-border rounded-lg disabled:opacity-30 hover:border-brand-mid/40 transition-colors">Next</button>
          </div>
        </div>
      )}

      <DetailPanel candidateId={selectedId} onClose={() => setSelectedId(null)} onUpdate={loadCandidates} />
    </div>
  );
}
