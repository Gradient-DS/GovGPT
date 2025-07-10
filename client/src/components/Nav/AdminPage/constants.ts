import { Settings, Key, KeySquare, MessageSquare, UserCheck, Globe, Users, Palette, Image, Shield } from 'lucide-react';

export const SETTING_GROUPS = {
  userManagement: {
    title: 'User Management',
    icon: Users,
    description: 'Manage users and administrators',
    isCustomComponent: true // Flag to indicate this uses a custom component instead of standard settings
  },
  siteBranding: {
    title: 'Site Branding & Content',
    icon: Palette,
    description: 'Customize your site branding and content',
    textSettings: [
      {
        key: 'customWelcome',
        label: 'Welcome Message',
        description: 'Custom welcome message shown to users',
        type: 'textarea' as const,
        placeholder: 'Enter a custom welcome message for your users...'
      },
      {
        key: 'appTitle',
        label: 'Application Title',
        description: 'Custom title displayed in browser tab and header',
        type: 'text' as const,
        placeholder: 'Enter custom app title...'
      },
      {
        key: 'helpAndFaqURL',
        label: 'Help & FAQ URL',
        description: 'Link to your help documentation or FAQ page',
        type: 'url' as const,
        placeholder: 'https://example.com/help'
      },
      {
        key: 'customFooter',
        label: 'Footer Content',
        description: 'Custom content displayed in the footer',
        type: 'textarea' as const,
        placeholder: 'Enter custom footer content...'
      }
    ]
  },
  logoImages: {
    title: 'Logo & Images',
    icon: Image,
    description: 'Customize logos, images, and brand colors',
    textSettings: [
      {
        key: 'logoUrl',
        label: 'Logo URL',
        description: 'URL for your custom logo image',
        type: 'url' as const,
        placeholder: 'https://example.com/logo.png'
      },
      {
        key: 'faviconUrl',
        label: 'Favicon URL',
        description: 'URL for your custom favicon (bookmark icon)',
        type: 'url' as const,
        placeholder: 'https://example.com/favicon.ico'
      },
      {
        key: 'backgroundImageUrl',
        label: 'Background Image URL',
        description: 'URL for custom background image',
        type: 'url' as const,
        placeholder: 'https://example.com/background.jpg'
      },

    ]
  },
  legalCompliance: {
    title: 'Legal & Compliance',
    icon: Shield,
    description: 'Configure privacy policy and terms of service settings',
    isCustomComponent: true, // This will need special UI handling for object settings
    objectSettings: [
      {
        key: 'privacyPolicy',
        label: 'Privacy Policy',
        description: 'Configure privacy policy settings and display options',
        fields: [
          {
            key: 'externalUrl',
            label: 'Privacy Policy URL',
            description: 'Link to your privacy policy page',
            type: 'url' as const,
            placeholder: 'https://example.com/privacy'
          },
          {
            key: 'openNewTab',
            label: 'Open in New Tab',
            description: 'Open privacy policy link in a new browser tab',
            type: 'boolean' as const
          }
        ]
      },
      {
        key: 'termsOfService',
        label: 'Terms of Service',
        description: 'Configure terms of service settings and modal options',
        fields: [
          {
            key: 'externalUrl',
            label: 'Terms of Service URL',
            description: 'Link to your terms of service page',
            type: 'url' as const,
            placeholder: 'https://example.com/terms'
          },
          {
            key: 'openNewTab',
            label: 'Open in New Tab',
            description: 'Open terms of service link in a new browser tab',
            type: 'boolean' as const
          },
          {
            key: 'modalAcceptance',
            label: 'Modal Acceptance',
            description: 'Show terms acceptance modal to users',
            type: 'boolean' as const
          },
          {
            key: 'modalTitle',
            label: 'Modal Title',
            description: 'Title for the terms acceptance modal',
            type: 'text' as const,
            placeholder: 'Terms of Service'
          },
          {
            key: 'modalContent',
            label: 'Modal Content',
            description: 'Content displayed in the terms acceptance modal',
            type: 'textarea' as const,
            placeholder: 'Enter terms of service content for the modal...'
          }
        ]
      }
    ]
  },
  interface: {
    title: 'Interface & Experience',
    icon: Settings,
    description: 'Control what features and UI elements users can access',
    settings: [
      {
        key: 'modelSelect',
        label: 'Model & Endpoint Selection',
        description: 'Allow users to choose between different AI providers and models'
      },
      {
        key: 'parameters',
        label: 'Model Parameters',
        description: 'Allow users to adjust temperature, top-p, etc.'
      },
      {
        key: 'sidePanel',
        label: 'Tools Sidebar',
        description: 'Show sidebar with agents, prompts, memories, and other tools'
      },
      {
        key: 'presets',
        label: 'Conversation Presets',
        description: 'Enable preset conversation templates'
      },
      {
        key: 'prompts',
        label: 'Prompt Library',
        description: 'Access to shared prompt templates'
      },
      {
        key: 'memories',
        label: 'Memories',
        description: 'Enable AI memory functionality for personalized conversations'
      },
      {
        key: 'agents',
        label: 'AI Agents',
        description: 'Advanced AI agents with specialized capabilities'
      },
      {
        key: 'bookmarks',
        label: 'Message Bookmarks',
        description: 'Bookmark important messages'
      },
      {
        key: 'multiConvo',
        label: 'Multiple Conversations',
        description: 'Create multiple conversation threads'
      }
    ]
  },
  models: {
    title: 'Model Access Control',
    icon: Key,
    description: 'Control which AI models and features are available',
    settings: [
      {
        key: 'hideNoConfigModels',
        label: 'Enable User-Provided API Keys',
        description: 'Allow users to add their own API keys for models when admin keys are not configured',
        inverted: true
      },
      {
        key: 'plugins',
        label: 'Legacy Plugins',
        description: 'Enable deprecated ChatGPT plugins functionality'
      },
      {
        key: 'webSearch',
        label: 'Web Search',
        description: 'Allow AI to search the internet for information'
      },
      {
        key: 'runCode',
        label: 'Code Execution',
        description: 'Enable AI to run and execute code'
      },
      {
        key: 'fileSearch',
        label: 'File Search',
        description: 'Allow AI to search through uploaded documents and files'
      }
    ]
  },
  modelProviders: {
    title: 'Model Provider Configuration',
    icon: KeySquare,
    description: 'Configure API keys for model providers when users cannot provide their own',
    settings: [
      {
        key: 'openai',
        label: 'OpenAI',
        description: 'Configure OpenAI API access',
        fields: [
          { key: 'apiKey', label: 'API Key', type: 'password', required: true },
          { key: 'baseURL', label: 'Base URL', type: 'url', placeholder: 'https://api.openai.com/v1' }
        ]
      },
      {
        key: 'anthropic',
        label: 'Anthropic (Claude)',
        description: 'Configure Claude API access',
        fields: [
          { key: 'apiKey', label: 'API Key', type: 'password', required: true }
        ]
      },
      {
        key: 'google',
        label: 'Google AI',
        description: 'Configure Google AI API access',
        fields: [
          { key: 'apiKey', label: 'API Key', type: 'password', required: true }
        ]
      },
      {
        key: 'azure',
        label: 'Azure OpenAI',
        description: 'Configure Azure OpenAI service access',
        fields: [
          { key: 'apiKey', label: 'API Key', type: 'password', required: true },
          { key: 'baseURL', label: 'Endpoint URL', type: 'url', placeholder: 'https://your-resource.openai.azure.com' }
        ]
      },
      {
        key: 'bedrock',
        label: 'AWS Bedrock',
        description: 'Configure AWS Bedrock access',
        fields: [
          { key: 'accessKeyId', label: 'Access Key ID', type: 'password', required: true },
          { key: 'secretAccessKey', label: 'Secret Access Key', type: 'password', required: true },
          { key: 'region', label: 'AWS Region', type: 'text', placeholder: 'us-east-1' }
        ]
      }
    ]
  },
  customEndpoints: {
    title: 'Custom Endpoints',
    icon: Globe,
    description: 'Manage custom AI endpoints via OpenAPI specifications',
    settings: []
  },
  registration: {
    title: 'Registration & Authentication',
    icon: UserCheck,
    description: 'Control how users can register and authenticate',
    settings: [
      {
        key: 'registrationEnabled',
        label: 'User Registration',
        description: 'Allow new users to create accounts'
      },
      {
        key: 'socialLoginEnabled',
        label: 'Social Authentication',
        description: 'Enable login with social media accounts'
      },
      {
        key: 'emailLoginEnabled',
        label: 'Email Authentication',
        description: 'Allow login with email and password'
      },
      {
        key: 'passwordResetEnabled',
        label: 'Password Reset',
        description: 'Enable password reset functionality'
      }
    ],
    multiSelectSettings: [
      {
        key: 'socialLogins',
        label: 'Social Login Providers',
        description: 'Which social platforms users can authenticate with',
        options: ['github', 'google', 'discord', 'openid', 'facebook', 'apple', 'saml']
      }
    ],
    arraySettings: [
      {
        key: 'allowedDomains',
        label: 'Allowed Email Domains',
        description: 'Restrict registration to specific email domains',
        placeholder: 'Add domain (e.g., company.com)'
      }
    ]
  },
  chat: {
    title: 'Chat Features',
    icon: MessageSquare,
    description: 'Special chat features and capabilities',
    settings: [
      {
        key: 'temporaryChat',
        label: 'Temporary Conversations',
        description: 'Enable conversations that are not saved to history'
      },
      {
        key: 'betaFeatures',
        label: 'Beta Features',
        description: 'Enable access to experimental beta features in user settings'
      }
    ]
  }
}; 