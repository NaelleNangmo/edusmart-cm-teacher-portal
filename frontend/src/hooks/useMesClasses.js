import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

/**
 * Hook pour récupérer les classes assignées à l'enseignant connecté.
 */
export function useMesClasses() {
  const { isAuthenticated, user } = useAuth();

  return useQuery({
    queryKey: ['mes-classes'],
    queryFn: () => api.get('/classes/mes-classes').then(r => r.data.classes),
    enabled: isAuthenticated && user?.role === 'enseignant',
    staleTime: 60_000,
  });
}
