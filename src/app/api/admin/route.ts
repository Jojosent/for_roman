import { NextRequest, NextResponse } from 'next/server';
import { getConfig, saveConfig, getSubmissions, clearSubmissions } from '@/lib/storage';

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

export async function GET(req: NextRequest) {
  const config = getConfig();
  if (!isAuthorized(req, config.adminPin)) {
    return NextResponse.json({ error: 'Неверный PIN-код' }, { status: 401 });
  }

  const submissions = getSubmissions();
  return NextResponse.json({ config, submissions });
}

export async function POST(req: NextRequest) {
  const config = getConfig();
  if (!isAuthorized(req, config.adminPin)) {
    return NextResponse.json({ error: 'Неверный PIN-код' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const updated = saveConfig(body);
    return NextResponse.json({ success: true, config: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const config = getConfig();
  if (!isAuthorized(req, config.adminPin)) {
    return NextResponse.json({ error: 'Неверный PIN-код' }, { status: 401 });
  }

  clearSubmissions();
  return NextResponse.json({ success: true, message: 'Ответы очищены' });
}
