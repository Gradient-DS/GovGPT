const { CacheKeys } = require('librechat-data-provider');
const getLogStores = require('~/cache/getLogStores');
const { logger } = require('~/config');

/**
 * Get the admin configuration from database
 * @returns {Promise<Object|null>} The admin configuration or null if not found
 */
const getAdminConfig = async function() {
  const cache = getLogStores(CacheKeys.CONFIG_STORE);
  const AdminConfig = require('~/db/models').AdminConfig;
  
  try {
    // Try to get from cache first
    const cached = await cache.get('admin-config');
    if (cached) {
      return cached;
    }

    // Get from database
    const adminConfig = await AdminConfig.findById('admin-config').lean();
    
    if (adminConfig) {
      // Cache the result with shorter TTL for real-time updates (5 minutes)
      await cache.set('admin-config', adminConfig, 300);
    }
    
    return adminConfig;
  } catch (error) {
    logger.error('Failed to get admin config:', error);
    return null;
  }
};

/**
 * Update admin configuration in database
 * @param {Object} updates - The configuration updates to apply
 * @returns {Promise<Object>} The updated admin configuration
 */
const updateAdminConfig = async function(updates) {
  const cache = getLogStores(CacheKeys.CONFIG_STORE);
  const AdminConfig = require('~/db/models').AdminConfig;
  
  try {
    // Clear all related caches FIRST to prevent race conditions
    await Promise.all([
      cache.delete('admin-config'),
      cache.delete(CacheKeys.STARTUP_CONFIG),
      cache.delete(CacheKeys.MODELS_CONFIG),
      cache.delete(CacheKeys.ENDPOINT_CONFIG),
      cache.delete(CacheKeys.OVERRIDE_CONFIG)
    ]);
    
    // Add longer delay to ensure cache clearing is complete across all processes
    await new Promise(resolve => setTimeout(resolve, 50));
    
    logger.debug('All caches cleared for admin config update');
    
    // Use upsert to create if doesn't exist
    const adminConfig = await AdminConfig.findByIdAndUpdate(
      'admin-config',
      {
        $set: updates,
        $setOnInsert: { _id: 'admin-config', version: 1 }
      },
      { 
        new: true, 
        upsert: true, 
        lean: true 
      }
    );
    
    // Cache the updated admin config immediately with shorter TTL
    await cache.set('admin-config', adminConfig, 300);
    
    logger.info('Admin config updated and caches cleared:', Object.keys(updates));
    return adminConfig;
  } catch (error) {
    logger.error('Failed to update admin config:', error);
    throw error;
  }
};

/**
 * Reset admin configuration (delete all overrides)
 * @returns {Promise<boolean>} True if reset was successful
 */
const resetAdminConfig = async function() {
  const cache = getLogStores(CacheKeys.CONFIG_STORE);
  const AdminConfig = require('~/db/models').AdminConfig;
  
  try {
    // Clear all related caches FIRST
    await Promise.all([
      cache.delete('admin-config'),
      cache.delete(CacheKeys.STARTUP_CONFIG),
      cache.delete(CacheKeys.MODELS_CONFIG),
      cache.delete(CacheKeys.ENDPOINT_CONFIG),
      cache.delete(CacheKeys.OVERRIDE_CONFIG)
    ]);
    
    // Add longer delay to ensure cache clearing is complete across all processes
    await new Promise(resolve => setTimeout(resolve, 50));
    
    logger.debug('All caches cleared for admin config reset');
    
    await AdminConfig.findByIdAndDelete('admin-config');
    
    logger.info('Admin config reset and caches cleared');
    return true;
  } catch (error) {
    logger.error('Failed to reset admin config:', error);
    throw error;
  }
};

module.exports = {
  getAdminConfig,
  updateAdminConfig,
  resetAdminConfig,
}; 