import createRouter from './router';
import { generateMergedYaml } from './services/generateMergedConfig';

/**
 * GovGPT Admin Plugin Entry
 * Exports a function that returns an Express router.
 * Also handles initialization of merged configuration.
 */
async function initializeAdminPlugin(): Promise<void> {
  try {
    await generateMergedYaml();
    console.info('[GovGPT] Admin plugin initialized with merged configuration');
  } catch (error: any) {
    console.warn('[GovGPT] Failed to initialize admin configuration:', error?.message || error);
  }
}

function adminPlugin(options: Record<string, unknown> = {}) {
  // Fire-and-forget initialization
  void initializeAdminPlugin();
  return createRouter(options);
}

// CommonJS compatibility
// @ts-ignore
module.exports = adminPlugin;
export default adminPlugin; 