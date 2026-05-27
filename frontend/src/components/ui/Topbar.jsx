import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';

const CRUMBS = {
  '/dashboard': 'Dashboard Enseignant',
  '/dashboard/admin': 'Dashboard Administrateur',
  '/classes': 'Mes Classes',
  '/absences': 'Appel du jour',
  '/appreciations': 'Appréciations',
  '/messagerie': 'Messagerie',
  '/messagerie/nouveau': 'Composer un message',
  '/profile': 'Profil & Paramètres',
};

function getInitials(nom, prenom) {
  return `${(prenom || '')[0] || ''}${(nom || '')[0] || ''}`.toUpperCase();
}

export default function Topbar() {
  const { user } = useAuth();
  const location = useLocation();

  const crumb = Object.entries(CRUMBS).find(([path]) =>
    location.pathname.startsWith(path)
  )?.[1] || 'Portail Enseignant — MINESEC';

  const { data: unreadData } = useQuery({
    queryKey: ['unread-count'],
    queryFn: () => api.get('/messages/unread-count').then(r => r.data.count),
    refetchInterval: 30000,
    enabled: !!user,
  });

  return (
    <header className="topbar-desktop">
      <div className="tb-logo">🎓</div>
      <div>
        <div className="tb-brand">EDUSMART<span>-CM</span></div>
      </div>
      <div className="tb-separator" />
      <div className="tb-breadcrumb">{crumb}</div>

      <div className="tb-search">
        <span style={{ color: 'var(--text3)', fontSize: 14 }}>🔍</span>
        <input type="text" placeholder="Rechercher élève, classe, matière…" />
      </div>

      <div className="tb-notif">
        🔔
        {unreadData > 0 && <div className="tb-dot" />}
      </div>

      <div className="tb-user">
        <div className="tb-av">{user ? getInitials(user.nom, user.prenom) : '👤'}</div>
        <div>
          <div className="tb-user-name">
            {user ? `${user.prenom?.[0]}. ${user.nom}` : '—'}
          </div>
          <div className="tb-user-role">{user?.role || ''}</div>
        </div>
      </div>
    </header>
  );
}
