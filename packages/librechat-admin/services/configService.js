const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const _ = require('lodash');
const AdminConfig = require('../models/AdminConfig');
const { generateMergedYaml } = require('../scripts/generateMergedConfig');

// Safe keys that may be edited in Phase-1
const ALLOW_LIST = ['interface.customWelcome'];

// Path definitions
const OVERLAY_PATH = process.env.ADMIN_OVERLAY_PATH || path.resolve(process.cwd(), 'admin-overrides.yaml');
const FLAG_PATH = path.resolve(process.cwd(), 'restart.flag');

// Ensure MongoDB connection before model operations
async function ensureDbConnection() {
  const mongoose = require('mongoose');
  
  // If already connected, return
  if (mongoose.connection.readyState === 1) {
    return;
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

/**
 * Returns current override document (creates if missing).
 */
async function getOverrideDoc() {
  await ensureDbConnection();

  // No migration logic; expect only 'adminconfig' collection going forward
 
  // Always use the newest document in case multiple exist
  let doc = await AdminConfig.findOne().sort({ updatedAt: -1 });
  if (!doc) {
    doc = await AdminConfig.create({ overrides: {} });
  }
  return doc;
}

/**
 * Get current overrides object.
 */
async function getOverrides() {
  const doc = await getOverrideDoc();
  return doc.overrides || {};
}

/**
 * Update a single key if in allow-list. Returns updated overrides.
 * @param {string} key dot-notation key
 * @param {*} value
 * @param {string} userId Mongo user id
 */
async function updateOverride(key, value, userId) {
  if (!ALLOW_LIST.includes(key)) {
    const err = new Error(`Key '${key}' not allowed`);
    err.status = 400;
    throw err;
  }

  await ensureDbConnection();
  const doc = await getOverrideDoc();
  
  _.set(doc.overrides, key, value);
  doc.updatedBy = userId;
  doc.updatedAt = new Date();
  
  await doc.save();
  console.log('[GovGPT] Updated override in MongoDB:', key, '=', value);
  
  await writeOverlayYaml(doc.overrides);
  
  // Immediately regenerate merged YAML so changes are applied instantly
  await generateMergedYaml({ overrides: doc.overrides });
  console.log('[GovGPT] Configuration updated and applied successfully');
  
  return doc.overrides;
}

function writeOverlayYaml(overrides) {
  return new Promise((resolve, reject) => {
    const yamlStr = yaml.dump(overrides, { lineWidth: 120 });
    fs.writeFile(OVERLAY_PATH, yamlStr, 'utf8', (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

async function applyChanges() {
  // Simple restart flag for external monitors - the merged YAML is already up to date
  fs.writeFileSync(FLAG_PATH, Date.now().toString());
  console.log('[GovGPT] Restart flag written');
}

module.exports = { getOverrides, updateOverride, ALLOW_LIST, OVERLAY_PATH, applyChanges };