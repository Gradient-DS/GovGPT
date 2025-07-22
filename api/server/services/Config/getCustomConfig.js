const { logger } = require('@librechat/data-schemas');
const { isEnabled, getUserMCPAuthMap } = require('@librechat/api');
const { CacheKeys, EModelEndpoint } = require('librechat-data-provider');
const { normalizeEndpointName } = require('~/server/utils');
const loadCustomConfig = require('./loadCustomConfig');
const { getCachedTools } = require('./getCachedTools');
const getLogStores = require('~/cache/getLogStores');

/**
 * Retrieves the configuration object
 * @function getCustomConfig
 * @returns {Promise<TCustomConfig | null>}
 * */
async function getCustomConfig() {
  const cache = getLogStores(CacheKeys.CONFIG_STORE);
  return (await cache.get(CacheKeys.CUSTOM_CONFIG)) || (await loadCustomConfig());
}

/**
 * Retrieves the configuration object
 * @function getBalanceConfig
 * @returns {Promise<TCustomConfig['balance'] | null>}
 * */
async function getBalanceConfig() {
  const isLegacyEnabled = isEnabled(process.env.CHECK_BALANCE);
  const startBalance = process.env.START_BALANCE;
  /** @type {TCustomConfig['balance']} */
  const config = {
    enabled: isLegacyEnabled,
    startBalance: startBalance != null && startBalance ? parseInt(startBalance, 10) : undefined,
  };
  const customConfig = await getCustomConfig();
  if (!customConfig) {
    return config;
  }
  return { ...config, ...(customConfig?.['balance'] ?? {}) };
}

/**
 *
 * @param {string | EModelEndpoint} endpoint
 * @returns {Promise<TEndpoint | undefined>}
 */
const getCustomEndpointConfig = async (endpoint) => {
  // 1) Check YAML-defined endpoints first (existing logic)
  const customConfig = await getCustomConfig();
  const { endpoints = {} } = customConfig || {};
  const yamlCustomEndpoints = endpoints[EModelEndpoint.custom] ?? [];

  let found = yamlCustomEndpoints.find(
    (endpointConfig) => normalizeEndpointName(endpointConfig.name) === endpoint,
  );

  if (found) {
    return found;
  }

  // 2) Check database-defined custom endpoints
  try {
    const { CustomEndpoint } = require('~/db/models');
    if (CustomEndpoint) {
      const dbEndpoint = await CustomEndpoint.findOne({
        name: { $regex: new RegExp(`^${endpoint}$`, 'i') },
        enabled: true,
      }).lean();

      if (dbEndpoint) {
        // Normalize structure to TEndpoint-ish shape expected by callers
        return {
          ...dbEndpoint,
          modelDisplayLabel: dbEndpoint.modelDisplayLabel || dbEndpoint.displayName,
          name: normalizeEndpointName(dbEndpoint.name),
          type: EModelEndpoint.custom,
        };
      }
    }
  } catch (err) {
    // Log but do not crash – absence of DB is permitted in some setups
    try {
      const { logger } = require('@librechat/data-schemas');
      logger.error('[getCustomEndpointConfig] DB lookup failed', err);
    } catch (_) {
      /* noop */
    }
  }

  // If still not found, throw to keep existing behaviour
  throw new Error(`Provider ${endpoint} not supported`);
};

/**
 * @param {Object} params
 * @param {string} params.userId
 * @param {GenericTool[]} [params.tools]
 * @param {import('@librechat/data-schemas').PluginAuthMethods['findPluginAuthsByKeys']} params.findPluginAuthsByKeys
 * @returns {Promise<Record<string, Record<string, string>> | undefined>}
 */
async function getMCPAuthMap({ userId, tools, findPluginAuthsByKeys }) {
  try {
    if (!tools || tools.length === 0) {
      return;
    }
    const appTools = await getCachedTools({
      userId,
    });
    return await getUserMCPAuthMap({
      tools,
      userId,
      appTools,
      findPluginAuthsByKeys,
    });
  } catch (err) {
    logger.error(
      `[api/server/controllers/agents/client.js #chatCompletion] Error getting custom user vars for agent`,
      err,
    );
  }
}

/**
 * @returns {Promise<boolean>}
 */
async function hasCustomUserVars() {
  const customConfig = await getCustomConfig();
  const mcpServers = customConfig?.mcpServers;
  return Object.values(mcpServers ?? {}).some((server) => server.customUserVars);
}

module.exports = {
  getMCPAuthMap,
  getCustomConfig,
  getBalanceConfig,
  hasCustomUserVars,
  getCustomEndpointConfig,
};
