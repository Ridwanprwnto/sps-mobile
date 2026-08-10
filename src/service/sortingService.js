// src/service/sortingService.js
import Config from 'react-native-config';
import {dpdApi, wmsApi} from './api';

/**
 * Prefix endpoint:
 *   DPD  (Backend 1): /api-ssdc/main
 *   WMS  (Backend 2): /api-wmsmobile/main
 */
const DPD_PREFIX = `${Config.ENDPOINT_DPD}${Config.MAIN_PATH}`;
const WMS_PREFIX = `${Config.ENDPOINT_WMS}${Config.MAIN_PATH}`;

const sortingService = {
  // ===========================================================================
  // BACKEND 1 (DPD) — Read-only, hanya ambil data
  // ===========================================================================

  /**
   * Cek & ambil data hasil picking/sorting dari Backend 1 (DPD/SQL Server)
   * @param {string} nopick - Nomor pick
   * @returns {Promise<{success: boolean, data: Array}>}
   */
  async getPickDataFromDPD(nopick) {
    const response = await dpdApi.post(`${DPD_PREFIX}/sortingpool/packingresult`, {
      nopick,
    });
    return response.data;
  },

  /**
   * Mencari daftar nomor pick berdasarkan Tanggal Pick dan Nomor SP dari Backend 1
   * @param {string} tglPic - Tanggal (YYYY-MM-DD)
   * @param {string} noUrutSp - Nomor SP
   */
  async searchByTglAndSP(tglPic, noUrutSp) {
    const response = await dpdApi.post(`${DPD_PREFIX}/sortingpool/search-by-sp`, {
      tglPic,
      noUrutSp,
    });
    return response.data;
  },

  // ===========================================================================
  // BACKEND 2 (WMS) — CRUD sorting pool
  // ===========================================================================

  /**
   * Step 1: Inisiasi proses sorting
   * - Jika data sudah ada di WMS (PostgreSQL): langsung return progress
   * - Jika belum ada: simpan headerData + detailsData dari Backend 1
   * @param {object} payload - { nopick, headerData?, detailsData? }
   */
  async initSortingProcess(payload) {
    const response = await wmsApi.post(
      `${WMS_PREFIX}/sortingpool/init`,
      payload,
    );
    return response.data;
  },

  /**
   * Step 2: Scan container/dusno
   * Update flag scan (Y/N) untuk satu container
   * @param {object} payload - { nopick, dusno, user? }
   */
  async scanContainer(payload) {
    const response = await wmsApi.put(
      `${WMS_PREFIX}/sortingpool/scan`,
      payload,
    );
    return response.data;
  },

  /**
   * Step 3: Complete proses sortasi
   * Ubah status header menjadi selesai
   * @param {object} payload - { nopick, user? }
   */
  async completeProcess(payload) {
    const response = await wmsApi.put(
      `${WMS_PREFIX}/sortingpool/complete`,
      payload,
    );
    return response.data;
  },

  /**
   * Ambil progress/status terkini untuk satu nopick
   * @param {string} nopick
   */
  async getProgress(nopick) {
    const response = await wmsApi.get(
      `${WMS_PREFIX}/sortingpool/progress/${nopick}`,
    );
    return response.data;
  },
};

export default sortingService;
