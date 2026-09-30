import { NextRequest, NextResponse } from 'next/server';
import { addSubmission, getConfig } from '@/lib/storage';
import { forwardToGoogleSheets, forwardToTelegram } from '@/lib/integrations';
import { DateSubmission } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const config = getConfig();

    const submission: DateSubmission = {
      id: 'sub_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      partnerName: config.partnerName,
      selectedDate: body.selectedDate || 'Не указана',
      selectedTime: body.selectedTime || 'Не указано',
      selectedActivity: body.selectedActivity || 'Любое',
      selectedFood: body.selectedFood || 'Любое',
      customNotes: body.customNotes || '',
      favoriteSong: body.favoriteSong || '',
      submittedAt: new Date().toISOString(),
    };

    // Forward to Google Sheets if configured
    if (config.googleSheetsWebhook) {
      const gRes = await forwardToGoogleSheets(submission, config.googleSheetsWebhook);
      submission.syncedToGoogle = gRes.success;
    }

    // Forward to Telegram if configured
    if (config.telegramBotToken && config.telegramChatId) {
      const tRes = await forwardToTelegram(submission, config.telegramBotToken, config.telegramChatId);
      submission.syncedToTelegram = tRes.success;
    }

    // Save locally/memory
    addSubmission(submission);

    return NextResponse.json({
      success: true,
      message: 'Свидание успешно подтверждено! ❤️',
      submission,
    });
  } catch (err: any) {
    console.error('Error submitting date:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
