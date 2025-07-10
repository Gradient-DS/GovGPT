import React from 'react';
import { Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SystemRoles } from 'librechat-data-provider';
import { useAuthContext } from '~/hooks/AuthContext';
import { useAdminConfig } from '~/hooks/Admin/useAdminConfig';
import { useLocalize } from '~/hooks';
import { useToastContext } from '~/Providers';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import SiteBrandingSettings from './SiteBrandingSettings';
import LogoImagesSettings from './LogoImagesSettings';
import LegalComplianceSettings from './LegalComplianceSettings';
import InterfaceSettings from './InterfaceSettings';
import ModelAccessSettings from './ModelAccessSettings';
import RegistrationSettings from './RegistrationSettings';
import ChatSettings from './ChatSettings';
import UserManagement from './UserManagement/UserManagement';
import { ModelProviderSettings } from './ModelProviderSettings';
import { CustomEndpoints } from './CustomEndpoints';
import { SETTING_GROUPS } from './constants';
import store from '~/store';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const localize = useLocalize();
  const { showToast } = useToastContext();
  const {
    adminConfig,
    startupConfig,
    isLoading,
    updateSetting,
    resetAllSettings,
    isUpdating,
    addToArray,
    removeFromArray,
    updateSocialLoginConfig,
    updateAdminConfig
  } = useAdminConfig();
  const clearAllSubmissions = store.useClearSubmissionState();

  // State for array input values
  const [arrayInputs, setArrayInputs] = React.useState<Record<string, string>>({});
  const [activeSection, setActiveSection] = React.useState<string>(Object.keys(SETTING_GROUPS)[0]);
  const [debounceTimer, setDebounceTimer] = React.useState<NodeJS.Timeout | null>(null);
  const [updatingSettings, setUpdatingSettings] = React.useState<Set<string>>(new Set());
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  // Keep a ref to the latest active section so scroll handler has up-to-date value
  const activeSectionRef = React.useRef(activeSection);
  React.useEffect(() => {
    activeSectionRef.current = activeSection;
  }, [activeSection]);

  // Redirect if not admin
  React.useEffect(() => {
    if (user?.role !== SystemRoles.ADMIN) {
      navigate('/');
    }
  }, [user?.role, navigate]);

  // Cleanup debounce timer
  React.useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  // Track active section on scroll (scroll-spy)
  React.useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) {
      return;
    }

    const sections = Object.keys(SETTING_GROUPS);
    const headerOffset = 120; // Account for sticky header + some margin

    const handleScroll = () => {
      const containerRect = scrollContainer.getBoundingClientRect();
      let current = sections[0];

      for (const section of sections) {
        const el = document.getElementById(section);
        if (!el) continue;
        const top = el.getBoundingClientRect().top - containerRect.top;

        if (top - headerOffset <= 0) {
          current = section; // The last section whose top has passed the offset
        } else {
          break; // Subsequent sections are below the viewport
        }
      }

      if (current !== activeSectionRef.current) {
        setActiveSection(current);
      }
    };

    // Initial calculation after slight delay to allow layout
    const initTimer = setTimeout(handleScroll, 100);

    scrollContainer.addEventListener('scroll', handleScroll);

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
      clearTimeout(initTimer);
    };
  }, []);

  // Clear any active submissions when admin panel opens
  React.useEffect(() => {
    clearAllSubmissions();
  }, [clearAllSubmissions]);

  // Don't render anything if not admin
  if (user?.role !== SystemRoles.ADMIN) {
    return null;
  }

  const handleClose = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const getEffectiveValue = (key: string): boolean | string | object => {
    // Check admin override first
    const adminValue = adminConfig?.[key];
    if (adminValue !== null && adminValue !== undefined) {
      return adminValue;
    }

    // Registration settings are at root level of startup config
    if (['registrationEnabled', 'socialLoginEnabled', 'emailLoginEnabled', 'passwordResetEnabled'].includes(key)) {
      const rootValue = startupConfig?.[key];
      if (rootValue !== null && rootValue !== undefined) {
        return rootValue;
      }
    }

    // Text settings can be at interface level or root level
    if (['customWelcome', 'appTitle', 'helpAndFaqURL', 'customFooter', 'logoUrl', 'faviconUrl', 'backgroundImageUrl', 'primaryColor', 'privacyPolicy', 'termsOfService'].includes(key)) {
      // Check interface first, then root level
      const interfaceValue = startupConfig?.interface?.[key];
      if (interfaceValue !== null && interfaceValue !== undefined) {
        return interfaceValue;
      }
      const rootValue = startupConfig?.[key];
      if (rootValue !== null && rootValue !== undefined) {
        return rootValue;
      }
    }

    // Other settings are under interface
    const interfaceValue = startupConfig?.interface?.[key];
    if (interfaceValue !== null && interfaceValue !== undefined) {
      return interfaceValue;
    }

    // Finally use default
    return getDefaultValue(key);
  };

  // Helper functions for text settings
  const getTextEffectiveValue = (key: string): string => {
    const value = getEffectiveValue(key);
    return typeof value === 'string' ? value : '';
  };

  // Helper function for boolean settings (maintains compatibility)
  const getBooleanEffectiveValue = (key: string): boolean => {
    const value = getEffectiveValue(key);
    return typeof value === 'boolean' ? value : false;
  };

  const getDefaultValue = (key: string): boolean | string | object => {
    // Default values for all settings
    const defaults: Record<string, boolean | string | object> = {
      // Interface settings
      endpointsMenu: true,
      modelSelect: true,
      parameters: true,
      sidePanel: true,
      presets: true,
      prompts: true,
      memories: true,
      bookmarks: true,
      multiConvo: true,
      hideNoConfigModels: false,
      plugins: true,
      webSearch: true,
      runCode: true,
      agents: true,
      temporaryChat: true,
      betaFeatures: true,
      // Text settings
      customWelcome: '',
      appTitle: '',
      helpAndFaqURL: '',
      customFooter: '',
      // Logo & Image settings
      logoUrl: '',
      faviconUrl: '',
      backgroundImageUrl: '',
      primaryColor: '',
      // Legal & Compliance settings
      privacyPolicy: {},
      termsOfService: {},
      // Registration settings
      registrationEnabled: true,
      socialLoginEnabled: true,
      emailLoginEnabled: true,
      passwordResetEnabled: true
    };
    return defaults[key] ?? false;
  };

  const isOverride = (key: string): boolean => {
    const adminValue = adminConfig?.[key];
    // There's an override if admin has set a value (not null)
    return adminValue !== null && adminValue !== undefined;
  };

  const isSettingUpdating = (key: string): boolean => {
    return updatingSettings.has(key);
  };

  // Debounced auto-save function for boolean settings
  const debouncedUpdateSetting = React.useCallback((key: string, value: boolean) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Add to updating set
    setUpdatingSettings(prev => new Set(prev).add(key));

    const timer = setTimeout(async () => {
      try {
        console.log(`🔄 Updating ${key} to ${value}`);
        await updateSetting(key, value);
        console.log(`✅ Successfully updated ${key} to ${value}`);
        showToast({ status: 'success', message: 'Saved' });
      } catch (error) {
        console.error(`❌ Failed to update ${key}:`, error);
        showToast({ status: 'error', message: 'Failed to save setting' });
      } finally {
        // Remove from updating set
        setUpdatingSettings(prev => {
          const newSet = new Set(prev);
          newSet.delete(key);
          return newSet;
        });
      }
    }, 500); // 500ms debounce

    setDebounceTimer(timer);
  }, [debounceTimer, updateSetting, showToast]);

  // Debounced auto-save function for text settings
  const debouncedUpdateTextSetting = React.useCallback((key: string, value: string) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Add to updating set
    setUpdatingSettings(prev => new Set(prev).add(key));

    const timer = setTimeout(async () => {
      try {
        console.log(`🔄 Updating ${key} to ${value}`);
        await updateSetting(key, value);
        console.log(`✅ Successfully updated ${key} to ${value}`);
        showToast({ status: 'success', message: 'Saved' });
      } catch (error) {
        console.error(`❌ Failed to update ${key}:`, error);
        showToast({ status: 'error', message: 'Failed to save setting' });
      } finally {
        // Remove from updating set
        setUpdatingSettings(prev => {
          const newSet = new Set(prev);
          newSet.delete(key);
          return newSet;
        });
      }
    }, 500); // 500ms debounce

    setDebounceTimer(timer);
  }, [debounceTimer, updateSetting, showToast]);

  const getCurrentValues = (key: string): string[] => {
    // Check admin config first, then startup config for supported settings
    let currentValues = adminConfig?.[key] || [];
    if (key === 'socialLogins' && currentValues.length === 0) {
      currentValues = startupConfig?.socialLogins || [];
    }
    // Note: allowedDomains only exists in admin config, not startup config
    return currentValues;
  };

  const handleArrayInputChange = (key: string, value: string) => {
    setArrayInputs(prev => ({ ...prev, [key]: value }));
  };

  const handleAddToArray = (key: string, value: string) => {
    addToArray(key, value);
    setArrayInputs(prev => ({ ...prev, [key]: '' }));
  };

  // Scroll to a section smoothly and update active state immediately
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(sectionId);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 z-[100] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-[100] overflow-hidden flex">
      {/* Sidebar Navigation */}
      <AdminSidebar
        activeSection={activeSection}
        onSectionChange={scrollToSection}
      />

      {/* Main Content */}
      <div ref={scrollContainerRef} className="flex-1 overflow-auto">
        {/* Header */}
        <AdminHeader
          onClose={handleClose}
          onResetAll={resetAllSettings}
          isUpdating={isUpdating}
        />

        {/* Content */}
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="space-y-8">

            {/* User Management */}
            <UserManagement />
            
            {/* Site Branding Settings */}
            <SiteBrandingSettings
              textSettings={SETTING_GROUPS.siteBranding.textSettings}
              getEffectiveValue={getTextEffectiveValue}
              isOverride={isOverride}
              isSettingUpdating={isSettingUpdating}
              onUpdateSetting={debouncedUpdateTextSetting}
            />

            {/* Logo & Images Settings */}
            <LogoImagesSettings
              textSettings={SETTING_GROUPS.logoImages.textSettings}
              getEffectiveValue={getTextEffectiveValue}
              isOverride={isOverride}
              isSettingUpdating={isSettingUpdating}
              onUpdateSetting={debouncedUpdateTextSetting}
            />

            {/* Legal & Compliance Settings */}
            <LegalComplianceSettings
              adminConfig={adminConfig}
              getEffectiveValue={getEffectiveValue}
              isOverride={isOverride}
              isSettingUpdating={isSettingUpdating}
              onUpdateSetting={debouncedUpdateTextSetting}
            />

            {/* Interface Settings */}
            <InterfaceSettings
              settings={SETTING_GROUPS.interface.settings}
              getEffectiveValue={getBooleanEffectiveValue}
              isOverride={isOverride}
              isSettingUpdating={isSettingUpdating}
              onUpdateSetting={debouncedUpdateSetting}
            />

            {/* Model Access Settings */}
            <ModelAccessSettings
              settings={SETTING_GROUPS.models.settings}
              getEffectiveValue={getBooleanEffectiveValue}
              isOverride={isOverride}
              isSettingUpdating={isSettingUpdating}
              onUpdateSetting={debouncedUpdateSetting}
            />

            {/* Model Provider Configuration */}
            <ModelProviderSettings
              adminConfig={adminConfig}
              onUpdateSetting={(key, value) => {
                // Handle complex object updates for modelProviderKeys
                if (key === 'modelProviderKeys') {
                  updateAdminConfig({ [key]: value });
                } else {
                  updateSetting(key, value);
                }
              }}
              isSettingUpdating={isSettingUpdating}
            />

            {/* Custom Endpoints */}
            <CustomEndpoints
              adminConfig={adminConfig}
              onUpdateSetting={(key, value) => {
                // Handle both simple and complex updates
                updateAdminConfig({ [key]: value });
              }}
              isSettingUpdating={isSettingUpdating}
            />

            {/* Registration Settings */}
            <RegistrationSettings
              settings={SETTING_GROUPS.registration.settings}
              multiSelectSettings={SETTING_GROUPS.registration.multiSelectSettings}
              arraySettings={SETTING_GROUPS.registration.arraySettings}
              getEffectiveValue={getBooleanEffectiveValue}
              isOverride={isOverride}
              isSettingUpdating={isSettingUpdating}
              onUpdateSetting={debouncedUpdateSetting}
              onAddToArray={handleAddToArray}
              onRemoveFromArray={removeFromArray}
              onUpdateSocialLoginConfig={updateSocialLoginConfig}
              arrayInputs={arrayInputs}
              onArrayInputChange={handleArrayInputChange}
              getCurrentValues={getCurrentValues}
              adminConfig={adminConfig}
            />

            {/* Chat Settings */}
            <ChatSettings
              settings={SETTING_GROUPS.chat.settings}
              getEffectiveValue={getBooleanEffectiveValue}
              isOverride={isOverride}
              isSettingUpdating={isSettingUpdating}
              onUpdateSetting={debouncedUpdateSetting}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage; 