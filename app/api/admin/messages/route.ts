import { isAdmin } from '@/lib/auth';
import { getMessages, hasDatabase, markAllMessagesRead } from '@/lib/db';

export async function GET() {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  // Demo mode: no database means no inbox yet — return an empty list, not an error.
  if (!hasDatabase()) return Response.json({ messages: [] });
  try {
    return Response.json({ messages: await getMessages() });
  } catch {
    return Response.json({ error: 'Database unavailable' }, { status: 503 });
  }
}

export async function PATCH(req: Request) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  if (!hasDatabase()) return Response.json({ error: 'Database not connected' }, { status: 503 });
  try {
    const body = await req.json();
    const read = body?.read !== false;
    await markAllMessagesRead(read);
    return Response.json({ ok: true, read });
  } catch {
    return Response.json({ error: 'Unable to update messages' }, { status: 400 });
  }
}
