import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import ProgressBar from '../../components/ui/ProgressBar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const CLASSE_ICONS = ['📚', '📐', '🔢', '📖', '🔬'];
const CLASSE_COLORS = [
  'rgba(79,110,247,0.15)', 'rgba(167,139,250,0.15)',
  'rgba(56,189,248,0.15)', 'rgba(45,212,191,0.15)', 'rgba(251,191,36,0.15)',
];
const PROGRESS_COLORS = ['var(--primary)', 'var(--indigo)', 'var(--cyan)'];

export default function MesClasses() {
  const navigate = useNavigate();

  const { data: classes = [], isLoading } = useQuery({
    queryKey: ['mes-classes'],
    queryFn: () => api.get('/classes/mes-classes').then(r => r.data.classes),
  });

  if (isLoading) return <LoadingSpinner text="Chargement des classes…" />;

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-head-title">Mes Classes</div>
          <div className="page-head-sub">{classes.length} classes assignées · Trimestre 2 · 2024–2025</div>
        </div>
      </div>

      <div className="content-body">
        <div className="grid-2">
          {/* Liste des classes */}
          <div>
            <div className="sec-label">Classes assignées</div>
            {classes.map((c, i) => (
              <div
                key={c.id}
                className="classe-card"
                onClick={() => navigate(`/classes/${c.id}/notes`)}
              >
                <div className="classe-icon" style={{ background: CLASSE_COLORS[i % CLASSE_COLORS.length] }}>
                  {CLASSE_ICONS[i % CLASSE_ICONS.length]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="classe-name">{c.nom}</div>
                  <div className="classe-matiere">
                    {c.matiere_nom} · Coeff {c.coefficient} · {c.heures_semaine}h/sem
                  </div>
                  <div style={{ marginTop: 7, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {c.nb_evaluations > 0
                      ? <span className="badge badge-blue">DS{c.nb_evaluations} fait</span>
                      : <span className="badge badge-amber">Aucune éval.</span>
                    }
                    {c.nb_eleves && <span className="badge badge-teal">{c.nb_eleves} élèves</span>}
                  </div>
                </div>
                <div className="classe-count">{c.nb_eleves} él.</div>
              </div>
            ))}

            {classes.length === 0 && (
              <div style={{ fontSize: 13, color: 'var(--text3)', padding: '20px 0' }}>
                Aucune classe assignée pour ce trimestre.
              </div>
            )}
          </div>

          {/* Progression appréciations */}
          <div>
            <div className="card">
              <div className="card-title">Progression appréciations</div>
              {classes.map((c, i) => (
                <ProgressBar
                  key={c.id}
                  label={c.nom}
                  value={parseInt(c.nb_appreciations, 10) || 0}
                  max={parseInt(c.nb_eleves, 10) || 1}
                  color={PROGRESS_COLORS[i % PROGRESS_COLORS.length]}
                  suffix={`${c.nb_appreciations || 0}/${c.nb_eleves || 0}`}
                />
              ))}
            </div>

            <div className="card" style={{ marginTop: 16 }}>
              <div className="card-title">Actions rapides</div>
              <button
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginBottom: 8 }}
                onClick={() => navigate('/absences')}
              >
                📅 Faire l'appel du jour
              </button>
              <button
                className="btn btn-outline"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => navigate('/appreciations')}
              >
                💬 Rédiger des appréciations
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
