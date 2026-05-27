import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function NoteForm() {
  const { classeId } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [evalForm, setEvalForm] = useState({ type: 'DS', numero: 1, coefficient: 2, date: new Date().toISOString().split('T')[0] });
  const [notes, setNotes] = useState({});
  const [evalId, setEvalId] = useState(null);
  const [msg, setMsg] = useState('');

  const { data: classeData } = useQuery({
    queryKey: ['classe', classeId],
    queryFn: () => api.get(`/classes/${classeId}`).then(r => r.data.classe),
  });

  const { data: elevesData, isLoading } = useQuery({
    queryKey: ['eleves', classeId],
    queryFn: () => api.get(`/classes/${classeId}/eleves`, { params: { limit: 100 } }).then(r => r.data),
  });

  const { data: matieres = [] } = useQuery({
    queryKey: ['matieres'],
    queryFn: () => api.get('/classes/mes-classes').then(r => {
      const c = r.data.classes.find(cl => cl.id === parseInt(classeId, 10));
      return c ? [{ id: c.matiere_id, nom: c.matiere_nom }] : [];
    }),
  });

  const createEval = useMutation({
    mutationFn: (data) => api.post('/evaluations', data).then(r => r.data.evaluation),
    onSuccess: (ev) => { setEvalId(ev.id); setMsg('✅ Évaluation créée. Saisissez les notes ci-dessous.'); },
    onError: (e) => setMsg(`❌ ${e.response?.data?.message || 'Erreur création évaluation'}`),
  });

  const saveNotes = useMutation({
    mutationFn: (payload) => api.post('/notes', payload),
    onSuccess: () => {
      qc.invalidateQueries(['notes', classeId]);
      setMsg('✅ Notes enregistrées avec succès !');
      setTimeout(() => navigate(`/classes/${classeId}/notes`), 1500);
    },
    onError: (e) => setMsg(`❌ ${e.response?.data?.message || 'Erreur enregistrement'}`),
  });

  const eleves = elevesData?.eleves || [];
  const saisies = Object.values(notes).filter(v => v !== '').length;

  const handleCreateEval = () => {
    const matiere = matieres[0];
    if (!matiere) { setMsg('❌ Matière introuvable'); return; }
    createEval.mutate({
      type: evalForm.type,
      numero: parseInt(evalForm.numero, 10),
      coefficient: parseInt(evalForm.coefficient, 10),
      date: evalForm.date,
      classe_id: parseInt(classeId, 10),
      matiere_id: matiere.id,
      trimestre: 2,
    });
  };

  const handleSave = () => {
    if (!evalId) { setMsg('❌ Créez d\'abord l\'évaluation.'); return; }
    const payload = eleves
      .filter(el => notes[el.id] !== '' && notes[el.id] !== undefined)
      .map(el => ({ eleve_id: el.id, valeur: parseFloat(notes[el.id]) }));
    if (payload.length === 0) { setMsg('❌ Aucune note saisie.'); return; }
    saveNotes.mutate({ evaluation_id: evalId, notes: payload });
  };

  if (isLoading) return <LoadingSpinner text="Chargement des élèves…" />;

  return (
    <>
      <div className="page-head">
        <div>
          <button className="back-btn" onClick={() => navigate(`/classes/${classeId}/notes`)}>‹ Liste des notes</button>
          <div className="page-head-title">Saisir des notes</div>
          <div className="page-head-sub">{classeData?.nom || `Classe ${classeId}`} — Mathématiques</div>
        </div>
      </div>

      <div className="content-body">
        <div className="two-col">
          <div>
            {/* Paramètres évaluation */}
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-title">Paramètres de l'évaluation</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Type</label>
                  <select className="select" value={evalForm.type} onChange={e => setEvalForm(f => ({ ...f, type: e.target.value }))} disabled={!!evalId}>
                    <option value="DS">Devoir Surveillé</option>
                    <option value="Interrogation">Interrogation</option>
                    <option value="Examen">Examen</option>
                  </select>
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">N° évaluation</label>
                  <input className="input" type="number" min="1" max="10" value={evalForm.numero}
                    onChange={e => setEvalForm(f => ({ ...f, numero: e.target.value }))} disabled={!!evalId} />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Coefficient</label>
                  <input className="input" type="number" min="1" max="10" value={evalForm.coefficient}
                    onChange={e => setEvalForm(f => ({ ...f, coefficient: e.target.value }))} disabled={!!evalId} />
                </div>
              </div>
              <div className="input-group" style={{ marginBottom: 12 }}>
                <label className="input-label">Date du devoir</label>
                <input className="input" type="date" value={evalForm.date}
                  onChange={e => setEvalForm(f => ({ ...f, date: e.target.value }))} disabled={!!evalId} />
              </div>
              {!evalId && (
                <button className="btn btn-outline" onClick={handleCreateEval} disabled={createEval.isPending}>
                  {createEval.isPending ? '⏳ Création…' : '✅ Valider l\'évaluation'}
                </button>
              )}
              {evalId && <div style={{ fontSize: 12, color: 'var(--teal)' }}>✅ Évaluation créée (id: {evalId})</div>}
            </div>

            {/* Tableau de saisie */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: 12, fontWeight: 700 }}>Saisie des notes (/20)</div>
                <span style={{ fontSize: 11, color: 'var(--text3)' }}>{saisies} / {eleves.length} saisis</span>
              </div>
              <table className="note-table">
                <thead>
                  <tr>
                    <th>Élève</th>
                    <th>Matricule</th>
                    <th style={{ width: 120 }}>Note /20</th>
                  </tr>
                </thead>
                <tbody>
                  {eleves.map(el => (
                    <tr key={el.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="avatar">
                            {`${(el.prenom || '')[0] || ''}${(el.nom || '')[0] || ''}`.toUpperCase()}
                          </div>
                          {el.nom} {el.prenom}
                        </div>
                      </td>
                      <td style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: 'var(--text3)' }}>{el.matricule}</td>
                      <td>
                        <input
                          className="note-input"
                          type="number"
                          placeholder="—"
                          min="0"
                          max="20"
                          step="0.5"
                          value={notes[el.id] ?? ''}
                          onChange={e => setNotes(n => ({ ...n, [el.id]: e.target.value }))}
                          disabled={!evalId}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {msg && (
              <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10, fontSize: 13,
                background: msg.startsWith('✅') ? 'rgba(45,212,191,0.1)' : 'rgba(248,113,113,0.1)',
                border: `1px solid ${msg.startsWith('✅') ? 'rgba(45,212,191,0.3)' : 'rgba(248,113,113,0.3)'}`,
                color: msg.startsWith('✅') ? 'var(--teal)' : 'var(--red)' }}>
                {msg}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <button className="btn btn-outline" onClick={() => navigate(`/classes/${classeId}/notes`)}>Annuler</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saveNotes.isPending || !evalId}>
                {saveNotes.isPending ? '⏳ Enregistrement…' : '💾 Enregistrer les notes'}
              </button>
            </div>
          </div>

          {/* Infos classe */}
          <div className="card">
            <div className="card-title">Informations classe</div>
            <div style={{ fontSize: 18, fontWeight: 800, fontFamily: 'Syne, sans-serif', marginBottom: 4 }}>
              {classeData?.nom || '—'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 14 }}>Mathématiques · Trimestre 2</div>
            <div className="divider" />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, margin: '10px 0' }}>
              <span style={{ color: 'var(--text3)' }}>Total élèves</span>
              <strong>{elevesData?.pagination?.total || 0}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, margin: '10px 0' }}>
              <span style={{ color: 'var(--text3)' }}>Notes saisies</span>
              <strong style={{ color: 'var(--primary-light)' }}>{saisies}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, margin: '10px 0' }}>
              <span style={{ color: 'var(--text3)' }}>Évaluation</span>
              <strong>{evalForm.type} N°{evalForm.numero}</strong>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
