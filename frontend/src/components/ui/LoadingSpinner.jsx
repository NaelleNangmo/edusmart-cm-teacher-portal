export default function LoadingSpinner({ text = 'Chargement…' }) {
  return (
    <div className="loading-center" style={{ flexDirection: 'column', gap: 12 }}>
      <div className="spinner" />
      <span style={{ fontSize: 12, color: 'var(--text3)' }}>{text}</span>
    </div>
  );
}
