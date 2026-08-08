// src/service/authService.js
import Config from 'react-native-config';
import {imsApi} from './api';

/**
 * Endpoint IMS auth:
 *   dev  → http://192.168.33.144:4000/api-ims/auth
 *   prod → http://192.168.33.146:8000/api-ims/auth
 *
 * imsApi sudah memiliki baseURL = API_URL_IMS (dev) / API_URL_GATEWAY (prod),
 * jadi url yang dikirim cukup path relatif dari baseURL.
 */
const AUTH_PREFIX = `${Config.ENDPOINT_IMS}${Config.AUTH_PATH}`;
const MAIN_PREFIX = `${Config.ENDPOINT_IMS}${Config.MAIN_PATH}`;

const authService = {
  /**
   * Login user
   * @param {string} username
   * @param {string} password
   */
  async login(username, password) {
    const response = await imsApi.post(`${AUTH_PREFIX}/users/login`, {
      username,
      password,
    });
    return response.data;
  },

  /**
   * Logout user
   */
  async logout() {
    const response = await imsApi.post(`${AUTH_PREFIX}/users/logout`);
    return response.data;
  },

  /**
   * Get current user profile
   */
  async getProfile() {
    const response = await imsApi.get(`${AUTH_PREFIX}/users/profile`);
    return response.data;
  },

  /**
   * Refresh token
   */
  async refreshToken() {
    const response = await imsApi.get(`${MAIN_PREFIX}/token/refresh`);
    return response.data;
  },
};

export default authService;
