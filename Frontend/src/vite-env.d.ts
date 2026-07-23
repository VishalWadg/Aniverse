/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APPWRITE_URL?: string;
  readonly VITE_APPWRITE_PROJECT_ID?: string;
  readonly VITE_APPWRITE_DATABASE_ID?: string;
  readonly VITE_APPWRITE_COLLECTION_ID?: string;
  readonly VITE_APPWRITE_BUCKET_ID?: string;
  readonly VITE_BACKEND_URL?: string;
  readonly VITE_APP_VERSION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
