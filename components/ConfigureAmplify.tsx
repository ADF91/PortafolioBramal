'use client';

import { Amplify } from 'aws-amplify';
import outputs from '@/amplify_outputs.json';

// ssr: true guarda la sesión en cookies para que el servidor pueda validar al administrador.
Amplify.configure(outputs, { ssr: true });

export default function ConfigureAmplify() {
  return null;
}
