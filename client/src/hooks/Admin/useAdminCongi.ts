import { useGetAdminConfigQuery, useUpdateAdminConfigMutation, useResetAdminConfigMutation } from '~/data-provider/Admin/queries';
import { useGetStartupConfig } from '~/data-provider';
import type { AdminConfig } from '~/common';

export const useAdminConfig = () => {
  const adminConfigQuery = useGetAdminConfigQuery();
  const updateAdminConfigMutation = useUpdateAdminConfigMutation();
  const resetAdminConfigMutation = useResetAdminConfigMutation();
  const { data: startupConfig } = useGetStartupConfig();

  const updateSetting = (key: string, value: boolean | string) => {
    updateAdminConfigMutation.mutate({ [key]: value });
  };

  const addToArray = (key: string, value: string) => {
    const currentArray = adminConfigQuery.data?.adminConfig?.[key] || [];
    const newArray = [...currentArray, value];
    updateAdminConfigMutation.mutate({ [key]: newArray });
  };

  const removeFromArray = (key: string, value: string) => {
    const currentArray = adminConfigQuery.data?.adminConfig?.[key] || [];
    const newArray = currentArray.filter(item => item !== value);
    updateAdminConfigMutation.mutate({ [key]: newArray });
  };

  const resetAllSettings = () => {
    resetAdminConfigMutation.mutate();
  };

  const updateSocialLoginConfig = (provider: string, field: string, value: string | boolean | null) => {
    const currentConfig = adminConfigQuery.data?.adminConfig?.socialLoginConfig || {};
    const providerConfig = currentConfig[provider] || {};
    
    const newConfig = {
      ...currentConfig,
      [provider]: {
        ...providerConfig,
        [field]: value
      }
    };
    
    updateAdminConfigMutation.mutate({ socialLoginConfig: newConfig });
  };

  return {
    adminConfig: adminConfigQuery.data?.adminConfig,
    startupConfig,
    isLoading: adminConfigQuery.isLoading,
    updateSetting,
    resetAllSettings,
    isUpdating: updateAdminConfigMutation.isLoading || resetAdminConfigMutation.isLoading,
    addToArray,
    removeFromArray,
    updateSocialLoginConfig,
    // Keep original names for backward compatibility
    adminConfigLoading: adminConfigQuery.isLoading,
    adminConfigError: adminConfigQuery.error,
    updateAdminConfig: (config: Partial<AdminConfig>) => updateAdminConfigMutation.mutate(config),
    resetAdminConfig: () => resetAdminConfigMutation.mutate(),
    isUpdatingConfig: updateAdminConfigMutation.isLoading,
    isResettingConfig: resetAdminConfigMutation.isLoading,
    updateError: updateAdminConfigMutation.error,
    resetError: resetAdminConfigMutation.error,
  };
}; 