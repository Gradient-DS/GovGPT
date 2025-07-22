import React from 'react';
import { Image } from 'lucide-react';
import SettingGroup from '../shared/SettingGroup';
import TextSetting from '../shared/TextSetting';

interface LogoImagesSettingsProps {
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

const LogoImagesSettings: React.FC<LogoImagesSettingsProps> = ({
  textSettings,
  getEffectiveValue,
  isOverride,
  isSettingUpdating,
  onUpdateSetting,
}) => {
  return (
    <SettingGroup
      id="logoImages"
      title="Logo & Images"
      description="Customize logos, images, and brand colors"
      icon={Image}
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

export default LogoImagesSettings; 