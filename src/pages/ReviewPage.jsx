import { useState, useEffect, useCallback } from 'react';
import { api } from '../api.js';
import Badge from '../components/Badge.jsx';
import DetailPanel from '../components/DetailPanel.jsx';

export default function ReviewPage({ onUpdate }) {
  const [candidates, setCandidates] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [reason, setReason] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  const load = useCallback(async () => {
    const params = { page, limit: 50 };
    if (reason) params.reason = reason;
    const data = await api.getReview(params);
    setCandidates(data.candidates);
    setTotal(data.total);
  }, [page, reason]);

  useEffect(() => { load(); }, [load]);

  const approveAll = async () => {
    if (!confirm(`Approve all ${reason || 'review'} candidates?`)) return;
    await api.approveAll(reason || undefined);
    load();
    onUpdate?.();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">Review Queue</h2>
          <p className="text-text-muted text-sm mt-1">{total} candidates need review</p>
        </div>
        <div className="flex gap-3">
          <select value={reason} onChange={e => { setReason(e.target.value); setPage(1); }}
            className="bg-surface-2 border border-border text-text-primary px-3 py-2 rounded-md text-sm focus:outline-none focus:border-brand-mid">
            <option value="">All Reasons</option>
            <option value="location_unclear">Location Unclear</option>
            <option value="experience_unclear">Experience Unclear</option>
            <option value="title_unclear">Title Unclear</option>
            <option value="low_confidence_score">Low Confidence Score</option>
            <option value="ambiguous_domain">Ambiguous Domain</option>
          </select>
          <button onClick={approveAll}
            className="px-4 py-2 bg-success text-white rounded-md text-sm font-medium hover:bg-success/80 transition-colors">
            Approve All Visible
          </button>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="p-3 text-left text-[11px] text-text-dim uppercase">Name</th>
              <th className="p-3 text-left text-[11px] text-text-dim uppercase">Title</th>
              <th className="p-3 text-left text-[11px] text-text-dim uppercase">Company</th>
              <th className="p-3 text-left text-[11px] text-text-dim uppercase">Source</th>
              <th className="p-3 text-left text-[11px] text-text-dim uppercase">Score</th>
              <th className="p-3 text-left text-[11px] text-text-dim uppercase">Reason</th>
              <th className="p-3 text-left text-[11px] text-text-dim uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map(c => (
              <tr key={c.id} className="border-b border-border/30 hover:bg-surface-2 transition-colors">
                <td className="p-3 font-medium cursor-pointer" onClick={() => setSelectedId(c.id)}>
                  {c.linkedin_url ? (
                    <a href={c.linkedin_url} target="_blank" className="text-brand-light hover:underline">{c.first_name} {c.last_name}</a>
                  ) : `${c.first_name} ${c.last_name}`}
                </td>
                <td className="p-3 text-text-muted max-w-[200px] truncate">{c.current_title || '-'}</td>
                <td className="p-3 text-text-muted">{c.current_company || '-'}</td>
                <td className="p-3 text-text-muted">{c.source_company || '-'}</td>
                <td className="p-3">
                  <span className={`font-bold ${c.match_score >= 60 ? 'text-success' : c.match_score >= 30 ? 'text-warning' : 'text-danger'}`}>
                    {c.match_score}
                  </span>
                </td>
                <td className="p-3"><span className="px-2 py-0.5 rounded text-[10px] font-medium bg-warning/20 text-warning">{c.manual_review_reason}</span></td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <button onClick={async () => { await api.approveCandidate(c.id); load(); onUpdate?.(); }}
                      className="px-2 py-1 bg-success/20 text-success rounded text-xs font-medium hover:bg-success/30">Approve</button>
                    <button onClick={async () => { await api.rejectCandidate(c.id); load(); onUpdate?.(); }}
                      className="px-2 py-1 bg-danger/20 text-danger rounded text-xs font-medium hover:bg-danger/30">Reject</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4 text-sm text-text-dim">
        <span>{total} total</span>
        <div className="flex gap-2">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
            className="px-3 py-1.5 bg-surface-2 border border-border rounded disabled:opacity-30">Prev</button>
          <button disabled={page * 50 >= total} onClick={() => setPage(p => p + 1)}
            className="px-3 py-1.5 bg-surface-2 border border-border rounded disabled:opacity-30">Next</button>
        </div>
      </div>

      <DetailPanel candidateId={selectedId} onClose={() => setSelectedId(null)} onUpdate={() => { load(); onUpdate?.(); }} />
    </div>
  );
}
