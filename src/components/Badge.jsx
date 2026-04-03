const COLORS = {
  'ML Engineer': 'bg-brand-light/20 text-brand-light',
  'AI Engineer': 'bg-brand-mid/20 text-brand-mid',
  'Research Scientist': 'bg-purple/20 text-purple',
  'Speech / Audio Engineer': 'bg-success/20 text-success',
  'Forward Deployed Engineer': 'bg-warning/20 text-warning',
  'NLP / Conversational AI': 'bg-brand-deep/20 text-brand-light',
  'Product Engineer': 'bg-text-dim/20 text-text-muted',
  'Data Scientist': 'bg-purple/20 text-purple',
  'Leadership': 'bg-danger/20 text-danger',
  'Staff+ SWE': 'bg-brand-mid/20 text-brand-mid',
  'Senior SWE': 'bg-text-dim/20 text-text-muted',
  'SWE': 'bg-text-dim/15 text-text-dim',
  'Solutions Engineer': 'bg-warning/20 text-warning',
  'Other': 'bg-text-dim/10 text-text-dim',
  // Seniority
  'Director+': 'bg-danger/20 text-danger',
  'Staff/Principal': 'bg-purple/20 text-purple',
  'Lead/Manager': 'bg-warning/20 text-warning',
  'Senior': 'bg-brand-light/20 text-brand-light',
  'Mid-Level': 'bg-text-dim/20 text-text-muted',
  'Junior': 'bg-text-dim/10 text-text-dim',
};

export default function Badge({ text, className = '' }) {
  const color = COLORS[text] || 'bg-text-dim/15 text-text-dim';
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${color} ${className}`}>
      {text}
    </span>
  );
}
