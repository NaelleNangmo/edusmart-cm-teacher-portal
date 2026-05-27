export default function ProgressBar({ label, value, max, color = 'var(--primary)', suffix }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
        <span>{label}</span>
        <span style={{ color: 'var(--text2)', fontFamily: 'DM Mono, monospace' }}>
          {suffix || `${pct}%`}
        </span>
      </div>
      <div className="progress-bg">
        <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}
