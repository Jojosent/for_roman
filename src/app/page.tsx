'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EnvelopeIntro from '@/components/EnvelopeIntro';
import PlayfulQuestion from '@/components/PlayfulQuestion';
import PhotoMemories from '@/components/PhotoMemories';
import DatePlanner from '@/components/DatePlanner';
import GoldenTicket from '@/components/GoldenTicket';
import { AppConfig, DateSubmission, DEFAULT_CONFIG } from '@/lib/types';
import { Heart, Sparkles, ChevronDown } from 'lucide-react';

export default function HomePage() {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [stage, setStage] = useState<'envelope' | 'question' | 'planning' | 'ticket'>('envelope');
  const [finalSubmission, setFinalSubmission] = useState<DateSubmission | null>(null);

  const questionRef = useRef<HTMLDivElement>(null);
  const plannerRef = useRef<HTMLDivElement>(null);
  const photosRef = useRef<HTMLDivElement>(null);

  // Fetch updated config on mount (configured dates, times, partner name from /admin)
  useEffect(() => {
    fetch('/api/config')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setConfig((prev) => ({ ...prev, ...data }));
        }
      })
      .catch((err) => {
        console.error('Failed to load config, using defaults:', err);
      });
  }, []);

  const handleEnvelopeOpened = () => {
    setStage('question');
    setTimeout(() => {
      questionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 200);
  };

  const handleQuestionAccepted = () => {
    setStage('planning');
    setTimeout(() => {
      photosRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 400);
  };

  const handlePlanningCompleted = (submission: DateSubmission) => {
    setFinalSubmission(submission);
    setStage('ticket');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen text-[#3a1b22] pb-24 overflow-x-hidden">
      {/* Decorative top ambient blur gradient */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-72 bg-gradient-to-b from-rose-200/40 via-pink-100/20 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* STAGE 1: ENVELOPE INTRO */}
      {stage === 'envelope' && (
        <EnvelopeIntro
          partnerName={config.partnerName}
          letterGreeting={config.letterGreeting}
          letterBody={config.letterBody}
          onOpenComplete={handleEnvelopeOpened}
        />
      )}

      {/* STAGE 2: PLAYFUL QUESTION */}
      {stage === 'question' && (
        <div ref={questionRef} className="min-h-[80vh] flex flex-col justify-center py-12">
          <PlayfulQuestion
            partnerName={config.partnerName}
            onAccepted={handleQuestionAccepted}
          />
        </div>
      )}

      {/* STAGE 3: INTERACTIVE JOURNEY (PHOTOS & DATE BUILDER) */}
      {stage === 'planning' && (
        <div className="space-y-12">
          {/* Transition banner */}
          <div className="text-center pt-8 px-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-rose-100/80 text-rose-700 text-xs sm:text-sm font-semibold border border-rose-200 shadow-sm"
            >
              <Heart className="w-4 h-4 fill-rose-500 text-rose-500 animate-heartbeat" />
              <span>Свидание мечты для {config.partnerName}</span>
            </motion.div>
          </div>

          {/* Photo memories showcase */}
          <div ref={photosRef}>
            <PhotoMemories />
          </div>

          {/* Smooth scroll down indicator */}
          <div className="flex flex-col items-center justify-center text-rose-400 text-xs gap-1 py-4 animate-bounce">
            <span>Листай вниз к выбору даты</span>
            <ChevronDown className="w-4 h-4" />
          </div>

          {/* Date planner selection */}
          <div ref={plannerRef}>
            <DatePlanner
              partnerName={config.partnerName}
              availableDates={config.availableDates}
              availableTimes={config.availableTimes}
              activities={config.activities}
              foodOptions={config.foodOptions}
              onComplete={handlePlanningCompleted}
            />
          </div>
        </div>
      )}

      {/* STAGE 4: GOLDEN VIP TICKET CELEBRATION */}
      {stage === 'ticket' && finalSubmission && (
        <div className="min-h-screen flex items-center justify-center py-10">
          <GoldenTicket submission={finalSubmission} />
        </div>
      )}

      {/* Subtle Romantic Footer */}
      <footer className="mt-16 text-center text-xs text-rose-400/80 flex items-center justify-center gap-1.5 px-4">
        <span>Сделано с любовью</span>
        <Heart className="w-3.5 h-3.5 fill-rose-400 inline" />
        <span>специально для тебя</span>
      </footer>
    </div>
  );
}
