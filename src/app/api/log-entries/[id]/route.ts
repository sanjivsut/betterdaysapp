import { apiError, currentUserId, json } from '@/lib/api';
import { deleteEntry } from '@/lib/repo';

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await currentUserId();
  if (!userId) return apiError('Unauthorized', 401);
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) return apiError('Not found', 404);

  const ok = await deleteEntry(userId, id);
  return ok ? json({ ok: true }) : apiError('Not found', 404);
}
