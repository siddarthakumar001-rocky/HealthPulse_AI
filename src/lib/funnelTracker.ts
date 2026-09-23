/**
 * Production-Ready Unified Funnel & Engagement Tracker
 * Dispatches to: Mixpanel, Amplitude, Google Analytics 4 (GA4), and Internal Server (/api/track)
 */

export interface FunnelStepData {
  step: 1 | 2 | 3 | 4;
  stepName: 'land_on_site' | 'view_product' | 'add_to_cart' | 'purchase';
  [key: string]: any;
}

export interface PageviewData {
  url: string;
  path: string;
  referrer: string;
  title: string;
  timeSpentSeconds?: number;
  [key: string]: any;
}

// Window declarations for external analytics SDKs
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    mixpanel?: {
      track: (eventName: string, props?: Record<string, any>) => void;
      identify?: (userId: string) => void;
    };
    amplitude?: {
      track: (eventName: string, props?: Record<string, any>) => void;
      setUserId?: (userId: string) => void;
      getInstance?: () => {
        logEvent: (eventName: string, props?: Record<string, any>) => void;
        setUserId: (userId: string) => void;
      };
    };
  }
}

class UnifiedFunnelTracker {
  private sessionId: string;
  private currentPath: string;
  private pageStartTime: number;
  private activeTimeAccumulator: number = 0;
  private lastActiveTimestamp: number;
  private isTabActive: boolean = true;
  private backendEndpoint: string;

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.currentPath = window.location.pathname;
    this.pageStartTime = Date.now();
    this.lastActiveTimestamp = Date.now();
    
    const API_BASE = window.location.hostname === 'localhost' 
      ? 'http://localhost:5001/api' 
      : 'https://health-931r.onrender.com/api';
    this.backendEndpoint = `${API_BASE}/track`;

    this.initListeners();
    this.trackLandOnSite();
  }

  private getOrCreateSessionId(): string {
    let sid = sessionStorage.getItem('__funnel_sid');
    if (!sid) {
      sid = 'sid_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
      sessionStorage.setItem('__funnel_sid', sid);
    }
    return sid;
  }

  private initListeners() {
    // 1. Focus & Tab Visibility tracking
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.updateActiveDwell();
        this.isTabActive = false;
        this.sendBeaconTimeSpent();
      } else {
        this.isTabActive = true;
        this.lastActiveTimestamp = Date.now();
      }
    });

    // 2. Unload / Page Exit tracking
    window.addEventListener('beforeunload', () => {
      this.updateActiveDwell();
      this.sendBeaconTimeSpent();
    });

    // 3. User activity heartbeats to ensure true focus
    ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'].forEach(evt => {
      window.addEventListener(evt, () => {
        if (this.isTabActive) {
          const now = Date.now();
          // If inactive for > 60s, don't count idle gap
          if (now - this.lastActiveTimestamp < 60000) {
            this.activeTimeAccumulator += (now - this.lastActiveTimestamp);
          }
          this.lastActiveTimestamp = now;
        }
      }, { passive: true });
    });
  }

  private updateActiveDwell() {
    const now = Date.now();
    if (this.isTabActive && now - this.lastActiveTimestamp < 60000) {
      this.activeTimeAccumulator += (now - this.lastActiveTimestamp);
    }
    this.lastActiveTimestamp = now;
  }

  private getActiveTimeSeconds(): number {
    this.updateActiveDwell();
    return Math.max(1, Math.round(this.activeTimeAccumulator / 1000));
  }

  private dispatchToVendors(eventName: string, properties: Record<string, any>) {
    const fullProps = {
      ...properties,
      session_id: this.sessionId,
      timestamp: new Date().toISOString(),
      page_url: window.location.href,
      page_path: window.location.pathname
    };

    // A. Google Analytics 4 (GA4)
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, fullProps);
    }

    // B. Mixpanel
    if (window.mixpanel && typeof window.mixpanel.track === 'function') {
      window.mixpanel.track(eventName, fullProps);
    }

    // C. Amplitude
    if (window.amplitude) {
      if (typeof window.amplitude.track === 'function') {
        window.amplitude.track(eventName, fullProps);
      } else if (window.amplitude.getInstance) {
        window.amplitude.getInstance().logEvent(eventName, fullProps);
      }
    }

    // D. Internal Backend Telemetry (for SysAdmin Portal)
    this.sendToBackend({
      sessionId: this.sessionId,
      eventType: eventName.includes('step') ? 'click' : 'pageview',
      path: window.location.pathname,
      elementId: eventName,
      timeSpent: properties.time_spent_seconds || 0,
      deviceType: /Mobi|Android/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
      timestamp: new Date().toISOString()
    });
  }

  private sendToBackend(payload: Record<string, any>) {
    if (window.location.pathname.startsWith('/admin')) return;

    const data = JSON.stringify({ events: [payload] });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(this.backendEndpoint, new Blob([data], { type: 'application/json' }));
    } else {
      fetch(this.backendEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: data,
        keepalive: true
      }).catch(() => {});
    }
  }

  private sendBeaconTimeSpent() {
    const timeSpent = this.getActiveTimeSeconds();
    this.dispatchToVendors('page_engagement_duration', {
      path: this.currentPath,
      time_spent_seconds: timeSpent
    });
  }

  // --- PUBLIC API METHODS ---

  /**
   * Track Standard Pageview with Referrer, Title, and previous page dwell duration
   */
  public trackPageview(customPath?: string) {
    const newPath = customPath || window.location.pathname;

    // Send dwell time of prior page if transitioning
    if (this.currentPath && this.currentPath !== newPath) {
      const timeSpent = this.getActiveTimeSeconds();
      this.dispatchToVendors('page_engagement_duration', {
        path: this.currentPath,
        time_spent_seconds: timeSpent
      });
      // Reset accumulator for new page
      this.activeTimeAccumulator = 0;
      this.pageStartTime = Date.now();
      this.lastActiveTimestamp = Date.now();
    }

    this.currentPath = newPath;

    const pageData: PageviewData = {
      url: window.location.href,
      path: newPath,
      referrer: document.referrer || '$direct',
      title: document.title
    };

    this.dispatchToVendors('page_view', pageData);
  }

  /**
   * Step 1: Land on Site
   */
  public trackLandOnSite(metadata: Record<string, any> = {}) {
    this.dispatchToVendors('funnel_step_1_land', {
      funnel_step: 1,
      funnel_name: 'land_on_site',
      landing_page: window.location.pathname,
      entry_timestamp: new Date().toISOString(),
      ...metadata
    });
  }

  /**
   * Step 2: View Product / Service Details
   */
  public trackViewProduct(productId: string, productName: string, price?: number, category?: string) {
    this.dispatchToVendors('funnel_step_2_view_product', {
      funnel_step: 2,
      funnel_name: 'view_product',
      product_id: productId,
      product_name: productName,
      price: price || 0,
      category: category || 'Default'
    });
  }

  /**
   * Step 3: Add to Cart / Initiate Action
   */
  public trackAddToCart(productId: string, productName: string, price: number, quantity: number = 1) {
    this.dispatchToVendors('funnel_step_3_add_to_cart', {
      funnel_step: 3,
      funnel_name: 'add_to_cart',
      product_id: productId,
      product_name: productName,
      item_price: price,
      quantity,
      cart_value: price * quantity
    });
  }

  /**
   * Step 4: Purchase / Order Confirmation
   */
  public trackPurchase(transactionId: string, totalAmount: number, items: Array<{ id: string; name: string; price: number }>) {
    this.dispatchToVendors('funnel_step_4_purchase', {
      funnel_step: 4,
      funnel_name: 'purchase',
      transaction_id: transactionId,
      total_amount: totalAmount,
      items_count: items.length,
      items
    });
  }

  /**
   * Generic button-click tracker for conversion elements
   */
  public trackButtonClick(buttonId: string, buttonLabel: string, funnelStep?: 1 | 2 | 3 | 4) {
    this.dispatchToVendors('button_click', {
      button_id: buttonId,
      button_label: buttonLabel,
      funnel_step: funnelStep || null,
      current_page: window.location.pathname,
      time_on_page: this.getActiveTimeSeconds()
    });
  }
}

export const funnelTracker = new UnifiedFunnelTracker();
