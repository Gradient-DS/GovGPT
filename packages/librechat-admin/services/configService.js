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

/**
 * Returns current override document (creates if missing).
 */
async function getOverrideDoc() {
  let doc = await AdminConfig.findOne();
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

  const doc = await getOverrideDoc();
  _.set(doc.overrides, key, value);
  doc.updatedBy = userId;
  doc.updatedAt = new Date();
  await doc.save();

  await writeOverlayYaml(doc.overrides);
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
  // Regenerate merged yaml with latest admin overrides
  await generateMergedYaml();
  // touch flag file for any external restart monitors
  fs.writeFileSync(FLAG_PATH, Date.now().toString());
  console.log('[GovGPT] Configuration applied and restart flag written');
}

module.exports = { getOverrides, updateOverride, ALLOW_LIST, OVERLAY_PATH, applyChanges };