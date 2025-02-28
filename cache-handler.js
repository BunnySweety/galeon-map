// cache-handler.js
const fs = require('fs');
const path = require('path');

// Ensure the cache directory exists
const CACHE_DIR = path.join(__dirname, '.next/cache');
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

class CacheHandler {
  constructor(options) {
    this.options = options;
    this.cache = new Map();
  }

  async get(key) {
    try {
      const filePath = path.join(CACHE_DIR, key);
      if (fs.existsSync(filePath)) {
        const data = await fs.promises.readFile(filePath);
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key, data) {
    try {
      const filePath = path.join(CACHE_DIR, key);
      await fs.promises.writeFile(filePath, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  async delete(key) {
    try {
      const filePath = path.join(CACHE_DIR, key);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }
}

module.exports = CacheHandler;