import { Schema } from 'mongoose';
import type { IAdminConfig } from '~/types';

const adminConfigSchema: Schema<IAdminConfig> = new Schema(
  {
    // There should only be one admin config document
    _id: {
      type: String,
      default: 'admin-config',
      required: true,
    },
    version: {
      type: Number,
      default: 1,
      required: true,
    },
    // Site Branding & Content
    customWelcome: {
      type: String,
      default: null,
    },
    appTitle: {
      type: String,
      default: null,
    },
    helpAndFaqURL: {
      type: String,
      default: null,
    },
    customFooter: {
      type: String,
      default: null,
    },
    // Logo & Images
    logoUrl: {
      type: String,
      default: null,
    },
    faviconUrl: {
      type: String,
      default: null,
    },
    backgroundImageUrl: {
      type: String,
      default: null,
    },
    primaryColor: {
      type: String,
      default: null,
    },
    // Legal & Compliance
    privacyPolicy: {
      externalUrl: {
        type: String,
        default: null,
      },
      openNewTab: {
        type: Boolean,
        default: null,
      },
      _id: false,
    },
    termsOfService: {
      externalUrl: {
        type: String,
        default: null,
      },
      openNewTab: {
        type: Boolean,
        default: null,
      },
      _id: false,
    },
    // Interface Settings
    endpointsMenu: {
      type: Boolean,
      default: null,
    },
    modelSelect: {
      type: Boolean,
      default: null,
    },
    parameters: {
      type: Boolean,
      default: null,
    },
    sidePanel: {
      type: Boolean,
      default: null,
    },
    presets: {
      type: Boolean,
      default: null,
    },
    prompts: {
      type: Boolean,
      default: null,
    },
    memories: {
      type: Boolean,
      default: null,
    },
    bookmarks: {
      type: Boolean,
      default: null,
    },
    multiConvo: {
      type: Boolean,
      default: null,
    },
    hideNoConfigModels: {
      type: Boolean,
      default: null,
    },
    betaFeatures: {
      type: Boolean,
      default: null,
    },
    // Model Access Control
    plugins: {
      type: Boolean,
      default: null,
    },
    webSearch: {
      type: Boolean,
      default: null,
    },
    runCode: {
      type: Boolean,
      default: null,
    },
    agents: {
      type: Boolean,
      default: null,
    },
    fileSearch: {
      type: Boolean,
      default: null,
    },
    // Registration & Authentication
    registrationEnabled: {
      type: Boolean,
      default: null,
    },
    socialLoginEnabled: {
      type: Boolean,
      default: null,
    },
    emailLoginEnabled: {
      type: Boolean,
      default: null,
    },
    passwordResetEnabled: {
      type: Boolean,
      default: null,
    },
    socialLogins: {
      type: [String],
      default: null,
    },
    allowedDomains: {
      type: [String],
      default: null,
    },
    socialLoginConfig: {
      type: Schema.Types.Mixed,
      default: null,
    },
    // Chat Features
    temporaryChat: {
      type: Boolean,
      default: null,
    },
    // Model Provider Configuration
    modelProviderKeys: {
      type: Schema.Types.Mixed,
      default: null,
    },
    // Custom Endpoints
    customEndpoints: {
      type: [Schema.Types.Mixed],
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'adminconfig',
  },
);

// Ensure only one admin config document exists
adminConfigSchema.index({ _id: 1 }, { unique: true });

export default adminConfigSchema; 