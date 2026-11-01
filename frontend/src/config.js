const DEFAULT_API_URL = 'https://micro-project-ug85.onrender.com';

export function getDefaultBackendUrl() {
  const configuredUrl = import.meta.env.VITE_API_URL;
  return (configuredUrl || DEFAULT_API_URL).trim().replace(/\/$/, '');
}

export { DEFAULT_API_URL };
