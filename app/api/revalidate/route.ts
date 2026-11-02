import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { fetchAuthSession } from 'aws-amplify/auth/server';
import { runWithAmplifyServerContext } from '@/lib/amplify-server';

export async function POST() {
  const canEdit = await runWithAmplifyServerContext({
    nextServerContext: { cookies },
    operation: async (ctx) => {
      try {
        const session = await fetchAuthSession(ctx);
        const groups = session.tokens?.accessToken.payload['cognito:groups'];
        return Array.isArray(groups) && (groups.includes('ADMINS') || groups.includes('EDITORS'));
      } catch {
        return false;
      }
    },
  });

  if (!canEdit) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  revalidatePath('/', 'layout');
  return NextResponse.json({ ok: true });
}
