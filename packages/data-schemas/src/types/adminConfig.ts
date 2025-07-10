import { Document } from 'mongoose';

export interface IAdminConfig extends Document {
  _id: string;
  version: number;
  
  // Site Branding & Content
  customWelcome?: string | null;
  appTitle?: string | null;
  helpAndFaqURL?: string | null;
  customFooter?: string | null;
  
  // Logo & Images
  logoUrl?: string | null;
  faviconUrl?: string | null;
  backgroundImageUrl?: string | null;
  primaryColor?: string | null;
  
  // Legal & Compliance
  privacyPolicy?: {
    externalUrl?: string | null;
    openNewTab?: boolean | null;
  } | null;
  termsOfService?: {
    externalUrl?: string | null;
    openNewTab?: boolean | null;
  } | null;
  
  // Interface Settings
  endpointsMenu?: boolean | null;
  modelSelect?: boolean | null;
  parameters?: boolean | null;
  sidePanel?: boolean | null;
  presets?: boolean | null;
  prompts?: boolean | null;
  memories?: boolean | null;
  bookmarks?: boolean | null;
  multiConvo?: boolean | null;
  hideNoConfigModels?: boolean | null;
  betaFeatures?: boolean | null;
  
  // Model Access Control
  plugins?: boolean | null;
  webSearch?: boolean | null;
  runCode?: boolean | null;
  agents?: boolean | null;
  fileSearch?: boolean | null;
  
  // Registration & Authentication
  registrationEnabled?: boolean | null;
  socialLoginEnabled?: boolean | null;
  emailLoginEnabled?: boolean | null;
  passwordResetEnabled?: boolean | null;
  socialLogins?: string[] | null;
  allowedDomains?: string[] | null;
  socialLoginConfig?: Record<string, any> | null;
  
  // Chat Features
  temporaryChat?: boolean | null;
  
  // Model Provider Configuration
  modelProviderKeys?: Record<string, any> | null;
  
  // Custom Endpoints
  customEndpoints?: any[] | null;
  
  createdAt?: Date;
  updatedAt?: Date;
} 