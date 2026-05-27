import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

function noteClass(v) {
  const n = parseFloat(v);
  if (n >= 14) return 'note-good';
  if (n >= 10) return 'note-mid';
  return 'note-low';
}
function moyClass(v) {
  const n = parseFloat(v);
  if (n >= 14) return 'moy-excellent';
  if (n >= 12) return 'moy-bien';
  if (n >= 10) return 'moy-moyen';
  return 'moy-faible';
}
function rankClass(r) {
  if (r === 1) return 'gold';
  if (r === 2) return 'silver';
  if (r === 3) return 'bronze';
  return '';
}

export default function NotesList() {
  const { classeId } = useParams();
  const navigate = useNavigate();
  const [activeEval, setActiveEval] = useState(null);

  const { data: classeData } = useQuery({
    queryKey: ['classe', classeId],
    queryFn: () => api.get(`/classes/${classeId}`).then(r => r.data.classe),
  });

  const { data: notesData, isLoading } = useQuery({
    queryKey: ['notes', classeId, activeEval],
    queryFn: () => api.get(`/notes/${classeId}`, {
      params: activeEval ? { evaluation_id: activeEval } : {},
    }).then(r => r.data),
  });

  const { data: stats } = useQuery({
    queryKey: ['notes-stats', classeId],
    queryFn: () => api.get(`/notes/${classeId}/stats`).then(r => r.data.stats),
  });

  if (isLoading) return <LoadingSpinner text="Chargement des notes…" />;

  const { evaluations = [], eleves = [], pagination } = notesData || {};

  return (
    <>
      <div className="page-head">
        <div>
          <button className="back-btn" onClick={() => navigate('/classes')}>‹ Mes Classes</button>
          <div className="page-head-title">{classeData?.nom || `Classe ${classeId}`} — Mathématiques</div>
          <div className="page-head-sub">
            {activeEval
              ? `Évaluation sélectionnée · Coeff. ${evaluations.find(e => e.id === activeEval)?.coefficient || '—'}`
              : 'Toutes les évaluations · Trimestre 2'}
          </div>
        </div>
        <div className="page-head-actions">
          <button className="btn btn-outline">📤 Exporter</button>
          <button className="btn btn-primary" onClick={() => navigate(`/classes/${classeId}/notes/saisir`)}>
            + Saisir notes
          </button>
        </div>
      </div>

      <div className="content-body">
        {/* Stats */}
        <div className="notes-stats-grid">
          <div className="note-stat">
            <div className="note-stat-val">{pagination?.total || 0}</div>
            <div className="note-stat-lbl">Élèves</div>
          </div>
          <div className="note-stat">
            <div className="note-stat-val" style={{ color: 'var(--primary-light)' }}>
              {stats?.moyenne_classe || '—'}
            </div>
            <div className="note-stat-lbl">Moy. classe</div>
          </div>
          <div className="note-stat">
            <div className="note-stat-val" style={{ color: 'var(--teal)' }}>
              {stats?.meilleure_note || '—'}
            </div>
            <div className="note-stat-lbl">Meilleure</div>
          </div>
          <div className="note-stat">
            <div className="note-stat-val" style={{ color: 'var(--red)' }}>
              {stats?.note_la_plus_basse || '—'}
            </div>
            <div className="note-stat-lbl">Plus basse</div>
          </div>
        </div>

        {/* Chips évaluations */}
        <div className="eval-chips-row">
          <div
            className={`eval-chip${!activeEval ? ' active' : ''}`}
            onClick={() => setActiveEval(null)}
          >
            Moy. générale
          </div>
          {evaluations.map(ev => (
            <div
              key={ev.id}
              className={`eval-chip${activeEval === ev.id ? ' active' : ''}`}
              onClick={() => setActiveEval(ev.id)}
            >
              {ev.type === 'DS' ? 'DS' : ev.type === 'Interrogation' ? 'Interro' : 'Exam'} N°{ev.numero}
            </div>
          ))}
        </div>

        {/* Tableau */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="note-table">
            <thead>
              <tr>
                <th style={{ width: 50 }}>#</th>
                <th>Élève</th>
                <th>Matricule</th>
                <th>Moy. générale</th>
                <th style={{ width: 80 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {eleves.map((el) => (
                <tr key={el.eleve_id}>
                  <td>
                    <span className={`note-rank ${rankClass(el.rang)}`}>
                      {el.rang === 1 ? '🥇' : el.rang === 2 ? '🥈' : el.rang === 3 ? '🥉' : `${el.rang}e`}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="avatar">
                        {`${(el.prenom || '')[0] || ''}${(el.nom || '')[0] || ''}`.toUpperCase()}
                      </div>
                      {el.nom} {el.prenom}
                    </div>
                  </td>
                  <td style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: 'var(--text3)' }}>
                    {el.matricule}
                  </td>
                  <td>
                    {el.moyenne_generale
                      ? <span className={`note-moy ${moyClass(el.moyenne_generale)}`}>{parseFloat(el.moyenne_generale).toFixed(1)}</span>
                      : <span style={{ color: 'var(--text3)', fontSize: 12 }}>—</span>
                    }
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 5 }}>
                      <div className="icon-btn" onClick={() => navigate(`/classes/${classeId}/notes/saisir`)}>✏️</div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {eleves.length === 0 && (
            <div style={{ padding: '20px', textAlign: 'center', fontSize: 13, color: 'var(--text3)' }}>
              Aucune note saisie pour cette classe.
            </div>
          )}
          {pagination && (
            <div style={{ padding: '12px 16px', textAlign: 'center', fontSize: 12, color: 'var(--text3)', borderTop: '1px solid var(--border)' }}>
              Affichage {eleves.length} / {pagination.total} élèves
            </div>
          )}
        </div>
      </div>
    </>
  );
}
