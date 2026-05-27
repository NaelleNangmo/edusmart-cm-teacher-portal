import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';

function NavItem({ to, icon, label, badge }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `nav-item-d${isActive ? ' active' : ''}`}
    >
      <span className="nav-icon-d">{icon}</span>
      <span className="nav-label-d">{label}</span>
      {badge > 0 && <span className="nav-badge">{badge}</span>}
    </NavLink>
  );
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unread-count'],
    queryFn: () => api.get('/messages/unread-count').then(r => r.data.count),
    refetchInterval: 30000,
    enabled: !!user,
  });

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="sidebar">
      {user?.role === 'proviseur' && (
        <>
          <div className="nav-section-label">Administration</div>
          <NavItem to="/dashboard/admin" icon="🛡️" label="Dashboard Admin" />
        </>
      )}

      <div className="nav-section-label">Tableau de bord</div>
      <NavItem to="/dashboard" icon="🏠" label="Dashboard" />

      <div className="nav-section-label">Module Notes</div>
      <NavItem to="/classes" icon="🏫" label="Mes Classes" />

      <div className="nav-section-label">Module Absences</div>
      <NavItem to="/absences" icon="📅" label="Appel du jour" />

      <div className="nav-section-label">Appréciations</div>
      <NavItem to="/appreciations" icon="💬" label="Appréciations" />

      <div className="nav-section-label">Messagerie</div>
      <NavItem to="/messagerie" icon="📨" label="Boîte de réception" badge={unreadCount} />
      <NavItem to="/messagerie/nouveau" icon="✉️" label="Composer message" />

      <div className="nav-section-label">Compte</div>
      <NavItem to="/profile" icon="👤" label="Profil & Paramètres" />

      <div className="sidebar-user">
        <div className="sidebar-user-row">
          <div className="su-av">
            {user ? `${(user.prenom || '')[0]}${(user.nom || '')[0]}`.toUpperCase() : '👤'}
          </div>
          <div>
            <div className="su-name">{user ? `${user.prenom} ${user.nom}` : '—'}</div>
            <div className="su-role">{user?.etablissement?.nom || ''}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{ marginTop: 10, width: '100%', padding: '8px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, color: 'var(--red)', fontSize: 12, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}
        >
          🚪 Déconnexion
        </button>
      </div>
    </nav>
  );
}
