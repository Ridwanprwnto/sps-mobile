// src/store/authStore.js
import {create} from 'zustand';
import Config from 'react-native-config';
import {authService} from '../service';
import {Storage, log} from '../utils';

const TOKEN_KEY = Config.TOKEN_KEY;
const USER_KEY = Config.USER_KEY;

const useAuthStore = create((set, get) => ({
  // State
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isInitializing: true,
  isRefreshing: false,
  error: null,

  // Actions
  initialize: async () => {
    set({isInitializing: true});
    try {
      const token = await Storage.get(TOKEN_KEY);
      const user = await Storage.get(USER_KEY);
      if (token && user) {
        set({token, user, isAuthenticated: true});
        log.info('[Auth] Session restored for:', user.username);
      }
    } catch (error) {
      log.error('[Auth] Initialize error:', error);
    } finally {
      set({isInitializing: false});
    }
  },

  login: async (username, password) => {
    set({isLoading: true, error: null});
    try {
      const response = await authService.login(username, password);
      const {token, user} = response.data || response;

      await Storage.set(TOKEN_KEY, token);
      await Storage.set(USER_KEY, user);

      set({
        token,
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      log.info('[Auth] Login success:', user.username);
      return {success: true};
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Login gagal. Periksa username dan password Anda.';

      log.error('[Auth] Login error:', message);
      set({isLoading: false, error: message});
      return {success: false, message};
    }
  },

  logout: async () => {
    set({isLoading: true});
    try {
      await authService.logout();
    } catch (error) {
      log.warn('[Auth] Logout API error (ignored):', error.message);
    } finally {
      await Storage.remove(TOKEN_KEY);
      await Storage.remove(USER_KEY);
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      log.info('[Auth] Logged out');
    }
  },

  /**
   * Refresh token & update user data dari backend.
   * - Selalu update user data jika berhasil.
   * - Simpan token baru ke storage hanya jika response mengandung token.
   * - Return true jika sukses, false jika gagal (misal 401 = session habis).
   */
  refreshToken: async () => {
    const {isRefreshing, isAuthenticated} = get();

    if (isRefreshing || !isAuthenticated) {
      return isAuthenticated;
    }

    set({isRefreshing: true});
    try {
      const response = await authService.refreshToken();
      const {token, user} = response?.data || response || {};

      const updates = {isRefreshing: false};

      if (user) {
        updates.user = user;
        await Storage.set(USER_KEY, user);
        log.debug('[Auth] User data updated from refreshToken');
      }

      if (token) {
        updates.token = token;
        await Storage.set(TOKEN_KEY, token);
        log.debug('[Auth] Token refreshed successfully');
      }

      set(updates);
      return true;
    } catch (error) {
      set({isRefreshing: false});
      const status = error?.response?.status;
      if (status === 401 || status === 403) {
        log.warn('[Auth] Session expired, forcing logout');
        await get().logout();
        return false;
      }
      log.warn('[Auth] refreshToken error (non-fatal):', error?.message);
      return true;
    }
  },

  clearError: () => set({error: null}),

  getUser: () => get().user,
  getToken: () => get().token,
}));

export default useAuthStore;
