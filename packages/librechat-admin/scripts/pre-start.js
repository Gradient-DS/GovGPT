#!/usr/bin/env node
/**
 * Pre-startup script for GovGPT Admin Plugin
 * Generates merged configuration BEFORE LibreChat starts
 * Usage: node packages/librechat-admin/scripts/pre-start.js && npm run backend:dev
 */

const { generateMergedYaml } = require('./generateMergedConfig');

async function preStart() {
  console.log('[GovGPT Pre-Start] Generating merged configuration...');
  
  try {
    await generateMergedYaml();
    console.log('[GovGPT Pre-Start] ✅ Configuration ready!');
    console.log('[GovGPT Pre-Start] 🚀 You can now start LibreChat');
  } catch (error) {
    console.error('[GovGPT Pre-Start] ❌ Failed to generate configuration:', error.message);
    console.log('[GovGPT Pre-Start] 💡 LibreChat will use default configuration');
  }
}

preStart(); 