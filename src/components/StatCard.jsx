export default function StatCard({ label, value, sub, color = 'brand-light', onClick }) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      onClick={onClick}
      className={`bg-surface border border-border rounded-lg p-4 transition-all ${
        onClick ? 'cursor-pointer hover:border-brand-mid/60 hover:bg-surface-2 active:scale-[0.98]' : ''
      }`}
    >
      <div className="text-xs text-text-dim uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-3xl font-bold text-${color}`}>{value}</div>
      {sub && <div className="text-xs text-text-dim mt-1">{sub}</div>}
    </Tag>
  );
}
