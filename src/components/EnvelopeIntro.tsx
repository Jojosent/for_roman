'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, MailOpen, ArrowDown } from 'lucide-react';
import { playCuteChime } from './AmbientSound';

interface EnvelopeIntroProps {
  partnerName: string;
  letterGreeting: string;
  letterBody: string;
  onOpenComplete: () => void;
}

export default function EnvelopeIntro({
  partnerName,
  letterGreeting,
  letterBody,
  onOpenComplete,
}: EnvelopeIntroProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  const handleOpenEnvelope = () => {
    if (isOpening || isOpen) return;
    setIsOpening(true);
    playCuteChime();
    setTimeout(() => {
      setIsOpen(true);
      setIsOpening(false);
    }, 600);
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-8 relative">
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.div
            key="envelope-closed"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 1.05, opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center max-w-sm sm:max-w-md w-full"
          >
            {/* Romantic sub-heading */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="text-center mb-6"
            >
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-rose-100/90 text-rose-700 text-xs sm:text-sm font-medium tracking-wide shadow-sm border border-rose-200">
                <Sparkles className="w-3.5 h-3.5 text-rose-500 animate-spin" />
                Личное послание для {partnerName}
              </span>
              <h1 className="text-2xl sm:text-4xl font-serif font-bold text-rose-950 mt-3 leading-snug">
                У меня есть кое-что <br />
                <span className="bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 bg-clip-text text-transparent">
                  только для тебя...
                </span>
              </h1>
            </motion.div>

            {/* Aesthetic Envelope with Wax Seal */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleOpenEnvelope}
              className="relative w-full aspect-[4/3] max-w-[360px] bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50 rounded-2xl shadow-2xl border-2 border-rose-200/80 cursor-pointer overflow-hidden p-6 flex flex-col items-center justify-between group transition-shadow hover:shadow-rose-200/50"
            >
              {/* Envelope flap visual lines */}
              <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-rose-100/50 to-transparent pointer-events-none" />
              <div className="absolute inset-0 border-t-[140px] border-t-rose-100/40 border-l-[180px] border-l-transparent border-r-[180px] border-r-transparent pointer-events-none" />

              <div className="z-10 text-center mt-3">
                <p className="text-xs uppercase tracking-widest text-rose-400 font-semibold">Special Delivery</p>
                <p className="font-serif italic text-rose-900 text-lg sm:text-xl font-medium mt-1">
                  Для самой прекрасной
                </p>
              </div>

              {/* Glowing Wax Seal */}
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="z-10 relative flex flex-col items-center justify-center my-auto"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-700 via-red-600 to-rose-900 shadow-xl flex items-center justify-center ring-4 ring-rose-200/70 border-2 border-amber-300/40 group-hover:scale-105 transition-transform">
                  <Heart className="w-10 h-10 text-rose-100 fill-rose-100 filter drop-shadow animate-heartbeat" />
                </div>
                <div className="absolute -bottom-7 whitespace-nowrap bg-rose-950/80 text-white text-[11px] px-3 py-1 rounded-full backdrop-blur-sm shadow font-medium tracking-wide">
                  Нажми, чтобы открыть 💌
                </div>
              </motion.div>

              <div className="z-10 text-center text-xs text-rose-400/90 font-medium">
                С любовью и трепетом
              </div>
            </motion.div>

            <p className="text-center text-rose-400 text-xs mt-6 flex items-center gap-1.5 animate-pulse">
              <span>Тыкни на конверт</span>
              <Heart className="w-3 h-3 fill-rose-400 inline" />
            </p>
          </motion.div>
        ) : (
          /* Opened Letter / Note */
          <motion.div
            key="letter-open"
            initial={{ scale: 0.85, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.6, type: 'spring', bounce: 0.3 }}
            className="w-full max-w-lg bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-10 shadow-2xl border border-rose-200 relative overflow-hidden"
          >
            {/* Top decorative badge */}
            <div className="flex items-center justify-between border-b border-rose-100 pb-4 mb-6">
              <div className="flex items-center gap-2 text-rose-600">
                <MailOpen className="w-5 h-5" />
                <span className="font-serif italic font-semibold text-rose-800 text-sm">Личное письмо</span>
              </div>
              <span className="text-xs text-rose-400 bg-rose-50 px-3 py-1 rounded-full border border-rose-100 font-medium">
                Только для твоих глаз ✨
              </span>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-rose-950">
                {letterGreeting}
              </h2>
              
              <p className="text-rose-900/90 leading-relaxed font-normal text-base sm:text-lg">
                {letterBody}
              </p>
            </div>

            {/* Next Step Action Button */}
            <div className="mt-8 pt-6 border-t border-rose-100 flex flex-col items-center">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  playCuteChime();
                  onOpenComplete();
                }}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 text-white font-semibold text-base shadow-lg shadow-rose-300 hover:shadow-xl hover:shadow-rose-400 transition-all flex items-center justify-center gap-2 group"
              >
                <span>Узнать, что там дальше</span>
                <Heart className="w-5 h-5 fill-white group-hover:scale-125 transition-transform" />
                <ArrowDown className="w-4 h-4 ml-1 animate-bounce" />
              </motion.button>
              
              <p className="text-xs text-rose-400 mt-3 text-center">
                Обещаю, тебе очень понравится 🌸
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
