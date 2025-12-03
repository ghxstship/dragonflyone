"use client";

import { useCallback, useEffect, useRef } from "react";

// =============================================================================
// GENERATOR ANALYTICS HOOK
// Tracks user interactions in the experience generator
// =============================================================================

type EventType =
  | "page_view"
  | "input_focus"
  | "generation_started"
  | "generation_completed"
  | "generation_failed"
  | "tab_viewed"
  | "pdf_download_started"
  | "pdf_download_completed"
  | "share_clicked"
  | "share_completed"
  | "export_clicked"
  | "export_completed"
  | "lead_captured"
  | "example_seed_clicked"
  | "reset_clicked";

interface EventData {
  [key: string]: string | number | boolean | undefined;
}

interface AnalyticsOptions {
  blueprintId?: string;
  creativeSeed?: string;
}

// Generate a session ID for tracking
function getSessionId(): string {
  if (typeof window === "undefined") return "";
  
  let sessionId = sessionStorage.getItem("generator_session_id");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem("generator_session_id", sessionId);
  }
  return sessionId;
}

// Get UTM parameters from URL
function getUtmParams(): Record<string, string | null> {
  if (typeof window === "undefined") return {};
  
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get("utm_source"),
    utm_medium: params.get("utm_medium"),
    utm_campaign: params.get("utm_campaign"),
  };
}

export function useGeneratorAnalytics(options: AnalyticsOptions = {}) {
  const { blueprintId, creativeSeed } = options;
  const startTimeRef = useRef<number>(Date.now());
  const hasTrackedPageView = useRef(false);

  // Track page view on mount
  useEffect(() => {
    if (!hasTrackedPageView.current) {
      hasTrackedPageView.current = true;
      trackEvent("page_view");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const trackEvent = useCallback(
    async (eventType: EventType, eventData: EventData = {}) => {
      try {
        const sessionId = getSessionId();
        const utmParams = getUtmParams();
        const durationMs = Date.now() - startTimeRef.current;

        // Send to analytics API
        await fetch("/api/generator/analytics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventType,
            eventData,
            blueprintId,
            creativeSeed,
            sessionId,
            pageUrl: typeof window !== "undefined" ? window.location.href : "",
            referrer: typeof document !== "undefined" ? document.referrer : "",
            durationMs,
            ...utmParams,
          }),
        });

        // Also send to Google Analytics if available
        if (typeof window !== "undefined" && "gtag" in window) {
          (window as unknown as { gtag: (...args: unknown[]) => void }).gtag("event", eventType, {
            event_category: "generator",
            event_label: creativeSeed || blueprintId,
            ...eventData,
          });
        }

        // Also send to Vercel Analytics if available
        if (typeof window !== "undefined" && "va" in window) {
          (window as unknown as { va: (event: string, data: Record<string, unknown>) => void }).va("event", {
            name: eventType,
            data: { ...eventData, blueprintId, creativeSeed },
          });
        }
      } catch (error) {
        // Silently fail - don't block user actions for analytics
        console.debug("Analytics tracking failed:", error);
      }
    },
    [blueprintId, creativeSeed]
  );

  // Convenience methods for common events
  const trackGenerationStarted = useCallback(
    (seed: string) => {
      startTimeRef.current = Date.now();
      trackEvent("generation_started", { creative_seed: seed });
    },
    [trackEvent]
  );

  const trackGenerationCompleted = useCallback(
    (seed: string, generatedWithAI: boolean) => {
      const durationMs = Date.now() - startTimeRef.current;
      trackEvent("generation_completed", {
        creative_seed: seed,
        generated_with_ai: generatedWithAI,
        duration_ms: durationMs,
      });
    },
    [trackEvent]
  );

  const trackGenerationFailed = useCallback(
    (seed: string, error: string) => {
      trackEvent("generation_failed", {
        creative_seed: seed,
        error_message: error,
      });
    },
    [trackEvent]
  );

  const trackTabViewed = useCallback(
    (tabName: string) => {
      trackEvent("tab_viewed", { tab_name: tabName });
    },
    [trackEvent]
  );

  const trackPdfDownload = useCallback(
    (started: boolean) => {
      trackEvent(started ? "pdf_download_started" : "pdf_download_completed");
    },
    [trackEvent]
  );

  const trackShare = useCallback(
    (completed: boolean) => {
      trackEvent(completed ? "share_completed" : "share_clicked");
    },
    [trackEvent]
  );

  const trackExport = useCallback(
    (completed: boolean) => {
      trackEvent(completed ? "export_completed" : "export_clicked");
    },
    [trackEvent]
  );

  const trackExampleSeedClicked = useCallback(
    (seed: string) => {
      trackEvent("example_seed_clicked", { seed });
    },
    [trackEvent]
  );

  const trackReset = useCallback(() => {
    trackEvent("reset_clicked");
  }, [trackEvent]);

  return {
    trackEvent,
    trackGenerationStarted,
    trackGenerationCompleted,
    trackGenerationFailed,
    trackTabViewed,
    trackPdfDownload,
    trackShare,
    trackExport,
    trackExampleSeedClicked,
    trackReset,
  };
}
