import axios from 'axios';

/** Resolved base URL (VITE_API_URL without trailing slash, or localhost default). */
export const apiBaseUrl =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});
