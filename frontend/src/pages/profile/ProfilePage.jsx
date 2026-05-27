import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

function Section({ title, children }) {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 14 }}>
      {title && <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text3)' }}>{title}</div>}
      {children}
    </div>
  );
}

function SettingsItem({ icon, label, value, onClick }) {
  return (
    <div className="settings-item" onClick={onClick}>
      <div className="settings-icon">{icon}</div>
      <div className="settings-label">{label}</div>
      {value
        ? <div style={{ fontSize: 12, color: 'var(--primary-light)', fontWeight: 600 }}>{value} ›</div>
        : <div className="settings-arrow">›</div>
      }
    </div>
  );
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [editMode, setEditMode] = useState(false);
  const [pwdMode, setPwdMode] = useState(false);
  const [form, setForm] = useState({ nom: user?.nom || '', prenom: user?.prenom || '' });
  const [pwdForm, setPwdForm] = useState({ ancien_mot_de_passe: '', nouveau_mot_de_passe: '' });
  const [msg, setMsg] = useState('');

  const { data: profil, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => api.get('/profile').then(r => r.data.profil),
  });

  const updateProfile = useMutation({
    mutationFn: (data) => api.put('/profile', data),
    onSuccess: () => {
      qc.invalidateQueries(['profile']);
      setEditMode(false);
      setMsg('✅ Profil mis à jour !');
      setTimeout(() => setMsg(''), 3000);
    },
    onError: (e) => setMsg(`❌ ${e.response?.data?.message || 'Erreur'}`),
  });

  const updatePwd = useMutation({
    mutationFn: (data) => api.put('/profile/password', data),
    onSuccess: () => {
      setPwdMode(false);
      setPwdForm({ ancien_mot_de_passe: '', nouveau_mot_de_passe: '' });
      setMsg('✅ Mot de passe modifié !');
      setTimeout(() => setMsg(''), 3000);
    },
    onError: (e) => setMsg(`❌ ${e.response?.data?.message || 'Erreur'}`),
  });

  const handleLogout = async () => { await logout(); navigate('/login'); };

  if (isLoading) return <LoadingSpinner text="Chargement du profil…" />;

  const p = profil || user || {};
  const initials = `${(p.prenom || '')[0] || ''}${(p.nom || '')[0] || ''}`.toUpperCase();
  const ROLE_LABELS = { enseignant: 'Enseignant', proviseur: 'Proviseur', cpe: 'CPE', secretariat: 'Secrétariat' };

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-head-title">Profil & Paramètres</div>
          <div className="page-head-sub">Gérer votre compte et vos préférences</div>
        </div>
        <div className="page-head-actions">
          <button className="btn btn-danger" onClick={handleLogout}>🚪 Se déconnecter</button>
        </div>
      </div>

      <div className="content-body">
        <div className="grid-2">
          {/* Colonne gauche */}
          <div>
            {/* Hero */}
            <div className="profile-hero">
              <div className="profile-av">{initials}</div>
              <div className="profile-name">{p.prenom} {p.nom}</div>
              <div className="profile-role">{ROLE_LABELS[p.role] || p.role} · {p.matiere_nom || ''}</div>
              <div style={{ marginTop: 10 }}>
                <span className="badge badge-blue">{p.email}</span>
              </div>
              <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text3)' }}>
                {p.etablissement_nom} · {p.ville}
              </div>
            </div>

            {/* Modifier profil */}
            {editMode ? (
              <div className="card" style={{ marginBottom: 14 }}>
                <div className="card-title">Modifier le profil</div>
                <div className="input-group">
                  <label className="input-label">Nom</label>
                  <input className="input" value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} />
                </div>
                <div className="input-group">
                  <label className="input-label">Prénom</label>
                  <input className="input" value={form.prenom} onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))} />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-outline" onClick={() => setEditMode(false)}>Annuler</button>
                  <button className="btn btn-primary" onClick={() => updateProfile.mutate(form)} disabled={updateProfile.isPending}>
                    {updateProfile.isPending ? '⏳…' : '💾 Enregistrer'}
                  </button>
                </div>
              </div>
            ) : pwdMode ? (
              <div className="card" style={{ marginBottom: 14 }}>
                <div className="card-title">Changer le mot de passe</div>
                <div className="input-group">
                  <label className="input-label">Ancien mot de passe</label>
                  <input className="input" type="password" value={pwdForm.ancien_mot_de_passe}
                    onChange={e => setPwdForm(f => ({ ...f, ancien_mot_de_passe: e.target.value }))} />
                </div>
                <div className="input-group">
                  <label className="input-label">Nouveau mot de passe</label>
                  <input className="input" type="password" value={pwdForm.nouveau_mot_de_passe}
                    onChange={e => setPwdForm(f => ({ ...f, nouveau_mot_de_passe: e.target.value }))} />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-outline" onClick={() => setPwdMode(false)}>Annuler</button>
                  <button className="btn btn-primary" onClick={() => updatePwd.mutate(pwdForm)} disabled={updatePwd.isPending}>
                    {updatePwd.isPending ? '⏳…' : '🔒 Modifier'}
                  </button>
                </div>
              </div>
            ) : (
              <Section>
                <SettingsItem icon="👤" label="Modifier le profil" onClick={() => setEditMode(true)} />
                <SettingsItem icon="🔒" label="Changer le mot de passe" onClick={() => setPwdMode(true)} />
                <SettingsItem icon="🔔" label="Préférences notifications" onClick={() => {}} />
              </Section>
            )}

            {msg && (
              <div style={{ padding: '10px 14px', borderRadius: 10, fontSize: 13,
                background: msg.startsWith('✅') ? 'rgba(45,212,191,0.1)' : 'rgba(248,113,113,0.1)',
                border: `1px solid ${msg.startsWith('✅') ? 'rgba(45,212,191,0.3)' : 'rgba(248,113,113,0.3)'}`,
                color: msg.startsWith('✅') ? 'var(--teal)' : 'var(--red)' }}>
                {msg}
              </div>
            )}
          </div>

          {/* Colonne droite */}
          <div>
            <Section>
              <SettingsItem icon="🌙" label="Thème de l'interface" value="Sombre" onClick={() => {}} />
              <SettingsItem icon="🌐" label="Langue" onClick={() => {}} />
            </Section>
            <Section>
              <SettingsItem icon="📋" label="Journal d'activité" onClick={() => {}} />
              <SettingsItem icon="📊" label="Mes statistiques" onClick={() => {}} />
              <SettingsItem icon="ℹ️" label="À propos · v1.0.0" onClick={() => {}} />
            </Section>
          </div>
        </div>
      </div>
    </>
  );
}
