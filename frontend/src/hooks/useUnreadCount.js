import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

/**
 * Hook pour récupérer le nombre de messages non lus.
 * Se rafraîchit automatiquement toutes les 30 secondes.
 */
export function useUnreadCount() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['unread-count'],
    queryFn: () => api.get('/messages/unread-count').then(r => r.data.count),
    refetchInterval: 30_000,
    enabled: isAuthenticated,
    initialData: 0,
  });
}
