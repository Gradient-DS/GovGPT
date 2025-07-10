import React from 'react';
import { Palette } from 'lucide-react';
import SettingGroup from '../shared/SettingGroup';
import TextSetting from '../shared/TextSetting';

interface SiteBrandingSettingsProps {
  textSettings: Array<{
    key: string;
    label: string;
    description: string;
    type?: 'text' | 'url' | 'textarea' | 'color';
    placeholder?: string;
  }>;
  getEffectiveValue: (key: string) => string;
  isOverride: (key: string) => boolean;
  isSettingUpdating: (key: string) => boolean;
  onUpdateSetting: (key: string, value: string) => void;
}

const SiteBrandingSettings: React.FC<SiteBrandingSettingsProps> = ({
  textSettings,
  getEffectiveValue,
  isOverride,
  isSettingUpdating,
  onUpdateSetting,
}) => {
  return (
    <SettingGroup
      id="siteBranding"
      title="Site Branding & Content"
      description="Customize your site branding and content"
      icon={Palette}
    >
      {textSettings.map((setting) => (
        <TextSetting
          key={setting.key}
          setting={setting}
          effectiveValue={getEffectiveValue(setting.key)}
          isOverride={isOverride(setting.key)}
          isUpdating={isSettingUpdating(setting.key)}
          onUpdate={onUpdateSetting}
        />
      ))}
    </SettingGroup>
  );
};

export default SiteBrandingSettings; 