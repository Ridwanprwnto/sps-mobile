// src/store/sortingStore.js
import {create} from 'zustand';
import {sortingService} from '../service';
import {log} from '../utils';

// Helper lazy import untuk menghindari circular dependency
const getAuthStore = () => require('./authStore').default;

const parseError = (error, defaultMsg) => {
  if (error?.response) {
    const status = error.response.status;
    const data = error.response.data;
    
    // Jika backend mengirim raw HTML (misal 404 default express)
    if (typeof data === 'string' && data.toLowerCase().includes('<!doctype html>')) {
      if (status === 404) return 'Layanan tidak ditemukan (404).';
      if (status === 502) return 'Server sedang offline atau tidak dapat dijangkau (502).';
      if (status >= 500) return 'Terjadi kesalahan pada server (500).';
      return `Error jaringan (${status}).`;
    }
    
    // Jika backend mengirim message dalam JSON
    if (data && data.message && typeof data.message === 'string') {
       // Filter error database mentah (SQL Server / Postgres)
       const msgLower = data.message.toLowerCase();
       if (msgLower.includes('sql') || msgLower.includes('violation') || msgLower.includes('invalid object name')) {
         return 'Terjadi kesalahan query pada server (Database Error).';
       }
       if (data.message.length > 100) {
         return 'Terjadi kesalahan sistem saat memproses data.';
       }
       return data.message;
    }
    
    if (status === 404) return 'Data atau layanan tidak ditemukan (404).';
    if (status >= 500) return 'Terjadi kesalahan internal server (500).';
  } else if (error?.request) {
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return 'Koneksi terputus. Waktu permintaan habis.';
    }
    return 'Tidak dapat terhubung ke server. Periksa koneksi atau jaringan Anda.';
  }
  return defaultMsg;
};

const useSortingStore = create((set, get) => ({
  // ===========================================================================
  // STATE
  // ===========================================================================

  // Data proses sorting aktif
  nopick: null,               // nomor pick yang sedang diproses
  sortingData: null,          // { header, details[] } — dari backend 2

  // Loading states
  isLoadingInit: false,       // loading saat init/fetch nopick
  isLoadingScan: false,       // loading saat scan container
  isCompleting: false,        // loading saat complete process

  // Error
  error: null,

  // ===========================================================================
  // STEP 1: INIT SORTING PROCESS
  // Input nopick → fetch DPD → simpan ke WMS → return progress
  // ===========================================================================

  /**
   * Inisiasi proses sorting untuk satu nopick.
   * Alur:
   * 1. Fetch data dari Backend 1 (DPD)
   * 2. POST ke Backend 2 (WMS) /sortingpool/init
   *    - Jika data belum ada di WMS: kirim headerData + detailsData
   *    - Jika sudah ada: WMS langsung return progress terkini
   * 3. Simpan hasilnya ke state
   *
   * @param {string} nopick
   * @returns {{ success: boolean, message?: string }}
   */
  initSorting: async (nopick, previewData = null) => {
    if (!nopick || nopick.trim() === '') {
      return {success: false, message: 'Nomor pick tidak boleh kosong'};
    }

    set({isLoadingInit: true, error: null});
    try {
      let initResponse;

      if (previewData && previewData.source === 'wms') {
        initResponse = { success: true, data: previewData.data };
      } else if (previewData && previewData.source === 'dpd') {
        const initPayload = {nopick: nopick.trim(), headerData: previewData.data.header, detailsData: previewData.data.details};
        initResponse = await sortingService.initSortingProcess(initPayload);
      } else {
        // First attempt: kirim nopick saja (jika data sudah ada di WMS)
        let initPayload = {nopick: nopick.trim()};
        try {
          initResponse = await sortingService.initSortingProcess(initPayload);
        } catch (initErr) {
          // Jika backend 2 meminta data (400 headerData required),
          // ambil dari Backend 1 dan kirim ulang
          const status = initErr?.response?.status;
          const serverMsg = initErr?.response?.data?.message || '';
          if (
            status === 400 &&
            serverMsg.toLowerCase().includes('headerdata is required')
          ) {
            log.info('[Sorting] Data not in WMS, fetching from DPD...');
            const dpdResponse = await sortingService.getPickDataFromDPD(
              nopick.trim(),
            );

            if (!dpdResponse?.success || !dpdResponse?.data) {
              const msg = `Nomor pick "${nopick}" tidak ditemukan di sistem DPD`;
              set({isLoadingInit: false, error: msg});
              return {success: false, message: msg};
            }

            // Ekstrak header dan details dari response DPD
            const headerData = dpdResponse.data.header;
            const detailsData = dpdResponse.data.details;

            if (!headerData || !detailsData || detailsData.length === 0) {
              const msg = `Data nomor pick "${nopick}" tidak lengkap dari sistem DPD`;
              set({isLoadingInit: false, error: msg});
              return {success: false, message: msg};
            }

            initPayload = {nopick: nopick.trim(), headerData, detailsData};
            initResponse = await sortingService.initSortingProcess(initPayload);
          } else {
            throw initErr;
          }
        }
      }

      if (!initResponse?.success) {
        const msg = initResponse?.message || 'Gagal menginisiasi proses sorting';
        set({isLoadingInit: false, error: msg});
        return {success: false, message: msg};
      }

      set({
        nopick: nopick.trim(),
        sortingData: initResponse.data || null,
        isLoadingInit: false,
        error: null,
      });

      log.info('[Sorting] Init success for nopick:', nopick);
      return {success: true, data: initResponse.data};
    } catch (error) {
      const message = parseError(error, 'Gagal memuat data');
      log.error('[Sorting] initSorting error:', error?.message || error);
      set({isLoadingInit: false, error: message});
      return {success: false, message};
    }
  },

  /**
   * Cek data nopick (di WMS atau DPD) HANYA untuk mendapatkan info preview
   * tanpa menginisiasi/menyimpan data ke WMS.
   */
  checkPreviewNopick: async nopick => {
    if (!nopick || nopick.trim() === '') {
      return {success: false, message: 'Nomor pick tidak boleh kosong'};
    }

    set({isLoadingInit: true, error: null});
    try {
      // 1. Cek progress WMS
      const progressResponse = await sortingService.getProgress(nopick.trim()).catch(() => null);
      if (progressResponse?.success && progressResponse?.data?.header) {
        set({isLoadingInit: false});
        return { success: true, data: { header: progressResponse.data.header, details: progressResponse.data.details }, source: 'wms' };
      }

      // 2. Fetch DPD jika belum ada di WMS
      const dpdResponse = await sortingService.getPickDataFromDPD(nopick.trim());
      if (!dpdResponse?.success || !dpdResponse?.data) {
        const msg = `Nomor pick "${nopick}" tidak ditemukan di sistem DPD`;
        set({isLoadingInit: false, error: msg});
        return {success: false, message: msg};
      }

      const headerData = dpdResponse.data.header;
      const detailsData = dpdResponse.data.details;
      if (!headerData || !detailsData || detailsData.length === 0) {
        const msg = `Data nomor pick "${nopick}" tidak lengkap dari sistem DPD`;
        set({isLoadingInit: false, error: msg});
        return {success: false, message: msg};
      }

      set({isLoadingInit: false});
      return { success: true, data: { header: headerData, details: detailsData }, source: 'dpd' };
    } catch (error) {
      const message = parseError(error, 'Gagal memuat preview data');
      log.error('[Sorting] checkPreviewNopick error:', error?.message || error);
      set({isLoadingInit: false, error: message});
      return {success: false, message};
    }
  },

  /**
   * Cari data nomor pick berdasarkan Tanggal Pick dan Nomor SP.
   */
  searchPreviewByTglAndSP: async (tglPic, noUrutSp) => {
    if (!tglPic || !noUrutSp) {
      return {success: false, message: 'Tanggal Pick dan Nomor SP tidak boleh kosong'};
    }

    set({isLoadingInit: true, error: null});
    try {
      const response = await sortingService.searchByTglAndSP(tglPic, noUrutSp);
      
      if (!response?.success || !response?.data || response.data.length === 0) {
        const msg = `Data tidak ditemukan untuk Tanggal Pick ${tglPic} dan Nomor SP ${noUrutSp}`;
        set({isLoadingInit: false, error: msg});
        return {success: false, message: msg};
      }

      set({isLoadingInit: false});
      return { success: true, data: response.data };
    } catch (error) {
      const message = parseError(error, 'Gagal memuat data berdasarkan Tanggal Pick dan Nomor SP');
      log.error('[Sorting] searchPreviewByTglAndSP error:', error?.message || error);
      set({isLoadingInit: false, error: message});
      return {success: false, message};
    }
  },

  // ===========================================================================
  // STEP 2: SCAN CONTAINER
  // Scan nomor dusno → update flag Y → refresh sortingData
  // ===========================================================================

  /**
   * Scan satu container/dusno.
   * @param {string} dusno - Nomor container yang discan
   * @returns {{ success: boolean, message?: string, data?: object }}
   */
  scanContainer: async dusno => {
    const {nopick} = get();
    if (!nopick) {
      return {success: false, message: 'Tidak ada proses sorting aktif'};
    }
    if (!dusno || dusno.trim() === '') {
      return {success: false, message: 'Nomor container tidak boleh kosong'};
    }

    set({isLoadingScan: true, error: null});
    try {
      const authUser = getAuthStore().getState().user;
      const username = authUser?.username || authUser?.name || 'SPS_USER';

      const response = await sortingService.scanContainer({
        nopick,
        dusno: dusno.trim(),
        user: username,
      });

      if (!response?.success) {
        const msg = response?.message || 'Container tidak ditemukan atau gagal diupdate';
        set({isLoadingScan: false, error: msg});
        return {success: false, message: msg};
      }

      // Jika backend mereturn data terbaru yang utuh, gunakan itu. 
      if (response.data && response.data.details) {
        set({sortingData: response.data});
      } else {
        // OPTIMISTIC UPDATE: Langsung update state lokal agar UI berubah instan
        const currentData = get().sortingData;
        if (currentData && currentData.details) {
          const newDetails = currentData.details.map(d => {
            const dNo = (d.dusno || d.DusNo || d.container_no || '').toString().trim();
            if (dNo === dusno.trim()) {
              return { ...d, scan_status: 'Y', scanned: true, is_scanned: true };
            }
            return d;
          });
          set({ sortingData: { ...currentData, details: newDetails } });
        }
        
        // Panggil refreshProgress di latar belakang untuk sync
        get().refreshProgress().catch(e => log.warn('Background sync failed:', e));
      }

      set({
        isLoadingScan: false,
        error: null,
      });

      log.info('[Sorting] Scan success for dusno:', dusno);
      return {success: true, data: response.data};
    } catch (error) {
      const message = parseError(error, 'Gagal melakukan scan container');
      log.error('[Sorting] scanContainer error:', error?.message || error);
      set({isLoadingScan: false, error: message});
      return {success: false, message};
    }
  },

  // ===========================================================================
  // STEP 3: COMPLETE PROCESS
  // Selesaikan proses sortasi untuk nopick aktif
  // ===========================================================================

  /**
   * Complete proses sortasi.
   * @returns {{ success: boolean, message?: string, data?: object }}
   */
  completeProcess: async () => {
    const {nopick} = get();
    if (!nopick) {
      return {success: false, message: 'Tidak ada proses sorting aktif'};
    }

    set({isCompleting: true, error: null});
    try {
      const authUser = getAuthStore().getState().user;
      const username = authUser?.username || authUser?.name || 'SPS_USER';

      const response = await sortingService.completeProcess({
        nopick,
        user: username,
      });

      if (!response?.success) {
        const msg = response?.message || 'Gagal menyelesaikan proses sorting';
        set({isCompleting: false, error: msg});
        return {success: false, message: msg};
      }

      // response.data dari completeProcess WMS hanya mereturn record header yang diupdate.
      // Jadi kita gabungkan (merge) ke dalam state lokal.
      const currentData = get().sortingData;
      set({
        sortingData: {
          ...currentData,
          header: response.data || currentData?.header,
        },
        isCompleting: false,
        error: null,
      });

      // Sinkronisasi data penuh di background (optional)
      get().refreshProgress().catch(e => log.warn('Complete background sync failed:', e));

      log.info('[Sorting] Complete success for nopick:', nopick);
      return {success: true, data: response.data};
    } catch (error) {
      const message = parseError(error, 'Gagal menyelesaikan proses sorting');
      log.error('[Sorting] completeProcess error:', error?.message || error);
      set({isCompleting: false, error: message});
      return {success: false, message};
    }
  },

  // ===========================================================================
  // REFRESH PROGRESS
  // ===========================================================================

  /**
   * Refresh progress terkini dari backend 2
   */
  refreshProgress: async () => {
    const {nopick} = get();
    if (!nopick) return;
    try {
      const response = await sortingService.getProgress(nopick);
      if (response?.success) {
        set({sortingData: response.data || get().sortingData});
      }
    } catch (error) {
      log.warn('[Sorting] refreshProgress error:', error?.message);
    }
  },

  // ===========================================================================
  // RESET
  // ===========================================================================

  resetSorting: () =>
    set({
      nopick: null,
      sortingData: null,
      isLoadingInit: false,
      isLoadingScan: false,
      isCompleting: false,
      error: null,
    }),

  resetError: () => set({error: null}),
}));

export default useSortingStore;
