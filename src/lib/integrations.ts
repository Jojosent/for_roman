import { AppConfig, DateSubmission } from './types';

export async function forwardToGoogleSheets(
  submission: DateSubmission,
  webhookUrl: string
): Promise<{ success: boolean; error?: string }> {
  if (!webhookUrl || !webhookUrl.startsWith('http')) {
    return { success: false, error: 'URL вебхука не указан или некорректен' };
  }

  try {
    const payload = {
      timestamp: submission.submittedAt,
      partnerName: submission.partnerName,
      selectedDate: submission.selectedDate,
      selectedTime: submission.selectedTime,
      selectedActivity: submission.selectedActivity,
      selectedFood: submission.selectedFood,
      customNotes: submission.customNotes || '',
      favoriteSong: submission.favoriteSong || '',
    };

    // Build URL with query params as fallback in case 302 redirect drops POST body
    const urlObj = new URL(webhookUrl);
    Object.entries(payload).forEach(([key, value]) => {
      urlObj.searchParams.set(key, String(value));
    });

    // Send request with both URL params and body (text/plain to prevent CORS preflight & body drops)
    const response = await fetch(urlObj.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
      redirect: 'follow',
    });

    if (response.status === 401) {
      return {
        success: false,
        error: 'Ошибка 401: в Google Apps Script в поле «Кто имеет доступ» (Who has access) выбрано «Только я». Нужно выбрать «Все» (Anyone) и сделать новое развертывание!',
      };
    }

    if (response.ok) {
      const text = await response.text();
      // Google sometimes returns HTML login page even with 200 if redirected
      if (text.includes('accounts.google.com') || text.includes('ServiceLogin')) {
        return {
          success: false,
          error: 'Google требует вход в аккаунт! В развертывании Apps Script в пункте «Кто имеет доступ» обязательно выберите «Все» (Anyone).',
        };
      }
      return { success: true };
    } else {
      const text = await response.text();
      return { success: false, error: `Google вернул код ${response.status}: ${text.substring(0, 100)}` };
    }
  } catch (err: any) {
    console.error('Failed to forward to Google Sheets:', err);
    return { success: false, error: err.message || 'Ошибка сети' };
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
