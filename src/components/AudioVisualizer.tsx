import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  isPlaying: boolean;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  colorTheme?: string;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isPlaying,
  audioRef,
  colorTheme = '#6366f1',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize or connect AudioContext safely
  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl) return;

    const setupAudioContext = () => {
      try {
        if (!audioContextRef.current) {
          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          if (!AudioCtx) return;
          audioContextRef.current = new AudioCtx();
        }

        const ctx = audioContextRef.current;
        if (ctx.state === 'suspended' && isPlaying) {
          ctx.resume();
        }

        if (!analyserRef.current) {
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 64;
          analyser.smoothingTimeConstant = 0.8;
          analyserRef.current = analyser;
        }

        if (!sourceRef.current && audioEl) {
          try {
            const source = ctx.createMediaElementSource(audioEl);
            source.connect(analyserRef.current);
            analyserRef.current.connect(ctx.destination);
            sourceRef.current = source;
          } catch {
            // Already connected or cross-origin restrictions; fall back gracefully
          }
        }
      } catch (err) {
        console.warn('Web Audio API not fully available for analyzer:', err);
      }
    };

    if (isPlaying) {
      setupAudioContext();
    }
  }, [isPlaying, audioRef]);

  // Render animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const barCount = 28;
    const bufferLength = analyserRef.current ? analyserRef.current.frequencyBinCount : barCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      let hasRealData = false;
      if (analyserRef.current && isPlaying) {
        analyserRef.current.getByteFrequencyData(dataArray);
        hasRealData = dataArray.some((val) => val > 0);
      }

      const barWidth = (width / barCount) - 3;

      for (let i = 0; i < barCount; i++) {
        let barHeight = 4; // idle minimum height

        if (isPlaying) {
          if (hasRealData && analyserRef.current) {
            const index = Math.floor((i / barCount) * bufferLength);
            const value = dataArray[index] || 0;
            barHeight = Math.max(6, (value / 255) * (height - 8));
          } else {
            // Synthetic smooth wave fallback if direct node capture is guarded
            const wave = Math.sin(phase + (i * 0.4)) * 0.5 + 0.5;
            barHeight = Math.max(6, wave * (height - 12));
          }
        }

        const x = i * (barWidth + 3);
        const y = (height - barHeight) / 2;

        // Gradient for bars
        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        if (isPlaying) {
          gradient.addColorStop(0, '#818cf8'); // Indigo-400
          gradient.addColorStop(0.5, '#c084fc'); // Purple-400
          gradient.addColorStop(1, '#f472b6'); // Pink-400
        } else {
          gradient.addColorStop(0, '#475569'); // Slate-600
          gradient.addColorStop(1, '#334155'); // Slate-700
        }

        ctx.fillStyle = gradient;
        // Rounded bar rectangle
        const radius = Math.min(barWidth / 2, barHeight / 2);
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, radius);
        ctx.fill();
      }

      if (isPlaying) {
        phase += 0.15;
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  return (
    <div className="w-full flex items-center justify-center bg-slate-950/70 border border-slate-800/80 rounded-xl px-4 py-3 shadow-inner">
      <canvas
        ref={canvasRef}
        width={360}
        height={54}
        className="w-full max-w-md h-12 block"
      />
    </div>
  );
};
