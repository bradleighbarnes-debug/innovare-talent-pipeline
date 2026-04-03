import { useState, useEffect, useCallback } from 'react';
import { api } from '../api.js';
import Badge from '../components/Badge.jsx';
import DetailPanel from '../components/DetailPanel.jsx';

export default function CandidatesPage({ initialRole, initialCompany, onClearFilters }) {
  const [candidates, setCandidates] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [search, setSearch] = useState('');
  const [company, setCompany] = useState(initialCompany || '');
  const [seniority, setSeniority] = useState('');
  const [category, setCategory] = useState(initialRole || '');
  const [sortBy, setSortBy] = useState('match_score');
  const [sortDir, setSortDir] = useState('DESC');
  const [selectedId, setSelectedId] = useState(null);
  const [selected, setSelected] = useState(new Set());

  useEffect(() => { if (initialRole) setCategory(initialRole); }, [initialRole]);
  useEffect(() => { if (initialCompany) setCompany(initialCompany); }, [initialCompany]);

  const load = useCallback(async () => {
    const params = { page, limit, sortBy, sortDir };
    if (search) params.search = search;
    if (company) params.company = company;
    if (seniority) params.seniority = seniority;
    if (category) params.category = category;
    const data = await api.getCandidates(params);
    setCandidates(data.candidates);
    setTotal(data.total);
  }, [page, limit, search, company, seniority, category, sortBy, sortDir]);

  useEffect(() => { load(); }, [load]);

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'DESC' ? 'ASC' : 'DESC');
    else { setSortBy(col); setSortDir('ASC'); }
  };

  const toggleSelect = (id) => {
    setSelected(s => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const selectAll = () => {
    if (selected.size === candidates.length) setSelected(new Set());
    else setSelected(new Set(candidates.map(c => c.id)));
  };

  const exportSelected = () => {
    if (category) api.exportCSV({ category });
    else if (company) api.exportCSV({ company });
    else api.exportCSV({});
  };

  const scoreColor = (s) => s >= 60 ? 'text-success' : s >= 30 ? 'text-warning' : 'text-danger';
  const SortIcon = ({ col }) => sortBy === col ? (sortDir === 'ASC' ? ' ↑' : ' ↓') : '';

  const activeFilters = [company, seniority, category].filter(Boolean).length;

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          type="text" placeholder="Search name, title, company..."
          value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="bg-surface-2 border border-border text-text-primary px-3 py-2 rounded-md text-sm min-w-[280px] focus:outline-none focus:border-brand-mid"
        />
        <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}
          className="bg-surface-2 border border-border text-text-primary px-3 py-2 rounded-md text-sm focus:outline-none focus:border-brand-mid">
          <option value="">All Roles</option>
          <option>Speech & Audio ML Engineer</option>
          <option>ML Engineer</option>
          <option>AI Engineer</option>
          <option>Research Scientist</option>
          <option>Forward Deployed Engineer</option>
          <option>NLP Engineer</option>
          <option>Staff Software Engineer</option>
          <option>Senior Software Engineer</option>
          <option>Software Engineer</option>
          <option>Product Engineer</option>
          <option>Engineering Leadership</option>
          <option>Data Scientist / Engineer</option>
          <option>Solutions Engineer</option>
          <option>Other Engineering</option>
        </select>
        <select value={seniority} onChange={e => { setSeniority(e.target.value); setPage(1); }}
          className="bg-surface-2 border border-border text-text-primary px-3 py-2 rounded-md text-sm focus:outline-none focus:border-brand-mid">
          <option value="">All Seniority</option>
          <option>Junior</option>
          <option>Mid-Level</option>
          <option>Senior</option>
          <option>Staff/Principal</option>
          <option>Lead/Manager</option>
          <option>Director+</option>
        </select>
        <input
          type="text" placeholder="Filter by company..."
          value={company} onChange={e => { setCompany(e.target.value); setPage(1); }}
          className="bg-surface-2 border border-border text-text-primary px-3 py-2 rounded-md text-sm min-w-[180px] focus:outline-none focus:border-brand-mid"
        />
        {activeFilters > 0 && (
          <button onClick={() => { setSearch(''); setCompany(''); setSeniority(''); setCategory(''); setPage(1); onClearFilters?.(); }}
            className="px-3 py-2 text-sm text-danger hover:bg-danger/10 rounded-md transition-colors">
            Clear filters
          </button>
        )}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-text-dim text-sm">{total} candidates</span>
          <button onClick={exportSelected}
            className="px-3 py-2 bg-brand-mid text-white rounded-md text-sm font-medium hover:bg-brand-deep transition-colors">
            Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface border border-border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="p-3 text-left">
                <input type="checkbox" checked={selected.size === candidates.length && candidates.length > 0} onChange={selectAll}
                  className="rounded border-border" />
              </th>
              <th className="p-3 text-left text-[11px] text-text-dim uppercase tracking-wider cursor-pointer hover:text-text-primary" onClick={() => toggleSort('first_name')}>
                Name<SortIcon col="first_name" />
              </th>
              <th className="p-3 text-left text-[11px] text-text-dim uppercase tracking-wider cursor-pointer hover:text-text-primary" onClick={() => toggleSort('current_title')}>
                Title<SortIcon col="current_title" />
              </th>
              <th className="p-3 text-left text-[11px] text-text-dim uppercase tracking-wider cursor-pointer hover:text-text-primary" onClick={() => toggleSort('current_company')}>
                Company<SortIcon col="current_company" />
              </th>
              <th className="p-3 text-left text-[11px] text-text-dim uppercase tracking-wider cursor-pointer hover:text-text-primary" onClick={() => toggleSort('source_company')}>
                Source<SortIcon col="source_company" />
              </th>
              <th className="p-3 text-left text-[11px] text-text-dim uppercase tracking-wider">Role</th>
              <th className="p-3 text-left text-[11px] text-text-dim uppercase tracking-wider cursor-pointer hover:text-text-primary" onClick={() => toggleSort('seniority_level')}>
                Seniority<SortIcon col="seniority_level" />
              </th>
              <th className="p-3 text-left text-[11px] text-text-dim uppercase tracking-wider cursor-pointer hover:text-text-primary" onClick={() => toggleSort('match_score')}>
                Score<SortIcon col="match_score" />
              </th>
            </tr>
          </thead>
          <tbody>
            {candidates.map(c => (
              <tr key={c.id} onClick={() => setSelectedId(c.id)}
                className="border-b border-border/30 hover:bg-surface-2 cursor-pointer transition-colors">
                <td className="p-3" onClick={e => e.stopPropagation()}>
                  <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggleSelect(c.id)} className="rounded border-border" />
                </td>
                <td className="p-3 font-medium">
                  {c.linkedin_url ? (
                    <a href={c.linkedin_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                      className="text-brand-light hover:underline">{c.first_name} {c.last_name}</a>
                  ) : (
                    <span>{c.first_name} {c.last_name}</span>
                  )}
                </td>
                <td className="p-3 text-text-muted max-w-[200px] truncate" title={c.current_title}>{c.current_title || '-'}</td>
                <td className="p-3 text-text-muted">{c.current_company || '-'}</td>
                <td className="p-3 text-text-muted">{c.source_company || '-'}</td>
                <td className="p-3"><Badge text={c.source_company_category || 'Other'} /></td>
                <td className="p-3"><Badge text={c.seniority_level || '-'} /></td>
                <td className="p-3">
                  <span className={`font-bold ${scoreColor(c.match_score)}`}>{c.match_score}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4 text-sm text-text-dim">
        <span>Showing {(page-1)*limit + 1}-{Math.min(page*limit, total)} of {total}</span>
        <div className="flex gap-2">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
            className="px-3 py-1.5 bg-surface-2 border border-border rounded text-text-muted hover:text-text-primary disabled:opacity-30">Prev</button>
          <button disabled={page * limit >= total} onClick={() => setPage(p => p + 1)}
            className="px-3 py-1.5 bg-surface-2 border border-border rounded text-text-muted hover:text-text-primary disabled:opacity-30">Next</button>
        </div>
      </div>

      <DetailPanel candidateId={selectedId} onClose={() => setSelectedId(null)} onUpdate={load} />
    </div>
  );
}
