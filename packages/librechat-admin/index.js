/**
 * GovGPT Admin Plugin Entry
 * Exports a function that returns an Express router.
 * Also handles initialization of merged configuration.
 * Usage in consumer project:
 *   const adminRouter = require('@govgpt/librechat-admin')(options);
 *   app.use('/api/admin', adminRouter);
 */

const createRouter = require('./router');
const { generateMergedYaml } = require('./scripts/generateMergedConfig');

// Initialize admin plugin and merged configuration
async function initializeAdminPlugin() {
  try {
    // Generate merged config on plugin load
    await generateMergedYaml();
    console.info('[GovGPT] Admin plugin initialized with merged configuration');
  } catch (error) {
    console.warn('[GovGPT] Failed to initialize admin configuration:', error.message);
  }
}

module.exports = (options = {}) => {
  // Initialize async but don't block router creation
  initializeAdminPlugin();
  return createRouter(options);
}; 