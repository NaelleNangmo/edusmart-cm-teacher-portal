import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import SplashScreen from './pages/auth/SplashScreen';
import LoginPage from './pages/auth/LoginPage';
import AppLayout from './components/ui/AppLayout';
import DashboardEnseignant from './pages/dashboard/DashboardEnseignant';
import DashboardAdmin from './pages/dashboard/DashboardAdmin';
import MesClasses from './pages/classes/MesClasses';
import NotesList from './pages/notes/NotesList';
import NoteForm from './pages/notes/NoteForm';
import AbsencesPage from './pages/absences/AbsencesPage';
import AppreciationsPage from './pages/appreciations/AppreciationsPage';
import ApprecForm from './pages/appreciations/ApprecForm';
import MessageriePage from './pages/messagerie/MessageriePage';
import ComposeMessage from './pages/messagerie/ComposeMessage';
import ProfilePage from './pages/profile/ProfilePage';

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { user } = useAuth();
  return user?.role === 'proviseur' ? children : <Navigate to="/dashboard" replace />;
}

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<SplashScreen />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />

      <Route path="/" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
        <Route path="dashboard" element={<DashboardEnseignant />} />
        <Route path="dashboard/admin" element={<AdminRoute><DashboardAdmin /></AdminRoute>} />
        <Route path="classes" element={<MesClasses />} />
        <Route path="classes/:classeId/notes" element={<NotesList />} />
        <Route path="classes/:classeId/notes/saisir" element={<NoteForm />} />
        <Route path="absences" element={<AbsencesPage />} />
        <Route path="appreciations" element={<AppreciationsPage />} />
        <Route path="appreciations/:eleveId" element={<ApprecForm />} />
        <Route path="messagerie" element={<MessageriePage />} />
        <Route path="messagerie/nouveau" element={<ComposeMessage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
