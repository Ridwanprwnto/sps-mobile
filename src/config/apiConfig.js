// src/config/apiConfig.js
import Config from 'react-native-config';

const apiConfig = {
  // Development: gunakan URL terpisah untuk setiap service
  development: {
    IMS: {
      baseUrl: Config.API_URL_IMS,
      endpoint: Config.ENDPOINT_IMS,
      fullUrl: `${Config.API_URL_IMS}${Config.ENDPOINT_IMS}`,
    },
    WMS: {
      baseUrl: Config.API_URL_WMS,
      endpoint: Config.ENDPOINT_WMS,
      fullUrl: `${Config.API_URL_WMS}${Config.ENDPOINT_WMS}`,
    },
    DPD: {
      baseUrl: Config.API_URL_DPD,
      endpoint: Config.ENDPOINT_DPD,
      fullUrl: `${Config.API_URL_DPD}${Config.ENDPOINT_DPD}`,
    },
  },
  // Production: IMS, WMS, dan DPD diakses via API Gateway
  production: {
    IMS: {
      baseUrl: Config.API_URL_GATEWAY,
      endpoint: Config.ENDPOINT_IMS,
      fullUrl: `${Config.API_URL_GATEWAY}${Config.ENDPOINT_IMS}`,
    },
    WMS: {
      baseUrl: Config.API_URL_GATEWAY,
      endpoint: Config.ENDPOINT_WMS,
      fullUrl: `${Config.API_URL_GATEWAY}${Config.ENDPOINT_WMS}`,
    },
    DPD: {
      baseUrl: Config.API_URL_GATEWAY,
      endpoint: Config.ENDPOINT_DPD,
      fullUrl: `${Config.API_URL_GATEWAY}${Config.ENDPOINT_DPD}`,
    },
  },
};

const currentConfig =
  Config.APP_ENV === 'production' ? apiConfig.production : apiConfig.development;

/**
 * Mendapatkan fullUrl untuk service tertentu
 * @param {'IMS' | 'WMS' | 'DPD'} service - Nama service
 * @returns {string} URL lengkap service (baseUrl + endpoint)
 */
export function getApiUrl(service) {
  if (!currentConfig[service]) {
    throw new Error(`Service "${service}" tidak ditemukan dalam konfigurasi API`);
  }
  return currentConfig[service].fullUrl;
}

/**
 * Mendapatkan baseUrl untuk service tertentu (dipakai axios baseURL)
 * @param {'IMS' | 'WMS' | 'DPD'} service
 * @returns {string}
 */
export function getBaseUrl(service) {
  if (!currentConfig[service]) {
    throw new Error(`Service "${service}" tidak ditemukan dalam konfigurasi API`);
  }
  return currentConfig[service].baseUrl;
}

/**
 * Build URL lengkap dengan path tambahan
 * @param {'IMS' | 'WMS' | 'DPD'} service
 * @param {string} path - Path tambahan (misal: '/sortingpool/init')
 * @returns {string}
 */
export function buildApiUrl(service, path = '') {
  const baseUrl = getApiUrl(service);
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}
