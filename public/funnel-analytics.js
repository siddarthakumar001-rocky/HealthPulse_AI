/**
 * Funnel & Engagement Client Tracker (Vanilla JavaScript)
 * Compatible with: Google Analytics 4, Mixpanel, Amplitude, and Custom Server Endpoints.
 * 
 * Embed: <script src="/funnel-analytics.js" defer></script>
 */
(function(window) {
  'use strict';

  var FunnelTracker = function(options) {
    this.options = options || {};
    this.endpoint = this.options.endpoint || '/api/track';
    this.sessionId = this._initSession();
    this.startTime = Date.now();
    this.activeDwell = 0;
    this.lastActive = Date.now();
    this.isFocus = true;

    this._bindEvents();
    this.trackLand();
  };

  FunnelTracker.prototype._initSession = function() {
    var sid = sessionStorage.getItem('__f_sid');
    if (!sid) {
      sid = 's_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
      sessionStorage.setItem('__f_sid', sid);
    }
    return sid;
  };

  FunnelTracker.prototype._bindEvents = function() {
    var self = this;

    // Track dwell focus on visibility changes
    document.addEventListener('visibilitychange', function() {
      if (document.visibilityState === 'hidden') {
        self._accumulateTime();
        self.isFocus = false;
        self._flushTime();
      } else {
        self.isFocus = true;
        self.lastActive = Date.now();
      }
    });

    window.addEventListener('beforeunload', function() {
      self._accumulateTime();
      self._flushTime();
    });

    ['click', 'scroll', 'keydown'].forEach(function(evt) {
      window.addEventListener(evt, function() {
        if (self.isFocus) {
          var now = Date.now();
          if (now - self.lastActive < 60000) {
            self.activeDwell += (now - self.lastActive);
          }
          self.lastActive = now;
        }
      }, { passive: true });
    });
  };

  FunnelTracker.prototype._accumulateTime = function() {
    var now = Date.now();
    if (this.isFocus && (now - this.lastActive < 60000)) {
      this.activeDwell += (now - this.lastActive);
    }
    this.lastActive = now;
  };

  FunnelTracker.prototype.getTimeSpent = function() {
    this._accumulateTime();
    return Math.max(1, Math.round(this.activeDwell / 1000));
  };

  FunnelTracker.prototype.emit = function(eventName, payload) {
    var eventData = Object.assign({
      session_id: this.sessionId,
      url: window.location.href,
      path: window.location.pathname,
      timestamp: new Date().toISOString()
    }, payload);

    // 1. Google Analytics 4
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, eventData);
    }

    // 2. Mixpanel
    if (window.mixpanel && typeof window.mixpanel.track === 'function') {
      window.mixpanel.track(eventName, eventData);
    }

    // 3. Amplitude
    if (window.amplitude) {
      if (typeof window.amplitude.track === 'function') {
        window.amplitude.track(eventName, eventData);
      } else if (window.amplitude.getInstance) {
        window.amplitude.getInstance().logEvent(eventName, eventData);
      }
    }

    // 4. Backend Beacon
    if (navigator.sendBeacon) {
      var blob = new Blob([JSON.stringify({ events: [{
        sessionId: this.sessionId,
        eventType: 'custom',
        path: window.location.pathname,
        elementId: eventName,
        timeSpent: eventData.time_spent_seconds || 0,
        deviceType: /Mobi|Android/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
        timestamp: new Date().toISOString()
      }] })], { type: 'application/json' });
      navigator.sendBeacon(this.endpoint, blob);
    }
  };

  FunnelTracker.prototype._flushTime = function() {
    this.emit('page_engagement_duration', {
      time_spent_seconds: this.getTimeSpent()
    });
  };

  // Funnel Step Methods
  FunnelTracker.prototype.trackLand = function() {
    this.emit('funnel_step_1_land', { step: 1, step_name: 'land_on_site' });
  };

  FunnelTracker.prototype.trackViewProduct = function(productId, productName, price) {
    this.emit('funnel_step_2_view_product', {
      step: 2,
      step_name: 'view_product',
      product_id: productId,
      product_name: productName,
      price: price
    });
  };

  FunnelTracker.prototype.trackAddToCart = function(productId, price, qty) {
    this.emit('funnel_step_3_add_to_cart', {
      step: 3,
      step_name: 'add_to_cart',
      product_id: productId,
      price: price,
      quantity: qty || 1
    });
  };

  FunnelTracker.prototype.trackPurchase = function(orderId, total, items) {
    this.emit('funnel_step_4_purchase', {
      step: 4,
      step_name: 'purchase',
      order_id: orderId,
      total_amount: total,
      items: items || []
    });
  };

  FunnelTracker.prototype.trackClick = function(elementId, label) {
    this.emit('button_click', {
      element_id: elementId,
      label: label,
      time_on_page: this.getTimeSpent()
    });
  };

  // Expose global instance
  window.FunnelAnalytics = new FunnelTracker();
})(window);
