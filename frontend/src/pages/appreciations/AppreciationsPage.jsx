import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import ProgressBar from '../../components/ui/ProgressBar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const FORMULATIONS = [
  'Élève sérieux(se), participatif(ve). Bons résultats.',
  'Résultats encourageants. Effort à maintenir.',
  'Manque de rigueur. Plus d\'efforts réguliers nécessaires.',
  'Très bon niveau général. Méthodes solides et autonomie.',
  'Niveau insuffisant. Soutien nécessaire.',
];

export default function AppreciationsPage() {
  const navigate = useNavigate();
  const [classeId, setClasseId] = useState(null);
  const [trimestre, setTrimestre] = useState(2);

  const { data: classes = [] } = useQuery({
    queryKey: ['mes-classes'],
    queryFn: () => api.get('/classes/mes-classes').then(r => r.data.classes),
    onSuccess: (data) => { if (data.length > 0 && !classeId) setClasseId(data[0].id); },
  });

  const selectedId = classeId || classes[0]?.id;

  const { data: apprecData, isLoading } = useQuery({
    queryKey: ['appreciations', selectedId, trimestre],
    queryFn: () => api.get(`/appreciations/${selectedId}`, { params: { trimestre } }).then(r => r.data),
    enabled: !!selectedId,
  });

  const { data: stats } = useQuery({
    queryKey: ['appreciations-stats', selectedId, trimestre],
    queryFn: () => api.get(`/appreciations/${selectedId}/stats`, { params: { trimestre } }).then(r => r.data.stats),
    enabled: !!selectedId,
  });

  if (isLoading && selectedId) return <LoadingSpinner text="Chargement des appréciations…" />;

  const eleves = apprecData?.eleves || [];
  const redigees = eleves.filter(e => e.statut === 'redigee').length;
  const enAttente = eleves.filter(e => e.statut === 'en_attente').length;

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-head-title">Appréciations</div>
          <div className="page-head-sub">
            {classes.find(c => c.id === selectedId)?.nom || '—'} · Trimestre {trimestre}
          </div>
        </div>
        <div className="page-head-actions">
          <select className="select" style={{ width: 'auto', padding: '8px 14px', fontSize: 13 }}
            value={selectedId || ''} onChange={e => setClasseId(parseInt(e.target.value, 10))}>
            {classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>
          <select className="select" style={{ width: 'auto', padding: '8px 14px', fontSize: 13 }}
            value={trimestre} onChange={e => setTrimestre(parseInt(e.target.value, 10))}>
            <option value={1}>Trimestre 1</option>
            <option value={2}>Trimestre 2</option>
            <option value={3}>Trimestre 3</option>
          </select>
          <button className="btn btn-primary" onClick={() => navigate('/appreciations/nouveau')}>
            + Rédiger
          </button>
        </div>
      </div>

      <div className="content-body">
        <div className="two-col">
          <div>
            {/* Barre de progression globale */}
            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{eleves.length} élèves · {classes.find(c => c.id === selectedId)?.nom}</div>
                <div style={{ fontSize: 12, color: 'var(--text2)' }}>
                  <span style={{ color: 'var(--teal)', fontWeight: 700 }}>{redigees}</span> rédigées ·{' '}
                  <span style={{ color: 'var(--amber)', fontWeight: 700 }}>{enAttente}</span> en attente
                </div>
              </div>
              <div className="progress-bg" style={{ height: 7, marginBottom: 6 }}>
                <div className="progress-fill" style={{
                  width: `${eleves.length > 0 ? Math.round((redigees / eleves.length) * 100) : 0}%`,
                  background: 'var(--primary)',
                }} />
              </div>
              <div style={{ fontSize: 10, color: 'var(--text3)', textAlign: 'right' }}>
                {stats?.pourcentage || 0}% complétées
              </div>
            </div>

            {/* Liste élèves */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {eleves.map(el => (
                <div
                  key={el.eleve_id}
                  className="apprec-row"
                  onClick={() => navigate(`/appreciations/${el.eleve_id}`, { state: { el, classeId: selectedId, trimestre } })}
                >
                  <div className={`apprec-dot ${el.statut === 'redigee' ? 'apprec-done' : 'apprec-pending'}`} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="apprec-name">{el.nom} {el.prenom}</div>
                    <div className="apprec-text" style={el.statut === 'en_attente' ? { color: 'var(--text3)', fontStyle: 'italic' } : {}}>
                      {el.texte || 'Aucune appréciation rédigée'}
                    </div>
                  </div>
                  <span className={`badge ${el.statut === 'redigee' ? 'badge-teal' : 'badge-amber'}`}>
                    {el.statut === 'redigee' ? 'Rédigée' : 'En attente'}
                  </span>
                </div>
              ))}
              {eleves.length === 0 && (
                <div style={{ padding: 20, textAlign: 'center', fontSize: 13, color: 'var(--text3)' }}>
                  Aucun élève trouvé.
                </div>
              )}
            </div>
          </div>

          {/* Formulations rapides */}
          <div className="card">
            <div className="card-title">Formulations rapides</div>
            {FORMULATIONS.map((f, i) => (
              <div key={i} className="formulation-card"
                style={i === FORMULATIONS.length - 1 ? { borderColor: 'rgba(248,113,113,0.3)' } : {}}>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
