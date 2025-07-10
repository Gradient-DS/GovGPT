import React from 'react';
import { Globe } from 'lucide-react';
import { SettingGroup, ToggleSetting } from '../shared';

interface ChatSettingsProps {
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

const ChatSettings: React.FC<ChatSettingsProps> = ({
  settings,
  getEffectiveValue,
  isOverride,
  isSettingUpdating,
  onUpdateSetting
}) => {
  return (
    <SettingGroup
      id="chat"
      title="Chat Features"
      description="Special chat features and capabilities"
      icon={Globe}
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

export default ChatSettings; 