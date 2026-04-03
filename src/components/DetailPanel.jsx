import { useEffect, useState } from 'react';
import { api } from '../api.js';
import Badge from './Badge.jsx';

export default function DetailPanel({ candidateId, onClose, onUpdate }) {
  const [c, setC] = useState(null);

  useEffect(() => {
    if (candidateId) api.getCandidate(candidateId).then(setC);
  }, [candidateId]);

  if (!candidateId) return null;

  const Field = ({ label, children }) => (
    <div className="mb-3">
      <div className="text-[10px] text-text-dim uppercase tracking-wider mb-0.5">{label}</div>
      <div className="text-sm text-text-primary">{children || '-'}</div>
    </div>
  );

  const scoreColor = c?.match_score >= 60 ? 'text-success' : c?.match_score >= 30 ? 'text-warning' : 'text-danger';

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 w-[480px] h-full bg-surface border-l border-border z-50 overflow-y-auto p-6">
        {!c ? (
          <div className="text-text-dim">Loading...</div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">{c.first_name} {c.last_name}</h2>
              <button onClick={onClose} className="text-text-dim hover:text-text-primary text-sm px-2 py-1 rounded border border-border hover:border-text-dim">Close</button>
            </div>

            {c.linkedin_url && (
              <Field label="LinkedIn">
                <a href={c.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-brand-light hover:underline">{c.linkedin_url}</a>
              </Field>
            )}
            <Field label="Title">{c.current_title}</Field>
            <Field label="Company">{c.current_company}</Field>
            <Field label="Source Company">{c.source_company} ({c.source_company_category})</Field>
            <Field label="Location">{[c.location_city, c.location_state, c.location_country].filter(Boolean).join(', ')}</Field>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <Field label="Seniority"><Badge text={c.seniority_level || 'Unknown'} /></Field>
              <Field label="Role Category"><Badge text={c.source_company_category || c.role_category || 'Unknown'} /></Field>
            </div>

            <Field label="Match Score">
              <span className={`text-2xl font-bold ${scoreColor}`}>{c.match_score}</span>
              <span className="text-text-dim text-sm"> / 100</span>
            </Field>
            <Field label="Best Fit JD">{c.best_fit_jd}</Field>
            <Field label="Voice AI Summary">{c.voice_ai_summary}</Field>

            <Field label="Domain Tags">
              <div className="flex flex-wrap gap-1">
                {(Array.isArray(c.domain_tags) ? c.domain_tags : []).map((t, i) => (
                  <Badge key={i} text={t} />
                ))}
              </div>
            </Field>

            <Field label="Search Source">{c.search_source}</Field>

            {c.email && <Field label="Email">{c.email}</Field>}
            {c.phone && <Field label="Phone">{c.phone}</Field>}

            {c.needs_manual_review ? (
              <div className="mt-4 p-3 bg-warning/10 border border-warning/30 rounded-lg">
                <div className="text-warning font-medium text-sm mb-2">Needs Review: {c.manual_review_reason}</div>
                <div className="flex gap-2">
                  <button onClick={async () => { await api.approveCandidate(c.id); onUpdate?.(); onClose(); }}
                    className="px-3 py-1.5 bg-success text-white rounded text-sm font-medium hover:bg-success/80">Approve</button>
                  <button onClick={async () => { await api.rejectCandidate(c.id); onUpdate?.(); onClose(); }}
                    className="px-3 py-1.5 bg-danger text-white rounded text-sm font-medium hover:bg-danger/80">Reject</button>
                </div>
              </div>
            ) : null}

            <details className="mt-4">
              <summary className="text-text-dim text-xs cursor-pointer">Raw JSON</summary>
              <pre className="text-[10px] text-text-dim mt-2 max-h-60 overflow-auto bg-bg p-2 rounded">
                {JSON.stringify(c.raw_json, null, 2)}
              </pre>
            </details>
          </>
        )}
      </div>
    </>
  );
}
