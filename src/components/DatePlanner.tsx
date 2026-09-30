'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Utensils, Music, Heart, Sparkles, Send, Check } from 'lucide-react';
import { ActivityOption, FoodOption, DateSubmission } from '@/lib/types';
import { playCuteChime } from './AmbientSound';

interface DatePlannerProps {
  partnerName: string;
  availableDates: string[];
  availableTimes: string[];
  activities: ActivityOption[];
  foodOptions: FoodOption[];
  onComplete: (submission: DateSubmission) => void;
}

export default function DatePlanner({
  partnerName,
  availableDates,
  availableTimes,
  activities,
  foodOptions,
  onComplete,
}: DatePlannerProps) {
  const [selectedDate, setSelectedDate] = useState<string>(availableDates[0] || '');
  const [customDate, setCustomDate] = useState<string>('');
  const [isCustomDate, setIsCustomDate] = useState<boolean>(false);

  const [selectedTime, setSelectedTime] = useState<string>(availableTimes[0] || '');
  const [customTime, setCustomTime] = useState<string>('');
  const [isCustomTime, setIsCustomTime] = useState<boolean>(false);

  const [selectedActivity, setSelectedActivity] = useState<string>(activities[0]?.title || '');
  const [selectedFood, setSelectedFood] = useState<string>(foodOptions[0]?.title || '');
  const [customNotes, setCustomNotes] = useState<string>('');
  const [favoriteSong, setFavoriteSong] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const finalDate = isCustomDate ? (customDate || 'По договорённости') : selectedDate;
    const finalTime = isCustomTime ? (customTime || 'Удобное время') : selectedTime;

    const payload = {
      selectedDate: finalDate,
      selectedTime: finalTime,
      selectedActivity,
      selectedFood,
      customNotes,
      favoriteSong,
    };

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onComplete(data.submission);
      } else {
        // Fallback for offline / direct preview
        const fallbackSubmission: DateSubmission = {
          id: 'sub_' + Date.now(),
          partnerName,
          selectedDate: finalDate,
          selectedTime: finalTime,
          selectedActivity,
          selectedFood,
          customNotes,
          favoriteSong,
          submittedAt: new Date().toISOString(),
        };
        onComplete(fallbackSubmission);
      }
    } catch (err: any) {
      // Local fallback on network error
      const fallbackSubmission: DateSubmission = {
        id: 'sub_' + Date.now(),
        partnerName,
        selectedDate: finalDate,
        selectedTime: finalTime,
        selectedActivity,
        selectedFood,
        customNotes,
        favoriteSong,
        submittedAt: new Date().toISOString(),
      };
      onComplete(fallbackSubmission);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-3xl mx-auto px-4 py-8 space-y-8"
    >
      {/* Title */}
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-rose-100 text-rose-700 text-xs sm:text-sm font-semibold tracking-wide border border-rose-200 shadow-sm">
          <Sparkles className="w-4 h-4 text-rose-500" />
          Конструктор нашего идеального вечера
        </span>
        <h2 className="text-2xl sm:text-4xl font-serif font-bold text-rose-950 mt-3">
          Спланируй наше свидание
        </h2>
        <p className="text-rose-700/80 text-sm sm:text-base max-w-md mx-auto mt-2">
          Выбери удобный день, время и то, чего тебе больше всего хочется ✨
        </p>
      </div>

      {/* 1. Date Selection */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-rose-200 shadow-lg">
        <div className="flex items-center gap-2.5 text-rose-900 font-serif font-bold text-lg sm:text-xl mb-4">
          <Calendar className="w-5 h-5 text-rose-600" />
          <span>1. Какой день тебе больше подходит?</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {availableDates.map((dateStr) => {
            const isSelected = !isCustomDate && selectedDate === dateStr;
            return (
              <button
                type="button"
                key={dateStr}
                onClick={() => {
                  playCuteChime();
                  setIsCustomDate(false);
                  setSelectedDate(dateStr);
                }}
                className={`p-3.5 rounded-2xl text-left font-medium text-sm transition-all flex items-center justify-between border ${
                  isSelected
                    ? 'bg-rose-500 text-white border-rose-600 shadow-md shadow-rose-200'
                    : 'bg-rose-50/60 hover:bg-rose-100 text-rose-900 border-rose-200/70'
                }`}
              >
                <span>{dateStr}</span>
                {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => {
              playCuteChime();
              setIsCustomDate(true);
            }}
            className={`p-3.5 rounded-2xl text-left font-medium text-sm transition-all flex items-center justify-between border ${
              isCustomDate
                ? 'bg-rose-500 text-white border-rose-600 shadow-md shadow-rose-200'
                : 'bg-rose-50/60 hover:bg-rose-100 text-rose-900 border-rose-200/70'
            }`}
          >
            <span>✨ Другой день (напишу сама)</span>
            {isCustomDate && <Check className="w-4 h-4 text-white stroke-[3]" />}
          </button>
        </div>

        {isCustomDate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3"
          >
            <input
              type="text"
              placeholder="Например: В следующий вторник или в среду"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white text-rose-950 text-sm"
            />
          </motion.div>
        )}
      </div>

      {/* 2. Time Selection */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-rose-200 shadow-lg">
        <div className="flex items-center gap-2.5 text-rose-900 font-serif font-bold text-lg sm:text-xl mb-4">
          <Clock className="w-5 h-5 text-rose-600" />
          <span>2. Во сколько тебе удобно встретиться?</span>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {availableTimes.map((timeStr) => {
            const isSelected = !isCustomTime && selectedTime === timeStr;
            return (
              <button
                type="button"
                key={timeStr}
                onClick={() => {
                  playCuteChime();
                  setIsCustomTime(false);
                  setSelectedTime(timeStr);
                }}
                className={`px-5 py-3 rounded-2xl font-semibold text-sm transition-all border ${
                  isSelected
                    ? 'bg-rose-500 text-white border-rose-600 shadow-md shadow-rose-200'
                    : 'bg-rose-50/60 hover:bg-rose-100 text-rose-900 border-rose-200/70'
                }`}
              >
                {timeStr}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => {
              playCuteChime();
              setIsCustomTime(true);
            }}
            className={`px-5 py-3 rounded-2xl font-semibold text-sm transition-all border ${
              isCustomTime
                ? 'bg-rose-500 text-white border-rose-600 shadow-md shadow-rose-200'
                : 'bg-rose-50/60 hover:bg-rose-100 text-rose-900 border-rose-200/70'
            }`}
          >
            Своё время ⏰
          </button>
        </div>

        {isCustomTime && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3"
          >
            <input
              type="text"
              placeholder="Например: В 20:15 или как только освобожусь"
              value={customTime}
              onChange={(e) => setCustomTime(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white text-rose-950 text-sm"
            />
          </motion.div>
        )}
      </div>

      {/* 3. Activity Format */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-rose-200 shadow-lg">
        <div className="flex items-center gap-2.5 text-rose-900 font-serif font-bold text-lg sm:text-xl mb-4">
          <MapPin className="w-5 h-5 text-rose-600" />
          <span>3. Куда отправимся?</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {activities.map((act) => {
            const isSelected = selectedActivity === act.title;
            return (
              <div
                key={act.id}
                onClick={() => {
                  playCuteChime();
                  setSelectedActivity(act.title);
                }}
                className={`p-4 rounded-2xl cursor-pointer transition-all border relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-gradient-to-br from-rose-50 to-pink-50 border-rose-500 ring-2 ring-rose-400/50 shadow-md'
                    : 'bg-rose-50/40 hover:bg-rose-50/80 border-rose-200/70'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-3xl mb-2">{act.icon}</span>
                  {act.badge && (
                    <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                      {act.badge}
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-rose-950 text-base">{act.title}</h4>
                  <p className="text-xs text-rose-700/80 mt-1 leading-snug">{act.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Food Preferences */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-rose-200 shadow-lg">
        <div className="flex items-center gap-2.5 text-rose-900 font-serif font-bold text-lg sm:text-xl mb-4">
          <Utensils className="w-5 h-5 text-rose-600" />
          <span>4. Что будем кушать?</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {foodOptions.map((food) => {
            const isSelected = selectedFood === food.title;
            return (
              <div
                key={food.id}
                onClick={() => {
                  playCuteChime();
                  setSelectedFood(food.title);
                }}
                className={`p-4 rounded-2xl cursor-pointer transition-all border flex items-center gap-3.5 ${
                  isSelected
                    ? 'bg-gradient-to-br from-rose-50 to-pink-50 border-rose-500 ring-2 ring-rose-400/50 shadow-md'
                    : 'bg-rose-50/40 hover:bg-rose-50/80 border-rose-200/70'
                }`}
              >
                <span className="text-3xl shrink-0">{food.icon}</span>
                <div>
                  <h4 className="font-bold text-rose-950 text-sm sm:text-base">{food.title}</h4>
                  <p className="text-xs text-rose-700/80 mt-0.5">{food.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Special Notes & Song */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-rose-200 shadow-lg space-y-4">
        <div className="flex items-center gap-2.5 text-rose-900 font-serif font-bold text-lg sm:text-xl">
          <Music className="w-5 h-5 text-rose-600" />
          <span>5. Музыка и твои пожелания</span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-rose-800 uppercase tracking-wider mb-1.5">
            Любимый трек для нашего плейлиста 🎵
          </label>
          <input
            type="text"
            placeholder="Например: The Weeknd - Die For You или любая песня"
            value={favoriteSong}
            onChange={(e) => setFavoriteSong(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white text-rose-950 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-rose-800 uppercase tracking-wider mb-1.5">
            Любые пожелания или капризы (я всё учту) 💌
          </label>
          <textarea
            rows={3}
            placeholder="Например: Хочу сидеть у окна, или хочу сладкое мороженое..."
            value={customNotes}
            onChange={(e) => setCustomNotes(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white text-rose-950 text-sm resize-none"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex flex-col items-center pt-4">
        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="w-full sm:w-auto min-w-[280px] px-8 py-5 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 text-white font-bold text-lg shadow-xl shadow-rose-300 hover:shadow-2xl hover:shadow-rose-400 transition-all flex items-center justify-center gap-3 cursor-pointer group disabled:opacity-75"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Отправляю...</span>
            </div>
          ) : (
            <>
              <span>Подтвердить свидание</span>
              <Heart className="w-6 h-6 fill-white group-hover:scale-125 transition-transform" />
            </>
          )}
        </motion.button>
        <p className="text-xs text-rose-500 mt-3 text-center">
          Я сразу же получу твой ответ и начну всё готовить! ✨
        </p>
      </div>
    </form>
  );
}
