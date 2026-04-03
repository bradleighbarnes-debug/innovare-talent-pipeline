import { useState, useEffect } from 'react';
import { api } from '../api.js';

export default function CompanyMapPage({ onSelectCompany }) {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => { api.getCompanies().then(d => setCompanies(d.companies)); }, []);

  const filtered = companies.filter(c =>
    c.company_name.toLowerCase().includes(search.toLowerCase()) ||
    (c.company_category || '').toLowerCase().includes(search.toLowerCase())
  );

  const statusColor = (s) => s === 'completed' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning';

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">Company Map — Voice AI Market</h2>
          <p className="text-text-muted text-sm mt-1">{companies.length} companies tracked | Click any company to see its candidates</p>
        </div>
        <input
          type="text" placeholder="Search companies..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="bg-surface-2 border border-border text-text-primary px-3 py-2 rounded-md text-sm min-w-[240px] focus:outline-none focus:border-brand-mid"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filtered.map(c => (
          <button
            key={c.company_name}
            onClick={() => onSelectCompany(c.company_name)}
            className="bg-surface border border-border rounded-lg p-4 text-left hover:border-brand-mid/60 hover:bg-surface-2 transition-all active:scale-[0.98]"
          >
            <div className="font-semibold text-text-primary text-sm">{c.company_name}</div>
            <div className="text-[11px] text-text-dim mt-1">
              {c.company_category || ''} | {c.employees_est || '?'} emp
            </div>
            <div className="flex justify-between items-center mt-3">
              <span className="text-xl font-bold text-brand-light">{c.actual_candidates || 0}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${statusColor(c.status)}`}>
                {c.status || 'pending'}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
