import { defineAuth } from '@aws-amplify/backend';

/**
 * Login con email. Roles del panel de administración:
 * - ADMINS: gestionan contenido y usuarios.
 * - EDITORS: crean, editan y eliminan proyectos, videos e imágenes.
 * El auto-registro se deshabilita en backend.ts: los usuarios se crean desde /admin/usuarios
 * (el primer administrador, desde la consola de Amplify / Cognito).
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  groups: ['ADMINS', 'EDITORS'],
});
