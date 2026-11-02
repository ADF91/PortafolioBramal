import { defineFunction } from '@aws-amplify/backend';

/** Copia archivos externos (sitio anterior, /public) a la carpeta del proyecto en el bucket de medios. */
export const migrateMedia = defineFunction({
  name: 'migrate-media',
  entry: './handler.ts',
  timeoutSeconds: 300,
  memoryMB: 1024,
});
