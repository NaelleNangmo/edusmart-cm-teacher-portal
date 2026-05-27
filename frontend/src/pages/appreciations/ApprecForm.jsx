import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';

const FORMULATIONS = [
  'Élève sérieux(se), participatif(ve). Bons résultats, continue ainsi.',
  'Résultats encourageants. Effort à maintenir pour progresser davantage.',
  'Manque de rigueur. Doit fournir plus d\'efforts réguliers.',
  'Très bon niveau général. Méthodes solides et autonomie remarquable.',
  'Niveau insuffisant. Un soutien est nécessaire pour rattraper le programme.',
];

export default function ApprecForm() {
  const { eleveId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const qc = useQueryClient();

  const { el, classeId, trimestre = 2 } = location.state || {};
  const [texte, setTexte] = useState(el?.texte || '');
  const [msg, setMsg] = useState('');

  const save = useMutation({
    mutationFn: (data) => api.post('/appreciations', data),
    onSuccess: () => {
      qc.invalidateQueries(['appreciations']);
      setMsg('✅ Appréciation enregistrée !');
      setTimeout(() => navigate('/appreciations'), 1200);
    },
    onError: (e) => setMsg(`❌ ${e.response?.data?.message || 'Erreur'}`),
  });

  const handleSave = () => {
    if (!texte.trim()) { setMsg('❌ Le texte est requis.'); return; }
    save.mutate({
      eleve_id: parseInt(eleveId, 10),
      classe_id: classeId,
      trimestre,
      texte: texte.trim(),
    });
  };

  return (
    <>
      <div className="page-head">
        <div>
          <button className="back-btn" onClick={() => navigate('/appreciations')}>‹ Appréciations</button>
          <div className="page-head-title">Rédiger appréciation</div>
          <div className="page-head-sub">
            {el ? `${el.nom} ${el.prenom}` : `Élève ${eleveId}`} · Trimestre {trimestre}
          </div>
        </div>
        <div className="page-head-actions">
          <span className={`badge ${el?.statut === 'redigee' ? 'badge-teal' : 'badge-amber'}`}>
            {el?.statut === 'redigee' ? 'Rédigée' : 'En attente'}
          </span>
        </div>
      </div>

      <div className="content-body">
        <div className="two-col">
          <div>
            <div className="card">
              {/* Infos élève */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                <div className="avatar" style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(167,139,250,0.2)', color: 'var(--violet)', fontSize: 16 }}>
                  {el ? `${(el.prenom || '')[0]}${(el.nom || '')[0]}`.toUpperCase() : '?'}
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{el ? `${el.nom} ${el.prenom}` : `Élève ${eleveId}`}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 3 }}>Trimestre {trimestre}</div>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Appréciation personnalisée</label>
                <textarea
                  className="input"
                  rows={5}
                  style={{ resize: 'none', lineHeight: 1.7 }}
                  value={texte}
                  onChange={e => setTexte(e.target.value)}
                  placeholder="Rédigez votre appréciation ici…"
                />
              </div>

              {msg && (
                <div style={{ padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 12,
                  background: msg.startsWith('✅') ? 'rgba(45,212,191,0.1)' : 'rgba(248,113,113,0.1)',
                  border: `1px solid ${msg.startsWith('✅') ? 'rgba(45,212,191,0.3)' : 'rgba(248,113,113,0.3)'}`,
                  color: msg.startsWith('✅') ? 'var(--teal)' : 'var(--red)' }}>
                  {msg}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-outline" onClick={() => navigate('/appreciations')}>Annuler</button>
                <button className="btn btn-primary" onClick={handleSave} disabled={save.isPending}>
                  {save.isPending ? '⏳ Enregistrement…' : '💾 Enregistrer'}
                </button>
              </div>
            </div>
          </div>

          {/* Formulations types */}
          <div className="card">
            <div className="card-title">Formulations types</div>
            {FORMULATIONS.map((f, i) => (
              <div
                key={i}
                className="formulation-card"
                style={i === FORMULATIONS.length - 1 ? { borderColor: 'rgba(248,113,113,0.3)' } : {}}
                onClick={() => setTexte(f)}
              >
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
