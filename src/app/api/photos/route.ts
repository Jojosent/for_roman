import { NextRequest, NextResponse } from 'next/server';
import { getPhotos, savePhotos, shufflePhotos, deletePhoto, updatePhotoCaption, getConfig } from '@/lib/storage';

export const dynamic = 'force-dynamic';

function isAuthorized(req: NextRequest, currentPin: string): boolean {
  const authHeader = req.headers.get('Authorization');
  if (authHeader && authHeader.replace('Bearer ', '').trim() === currentPin.trim()) {
    return true;
  }
  const pinParam = req.nextUrl.searchParams.get('pin');
  if (pinParam && pinParam.trim() === currentPin.trim()) {
    return true;
  }
  return false;
}

// GET all photos (public so main page can load them)
export async function GET() {
  const photos = getPhotos();
  return NextResponse.json({ success: true, photos });
}

// POST actions: shuffle, reorder, update caption
export async function POST(req: NextRequest) {
  const config = getConfig();
  if (!isAuthorized(req, config.adminPin)) {
    return NextResponse.json({ error: 'Неверный PIN-код' }, { status: 401 });
  }

  try {
    const body = await req.json();

    if (body.action === 'shuffle') {
      const shuffled = shufflePhotos();
      return NextResponse.json({ success: true, photos: shuffled, message: 'Фотографии перемешаны!' });
    }

    if (body.action === 'reorder' && Array.isArray(body.photos)) {
      const saved = savePhotos(body.photos);
      return NextResponse.json({ success: true, photos: saved, message: 'Порядок сохранен!' });
    }

    if (body.action === 'updateCaption' && body.id && body.caption !== undefined) {
      const updated = updatePhotoCaption(body.id, body.caption);
      return NextResponse.json({ success: true, photos: updated, message: 'Подпись обновлена!' });
    }

    return NextResponse.json({ error: 'Неизвестное действие' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE a photo by ID
export async function DELETE(req: NextRequest) {
  const config = getConfig();
  if (!isAuthorized(req, config.adminPin)) {
    return NextResponse.json({ error: 'Неверный PIN-код' }, { status: 401 });
  }

  try {
    const id = req.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID фотографии не указан' }, { status: 400 });
    }

    const updated = deletePhoto(id);
    return NextResponse.json({ success: true, photos: updated, message: 'Фотография удалена!' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
