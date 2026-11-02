import { defineStorage } from '@aws-amplify/backend';

/**
 * Un directorio por proyecto: proyectos/<slug>/{videos,imagenes,fichas}/<archivo>.
 * La función migrate-media recibe permisos de escritura en backend.ts.
 */
export const storage = defineStorage({
  name: 'bramalPortfolioMedia',
  access: (allow) => ({
    'proyectos/*': [
      allow.guest.to(['read']),
      allow.authenticated.to(['read']),
      allow.groups(['ADMINS', 'EDITORS']).to(['read', 'write', 'delete']),
    ],
  }),
});
