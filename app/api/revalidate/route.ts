import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { fetchAuthSession } from 'aws-amplify/auth/server';
import { runWithAmplifyServerContext } from '@/lib/amplify-server';

export async function POST() {
  const isAdmin = await runWithAmplifyServerContext({
    nextServerContext: { cookies },
    operation: async (ctx) => {
      try {
        const session = await fetchAuthSession(ctx);
        const groups = session.tokens?.accessToken.payload['cognito:groups'];
        return Array.isArray(groups) && groups.includes('ADMINS');
      } catch {
        return false;
      }
    },
  });

  if (!isAdmin) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  revalidatePath('/', 'layout');
  return NextResponse.json({ ok: true });
}
