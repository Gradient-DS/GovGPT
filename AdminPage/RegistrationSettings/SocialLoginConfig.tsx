import React from 'react';

interface SocialLoginConfigProps {
  provider: string;
  providerConfig: Record<string, any>;
  isUpdating: boolean;
  onUpdateConfig: (provider: string, key: string, value: any) => void;
}

const SocialLoginConfig: React.FC<SocialLoginConfigProps> = ({
  provider,
  providerConfig,
  isUpdating,
  onUpdateConfig
}) => {
  const getProviderConfig = (provider: string) => {
    const configs = {
      google: [
        { key: 'clientId', label: 'Client ID', required: true, type: 'text' },
        { key: 'clientSecret', label: 'Client Secret', required: true, type: 'password' }
      ],
      facebook: [
        { key: 'clientId', label: 'Client ID', required: true, type: 'text' },
        { key: 'clientSecret', label: 'Client Secret', required: true, type: 'password' }
      ],
      github: [
        { key: 'clientId', label: 'Client ID', required: true, type: 'text' },
        { key: 'clientSecret', label: 'Client Secret', required: true, type: 'password' }
      ],
      discord: [
        { key: 'clientId', label: 'Client ID', required: true, type: 'text' },
        { key: 'clientSecret', label: 'Client Secret', required: true, type: 'password' }
      ],
      apple: [
        { key: 'clientId', label: 'Client ID', required: true, type: 'text' },
        { key: 'teamId', label: 'Team ID', required: true, type: 'text' },
        { key: 'keyId', label: 'Key ID', required: true, type: 'text' },
        { key: 'privateKeyPath', label: 'Private Key Path', required: true, type: 'text' }
      ],
      openid: [
        { key: 'clientId', label: 'Client ID', required: true, type: 'text' },
        { key: 'clientSecret', label: 'Client Secret', required: true, type: 'password' },
        { key: 'issuer', label: 'Issuer URL', required: true, type: 'text' },
        { key: 'sessionSecret', label: 'Session Secret', required: true, type: 'password' },
        { key: 'buttonLabel', label: 'Button Label', required: false, type: 'text' },
        { key: 'imageUrl', label: 'Logo Image URL', required: false, type: 'text' },
        { key: 'autoRedirect', label: 'Auto Redirect', required: false, type: 'checkbox' }
      ],
      saml: [
        { key: 'entryPoint', label: 'Entry Point URL', required: true, type: 'text' },
        { key: 'issuer', label: 'Issuer', required: true, type: 'text' },
        { key: 'cert', label: 'Certificate Path', required: true, type: 'text' },
        { key: 'sessionSecret', label: 'Session Secret', required: true, type: 'password' },
        { key: 'buttonLabel', label: 'Button Label', required: false, type: 'text' },
        { key: 'imageUrl', label: 'Logo Image URL', required: false, type: 'text' }
      ]
    };
    return configs[provider] || [];
  };

  const fields = getProviderConfig(provider);

  return (
    <div className="mt-3 ml-6 p-3 bg-gray-50 dark:bg-gray-700 rounded border-l-2 border-blue-200 dark:border-blue-600">
      <h5 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2 capitalize">
        {provider} Configuration
      </h5>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {fields.map((field: any) => {
          const currentValue = providerConfig[field.key] || '';
          
          if (field.type === 'checkbox') {
            return (
              <div key={field.key} className="flex items-center justify-between col-span-full">
                <label className="text-xs text-gray-700 dark:text-gray-300">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <input
                  type="checkbox"
                  checked={currentValue || false}
                  onChange={(e) => onUpdateConfig(provider, field.key, e.target.checked)}
                  disabled={isUpdating}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>
            );
          }

          return (
            <div key={field.key} className="flex flex-col gap-1">
              <label className="text-xs text-gray-700 dark:text-gray-300">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <input
                type={field.type === 'password' ? 'password' : 'text'}
                value={currentValue}
                onChange={(e) => onUpdateConfig(provider, field.key, e.target.value || null)}
                disabled={isUpdating}
                placeholder={field.required ? 'Required' : 'Optional'}
                className={`px-2 py-1 border rounded text-xs bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 ${
                  field.required && !currentValue
                    ? 'border-red-300 dark:border-red-500' 
                    : 'border-gray-300 dark:border-gray-500'
                } focus:ring-blue-500 focus:border-blue-500`}
              />
              {field.required && !currentValue && (
                <p className="text-xs text-red-600 dark:text-red-400">Required</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SocialLoginConfig; 