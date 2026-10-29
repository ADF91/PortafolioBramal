import { defineAuth } from '@aws-amplify/backend';

/**
 * Login con email. Sólo los usuarios del grupo ADMINS pueden administrar
 * el portafolio. El auto-registro se deshabilita en backend.ts: los
 * administradores se crean desde la consola de Amplify / Cognito.
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  groups: ['ADMINS'],
});
