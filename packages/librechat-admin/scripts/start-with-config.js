#!/usr/bin/env node
/**
 * Development startup script with admin config
 * Generates merged config and starts LibreChat with CONFIG_PATH set
 * Usage: node packages/librechat-admin/scripts/start-with-config.js
 */

const { spawn } = require('child_process');
const path = require('path');
const { generateMergedYaml } = require('./generateMergedConfig');

async function startWithConfig() {
  console.log('[GovGPT Start] Preparing admin configuration...');
  
  try {
    // Generate merged config first
    await generateMergedYaml({ preStartup: true });
    
    console.log('[GovGPT Start] ✅ Configuration ready!');
    console.log('[GovGPT Start] 🚀 Starting LibreChat with admin config...');
    
    // Set the CONFIG_PATH environment variable
    const env = {
      ...process.env,
      CONFIG_PATH: path.resolve(process.cwd(), 'librechat.merged.yaml')
    };
    
    // Start LibreChat with the merged config
    const librechat = spawn('npm', ['run', 'backend:dev'], {
      env,
      stdio: 'inherit',
      shell: true
    });
    
    librechat.on('close', (code) => {
      console.log(`[GovGPT Start] LibreChat exited with code ${code}`);
    });
    
    librechat.on('error', (error) => {
      console.error('[GovGPT Start] Failed to start LibreChat:', error);
    });
    
  } catch (error) {
    console.error('[GovGPT Start] ❌ Failed to prepare configuration:', error.message);
    console.log('[GovGPT Start] 💡 Try: npm run backend:dev (without admin config)');
    process.exit(1);
  }
}

startWithConfig(); 