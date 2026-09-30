'use client';

import React, { useState, useEffect } from 'react';
import {
  Lock,
  KeyRound,
  Calendar,
  Clock,
  FileSpreadsheet,
  Send,
  Trash2,
  Plus,
  Save,
  CheckCircle,
  AlertCircle,
  Copy,
  ExternalLink,
  Heart,
  Settings,
  ListOrdered
} from 'lucide-react';
import { AppConfig, DateSubmission, DEFAULT_CONFIG } from '@/lib/types';

export default function AdminPage() {
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);

  // Admin Data
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [submissions, setSubmissions] = useState<DateSubmission[]>([]);
  const [activeTab, setActiveTab] = useState<'datetime' | 'google' | 'answers' | 'settings'>('datetime');

  // New Date / Time inputs
  const [newDateInput, setNewDateInput] = useState('');
  const [newTimeInput, setNewTimeInput] = useState('');

  // Status banners
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [testingGoogle, setTestingGoogle] = useState(false);
  const [testingTelegram, setTestingTelegram] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  // Check saved PIN in localStorage on mount
  useEffect(() => {
    const savedPin = localStorage.getItem('admin_pin');
    if (savedPin) {
      setPin(savedPin);
      fetchAdminData(savedPin);
    }
  }, []);

  const fetchAdminData = async (pinToUse: string) => {
    setLoading(true);
    setAuthError('');
    try {
      const res = await fetch(`/api/admin?pin=${encodeURIComponent(pinToUse)}`);
      if (res.ok) {
        const data = await res.json();
        setConfig(data.config);
        setSubmissions(data.submissions || []);
        setIsAuthenticated(true);
        localStorage.setItem('admin_pin', pinToUse);
      } else {
        setIsAuthenticated(false);
        setAuthError('Неверный PIN-код. Попробуйте еще раз.');
      }
    } catch {
      setIsAuthenticated(false);
      setAuthError('Ошибка подключения к серверу.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin) return;
    fetchAdminData(pin);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin_pin');
    setPin('');
  };

  const handleSaveConfig = async (newConfigData?: Partial<AppConfig>) => {
    const dataToSave = newConfigData ? { ...config, ...newConfigData } : config;
    setLoading(true);
    setSaveSuccess(false);
    try {
      const res = await fetch(`/api/admin?pin=${encodeURIComponent(pin)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave),
      });
      if (res.ok) {
        const data = await res.json();
        setConfig(data.config);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      alert('Ошибка при сохранении конфигурации');
    } finally {
      setLoading(false);
    }
  };

  // Add Date
  const handleAddDate = () => {
    if (!newDateInput.trim()) return;
    const updated = [...config.availableDates, newDateInput.trim()];
    const newConfig = { ...config, availableDates: updated };
    setConfig(newConfig);
    setNewDateInput('');
    handleSaveConfig(newConfig);
  };

  // Remove Date
  const handleRemoveDate = (index: number) => {
    const updated = config.availableDates.filter((_, i) => i !== index);
    const newConfig = { ...config, availableDates: updated };
    setConfig(newConfig);
    handleSaveConfig(newConfig);
  };

  // Add Time
  const handleAddTime = () => {
    if (!newTimeInput.trim()) return;
    const updated = [...config.availableTimes, newTimeInput.trim()];
    const newConfig = { ...config, availableTimes: updated };
    setConfig(newConfig);
    setNewTimeInput('');
    handleSaveConfig(newConfig);
  };

  // Remove Time
  const handleRemoveTime = (index: number) => {
    const updated = config.availableTimes.filter((_, i) => i !== index);
    const newConfig = { ...config, availableTimes: updated };
    setConfig(newConfig);
    handleSaveConfig(newConfig);
  };

  // Clear Submissions
  const handleClearSubmissions = async () => {
    if (!confirm('Вы уверены, что хотите очистить список полученных ответов?')) return;
    try {
      await fetch(`/api/admin?pin=${encodeURIComponent(pin)}`, { method: 'DELETE' });
      setSubmissions([]);
    } catch {
      alert('Ошибка при очистке ответов');
    }
  };

  // Test Webhooks
  const handleTestWebhook = async (target: 'google' | 'telegram') => {
    if (target === 'google') setTestingGoogle(true);
    if (target === 'telegram') setTestingTelegram(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/admin/test-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target,
          webhookUrl: config.googleSheetsWebhook,
          botToken: config.telegramBotToken,
          chatId: config.telegramChatId,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message: target === 'google'
            ? '✅ Тестовая строка успешно добавлена в Google Таблицу!'
            : '✅ Тестовое сообщение успешно отправлено в Telegram!',
        });
      } else {
        setTestResult({
          success: false,
          message: `❌ Ошибка: ${data.error || 'Не удалось отправить'}`,
        });
      }
    } catch (err: any) {
      setTestResult({ success: false, message: `❌ Сетевая ошибка: ${err.message}` });
    } finally {
      setTestingGoogle(false);
      setTestingTelegram(false);
    }
  };

  const googleAppsScriptCode = `// Google Apps Script для автоматической записи ответов девушки в таблицу
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  
  // Добавляем новую строку со всеми выборами
  sheet.appendRow([
    new Date(),
    data.partnerName || 'Девушка',
    data.selectedDate || '',
    data.selectedTime || '',
    data.selectedActivity || '',
    data.selectedFood || '',
    data.customNotes || '',
    data.favoriteSong || ''
  ]);
  
  return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}`;

  const copyScriptToClipboard = () => {
    navigator.clipboard.writeText(googleAppsScriptCode);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 3000);
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-500/30">
            <Lock className="w-8 h-8" />
          </div>

          <h1 className="text-2xl font-bold text-center text-white mb-2">
            Панель управления свиданием
          </h1>
          <p className="text-sm text-slate-400 text-center mb-6">
            Введите PIN-код для доступа к настройкам дат и просмотру ответов.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2">
                PIN-код администратора
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="По умолчанию: 2024"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono text-center tracking-widest text-lg"
                  autoFocus
                />
                <KeyRound className="w-5 h-5 text-slate-500 absolute right-3 top-3.5" />
              </div>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2"
            >
              {loading ? 'Проверка...' : 'Войти в панель'}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Подсказка: стандартный PIN-код — <b>2024</b> (его можно изменить внутри)
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 backdrop-blur-md p-6 rounded-3xl border border-slate-800 shadow-xl">
          <div>
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-widest mb-1">
              <Settings className="w-4 h-4" />
              <span>Секретная админка /admin</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Настройки свидания
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Управляй доступными датами, временем и получай ответы девушки в Google Таблицы
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Открыть сайт</span>
            </a>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-medium rounded-xl border border-rose-500/30 transition-colors"
            >
              Выйти
            </button>
          </div>
        </div>

        {/* Save confirmation toast */}
        {saveSuccess && (
          <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-emerald-300 text-sm flex items-center gap-2 animate-fadeIn">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span>Настройки успешно сохранены! Изменения сразу видны на сайте.</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('datetime')}
            className={`px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm flex items-center gap-2 transition-all ${
              activeTab === 'datetime'
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Даты и Время</span>
          </button>

          <button
            onClick={() => setActiveTab('google')}
            className={`px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm flex items-center gap-2 transition-all ${
              activeTab === 'google'
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Google Таблицы / Webhook</span>
          </button>

          <button
            onClick={() => setActiveTab('answers')}
            className={`px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm flex items-center gap-2 transition-all ${
              activeTab === 'answers'
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ListOrdered className="w-4 h-4" />
            <span>Ответы девушки ({submissions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm flex items-center gap-2 transition-all ${
              activeTab === 'settings'
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Тексты и Telegram</span>
          </button>
        </div>

        {/* TAB 1: DATES AND TIMES */}
        {activeTab === 'datetime' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Dates Card */}
            <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2.5 text-rose-400 font-bold text-base">
                <Calendar className="w-5 h-5" />
                <span>Доступные даты для встречи</span>
              </div>
              <p className="text-xs text-slate-400">
                Девушка увидит эти варианты в качестве кнопок выбора даты на сайте:
              </p>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {config.availableDates.map((dateStr, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-slate-800/80 rounded-xl border border-slate-700/60"
                  >
                    <span className="text-sm font-medium text-slate-200">{dateStr}</span>
                    <button
                      onClick={() => handleRemoveDate(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-700 transition-colors"
                      title="Удалить дату"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex gap-2">
                <input
                  type="text"
                  placeholder="Например: Суббота, 19 октября"
                  value={newDateInput}
                  onChange={(e) => setNewDateInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddDate()}
                  className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <button
                  onClick={handleAddDate}
                  className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Добавить</span>
                </button>
              </div>
            </div>

            {/* Times Card */}
            <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2.5 text-rose-400 font-bold text-base">
                <Clock className="w-5 h-5" />
                <span>Доступное время</span>
              </div>
              <p className="text-xs text-slate-400">
                Слоты времени, между которыми она сможет выбрать:
              </p>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {config.availableTimes.map((timeStr, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-slate-800/80 rounded-xl border border-slate-700/60"
                  >
                    <span className="text-sm font-medium text-slate-200">{timeStr}</span>
                    <button
                      onClick={() => handleRemoveTime(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-700 transition-colors"
                      title="Удалить время"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex gap-2">
                <input
                  type="text"
                  placeholder="Например: 19:30 или 20:00"
                  value={newTimeInput}
                  onChange={(e) => setNewTimeInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTime()}
                  className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <button
                  onClick={handleAddTime}
                  className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Добавить</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: GOOGLE SHEETS / DOCS WEBHOOK */}
        {activeTab === 'google' && (
          <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
            <div>
              <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-widest mb-1">
                <FileSpreadsheet className="w-4 h-4" />
                <span>Google Таблицы / Google Документы</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Подключение Google Таблицы для получения ответов
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Каждый раз, когда девушка выбирает день, время и место, новая строка мгновенно появляется в вашей личной Google Таблице!
              </p>
            </div>

            {/* Webhook input */}
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-wider font-semibold text-slate-300">
                URL вебхука Google Apps Script
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="url"
                  placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                  value={config.googleSheetsWebhook}
                  onChange={(e) => setConfig({ ...config, googleSheetsWebhook: e.target.value })}
                  className="flex-1 px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono text-xs"
                />
                <button
                  onClick={() => handleSaveConfig()}
                  className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl text-sm transition-colors shrink-0"
                >
                  Сохранить URL
                </button>
              </div>
            </div>

            {/* Test button */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => handleTestWebhook('google')}
                disabled={testingGoogle || !config.googleSheetsWebhook}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {testingGoogle ? 'Отправка...' : '⚡ Отправить тестовую запись в таблицу'}
              </button>

              {testResult && (
                <span className={`text-xs font-medium ${testResult.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {testResult.message}
                </span>
              )}
            </div>

            {/* Quick 4-Step Instructions */}
            <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Инструкция по настройке Google Таблицы за 1 минуту:</span>
              </h3>

              <ol className="list-decimal list-inside space-y-2 text-xs text-slate-300 leading-relaxed">
                <li>
                  Создайте новую таблицу на{' '}
                  <a
                    href="https://sheets.new"
                    target="_blank"
                    rel="noreferrer"
                    className="text-rose-400 underline"
                  >
                    sheets.new
                  </a>{' '}
                  (или откройте любую существующую).
                </li>
                <li>В верхнем меню нажмите <b>Расширения (Extensions)</b> → <b>Apps Script</b>.</li>
                <li>Удалите стандартный код и вставьте скрипт, приведенный ниже:</li>
              </ol>

              {/* Code snippet with copy button */}
              <div className="relative">
                <pre className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto">
                  {googleAppsScriptCode}
                </pre>
                <button
                  onClick={copyScriptToClipboard}
                  className="absolute top-2 right-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedScript ? 'Скопировано!' : 'Скопировать код'}</span>
                </button>
              </div>

              <ol start={4} className="list-decimal list-inside space-y-2 text-xs text-slate-300 leading-relaxed">
                <li>
                  В правом верхнем углу Apps Script нажмите <b>Развернуть (Deploy)</b> → <b>Новое развертывание (New deployment)</b>.
                </li>
                <li>Выберите тип: <b>Веб-приложение (Web app)</b>.</li>
                <li>
                  Установите доступ: <b>Кто имеет доступ (Who has access) → Все (Anyone)</b>.
                </li>
                <li>
                  Нажмите <b>Развернуть</b>, скопируйте полученный <b>URL веб-приложения</b> и вставьте в поле выше!
                </li>
              </ol>
            </div>
          </div>
        )}

        {/* TAB 3: HER RESPONSES */}
        {activeTab === 'answers' && (
          <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Ответы и пожелания девушки
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Здесь сохраняются все выборы, сделанные на сайте (даже если Google Таблица еще не подключена)
                </p>
              </div>

              {submissions.length > 0 && (
                <button
                  onClick={handleClearSubmissions}
                  className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold rounded-xl border border-rose-500/30 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Очистить историю</span>
                </button>
              )}
            </div>

            {submissions.length === 0 ? (
              <div className="p-12 text-center bg-slate-950/60 rounded-2xl border border-slate-800">
                <Heart className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-300">Пока нет ответов</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Когда девушка заполнит приглашение и выберет дату, её выбор моментально отобразится здесь.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {submissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="font-bold text-white text-base">{sub.partnerName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span>{new Date(sub.submittedAt).toLocaleString('ru-RU')}</span>
                        {sub.syncedToGoogle && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            В Google Таблице ✓
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-slate-400 block mb-0.5">📅 Выбранная дата:</span>
                        <span className="font-bold text-white text-sm">{sub.selectedDate}</span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-slate-400 block mb-0.5">⏰ Время встречи:</span>
                        <span className="font-bold text-white text-sm">{sub.selectedTime}</span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-slate-400 block mb-0.5">📍 Программа:</span>
                        <span className="font-bold text-white text-sm">{sub.selectedActivity}</span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-slate-400 block mb-0.5">🍽️ Еда:</span>
                        <span className="font-bold text-white text-sm">{sub.selectedFood}</span>
                      </div>
                    </div>

                    {sub.favoriteSong && (
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                        <span className="text-slate-400">🎵 Любимый трек: </span>
                        <span className="font-semibold text-rose-300">{sub.favoriteSong}</span>
                      </div>
                    )}

                    {sub.customNotes && (
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                        <span className="text-slate-400">💌 Пожелания: </span>
                        <span className="text-slate-200">{sub.customNotes}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: PERSONALIZATION & TELEGRAM */}
        {activeTab === 'settings' && (
          <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Персонализация и уведомления
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Partner Name & Letter texts */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-slate-300 mb-1.5">
                    Как зовут девушку (или ласковое обращение)
                  </label>
                  <input
                    type="text"
                    value={config.partnerName}
                    onChange={(e) => setConfig({ ...config, partnerName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-slate-300 mb-1.5">
                    Заголовок в письме
                  </label>
                  <input
                    type="text"
                    value={config.letterGreeting}
                    onChange={(e) => setConfig({ ...config, letterGreeting: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-slate-300 mb-1.5">
                    Текст письма в конверте
                  </label>
                  <textarea
                    rows={4}
                    value={config.letterBody}
                    onChange={(e) => setConfig({ ...config, letterBody: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-slate-300 mb-1.5">
                    Новый PIN-код администратора
                  </label>
                  <input
                    type="text"
                    value={config.adminPin}
                    onChange={(e) => setConfig({ ...config, adminPin: e.target.value })}
                    placeholder="Например: 7777"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
                  />
                </div>
              </div>

              {/* Telegram Instant Alerts (Optional) */}
              <div className="space-y-4 p-5 bg-slate-950 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
                  <Send className="w-4 h-4" />
                  <span>Мгновенные уведомления в Telegram (Опционально)</span>
                </div>
                <p className="text-xs text-slate-400">
                  Хотите сразу получать уведомление в Telegram, когда она выберет дату? Укажите токен бота и свой Chat ID.
                </p>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-400 mb-1">
                    Telegram Bot Token
                  </label>
                  <input
                    type="text"
                    placeholder="123456789:ABCdefGHIjklMNOpqr..."
                    value={config.telegramBotToken || ''}
                    onChange={(e) => setConfig({ ...config, telegramBotToken: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-400 mb-1">
                    Telegram Chat ID
                  </label>
                  <input
                    type="text"
                    placeholder="Например: 987654321"
                    value={config.telegramChatId || ''}
                    onChange={(e) => setConfig({ ...config, telegramChatId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleTestWebhook('telegram')}
                  disabled={testingTelegram || !config.telegramBotToken || !config.telegramChatId}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {testingTelegram ? 'Отправка...' : '⚡ Проверить сообщение в Telegram'}
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => handleSaveConfig()}
                className="px-8 py-3.5 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-rose-500/25 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Сохранить все настройки</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
