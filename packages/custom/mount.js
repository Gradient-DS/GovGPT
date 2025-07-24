/**
 * Custom Extensions Mount Point
 * Handles mounting of all custom modules for GovGPT
 */

const path = require('path');

module.exports = (app) => {
  // Resolve core JWT auth middleware once
  const requireJwtAuth = require(
    path.join(process.cwd(), 'api', 'server', 'middleware', 'requireJwtAuth'),
  );

  const modules = [
    {
      name: 'Admin',
      // Point directly to the compiled router factory
      path: path.resolve(__dirname, '..', 'librechat-admin', 'dist', 'router'),
      route: '/api/admin',
    },
    // Future modules can be added here:
    // {
    //   name: 'Analytics',
    //   path: path.resolve(__dirname, '..', 'analytics', 'dist', 'router'),
    //   route: '/api/analytics',
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