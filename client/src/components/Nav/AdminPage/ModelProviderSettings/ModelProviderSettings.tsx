import React, { useState, useMemo, useCallback } from 'react';
import { Key, Eye, EyeOff, Check, AlertTriangle, FileText } from 'lucide-react';
import debounce from 'lodash/debounce';
import { SettingGroup } from '../shared';
import { SETTING_GROUPS } from '../constants';
import { Switch } from '~/components/ui';
import { useGetStartupConfig } from '~/data-provider';

interface ModelProviderSettingsProps {
  adminConfig: any;
  onUpdateSetting: (key: string, value: any) => void;
  isSettingUpdating: (key: string) => boolean;
}

const ModelProviderSettings: React.FC<ModelProviderSettingsProps> = ({
  adminConfig,
  onUpdateSetting,
  isSettingUpdating
}) => {
  const [showKeys, setShowKeys] = useState<Record<string, Record<string, boolean>>>({});
  const [inputValues, setInputValues] = useState<Record<string, Record<string, string>>>({});
  const { data: startupConfig } = useGetStartupConfig();

  const providers = SETTING_GROUPS.modelProviders.settings;

  // Get admin panel model provider configuration
  const adminModelProviderKeys = (startupConfig as any)?.modelProviderKeys;
  const envModelProviders = (startupConfig as any)?.envModelProviders;

  const toggleKeyVisibility = (provider: string, field: string) => {
    setShowKeys(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        [field]: !prev[provider]?.[field]
      }
    }));
  };

  const updateProviderField = (provider: string, field: string, value: any) => {
    const currentConfig = adminConfig?.modelProviderKeys || {};
    const newConfig = {
      ...currentConfig,
      [provider]: {
        ...currentConfig[provider],
        [field]: value
      }
    };
    onUpdateSetting('modelProviderKeys', newConfig);
  };

  // Create a debounced version of updateProviderField
  const debouncedUpdateField = useCallback(
    debounce((provider: string, field: string, value: string) => {
      updateProviderField(provider, field, value);
    }, 1000),
    [] // Empty dependency array since we don't want to recreate this function
  );

  const handleInputChange = (provider: string, field: string, value: string) => {
    // Update local state immediately
    setInputValues(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        [field]: value
      }
    }));
    // Debounce the actual update
    debouncedUpdateField(provider, field, value);
  };

  const getProviderValue = (provider: string, field: string) => {
    // First check input values, then fall back to admin config
    return inputValues[provider]?.[field] ?? adminConfig?.modelProviderKeys?.[provider]?.[field] ?? '';
  };

  const isProviderEnabled = (provider: string) => {
    // Provider is enabled if configured in admin panel OR environment variables
    return adminConfig?.modelProviderKeys?.[provider]?.enabled === true || isProviderConfiguredInEnv(provider);
  };

  const isProviderConfiguredInAdmin = (provider: string) => {
    return adminModelProviderKeys?.[provider]?.enabled === true;
  };

  const isProviderConfiguredInEnv = (provider: string) => {
    return envModelProviders?.[provider] === true;
  };

  const validateProviderCredentials = (provider: string) => {
    const config = adminConfig?.modelProviderKeys?.[provider];
    if (!config) return false;

    if (provider === 'bedrock') {
      return config.accessKeyId && config.secretAccessKey;
    }
    return config.apiKey;
  };

  const hasRequiredCredentials = (provider: string) => {
    // If provider is configured via environment variables, assume credentials are present
    if (isProviderConfiguredInEnv(provider)) {
      return true;
    }
    return validateProviderCredentials(provider);
  };

  const toggleProviderEnabled = async (provider: string, enabled: boolean) => {
    // Only update admin config if provider is not read-only (environment-configured)
    if (!isProviderReadOnly(provider)) {
      updateProviderField(provider, 'enabled', enabled);
    }
  };

  const isProviderReadOnly = (provider: string) => {
    // Provider is read-only if configured via environment variables but not via admin panel
    return isProviderConfiguredInEnv(provider) && !isProviderConfiguredInAdmin(provider);
  };

  return (
    <SettingGroup 
      id="modelProviders"
      title="Model Provider Configuration"
      icon={Key}
      description="Configure API keys for model providers when users cannot provide their own"
    >
      <div className="space-y-6 py-6">
        {providers.map((provider) => {
          const isEnabled = isProviderEnabled(provider.key);
          const hasCredentials = hasRequiredCredentials(provider.key);
          const canEnable = hasCredentials;
          const isConfiguredInAdmin = isProviderConfiguredInAdmin(provider.key);
          const isConfiguredInEnv = isProviderConfiguredInEnv(provider.key);
          const isReadOnly = isProviderReadOnly(provider.key);

          return (
            <div key={provider.key} className="border rounded-lg overflow-hidden">
              {/* Provider Header with Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-medium">{provider.label}</h3>
                    {isConfiguredInAdmin && (
                      <div className="flex items-center text-green-600">
                        <Check className="w-4 h-4 mr-1" />
                        <span className="text-xs">Admin Panel</span>
                      </div>
                    )}
                    {!isConfiguredInAdmin && isConfiguredInEnv && (
                      <div className="flex items-center text-blue-600">
                        <FileText className="w-4 h-4 mr-1" />
                        <span className="text-xs">Environment</span>
                      </div>
                    )}
                    {!hasCredentials && isEnabled && (
                      <div className="flex items-center text-amber-600">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        <span className="text-xs">Missing credentials</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{provider.description}</p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">
                      {isEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={(checked) => toggleProviderEnabled(provider.key, checked)}
                      disabled={isSettingUpdating('modelProviderKeys') || isReadOnly}
                    />
                  </div>
                </div>
              </div>

              {/* Credentials Section - Show when enabled and not read-only */}
              {isEnabled && !isReadOnly && (
                <div className="p-4">
                  <div className="space-y-4">
                    {provider.fields?.map((field) => (
                      <div key={field.key} className="space-y-2">
                        <label className="block text-sm font-medium">
                          {field.label}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        
                        <div className="relative">
                          <input
                            type={field.type === 'password' && !showKeys[provider.key]?.[field.key] ? 'password' : 'text'}
                            value={getProviderValue(provider.key, field.key)}
                            onChange={(e) => handleInputChange(provider.key, field.key, e.target.value)}
                            placeholder={field.placeholder}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={isSettingUpdating('modelProviderKeys')}
                          />
                          
                          {field.type === 'password' && (
                            <button
                              type="button"
                              onClick={() => toggleKeyVisibility(provider.key, field.key)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showKeys[provider.key]?.[field.key] ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                        
                        {field.type === 'password' && getProviderValue(provider.key, field.key) && (
                          <p className="text-xs text-gray-500">
                            ✓ Encrypted and stored securely
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Help text when disabled, read-only, or enabled but missing credentials */}
              {(!isEnabled || isReadOnly || (isEnabled && !hasCredentials && !isReadOnly)) && (
                <div className="p-4 bg-gray-50 text-sm text-gray-600">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5 text-gray-500" />
                    <div>
                      <p className="font-medium">
                        {isReadOnly 
                          ? 'Provider Enabled via Environment' 
                          : isEnabled && !hasCredentials 
                            ? 'Credentials Required'
                            : 'Provider Disabled'
                        }
                      </p>
                      <p className="mt-1">
                        {isReadOnly 
                          ? 'This provider is enabled and configured via environment variables. It is available to all users but cannot be managed through this admin panel. To manage it here, remove the environment variable configuration first.'
                          : isEnabled && !hasCredentials
                            ? 'This provider is enabled but requires API credentials to function. Please enter the required credentials above.'
                            : 'Enable this provider to configure API credentials. Required credentials must be provided before users can access this provider.'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Configuration Sources</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• <strong>Admin Panel (Green):</strong> Providers configured via this interface - fully manageable</li>
            <li>• <strong>Environment (Blue):</strong> Providers configured via environment variables - enabled but read-only here</li>
            <li>• <strong>Security:</strong> All API keys are encrypted and stored securely in the database</li>
            <li>• <strong>Availability:</strong> Enabled providers are available to all users without requiring individual API keys</li>
            <li>• <strong>Validation:</strong> Admin panel providers can only be enabled when all required credentials are provided</li>
            <li>• <strong>Model Access:</strong> Disable "Show All Models" in Interface Settings to hide user-key-required models</li>
            <li>• <strong>Changes:</strong> Take effect immediately for new conversations</li>
          </ul>
        </div>
      </div>
    </SettingGroup>
  );
};

export default ModelProviderSettings; 