'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { playCuteChime } from './AmbientSound';
import { PhotoItem } from '@/lib/types';

const defaultCaptions = [
  "Твоя улыбка делает любой день лучше ✨",
  "Один из моих любимых моментов с тобой",
  "Невероятно красивая и нежная 🌸",
  "Этот взгляд... я готов смотреть бесконечно",
  "С тобой даже самый обычный день особенный",
  "Каждый раз влюбляюсь заново ❤️",
  "Тепло, уют и ты рядом",
  "Самая яркая звёздочка ✨",
  "Обожаю, когда ты искренне смеёшься",
  "Твоя эстетика неповторима 🌷",
  "Момент, который хочется поставить на повтор",
  "Бесконечная нежность",
  "Ты вдохновляешь меня каждый день",
  "Твой свет согревает всё вокруг",
  "Прекрасна в любом образе 💫",
  "Хочу создавать еще больше таких моментов",
  "Самая любимая и родная ❤️",
  "Улыбайся чаще, это тебе так идёт!",
  "Маленькие радости рядом с тобой",
  "Этот день я запомню навсегда",
  "Неотразимая леди ✨",
  "С тобой время пролетает незаметно",
  "Ты — моё самое любимое счастье",
  "Просто идеальный кадр 📸",
  "Твоя энергетика притягивает магнитом",
  "Всё лучшее начинается с тебя",
  "Спасибо за то, что ты есть 💖",
  "Жду нашу следующую встречу с нетерпением!",
];

const initialDefaultPhotos: PhotoItem[] = Array.from({ length: 28 }, (_, i) => ({
  id: `photo-${i + 1}`,
  src: `/photos/photo-${i + 1}.jpg`,
  caption: defaultCaptions[i % defaultCaptions.length],
  rotation: ((i % 5) - 2) * 1.5,
}));

export default function PhotoMemories() {
  const [photos, setPhotos] = useState<PhotoItem[]>(initialDefaultPhotos);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);
  const [likes, setLikes] = useState<Record<string, boolean>>({});
  const [likeCount, setLikeCount] = useState<number>(0);
  const [burstHeart, setBurstHeart] = useState<{ id: string; key: number } | null>(null);

  // Fetch dynamic photos from API (shuffled order, uploads, custom captions)
  useEffect(() => {
    fetch('/api/photos')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.photos) && data.photos.length > 0) {
          setPhotos(data.photos);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch photos, using defaults:', err);
      });
  }, []);

  const toggleLike = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    playCuteChime();
    setLikes((prev) => {
      const isLiked = !prev[id];
      if (isLiked) {
        setLikeCount((c) => c + 1);
        setBurstHeart({ id, key: Date.now() });
      } else {
        setLikeCount((c) => Math.max(0, c - 1));
      }
      return { ...prev, [id]: isLiked };
    });
  };

  const handleNextPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!selectedPhoto || photos.length === 0) return;
    const currentIdx = photos.findIndex((p) => p.id === selectedPhoto.id);
    const nextIdx = (currentIdx + 1) % photos.length;
    setSelectedPhoto(photos[nextIdx]);
  };

  const handlePrevPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!selectedPhoto || photos.length === 0) return;
    const currentIdx = photos.findIndex((p) => p.id === selectedPhoto.id);
    const prevIdx = (currentIdx - 1 + photos.length) % photos.length;
    setSelectedPhoto(photos[prevIdx]);
  };

  const selectedIndex = selectedPhoto ? photos.findIndex((p) => p.id === selectedPhoto.id) + 1 : 0;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-12 relative">
      {/* Header section */}
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-rose-100 text-rose-700 text-xs sm:text-sm font-semibold tracking-wide border border-rose-200 shadow-sm">
          <Sparkles className="w-4 h-4 text-rose-500" />
          Галерея приятных воспоминаний ({photos.length})
        </span>
        <h2 className="text-2xl sm:text-4xl font-serif font-bold text-rose-950 mt-3">
          Каждый миг с тобой — особенный
        </h2>
        <p className="text-rose-700/80 text-sm sm:text-base max-w-xl mx-auto mt-2">
          Тыкай на фото, чтобы открыть на весь экран, и ставь сердечки ❤️
        </p>

        {/* Counter of hearts liked */}
        {likeCount > 0 && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 mt-4 px-4 py-1 rounded-full bg-pink-50 border border-pink-200 text-pink-700 text-xs font-medium"
          >
            <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500 animate-heartbeat" />
            <span>Ты отметила сердечком: {likeCount} фото</span>
          </motion.div>
        )}
      </div>

      {/* Grid of Polaroid Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
        {photos.map((photo, index) => {
          const isLiked = !!likes[photo.id];
          return (
            <motion.div
              key={photo.id || index}
              whileHover={{ scale: 1.03, y: -4, rotate: 0 }}
              whileTap={{ scale: 0.98 }}
              style={{ rotate: `${photo.rotation || 0}deg` }}
              onClick={() => setSelectedPhoto(photo)}
              className="group relative bg-white p-3 pb-4 rounded-xl shadow-md hover:shadow-xl hover:shadow-rose-100 transition-all duration-300 border border-rose-100 flex flex-col cursor-pointer"
            >
              {/* Photo Frame */}
              <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden bg-rose-50">
                <img
                  src={photo.src}
                  alt={photo.caption || 'Фото'}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Like Button on photo */}
                <button
                  onClick={(e) => toggleLike(e, photo.id)}
                  className={`absolute bottom-2 right-2 p-2 rounded-full backdrop-blur-md transition-transform active:scale-125 ${
                    isLiked
                      ? 'bg-rose-500 text-white shadow-md'
                      : 'bg-black/30 hover:bg-black/50 text-white'
                  }`}
                  title="Поставить сердечко"
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-white' : ''}`} />
                </button>

                {/* Animated heart burst */}
                {burstHeart && burstHeart.id === photo.id && (
                  <motion.div
                    key={burstHeart.key}
                    initial={{ scale: 0.2, opacity: 1 }}
                    animate={{ scale: 2.2, opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    <Heart className="w-12 h-12 text-rose-500 fill-rose-500" />
                  </motion.div>
                )}

                {/* Quick zoom icon */}
                <div className="absolute top-2 left-2 p-1.5 rounded-full bg-black/30 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Handwritten style caption */}
              <div className="mt-3 px-1 text-center">
                <p className="font-cursive text-rose-900 text-sm sm:text-base leading-tight line-clamp-2">
                  {photo.caption}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Full-screen Lightbox Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPhoto(null)}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-lg transition-colors z-50"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation buttons */}
            <button
              onClick={handlePrevPhoto}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors z-50"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNextPhoto}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors z-50"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Lightbox Content Card */}
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-lg w-full bg-white rounded-2xl overflow-hidden shadow-2xl p-4 sm:p-5 flex flex-col items-center"
            >
              <div className="relative w-full max-h-[65vh] rounded-xl overflow-hidden bg-rose-50 flex items-center justify-center">
                <img
                  src={selectedPhoto.src}
                  alt={selectedPhoto.caption || 'Фото'}
                  className="max-h-[65vh] w-auto object-contain rounded-lg"
                />
              </div>

              {/* Caption & Interaction */}
              <div className="w-full mt-4 flex items-center justify-between gap-4 px-2">
                <p className="font-cursive text-lg sm:text-xl text-rose-950 font-medium leading-snug">
                  {selectedPhoto.caption}
                </p>

                <button
                  onClick={(e) => toggleLike(e, selectedPhoto.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full transition-all shrink-0 ${
                    likes[selectedPhoto.id]
                      ? 'bg-rose-500 text-white shadow-md'
                      : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${likes[selectedPhoto.id] ? 'fill-white' : ''}`} />
                  <span className="text-xs font-semibold">
                    {likes[selectedPhoto.id] ? 'Любимое ❤️' : 'Нравится'}
                  </span>
                </button>
              </div>

              <div className="w-full text-right text-xs text-rose-400 mt-2 px-2">
                Фото {selectedIndex} из {photos.length}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
