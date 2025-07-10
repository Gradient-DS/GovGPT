import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataService } from 'librechat-data-provider';

export const useGetAdminUsersQuery = (params: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  return useQuery({
    queryKey: ['adminUsers', params],
    queryFn: () => dataService.getAdminUsers(params),
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });
};

export const useGetAdminUserByIdQuery = (userId: string) => {
  return useQuery({
    queryKey: ['adminUser', userId],
    queryFn: () => dataService.getAdminUserById(userId),
    enabled: !!userId,
  });
};

export const useGetAdminUserStatsQuery = () => {
  return useQuery({
    queryKey: ['adminUserStats'],
    queryFn: () => dataService.getAdminUserStats(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

export const useCreateAdminUserMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: dataService.createAdminUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminUserStats'] });
    },
  });
};

export const useUpdateAdminUserMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, userData }: { userId: string; userData: Parameters<typeof dataService.updateAdminUser>[1] }) =>
      dataService.updateAdminUser(userId, userData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminUser', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['adminUserStats'] });
    },
  });
};

export const useDeleteAdminUserMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: dataService.deleteAdminUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminUserStats'] });
    },
  });
}; 