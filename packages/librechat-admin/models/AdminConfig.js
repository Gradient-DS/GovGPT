const mongoose = require('mongoose');

/**
 * Singleton document that stores admin overrides.
 * Only one document should exist. We enforce this in service layer.
 */
const adminConfigSchema = new mongoose.Schema({
  overrides: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.models.AdminConfig || mongoose.model('AdminConfig', adminConfigSchema); 