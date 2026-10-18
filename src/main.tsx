import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Mount React
const root = createRoot(document.getElementById('root')!);
root.render(<App />);

/**
 * Dismiss the splash screen after React has mounted.
 * We wait at least 2 000 ms so the loading animation has time to complete
 * (and the UX remains consistent on fast connections).
 * The CSS transition on #splash handles the smooth fade-out.
 */
const MIN_SPLASH_MS = 2000;
const splashStart = performance.now();

function hideSplash() {
  const splash = document.getElementById('splash');
  if (!splash) return;
  splash.classList.add('splash-hidden');
  // Remove from DOM after fade completes (500 ms matches CSS transition)
  setTimeout(() => splash.remove(), 520);
}

const elapsed = performance.now() - splashStart;
const remaining = Math.max(0, MIN_SPLASH_MS - elapsed);
setTimeout(hideSplash, remaining);
