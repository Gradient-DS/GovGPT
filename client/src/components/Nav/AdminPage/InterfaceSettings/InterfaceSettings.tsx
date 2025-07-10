import React from 'react';
import { Settings, ChevronRight, ChevronDown } from 'lucide-react';
import { SettingGroup, ToggleSetting } from '../shared';
import AgentPermissions from '../AgentPermissions';
import MemoryPermissions from '../MemoryPermissions';
import { PromptPermissions } from '../PromptPermissions';

interface InterfaceSettingsProps {
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

// Settings that depend on sidePanel being enabled (all tools that live in the sidebar)
const SIDE_PANEL_DEPENDENT_SETTINGS = ['parameters', 'prompts', 'memories', 'agents'];

const InterfaceSettings: React.FC<InterfaceSettingsProps> = ({
  settings,
  getEffectiveValue,
  isOverride,
  isSettingUpdating,
  onUpdateSetting
}) => {
  const handleToggle = (key: string, value: boolean) => {
    // Simply pass through all setting changes - let users manage their own settings
    onUpdateSetting(key, value);
  };

  // Separate settings into groups
  const independentSettings = settings.filter(setting => 
    !SIDE_PANEL_DEPENDENT_SETTINGS.includes(setting.key) && setting.key !== 'sidePanel'
  );
  
  const sidePanelSetting = settings.find(setting => setting.key === 'sidePanel');
  
  const dependentSettings = settings.filter(setting => 
    SIDE_PANEL_DEPENDENT_SETTINGS.includes(setting.key)
  );

  const sidePanelEnabled = getEffectiveValue('sidePanel');
  const memoriesEnabled = getEffectiveValue('memories');
  const agentsEnabled = getEffectiveValue('agents');
  const promptsEnabled = getEffectiveValue('prompts');

  return (
    <SettingGroup
      id="interface"
      title="Interface & Experience"
      description="Control what features and UI elements users can access"
      icon={Settings}
    >
      {/* Independent settings */}
      {independentSettings.map(setting => (
        <ToggleSetting
          key={setting.key}
          setting={setting}
          effectiveValue={getEffectiveValue(setting.key)}
          isOverride={isOverride(setting.key)}
          isUpdating={isSettingUpdating(setting.key)}
          onToggle={handleToggle}
        />
      ))}

      {/* Side Panel setting with nested dependent settings */}
      {sidePanelSetting && (
        <div className="space-y-0">
          {/* Main Side Panel setting */}
          <ToggleSetting
            key={sidePanelSetting.key}
            setting={sidePanelSetting}
            effectiveValue={getEffectiveValue(sidePanelSetting.key)}
            isOverride={isOverride(sidePanelSetting.key)}
            isUpdating={isSettingUpdating(sidePanelSetting.key)}
            onToggle={handleToggle}
          />
          
          {/* Dependent settings as nested group */}
          <div className="ml-6 border-l-2 border-gray-200 dark:border-gray-700 pl-4 space-y-0">
            {/* Section header */}
            <div className="flex items-center gap-2 py-2 text-xs text-gray-500 dark:text-gray-400">
              {sidePanelEnabled ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
              <span className="font-medium">
                Tools Sidebar Features {sidePanelEnabled ? '(Available when Tools Sidebar is enabled)' : '(Requires Tools Sidebar to be enabled)'}
              </span>
            </div>
            
            {/* Dependent settings */}
            {dependentSettings.map(setting => {
              const isDisabledByParent = !sidePanelEnabled;
              
              return (
                <div key={setting.key} className="relative">
                  <ToggleSetting
                    setting={{
                      ...setting,
                      description: setting.description // Keep original description clean
                    }}
                    effectiveValue={getEffectiveValue(setting.key)}
                    isOverride={isOverride(setting.key)}
                    isUpdating={isSettingUpdating(setting.key)}
                    onToggle={handleToggle}
                    disabled={isDisabledByParent}
                  />
                  
                  {/* Nested Memory Permissions */}
                  {setting.key === 'memories' && sidePanelEnabled && memoriesEnabled && (
                    <MemoryPermissions />
                  )}
                  
                  {/* Nested Agent Permissions */}
                  {setting.key === 'agents' && sidePanelEnabled && agentsEnabled && (
                    <AgentPermissions />
                  )}
                  
                  {/* Nested Prompt Permissions */}
                  {setting.key === 'prompts' && sidePanelEnabled && promptsEnabled && (
                    <PromptPermissions />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </SettingGroup>
  );
};

export default InterfaceSettings; 