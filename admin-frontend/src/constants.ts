import { Settings, Palette, Key, KeySquare, MessageSquare, Image, Shield, Globe, Link, Wallet } from 'lucide-react';

export interface Setting {
  key: string;
  label: string;
  description: string;
  type: 'boolean' | 'text' | 'textarea' | 'url' | 'number';
  defaultValue: boolean | string | number;
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
        key: 'interface.webSearch',
        label: 'Web Search',
        description: 'Allow AI to search the internet for current information and facts',
        type: 'boolean',
        defaultValue: true
      },
      {
        key: 'interface.runCode',
        label: 'Code Execution',
        description: 'Enable AI to run and execute code in a secure environment',
        type: 'boolean',
        defaultValue: true
      }
    ],
  },
  {
    id: 'agents',
    title: 'Agent Endpoint',
    description: 'Configure agent capabilities and limits available to users',
    icon: Shield,
    settings: [
      {
        key: 'endpoints.agents.disableBuilder',
        label: 'Disable Builder UI',
        description: 'Hide the visual builder for creating agents',
        type: 'boolean',
        defaultValue: false,
      },
      {
        key: 'endpoints.agents.recursionLimit',
        label: 'Default Recursion Limit',
        description: 'Maximum steps per agent run (default)',
        type: 'number',
        defaultValue: 25,
      },
      {
        key: 'endpoints.agents.maxRecursionLimit',
        label: 'Max Recursion Limit',
        description: 'Absolute upper limit of recursion steps users may set',
        type: 'number',
        defaultValue: 100,
      },
      {
        key: 'endpoints.agents.allowedProviders',
        label: 'Allowed Providers',
        description: 'Comma-separated list of endpoint providers that agents may use (e.g. openAI, google)',
        type: 'text',
        defaultValue: '',
        placeholder: 'openAI, google',
      },
      {
        key: 'endpoints.agents.capabilities',
        label: 'Agent Capabilities',
        description: 'Comma-separated capabilities to expose (execute_code, web_search, etc.)',
        type: 'text',
        defaultValue: '',
        placeholder: 'execute_code, web_search, actions',
      },
    ],
  },

  {
    id: 'sharing',
    title: 'Sharing & Links',
    description: 'Control shared-link functionality',
    icon: Link,
    settings: [
      {
        key: 'sharedLinksEnabled',
        label: 'Enable Share Links',
        description: 'Allow users to create shareable conversation links',
        type: 'boolean',
        defaultValue: true,
      },
      {
        key: 'publicSharedLinksEnabled',
        label: 'Public Share Links',
        description: 'Allow share links to be viewed without login',
        type: 'boolean',
        defaultValue: false,
      },
    ],
  },

  {
    id: 'actions',
    title: 'Actions (OpenAPI)',
    description: 'Restrict what external domains can be called by actions',
    icon: Globe,
    settings: [
      {
        key: 'actions.allowedDomains',
        label: 'Allowed Domains',
        description: 'Comma-separated list of domains agents/assistants may call',
        type: 'textarea',
        defaultValue: '',
        placeholder: 'swapi.dev, librechat.ai',
      },
    ],
  },

  {
    id: 'balance',
    title: 'Token Balance',
    description: 'Configure token usage limits and auto-refill',
    icon: Wallet,
    settings: [
      {
        key: 'balance.enabled',
        label: 'Enable Balance System',
        description: 'Track and restrict token usage per user',
        type: 'boolean',
        defaultValue: false,
      },
      {
        key: 'balance.startBalance',
        label: 'Starting Balance',
        description: 'Tokens each new account begins with',
        type: 'number',
        defaultValue: 0,
      },
      {
        key: 'balance.autoRefillEnabled',
        label: 'Auto Refill',
        description: 'Automatically top-up user tokens on an interval',
        type: 'boolean',
        defaultValue: false,
      },
      {
        key: 'balance.refillIntervalValue',
        label: 'Refill Interval – Value',
        description: 'Numeric part of interval (e.g. 1, 24, 7)',
        type: 'number',
        defaultValue: 1,
      },
      {
        key: 'balance.refillIntervalUnit',
        label: 'Refill Interval – Unit',
        description: 'seconds, minutes, hours, days, weeks, months',
        type: 'text',
        defaultValue: 'days',
        placeholder: 'hours',
      },
      {
        key: 'balance.refillAmount',
        label: 'Refill Amount',
        description: 'Tokens added each interval',
        type: 'number',
        defaultValue: 0,
      },
    ],
  },

  // Update Conversations group (add retention + toggle)
  {
    id: 'conversations',
    title: 'Conversation Settings',
    description: 'Control how conversations are created, stored, and managed',
    icon: MessageSquare,
    settings: [
      {
        key: 'interface.temporaryChat',
        label: 'Temporary Conversations',
        description: 'Enable conversations that are not saved to user history',
        type: 'boolean',
        defaultValue: false,
      },
      {
        key: 'interface.temporaryChatRetention',
        label: 'Temporary Chat Retention (hours)',
        description: 'How long temporary chats are kept before deletion (1-8760)',
        type: 'number',
        defaultValue: 720,
      },
    ],
  },
]; 