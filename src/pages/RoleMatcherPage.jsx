import { useState, useEffect, useCallback } from 'react';
import { api } from '../api.js';
import Badge from '../components/Badge.jsx';
import DetailPanel from '../components/DetailPanel.jsx';

const ROLES = [
  { id: 'Speech & Audio ML Engineer', short: 'Speech & Audio ML', color: 'brand-light', gradient: 'from-brand-light/20 to-brand-mid/5' },
  { id: 'ML Engineer', short: 'ML Engineer', color: 'brand-mid', gradient: 'from-brand-mid/20 to-brand-deep/5' },
  { id: 'AI Engineer', short: 'AI Engineer', color: 'purple', gradient: 'from-purple/20 to-purple/5' },
  { id: 'Research Scientist', short: 'Research Scientist', color: 'success', gradient: 'from-success/20 to-success/5' },
  { id: 'Forward Deployed Engineer', short: 'Forward Deployed', color: 'warning', gradient: 'from-warning/20 to-warning/5' },
  { id: 'NLP Engineer', short: 'NLP Engineer', color: 'brand-light', gradient: 'from-brand-light/15 to-brand-light/5' },
  { id: 'Staff Software Engineer', short: 'Staff SWE', color: 'brand-mid', gradient: 'from-brand-mid/15 to-brand-mid/5' },
  { id: 'Senior Software Engineer', short: 'Senior SWE', color: 'text-muted', gradient: 'from-text-dim/15 to-text-dim/5' },
  { id: 'Software Engineer', short: 'SWE', color: 'text-dim', gradient: 'from-text-dim/10 to-text-dim/5' },
  { id: 'Product Engineer', short: 'Product Eng', color: 'purple', gradient: 'from-purple/15 to-purple/5' },
  { id: 'Engineering Leadership', short: 'Leadership', color: 'danger', gradient: 'from-danger/20 to-danger/5' },
  { id: 'Data Scientist / Engineer', short: 'Data Scientist', color: 'success', gradient: 'from-success/15 to-success/5' },
  { id: 'Solutions Engineer', short: 'Solutions Eng', color: 'warning', gradient: 'from-warning/15 to-warning/5' },
  { id: 'Other Engineering', short: 'Other', color: 'text-dim', gradient: 'from-text-dim/10 to-text-dim/5' },
];

export default function RoleMatcherPage() {
  const [stats, setStats] = useState(null);
  const [activeRole, setActiveRole] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('current_company');
  const [sortDir, setSortDir] = useState('ASC');
  const [companyFilter, setCompanyFilter] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => { api.getStats().then(setStats); }, []);

  const getCount = (role) => stats?.byCategory?.find(c => c.label === role)?.count || 0;

  const loadCandidates = useCallback(async () => {
    if (!activeRole) return;
    const params = { page, limit: 100, sortBy, sortDir, category: activeRole };
    if (companyFilter) params.company = companyFilter;
    const data = await api.getCandidates(params);
    setCandidates(data.candidates);
    setTotal(data.total);
  }, [activeRole, page, sortBy, sortDir, companyFilter]);

  useEffect(() => { loadCandidates(); }, [loadCandidates]);

  const selectRole = (role) => {
    if (activeRole === role) { setActiveRole(null); return; }
    setActiveRole(role);
    setPage(1);
    setCompanyFilter('');
  };

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'DESC' ? 'ASC' : 'DESC');
    else { setSortBy(col); setSortDir('ASC'); }
  };

  const exportRole = (e, role) => {
    e.stopPropagation();
    api.exportCSV({ category: role });
  };

  const scoreColor = (s) => s >= 60 ? 'text-success' : s >= 30 ? 'text-warning' : 'text-text-dim';

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Source by Role</h2>
        <p className="text-text-muted text-sm mt-1">Click a role to view candidates. Export as CSV for any role to pull into your outreach workflow.</p>
      </div>

      {/* Role Cards */}
      <div className="space-y-2">
        {ROLES.map(role => {
          const count = getCount(role.id);
          const isActive = activeRole === role.id;

          return (
            <div key={role.id}>
              {/* Role Header Card */}
              <button
                onClick={() => selectRole(role.id)}
                className={`w-full bg-gradient-to-r ${role.gradient} border rounded-lg px-5 py-4 flex items-center justify-between transition-all group ${
                  isActive ? 'border-brand-light bg-surface-2' : 'border-border hover:border-brand-mid/40'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-1 h-8 rounded-full bg-${role.color}`} />
                  <div className="text-left">
                    <h3 className={`font-semibold text-[15px] ${isActive ? 'text-brand-light' : 'text-text-primary group-hover:text-brand-light'} transition-colors`}>
                      {role.id}
                    </h3>
                    <span className="text-xs text-text-dim">{count} candidates</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-2xl font-bold text-${role.color}`}>{count}</span>
                  <button
                    onClick={(e) => exportRole(e, role.id)}
                    className="px-3 py-1.5 bg-surface border border-border rounded-md text-xs font-medium text-text-muted hover:text-brand-light hover:border-brand-mid/60 transition-all"
                  >
                    Export CSV
                  </button>
                  <svg className={`w-4 h-4 text-text-dim transition-transform ${isActive ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Expanded Candidate List */}
              {isActive && (
                <div className="mt-1 bg-surface border border-border rounded-lg overflow-hidden animate-in">
                  {/* Sub-filters */}
                  <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-surface-2/50">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-text-muted">{total} {role.short} candidates</span>
                      <input
                        type="text" placeholder="Filter by company..."
                        value={companyFilter} onChange={e => { setCompanyFilter(e.target.value); setPage(1); }}
                        className="bg-bg border border-border text-text-primary px-2.5 py-1.5 rounded text-xs w-[200px] focus:outline-none focus:border-brand-mid"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setSortBy('first_name'); setSortDir('ASC'); }}
                        className={`px-2 py-1 rounded text-[10px] font-medium ${sortBy === 'first_name' ? 'bg-brand-mid/20 text-brand-light' : 'text-text-dim hover:text-text-muted'}`}>
                        A-Z
                      </button>
                      <button onClick={() => { setSortBy('current_company'); setSortDir('ASC'); }}
                        className={`px-2 py-1 rounded text-[10px] font-medium ${sortBy === 'current_company' ? 'bg-brand-mid/20 text-brand-light' : 'text-text-dim hover:text-text-muted'}`}>
                        Company
                      </button>
                      <button onClick={() => { setSortBy('seniority_level'); setSortDir('DESC'); }}
                        className={`px-2 py-1 rounded text-[10px] font-medium ${sortBy === 'seniority_level' ? 'bg-brand-mid/20 text-brand-light' : 'text-text-dim hover:text-text-muted'}`}>
                        Seniority
                      </button>
                      <button onClick={() => { setSortBy('match_score'); setSortDir('DESC'); }}
                        className={`px-2 py-1 rounded text-[10px] font-medium ${sortBy === 'match_score' ? 'bg-brand-mid/20 text-brand-light' : 'text-text-dim hover:text-text-muted'}`}>
                        Score
                      </button>
                    </div>
                  </div>

                  {/* Table */}
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="px-4 py-2.5 text-left text-[10px] text-text-dim uppercase tracking-wider cursor-pointer hover:text-text-muted" onClick={() => toggleSort('first_name')}>
                          Name {sortBy === 'first_name' && (sortDir === 'ASC' ? '↑' : '↓')}
                        </th>
                        <th className="px-4 py-2.5 text-left text-[10px] text-text-dim uppercase tracking-wider">Title</th>
                        <th className="px-4 py-2.5 text-left text-[10px] text-text-dim uppercase tracking-wider cursor-pointer hover:text-text-muted" onClick={() => toggleSort('current_company')}>
                          Company {sortBy === 'current_company' && (sortDir === 'ASC' ? '↑' : '↓')}
                        </th>
                        <th className="px-4 py-2.5 text-left text-[10px] text-text-dim uppercase tracking-wider cursor-pointer hover:text-text-muted" onClick={() => toggleSort('seniority_level')}>
                          Seniority {sortBy === 'seniority_level' && (sortDir === 'ASC' ? '↑' : '↓')}
                        </th>
                        <th className="px-4 py-2.5 text-left text-[10px] text-text-dim uppercase tracking-wider cursor-pointer hover:text-text-muted" onClick={() => toggleSort('match_score')}>
                          Score {sortBy === 'match_score' && (sortDir === 'ASC' ? '↑' : '↓')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {candidates.map(c => (
                        <tr key={c.id} onClick={() => setSelectedId(c.id)}
                          className="border-b border-border/20 hover:bg-surface-2/70 cursor-pointer transition-colors">
                          <td className="px-4 py-2.5 font-medium">
                            {c.linkedin_url ? (
                              <a href={c.linkedin_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                                className="text-brand-light hover:underline">{c.first_name} {c.last_name}</a>
                            ) : (
                              <span className="text-text-primary">{c.first_name} {c.last_name}</span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-text-muted text-xs max-w-[250px] truncate" title={c.current_title}>{c.current_title || '-'}</td>
                          <td className="px-4 py-2.5 text-text-muted">{c.current_company || '-'}</td>
                          <td className="px-4 py-2.5"><Badge text={c.seniority_level || '-'} /></td>
                          <td className="px-4 py-2.5"><span className={`font-bold ${scoreColor(c.match_score)}`}>{c.match_score}</span></td>
                        </tr>
                      ))}
                      {candidates.length === 0 && (
                        <tr><td colSpan={5} className="px-4 py-8 text-center text-text-dim">No candidates found</td></tr>
                      )}
                    </tbody>
                  </table>

                  {/* Pagination */}
                  {total > 100 && (
                    <div className="px-4 py-3 border-t border-border/50 flex justify-between items-center text-xs text-text-dim">
                      <span>Page {page} of {Math.ceil(total / 100)}</span>
                      <div className="flex gap-1">
                        <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                          className="px-2 py-1 bg-bg border border-border rounded disabled:opacity-30 hover:border-brand-mid/40">Prev</button>
                        <button disabled={page * 100 >= total} onClick={() => setPage(p => p + 1)}
                          className="px-2 py-1 bg-bg border border-border rounded disabled:opacity-30 hover:border-brand-mid/40">Next</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <DetailPanel candidateId={selectedId} onClose={() => setSelectedId(null)} onUpdate={loadCandidates} />
    </div>
  );
}
