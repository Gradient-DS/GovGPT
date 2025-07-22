#!/usr/bin/env node
// GovGPT Reloader – watches for restart.flag and restarts LibreChat API container

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Path to flag file touched by backend apply endpoint
const FLAG_PATH = path.resolve(process.cwd(), 'restart.flag');
// Name of the LibreChat container (override via ENV if needed)
const LIBRECHAT_CONTAINER = process.env.LIBRECHAT_CONTAINER || 'librechat_api';
// Debounce delay to avoid rapid multiple restarts
const DEBOUNCE_MS = parseInt(process.env.RESTART_DEBOUNCE_MS, 10) || 2000;

let timer = null;

function restartContainer() {
  console.log(`[reloader] Restarting container ${LIBRECHAT_CONTAINER}…`);
  exec(`docker restart ${LIBRECHAT_CONTAINER}`, (err, stdout, stderr) => {
    if (err) {
      console.error(`[reloader] Failed to restart container: ${err.message}`);
      return;
    }
    if (stdout) console.log(stdout.trim());
    if (stderr) console.error(stderr.trim());
  });
}

function debounceRestart() {
  if (timer) clearTimeout(timer);
  timer = setTimeout(restartContainer, DEBOUNCE_MS);
}

// Ensure flag file exists
if (!fs.existsSync(FLAG_PATH)) {
  fs.writeFileSync(FLAG_PATH, Date.now().toString());
}

console.log(`[reloader] Watching ${FLAG_PATH} for changes…`);
try {
  fs.watch(FLAG_PATH, debounceRestart);
} catch (err) {
  console.error(`[reloader] fs.watch error: ${err.message}`);
} 