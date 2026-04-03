import { useState, useEffect } from 'react';
import { api } from './api.js';
import DashboardPage from './pages/DashboardPage.jsx';
import CandidatesPage from './pages/CandidatesPage.jsx';
import RoleMatcherPage from './pages/RoleMatcherPage.jsx';
import CompanyMapPage from './pages/CompanyMapPage.jsx';
import ReviewPage from './pages/ReviewPage.jsx';

const TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'candidates', label: 'Candidates' },
  { id: 'roles', label: 'By Role' },
  { id: 'companies', label: 'Company Map' },
  { id: 'review', label: 'Review Queue' },
];

export default function App() {
  const [tab, setTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [roleFilter, setRoleFilter] = useState(null);
  const [companyFilter, setCompanyFilter] = useState(null);

  const refreshStats = () => api.getStats().then(setStats);
  useEffect(() => { refreshStats(); }, []);

  const switchToRole = (role) => { setRoleFilter(role); setTab('candidates'); };
  const switchToCompany = (company) => { setCompanyFilter(company); setTab('candidates'); };

  const now = new Date();
  const clock = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    + ' ' + now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="bg-surface border-b border-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold">
            <span className="text-brand-light">Innovare</span>
            <span className="text-text-muted"> | </span>
            <span className="text-text-primary">Voice AI Talent Pipeline</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-text-dim mono">{clock}</span>
          <button onClick={() => api.exportCSV()} className="px-3 py-1.5 bg-brand-mid text-white rounded-md text-sm font-medium hover:bg-brand-deep transition-colors">
            Export CSV
          </button>
        </div>
      </header>

      {/* Tabs */}
      <nav className="bg-surface border-b border-border px-6 flex gap-0 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); if (t.id !== 'candidates') { setRoleFilter(null); setCompanyFilter(null); } }}
            className={`px-5 py-3 text-sm font-medium transition-all border-b-2 whitespace-nowrap ${
              tab === t.id
                ? 'text-brand-light border-brand-light'
                : 'text-text-muted border-transparent hover:text-text-primary'
            }`}
          >
            {t.label}
            {t.id === 'review' && stats?.reviewQueue > 0 && (
              <span className="ml-2 px-1.5 py-0.5 bg-warning/20 text-warning rounded text-[10px] font-bold">
                {stats.reviewQueue}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main className="max-w-[1600px] mx-auto p-6">
        {tab === 'dashboard' && <DashboardPage stats={stats} onRefresh={refreshStats} onSwitchRole={switchToRole} />}
        {tab === 'candidates' && <CandidatesPage initialRole={roleFilter} initialCompany={companyFilter} onClearFilters={() => { setRoleFilter(null); setCompanyFilter(null); }} />}
        {tab === 'roles' && <RoleMatcherPage onSelectRole={switchToRole} />}
        {tab === 'companies' && <CompanyMapPage onSelectCompany={switchToCompany} />}
        {tab === 'review' && <ReviewPage onUpdate={refreshStats} />}
      </main>
    </div>
  );
}
