// src/utils/helpers.js

/**
 * Format date to readable string
 * @param {string|Date} date
 * @param {string} format - 'short' | 'long' | 'time' | 'datetime'
 */
export const formatDate = (date, format = 'short') => {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';

  const options = {
    short: {day: '2-digit', month: '2-digit', year: 'numeric'},
    long: {day: 'numeric', month: 'long', year: 'numeric'},
    time: {hour: '2-digit', minute: '2-digit'},
    datetime: {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
  };

  return d.toLocaleDateString('id-ID', options[format] || options.short);
};

/**
 * Validate required fields
 * @param {object} data
 * @param {string[]} fields
 */
export const validateRequired = (data, fields) => {
  const errors = {};
  fields.forEach(field => {
    if (!data[field] || String(data[field]).trim() === '') {
      errors[field] = `${field} wajib diisi`;
    }
  });
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Debounce function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Truncate text
 */
export const truncateText = (text, maxLength = 30) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Get scan status config (Y/N flag)
 * @param {'Y'|'N'} status
 */
export const getScanStatusConfig = status => {
  const configs = {
    Y: {label: 'Terscan', color: '#06D6A0', bg: '#E6FFF7', icon: 'check-circle'},
    N: {label: 'Belum Scan', color: '#94A3B8', bg: '#F1F5F9', icon: 'circle-outline'},
  };
  return configs[status] || {label: status, color: '#64748B', bg: '#F1F5F9', icon: 'circle-outline'};
};

/**
 * Get sort process status config
 * @param {'pending'|'in_progress'|'completed'} status
 */
export const getSortStatusConfig = status => {
  const configs = {
    pending: {label: 'Menunggu', color: '#FFB703', bg: '#FFF8E7'},
    in_progress: {label: 'Proses', color: '#118AB2', bg: '#E8F7FC'},
    completed: {label: 'Selesai', color: '#06D6A0', bg: '#E6FFF7'},
  };
  return configs[status] || {label: status, color: '#64748B', bg: '#F1F5F9'};
};

/**
 * Calculate scan progress percentage
 * @param {number} scanned
 * @param {number} total
 */
export const calcProgress = (scanned, total) => {
  if (!total || total === 0) return 0;
  return Math.round((scanned / total) * 100);
};
