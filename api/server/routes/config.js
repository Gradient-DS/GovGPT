const express = require('express');
const { logger } = require('@librechat/data-schemas');
const { CacheKeys, defaultSocialLogins, Constants } = require('librechat-data-provider');
const { getCustomConfig } = require('~/server/services/Config/getCustomConfig');
const { getLdapConfig } = require('~/server/services/Config/ldap');
const { getProjectByName } = require('~/models/Project');
const { getAdminConfig } = require('~/models/AdminConfig');
const { isEnabled } = require('~/server/utils');
const { getLogStores } = require('~/cache');

/**
 * Merge interface config with admin config overrides
 * @param {Object} interfaceConfig - The base interface config
 * @param {Object} adminConfig - The admin config with overrides
 * @returns {Object} The merged interface config
 */
function mergeInterfaceConfig(interfaceConfig, adminConfig) {
  if (!adminConfig) {
    return interfaceConfig;
  }

  const interfaceSettings = [
    'endpointsMenu',
    'modelSelect',
    'parameters',
    'sidePanel',
    'presets',
    'prompts',
    'memories',
    'bookmarks',
    'multiConvo',
    'hideNoConfigModels',
    'betaFeatures',
    'plugins',
    'webSearch',
    'runCode',
    'agents',
    'temporaryChat',
  ];

  const mergedConfig = { ...interfaceConfig };

  interfaceSettings.forEach((setting) => {
    if (adminConfig[setting] !== undefined && adminConfig[setting] !== null) {
      mergedConfig[setting] = adminConfig[setting];
    }
  });

  return mergedConfig;
}

const router = express.Router();
const emailLoginEnabled =
  process.env.ALLOW_EMAIL_LOGIN === undefined || isEnabled(process.env.ALLOW_EMAIL_LOGIN);
const passwordResetEnabled = isEnabled(process.env.ALLOW_PASSWORD_RESET);

const sharedLinksEnabled =
  process.env.ALLOW_SHARED_LINKS === undefined || isEnabled(process.env.ALLOW_SHARED_LINKS);

const publicSharedLinksEnabled =
  sharedLinksEnabled &&
  (process.env.ALLOW_SHARED_LINKS_PUBLIC === undefined ||
    isEnabled(process.env.ALLOW_SHARED_LINKS_PUBLIC));

router.get('/', async function (req, res) {
  const cache = getLogStores(CacheKeys.CONFIG_STORE);

  // Always check for admin config first to determine if we need fresh startup config
  const adminConfig = await getAdminConfig();
  
  const cachedStartupConfig = await cache.get(CacheKeys.STARTUP_CONFIG);
  if (cachedStartupConfig) {
    logger.debug('Serving cached startup config');
    res.send(cachedStartupConfig);
    return;
  }

  logger.debug('Regenerating startup config with fresh admin config');

  const isBirthday = () => {
    const today = new Date();
    return today.getMonth() === 1 && today.getDate() === 11;
  };

  const instanceProject = await getProjectByName(Constants.GLOBAL_PROJECT_NAME, '_id');

  const ldap = getLdapConfig();
  
  if (adminConfig) {
    logger.debug('Admin config loaded with overrides:', Object.keys(adminConfig).filter(key => 
      adminConfig[key] !== null && adminConfig[key] !== undefined && !['_id', 'version', 'createdAt', 'updatedAt'].includes(key)
    ));
  } else {
    logger.debug('No admin config overrides found');
  }

  try {
    const isOpenIdEnabled =
      !!process.env.OPENID_CLIENT_ID &&
      !!process.env.OPENID_CLIENT_SECRET &&
      !!process.env.OPENID_ISSUER &&
      !!process.env.OPENID_SESSION_SECRET;

    const isSamlEnabled =
      !!process.env.SAML_ENTRY_POINT &&
      !!process.env.SAML_ISSUER &&
      !!process.env.SAML_CERT &&
      !!process.env.SAML_SESSION_SECRET;

    /** @type {TStartupConfig} */
    const payload = {
      appTitle: adminConfig?.appTitle ?? (process.env.APP_TITLE || 'LibreChat'),
      socialLogins: adminConfig?.socialLogins ?? req.app.locals.socialLogins ?? defaultSocialLogins,
      discordLoginEnabled: !!process.env.DISCORD_CLIENT_ID && !!process.env.DISCORD_CLIENT_SECRET,
      facebookLoginEnabled:
        !!process.env.FACEBOOK_CLIENT_ID && !!process.env.FACEBOOK_CLIENT_SECRET,
      githubLoginEnabled: !!process.env.GITHUB_CLIENT_ID && !!process.env.GITHUB_CLIENT_SECRET,
      googleLoginEnabled: !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET,
      appleLoginEnabled:
        !!process.env.APPLE_CLIENT_ID &&
        !!process.env.APPLE_TEAM_ID &&
        !!process.env.APPLE_KEY_ID &&
        !!process.env.APPLE_PRIVATE_KEY_PATH,
      openidLoginEnabled: isOpenIdEnabled,
      openidLabel: process.env.OPENID_BUTTON_LABEL || 'Continue with OpenID',
      openidImageUrl: process.env.OPENID_IMAGE_URL,
      openidAutoRedirect: isEnabled(process.env.OPENID_AUTO_REDIRECT),
      samlLoginEnabled: !isOpenIdEnabled && isSamlEnabled,
      samlLabel: process.env.SAML_BUTTON_LABEL,
      samlImageUrl: process.env.SAML_IMAGE_URL,
      serverDomain: process.env.DOMAIN_SERVER || 'http://localhost:3080',
      emailLoginEnabled: adminConfig?.emailLoginEnabled ?? emailLoginEnabled,
      registrationEnabled: adminConfig?.registrationEnabled ?? (!ldap?.enabled && isEnabled(process.env.ALLOW_REGISTRATION)),
      socialLoginEnabled: adminConfig?.socialLoginEnabled ?? isEnabled(process.env.ALLOW_SOCIAL_LOGIN),
      emailEnabled:
        (!!process.env.EMAIL_SERVICE || !!process.env.EMAIL_HOST) &&
        !!process.env.EMAIL_USERNAME &&
        !!process.env.EMAIL_PASSWORD &&
        !!process.env.EMAIL_FROM,
      passwordResetEnabled: adminConfig?.passwordResetEnabled ?? passwordResetEnabled,
      showBirthdayIcon:
        isBirthday() ||
        isEnabled(process.env.SHOW_BIRTHDAY_ICON) ||
        process.env.SHOW_BIRTHDAY_ICON === '',
      helpAndFaqURL: adminConfig?.helpAndFaqURL ?? (process.env.HELP_AND_FAQ_URL || 'https://librechat.ai'),
      interface: mergeInterfaceConfig(req.app.locals.interfaceConfig, adminConfig),
      turnstile: req.app.locals.turnstileConfig,
      modelSpecs: req.app.locals.modelSpecs,
      balance: req.app.locals.balance,
      sharedLinksEnabled,
      publicSharedLinksEnabled,
      analyticsGtmId: process.env.ANALYTICS_GTM_ID,
      instanceProjectId: instanceProject._id.toString(),
      bundlerURL: process.env.SANDPACK_BUNDLER_URL,
      staticBundlerURL: process.env.SANDPACK_STATIC_BUNDLER_URL,
    };

    // Add admin config branding and UI customization
    if (adminConfig?.customWelcome) {
      payload.customWelcome = adminConfig.customWelcome;
    }
    if (adminConfig?.logoUrl) {
      payload.logoUrl = adminConfig.logoUrl;
    }
    if (adminConfig?.faviconUrl) {
      payload.faviconUrl = adminConfig.faviconUrl;
    }
    if (adminConfig?.backgroundImageUrl) {
      payload.backgroundImageUrl = adminConfig.backgroundImageUrl;
    }
    if (adminConfig?.primaryColor) {
      payload.primaryColor = adminConfig.primaryColor;
    }
    if (adminConfig?.privacyPolicy) {
      payload.privacyPolicy = adminConfig.privacyPolicy;
    }
    if (adminConfig?.termsOfService) {
      payload.termsOfService = adminConfig.termsOfService;
    }
    if (adminConfig?.allowedDomains) {
      payload.allowedDomains = adminConfig.allowedDomains;
    }
    if (adminConfig?.socialLoginConfig) {
      payload.socialLoginConfig = adminConfig.socialLoginConfig;
    }

    payload.mcpServers = {};
    const config = await getCustomConfig();
    if (config?.mcpServers != null) {
      for (const serverName in config.mcpServers) {
        const serverConfig = config.mcpServers[serverName];
        payload.mcpServers[serverName] = {
          customUserVars: serverConfig?.customUserVars || {},
        };
      }
    }

    /** @type {TCustomConfig['webSearch']} */
    const webSearchConfig = req.app.locals.webSearch;
    if (
      webSearchConfig != null &&
      (webSearchConfig.searchProvider ||
        webSearchConfig.scraperType ||
        webSearchConfig.rerankerType)
    ) {
      payload.webSearch = {};
    }

    if (webSearchConfig?.searchProvider) {
      payload.webSearch.searchProvider = webSearchConfig.searchProvider;
    }
    if (webSearchConfig?.scraperType) {
      payload.webSearch.scraperType = webSearchConfig.scraperType;
    }
    if (webSearchConfig?.rerankerType) {
      payload.webSearch.rerankerType = webSearchConfig.rerankerType;
    }

    if (ldap) {
      payload.ldap = ldap;
    }

    if (adminConfig?.customFooter || typeof process.env.CUSTOM_FOOTER === 'string') {
      payload.customFooter = adminConfig?.customFooter ?? process.env.CUSTOM_FOOTER;
    }

    // Detect environment-configured model providers
    payload.envModelProviders = {
      openai: !!(process.env.OPENAI_API_KEY || process.env.AZURE_OPENAI_API_KEY),
      google: !!(process.env.GOOGLE_KEY || process.env.GOOGLE_SERVICE_KEY),
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      bedrock: !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY),
      azure: !!process.env.AZURE_OPENAI_API_KEY,
    };

    await cache.set(CacheKeys.STARTUP_CONFIG, payload);
    logger.debug('Startup config cached and sent to client');
    return res.status(200).send(payload);
  } catch (err) {
    logger.error('Error in startup config', err);
    return res.status(500).send({ error: err.message });
  }
});

module.exports = router;
