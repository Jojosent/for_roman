import { NextRequest, NextResponse } from 'next/server';
import { getConfig } from '@/lib/storage';
import { forwardToGoogleSheets, forwardToTelegram } from '@/lib/integrations';
import { DateSubmission } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { target, webhookUrl, botToken, chatId } = await req.json();
    const config = getConfig();

    const sampleSubmission: DateSubmission = {
      id: 'test_' + Date.now(),
      partnerName: config.partnerName + ' (Тест)',
      selectedDate: 'Тестовая дата: Пятница, 18 октября',
      selectedTime: '19:30',
      selectedActivity: 'Романтический ужин при свечах 🕯️',
      selectedFood: 'Итальянская паста и десерт 🍰',
      customNotes: 'Это тестовое сообщение для проверки связи!',
      favoriteSong: 'Ed Sheeran - Perfect',
      submittedAt: new Date().toISOString(),
    };

    if (target === 'google') {
      const urlToUse = webhookUrl || config.googleSheetsWebhook;
      if (!urlToUse) {
        return NextResponse.json({ success: false, error: 'URL Google Webhook не указан' }, { status: 400 });
      }
      const result = await forwardToGoogleSheets(sampleSubmission, urlToUse);
      return NextResponse.json(result);
    }

    if (target === 'telegram') {
      const token = botToken || config.telegramBotToken;
      const chat = chatId || config.telegramChatId;
      if (!token || !chat) {
        return NextResponse.json({ success: false, error: 'Telegram Bot Token или Chat ID не указан' }, { status: 400 });
      }
      const result = await forwardToTelegram(sampleSubmission, token, chat);
      return NextResponse.json(result);
    }

    return NextResponse.json({ success: false, error: 'Неизвестная цель тестирования' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
