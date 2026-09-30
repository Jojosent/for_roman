'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Heart, Sparkles, Check, ArrowRight } from 'lucide-react';
import { playCelebrationSound, playCuteChime } from './AmbientSound';

interface PlayfulQuestionProps {
  partnerName: string;
  onAccepted: () => void;
}

const noPhrases = [
  'Нет',
  'Ой, кнопка убежала! 🙈',
  'Ты точно уверена? 🥺',
  'Подумай еще разок!',
  'Я все равно не сдамся :))',
  'Кнопка сломалась! 😜',
  'Ну пожалуйста! 🌹',
  'Отказы не принимаются 💕',
  'Даже не надейся 😋',
  'Ладно, жми «Да»! ✨',
];

export default function PlayfulQuestion({ partnerName, onAccepted }: PlayfulQuestionProps) {
  const [noCount, setNoCount] = useState(0);
  const [noOffset, setNoOffset] = useState({ x: 0, y: 0 });
  const [accepted, setAccepted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleNoInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    playCuteChime();
    setNoCount((prev) => prev + 1);

    // Random displacement for the "No" button
    const rangeX = 140;
    const rangeY = 100;
    const randomX = (Math.random() - 0.5) * rangeX * 2;
    const randomY = (Math.random() - 0.5) * rangeY * 2;

    setNoOffset({ x: randomX, y: randomY });
  };

  const handleYes = () => {
    setAccepted(true);
    playCelebrationSound();

    // Fire fireworks / hearts confetti!
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: Math.random(), y: Math.random() - 0.2 },
        colors: ['#f43f5e', '#ec4899', '#fb7185', '#ffd1dc', '#fde047'],
      });
    }, 250);

    setTimeout(() => {
      onAccepted();
    }, 1200);
  };

  const currentNoPhrase = noPhrases[Math.min(noCount, noPhrases.length - 1)];
  const yesScale = Math.min(1 + noCount * 0.08, 1.4);

  return (
    <div
      ref={containerRef}
      className="w-full max-w-xl mx-auto px-4 py-8 flex flex-col items-center justify-center text-center relative"
    >
      <AnimatePresence mode="wait">
        {!accepted ? (
          <motion.div
            key="question-box"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-10 border border-rose-200/90 shadow-2xl relative overflow-hidden"
          >
            {/* Top decorative badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100/90 text-rose-700 text-xs sm:text-sm font-semibold tracking-wide mb-4">
              <Sparkles className="w-4 h-4 text-rose-500 animate-spin" />
              Главный вопрос
            </div>

            {/* Question */}
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-rose-950 leading-snug mb-3">
              {partnerName}, пойдешь со мной на свидание?
            </h2>

            <p className="text-rose-600/90 text-sm sm:text-base font-normal max-w-md mx-auto mb-8">
              Обещаю сделать этот вечер особенным, вкусным, уютным и незабываемым ❤️
            </p>

            {/* Interactive Buttons Container */}
            <div className="relative min-h-[140px] sm:min-h-[120px] flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-2">
              {/* YES Button */}
              <motion.button
                style={{ scale: yesScale }}
                whileHover={{ scale: yesScale * 1.05 }}
                whileTap={{ scale: yesScale * 0.95 }}
                onClick={handleYes}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 text-white font-bold text-base sm:text-lg shadow-xl shadow-rose-300/80 hover:shadow-rose-400 transition-all flex items-center justify-center gap-2 cursor-pointer z-20 group"
              >
                <span>Да, конечно! 🥰</span>
                <Heart className="w-5 h-5 fill-white group-hover:scale-125 transition-transform" />
              </motion.button>

              {/* Playful RUNAWAY NO Button */}
              <motion.button
                animate={{
                  x: noOffset.x,
                  y: noOffset.y,
                }}
                transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                onMouseEnter={handleNoInteraction}
                onTouchStart={handleNoInteraction}
                onClick={handleNoInteraction}
                className="px-5 py-3 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700/80 font-medium text-sm sm:text-base border border-rose-200 shadow-sm cursor-pointer select-none transition-colors z-10"
              >
                {currentNoPhrase}
              </motion.button>
            </div>

            {noCount > 0 && (
              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-rose-400 mt-6 italic"
              >
                * Подсказка: кнопка «Да» растет с каждой попыткой сбежать 😉
              </motion.p>
            )}
          </motion.div>
        ) : (
          /* Accepted celebratory state */
          <motion.div
            key="accepted-box"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full bg-gradient-to-br from-rose-50 via-white to-pink-50 rounded-3xl p-8 sm:p-12 border-2 border-rose-300 shadow-2xl relative text-center"
          >
            <div className="w-20 h-20 mx-auto rounded-full bg-rose-500 text-white flex items-center justify-center mb-4 shadow-lg shadow-rose-300 animate-bounce">
              <Check className="w-10 h-10 stroke-[3]" />
            </div>

            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-rose-950 mb-3">
              Урааа! Я безумно счастлив! ❤️
            </h2>

            <p className="text-rose-700 text-base sm:text-lg max-w-md mx-auto mb-6">
              Я знал, что ты ответишь взаимностью! А теперь давай выберем день, время и то, как мы проведем наш вечер:
            </p>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onAccepted}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-rose-600 text-white font-semibold text-base shadow-lg shadow-rose-300 hover:bg-rose-700 transition-colors"
            >
              <span>Перейти к выбору свидания</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
