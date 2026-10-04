export const ALL_HOME_SECTIONS = [
  'themes',
  'speakers',
  'corporate-members',
  'leadership',
  'register-cta',
  'ceo-spotlight',
  'why-attend',
  'venue-highlights',
  'the-venue',
  'early-bird',
] as const;

// Global flag to prevent scroll events from overwriting saved section during restoration
let isRestorationInProgress = false;

export function setRestorationInProgress(val: boolean): void {
  isRestorationInProgress = val;
}

export function getRestorationInProgress(): boolean {
  return isRestorationInProgress;
}

export function getActiveHomeSection(): string | null {
  if (typeof window === 'undefined') return null;
  const y = window.scrollY || document.documentElement.scrollTop || 0;
  if (y < 220) return null; // Hero section / top of page

  // Check if scrolled near the bottom of the page
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  if (maxScroll > 0 && y >= maxScroll - 60) {
    return 'early-bird';
  }

  // The center of the viewport represents what the user is currently reading
  const viewportCenter = window.innerHeight * 0.45;
  const navbarHeight = 80;

  // 1. Check if a section directly encompasses the reading focal center
  for (const secId of ALL_HOME_SECTIONS) {
    const el = document.getElementById(secId);
    if (el) {
      const rect = el.getBoundingClientRect();
      if (rect.top <= viewportCenter && rect.bottom >= viewportCenter) {
        return secId;
      }
    }
  }

  // 2. Otherwise find the section with the largest visible footprint on screen
  let bestSec: string | null = null;
  let maxVisible = 0;

  for (const secId of ALL_HOME_SECTIONS) {
    const el = document.getElementById(secId);
    if (el) {
      const rect = el.getBoundingClientRect();
      const visibleTop = Math.max(navbarHeight, rect.top);
      const visibleBottom = Math.min(window.innerHeight, rect.bottom);
      const visibleHeight = Math.max(0, visibleBottom - visibleTop);
      if (visibleHeight > maxVisible) {
        maxVisible = visibleHeight;
        bestSec = secId;
      }
    }
  }

  return bestSec;
}

export function saveCurrentHomeSection(): void {
  if (typeof window === 'undefined') return;
  // If we are currently restoring a previous section, do NOT overwrite with intermediate scroll positions
  if (isRestorationInProgress) return;

  const y = window.scrollY || document.documentElement.scrollTop || 0;
  const activeSec = getActiveHomeSection();

  if (activeSec) {
    sessionStorage.setItem('cib_home_section', activeSec);
    sessionStorage.setItem('cib_active_section', activeSec);
    sessionStorage.setItem('cib_last_home_scroll', String(y));
  } else if (y < 220) {
    sessionStorage.removeItem('cib_home_section');
    sessionStorage.removeItem('cib_active_section');
    sessionStorage.setItem('cib_last_home_scroll', '0');
  }
}
