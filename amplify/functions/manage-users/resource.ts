import { defineFunction } from '@aws-amplify/backend';

/** Alta, baja, roles y estado de los usuarios del panel de administración (Cognito). */
export const manageUsers = defineFunction({
  name: 'manage-users',
  entry: './handler.ts',
  timeoutSeconds: 30,
});
