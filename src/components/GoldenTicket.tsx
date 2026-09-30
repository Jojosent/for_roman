'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Heart, Sparkles, CheckCircle2, Share2, Copy, Send, Calendar, Clock, MapPin, Utensils, Music } from 'lucide-react';
import { DateSubmission } from '@/lib/types';
import { playCelebrationSound } from './AmbientSound';

interface GoldenTicketProps {
  submission: DateSubmission;
}

export default function GoldenTicket({ submission }: GoldenTicketProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    playCelebrationSound();
    confetti({
      particleCount: 120,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#f43f5e', '#ec4899', '#fde047', '#e11d48', '#fb7185'],
    });
  }, []);

  const shareText = `✨ Привет! Я заполнила приглашение на свидание ❤️\n\n` +
    `📅 Дата: ${submission.selectedDate}\n` +
    `⏰ Время: ${submission.selectedTime}\n` +
    `📍 План: ${submission.selectedActivity}\n` +
    `🍽️ Еда: ${submission.selectedFood}\n` +
    (submission.favoriteSong ? `🎵 Трек: ${submission.favoriteSong}\n` : '') +
    (submission.customNotes ? `💌 Пожелание: ${submission.customNotes}\n` : '') +
    `\nОчень жду нашей встречи! 🥰`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(window.location.origin)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-8 flex flex-col items-center">
      {/* Top Banner */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center mb-6"
      >
        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-lg shadow-rose-200 mb-3 animate-heartbeat">
          <Heart className="w-8 h-8 fill-white" />
        </div>
        <span className="text-xs uppercase tracking-widest text-rose-500 font-bold">
          Всё официально подтверждено!
        </span>
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-rose-950 mt-1">
          Это будет незабываемо ✨
        </h2>
        <p className="text-rose-700/80 text-sm mt-1">
          Я уже получил твои пожелания и считаю минуты до нашей встречи!
        </p>
      </motion.div>

      {/* The VIP Golden Date Ticket */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full bg-gradient-to-b from-amber-50/90 via-rose-50/80 to-white/95 rounded-3xl p-6 sm:p-8 border-2 border-amber-300 shadow-2xl relative overflow-hidden backdrop-blur-md"
      >
        {/* Ticket Header */}
        <div className="flex items-center justify-between border-b border-amber-200/80 pb-4 mb-5">
          <div>
            <div className="flex items-center gap-1.5 text-amber-700 font-bold text-xs uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>VIP Invitation Pass</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-rose-950 mt-0.5">
              Билет на идеальное свидание
            </h3>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono font-semibold text-rose-400 bg-rose-100/60 px-2.5 py-1 rounded-full border border-rose-200">
              #DATE-LOVE-2024
            </span>
          </div>
        </div>

        {/* Ticket Details */}
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white/70 p-3 rounded-2xl border border-rose-100">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-100 text-rose-600">
                <Heart className="w-5 h-5 fill-rose-500" />
              </div>
              <div>
                <p className="text-[11px] text-rose-400 uppercase font-semibold">Гостья вечера</p>
                <p className="font-serif font-bold text-rose-950 text-base">{submission.partnerName}</p>
              </div>
            </div>
            <span className="text-xs text-rose-500 font-medium">Бесценно ✨</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/70 p-3 rounded-2xl border border-rose-100">
              <div className="flex items-center gap-2 text-rose-500 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-[11px] uppercase font-semibold text-rose-400">Дата</span>
              </div>
              <p className="font-bold text-rose-950 text-sm">{submission.selectedDate}</p>
            </div>

            <div className="bg-white/70 p-3 rounded-2xl border border-rose-100">
              <div className="flex items-center gap-2 text-rose-500 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-[11px] uppercase font-semibold text-rose-400">Время</span>
              </div>
              <p className="font-bold text-rose-950 text-sm">{submission.selectedTime}</p>
            </div>
          </div>

          <div className="bg-white/70 p-3 rounded-2xl border border-rose-100">
            <div className="flex items-center gap-2 text-rose-500 mb-1">
              <MapPin className="w-4 h-4" />
              <span className="text-[11px] uppercase font-semibold text-rose-400">Программа встречи</span>
            </div>
            <p className="font-bold text-rose-950 text-sm">{submission.selectedActivity}</p>
          </div>

          <div className="bg-white/70 p-3 rounded-2xl border border-rose-100">
            <div className="flex items-center gap-2 text-rose-500 mb-1">
              <Utensils className="w-4 h-4" />
              <span className="text-[11px] uppercase font-semibold text-rose-400">Выбранная кухня</span>
            </div>
            <p className="font-bold text-rose-950 text-sm">{submission.selectedFood}</p>
          </div>

          {submission.favoriteSong && (
            <div className="bg-white/70 p-3 rounded-2xl border border-rose-100">
              <div className="flex items-center gap-2 text-rose-500 mb-1">
                <Music className="w-4 h-4" />
                <span className="text-[11px] uppercase font-semibold text-rose-400">Любимый трек</span>
              </div>
              <p className="font-medium text-rose-950 text-sm italic">«{submission.favoriteSong}»</p>
            </div>
          )}

          {submission.customNotes && (
            <div className="bg-white/70 p-3 rounded-2xl border border-rose-100">
              <p className="text-[11px] uppercase font-semibold text-rose-400 mb-1">Твое пожелание</p>
              <p className="font-normal text-rose-900 text-xs italic">{submission.customNotes}</p>
            </div>
          )}

          <div className="bg-gradient-to-r from-rose-100/60 to-pink-100/60 p-3 rounded-2xl text-center border border-rose-200">
            <p className="text-xs text-rose-800 font-medium">
              👗 <b>Дресс-код:</b> Одевайся как тебе комфортно. Твоя улыбка — главное украшение вечера!
            </p>
          </div>
        </div>

        {/* Ticket Perforations effect */}
        <div className="relative my-5">
          <div className="border-t-2 border-dashed border-amber-300" />
          <div className="absolute -left-10 -top-3 w-6 h-6 rounded-full bg-[#fff8f8] border border-amber-200" />
          <div className="absolute -right-10 -top-3 w-6 h-6 rounded-full bg-[#fff8f8] border border-amber-200" />
        </div>

        {/* Ticket Bottom bar */}
        <div className="flex items-center justify-between text-xs text-rose-400">
          <span>Срок действия: Навсегда ❤️</span>
          <span className="font-mono">VALID FOR 2 PERSONS</span>
        </div>
      </motion.div>

      {/* Share & Actions Buttons */}
      <div className="w-full mt-6 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleTelegram}
            className="py-3 px-4 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-md transition-colors"
          >
            <Send className="w-4 h-4" />
            <span>В Telegram</span>
          </button>

          <button
            onClick={handleWhatsApp}
            className="py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-md transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>В WhatsApp</span>
          </button>
        </div>

        <button
          onClick={handleCopy}
          className="w-full py-3 px-4 rounded-xl bg-white hover:bg-rose-50 text-rose-700 font-medium text-sm flex items-center justify-center gap-2 border border-rose-200 shadow-sm transition-colors"
        >
          {copied ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Текст билета скопирован!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Скопировать детали билета</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
