import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function SplashScreen() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(isAuthenticated ? '/dashboard' : '/login');
    }, 2200);
    return () => clearTimeout(timer);
  }, [isAuthenticated, navigate]);

  return (
    <div style={{
      height: '100vh', width: '100vw',
      background: 'radial-gradient(ellipse at 50% 30%, #131D3A 0%, #0A0E1A 65%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 100, height: 100, background: 'var(--primary)', borderRadius: 30,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 46, margin: '0 auto 26px',
          boxShadow: '0 0 80px rgba(79,110,247,0.5)',
          animation: 'splashpulse 2.5s ease-in-out infinite',
        }}>🎓</div>

        <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 52, fontWeight: 800, letterSpacing: 2 }}>
          EDUSMART
        </div>
        <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 700, color: 'var(--text2)', letterSpacing: 5, marginTop: 4 }}>
          CM
        </div>
        <div style={{ fontSize: 14, color: 'var(--text3)', marginTop: 8, letterSpacing: 0.5 }}>
          Portail Numérique Enseignant · MINESEC
        </div>

        <div style={{ width: 60, height: 4, background: 'var(--s3)', borderRadius: 2, margin: '52px auto 0', overflow: 'hidden' }}>
          <div style={{
            width: '40%', height: '100%', background: 'var(--primary)', borderRadius: 2,
            animation: 'loadanim 1.6s ease infinite',
          }} />
        </div>
        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 16 }}>
          Vérification de la session…
        </div>
      </div>
    </div>
  );
}
