// src/utils/logger.ts

const logger = {
  error: (message: string, error: unknown) => {
    console.error(`[ERROR]: ${message}`);
  },
  info: (message: string) => {
    console.log(`[INFO]: ${message}`);
  },
  warn: (message: string) => {
    console.warn(`[WARN]: ${message}`);
  },
};

export default logger;
