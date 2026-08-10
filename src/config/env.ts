export const MOBILE_CONFIG = {
  // Use LAN IP address for physical device / wireless debugging, fallback to localhost for emulators
  API_BASE_URL: 'http://192.168.1.9:5000/api/v1',
  FALLBACK_API_BASE_URL: 'http://localhost:5000/api/v1',
  TIMEOUT_MS: 10000,
  ENABLE_OFFLINE_CACHE: true,
} as const;
