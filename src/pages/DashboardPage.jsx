import StatCard from '../components/StatCard.jsx';
import Badge from '../components/Badge.jsx';

export default function DashboardPage({ stats, onRefresh, onSwitchRole }) {
  if (!stats) return <div className="text-text-dim">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Pipeline Dashboard</h2>
        <button onClick={onRefresh} className="px-3 py-1.5 bg-surface-2 border border-border text-text-muted rounded-md text-sm hover:border-brand-mid/60 hover:text-text-primary transition-all">
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <StatCard label="Total Candidates" value={stats.totalCandidates} color="brand-light" />
        <StatCard label="Passed Filters" value={stats.passedFilters} color="success" />
        <StatCard label="Review Queue" value={stats.reviewQueue} color="warning" />
        <StatCard label="Companies Searched" value={stats.companiesSearched} sub={`${stats.companiesPending} remaining`} />
        <StatCard label="Dedup Reference" value={stats.existingDedup} color="text-muted" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Role Breakdown */}
        <div className="bg-surface border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-text-muted mb-3 uppercase tracking-wider">By Role Category</h3>
          <div className="space-y-2">
            {stats.byCategory?.map(item => (
              <button
                key={item.label}
                onClick={() => onSwitchRole?.(item.label)}
                className="w-full flex justify-between items-center py-1.5 px-2 rounded hover:bg-surface-2 transition-colors text-left"
              >
                <Badge text={item.label || 'Unknown'} />
                <span className="text-brand-light font-bold text-sm">{item.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Top Source Companies */}
        <div className="bg-surface border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-text-muted mb-3 uppercase tracking-wider">Top Source Companies</h3>
          <div className="space-y-1">
            {stats.bySource?.slice(0, 15).map((item, i) => (
              <div key={item.label} className="flex justify-between items-center py-1.5 px-2 border-b border-border/50 last:border-0">
                <span className="text-sm text-text-primary">{item.label}</span>
                <span className="text-brand-light font-bold text-sm">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Score Distribution + Seniority */}
        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-lg p-4">
            <h3 className="text-sm font-semibold text-text-muted mb-3 uppercase tracking-wider">Score Distribution</h3>
            <div className="space-y-2">
              {stats.scoreDistribution?.map(item => (
                <div key={item.label} className="flex justify-between items-center py-1">
                  <span className="text-sm text-text-muted">Score {item.label}</span>
                  <span className="font-bold text-sm">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface border border-border rounded-lg p-4">
            <h3 className="text-sm font-semibold text-text-muted mb-3 uppercase tracking-wider">By Seniority</h3>
            <div className="space-y-2">
              {stats.bySeniority?.map(item => (
                <div key={item.label} className="flex justify-between items-center py-1">
                  <Badge text={item.label || 'Unknown'} />
                  <span className="font-bold text-sm">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
