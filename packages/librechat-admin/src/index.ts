import { buildAdminRouter } from './router';
import path from 'path';
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

  // Resolve LibreChat's JWT authentication middleware at runtime
  // We intentionally avoid using module aliases here so the path works in both
  // dev (host) and production (Docker) environments.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const requireJwtAuth = require(
    path.join(process.cwd(), 'api', 'server', 'middleware', 'requireJwtAuth'),
  );

  return buildAdminRouter(requireJwtAuth, options);
}

// CommonJS compatibility
// @ts-ignore
module.exports = adminPlugin;
export default adminPlugin; 