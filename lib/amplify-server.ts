import { createServerRunner } from '@aws-amplify/adapter-nextjs';
import { generateServerClientUsingReqRes } from '@aws-amplify/adapter-nextjs/data';
import type { Schema } from '@/amplify/data/resource';
import outputs from '@/amplify_outputs.json';

export const { runWithAmplifyServerContext } = createServerRunner({ config: outputs });

/** Cliente de sólo lectura (API key) para las páginas públicas; permite ISR. */
export const publicDataClient = generateServerClientUsingReqRes<Schema>({
  config: outputs,
  authMode: 'apiKey',
});
