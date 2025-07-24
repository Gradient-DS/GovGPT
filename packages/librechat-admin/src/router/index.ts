import express, { Router } from 'express';
import { getOverrides, updateOverride, applyChanges } from '../services/configService';
import path from 'path';
import fs from 'fs';

/**
 * Creates an Express router for the GovGPT admin plugin.
 * @param options Customisation options passed by the consumer.
 */
function createRouter(options: Record<string, unknown> = {}): Router {
  const router = express.Router();

  router.get('/health', (_req, res) => {
    res.json({ plugin: 'govgpt-admin', status: 'ok' });
  });

  router.get('/config', async (_req, res) => {
    try {
      const overrides = await getOverrides();
      res.json({ overrides });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  router.post('/config', async (req, res) => {
    try {
      const { key, value } = req.body;
      if (!key) {
        return res.status(400).json({ message: 'key required' });
      }
      // @ts-ignore – user extension of Express Request
      const overrides = await updateOverride(key, value, req.user?.id);
      res.json({ overrides });
    } catch (err: any) {
      res.status(err.status || 500).json({ message: err.message });
    }
  });

  router.post('/config/apply', async (_req, res) => {
    try {
      await applyChanges();
      res.json({ message: 'Restart flag written' });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Locate the admin-frontend/dist folder from the project root, regardless of where this file lives
  const distPath = path.resolve(process.cwd(), 'admin-frontend', 'dist');
  if (fs.existsSync(distPath)) {
    router.use('/', express.static(distPath));
    router.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  return router;
}

// @ts-ignore CommonJS default export
module.exports = createRouter;
export default createRouter; 