// src/utils/logger.js
import {logger, consoleTransport} from 'react-native-logs';

const config = {
  levels: {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  },
  severity: __DEV__ ? 'debug' : 'warn',
  transport: consoleTransport,
  transportOptions: {
    colors: {
      debug: 'white',
      info: 'blueBright',
      warn: 'yellowBright',
      error: 'redBright',
    },
  },
  async: true,
  dateFormat: 'time',
  printDate: true,
  enabled: true,
};

export const log = logger.createLogger(config);

export default log;
