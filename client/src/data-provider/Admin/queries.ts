import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QueryKeys, dataService, SystemRoles } from 'librechat-data-provider';
import type { AdminConfig } from '~/common';

/**
 * Get admin configuration
 */
export const useGetAdminConfigQuery = () => {
  return useQuery({
    queryKey: [QueryKeys.adminConfig],
    queryFn: async (): Promise<{ adminConfig: AdminConfig }> => {
      return dataService.getAdminConfig();
    },
  });
};

/**
 * Update admin configuration
 */
export const useUpdateAdminConfigMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (adminConfig: Partial<AdminConfig>) => {
      return await dataService.updateAdminConfig(adminConfig);
    },
    onSuccess: async (data) => {
      console.log('Admin config updated, invalidating caches...');
      
      // Invalidate admin config query
      queryClient.invalidateQueries({ queryKey: [QueryKeys.adminConfig] });
      
      // Force refetch startup config to get updated admin overrides
      queryClient.invalidateQueries({ 
        queryKey: [QueryKeys.startupConfig],
        exact: false
      });
      
      // Add small delay to ensure backend caches are cleared
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Force immediate refetch of startup config for real-time updates
      queryClient.refetchQueries({ 
        queryKey: [QueryKeys.startupConfig],
        type: 'active'
      });
      
      // Invalidate user role queries to update permission-based settings
      queryClient.invalidateQueries({ queryKey: [QueryKeys.roles, SystemRoles.USER] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.roles, SystemRoles.ADMIN] });
      
      // Also invalidate endpoints query since endpoint filtering depends on interface config
      queryClient.invalidateQueries({ queryKey: [QueryKeys.endpoints] });
      
      // Invalidate models query as it may be affected by endpoint changes
      queryClient.invalidateQueries({ queryKey: [QueryKeys.models] });
      
      // Invalidate any other queries that might depend on interface configuration
      queryClient.invalidateQueries({ queryKey: [QueryKeys.tools] });
      
      console.log('Cache invalidation complete');
    },
  });
};

/**
 * Reset admin configuration
 */
export const useResetAdminConfigMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      return dataService.resetAdminConfig();
    },
    onSuccess: async () => {
      console.log('Admin config reset, invalidating caches...');
      
      // Invalidate admin config query
      queryClient.invalidateQueries({ queryKey: [QueryKeys.adminConfig] });
      
      // Force refetch startup config to get updated admin overrides
      queryClient.invalidateQueries({ 
        queryKey: [QueryKeys.startupConfig],
        exact: false
      });
      
      // Add small delay to ensure backend caches are cleared
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Force immediate refetch of startup config for real-time updates
      queryClient.refetchQueries({ 
        queryKey: [QueryKeys.startupConfig],
        type: 'active'
      });
      
      // Invalidate user role queries to update permission-based settings
      queryClient.invalidateQueries({ queryKey: [QueryKeys.roles, SystemRoles.USER] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.roles, SystemRoles.ADMIN] });
      
      // Also invalidate endpoints query since endpoint filtering depends on interface config
      queryClient.invalidateQueries({ queryKey: [QueryKeys.endpoints] });
      
      // Invalidate models query as it may be affected by endpoint changes
      queryClient.invalidateQueries({ queryKey: [QueryKeys.models] });
      
      // Invalidate any other queries that might depend on interface configuration
      queryClient.invalidateQueries({ queryKey: [QueryKeys.tools] });
      
      console.log('Cache invalidation complete');
    },
  });
};

/**
 * Custom Endpoints Queries
 */
export const useGetCustomEndpointsQuery = () => {
  return useQuery({
    queryKey: ['customEndpoints'],
    queryFn: () => dataService.getCustomEndpoints(),
  });
};

export const useGetCustomEndpointQuery = (id: string) => {
  return useQuery({
    queryKey: ['customEndpoints', id],
    queryFn: () => dataService.getCustomEndpoint(id),
    enabled: !!id,
  });
};

export const useCreateCustomEndpointMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => dataService.createCustomEndpoint(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['customEndpoints'] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.endpoints] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.models] });
      // also invalidate endpoint-specific models list so dropdown refreshes immediately
      const endpointName = (res as any)?.endpoint?.name;
      if (endpointName) {
        queryClient.invalidateQueries({ queryKey: ['models', endpointName] });
      }
    },
  });
};

export const useUpdateCustomEndpointMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      dataService.updateCustomEndpoint(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customEndpoints'] });
    },
  });
};

export const useDeleteCustomEndpointMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => dataService.deleteCustomEndpoint(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customEndpoints'] });
    },
  });
};

export const useParseOpenAPISpecMutation = () => {
  return useMutation({
    mutationFn: (data: { spec: string }) => dataService.parseOpenAPISpec(data),
  });
}; 