import React from 'react';
import { MessageSquare } from 'lucide-react';
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
      id="conversations"
      title="Conversation Settings"
      description="Control how conversations are created, stored, and managed"
      icon={MessageSquare}
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