/**
 * Custom Extensions Mount Point
 * Handles mounting of all custom modules for GovGPT
 */

const path = require('path');

module.exports = (app) => {
  const requireJwtAuth = require(
    path.join(__dirname, '..', '..', 'api', 'server', 'middleware', 'requireJwtAuth')
  );

  if (!requireJwtAuth) {
    throw new Error('requireJwtAuth middleware not found in expected locations');
  }

  const modules = [
    {
      name: 'Admin',
      // Point directly to the compiled router factory
      path: path.resolve(__dirname, '..', 'librechat-admin', 'dist', 'router'),
      route: '/admin',
    },
    // Future modules can be added here:
    // {
    //   name: 'Analytics',
    //   path: path.resolve(__dirname, '..', 'analytics', 'dist', 'router'),
    //   route: '/analytics',
    // },
  ];

  modules.forEach(({ name, path: modulePath, route }) => {
    try {
      const mod = require(modulePath);

      let router;
      if (typeof mod === 'function') {
        // Legacy default export (back-compat)
        router = mod(requireJwtAuth);
      } else if (mod?.buildAdminRouter) {
        router = mod.buildAdminRouter(requireJwtAuth);
      } else {
        throw new Error('Expected router factory not found');
      }

      app.use(route, router);
      console.info(`[${name}] routes mounted at ${route}`);
    } catch (e) {
      if (e.code !== 'MODULE_NOT_FOUND') {
        console.error(`[${name}] Mount error:`, e);
      } else {
        console.warn(`[${name}] Module not found at ${modulePath}`);
      }
    }
  });
}; 