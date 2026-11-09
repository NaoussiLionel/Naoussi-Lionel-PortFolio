import { isAdmin } from '@/lib/auth';
import { deleteMessage, hasDatabase, setMessageRead } from '@/lib/db';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  if (!hasDatabase()) return Response.json({ error: 'Database not connected' }, { status: 503 });
  try {
    const body = await req.json();
    const read = body?.read !== false;
    await setMessageRead((await params).id, read);
    return Response.json({ ok: true, read });
  } catch {
    return Response.json({ error: 'Unable to update message' }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  if (!hasDatabase()) return Response.json({ error: 'Database not connected' }, { status: 503 });
  try {
    await deleteMessage((await params).id);
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: 'Unable to delete message' }, { status: 400 });
  }
}
