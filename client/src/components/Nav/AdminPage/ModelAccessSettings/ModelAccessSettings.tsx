import React from 'react';
import { Key } from 'lucide-react';
import { SettingGroup, ToggleSetting } from '../shared';

interface ModelAccessSettingsProps {
  settings: Array<{
    key: string;
    label: string;
    description: string;
    inverted?: boolean;
  }>;
  getEffectiveValue: (key: string) => boolean;
  isOverride: (key: string) => boolean;
  isSettingUpdating: (key: string) => boolean;
  onUpdateSetting: (key: string, value: boolean) => void;
}

const ModelAccessSettings: React.FC<ModelAccessSettingsProps> = ({
  settings,
  getEffectiveValue,
  isOverride,
  isSettingUpdating,
  onUpdateSetting
}) => {
  return (
    <SettingGroup
      id="models"
      title="Model Access Control"
      description="Control which AI models and features are available"
      icon={Key}
    >
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
    </SettingGroup>
  );
};

export default ModelAccessSettings; 