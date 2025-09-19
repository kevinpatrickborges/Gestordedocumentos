import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

export interface OnlineUser {
  id: number;
  nome: string;
  usuario: string;
  role: string;
}

export const QUERY_KEYS = {
  onlineUsers: ['onlineUsers'] as const,
};

export function useOnlineUsers() {
  return useQuery<OnlineUser[], Error>({
    queryKey: QUERY_KEYS.onlineUsers,
    queryFn: async () => {
      const response = await api.get('/auth/online-users');
      return response.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 15000, // Data is fresh for 15 seconds
    retry: 2,
  });
}
