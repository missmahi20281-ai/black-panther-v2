import React, { useEffect, useRef } from 'react';
import { AvatarState } from '../types';

interface VoiceWaveProps {
  state: AvatarState;
  isListening: boolean;
  isSpeaking: boolean;
  avatarStyle?: 'cyber_cyan' | 'sakura_pink' | 'matrix_emerald' | 'solar_gold';
}

export const VoiceWave: React.FC<VoiceWaveProps> = ({
  state,
  isListening,
  isSpeaking,
  avatarStyle = 'cyber_cyan',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getColor = () => {
    switch (avatarStyle) {
      case 'sakura_pink':
        return { primary: '#ff4081', secondary: '#ff80ab' };
      case 'matrix_emerald':
        return { primary: '#00e676', secondary: '#69f0ae' };
      case 'solar_gold':
        return { primary: '#ffd600', secondary: '#ffff00' };
      case 'cyber_cyan':
      default:
        return { primary: '#00f0ff', secondary: '#00b0ff' };
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let phase = 0;

    const render = () => {
      phase += 0.05;
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const colors = getColor();
      const numBars = 36;
      const barWidth = width / numBars - 2;
      const centerY = height / 2;

      // Base activity multiplier
      let activity = 0.15; // idle breathing wave
      if (isSpeaking) activity = 0.85;
      else if (isListening) activity = 0.7;
      else if (state === 'thinking' || state === 'processing') activity = 0.5;

      for (let i = 0; i < numBars; i++) {
        const x = i * (barWidth + 2);
        const norm = i / numBars;
        // Bell curve envelope
        const envelope = Math.sin(norm * Math.PI);

        // Sinusoidal waves with harmonic combinations
        const wave1 = Math.sin(phase * 2.5 + i * 0.35);
        const wave2 = Math.cos(phase * 1.8 - i * 0.2);
        const noise = (wave1 + wave2) * 0.5;

        const barHeight = Math.max(
          4,
          envelope * (Math.abs(noise) * height * 0.85 * activity) + (isListening || isSpeaking ? 6 : 2)
        );

        // Draw glowing frequency bar
        const gradient = ctx.createLinearGradient(0, centerY - barHeight / 2, 0, centerY + barHeight / 2);
        gradient.addColorStop(0, colors.secondary);
        gradient.addColorStop(0.5, colors.primary);
        gradient.addColorStop(1, colors.secondary);

        ctx.fillStyle = gradient;
        ctx.shadowColor = colors.primary;
        ctx.shadowBlur = isListening || isSpeaking ? 12 : 4;

        // Rounded bar
        const topY = centerY - barHeight / 2;
        ctx.beginPath();
        ctx.roundRect(x, topY, barWidth, barHeight, 2);
        ctx.fill();
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [state, isListening, isSpeaking, avatarStyle]);

  return (
    <div className="w-full flex flex-col items-center justify-center px-4 py-2 select-none">
      <div className="relative w-full max-w-md h-12 flex items-center justify-center bg-slate-950/40 rounded-xl border border-cyan-500/15 backdrop-blur-md px-3">
        <canvas
          ref={canvasRef}
          width={360}
          height={48}
          className="w-full h-full object-contain"
        />
        {/* Subtle center marker */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400/80 shadow-[0_0_8px_#00f0ff] pointer-events-none" />
      </div>
    </div>
  );
};
