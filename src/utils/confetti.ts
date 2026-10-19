import confetti from 'canvas-confetti';

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function fireConfetti(options?: confetti.Options) {
  if (prefersReducedMotion()) return;
  try {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'],
      ...options,
    });
  } catch (err) {
    // Graceful fallback if canvas is not supported
    console.debug('Confetti effect failed', err);
  }
}

export function fireLevelUpConfetti() {
  if (prefersReducedMotion()) return;
  try {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999,
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      colors: ['#6366f1', '#8b5cf6'],
    });
    fire(0.2, {
      spread: 60,
      colors: ['#10b981', '#34d399'],
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      colors: ['#f59e0b', '#fbbf24', '#ffffff'],
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  } catch (err) {
    console.debug('Level up confetti failed', err);
  }
}
