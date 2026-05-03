declare module '*.png';
declare module '*.svg';
declare module '*.jpeg';
declare module '*.jpg';

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_API_URL_SECURITY: string;
  readonly VITE_SOCKET_URL: string;
  // Agrega aquí otras variables de entorno que necesites
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
