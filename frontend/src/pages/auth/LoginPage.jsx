import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', mot_de_passe: '', etablissement_id: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { data: etablissements = [] } = useQuery({
    queryKey: ['etablissements'],
    queryFn: () => api.get('/etablissements').then(r => r.data.etablissements),
  });

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!form.etablissement_id) { setError('Veuillez sélectionner un établissement.'); return; }
    setLoading(true);
    try {
      const user = await login(form.email, form.mot_de_passe, parseInt(form.etablissement_id, 10));
      navigate(user.role === 'proviseur' ? '/dashboard/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Email ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      height: '100vh', width: '100vw',
      background: 'radial-gradient(ellipse at 50% 0%, #111D3A 0%, var(--bg) 55%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ width: 440, maxWidth: '100%' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 64, height: 64, background: 'var(--primary)', borderRadius: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, margin: '0 auto 16px',
            boxShadow: '0 0 40px rgba(79,110,247,0.35)',
          }}>🎓</div>
          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 26, fontWeight: 800 }}>Connexion</div>
          <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 5 }}>Portail Enseignant EDUSMART-CM</div>
        </div>

        {/* Card */}
        <div style={{ background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: 20, padding: 28 }}>
          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="input-group">
              <label className="input-label">Adresse email professionnelle</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input"
                  type="email"
                  name="email"
                  placeholder="prenom.nom@lycee-cm.edu"
                  value={form.email}
                  onChange={handleChange}
                  required
                  style={{ paddingLeft: 42 }}
                />
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: 'var(--text3)' }}>📧</span>
              </div>
            </div>

            {/* Mot de passe */}
            <div className="input-group">
              <label className="input-label">Mot de passe</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input"
                  type={showPwd ? 'text' : 'password'}
                  name="mot_de_passe"
                  placeholder="••••••••"
                  value={form.mot_de_passe}
                  onChange={handleChange}
                  required
                  style={{ paddingLeft: 42, paddingRight: 42 }}
                />
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: 'var(--text3)' }}>🔒</span>
                <span
                  onClick={() => setShowPwd(v => !v)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: 'var(--text3)', cursor: 'pointer' }}
                >{showPwd ? '🙈' : '👁'}</span>
              </div>
            </div>

            {/* Établissement */}
            <div className="input-group">
              <label className="input-label">Établissement</label>
              <select
                className="select"
                name="etablissement_id"
                value={form.etablissement_id}
                onChange={handleChange}
                required
              >
                <option value="">— Sélectionner —</option>
                {etablissements.map(e => (
                  <option key={e.id} value={e.id}>{e.nom}</option>
                ))}
              </select>
            </div>

            {/* Options */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text2)', cursor: 'pointer' }}>
                <input type="checkbox" style={{ accentColor: 'var(--primary)', width: 14, height: 14 }} />
                Se souvenir de moi
              </label>
              <a href="#" style={{ fontSize: 12, color: 'var(--primary-light)', textDecoration: 'none' }}>Mot de passe oublié ?</a>
            </div>

            {/* Erreur */}
            {error && (
              <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: 'var(--red)', marginBottom: 16 }}>
                ⚠️ {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: 13, fontSize: 14, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? '⏳ Connexion…' : '🔓 Se connecter'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <span style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 600 }}>ou</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>

            <button type="button" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', fontSize: 13 }}>
              📲 Code établissement
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text3)', marginTop: 18 }}>
          Portail sécurisé · MINESEC · <a href="#" style={{ color: 'var(--primary-light)', textDecoration: 'none' }}>Aide & Contact</a>
        </div>
      </div>
    </div>
  );
}
