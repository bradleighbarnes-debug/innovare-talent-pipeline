import { useState, useEffect } from 'react';
import { api } from './api.js';
import DashboardPage from './pages/DashboardPage.jsx';
import CandidatesPage from './pages/CandidatesPage.jsx';
import RoleMatcherPage from './pages/RoleMatcherPage.jsx';
import CompanyMapPage from './pages/CompanyMapPage.jsx';
import ReviewPage from './pages/ReviewPage.jsx';

const TABS = [
  { id: 'dashboard', label: 'Home' },
  { id: 'roles', label: 'By Role' },
  { id: 'candidates', label: 'All Candidates' },
  { id: 'companies', label: 'Company Map' },
  { id: 'review', label: 'Review Queue' },
];

export default function App() {
  const [tab, setTab] = useState('roles');
  const [stats, setStats] = useState(null);
  const [roleFilter, setRoleFilter] = useState(null);
  const [companyFilter, setCompanyFilter] = useState(null);

  const refreshStats = () => api.getStats().then(setStats).catch(() => {});
  useEffect(() => { refreshStats(); }, []);

  const switchToRole = (role) => { setRoleFilter(role); setTab('candidates'); };
  const switchToCompany = (company) => { setCompanyFilter(company); setTab('candidates'); };

  const [clock, setClock] = useState('');
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setClock(
        now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
        '  ' + now.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="bg-surface border-b border-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-light to-brand-deep flex items-center justify-center text-white font-bold text-sm">I</div>
          <div>
            <div className="text-sm font-semibold">
              <span className="text-brand-light">Innovare</span>
              <span className="text-text-dim"> AI Talent Partners</span>
            </div>
          </div>
        </div>
        <div className="text-lg font-semibold text-text-primary">Voice AI Talent Pipeline</div>
        <div className="text-xs text-text-dim mono">{clock}</div>
      </header>

      {/* Tabs */}
      <nav className="bg-surface border-b border-border px-6 flex gap-1">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); if (t.id !== 'candidates') { setRoleFilter(null); setCompanyFilter(null); } }}
            className={`px-5 py-3 text-sm font-medium transition-all border-b-2 ${
              tab === t.id
                ? 'text-brand-light border-brand-light'
                : 'text-text-muted border-transparent hover:text-text-primary hover:border-text-dim/30'
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
      <main className="max-w-[1600px] mx-auto px-6 py-6">
        {tab === 'dashboard' && <DashboardPage stats={stats} onRefresh={refreshStats} onSwitchRole={switchToRole} />}
        {tab === 'candidates' && <CandidatesPage initialRole={roleFilter} initialCompany={companyFilter} onClearFilters={() => { setRoleFilter(null); setCompanyFilter(null); }} />}
        {tab === 'roles' && <RoleMatcherPage onSelectRole={switchToRole} />}
        {tab === 'companies' && <CompanyMapPage onSelectCompany={switchToCompany} />}
        {tab === 'review' && <ReviewPage onUpdate={refreshStats} />}
      </main>
    </div>
  );
}
