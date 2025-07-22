import React from 'react';
import { UserCheck } from 'lucide-react';
import { SettingGroup, ToggleSetting, MultiSelectSetting, ArraySetting } from '../shared';
import SocialLoginConfig from './SocialLoginConfig';

interface RegistrationSettingsProps {
  settings: Array<{
    key: string;
    label: string;
    description: string;
    inverted?: boolean;
  }>;
  multiSelectSettings: Array<{
    key: string;
    label: string;
    description: string;
    options: string[];
  }>;
  arraySettings: Array<{
    key: string;
    label: string;
    description: string;
    placeholder: string;
  }>;
  getEffectiveValue: (key: string) => boolean;
  isOverride: (key: string) => boolean;
  isSettingUpdating: (key: string) => boolean;
  onUpdateSetting: (key: string, value: boolean) => void;
  onAddToArray: (key: string, value: string) => void;
  onRemoveFromArray: (key: string, value: string) => void;
  onUpdateSocialLoginConfig: (provider: string, key: string, value: any) => void;
  arrayInputs: Record<string, string>;
  onArrayInputChange: (key: string, value: string) => void;
  getCurrentValues: (key: string) => string[];
  adminConfig: any;
}

const RegistrationSettings: React.FC<RegistrationSettingsProps> = ({
  settings,
  multiSelectSettings,
  arraySettings,
  getEffectiveValue,
  isOverride,
  isSettingUpdating,
  onUpdateSetting,
  onAddToArray,
  onRemoveFromArray,
  onUpdateSocialLoginConfig,
  arrayInputs,
  onArrayInputChange,
  getCurrentValues,
  adminConfig
}) => {
  // General updating state for non-toggle settings
  const isAnyUpdating = settings.some(setting => isSettingUpdating(setting.key));
  return (
    <SettingGroup
      id="registration"
      title="Registration & Authentication"
      description="Control how users can register and authenticate"
      icon={UserCheck}
    >
      {/* Toggle Settings */}
      {settings.map(setting => (
        <ToggleSetting
          key={setting.key}
          setting={setting}
          effectiveValue={getEffectiveValue(setting.key)}
          isOverride={isOverride(setting.key)}
          isUpdating={isSettingUpdating(setting.key)}
          onToggle={onUpdateSetting}
        />
      ))}
      
      {/* Multi-select Settings */}
      {multiSelectSettings.map(setting => {
        const currentValues = getCurrentValues(setting.key);
        
        return (
          <MultiSelectSetting
            key={setting.key}
            setting={setting}
            currentValues={currentValues}
            isUpdating={isAnyUpdating}
            onAdd={onAddToArray}
            onRemove={onRemoveFromArray}
          >
            {/* Show configuration forms for enabled social login providers */}
            {setting.key === 'socialLogins' && currentValues.length > 0 && (
              <div className="mt-4">
                <h5 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-3">
                  Provider Configuration
                </h5>
                {currentValues.map((provider: string) => (
                  <SocialLoginConfig
                    key={provider}
                    provider={provider}
                    providerConfig={adminConfig?.socialLoginConfig?.[provider] || {}}
                    isUpdating={isAnyUpdating}
                    onUpdateConfig={onUpdateSocialLoginConfig}
                  />
                ))}
              </div>
            )}
          </MultiSelectSetting>
        );
      })}
      
      {/* Array Settings */}
      {arraySettings.map(setting => (
        <ArraySetting
          key={setting.key}
          setting={setting}
          currentValues={getCurrentValues(setting.key)}
          inputValue={arrayInputs[setting.key] || ''}
          isUpdating={isAnyUpdating}
          onAdd={onAddToArray}
          onRemove={onRemoveFromArray}
          onInputChange={onArrayInputChange}
        />
      ))}
    </SettingGroup>
  );
};

export default RegistrationSettings; 