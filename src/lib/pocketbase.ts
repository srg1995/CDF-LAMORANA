import PocketBase from 'pocketbase';

function getPocketBaseUrl(): string {
  const url = import.meta.env.PUBLIC_POCKETBASE_URL;

  if (!url) {
    // En desarrollo, usa localhost; en producción debe venir de la variable
    if (import.meta.env.DEV) {
      return 'http://127.0.0.1:8090';
    }
    throw new Error('PUBLIC_POCKETBASE_URL is not defined');
  }

  return url;
}

const pb = new PocketBase(getPocketBaseUrl());

export default pb;
