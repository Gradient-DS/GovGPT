import express, { Router, Request, Response, NextFunction } from 'express';
import { getOverrides, updateOverride, applyChanges } from '../services/configService';
import path from 'path';
import fs from 'fs';

/**
 * Factory to build an Express router for the GovGPT admin plugin.
 * The JWT-based authentication middleware from LibreChat core **must** be
 * provided by the caller (see packages/custom/mount.js).
 */
export function buildAdminRouter(
  requireJwtAuth: (req: Request, res: Response, next: NextFunction) => void,
  options: Record<string, unknown> = {},
): Router {
  const router = express.Router();

  // Importing enums/constants that are safe to resolve directly
  const { SystemRoles } = require('librechat-data-provider');

  // Add detailed logging middleware to help diagnose authentication issues
  router.use((req: any, res: any, next: any) => {
    console.log('\n=== ADMIN ROUTER DEBUG ===');
    console.log('Request URL:', req.originalUrl);
    console.log('Request Method:', req.method);
    console.log('Request Headers:', {
      'accept': req.headers.accept,
      'authorization': req.headers.authorization ? 'Bearer [REDACTED]' : 'undefined',
      'cookie': req.headers.cookie ? 'Present' : 'undefined',
      'content-type': req.headers['content-type'],
    });
    
    // Parse and log cookies in detail
    if (req.headers.cookie) {
      const cookies = require('cookie').parse(req.headers.cookie);
      console.log('Parsed cookies:', {
        refreshToken: cookies.refreshToken ? 'Present' : 'undefined',
        token_provider: cookies.token_provider || 'undefined',
      });
    }
    
    console.log('User Agent:', req.headers['user-agent']);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    
    // Check if this is the known LibreChat cookie authentication issue
    const isHtmlRequest = req.headers.accept && req.headers.accept.includes('text/html');
    const hasRefreshToken = req.headers.cookie && req.headers.cookie.includes('refreshToken');
    const hasAuthHeader = req.headers.authorization;
    
    if (isHtmlRequest && hasRefreshToken && !hasAuthHeader) {
      console.log('\n🚨 AUTHENTICATION ISSUE DETECTED:');
      console.log('This is a known LibreChat issue where browser requests with cookies');
      console.log('fail authentication because requireJwtAuth expects Authorization headers.');
      console.log('\n📋 SOLUTIONS:');
      console.log('1. Run LibreChat in development mode: docker-compose.override.yml:');
      console.log('   services:');
      console.log('     api:');
      console.log('       command: npm run backend:dev');
      console.log('2. Or use HTTPS instead of HTTP');
      console.log('3. Or set NODE_ENV=development in environment');
      console.log('');
      console.log('See: https://github.com/danny-avila/LibreChat/discussions/572');
      console.log('See: https://www.librechat.ai/blog/2024-05-16_unsecured_http');
    }
    
    next();
  });

  /*
   * ---------------- Authentication ----------------
   * We ONLY guard API endpoints (JSON) – static files & index.html must remain
   * publicly accessible so the browser can load the React bundle first. The
   * React app will then invoke the protected endpoints with an Authorization
   * header obtained via /api/auth/refresh.
   */

  const protectedPaths = ['/health', '/config*'];

  router.use(protectedPaths, (req: any, res: any, next: any) => {
    console.log('Applying LibreChat requireJwtAuth middleware...');
    requireJwtAuth(req, res, (err?: any) => {
      if (err) {
        console.log('requireJwtAuth middleware error:', err);
        return next(err);
      }
      console.log('requireJwtAuth middleware successful');
      console.log('User after auth:', req.user ? {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
      } : 'undefined');
      next();
    });
  });

  // Custom admin check middleware (only for protected API endpoints)
  router.use(protectedPaths, (req: any, res: any, next: any) => {
    console.log('Admin check middleware - checking user role');
    try {
      if (!req.user) {
        console.log('No user found after authentication');
        const isHtmlRequest = req.headers.accept && req.headers.accept.includes('text/html');
        
        if (isHtmlRequest) {
          console.log('Redirecting HTML request to /login - no user');
          return res.redirect('/login');
        } else {
          console.log('Returning 401 for API request - no user');
          return res.status(401).json({ message: 'Authentication required' });
        }
      }
      
      console.log('User role:', req.user.role);
      console.log('SystemRoles.ADMIN:', SystemRoles.ADMIN);
      
      if (req.user.role !== SystemRoles.ADMIN) {
        console.log('User is not admin, role mismatch');
        const isHtmlRequest = req.headers.accept && req.headers.accept.includes('text/html');
        
        if (isHtmlRequest) {
          console.log('Redirecting HTML request to /login - not admin');
          return res.redirect('/login');
        } else {
          console.log('Returning 403 for API request - not admin');
          return res.status(403).json({ message: 'Forbidden' });
        }
      }
      
      console.log('Admin check passed');
      next();
    } catch (error) {
      console.log('Admin check middleware error:', error);
      const isHtmlRequest = req.headers.accept && req.headers.accept.includes('text/html');
      
      if (isHtmlRequest) {
        console.log('Redirecting HTML request to /login due to error');
        return res.redirect('/login');
      } else {
        console.log('Returning 500 for API request due to error');
        res.status(500).json({ message: 'Internal Server Error' });
      }
    }
  });

  router.get('/health', (_req, res) => {
    console.log('Health endpoint called');
    res.json({ plugin: 'govgpt-admin', status: 'ok' });
  });

  router.get('/config', async (req, res) => {
    console.log('Config GET endpoint called');
    try {
      const overrides = await getOverrides();
      console.log('Config fetched successfully');
      res.json({ overrides });
    } catch (err: any) {
      console.log('Config GET error:', err);
      res.status(500).json({ message: err.message });
    }
  });

  router.post('/config', async (req, res) => {
    console.log('Config POST endpoint called');
    try {
      const { key, value } = req.body;
      if (!key) {
        return res.status(400).json({ message: 'key required' });
      }
      // @ts-ignore – user extension of Express Request
      const overrides = await updateOverride(key, value, req.user?.id);
      console.log('Config updated successfully');
      res.json({ overrides });
    } catch (err: any) {
      console.log('Config POST error:', err);
      res.status(err.status || 500).json({ message: err.message });
    }
  });

  router.post('/config/apply', async (_req, res) => {
    console.log('Config apply endpoint called');
    try {
      await applyChanges();
      console.log('Config changes applied successfully');
      res.json({ message: 'Restart flag written' });
    } catch (err: any) {
      console.log('Config apply error:', err);
      res.status(500).json({ message: err.message });
    }
  });

  // Locate the admin-frontend/dist folder from the project root, regardless of where this file lives
  const distPath = path.resolve(process.cwd(), 'admin-frontend', 'dist');
  console.log('Admin frontend dist path:', distPath);
  console.log('Admin frontend dist exists:', fs.existsSync(distPath));
  
  if (fs.existsSync(distPath)) {
    // Serve static assets (these will be protected by the middleware above)
    router.use('/', express.static(distPath));
    
    // Handle HTML requests - if we reach here, authentication passed
    router.get('*', (req, res, next) => {
      const isHtmlRequest = req.headers.accept && req.headers.accept.includes('text/html');
      console.log('Wildcard route hit - isHtmlRequest:', isHtmlRequest);
      
      if (isHtmlRequest) {
        console.log('Serving admin frontend HTML');
        res.sendFile(path.join(distPath, 'index.html'));
      } else {
        console.log('Non-HTML request, calling next()');
        next();
      }
    });
  } else {
    console.log('WARNING: Admin frontend dist folder not found!');
  }

  return router;
}

// CommonJS compatibility
// @ts-ignore
module.exports = {
  buildAdminRouter,
}; 