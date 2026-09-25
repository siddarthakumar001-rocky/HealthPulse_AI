import { v4 as uuidv4 } from 'uuid';

const getBaseApiUrl = () => {
  const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const local = (import.meta.env.VITE_API_URL_LOCAL || `http://localhost:${import.meta.env.VITE_PORT || 5001}/api`).replace(/\/+$/, '');
  const remote = (import.meta.env.VITE_API_URL || 'https://health-931r.onrender.com/api').replace(/\/+$/, '');
  return isLocal ? local : (remote.endsWith('/api') ? remote : `${remote}/api`);
};

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const FLUSH_INTERVAL = 10000; // 10 seconds

interface TrackEvent {
  sessionId: string;
  userId?: string;
  eventType: 'pageview' | 'click' | 'time';
  path: string;
  elementId?: string;
  timeSpent?: number;
  deviceType: string;
  timestamp: string;
}

class Tracker {
  private sessionId: string;
  private queue: TrackEvent[] = [];
  private lastActive: number;
  private flushTimer: any;
  private heartbeatTimer: any;
  private pageStartTime: number;
  private currentPath: string;

  constructor() {
    this.sessionId = this.getOrCreateSession();
    this.lastActive = Date.now();
    this.pageStartTime = Date.now();
    this.currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';

    if (typeof window !== 'undefined') {
      this.setupListeners();
      this.startPeriodicFlush();
      this.startHeartbeat();
    }
  }

  private getOrCreateSession(): string {
    if (typeof sessionStorage === 'undefined') return uuidv4();
    const stored = sessionStorage.getItem('__hp_session');
    const storedTime = sessionStorage.getItem('__hp_session_time');
    const now = Date.now();

    if (stored && storedTime && (now - parseInt(storedTime, 10) < SESSION_TIMEOUT)) {
      sessionStorage.setItem('__hp_session_time', now.toString());
      return stored;
    }

    const newSession = uuidv4();
    sessionStorage.setItem('__hp_session', newSession);
    sessionStorage.setItem('__hp_session_time', now.toString());
    return newSession;
  }

  private updateSessionTime() {
    this.lastActive = Date.now();
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('__hp_session_time', this.lastActive.toString());
    }
  }

  private getDeviceType(): string {
    if (typeof navigator === 'undefined') return 'Desktop';
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return 'Tablet';
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) return 'Mobile';
    return 'Desktop';
  }

  private getUser(): string | undefined {
    if (typeof localStorage === 'undefined') return undefined;
    const auth = localStorage.getItem('supabase.auth.token');
    if (auth) {
      try {
        const parsed = JSON.parse(auth);
        return parsed?.currentSession?.user?.id;
      } catch (e) {
        return undefined;
      }
    }
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        const decoded = JSON.parse(jsonPayload);
        return decoded?.id || decoded?.userId || decoded?.email;
      } catch (e) {
        return undefined;
      }
    }
    return undefined;
  }

  public track(eventType: 'pageview' | 'click' | 'time', data: Partial<TrackEvent> = {}) {
    if (typeof window === 'undefined') return;
    const currentPath = data.path || window.location.pathname;
    
    // Exclude internal admin management views from end-user analytics
    if (currentPath.startsWith('/admin') || currentPath === '/admin-login') {
      return;
    }

    this.updateSessionTime();
    
    const event: TrackEvent = {
      sessionId: this.sessionId,
      userId: this.getUser(),
      eventType,
      path: currentPath,
      elementId: data.elementId,
      timeSpent: data.timeSpent,
      deviceType: this.getDeviceType(),
      timestamp: new Date().toISOString(),
    };

    this.queue.push(event);

    if (this.queue.length >= 10) {
      this.flush();
    }
  }

  public pageview(path: string) {
    if (this.currentPath && this.currentPath !== path) {
      const timeSpent = Math.round((Date.now() - this.pageStartTime) / 1000);
      if (timeSpent > 0) {
        this.track('time', { path: this.currentPath, timeSpent });
      }
    }

    this.currentPath = path;
    this.pageStartTime = Date.now();
    this.track('pageview', { path });
    // Flush pageview immediately so active users and live counters update in real time
    this.flush();
  }

  public click(elementId: string) {
    this.track('click', { elementId });
  }

  public async flush() {
    if (this.queue.length === 0) return;

    const eventsToSend = [...this.queue];
    this.queue = [];

    const payload = JSON.stringify({ events: eventsToSend });
    const endpoint = `${getBaseApiUrl()}/track`;

    try {
      if (typeof fetch !== 'undefined') {
        await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true
        });
      } else if (navigator.sendBeacon) {
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon(endpoint, blob);
      }
    } catch (err) {
      console.warn('[Tracker] Flush error:', err);
      if (this.queue.length < 50) {
        this.queue.unshift(...eventsToSend);
      }
    }
  }

  private startPeriodicFlush() {
    this.flushTimer = setInterval(() => this.flush(), FLUSH_INTERVAL);
  }

  private startHeartbeat() {
    // Send a periodic heartbeat ping every 45s while tab is visible and not an admin view
    this.heartbeatTimer = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible' && !window.location.pathname.startsWith('/admin')) {
        this.track('time', { path: this.currentPath, timeSpent: 45 });
        this.flush();
      }
    }, 45000);
  }

  private setupListeners() {
    // Flush on page hide/unload
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        const timeSpent = Math.round((Date.now() - this.pageStartTime) / 1000);
        if (timeSpent > 0) {
          this.track('time', { path: this.currentPath, timeSpent });
        }
        this.flush();
      } else {
        this.pageStartTime = Date.now();
        this.updateSessionTime();
      }
    });

    window.addEventListener('beforeunload', () => {
      const timeSpent = Math.round((Date.now() - this.pageStartTime) / 1000);
      if (timeSpent > 0) {
        this.track('time', { path: this.currentPath, timeSpent });
      }
      this.flush();
    });

    // Global click listener for actionable elements
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (!target || !target.closest) return;
      const clickable = target.closest('button, a, [role="button"], [data-track]');
      if (clickable) {
        const id = clickable.getAttribute('id') || clickable.getAttribute('data-track') || clickable.textContent?.trim().slice(0, 30) || clickable.tagName.toLowerCase();
        if (id) {
          this.click(`Click: ${id}`);
        }
      }
    }, { capture: true, passive: true });
  }
}

// Export singleton instance
export const tracker = new Tracker();
