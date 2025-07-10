const { EModelEndpoint, extractEnvVariable } = require('librechat-data-provider');
const { isUserProvided, normalizeEndpointName } = require('~/server/utils');
const { getCustomConfig } = require('./getCustomConfig');

/**
 * Load config endpoints from the cached configuration object
 * @param {Express.Request} req - The request object
 * @returns {Promise<TEndpointsConfig>} A promise that resolves to an object containing the endpoints configuration
 */
async function loadConfigEndpoints(req) {
  const customConfig = await getCustomConfig();
  const { endpoints = {} } = (customConfig ?? {});
  const endpointsConfig = {};

  // ============================
  // 1) YAML-defined custom endpoints (existing logic)
  // ============================

  if (Array.isArray(endpoints[EModelEndpoint.custom])) {
    const customEndpoints = endpoints[EModelEndpoint.custom].filter(
      (endpoint) =>
        endpoint.baseURL &&
        endpoint.apiKey &&
        endpoint.name &&
        endpoint.models &&
        (endpoint.models.fetch || endpoint.models.default),
    );

    for (let i = 0; i < customEndpoints.length; i++) {
      const endpoint = customEndpoints[i];
      const {
        baseURL,
        apiKey,
        name: configName,
        iconURL,
        modelDisplayLabel,
        customParams,
      } = endpoint;
      const name = normalizeEndpointName(configName);

      const resolvedApiKey = extractEnvVariable(apiKey);
      const resolvedBaseURL = extractEnvVariable(baseURL);

      endpointsConfig[name] = {
        type: EModelEndpoint.custom,
        userProvide: isUserProvided(resolvedApiKey),
        userProvideURL: isUserProvided(resolvedBaseURL),
        modelDisplayLabel,
        iconURL,
        customParams,
      };
    }
  }

  // ============================
  // 2) Database-defined custom endpoints (Admin Panel)
  // ============================
  try {
    const { CustomEndpoint } = require('~/db/models');
    if (CustomEndpoint) {
      const dbCustomEndpoints = await CustomEndpoint.find({ enabled: true }).lean();
      for (const endpoint of dbCustomEndpoints) {
        const {
          baseURL,
          apiKey,
          name: configName,
          iconURL,
          displayName,
          modelDisplayLabel,
          customParams,
          userProvide: userProvideFlag,
        } = endpoint;

        if (!baseURL || !configName) {
          // Skip incomplete definitions
          // eslint-disable-next-line no-continue
          continue;
        }

        const name = normalizeEndpointName(configName);
        // Avoid overriding YAML endpoint with same name
        if (endpointsConfig[name] != null) {
          // eslint-disable-next-line no-continue
          continue;
        }

        const resolvedApiKey = apiKey;
        const resolvedBaseURL = baseURL;

        endpointsConfig[name] = {
          type: EModelEndpoint.custom,
          userProvide:
            typeof userProvideFlag === 'boolean'
              ? userProvideFlag
              : isUserProvided(resolvedApiKey),
          userProvideURL: isUserProvided(resolvedBaseURL),
          modelDisplayLabel: modelDisplayLabel || displayName || name,
          iconURL,
          customParams,
        };
      }
    }
  } catch (error) {
    /* Silently ignore DB errors to prevent blocking config load */
    // logger can be required conditionally to avoid circular issues
    try {
      const { logger } = require('@librechat/data-schemas');
      logger.error('Error loading database custom endpoints', error);
    } catch (_) {
      // noop
    }
  }

  // ============================
  // 3) Azure specific endpoints (existing logic)
  // ============================

  if (req.app.locals[EModelEndpoint.azureOpenAI]) {
    /** @type {Omit<TConfig, 'order'>} */
    endpointsConfig[EModelEndpoint.azureOpenAI] = {
      userProvide: false,
    };
  }

  if (req.app.locals[EModelEndpoint.azureOpenAI]?.assistants) {
    /** @type {Omit<TConfig, 'order'>} */
    endpointsConfig[EModelEndpoint.azureAssistants] = {
      userProvide: false,
    };
  }

  return endpointsConfig;
}

module.exports = loadConfigEndpoints;
