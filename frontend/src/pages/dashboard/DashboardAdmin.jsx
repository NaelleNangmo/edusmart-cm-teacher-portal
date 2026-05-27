import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import KpiCard from '../../components/ui/KpiCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

function getInitials(nom = '', prenom = '') {
  return `${prenom[0] || ''}${nom[0] || ''}`.toUpperCase();
}

const AV_COLORS = ['var(--primary)', 'var(--violet)', 'var(--rose)'];

export default function DashboardAdmin() {
  const navigate = useNavigate();

  const { data: dash, isLoading: loadDash } = useQuery({
    queryKey: ['dashboard-admin'],
    queryFn: () => api.get('/dashboard/admin').then(r => r.data),
  });

  const { data: alertesData, isLoading: loadAlertes } = useQuery({
    queryKey: ['admin-alertes'],
    queryFn: () => api.get('/admin/alertes').then(r => r.data.alertes),
  });

  const { data: enseignants = [] } = useQuery({
    queryKey: ['admin-enseignants'],
    queryFn: () => api.get('/admin/enseignants').then(r => r.data.enseignants),
  });

  if (loadDash || loadAlertes) return <LoadingSpinner text="Chargement dashboard admin…" />;

  const kpis = dash?.kpis || {};
  const alertes = alertesData || [];

  const alerteStyle = { error: 'alert-red', warning: 'alert-amber', info: 'alert-blue' };
  const alerteIcon = { error: '🚨', warning: '⚠️', info: 'ℹ️' };
  const alerteColor = { error: 'var(--red)', warning: 'var(--amber)', info: 'var(--primary-light)' };

  return (
    <>
      <div className="dash-greeting">
        <div className="dash-greet-sub">Proviseur Principal</div>
        <div className="dash-greet-name">Lycée Bilingue d'Essos</div>
        <div className="dash-meta-chips">
          <div className="dash-chip">🏫 Vue globale établissement</div>
          <div className="dash-chip">📅 Trimestre 2 · 2024–2025</div>
        </div>
      </div>

      <div className="content-body">
        <div className="grid-4" style={{ marginBottom: 20 }}>
          <KpiCard icon="👨‍🏫" value={kpis.nb_enseignants} label="Enseignants actifs" />
          <KpiCard icon="👩‍🎓" value={kpis.nb_eleves} label="Élèves inscrits T2" />
          <KpiCard icon="🏫" value={kpis.nb_classes} label="Classes (6e → Tle)" />
          <KpiCard icon="📚" value={kpis.nb_matieres} label="Matières enseignées" />
        </div>

        <div className="grid-2">
          {/* Alertes */}
          <div>
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-title">Alertes & Signalements</div>
              {alertes.map((a, i) => (
                <div key={i} className={`alert-row ${alerteStyle[a.type] || 'alert-blue'}`}>
                  <span style={{ fontSize: 20 }}>{alerteIcon[a.type] || 'ℹ️'}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: alerteColor[a.type] }}>{a.titre}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>{a.description}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => navigate('/dashboard/admin')}>+ Enseignant</button>
              <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => navigate('/dashboard/admin')}>+ Classe</button>
            </div>
          </div>

          {/* Enseignants récents */}
          <div className="card">
            <div className="card-title">Enseignants récents</div>
            {enseignants.slice(0, 5).map((e, i) => (
              <div key={e.id} className="admin-user-row">
                <div className="admin-av" style={{ background: AV_COLORS[i % AV_COLORS.length] }}>
                  {getInitials(e.nom, e.prenom)}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="admin-user-name">{e.nom} {e.prenom}</div>
                  <div className="admin-user-role">{e.nb_classes} classe(s)</div>
                </div>
                <span className="badge badge-teal">Actif</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
