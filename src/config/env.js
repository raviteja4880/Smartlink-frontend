/**
 * Frontend Environment Configuration & Loader
 * Validates and exposes environment variables via import.meta.env
 */

const getEnv = (key, defaultValue = '') => {
  const value = import.meta.env[key];
  if (value === undefined || value === '') {
    if (defaultValue !== '') return defaultValue;
    console.warn(`[Config Warning] Missing environment variable: ${key}. Please check your frontend/.env file.`);
  }
  return value || defaultValue;
};

export const env = {
  apiUrl: getEnv('VITE_API_URL', '/api'),
  backendUrl: getEnv('VITE_BACKEND_URL', 'http://localhost:4000'),
  appName: getEnv('VITE_APP_NAME', 'SmartLink AI'),
  enableAnalytics: getEnv('VITE_ENABLE_ANALYTICS', 'true') === 'true',
};

export default env;
