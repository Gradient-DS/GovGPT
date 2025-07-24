/*
 * Script: generateMergedConfig.js
 * Creates merged YAML file from base librechat.yaml and admin overrides from MongoDB.
 * Sets CONFIG_PATH environment variable to use the merged configuration.
 * Intended to be run automatically when admin plugin loads or when config is applied.
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const _ = require('lodash');
const mongoose = require('mongoose');

const BASE_PATH = process.env.BASE_CONFIG_PATH || path.resolve(process.cwd(), 'librechat.yaml');
const MERGED_PATH = path.resolve(process.cwd(), 'librechat.merged.yaml');

// Ensure MongoDB connection before model operations
async function ensureDbConnection() {
  
  // If already connected, return
  if (mongoose.connection.readyState === 1) {
    return;
  }
  
  // If in the process of connecting, wait for it
  if (mongoose.connection.readyState === 2) {
    return new Promise((resolve) => {
      mongoose.connection.once('connected', resolve);
    });
  }
  
  console.log('[GovGPT] Waiting for LibreChat MongoDB connection...');
  // Wait for LibreChat's connection to be established
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('MongoDB connection timeout'));
    }, 10000);
    
    const checkConnection = () => {
      if (mongoose.connection.readyState === 1) {
        clearTimeout(timeout);
        console.log('[GovGPT] Using LibreChat MongoDB connection');
        resolve();
      } else {
        setTimeout(checkConnection, 100);
      }
    };
    
    checkConnection();
  });
}

function loadYamlSafe(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf8');
  return yaml.load(content) || {};
}

async function loadAdminOverrides() {
  try {
    // Ensure we have a MongoDB connection first
    await ensureDbConnection();
    
    const AdminConfig = require('../models/AdminConfig');
    // Pick the most recently updated doc to avoid stale overrides
    const adminDoc = await AdminConfig.findOne().sort({ updatedAt: -1 }).lean().exec();
    
    if (!adminDoc || !adminDoc.overrides || Object.keys(adminDoc.overrides).length === 0) {
      console.log('[GovGPT] No admin overrides found in MongoDB');
      return {};
    }
    
    console.log('[GovGPT] Loaded admin overrides from MongoDB');
    return adminDoc.overrides;
  } catch (error) {
    console.warn('[GovGPT] Failed to load admin overrides from MongoDB:', error.message);
    return {};
  }
}

async function generateMergedYaml(options = {}) {
  try {
    const base = loadYamlSafe(BASE_PATH);
    
    // Use provided overrides if available, otherwise load from MongoDB
    const adminOverrides = options.overrides !== undefined 
      ? options.overrides 
      : await loadAdminOverrides();

    // Deep merge admin overrides into base config
    const merged = _.merge({}, base, adminOverrides);

    // Write merged configuration
    fs.writeFileSync(MERGED_PATH, yaml.dump(merged, { lineWidth: 120 }), 'utf8');

    console.log(`[GovGPT] Merged YAML written to ${MERGED_PATH}`);
    
    // Set CONFIG_PATH so LibreChat uses our merged config
    // Only set if not already set and not in pre-startup mode
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

// Allow both programmatic usage and direct execution
if (require.main === module) {
  generateMergedYaml({ preStartup: true })
    .then(() => {
      console.log('[GovGPT] Configuration merge completed successfully');
      console.log('[GovGPT] Start LibreChat with: CONFIG_PATH=librechat.merged.yaml npm run backend:dev');
      process.exit(0);
    })
    .catch((error) => {
      console.error('[GovGPT] Configuration merge failed:', error);
      process.exit(1);
    });
}

module.exports = { generateMergedYaml }; 