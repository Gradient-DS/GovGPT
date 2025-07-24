import { Settings, Palette, Key, KeySquare, UserCheck, MessageSquare, Image, Shield } from 'lucide-react';

export interface Setting {
  key: string;
  label: string;
  description: string;
  type: 'boolean' | 'text' | 'textarea' | 'url';
  defaultValue: boolean | string;
  placeholder?: string;
}

export interface SettingGroup {
  id: string;
  title: string;
  description: string;
  icon: React.FC<{ className?: string }>;
  settings: Setting[];
}

export const SETTING_GROUPS: SettingGroup[] = [
  {
    id: 'interface',
    title: 'Interface & Experience',
    description: 'Control what features and UI elements users can access',
    icon: Settings,
    settings: [
      { 
        key: 'interface.modelSelect', 
        label: 'Model & Endpoint Selection', 
        description: 'Allow users to choose between different AI providers and models',
        type: 'boolean', 
        defaultValue: true 
      },
      { 
        key: 'interface.parameters', 
        label: 'Model Parameters', 
        description: 'Allow users to adjust temperature, top-p, and other model parameters',
        type: 'boolean', 
        defaultValue: true 
      },
      { 
        key: 'interface.sidePanel', 
        label: 'Tools Sidebar', 
        description: 'Show sidebar with agents, prompts, memories, and other tools',
        type: 'boolean', 
        defaultValue: true 
      },
      { 
        key: 'interface.presets', 
        label: 'Conversation Presets', 
        description: 'Enable preset conversation templates for common use cases',
        type: 'boolean', 
        defaultValue: true 
      },
      { 
        key: 'interface.prompts', 
        label: 'Prompt Library', 
        description: 'Access to shared prompt templates and community prompts',
        type: 'boolean', 
        defaultValue: true 
      },
      { 
        key: 'interface.memories', 
        label: 'Memories', 
        description: 'Enable AI memory functionality for personalized conversations',
        type: 'boolean', 
        defaultValue: true 
      },
      { 
        key: 'interface.bookmarks', 
        label: 'Message Bookmarks', 
        description: 'Allow users to bookmark important messages for later reference',
        type: 'boolean', 
        defaultValue: true 
      },
      { 
        key: 'interface.multiConvo', 
        label: 'Multiple Conversations', 
        description: 'Enable users to create and manage multiple conversation threads',
        type: 'boolean', 
        defaultValue: true 
      },
      { 
        key: 'interface.agents', 
        label: 'AI Agents', 
        description: 'Advanced AI agents with specialized capabilities and tools',
        type: 'boolean', 
        defaultValue: true 
      },
    ],
  },
  {
    id: 'branding',
    title: 'Site Branding & Content',
    description: 'Customize your site branding and content',
    icon: Palette,
    settings: [
      { 
        key: 'interface.customWelcome', 
        label: 'Welcome Message', 
        description: 'Custom welcome message shown to users on the main page',
        type: 'textarea', 
        defaultValue: '',
        placeholder: 'Enter a custom welcome message for your users...'
      },
      {
        key: 'appTitle',
        label: 'Application Title',
        description: 'Custom title displayed in browser tab and header',
        type: 'text',
        defaultValue: '',
        placeholder: 'Enter custom app title...'
      },
      {
        key: 'helpAndFaqURL',
        label: 'Help & FAQ URL',
        description: 'Link to your help documentation or FAQ page',
        type: 'url',
        defaultValue: '',
        placeholder: 'https://example.com/help'
      },
      {
        key: 'customFooter',
        label: 'Footer Content',
        description: 'Custom content displayed in the footer area',
        type: 'textarea',
        defaultValue: '',
        placeholder: 'Enter custom footer content...'
      }
    ],
  },
  {
    id: 'logoImages',
    title: 'Logo & Images',
    description: 'Customize logos, images, and brand colors',
    icon: Image,
    settings: [
      {
        key: 'logoUrl',
        label: 'Logo URL',
        description: 'URL for your custom logo image displayed in the header',
        type: 'url',
        defaultValue: '',
        placeholder: 'https://example.com/logo.png'
      },
      {
        key: 'faviconUrl',
        label: 'Favicon URL',
        description: 'URL for your custom favicon (bookmark icon) shown in browser tabs',
        type: 'url',
        defaultValue: '',
        placeholder: 'https://example.com/favicon.ico'
      },
      {
        key: 'backgroundImageUrl',
        label: 'Background Image URL',
        description: 'URL for custom background image displayed on the main page',
        type: 'url',
        defaultValue: '',
        placeholder: 'https://example.com/background.jpg'
      }
    ],
  },
  {
    id: 'models',
    title: 'Model Access Control',
    description: 'Control which AI models and features are available to users',
    icon: Key,
    settings: [
      {
        key: 'hideNoConfigModels',
        label: 'Enable User-Provided API Keys',
        description: 'Allow users to add their own API keys for models when admin keys are not configured',
        type: 'boolean',
        defaultValue: false
      },
      {
        key: 'plugins',
        label: 'Legacy Plugins',
        description: 'Enable deprecated ChatGPT plugins functionality (not recommended)',
        type: 'boolean',
        defaultValue: false
      },
      {
        key: 'webSearch',
        label: 'Web Search',
        description: 'Allow AI to search the internet for current information and facts',
        type: 'boolean',
        defaultValue: true
      },
      {
        key: 'runCode',
        label: 'Code Execution',
        description: 'Enable AI to run and execute code in a secure environment',
        type: 'boolean',
        defaultValue: true
      },
      {
        key: 'fileSearch',
        label: 'File Search',
        description: 'Allow AI to search through uploaded documents and files',
        type: 'boolean',
        defaultValue: true
      }
    ],
  },
  {
    id: 'registration',
    title: 'Registration & Authentication',
    description: 'Control how users can register and authenticate with your system',
    icon: UserCheck,
    settings: [
      {
        key: 'registrationEnabled',
        label: 'User Registration',
        description: 'Allow new users to create accounts on your platform',
        type: 'boolean',
        defaultValue: true
      },
      {
        key: 'socialLoginEnabled',
        label: 'Social Authentication',
        description: 'Enable login with social media accounts (Google, GitHub, etc.)',
        type: 'boolean',
        defaultValue: true
      },
      {
        key: 'emailLoginEnabled',
        label: 'Email Authentication',
        description: 'Allow users to login with email and password',
        type: 'boolean',
        defaultValue: true
      },
      {
        key: 'passwordResetEnabled',
        label: 'Password Reset',
        description: 'Enable password reset functionality via email',
        type: 'boolean',
        defaultValue: true
      }
    ],
  },
  {
    id: 'conversations',
    title: 'Conversation Settings',
    description: 'Control how conversations are created, stored, and managed',
    icon: MessageSquare,
    settings: [
      {
        key: 'temporaryChat',
        label: 'Temporary Conversations',
        description: 'Enable conversations that are not saved to user history',
        type: 'boolean',
        defaultValue: false
      }
    ],
  },
]; 