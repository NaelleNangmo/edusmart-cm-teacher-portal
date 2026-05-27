import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import KpiCard from '../../components/ui/KpiCard';
import ProgressBar from '../../components/ui/ProgressBar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const ACT_ICONS = { note: { cls: 'act-note', icon: '📊' }, absence: { cls: 'act-abs', icon: '📅' }, message: { cls: 'act-msg', icon: '📨' }, appreciation: { cls: 'act-apprec', icon: '💬' } };
const ACT_BADGES = { note: 'badge-blue', absence: 'badge-amber', message: 'badge-cyan', appreciation: 'badge-violet' };
const ACT_LABELS = { note: 'Notes', absence: 'Absences', message: 'Message', appreciation: 'Appréciation' };

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - d) / 60000);
  if (diff < 1) return 'À l\'instant';
  if (diff < 60) return `Il y a ${diff} min`;
  if (diff < 1440) return `Il y a ${Math.floor(diff / 60)}h`;
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
}

export default function DashboardEnseignant() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-enseignant'],
    queryFn: () => api.get('/dashboard/enseignant').then(r => r.data),
    enabled: !!user,
  });

  if (isLoading) return <LoadingSpinner text="Chargement du dashboard…" />;

  const { kpis = {}, avancement_saisie = [], activite_recente = [] } = data || {};
  const progressColors = ['var(--primary)', 'var(--indigo)', 'var(--cyan)'];

  return (
    <>
      {/* Greeting */}
      <div className="dash-greeting">
        <div className="dash-greet-sub">Bonjour 👋</div>
        <div className="dash-greet-name">
          {user ? `${user.role === 'enseignant' ? 'M./Mme' : ''} ${user.prenom} ${user.nom}`.trim() : '—'}
        </div>
        <div className="dash-meta-chips">
          <div className="dash-chip">📚 Mathématiques</div>
          <div className="dash-chip">🏫 {avancement_saisie.length} classes assignées</div>
          <div className="dash-chip">📅 Trimestre 2 · 2024–2025</div>
        </div>
      </div>

      <div className="content-body">
        {/* KPIs */}
        <div className="grid-4" style={{ marginBottom: 20 }}>
          <KpiCard icon="👩‍🎓" value={kpis.nb_eleves} label="Élèves au total" badgeText="T2" badgeClass="badge-blue" />
          <KpiCard icon="📊" value={kpis.moyenne_generale} label="Moyenne générale / 20" badgeText="Moy." badgeClass="badge-teal" valueColor="var(--primary-light)" />
          <KpiCard icon="📅" value={kpis.absences_non_justifiees} label="Absences non justifiées" badgeText={`⚠️ ${kpis.absences_non_justifiees}`} badgeClass="badge-amber" valueColor="var(--amber)" />
          <KpiCard icon="📨" value={kpis.messages_non_lus} label="Messages non lus" badgeText="Non lus" badgeClass="badge-rose" valueColor="var(--rose)" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>
          {/* Colonne gauche */}
          <div>
            {/* Accès rapides */}
            <div className="sec-label">Accès rapides</div>
            <div className="qa-grid" style={{ marginBottom: 20 }}>
              {[
                { to: '/classes', icon: '🏫', label: 'Mes Classes', sub: `${avancement_saisie.length} assignées · T2` },
                { to: '/classes', icon: '✏️', label: 'Saisir notes', sub: 'DS, Interro…' },
                { to: '/absences', icon: '📅', label: "Faire l'appel", sub: "Aujourd'hui" },
                { to: '/messagerie', icon: '📨', label: 'Messagerie', sub: `${kpis.messages_non_lus || 0} non lus` },
              ].map(({ to, icon, label, sub }) => (
                <div key={label} className="qa-card" onClick={() => navigate(to)}>
                  <div className="qa-icon">{icon}</div>
                  <div className="qa-label">{label}</div>
                  <div className="qa-sub">{sub}</div>
                </div>
              ))}
            </div>

            {/* Activité récente */}
            <div className="card">
              <div className="card-title">Activité récente</div>
              {activite_recente.length === 0 && (
                <div style={{ fontSize: 13, color: 'var(--text3)', textAlign: 'center', padding: '20px 0' }}>Aucune activité récente</div>
              )}
              {activite_recente.map((act, i) => {
                const { cls, icon } = ACT_ICONS[act.type] || { cls: 'act-note', icon: '📌' };
                return (
                  <div key={i} className="act-row">
                    <div className={`act-dot ${cls}`}>{icon}</div>
                    <div className="act-info">
                      <div className="act-title">{act.titre} — {act.detail}</div>
                      <div className="act-sub">{timeAgo(act.date)}</div>
                    </div>
                    <span className={`badge ${ACT_BADGES[act.type] || 'badge-blue'}`}>
                      {ACT_LABELS[act.type] || act.type}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Colonne droite */}
          <div>
            {/* Avancement saisie */}
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-title">Avancement saisie notes</div>
              {avancement_saisie.map((c, i) => (
                <ProgressBar
                  key={c.classe_id}
                  label={c.classe_nom}
                  value={c.eleves_notes}
                  max={c.total_eleves}
                  color={progressColors[i % progressColors.length]}
                  suffix={`${c.pourcentage}%`}
                />
              ))}
              {avancement_saisie.length === 0 && (
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>Aucune classe assignée</div>
              )}
            </div>

            {/* Stack technique */}
            <div className="card">
              <div className="card-title">Stack technique</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {['⚛️ React.js + Router', '🔗 Axios + Context API', '🗄️ Node.js + Express', '🐘 PostgreSQL', '🔐 JWT Auth (bcrypt)', '📱 Responsive Web'].map(t => (
                  <div key={t} className="tag">{t}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
