export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
  userId?: string;
}

export class Analytics {
  private static isInitialized = false;
  private static isDevelopment = process.env.NODE_ENV === 'development';

  static initialize() {
    if (this.isInitialized || typeof window === 'undefined') return;
    
    // Initialize analytics providers here (GA4, Segment, etc.)
    if (!this.isDevelopment) {
      // Production analytics initialization
      this.isInitialized = true;
    }
  }

  static track(event: AnalyticsEvent) {
    if (typeof window === 'undefined') return;

    if (this.isDevelopment) {
      console.log('[Analytics]', event);
      return;
    }

    // Send to analytics providers
    try {
      // Google Analytics 4
      if ((window as unknown as Record<string, unknown>).gtag) {
        (window as unknown as Record<string, unknown>).gtag('event', event.name, event.properties);
      }

      // Segment
      if ((window as unknown as Record<string, unknown>).analytics) {
        (window as unknown as Record<string, unknown>).analytics.track(event.name, event.properties);
      }
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }

  static page(pageName: string, properties?: Record<string, unknown>) {
    this.track({
      name: 'Page View',
      properties: {
        page: pageName,
        ...properties,
      },
    });
  }

  static identify(userId: string, traits?: Record<string, unknown>) {
    if (typeof window === 'undefined' || this.isDevelopment) return;

    try {
      if ((window as unknown as Record<string, unknown>).analytics) {
        (window as unknown as Record<string, unknown>).analytics.identify(userId, traits);
      }
    } catch (error) {
      console.error('Analytics identify error:', error);
    }
  }
}

// Event tracking helpers
export const trackEvent = {
  buttonClick: (buttonName: string, location: string) => {
    Analytics.track({
      name: 'Button Clicked',
      properties: { buttonName, location },
    });
  },

  formSubmit: (formName: string, success: boolean) => {
    Analytics.track({
      name: 'Form Submitted',
      properties: { formName, success },
    });
  },

  searchPerformed: (query: string, resultsCount: number) => {
    Analytics.track({
      name: 'Search Performed',
      properties: { query, resultsCount },
    });
  },

  eventViewed: (eventId: string, eventName: string) => {
    Analytics.track({
      name: 'Event Viewed',
      properties: { eventId, eventName },
    });
  },

  ticketPurchased: (eventId: string, quantity: number, amount: number) => {
    Analytics.track({
      name: 'Ticket Purchased',
      properties: { eventId, quantity, amount },
    });
  },
};
