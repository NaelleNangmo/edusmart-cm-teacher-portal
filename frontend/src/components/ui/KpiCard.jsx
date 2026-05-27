export default function KpiCard({ icon, value, label, badgeText, badgeClass, valueColor }) {
  return (
    <div className="kpi-d">
      <div className="kpi-d-top">
        <div className="kpi-d-icon">{icon}</div>
        {badgeText && <span className={`kpi-d-badge badge ${badgeClass || 'badge-blue'}`}>{badgeText}</span>}
      </div>
      <div className="kpi-d-value" style={valueColor ? { color: valueColor } : {}}>
        {value ?? '—'}
      </div>
      <div className="kpi-d-label">{label}</div>
    </div>
  );
}
