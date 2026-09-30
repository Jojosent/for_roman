import { AppConfig, DateSubmission } from './types';

export async function forwardToGoogleSheets(
  submission: DateSubmission,
  webhookUrl: string
): Promise<{ success: boolean; error?: string }> {
  if (!webhookUrl || !webhookUrl.startsWith('http')) {
    return { success: false, error: 'Webhook URL not set' };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        timestamp: submission.submittedAt,
        partnerName: submission.partnerName,
        selectedDate: submission.selectedDate,
        selectedTime: submission.selectedTime,
        selectedActivity: submission.selectedActivity,
        selectedFood: submission.selectedFood,
        customNotes: submission.customNotes || '',
        favoriteSong: submission.favoriteSong || '',
      }),
      // Apps Script redirects, follow them
      redirect: 'follow',
    });

    if (response.ok) {
      return { success: true };
    } else {
      const text = await response.text();
      return { success: false, error: `Google Sheets returned ${response.status}: ${text}` };
    }
  } catch (err: any) {
    console.error('Failed to forward to Google Sheets:', err);
    return { success: false, error: err.message || 'Network error' };
  }
}

export async function forwardToTelegram(
  submission: DateSubmission,
  botToken?: string,
  chatId?: string
): Promise<{ success: boolean; error?: string }> {
  if (!botToken || !chatId) {
    return { success: false, error: 'Telegram bot token or chat ID not set' };
  }

  const message = `✨ <b>Ура! Она подтвердила свидание!</b> ❤️\n\n` +
    `👤 <b>Для кого:</b> ${submission.partnerName}\n` +
    `📅 <b>Выбранная дата:</b> ${submission.selectedDate}\n` +
    `⏰ <b>Время:</b> ${submission.selectedTime}\n` +
    `📍 <b>Формат:</b> ${submission.selectedActivity}\n` +
    `🍽️ <b>Кухня/Еда:</b> ${submission.selectedFood}\n` +
    (submission.customNotes ? `💌 <b>Пожелания:</b> ${submission.customNotes}\n` : '') +
    (submission.favoriteSong ? `🎵 <b>Трек:</b> ${submission.favoriteSong}\n` : '') +
    `\n⏱ <i>Отправлено: ${new Date(submission.submittedAt).toLocaleString('ru-RU')}</i>`;

  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    const data = await response.json();
    return { success: data.ok, error: data.description };
  } catch (err: any) {
    console.error('Failed to send Telegram notification:', err);
    return { success: false, error: err.message };
  }
}
