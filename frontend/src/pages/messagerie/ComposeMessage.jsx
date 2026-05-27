import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';

const BG_COLORS = ['var(--indigo)', 'var(--rose)', 'var(--cyan)'];

function getInitials(nom = '', prenom = '') {
  return `${prenom[0] || ''}${nom[0] || ''}`.toUpperCase();
}

export default function ComposeMessage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [form, setForm] = useState({ destinataire_id: '', objet: '', corps: '' });
  const [msg, setMsg] = useState('');

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => api.get('/utilisateurs/contacts').then(r => r.data.contacts),
  });

  const send = useMutation({
    mutationFn: (data) => api.post('/messages', data),
    onSuccess: () => {
      qc.invalidateQueries(['sent']);
      setMsg('✅ Message envoyé !');
      setTimeout(() => navigate('/messagerie'), 1200);
    },
    onError: (e) => setMsg(`❌ ${e.response?.data?.message || 'Erreur envoi'}`),
  });

  const handleSend = () => {
    if (!form.destinataire_id) { setMsg('❌ Sélectionnez un destinataire.'); return; }
    if (!form.objet.trim()) { setMsg('❌ L\'objet est requis.'); return; }
    if (!form.corps.trim()) { setMsg('❌ Le message est requis.'); return; }
    send.mutate({ ...form, destinataire_id: parseInt(form.destinataire_id, 10) });
  };

  const ROLE_LABELS = { proviseur: 'Proviseur', enseignant: 'Enseignant', cpe: 'CPE', secretariat: 'Secrétariat' };

  return (
    <>
      <div className="page-head">
        <div>
          <button className="back-btn" onClick={() => navigate('/messagerie')}>‹ Messagerie</button>
          <div className="page-head-title">Nouveau message</div>
        </div>
        <div className="page-head-actions">
          <button className="btn btn-outline" onClick={() => navigate('/messagerie')}>Annuler</button>
          <button className="btn btn-primary" onClick={handleSend} disabled={send.isPending}>
            {send.isPending ? '⏳ Envoi…' : '📤 Envoyer'}
          </button>
        </div>
      </div>

      <div className="content-body">
        <div className="compose-layout">
          <div className="card">
            <div className="input-group">
              <label className="input-label">Destinataire(s)</label>
              <select className="select" value={form.destinataire_id}
                onChange={e => setForm(f => ({ ...f, destinataire_id: e.target.value }))}>
                <option value="">— Sélectionner —</option>
                {contacts.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.prenom} {c.nom} — {ROLE_LABELS[c.role] || c.role}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Objet</label>
              <input className="input" type="text" placeholder="Objet du message…"
                value={form.objet} onChange={e => setForm(f => ({ ...f, objet: e.target.value }))} />
            </div>

            <div className="input-group">
              <label className="input-label">Message</label>
              <textarea className="input" rows={10} style={{ resize: 'none', lineHeight: 1.7 }}
                placeholder="Rédigez votre message ici…"
                value={form.corps} onChange={e => setForm(f => ({ ...f, corps: e.target.value }))} />
            </div>

            {/* Pièce jointe (UI uniquement) */}
            <div style={{ background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: 10, padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 18 }}>📎</span>
              <div style={{ flex: 1, fontSize: 13, color: 'var(--text2)' }}>Ajouter une pièce jointe</div>
              <button className="btn btn-outline" style={{ padding: '7px 14px', fontSize: 12 }}>Parcourir</button>
            </div>

            {msg && (
              <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10, fontSize: 13,
                background: msg.startsWith('✅') ? 'rgba(45,212,191,0.1)' : 'rgba(248,113,113,0.1)',
                border: `1px solid ${msg.startsWith('✅') ? 'rgba(45,212,191,0.3)' : 'rgba(248,113,113,0.3)'}`,
                color: msg.startsWith('✅') ? 'var(--teal)' : 'var(--red)' }}>
                {msg}
              </div>
            )}
          </div>

          {/* Contacts récents */}
          <div className="card">
            <div className="card-title">Contacts récents</div>
            {contacts.slice(0, 5).map((c, i) => (
              <div key={c.id} className="table-row"
                style={{ cursor: 'pointer' }}
                onClick={() => setForm(f => ({ ...f, destinataire_id: String(c.id) }))}>
                <div className="avatar" style={{ background: BG_COLORS[i % BG_COLORS.length], color: '#fff' }}>
                  {getInitials(c.nom, c.prenom)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{c.prenom} {c.nom}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>{ROLE_LABELS[c.role] || c.role}</div>
                </div>
                {String(form.destinataire_id) === String(c.id) && (
                  <span className="badge badge-teal">✓</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
