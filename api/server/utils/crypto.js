const crypto = require('crypto');
const { logger } = require('~/config');

// Simple encryption/decryption for API keys
// Using Node.js built-in crypto for simplicity
const algorithm = 'aes-256-ctr';

const getKey = () => {
  const key = process.env.CREDS_KEY;
  if (!key) {
    logger.warn('CREDS_KEY not found in environment variables. API key encryption will not work.');
    return null;
  }
  return Buffer.from(key, 'hex');
};

const encrypt = (text) => {
  try {
    const key = getKey();
    if (!key) {
      return text; // Return unencrypted if no key
    }
    
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(algorithm, key);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    logger.error('Error encrypting API key:', error);
    return text; // Return unencrypted on error
  }
};

const decrypt = (encryptedText) => {
  try {
    const key = getKey();
    if (!key) {
      return encryptedText; // Return as-is if no key
    }
    
    const textParts = encryptedText.split(':');
    if (textParts.length < 2) {
      return encryptedText; // Return as-is if not properly formatted
    }
    
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedData = textParts.join(':');
    
    const decipher = crypto.createDecipher(algorithm, key);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    logger.error('Error decrypting API key:', error);
    return encryptedText; // Return as-is on error
  }
};

module.exports = {
  encrypt,
  decrypt,
}; 