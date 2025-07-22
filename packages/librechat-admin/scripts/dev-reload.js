#!/usr/bin/env node
/**
 * Development helper script for manually reloading admin configuration
 * Usage: node packages/librechat-admin/scripts/dev-reload.js
 */

const { generateMergedYaml } = require('./generateMergedConfig');

async function devReload() {
  console.log('[GovGPT Dev] Starting configuration reload...');
  
  try {
    await generateMergedYaml();
    console.log('[GovGPT Dev] ✅ Configuration reloaded successfully!');
    console.log('[GovGPT Dev] 💡 Restart your LibreChat API server to see changes');
  } catch (error) {
    console.error('[GovGPT Dev] ❌ Configuration reload failed:', error.message);
    process.exit(1);
  }
}

devReload(); 