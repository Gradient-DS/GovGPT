/**
 * Custom Extensions Mount Point
 * Handles mounting of all custom modules for GovGPT
 */

const path = require('path');

module.exports = (app) => {
  const modules = [
    { name: 'Admin', path: path.resolve(__dirname, '..', 'librechat-admin'), route: '/api/admin' },
    // Future modules can be added here:
    // { name: 'Analytics', path: path.resolve(__dirname, '..', 'analytics'), route: '/api/analytics' },
    // { name: 'Monitoring', path: path.resolve(__dirname, '..', 'monitoring'), route: '/api/monitoring' }
  ];

  modules.forEach(({ name, path: modulePath, route }) => {
    try {
      const module = require(modulePath);
      const router = typeof module === 'function' ? module() : module;
      app.use(route, router);
      console.info(`[${name}] Mounted at ${route}`);
    } catch (e) {
      if (e.code !== 'MODULE_NOT_FOUND') {
        console.error(`[${name}] Error:`, e);
      } else {
        console.warn(`[${name}] Module not found at ${modulePath}`);
      }
    }
  });
}; 