const express = require('express');
const { checkAdmin, requireJwtAuth } = require('~/server/middleware');
const { getAdminConfig, updateAdminConfig, resetAdminConfig } = require('~/models/AdminConfig');
const { SystemRoles } = require('librechat-data-provider');

const router = express.Router();
router.use(requireJwtAuth);
router.use(checkAdmin);

/**
 * GET /api/admin/config
 * Get the current admin configuration
 */
router.get('/config', async (req, res) => {
  try {
    const adminConfig = await getAdminConfig();
    res.status(200).json({ adminConfig: adminConfig || {} });
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to get admin configuration', 
      error: error.message 
    });
  }
});

/**
 * PUT /api/admin/config
 * Update admin configuration
 */
router.put('/config', async (req, res) => {
  try {
    const updates = req.body;
    
    // Remove any undefined or null values at the top level to avoid overwriting with nulls
    const cleanUpdates = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        cleanUpdates[key] = value;
      }
    }
    
    const adminConfig = await updateAdminConfig(cleanUpdates);
    res.status(200).json({ adminConfig });
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to update admin configuration', 
      error: error.message 
    });
  }
});

/**
 * DELETE /api/admin/config
 * Reset admin configuration (remove all overrides)
 */
router.delete('/config', async (req, res) => {
  try {
    await resetAdminConfig();
    res.status(200).json({ message: 'Admin configuration reset successfully' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to reset admin configuration', 
      error: error.message 
    });
  }
});

// User Management Routes

/**
 * GET /api/admin/users
 * Get paginated list of users with optional search
 */
router.get('/users', async (req, res) => {
  try {
    const User = require('~/db/models').User;
    const { page = 1, limit = 10, search = '' } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // Build search query
    let searchQuery = {};
    if (search) {
      searchQuery = {
        $or: [
          { email: { $regex: search, $options: 'i' } },
          { name: { $regex: search, $options: 'i' } },
          { username: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    // Get users with pagination
    const users = await User.find(searchQuery)
      .select('-password -__v')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();
    
    // Get total count for pagination
    const totalUsers = await User.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalUsers / limitNum);
    
    res.status(200).json({
      users,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalUsers,
        limit: limitNum
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to get users', 
      error: error.message 
    });
  }
});

/**
 * GET /api/admin/users/stats
 * Get user statistics
 */
router.get('/users/stats', async (req, res) => {
  try {
    const User = require('~/db/models').User;
    
    // Get basic stats
    const totalUsers = await User.countDocuments();
    const adminCount = await User.countDocuments({ role: SystemRoles.ADMIN });
    const userCount = await User.countDocuments({ role: SystemRoles.USER });
    const verifiedUsers = await User.countDocuments({ emailVerified: true });
    
    // Recent users (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentUsers = await User.countDocuments({ 
      createdAt: { $gte: thirtyDaysAgo } 
    });
    
    res.status(200).json({
      totalUsers,
      adminCount,
      userCount,
      verifiedUsers,
      recentUsers
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to get user statistics', 
      error: error.message 
    });
  }
});

/**
 * GET /api/admin/users/:userId
 * Get user by ID
 */
router.get('/users/:userId', async (req, res) => {
  try {
    const User = require('~/db/models').User;
    const { userId } = req.params;
    
    const user = await User.findById(userId)
      .select('-password -__v')
      .lean();
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to get user', 
      error: error.message 
    });
  }
});

/**
 * POST /api/admin/users
 * Create new user
 */
router.post('/users', async (req, res) => {
  try {
    const User = require('~/db/models').User;
    const bcrypt = require('bcryptjs');
    const { email, name, username, role = SystemRoles.USER, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [
        { email },
        ...(username ? [{ username }] : [])
      ]
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User with this email or username already exists' 
      });
    }
    
    // Create user data
    const userData = {
      email,
      name,
      username,
      role,
      provider: 'local',
      emailVerified: true, // Admin-created users are verified by default
    };
    
    // Add password if provided
    if (password) {
      const saltRounds = 12;
      userData.password = await bcrypt.hash(password, saltRounds);
    }
    
    const user = await User.create(userData);
    
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.__v;
    
    res.status(201).json({ user: userResponse });
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to create user', 
      error: error.message 
    });
  }
});

/**
 * PUT /api/admin/users/:userId
 * Update user
 */
router.put('/users/:userId', async (req, res) => {
  try {
    const User = require('~/db/models').User;
    const { userId } = req.params;
    const { email, name, username, role, emailVerified } = req.body;
    
    // Prevent admin from removing their own admin role
    if (req.user.id === userId && role && role !== SystemRoles.ADMIN) {
      return res.status(400).json({ 
        message: 'You cannot remove your own admin role' 
      });
    }
    
    // Check if email/username already exists for other users
    if (email || username) {
      const existingUser = await User.findOne({
        _id: { $ne: userId },
        $or: [
          ...(email ? [{ email }] : []),
          ...(username ? [{ username }] : [])
        ]
      });
      
      if (existingUser) {
        return res.status(400).json({ 
          message: 'Email or username already exists for another user' 
        });
      }
    }
    
    // Update user
    const updateData = {};
    if (email !== undefined) updateData.email = email;
    if (name !== undefined) updateData.name = name;
    if (username !== undefined) updateData.username = username;
    if (role !== undefined) updateData.role = role;
    if (emailVerified !== undefined) updateData.emailVerified = emailVerified;
    
    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -__v').lean();
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to update user', 
      error: error.message 
    });
  }
});

/**
 * DELETE /api/admin/users/:userId
 * Delete user
 */
router.delete('/users/:userId', async (req, res) => {
  try {
    const User = require('~/db/models').User;
    const { userId } = req.params;
    
    // Prevent admin from deleting themselves
    if (req.user.id === userId) {
      return res.status(400).json({ 
        message: 'You cannot delete your own account' 
      });
    }
    
    const user = await User.findByIdAndDelete(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // TODO: Cleanup user's conversations, messages, files, etc.
    // This should be done in a background job for large datasets
    
    res.status(200).json({ 
      message: `User ${user.email} deleted successfully` 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to delete user', 
      error: error.message 
    });
  }
});

// Custom Endpoints Routes

/**
 * GET /api/admin/endpoints
 * Get all custom endpoints
 */
router.get('/endpoints', async (req, res) => {
  try {
    const { CustomEndpoint } = require('~/db/models');
    
    if (!CustomEndpoint) {
      return res.status(200).json([]);
    }
    
    const endpoints = await CustomEndpoint.find({}).sort({ createdAt: -1 });
    res.status(200).json(endpoints);
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to get custom endpoints', 
      error: error.message 
    });
  }
});

/**
 * GET /api/admin/endpoints/:id
 * Get custom endpoint by ID
 */
router.get('/endpoints/:id', async (req, res) => {
  try {
    const { CustomEndpoint } = require('~/db/models');
    const { id } = req.params;
    
    const endpoint = await CustomEndpoint.findById(id);
    if (!endpoint) {
      return res.status(404).json({ message: 'Custom endpoint not found' });
    }
    
    res.status(200).json(endpoint);
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to get custom endpoint', 
      error: error.message 
    });
  }
});

/**
 * POST /api/admin/endpoints
 * Create custom endpoint
 */
router.post('/endpoints', async (req, res) => {
  try {
    const { CustomEndpoint } = require('~/db/models');
    
    if (!CustomEndpoint) {
      return res.status(500).json({ 
        message: 'CustomEndpoint model not available' 
      });
    }
    
    const { name, displayName, baseURL } = req.body;
    
    if (!name || !baseURL) {
      return res.status(400).json({ 
        message: 'Name and baseURL are required' 
      });
    }
    
    const existingEndpoint = await CustomEndpoint.findOne({ name });
    if (existingEndpoint) {
      return res.status(409).json({ 
        message: 'An endpoint with this name already exists' 
      });
    }
    
    const endpointData = {
      name,
      displayName: displayName || name,
      baseURL,
      ...req.body
    };
    
    const endpoint = new CustomEndpoint(endpointData);
    await endpoint.save();

    // Invalidate endpoints & models cache so changes reflect immediately
    try {
      const { CacheKeys } = require('librechat-data-provider');
      const { getLogStores } = require('~/cache');
      const cache = getLogStores(CacheKeys.CONFIG_STORE);
      await cache.del(CacheKeys.ENDPOINT_CONFIG);
      await cache.del(CacheKeys.MODELS_CONFIG);
    } catch (_) {
      // Ignore cache errors
    }
 
    res.status(201).json({ endpoint });
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to create custom endpoint', 
      error: error.message 
    });
  }
});

/**
 * PUT /api/admin/endpoints/:id
 * Update custom endpoint
 */
router.put('/endpoints/:id', async (req, res) => {
  try {
    const { CustomEndpoint } = require('~/db/models');
    const { updateCustomEndpointSchema } = require('@librechat/data-schemas');
    const { id } = req.params;
    
    // Validate request body
    const validatedData = updateCustomEndpointSchema.parse(req.body);
    
    // Check if endpoint exists
    const endpoint = await CustomEndpoint.findById(id);
    if (!endpoint) {
      return res.status(404).json({ message: 'Custom endpoint not found' });
    }
    
    // If name is being changed, check for conflicts
    if (validatedData.name && validatedData.name !== endpoint.name) {
      const existingEndpoint = await CustomEndpoint.findOne({ 
        name: validatedData.name,
        _id: { $ne: id }
      });
      if (existingEndpoint) {
        return res.status(409).json({ 
          message: 'An endpoint with this name already exists' 
        });
      }
    }
    
    // Update endpoint
    const updatedEndpoint = await CustomEndpoint.findByIdAndUpdate(
      id,
      validatedData,
      { new: true, runValidators: true }
    );

    // Invalidate endpoints & models cache
    try {
      const { CacheKeys } = require('librechat-data-provider');
      const { getLogStores } = require('~/cache');
      const cache = getLogStores(CacheKeys.CONFIG_STORE);
      await cache.del(CacheKeys.ENDPOINT_CONFIG);
      await cache.del(CacheKeys.MODELS_CONFIG);
    } catch (_) {
      /* ignore */
    }
 
    res.status(200).json({ endpoint: updatedEndpoint });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ 
        message: 'Invalid endpoint data',
        errors: error.errors 
      });
    }
    
    res.status(500).json({ 
      message: 'Failed to update custom endpoint', 
      error: error.message 
    });
  }
});

/**
 * DELETE /api/admin/endpoints/:id
 * Delete custom endpoint
 */
router.delete('/endpoints/:id', async (req, res) => {
  try {
    const { CustomEndpoint } = require('~/db/models');
    const { id } = req.params;
    
    const endpoint = await CustomEndpoint.findByIdAndDelete(id);
    if (!endpoint) {
      return res.status(404).json({ message: 'Custom endpoint not found' });
    }

    // Invalidate endpoints & models cache
    try {
      const { CacheKeys } = require('librechat-data-provider');
      const { getLogStores } = require('~/cache');
      const cache = getLogStores(CacheKeys.CONFIG_STORE);
      await cache.del(CacheKeys.ENDPOINT_CONFIG);
      await cache.del(CacheKeys.MODELS_CONFIG);
    } catch (_) {
      /* ignore */
    }
    
    res.status(200).json({ 
      message: `Custom endpoint "${endpoint.name}" deleted successfully` 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to delete custom endpoint', 
      error: error.message 
    });
  }
});

/**
 * POST /api/admin/endpoints/parse
 * Parse OpenAPI specification
 */
router.post('/endpoints/parse', async (req, res) => {
  try {
    const { spec } = req.body;
    
    if (!spec) {
      return res.status(400).json({ message: 'OpenAPI specification is required' });
    }
    
    // Parse OpenAPI specification
    let parsedSpec;
    try {
      parsedSpec = typeof spec === 'string' ? JSON.parse(spec) : spec;
    } catch (parseError) {
      return res.status(400).json({ 
        message: 'Invalid JSON in OpenAPI specification' 
      });
    }
    
    // Extract basic information
    const info = parsedSpec.info || {};
    const servers = parsedSpec.servers || [];
    const paths = parsedSpec.paths || {};
    
    // Extract potential models from schema components
    const models = [];
    if (parsedSpec.components && parsedSpec.components.schemas) {
      Object.keys(parsedSpec.components.schemas).forEach(schemaName => {
        if (schemaName.toLowerCase().includes('model')) {
          models.push(schemaName);
        }
      });
    }
    
    // Extract endpoints
    const endpoints = [];
    Object.keys(paths).forEach(path => {
      const pathItem = paths[path];
      Object.keys(pathItem).forEach(method => {
        if (['get', 'post', 'put', 'delete'].includes(method.toLowerCase())) {
          const operation = pathItem[method];
          endpoints.push({
            path,
            method: method.toUpperCase(),
            summary: operation.summary || '',
            description: operation.description || '',
          });
        }
      });
    });
    
    res.status(200).json({
      endpoints,
      models,
      info: {
        title: info.title || 'Parsed API',
        version: info.version || '1.0.0',
        description: info.description || 'Parsed from OpenAPI specification',
        servers: servers.map(s => s.url || '').filter(Boolean)
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to parse OpenAPI specification', 
      error: error.message 
    });
  }
});

module.exports = router; 