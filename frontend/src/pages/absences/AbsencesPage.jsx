import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const MOTIFS = ['sans_motif', 'maladie', 'retard', 'depart_anticipe'];
const MOTIF_LABELS = { sans_motif: 'Sans motif', maladie: 'Maladie', retard: 'Retard', depart_anticipe: 'Départ anticipé' };

function today() { return new Date().toISOString().split('T')[0]; }

function formatDate(d) {
  return new Date(d).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export default function AbsencesPage() {
  const qc = useQueryClient();
  const [date, setDate] = useState(today());
  const [classeId, setClasseId] = useState(null);
  const [presences, setPresences] = useState({});
  const [motifs, setMotifs] = useState({});
  const [msg, setMsg] = useState('');

  const { data: classes = [] } = useQuery({
    queryKey: ['mes-classes'],
    queryFn: () => api.get('/classes/mes-classes').then(r => r.data.classes),
    onSuccess: (data) => { if (data.length > 0 && !classeId) setClasseId(data[0].id); },
  });

  const selectedClasseId = classeId || classes[0]?.id;

  const { data: absData, isLoading } = useQuery({
    queryKey: ['absences', selectedClasseId, date],
    queryFn: () => api.get(`/absences/${selectedClasseId}`, { params: { date } }).then(r => r.data),
    enabled: !!selectedClasseId,
    onSuccess: (data) => {
      const p = {}, m = {};
      data.eleves.forEach(el => {
        p[el.id] = el.statut_jour || 'present';
        m[el.id] = el.motif_jour || 'sans_motif';
      });
      setPresences(p);
      setMotifs(m);
    },
  });

  const { data: statsData } = useQuery({
    queryKey: ['absences-stats', selectedClasseId, date],
    queryFn: () => api.get(`/absences/${selectedClasseId}/stats`, { params: { date } }).then(r => r.data.stats),
    enabled: !!selectedClasseId,
  });

  const saveAppel = useMutation({
    mutationFn: (payload) => api.post('/absences/appel', payload),
    onSuccess: () => {
      qc.invalidateQueries(['absences', selectedClasseId]);
      qc.invalidateQueries(['absences-stats', selectedClasseId]);
      setMsg('✅ Appel enregistré avec succès !');
      setTimeout(() => setMsg(''), 3000);
    },
    onError: (e) => setMsg(`❌ ${e.response?.data?.message || 'Erreur enregistrement'}`),
  });

  const toggleStatut = (eleveId) => {
    setPresences(p => {
      const cur = p[eleveId] || 'present';
      const next = cur === 'present' ? 'absent' : cur === 'absent' ? 'retard' : 'present';
      return { ...p, [eleveId]: next };
    });
  };

  const handleSave = () => {
    const eleves = absData?.eleves || [];
    const payload = {
      classe_id: selectedClasseId,
      date,
      presences: eleves.map(el => ({
        eleve_id: el.id,
        statut: presences[el.id] || 'present',
        motif: motifs[el.id] || 'sans_motif',
      })),
    };
    saveAppel.mutate(payload);
  };

  const eleves = absData?.eleves || [];
  const stats = statsData || {};
  const elevesRisque = eleves.filter(e => e.flag === 'critique' || e.flag === 'warning');

  const nbPresents = eleves.filter(e => (presences[e.id] || 'present') === 'present').length;
  const nbAbsents = eleves.filter(e => (presences[e.id] || 'present') === 'absent').length;
  const nbRetards = eleves.filter(e => (presences[e.id] || 'present') === 'retard').length;

  if (isLoading && selectedClasseId) return <LoadingSpinner text="Chargement de l'appel…" />;

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-head-title">Appel du jour</div>
          <div className="page-head-sub">
            {classes.find(c => c.id === selectedClasseId)?.nom || '—'} · Mathématiques
          </div>
        </div>
        <div className="page-head-actions">
          <button className="btn btn-primary" onClick={handleSave} disabled={saveAppel.isPending}>
            {saveAppel.isPending ? '⏳ Enregistrement…' : '💾 Enregistrer l\'appel'}
          </button>
        </div>
      </div>

      <div className="content-body">
        <div className="two-col">
          <div>
            <div className="card" style={{ marginBottom: 16 }}>
              {/* Header date + sélecteur */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{formatDate(date)}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>
                    {classes.find(c => c.id === selectedClasseId)?.nom} · Mathématiques
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <select
                    className="select"
                    style={{ width: 'auto', padding: '8px 12px', fontSize: 12 }}
                    value={selectedClasseId || ''}
                    onChange={e => setClasseId(parseInt(e.target.value, 10))}
                  >
                    {classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                  </select>
                  <input
                    type="date"
                    className="input"
                    style={{ width: 'auto', padding: '8px 12px', fontSize: 12 }}
                    value={date}
                    onChange={e => setDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Compteurs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
                {[
                  { label: 'Présents', val: nbPresents, color: 'var(--text)', border: 'var(--border)' },
                  { label: 'Absents', val: nbAbsents, color: 'var(--red)', border: 'rgba(248,113,113,0.3)' },
                  { label: 'Retards', val: nbRetards, color: 'var(--amber)', border: 'rgba(251,191,36,0.3)' },
                ].map(({ label, val, color, border }) => (
                  <div key={label} style={{ background: 'var(--s2)', border: `1px solid ${border}`, borderRadius: 12, padding: 14, textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'DM Mono, monospace', color }}>{val}</div>
                    <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', fontWeight: 700, marginTop: 4 }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* Tableau appel */}
              <table className="note-table">
                <thead>
                  <tr>
                    <th style={{ width: 60 }}>Statut</th>
                    <th>Élève</th>
                    <th>Absences T2</th>
                    <th>Motif</th>
                  </tr>
                </thead>
                <tbody>
                  {eleves.map(el => {
                    const statut = presences[el.id] || 'present';
                    const nb = parseInt(el.nb_absences_trimestre, 10) || 0;
                    return (
                      <tr key={el.id}>
                        <td>
                          <div
                            className={`abs-check ${statut}`}
                            onClick={() => toggleStatut(el.id)}
                            title="Cliquer pour changer le statut"
                          >
                            {statut === 'present' ? '✓' : statut === 'absent' ? '✗' : '⏱'}
                          </div>
                        </td>
                        <td style={{ fontSize: 13 }}>{el.nom} {el.prenom}</td>
                        <td>
                          {nb === 0
                            ? <span style={{ fontSize: 12, color: 'var(--text3)' }}>0 abs.</span>
                            : nb >= 7
                              ? <span style={{ fontSize: 12, color: 'var(--red)', fontWeight: 700 }}>🚨 {nb} abs.</span>
                              : nb >= 3
                                ? <span style={{ fontSize: 12, color: 'var(--amber)', fontWeight: 700 }}>⚠ {nb} abs.</span>
                                : <span style={{ fontSize: 12, color: 'var(--text3)' }}>{nb} abs.</span>
                          }
                        </td>
                        <td>
                          {statut !== 'present' ? (
                            <select
                              style={{ fontSize: 11, padding: '5px 8px', background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', outline: 'none' }}
                              value={motifs[el.id] || 'sans_motif'}
                              onChange={e => setMotifs(m => ({ ...m, [el.id]: e.target.value }))}
                            >
                              {MOTIFS.map(m => <option key={m} value={m}>{MOTIF_LABELS[m]}</option>)}
                            </select>
                          ) : <span style={{ color: 'var(--text3)', fontSize: 12 }}>—</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {msg && (
              <div style={{ padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 12,
                background: msg.startsWith('✅') ? 'rgba(45,212,191,0.1)' : 'rgba(248,113,113,0.1)',
                border: `1px solid ${msg.startsWith('✅') ? 'rgba(45,212,191,0.3)' : 'rgba(248,113,113,0.3)'}`,
                color: msg.startsWith('✅') ? 'var(--teal)' : 'var(--red)' }}>
                {msg}
              </div>
            )}
          </div>

          {/* Élèves à risque */}
          <div className="card">
            <div className="card-title">Élèves à risque</div>
            {elevesRisque.length === 0 && (
              <div style={{ fontSize: 13, color: 'var(--text3)', textAlign: 'center', padding: '20px 0' }}>
                ✅ Aucun élève à risque
              </div>
            )}
            {elevesRisque.map(el => {
              const isCritique = el.flag === 'critique';
              return (
                <div key={el.id} className={`alert-row ${isCritique ? 'alert-red' : 'alert-amber'}`} style={{ marginBottom: 10 }}>
                  <div className="avatar" style={{
                    background: isCritique ? 'rgba(248,113,113,0.1)' : 'rgba(251,191,36,0.15)',
                    color: isCritique ? 'var(--red)' : 'var(--amber)',
                  }}>
                    {`${(el.prenom || '')[0] || ''}${(el.nom || '')[0] || ''}`.toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{el.nom} {el.prenom}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>{el.nb_absences_trimestre} absences ce trimestre</div>
                  </div>
                  <span className={`badge ${isCritique ? 'badge-red' : 'badge-amber'}`}>
                    {isCritique ? 'Critique' : '⚠️'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
