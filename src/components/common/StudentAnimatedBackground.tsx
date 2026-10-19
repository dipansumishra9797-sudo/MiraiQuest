import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useApp } from '../../store/appStore';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  type: 'dot' | 'sparkle' | 'bracket' | 'star' | 'bolt';
  baseOpacity: number;
  pulsePhase: number;
  pulseSpeed: number;
  colorType: 'indigo' | 'violet' | 'cyan' | 'amber' | 'white';
}

interface StudentAnimatedBackgroundProps {
  /** Override to force static mode (e.g. for focus-critical views) */
  isFocusScreen?: boolean;
}

export const StudentAnimatedBackground: React.FC<StudentAnimatedBackgroundProps> = ({
  isFocusScreen = false,
}) => {
  const { isDark, studentBgAnimationEnabled, isFocusCriticalActive, role } = useApp();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Lazy-mount to ensure first paint & splash are never blocked
  const [isMounted, setIsMounted] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isTabHidden, setIsTabHidden] = useState(false);

  // Parallax offsets (gentle mouse on laptop, scroll on mobile)
  const mousePos = useRef({ x: 0, y: 0 });
  const targetOffset = useRef({ x: 0, y: 0 });
  const currentOffset = useRef({ x: 0, y: 0 });
  const scrollOffsetRef = useRef(0);

  // Check reduced motion media query
  useEffect(() => {
    setIsMounted(true);

    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);

      const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener('change', handler);

      // Page Visibility API to pause when tab is in background
      const handleVisibilityChange = () => {
        setIsTabHidden(document.hidden);
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        mediaQuery.removeEventListener('change', handler);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, []);

  // Parallax mouse and scroll listeners
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleMouseMove = (e: MouseEvent) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      targetOffset.current = {
        x: (e.clientX / w - 0.5) * 20,
        y: (e.clientY / h - 0.5) * 20,
      };
    };

    const handleScroll = () => {
      scrollOffsetRef.current = window.scrollY * 0.035;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Only animate if enabled, not focus-critical, not reduced-motion, and tab is visible
  const isAnimationActive =
    studentBgAnimationEnabled &&
    !isFocusScreen &&
    !isFocusCriticalActive &&
    !prefersReducedMotion &&
    !isTabHidden;

  // Particle Canvas Simulation
  useEffect(() => {
    if (!isMounted || !isAnimationActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = performance.now();
    let width = 0;
    let height = 0;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    // Responsive particle count: 18 on mobile (<768px), 36 on desktop
    const isMobile = window.innerWidth < 768;
    const count = isMobile ? 18 : 36;
    const colorTypes: Particle['colorType'][] = ['indigo', 'violet', 'cyan', 'amber', 'white'];
    const particleTypes: Particle['type'][] = ['dot', 'dot', 'sparkle', 'bracket', 'star', 'bolt'];

    const particles: Particle[] = Array.from({ length: count }, () => {
      const type = particleTypes[Math.floor(Math.random() * particleTypes.length)];
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -(0.18 + Math.random() * 0.28), // Gentle upward drift
        size:
          type === 'dot'
            ? 1.2 + Math.random() * 1.6
            : type === 'sparkle'
            ? 3.5 + Math.random() * 2.5
            : 4 + Math.random() * 2,
        type,
        baseOpacity: isDark ? 0.18 + Math.random() * 0.28 : 0.1 + Math.random() * 0.16,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.03,
        colorType: colorTypes[Math.floor(Math.random() * colorTypes.length)],
      };
    });

    // Helper to get particle color
    const getColor = (colorType: Particle['colorType'], opacity: number) => {
      if (isDark) {
        switch (colorType) {
          case 'indigo':
            return `rgba(129, 140, 248, ${opacity})`;
          case 'violet':
            return `rgba(167, 139, 250, ${opacity})`;
          case 'cyan':
            return `rgba(56, 189, 248, ${opacity})`;
          case 'amber':
            return `rgba(251, 191, 36, ${opacity})`;
          case 'white':
          default:
            return `rgba(248, 250, 252, ${opacity * 0.9})`;
        }
      } else {
        switch (colorType) {
          case 'indigo':
            return `rgba(99, 102, 241, ${opacity * 0.85})`;
          case 'violet':
            return `rgba(139, 92, 246, ${opacity * 0.8})`;
          case 'cyan':
            return `rgba(13, 148, 136, ${opacity * 0.75})`;
          case 'amber':
            return `rgba(217, 119, 6, ${opacity * 0.75})`;
          case 'white':
          default:
            return `rgba(100, 116, 139, ${opacity * 0.7})`;
        }
      }
    };

    // Draw custom game / learning glyphs (sparkle, bracket, star, lightning bolt)
    const drawGlyph = (p: Particle, x: number, y: number, opacity: number) => {
      ctx.save();
      ctx.translate(x, y);

      const color = getColor(p.colorType, opacity);
      ctx.fillStyle = color;
      ctx.strokeStyle = color;

      if (p.type === 'sparkle') {
        // 4-point XP Sparkle
        const s = p.size;
        ctx.beginPath();
        ctx.moveTo(0, -s);
        ctx.quadraticCurveTo(0, 0, s, 0);
        ctx.quadraticCurveTo(0, 0, 0, s);
        ctx.quadraticCurveTo(0, 0, -s, 0);
        ctx.quadraticCurveTo(0, 0, 0, -s);
        ctx.closePath();
        ctx.fill();
      } else if (p.type === 'star') {
        // Mini 5-point star
        const r = p.size * 0.7;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const a = (i * Math.PI * 2) / 5 - Math.PI / 2;
          const a2 = a + Math.PI / 5;
          const px = Math.cos(a) * r;
          const py = Math.sin(a) * r;
          const px2 = Math.cos(a2) * (r * 0.45);
          const py2 = Math.sin(a2) * (r * 0.45);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
          ctx.lineTo(px2, py2);
        }
        ctx.closePath();
        ctx.fill();
      } else if (p.type === 'bracket') {
        // Faint Code Brackets { }
        ctx.font = `bold ${Math.round(p.size * 1.8)}px 'JetBrains Mono', monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('{ }', 0, 0);
      } else if (p.type === 'bolt') {
        // Tiny lightning bolt
        const s = p.size * 0.8;
        ctx.beginPath();
        ctx.moveTo(-s * 0.2, -s);
        ctx.lineTo(s * 0.4, -s * 0.1);
        ctx.lineTo(0, 0);
        ctx.lineTo(s * 0.3, s);
        ctx.lineTo(-s * 0.4, s * 0.1);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();
      } else {
        // Dot
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    };

    // Main render loop
    const render = (now: number) => {
      // Throttle to ~35-40 fps to preserve device battery
      const elapsed = now - lastTime;
      if (elapsed < 24) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }
      lastTime = now;

      // Smooth parallax damping
      currentOffset.current.x += (targetOffset.current.x - currentOffset.current.x) * 0.04;
      currentOffset.current.y += (targetOffset.current.y - currentOffset.current.y) * 0.04;

      ctx.clearRect(0, 0, width, height);

      const maxConnectDistance = isMobile ? 65 : 88;

      // Draw faint constellation lines between nearby particles
      ctx.lineWidth = 0.65;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.hypot(dx, dy);

          if (dist < maxConnectDistance) {
            const lineOpacity =
              (1 - dist / maxConnectDistance) * (isDark ? 0.08 : 0.045);
            ctx.strokeStyle = isDark
              ? `rgba(167, 139, 250, ${lineOpacity})`
              : `rgba(99, 102, 241, ${lineOpacity})`;
            ctx.beginPath();
            ctx.moveTo(
              particles[i].x + currentOffset.current.x,
              particles[i].y + currentOffset.current.y + (scrollOffsetRef.current % 40)
            );
            ctx.lineTo(
              particles[j].x + currentOffset.current.x,
              particles[j].y + currentOffset.current.y + (scrollOffsetRef.current % 40)
            );
            ctx.stroke();
          }
        }
      }

      // Update and draw each particle
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Motion physics
        p.pulsePhase += p.pulseSpeed;
        p.x += p.vx + Math.sin(p.pulsePhase * 0.5) * 0.2;
        p.y += p.vy;

        // Wrap around viewport edges
        if (p.y < -25) {
          p.y = height + 15;
          p.x = Math.random() * width;
        } else if (p.y > height + 25) {
          p.y = -15;
        }
        if (p.x < -20) p.x = width + 15;
        else if (p.x > width + 20) p.x = -15;

        // Pulsing breathing opacity
        const opacity =
          p.baseOpacity * (0.75 + Math.sin(p.pulsePhase) * 0.25);

        // Apply mouse & scroll parallax
        const drawX = p.x + currentOffset.current.x * (p.size / 3);
        const drawY =
          p.y +
          currentOffset.current.y * (p.size / 3) +
          (scrollOffsetRef.current % 40);

        drawGlyph(p, drawX, drawY, opacity);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, [isMounted, isAnimationActive, isDark]);

  // Don't render for faculty or admin portals
  if (role !== 'student') return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none select-none overflow-hidden z-0 transition-opacity duration-700"
      style={{
        opacity: isMounted ? 1 : 0,
      }}
    >
      {/* ── Layer 1: Ambient Base Gradient ── */}
      <div
        className={`absolute inset-0 transition-colors duration-700 ${
          isDark
            ? 'bg-gradient-to-b from-[#020617] via-[#05091e] to-[#030712]'
            : 'bg-gradient-to-b from-[#f8fafc] via-[#f1f5f9] to-[#f8fafc]'
        }`}
      />

      {/* ── Layer 2: Large Blurred Floating Gradient Orbs ── */}
      <div
        className={`absolute inset-0 overflow-hidden transition-all duration-700 ${
          isAnimationActive ? '' : 'filter-none'
        }`}
        style={{
          filter: 'blur(90px)',
          WebkitFilter: 'blur(90px)',
          transform: `translate3d(${currentOffset.current.x * 0.4}px, ${currentOffset.current.y * 0.4}px, 0)`,
        }}
      >
        {/* Orb 1: Brand Indigo (Top-Left) */}
        <div
          className={`absolute rounded-full w-[480px] h-[480px] -top-24 -left-24 transition-opacity duration-700 ${
            isAnimationActive ? 'animate-orb-1' : 'orb-paused'
          }`}
          style={{
            background: isDark
              ? 'radial-gradient(circle, rgba(99, 102, 241, 0.32) 0%, rgba(79, 70, 229, 0.12) 50%, transparent 70%)'
              : 'radial-gradient(circle, rgba(199, 210, 254, 0.55) 0%, rgba(224, 231, 255, 0.25) 50%, transparent 70%)',
            opacity: isFocusCriticalActive ? 0.35 : 1,
          }}
        />

        {/* Orb 2: Violet / Lavender (Top-Right) */}
        <div
          className={`absolute rounded-full w-[540px] h-[540px] -top-20 -right-20 transition-opacity duration-700 ${
            isAnimationActive ? 'animate-orb-2' : 'orb-paused'
          }`}
          style={{
            background: isDark
              ? 'radial-gradient(circle, rgba(139, 92, 246, 0.28) 0%, rgba(124, 58, 237, 0.1) 50%, transparent 70%)'
              : 'radial-gradient(circle, rgba(233, 213, 255, 0.5) 0%, rgba(243, 232, 255, 0.2) 50%, transparent 70%)',
            opacity: isFocusCriticalActive ? 0.35 : 1,
          }}
        />

        {/* Orb 3: Mint / Teal (Bottom-Left) */}
        <div
          className={`absolute rounded-full w-[460px] h-[460px] bottom-10 -left-16 transition-opacity duration-700 ${
            isAnimationActive ? 'animate-orb-3' : 'orb-paused'
          }`}
          style={{
            background: isDark
              ? 'radial-gradient(circle, rgba(20, 184, 166, 0.2) 0%, rgba(6, 182, 212, 0.08) 50%, transparent 70%)'
              : 'radial-gradient(circle, rgba(204, 251, 241, 0.45) 0%, rgba(153, 246, 228, 0.18) 50%, transparent 70%)',
            opacity: isFocusCriticalActive ? 0.3 : 1,
          }}
        />

        {/* Orb 4: Warm Amber / Peach (Bottom-Right) */}
        <div
          className={`absolute rounded-full w-[440px] h-[440px] -bottom-10 right-10 transition-opacity duration-700 ${
            isAnimationActive ? 'animate-orb-4' : 'orb-paused'
          }`}
          style={{
            background: isDark
              ? 'radial-gradient(circle, rgba(245, 158, 11, 0.16) 0%, rgba(234, 88, 12, 0.06) 50%, transparent 70%)'
              : 'radial-gradient(circle, rgba(254, 243, 199, 0.45) 0%, rgba(254, 215, 170, 0.18) 50%, transparent 70%)',
            opacity: isFocusCriticalActive ? 0.3 : 1,
          }}
        />

        {/* Orb 5: Center Core Pulse */}
        <div
          className={`absolute rounded-full w-[360px] h-[360px] top-1/3 left-1/3 transition-opacity duration-700 ${
            isAnimationActive ? 'animate-orb-pulse' : 'orb-paused'
          }`}
          style={{
            background: isDark
              ? 'radial-gradient(circle, rgba(99, 102, 241, 0.14) 0%, transparent 65%)'
              : 'radial-gradient(circle, rgba(224, 231, 255, 0.35) 0%, transparent 65%)',
            opacity: isFocusCriticalActive ? 0.25 : 1,
          }}
        />
      </div>

      {/* ── Layer 3: Floating Particles & Constellations Canvas ── */}
      {isAnimationActive && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-500"
          style={{
            opacity: isDark ? 0.85 : 0.65,
          }}
        />
      )}

      {/* ── Layer 4: Subtle Vignette / Contrast Protector ── */}
      <div
        className={`absolute inset-0 pointer-events-none transition-colors duration-700 ${
          isDark
            ? 'bg-radial-[ellipse_at_center,_transparent_40%,_rgba(2,6,23,0.35)_100%]'
            : 'bg-radial-[ellipse_at_center,_transparent_40%,_rgba(241,245,249,0.3)_100%]'
        }`}
      />
    </div>
  );
};
