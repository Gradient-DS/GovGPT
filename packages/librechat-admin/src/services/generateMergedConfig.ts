import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import _ from 'lodash';
import mongoose from 'mongoose';
import AdminConfig from '../models/AdminConfig';

const BASE_PATH = process.env.BASE_CONFIG_PATH || path.resolve(process.cwd(), 'librechat.yaml');
const MERGED_PATH = path.resolve(process.cwd(), 'librechat.merged.yaml');

async function ensureDbConnection(): Promise<void> {
  if (mongoose.connection.readyState === 1) return;
  if (mongoose.connection.readyState === 2) {
    await new Promise<void>((resolve) => mongoose.connection.once('connected', resolve));
    return;
  }

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

function loadYamlSafe(filePath: string): Record<string, unknown> {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf8');
  return (yaml.load(content) as Record<string, unknown>) || {};
}

async function loadAdminOverrides(): Promise<Record<string, unknown>> {
  try {
    await ensureDbConnection();
    const adminDoc = await AdminConfig.findOne().sort({ updatedAt: -1 }).lean().exec();
    if (!adminDoc?.overrides || Object.keys(adminDoc.overrides).length === 0) {
      console.log('[GovGPT] No admin overrides found in MongoDB');
      return {};
    }
    console.log('[GovGPT] Loaded admin overrides from MongoDB');
    return adminDoc.overrides as Record<string, unknown>;
  } catch (error: any) {
    console.warn('[GovGPT] Failed to load admin overrides from MongoDB:', error.message);
    return {};
  }
}

export async function generateMergedYaml(options: { overrides?: Record<string, unknown>; preStartup?: boolean } = {}): Promise<Record<string, unknown>> {
  try {
    const base = loadYamlSafe(BASE_PATH);
    const adminOverrides = options.overrides !== undefined ? options.overrides : await loadAdminOverrides();
    const merged = _.merge({}, base, adminOverrides);

    fs.writeFileSync(MERGED_PATH, yaml.dump(merged, { lineWidth: 120 }), 'utf8');
    console.log(`[GovGPT] Merged YAML written to ${MERGED_PATH}`);

    if (!process.env.CONFIG_PATH && !options.preStartup) {
      process.env.CONFIG_PATH = MERGED_PATH;
      console.log(`[GovGPT] Set CONFIG_PATH to ${MERGED_PATH}`);
    } else if (options.preStartup) {
      console.log(`[GovGPT] For next LibreChat start, set: CONFIG_PATH=${MERGED_PATH}`);
    }

    return merged;
  } catch (error) {
    console.error('[GovGPT] Error generating merged configuration:', error);
    throw error;
  }
} 