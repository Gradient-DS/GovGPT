import React from 'react';
import { SettingGroup } from '../constants';
import SettingToggle from './SettingToggle';
import SettingText from './SettingText';

interface SettingsSectionProps {
  group: SettingGroup;
  values: Record<string, unknown>;
  saving: boolean;
  onUpdateSetting: (key: string, value: unknown) => void;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  group,
  values,
  saving,
  onUpdateSetting,
}) => {
  return (
    <section id={group.id} className="mb-12 min-h-[50vh]">
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <group.icon className="w-5 h-5" />
          <h2 className="text-xl font-semibold ml-3">{group.title}</h2>
        </div>
        <p className="text-sm text-gray-600 m-0 leading-6">{group.description}</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {group.settings.map((setting) => {
          const current = values[setting.key] ?? setting.defaultValue;

          if (setting.type === 'boolean') {
            return (
              <SettingToggle
                key={setting.key}
                label={setting.label}
                description={setting.description}
                value={Boolean(current)}
                disabled={saving}
                onChange={(v) => onUpdateSetting(setting.key, v)}
              />
            );
          }

          if (['text', 'textarea', 'url'].includes(setting.type)) {
            return (
              <SettingText
                key={setting.key}
                label={setting.label}
                description={setting.description}
                type={setting.type as 'text' | 'textarea' | 'url'}
                value={String(current)}
                placeholder={setting.placeholder}
                disabled={saving}
                onBlur={(v) => onUpdateSetting(setting.key, v)}
              />
            );
          }
          return null;
        })}
      </div>
    </section>
  );
}; 