// src/service/api.js
import axios from 'axios';
import Config from 'react-native-config';
import {log, Storage} from '../utils';
import {getBaseUrl} from '../config/apiConfig';

// Lazy getter untuk menghindari circular dependency (authStore → api → authStore)
const getAuthStore = () => require('../store/authStore').default;

// Debounce: refreshToken maksimal dipanggil sekali per interval ini (ms)
const REFRESH_DEBOUNCE_MS = 30_000;
let _lastRefreshAt = 0;

const TOKEN_KEY = Config.TOKEN_KEY;

/**
 * Factory: buat axios instance dengan baseURL tertentu
 */
function createApiInstance(baseURL, extraHeaders = {}) {
  const instance = axios.create({
    baseURL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...extraHeaders,
    },
  });

  // Request interceptor
  instance.interceptors.request.use(
    async config => {
      // ── Auto Refresh Token ──────────────────────────────────────────────────
      const now = Date.now();
      if (now - _lastRefreshAt > REFRESH_DEBOUNCE_MS) {
        _lastRefreshAt = now;
        try {
          const store = getAuthStore();
          const {isAuthenticated, isRefreshing, refreshToken} = store.getState();
          if (isAuthenticated && !isRefreshing) {
            // Jalankan secara asynchronous tanpa await agar tidak memblokir request utama
            refreshToken().catch(e => log.warn('[API] Async refresh error:', e?.message));
          }
        } catch (e) {
          log.warn('[API] Auto-refresh token error (non-fatal):', e?.message);
        }
      }
      // ────────────────────────────────────────────────────────────────────────

      const token = await Storage.get(TOKEN_KEY);

      // Jika sudah ada header 'apikey' atau 'x-api-key', jangan tambahkan 'Bearer' token
      const hasApiKey = config.headers.apikey || config.headers['x-api-key'];

      if (token && !hasApiKey) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      log.debug(`[API] ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
      });
      return config;
    },
    error => {
      log.error('[API] Request error:', error);
      return Promise.reject(error);
    },
  );

  // Response interceptor
  instance.interceptors.response.use(
    response => {
      log.debug(`[API] Response ${response.status}:`, response.data);
      return response;
    },
    async error => {
      const {response} = error;
      if (response) {
        log.error(`[API] Error ${response.status}:`, response.data);
        if (response.status === 401) {
          await Storage.remove(TOKEN_KEY);
        }
      } else {
        log.error('[API] Network error:', error.message);
      }
      return Promise.reject(error);
    },
  );

  return instance;
}

/**
 * imsApi  — baseURL: API_URL_IMS (dev) atau API_URL_GATEWAY (prod)
 * wmsApi  — baseURL: API_URL_WMS (dev) atau API_URL_GATEWAY (prod)
 * dpdApi  — baseURL: API_URL_DPD (dev) atau API_URL_GATEWAY (prod)
 */
export const imsApi = createApiInstance(getBaseUrl('IMS'));
export const wmsApi = createApiInstance(getBaseUrl('WMS'), {
  apikey: Config.API_KEY_WMS,
});
export const dpdApi = createApiInstance(getBaseUrl('DPD'), {
  apikey: Config.API_KEY_DPD || '',
});

// Default export untuk backward-compatibility (mengarah ke IMS)
export default imsApi;
