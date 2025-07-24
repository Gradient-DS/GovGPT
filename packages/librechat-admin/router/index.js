const express = require('express');
const { getOverrides, updateOverride, applyChanges } = require('../services/configService');
const path = require('path');
const fs = require('fs');

/**
 * Creates an Express router for the GovGPT admin plugin.
 * @param {object} options - Customisation options passed by the consumer.
 * @returns {import('express').Router}
 */
function createRouter(options = {}) {
  const router = express.Router();

  // Basic health-check
  router.get('/health', (_req, res) => {
    res.json({ plugin: 'govgpt-admin', status: 'ok' });
  });

  // Replace placeholder endpoints
  router.get('/config', async (req, res) => {
    try {
      const overrides = await getOverrides();
      res.json({ overrides });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  router.post('/config', async (req, res) => {
    try {
      const { key, value } = req.body;
      if (!key) {
        return res.status(400).json({ message: 'key required' });
      }
      const overrides = await updateOverride(key, value, req.user?.id);
      res.json({ overrides });
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message });
    }
  });

  // Apply endpoint - now mainly for restart signaling since config updates are immediate
  router.post('/config/apply', async (req, res) => {
    try {
      await applyChanges();
      res.json({ message: 'Restart flag written' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // Serve static built admin frontend if present
  // ../../.. takes us from packages/librechat-admin/router → project root
  const distPath = path.resolve(__dirname, '..', '..', '..', 'admin-frontend', 'dist');
  if (fs.existsSync(distPath)) {
    router.use('/', express.static(distPath));
    router.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  return router;
}

module.exports = createRouter; 