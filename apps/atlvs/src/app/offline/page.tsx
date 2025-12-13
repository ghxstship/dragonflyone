"use client";

/**
 * Offline Page
 * Displayed when user is offline and page is not cached
 */

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-primary p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-24 h-24 mx-auto bg-surface-secondary rounded-modal flex items-center justify-center border-2 border-ink-muted">
          <svg
            className="w-12 h-12 text-ink-secondary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
            />
          </svg>
        </div>

        <div className="space-y-2">
          <h1 className="text-h2-desktop text-ink-primary font-weight-bold">
            You&apos;re Offline
          </h1>
          <p className="text-body-lg text-ink-secondary">
            It looks like you&apos;ve lost your internet connection. Some features may be unavailable.
          </p>
        </div>

        <div className="bg-surface-secondary rounded-card p-4 border-2 border-ink-muted">
          <h2 className="text-body-lg font-weight-semibold text-ink-primary mb-2">
            What you can do:
          </h2>
          <ul className="text-body-md text-ink-secondary space-y-2 text-left">
            <li className="flex items-start gap-2">
              <span className="text-success mt-0.5">•</span>
              <span>View previously cached pages</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-success mt-0.5">•</span>
              <span>Draft changes that will sync when online</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-warning mt-0.5">•</span>
              <span>Check your network connection</span>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full px-6 py-3 bg-primary text-on-dark-primary rounded-button font-weight-medium border-2 border-primary shadow-sm hover:shadow-md transition-shadow"
          >
            Try Again
          </button>
          <button
            onClick={() => window.history.back()}
            className="w-full px-6 py-3 bg-surface-primary text-ink-primary rounded-button font-weight-medium border-2 border-ink-muted hover:border-primary transition-colors"
          >
            Go Back
          </button>
        </div>

        <p className="text-body-sm text-ink-muted">
          Your changes will be saved locally and synced when you&apos;re back online.
        </p>
      </div>
    </div>
  );
}
