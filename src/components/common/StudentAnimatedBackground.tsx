import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../store/appStore';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  glowColor: string;
  twinklePhase: number;
  twinkleSpeed: number;
  baseAlpha: number;
}

interface SakuraPetal {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  rotationSpeedX: number;
  rotationSpeedY: number;
  rotationSpeedZ: number;
  swayPhase: number;
  swaySpeed: number;
  colorType: 'pink' | 'white' | 'deepPink' | 'cyberCyan' | 'dataParticle';
  opacity: number;
}

interface StudentAnimatedBackgroundProps {
  /** Override to force static mode (e.g. for focus-critical views) */
  isFocusScreen?: boolean;
}

export const StudentAnimatedBackground: React.FC<StudentAnimatedBackgroundProps> = ({
  isFocusScreen = false,
}) => {
  const {
    isDark,
    studentBgAnimationEnabled,
    studentBgStyle,
    isFocusCriticalActive,
    role,
  } = useApp();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Lazy-mount to ensure first paint & splash are never blocked
  const [isMounted, setIsMounted] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isTabHidden, setIsTabHidden] = useState(false);

  // Parallax offsets (mouse on laptop, scroll/touch on mobile)
  const targetOffset = useRef({ x: 0, y: 0 });
  const currentOffset = useRef({ x: 0, y: 0 });
  const mousePosRef = useRef({ x: -1000, y: -1000 });
  const scrollOffsetRef = useRef(0);

  // Mark body with student-portal-active to enforce transparent wrappers
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.classList.add('student-portal-active');
      return () => {
        document.body.classList.remove('student-portal-active');
      };
    }
  }, []);

  // Check reduced motion media query & tab visibility
  useEffect(() => {
    setIsMounted(true);

    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);

      const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener('change', handler);

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

  // Parallax mouse, touch & scroll listeners
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleMouseMove = (e: MouseEvent) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      mousePosRef.current = { x: e.clientX, y: e.clientY };
      targetOffset.current = {
        x: (e.clientX / w - 0.5) * 32,
        y: (e.clientY / h - 0.5) * 32,
      };
    };

    const handleScroll = () => {
      scrollOffsetRef.current = window.scrollY * 0.045;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const w = window.innerWidth;
        const h = window.innerHeight;
        mousePosRef.current = { x: touch.clientX, y: touch.clientY };
        targetOffset.current = {
          x: (touch.clientX / w - 0.5) * 20,
          y: (touch.clientY / h - 0.5) * 20,
        };
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  // Determine active visual mode
  // Determine active visual mode
  // 'all' = Orbs + Particles (Default)
  // 'orbs' = Gradient Orbs
  // 'particles' = Particles & Constellations
  // 'aurora' = Aurora Mesh
  // 'off' = Static Minimal Gradient
  const effectiveStyle =
    !studentBgAnimationEnabled || studentBgStyle === 'off'
      ? 'off'
      : studentBgStyle;

  const isFocusMode = isFocusScreen || isFocusCriticalActive;
  const isAnimationActive =
    effectiveStyle !== 'off' &&
    !isFocusMode &&
    !prefersReducedMotion &&
    !isTabHidden;

  const showMiraiScene = effectiveStyle === 'mirai' && !isFocusMode;
  const showOrbs = (effectiveStyle === 'orbs' || effectiveStyle === 'all') && !isFocusMode;
  const showAurora = (effectiveStyle === 'aurora' || effectiveStyle === 'all' || effectiveStyle === 'orbs') && !isFocusMode;
  const showParticles = (effectiveStyle === 'particles' || effectiveStyle === 'all') && !isFocusMode;
  const showGameShapes = (effectiveStyle === 'all' || effectiveStyle === 'particles') && isAnimationActive;

  // ─────────────────────────────────────────────────────────────
  // Canvas Loop: Particles + Constellations OR Sakura Petals
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isMounted) return;
    if (!showParticles && !showMiraiScene) return;

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
      ctx.resetTransform?.();
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    const isMobile = window.innerWidth < 768;

    // Mode A: Quest Particles & Constellations (60 to 80 on laptop, 30 to 40 on mobile)
    const particleCount = isMobile ? 38 : 72;
    const colorsDark = [
      { fill: '#818cf8', glow: 'rgba(129, 140, 248, 0.95)' }, // Indigo
      { fill: '#a855f7', glow: 'rgba(168, 85, 247, 0.95)' }, // Violet
      { fill: '#38bdf8', glow: 'rgba(56, 189, 248, 0.95)' },  // Cyan
      { fill: '#f472b6', glow: 'rgba(244, 114, 182, 0.95)' }, // Pink
      { fill: '#fbbf24', glow: 'rgba(251, 191, 36, 0.95)' },  // Warm Amber
      { fill: '#ffffff', glow: 'rgba(255, 255, 255, 1.0)' },  // Bright Twinkling Star
    ];
    const colorsLight = [
      { fill: '#4f46e5', glow: 'rgba(79, 70, 229, 0.75)' }, // Saturated Indigo
      { fill: '#7c3aed', glow: 'rgba(124, 58, 237, 0.75)' }, // Saturated Violet
      { fill: '#0d9488', glow: 'rgba(13, 148, 136, 0.75)' }, // Teal/Cyan
      { fill: '#db2777', glow: 'rgba(219, 39, 119, 0.75)' }, // Saturated Pink
      { fill: '#ea580c', glow: 'rgba(234, 88, 12, 0.75)' },  // Warm Orange
    ];

    const currentPalette = isDark ? colorsDark : colorsLight;

    const particles: Particle[] = Array.from({ length: particleCount }, () => {
      const col = currentPalette[Math.floor(Math.random() * currentPalette.length)];
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: -0.45 - Math.random() * 0.95, // Noticeable rising speed
        radius: 3 + Math.random() * 5, // Larger: 3 to 8 px
        color: col.fill,
        glowColor: col.glow,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.025 + Math.random() * 0.04,
        baseAlpha: isDark ? 0.70 + Math.random() * 0.28 : 0.55 + Math.random() * 0.32,
      };
    });

    // Mode B: Mirai Sakura Petals (if Mirai style selected)
    const petals: SakuraPetal[] = Array.from({ length: isMobile ? 20 : 40 }, () => {
      const colorTypes: SakuraPetal['colorType'][] = [
        'pink', 'pink', 'white', 'deepPink', 'cyberCyan', 'dataParticle'
      ];
      const colorType = colorTypes[Math.floor(Math.random() * colorTypes.length)];
      return {
        x: Math.random() * (width + 100) - 50,
        y: Math.random() * height,
        vx: 0.4 + Math.random() * 0.9,
        vy: 0.7 + Math.random() * 1.3,
        size: colorType === 'cyberCyan' || colorType === 'dataParticle' ? 3 + Math.random() * 3 : 8 + Math.random() * 9,
        rotationX: Math.random() * Math.PI * 2,
        rotationY: Math.random() * Math.PI * 2,
        rotationZ: Math.random() * Math.PI * 2,
        rotationSpeedX: (Math.random() - 0.5) * 0.03,
        rotationSpeedY: (Math.random() - 0.5) * 0.035,
        rotationSpeedZ: (Math.random() - 0.5) * 0.02,
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: 0.02 + Math.random() * 0.03,
        colorType,
        opacity: isDark ? 0.55 + Math.random() * 0.35 : 0.45 + Math.random() * 0.3,
      };
    });

    // Render loop
    const render = (now: number) => {
      const elapsed = now - lastTime;
      if (elapsed < 16) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }
      lastTime = now;

      // Parallax damping
      currentOffset.current.x += (targetOffset.current.x - currentOffset.current.x) * 0.05;
      currentOffset.current.y += (targetOffset.current.y - currentOffset.current.y) * 0.05;

      ctx.clearRect(0, 0, width, height);

      if (showMiraiScene) {
        // Draw Sakura Petals
        for (let i = 0; i < petals.length; i++) {
          const p = petals[i];
          if (isAnimationActive) {
            p.swayPhase += p.swaySpeed;
            p.rotationX += p.rotationSpeedX;
            p.rotationY += p.rotationSpeedY;
            p.rotationZ += p.rotationSpeedZ;
            p.x += p.vx + Math.sin(p.swayPhase) * 0.75;
            p.y += p.vy;
            if (p.y > height + 25) {
              p.y = -20;
              p.x = Math.random() * (width + 60) - 30;
            }
            if (p.x > width + 40) p.x = -20;
          }

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.scale(Math.cos(p.rotationY), Math.cos(p.rotationX));
          ctx.rotate(p.rotationZ);
          ctx.fillStyle = isDark ? `rgba(244, 114, 182, ${p.opacity})` : `rgba(236, 72, 153, ${p.opacity})`;
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      } else if (showParticles) {
        // Draw Particles & Constellation Lines
        const mouseX = mousePosRef.current.x;
        const mouseY = mousePosRef.current.y;
        const maxDist = 125;

        // 1. Constellation connecting lines with stronger stroke
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const pi = particles[i];
            const pj = particles[j];
            const dx = pi.x - pj.x;
            const dy = pi.y - pj.y;
            const dist = Math.hypot(dx, dy);

            if (dist < maxDist) {
              const alpha = (1 - dist / maxDist) * (isDark ? 0.45 : 0.34);
              ctx.strokeStyle = isDark
                ? `rgba(165, 180, 252, ${alpha})`
                : `rgba(99, 102, 241, ${alpha})`;
              ctx.lineWidth = 1.4;
              ctx.beginPath();
              ctx.moveTo(pi.x, pi.y);
              ctx.lineTo(pj.x, pj.y);
              ctx.stroke();
            }
          }
        }

        // 2. Particle points with soft glowing halo and dynamic cursor interaction
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];

          if (isAnimationActive) {
            p.twinklePhase += p.twinkleSpeed;
            p.x += p.vx;
            p.y += p.vy;

            // Mouse reaction: gentle repel within 160px
            const dx = p.x - mouseX;
            const dy = p.y - mouseY;
            const distToMouse = Math.hypot(dx, dy);
            if (distToMouse < 160 && distToMouse > 0) {
              const force = ((160 - distToMouse) / 160) * 1.8;
              p.x += (dx / distToMouse) * force;
              p.y += (dy / distToMouse) * force;
            }

            // Screen wrap
            if (p.y < -15) {
              p.y = height + 15;
              p.x = Math.random() * width;
            }
            if (p.x < -15) p.x = width + 15;
            if (p.x > width + 15) p.x = -15;
          }

          const currentAlpha = Math.min(
            1,
            Math.max(0.25, p.baseAlpha + Math.sin(p.twinklePhase) * 0.3)
          );

          ctx.save();
          ctx.shadowBlur = 10;
          ctx.shadowColor = p.glowColor;
          ctx.fillStyle = p.color;
          ctx.globalAlpha = currentAlpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, [isMounted, showParticles, showMiraiScene, isAnimationActive, isDark]);

  if (role !== 'student') return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none select-none overflow-hidden z-0 transition-opacity duration-700"
      style={{
        opacity: isMounted ? 1 : 0,
      }}
    >
      {/* ── Layer 1: Sky / Navy Base ── */}
      <div
        className={`absolute inset-0 transition-colors duration-1000 ${
          isDark
            ? 'bg-gradient-to-b from-[#03071e] via-[#070b28] to-[#0c0d32]'
            : 'bg-gradient-to-b from-[#f1f5f9] via-[#e2e8f0] to-[#f8fafc]'
        }`}
      />

      {/* ── Layer 1.2: Animated Mesh / Aurora Hue-Shift Gradient ── */}
      {showAurora && (
        <div
          className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${
            isAnimationActive ? 'animate-aurora' : ''
          }`}
          style={{
            backgroundImage: isDark
              ? `radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.52) 0px, transparent 55%),
                 radial-gradient(at 100% 0%, rgba(168, 85, 247, 0.50) 0px, transparent 55%),
                 radial-gradient(at 100% 100%, rgba(6, 182, 212, 0.44) 0px, transparent 55%),
                 radial-gradient(at 0% 100%, rgba(244, 63, 94, 0.42) 0px, transparent 55%),
                 radial-gradient(at 50% 50%, rgba(245, 158, 11, 0.28) 0px, transparent 65%)`
              : `radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.42) 0px, transparent 55%),
                 radial-gradient(at 100% 0%, rgba(168, 85, 247, 0.40) 0px, transparent 55%),
                 radial-gradient(at 100% 100%, rgba(13, 148, 136, 0.36) 0px, transparent 55%),
                 radial-gradient(at 0% 100%, rgba(244, 63, 94, 0.34) 0px, transparent 55%),
                 radial-gradient(at 50% 50%, rgba(249, 115, 22, 0.30) 0px, transparent 65%)`,
            filter: 'blur(45px)',
          }}
        />
      )}

      {/* ── Layer 2: Large Floating Gradient Orbs (40% to 70% viewport width) ── */}
      {showOrbs && (
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden transition-transform duration-700"
          style={{
            transform: `translate3d(${currentOffset.current.x * 0.25}px, ${currentOffset.current.y * 0.25}px, 0)`,
          }}
        >
          {/* Orb 1: Indigo/Violet (Top Left, 64vw) */}
          <div
            className={`absolute -top-[12vw] -left-[10vw] w-[64vw] h-[64vw] min-w-[360px] min-h-[360px] max-w-[820px] max-h-[820px] rounded-full blur-[65px] sm:blur-[95px] transition-all duration-1000 ${
              isAnimationActive ? 'animate-orb-1' : ''
            }`}
            style={{
              background: isDark
                ? 'radial-gradient(circle, rgba(99, 102, 241, 0.95) 0%, rgba(139, 92, 246, 0.72) 42%, transparent 72%)'
                : 'radial-gradient(circle, rgba(99, 102, 241, 0.78) 0%, rgba(139, 92, 246, 0.56) 42%, transparent 72%)',
              opacity: isDark ? 0.68 : 0.52,
            }}
          />

          {/* Orb 2: Cyan/Teal (Top Right, 58vw) */}
          <div
            className={`absolute top-[4vw] -right-[12vw] w-[58vw] h-[58vw] min-w-[320px] min-h-[320px] max-w-[760px] max-h-[760px] rounded-full blur-[65px] sm:blur-[95px] transition-all duration-1000 ${
              isAnimationActive ? 'animate-orb-2' : ''
            }`}
            style={{
              background: isDark
                ? 'radial-gradient(circle, rgba(6, 182, 212, 0.95) 0%, rgba(20, 184, 166, 0.72) 42%, transparent 72%)'
                : 'radial-gradient(circle, rgba(6, 182, 212, 0.75) 0%, rgba(20, 184, 166, 0.52) 42%, transparent 72%)',
              opacity: isDark ? 0.64 : 0.48,
            }}
          />

          {/* Orb 3: Pink/Rose/Fuchsia (Bottom Left/Center, 68vw) */}
          <div
            className={`absolute -bottom-[10vw] left-[12vw] w-[68vw] h-[68vw] min-w-[380px] min-h-[380px] max-w-[860px] max-h-[860px] rounded-full blur-[65px] sm:blur-[95px] transition-all duration-1000 ${
              isAnimationActive ? 'animate-orb-3' : ''
            }`}
            style={{
              background: isDark
                ? 'radial-gradient(circle, rgba(244, 63, 94, 0.95) 0%, rgba(236, 72, 153, 0.72) 42%, transparent 72%)'
                : 'radial-gradient(circle, rgba(244, 63, 94, 0.72) 0%, rgba(236, 72, 153, 0.50) 42%, transparent 72%)',
              opacity: isDark ? 0.62 : 0.46,
            }}
          />

          {/* Orb 4: Warm Orange / Amber Accent (Bottom Right, 52vw) */}
          <div
            className={`absolute bottom-[10vw] -right-[8vw] w-[52vw] h-[52vw] min-w-[300px] min-h-[300px] max-w-[680px] max-h-[680px] rounded-full blur-[65px] sm:blur-[95px] transition-all duration-1000 ${
              isAnimationActive ? 'animate-orb-4' : ''
            }`}
            style={{
              background: isDark
                ? 'radial-gradient(circle, rgba(249, 115, 22, 0.95) 0%, rgba(245, 158, 11, 0.72) 42%, transparent 72%)'
                : 'radial-gradient(circle, rgba(249, 115, 22, 0.70) 0%, rgba(245, 158, 11, 0.48) 42%, transparent 72%)',
              opacity: isDark ? 0.56 : 0.42,
            }}
          />

          {/* Orb 5: Center Pulsing Electric Violet/Indigo Core (50vw) */}
          <div
            className={`absolute top-[30vh] left-[25vw] w-[50vw] h-[50vw] min-w-[280px] min-h-[280px] max-w-[640px] max-h-[640px] rounded-full blur-[65px] sm:blur-[95px] transition-all duration-1000 ${
              isAnimationActive ? 'animate-orb-pulse' : ''
            }`}
            style={{
              background: isDark
                ? 'radial-gradient(circle, rgba(168, 85, 247, 0.95) 0%, rgba(99, 102, 241, 0.68) 42%, transparent 70%)'
                : 'radial-gradient(circle, rgba(168, 85, 247, 0.70) 0%, rgba(99, 102, 241, 0.46) 42%, transparent 70%)',
              opacity: isDark ? 0.58 : 0.44,
            }}
          />
        </div>
      )}

      {/* ── Layer 3: Floating Game-Themed Shapes (15% to 25% Opacity) ── */}
      {showGameShapes && isAnimationActive && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[
            // 1. Star ★
            {
              left: '8%',
              duration: '22s',
              delay: '0s',
              color: isDark ? 'text-amber-300/22' : 'text-amber-500/20',
              content: (
                <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2L14.8 8.6L22 9.2L16.5 14L18.2 21L12 17.2L5.8 21L7.5 14L2 9.2L9.2 8.6L12 2Z" />
                </svg>
              ),
            },
            // 2. Lightning Bolt ⚡
            {
              left: '22%',
              duration: '26s',
              delay: '4s',
              color: isDark ? 'text-yellow-300/22' : 'text-amber-600/20',
              content: (
                <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                  <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" />
                </svg>
              ),
            },
            // 3. Code Brackets { }
            {
              left: '36%',
              duration: '24s',
              delay: '9s',
              color: isDark ? 'text-cyan-300/24 font-mono font-bold' : 'text-indigo-600/22 font-mono font-bold',
              content: <span className="text-2xl">{'{ }'}</span>,
            },
            // 4. Gold Coin 🪙
            {
              left: '50%',
              duration: '20s',
              delay: '2s',
              color: isDark ? 'text-amber-400/22' : 'text-amber-600/20',
              content: (
                <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                  <path d="M12 7L13.5 10.5L17 11L14.2 13.5L15 17L12 15.2L9 17L9.8 13.5L7 11L10.5 10.5L12 7Z" />
                </svg>
              ),
            },
            // 5. Shield 🛡
            {
              left: '64%',
              duration: '28s',
              delay: '13s',
              color: isDark ? 'text-indigo-400/22' : 'text-indigo-600/20',
              content: (
                <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2L4 5V11C4 16.5 7.4 21.6 12 23C16.6 21.6 20 16.5 20 11V5L12 2Z" />
                </svg>
              ),
            },
            // 6. Book 📖
            {
              left: '78%',
              duration: '23s',
              delay: '7s',
              color: isDark ? 'text-purple-300/22' : 'text-purple-600/20',
              content: (
                <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4H6.5A2.5 2.5 0 0 0 4 6.5V19.5Z" />
                </svg>
              ),
            },
            // 7. Trophy 🏆
            {
              left: '90%',
              duration: '25s',
              delay: '16s',
              color: isDark ? 'text-amber-300/22' : 'text-amber-600/20',
              content: (
                <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                  <path d="M6 3H18V6H20A3 3 0 0 1 23 9C23 11.2 21.2 13 19 13H18C17.4 15.3 15.5 17 13 17.8V20H16V22H8V20H11V17.8C8.5 17 6.6 15.3 6 13H5A3 3 0 0 1 2 9C2 6.8 3.8 5 6 5V3M4 9C4 10.1 4.9 11 6 11V7C4.9 7 4 7.9 4 9M20 9C20 7.9 19.1 7 18 7V11C19.1 11 20 10.1 20 9Z" />
                </svg>
              ),
            },
            // 8. Code Tag </>
            {
              left: '16%',
              duration: '27s',
              delay: '11s',
              color: isDark ? 'text-cyan-300/22 font-mono font-bold' : 'text-teal-600/20 font-mono font-bold',
              content: <span className="text-xl">{'</>'}</span>,
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`absolute select-none pointer-events-none animate-game-shape ${item.color}`}
              style={{
                left: item.left,
                animationDuration: item.duration,
                animationDelay: item.delay,
              }}
            >
              {item.content}
            </div>
          ))}
        </div>
      )}

      {/* ── Layer 4: Mirai Cyber Scene (Preserved if user selects 'mirai') ── */}
      {showMiraiScene && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Kanji Watermark (未来 - Mirai) */}
          <div
            className={`absolute top-[12vh] right-[5vw] select-none pointer-events-none font-bold tracking-widest leading-none text-7xl sm:text-9xl md:text-[11rem] transition-opacity duration-1000 ${
              isDark ? 'text-indigo-400/10' : 'text-indigo-600/8'
            }`}
            style={{
              fontFamily: "'Noto Sans JP', 'Plus Jakarta Sans', system-ui, sans-serif",
            }}
          >
            未来
          </div>

          {/* Hanging Traditional Lanterns */}
          <div
            className={`absolute top-[16vh] left-[5vw] w-10 sm:w-14 pointer-events-none select-none ${
              isAnimationActive ? 'animate-bounce' : ''
            }`}
            style={{ animationDuration: '4s' }}
          >
            <svg viewBox="0 0 48 80" fill="none" className="w-full h-auto drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]">
              <line x1="24" y1="0" x2="24" y2="16" stroke={isDark ? '#94a3b8' : '#64748b'} strokeWidth="1.5" />
              <path d="M14 16 H34 L31 20 H17 Z" fill={isDark ? '#475569' : '#334155'} />
              <ellipse cx="24" cy="42" rx="14" ry="22" fill="url(#lanternGlow1)" />
              <path d="M18 24 C14 36 14 48 18 60" stroke="#b45309" strokeWidth="1" fill="none" opacity="0.6" />
              <path d="M30 24 C34 36 34 48 30 60" stroke="#b45309" strokeWidth="1" fill="none" opacity="0.6" />
              <path d="M17 64 H31 L29 68 H19 Z" fill={isDark ? '#475569' : '#334155'} />
              <line x1="24" y1="68" x2="24" y2="80" stroke="#e11d48" strokeWidth="2" />
              <defs>
                <radialGradient id="lanternGlow1" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="60%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#dc2626" />
                </radialGradient>
              </defs>
            </svg>
          </div>

          <div
            className={`absolute top-[20vh] right-[5vw] w-10 sm:w-14 pointer-events-none select-none ${
              isAnimationActive ? 'animate-bounce' : ''
            }`}
            style={{ animationDuration: '4.5s', animationDelay: '1.2s' }}
          >
            <svg viewBox="0 0 48 80" fill="none" className="w-full h-auto drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]">
              <line x1="24" y1="0" x2="24" y2="16" stroke={isDark ? '#94a3b8' : '#64748b'} strokeWidth="1.5" />
              <path d="M14 16 H34 L31 20 H17 Z" fill={isDark ? '#475569' : '#334155'} />
              <ellipse cx="24" cy="42" rx="14" ry="22" fill="url(#lanternGlow2)" />
              <path d="M18 24 C14 36 14 48 18 60" stroke="#b45309" strokeWidth="1" fill="none" opacity="0.6" />
              <path d="M30 24 C34 36 34 48 30 60" stroke="#b45309" strokeWidth="1" fill="none" opacity="0.6" />
              <path d="M17 64 H31 L29 68 H19 Z" fill={isDark ? '#475569' : '#334155'} />
              <line x1="24" y1="68" x2="24" y2="80" stroke="#e11d48" strokeWidth="2" />
              <defs>
                <radialGradient id="lanternGlow2" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="60%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#dc2626" />
                </radialGradient>
              </defs>
            </svg>
          </div>

          {/* Low Neon Sun */}
          <div
            className={`absolute top-[28vh] left-1/2 -translate-x-1/2 w-[220px] h-[220px] rounded-full shadow-2xl ${
              isAnimationActive ? 'animate-sun-pulse' : ''
            }`}
            style={{
              background: isDark
                ? 'radial-gradient(circle, #ff2a5f 0%, #e11d48 45%, #9f1239 100%)'
                : 'radial-gradient(circle, #fde047 0%, #fb923c 45%, #f43f5e 100%)',
              boxShadow: '0 0 55px rgba(244, 63, 94, 0.65)',
            }}
          />

          {/* Mount Fuji & Skyline */}
          <div className="absolute inset-x-0 bottom-0">
            <svg
              viewBox="0 0 1440 380"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-auto min-h-[200px]"
              preserveAspectRatio="none"
            >
              <path d="M360 380L620 150C660 110 780 110 820 150L1080 380H360Z" fill={isDark ? '#0b0f2e' : '#cbd5e1'} opacity="0.9" />
              <path d="M620 150C660 110 780 110 820 150C780 165 760 155 720 170C680 155 660 165 620 150Z" fill={isDark ? '#e0f2fe' : '#ffffff'} opacity="0.85" />
            </svg>
          </div>

          {/* Torii Gate Silhouette */}
          <div className="absolute bottom-[68px] sm:bottom-[84px] left-1/2 -translate-x-1/2 w-44 sm:w-60 h-32 sm:h-44 pointer-events-none select-none opacity-85">
            <svg
              viewBox="0 0 200 160"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full drop-shadow-[0_4px_16px_rgba(244,63,94,0.35)]"
            >
              <path
                d="M10 26 C45 20, 155 20, 190 26 L185 36 C155 31, 45 31, 15 36 Z"
                fill={isDark ? '#e11d48' : '#be123c'}
              />
              <rect x="25" y="42" width="150" height="10" rx="2" fill={isDark ? '#be123c' : '#9f1239'} />
              <path d="M50 42 L42 160 H56 L62 42 Z" fill={isDark ? '#be123c' : '#9f1239'} />
              <path d="M150 42 L144 160 H158 L156 42 Z" fill={isDark ? '#be123c' : '#9f1239'} />
              <rect x="35" y="72" width="130" height="8" rx="1.5" fill={isDark ? '#9f1239' : '#881337'} />
              <rect x="94" y="42" width="12" height="30" rx="1" fill={isDark ? '#881337' : '#4c0519'} />
            </svg>
          </div>

          {/* Perspective Grid Floor */}
          <div className="absolute bottom-0 inset-x-0 h-44 pointer-events-none overflow-hidden" style={{ perspective: '600px' }}>
            <div
              className="w-full h-full mirai-grid-floor"
              style={{
                transform: 'rotateX(68deg) translateY(-20px)',
                transformOrigin: 'bottom center',
                backgroundImage: isDark
                  ? `linear-gradient(to right, rgba(56, 189, 248, 0.22) 1px, transparent 1px),
                     linear-gradient(to bottom, rgba(168, 85, 247, 0.18) 1px, transparent 1px)`
                  : `linear-gradient(to right, rgba(99, 102, 241, 0.16) 1px, transparent 1px),
                     linear-gradient(to bottom, rgba(236, 72, 153, 0.14) 1px, transparent 1px)`,
              }}
            />
          </div>
        </div>
      )}

      {/* ── Layer 5: HTML5 Canvas for Particles & Constellations OR Sakura Petals ── */}
      {(showParticles || showMiraiScene) && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-500"
          style={{
            opacity: isDark ? 0.95 : 0.88,
          }}
        />
      )}

      {/* ── Layer 6: Visible Bottom Glow, Edge Glows & Perimeter Vignette ── */}
      {/* Radiant Bottom-of-Page Glow (visible even on pages with lots of content) */}
      <div
        className={`absolute bottom-0 inset-x-0 h-72 sm:h-96 pointer-events-none transition-opacity duration-700 ${
          isDark
            ? 'bg-gradient-to-t from-indigo-950/80 via-purple-950/40 to-transparent'
            : 'bg-gradient-to-t from-indigo-300/50 via-purple-200/30 to-transparent'
        }`}
      />

      {/* Left Edge Ambient Glow */}
      <div
        className={`absolute top-0 bottom-0 left-0 w-24 sm:w-48 pointer-events-none transition-opacity duration-700 ${
          isDark
            ? 'bg-gradient-to-r from-indigo-500/20 via-purple-500/5 to-transparent'
            : 'bg-gradient-to-r from-indigo-400/25 via-purple-300/10 to-transparent'
        }`}
      />

      {/* Right Edge Ambient Glow */}
      <div
        className={`absolute top-0 bottom-0 right-0 w-24 sm:w-48 pointer-events-none transition-opacity duration-700 ${
          isDark
            ? 'bg-gradient-to-l from-cyan-500/20 via-teal-500/5 to-transparent'
            : 'bg-gradient-to-l from-cyan-400/25 via-teal-300/10 to-transparent'
        }`}
      />

      {/* Top Edge Ambient Bleed */}
      <div
        className={`absolute top-0 inset-x-0 h-32 pointer-events-none transition-opacity duration-700 ${
          isDark
            ? 'bg-gradient-to-b from-indigo-500/15 via-purple-500/5 to-transparent'
            : 'bg-gradient-to-b from-indigo-400/15 via-purple-300/5 to-transparent'
        }`}
      />

      {/* Perimeter Vignette */}
      <div
        className={`absolute inset-0 pointer-events-none transition-colors duration-700 ${
          isDark
            ? 'bg-radial-[ellipse_at_center,_transparent_45%,_rgba(3,7,30,0.35)_100%]'
            : 'bg-radial-[ellipse_at_center,_transparent_45%,_rgba(241,245,249,0.22)_100%]'
        }`}
      />
    </div>
  );
};
