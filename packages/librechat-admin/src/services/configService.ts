import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import _ from 'lodash';
import mongoose from 'mongoose';
import AdminConfig from '../models/AdminConfig';
import { generateMergedYaml } from './generateMergedConfig';

export const ALLOW_LIST = [
  // Interface feature toggles
  'interface.customWelcome',
  'interface.modelSelect',
  'interface.parameters',
  'interface.sidePanel',
  'interface.presets',
  'interface.prompts',
  'interface.memories',
  'interface.bookmarks',
  'interface.multiConvo',
  'interface.agents',
  'interface.endpointsMenu',
  // Site branding & text / images
  'appTitle',
  'helpAndFaqURL',
  'customFooter',
  'logoUrl',
  'faviconUrl',
  'backgroundImageUrl',
  // Legal & compliance objects
  'privacyPolicy',
  'termsOfService',
  // Model access toggles within interface section
  'interface.webSearch',
  'interface.runCode',
  // Registration arrays (not booleans)
  'registration.socialLogins',
  'registration.allowedDomains',
  // Conversation settings
  'interface.temporaryChat',
  // Agents endpoint settings
  'endpoints.agents.recursionLimit',
  'endpoints.agents.maxRecursionLimit',
  'endpoints.agents.disableBuilder',
  'endpoints.agents.capabilities',
  'endpoints.agents.allowedProviders',
  // Sharing / public links
  'sharedLinksEnabled',
  'publicSharedLinksEnabled',
  // Actions (OpenAPI specs)
  'actions.allowedDomains',
  // Temporary chat retention
  'interface.temporaryChatRetention',
  // Balance system
  'balance.enabled',
  'balance.startBalance',
  'balance.autoRefillEnabled',
  'balance.refillIntervalValue',
  'balance.refillIntervalUnit',
  'balance.refillAmount',
  // Memory settings
  'memory.disabled',
  'memory.validKeys',
  'memory.tokenLimit',
  'memory.personalize',
  'memory.agent.id',
  // Custom endpoints
  'endpoints.custom',
  // Auth registration toggle
  'auth.allowRegistration',
];
export const OVERLAY_PATH = process.env.ADMIN_OVERLAY_PATH || path.resolve(process.cwd(), 'admin-overrides.yaml');
const FLAG_PATH = path.resolve(process.cwd(), 'restart.flag');

async function ensureDbConnection(): Promise<void> {
  if (mongoose.connection.readyState === 1) return;
  console.log('[GovGPT] Waiting for LibreChat MongoDB connection...');
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('MongoDB connection timeout')), 10000);
    const check = (): void => {
      if (mongoose.connection.readyState === 1) {
        clearTimeout(timeout);
        console.log('[GovGPT] Using LibreChat MongoDB connection');
        resolve();
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  });
}

async function getOverrideDoc() {
  await ensureDbConnection();
  let doc = await AdminConfig.findOne().sort({ updatedAt: -1 });
  if (!doc) {
    doc = await AdminConfig.create({ overrides: {} });
  }
  return doc;
}

export async function getOverrides() {
  const doc = await getOverrideDoc();
  return doc.overrides || {};
}

export async function updateOverride(key: string, value: unknown, userId?: string) {
  if (!ALLOW_LIST.includes(key)) {
    const err: any = new Error(`Key '${key}' not allowed`);
    err.status = 400;
    throw err;
  }

  const doc = await getOverrideDoc();
  // Basic type coercion for known numeric and array settings
  const numericKeys = new Set([
    'endpoints.agents.recursionLimit',
    'endpoints.agents.maxRecursionLimit',
    'interface.temporaryChatRetention',
    'balance.startBalance',
    'balance.refillIntervalValue',
    'balance.refillAmount',
    'memory.tokenLimit',
  ]);

  const arrayKeys = new Set([
    'endpoints.agents.capabilities',
    'endpoints.agents.allowedProviders',
    'actions.allowedDomains',
    'registration.socialLogins',
    'registration.allowedDomains',
    'memory.validKeys',
  ]);

  let coercedValue: unknown = value;

  if (numericKeys.has(key)) {
    coercedValue = typeof value === 'string' ? Number(value) : value;
  } else if (arrayKeys.has(key)) {
    if (typeof value === 'string') {
      coercedValue = value
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }

  _.set(doc.overrides, key, coercedValue);
  // Inform Mongoose that a Mixed type field was mutated in place
  doc.markModified('overrides');
  doc.updatedBy = userId as any;
  doc.updatedAt = new Date();

  await doc.save();
  console.log('[GovGPT] Updated override in MongoDB:', key, '=', value);

  await writeOverlayYaml(doc.overrides);
  await generateMergedYaml({ overrides: doc.overrides });
  console.log('[GovGPT] Configuration updated and applied successfully');

  return doc.overrides;
}

function writeOverlayYaml(overrides: Record<string, unknown>): Promise<void> {
  return new Promise((resolve, reject) => {
    const yamlStr = yaml.dump(overrides, { lineWidth: 120 });
    fs.writeFile(OVERLAY_PATH, yamlStr, 'utf8', (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

export async function applyChanges(): Promise<void> {
  fs.writeFileSync(FLAG_PATH, Date.now().toString());
  console.log('[GovGPT] Restart flag written');
} 