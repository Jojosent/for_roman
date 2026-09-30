import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { addPhoto, getConfig } from '@/lib/storage';
import { PhotoItem } from '@/lib/types';

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

export async function POST(req: NextRequest) {
  const config = getConfig();
  if (!isAuthorized(req, config.adminPin)) {
    return NextResponse.json({ error: 'Неверный PIN-код' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const singleFile = formData.get('file') as File | null;
    const allFiles: File[] = files.length > 0 ? files : (singleFile ? [singleFile] : []);

    if (allFiles.length === 0) {
      return NextResponse.json({ error: 'Файлы не выбраны' }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), 'public', 'photos');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const addedPhotos: PhotoItem[] = [];

    for (const file of allFiles) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = path.extname(file.name) || '.jpg';
      const cleanBase = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 20);
      const uniqueName = `upload_${Date.now()}_${cleanBase}${ext}`;
      const filePath = path.join(uploadDir, uniqueName);

      fs.writeFileSync(filePath, buffer);

      const newPhoto: PhotoItem = {
        id: `photo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        src: `/photos/${uniqueName}`,
        caption: 'Наш прекрасный момент ✨',
        rotation: (Math.random() * 4 - 2),
      };

      addPhoto(newPhoto);
      addedPhotos.push(newPhoto);
    }

    return NextResponse.json({
      success: true,
      message: `Успешно загружено ${addedPhotos.length} фото!`,
      addedPhotos,
    });
  } catch (err: any) {
    console.error('Error uploading photos:', err);
    return NextResponse.json({ error: err.message || 'Ошибка загрузки файлов' }, { status: 500 });
  }
}
