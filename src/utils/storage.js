// src/utils/storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import log from './logger';

const Storage = {
  /**
   * Set item to storage
   * @param {string} key
   * @param {any} value
   */
  async set(key, value) {
    try {
      const jsonValue =
        typeof value === 'string' ? value : JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
      return true;
    } catch (error) {
      log.error(`[Storage] set error for key "${key}":`, error);
      return false;
    }
  },

  /**
   * Get item from storage
   * @param {string} key
   * @returns {any}
   */
  async get(key) {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value === null) return null;
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (error) {
      log.error(`[Storage] get error for key "${key}":`, error);
      return null;
    }
  },

  /**
   * Remove item from storage
   * @param {string} key
   */
  async remove(key) {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      log.error(`[Storage] remove error for key "${key}":`, error);
      return false;
    }
  },

  /**
   * Clear all storage
   */
  async clear() {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      log.error('[Storage] clear error:', error);
      return false;
    }
  },

  /**
   * Get multiple items
   * @param {string[]} keys
   */
  async multiGet(keys) {
    try {
      const pairs = await AsyncStorage.multiGet(keys);
      const result = {};
      pairs.forEach(([key, value]) => {
        try {
          result[key] = JSON.parse(value);
        } catch {
          result[key] = value;
        }
      });
      return result;
    } catch (error) {
      log.error('[Storage] multiGet error:', error);
      return {};
    }
  },
};

export default Storage;
