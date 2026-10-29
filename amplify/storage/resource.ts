import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'bramalPortfolioMedia',
  access: (allow) => ({
    'projects/*': [
      allow.guest.to(['read']),
      allow.authenticated.to(['read']),
      allow.groups(['ADMINS']).to(['read', 'write', 'delete']),
    ],
  }),
});
