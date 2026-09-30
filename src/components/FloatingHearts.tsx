'use client';

import React, { useEffect, useState } from 'react';

interface HeartParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  rotation: number;
  symbol: string;
}

const symbols = ['❤️', '💖', '✨', '🌸', '💕', '🌷', '🤍'];

export default function FloatingHearts() {
  const [hearts, setHearts] = useState<HeartParticle[]>([]);
  const [clickHearts, setClickHearts] = useState<Array<{ id: number; x: number; y: number; symbol: string }>>([]);

  useEffect(() => {
    // Generate initial ambient particles
    const initialHearts: HeartParticle[] = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 16 + 12,
      speed: Math.random() * 15 + 15,
      opacity: Math.random() * 0.4 + 0.15,
      rotation: Math.random() * 40 - 20,
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
    }));
    setHearts(initialHearts);
  }, []);

  const handleGlobalClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const id = Date.now() + Math.random();
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    setClickHearts((prev) => [...prev.slice(-15), { id, x: e.clientX, y: e.clientY, symbol }]);

    setTimeout(() => {
      setClickHearts((prev) => prev.filter((h) => h.id !== id));
    }, 1200);
  };

  return (
    <div
      onClick={handleGlobalClick}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Background ambient floating hearts */}
      {hearts.map((h) => (
        <span
          key={h.id}
          className="absolute select-none pointer-events-none transition-transform"
          style={{
            left: `${h.x}%`,
            top: `${h.y}%`,
            fontSize: `${h.size}px`,
            opacity: h.opacity,
            transform: `rotate(${h.rotation}deg)`,
            animation: `float ${h.speed}s ease-in-out infinite alternate`,
          }}
        >
          {h.symbol}
        </span>
      ))}

      {/* Interactive tap/click hearts */}
      {clickHearts.map((ch) => (
        <span
          key={ch.id}
          className="fixed text-2xl select-none pointer-events-none transform -translate-x-1/2 -translate-y-1/2 animate-ping"
          style={{
            left: `${ch.x}px`,
            top: `${ch.y}px`,
            filter: 'drop-shadow(0 2px 8px rgba(244, 63, 94, 0.4))',
          }}
        >
          {ch.symbol}
        </span>
      ))}
    </div>
  );
}
