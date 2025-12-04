/**
 * Session Timeout Configuration
 * Configurable session management with timeout warnings and remember me
 */

// =============================================================================
// TYPES
// =============================================================================

export interface SessionConfig {
  /** Session timeout in milliseconds */
  sessionTimeout: number;
  /** Idle timeout in milliseconds (triggers warning) */
  idleTimeout: number;
  /** Warning time before session expires (milliseconds) */
  warningTime: number;
  /** Whether to enable "Remember Me" functionality */
  enableRememberMe: boolean;
  /** Extended session duration for "Remember Me" (milliseconds) */
  rememberMeDuration: number;
  /** Whether to refresh session on activity */
  refreshOnActivity: boolean;
  /** Minimum time between session refreshes (milliseconds) */
  refreshThrottle: number;
}

export interface SessionState {
  /** Whether session is active */
  isActive: boolean;
  /** Whether session is about to expire */
  isWarning: boolean;
  /** Time until session expires (milliseconds) */
  timeUntilExpiry: number;
  /** Last activity timestamp */
  lastActivity: Date;
  /** Whether "Remember Me" is enabled */
  rememberMe: boolean;
  /** Session expiry timestamp */
  expiresAt: Date;
}

export interface SessionCallbacks {
  /** Called when session is about to expire */
  onWarning?: (timeRemaining: number) => void;
  /** Called when session expires */
  onExpire?: () => void;
  /** Called when session is refreshed */
  onRefresh?: () => void;
  /** Called on activity */
  onActivity?: () => void;
}

// =============================================================================
// DEFAULT CONFIGURATION
// =============================================================================

export const DEFAULT_SESSION_CONFIG: SessionConfig = {
  // 30 minutes default session
  sessionTimeout: 30 * 60 * 1000,
  // 25 minutes idle triggers warning
  idleTimeout: 25 * 60 * 1000,
  // 5 minute warning before expiry
  warningTime: 5 * 60 * 1000,
  // Enable remember me
  enableRememberMe: true,
  // 30 days for remember me
  rememberMeDuration: 30 * 24 * 60 * 60 * 1000,
  // Refresh on activity
  refreshOnActivity: true,
  // Throttle refreshes to every 5 minutes
  refreshThrottle: 5 * 60 * 1000,
};

// =============================================================================
// SESSION MANAGER CLASS
// =============================================================================

export class SessionManager {
  private config: SessionConfig;
  private callbacks: SessionCallbacks;
  private state: SessionState;
  private warningTimer: ReturnType<typeof setTimeout> | null = null;
  private expiryTimer: ReturnType<typeof setTimeout> | null = null;
  private lastRefresh: number = 0;
  private activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
  
  constructor(
    config: Partial<SessionConfig> = {},
    callbacks: SessionCallbacks = {}
  ) {
    this.config = { ...DEFAULT_SESSION_CONFIG, ...config };
    this.callbacks = callbacks;
    this.state = this.createInitialState();
  }
  
  /**
   * Create initial session state
   */
  private createInitialState(): SessionState {
    const now = new Date();
    return {
      isActive: false,
      isWarning: false,
      timeUntilExpiry: this.config.sessionTimeout,
      lastActivity: now,
      rememberMe: false,
      expiresAt: new Date(now.getTime() + this.config.sessionTimeout),
    };
  }
  
  /**
   * Start session monitoring
   */
  start(rememberMe: boolean = false): void {
    this.state.isActive = true;
    this.state.rememberMe = rememberMe;
    this.state.lastActivity = new Date();
    
    // Calculate expiry based on remember me
    const duration = rememberMe 
      ? this.config.rememberMeDuration 
      : this.config.sessionTimeout;
    this.state.expiresAt = new Date(Date.now() + duration);
    this.state.timeUntilExpiry = duration;
    
    // Set up timers
    this.setupTimers();
    
    // Set up activity listeners
    if (this.config.refreshOnActivity && typeof window !== 'undefined') {
      this.activityEvents.forEach(event => {
        window.addEventListener(event, this.handleActivity);
      });
    }
  }
  
  /**
   * Stop session monitoring
   */
  stop(): void {
    this.state.isActive = false;
    this.clearTimers();
    
    // Remove activity listeners
    if (typeof window !== 'undefined') {
      this.activityEvents.forEach(event => {
        window.removeEventListener(event, this.handleActivity);
      });
    }
  }
  
  /**
   * Refresh the session
   */
  refresh(): void {
    if (!this.state.isActive) return;
    
    const now = Date.now();
    
    // Throttle refreshes
    if (now - this.lastRefresh < this.config.refreshThrottle) {
      return;
    }
    
    this.lastRefresh = now;
    this.state.lastActivity = new Date();
    this.state.isWarning = false;
    
    // Recalculate expiry
    const duration = this.state.rememberMe 
      ? this.config.rememberMeDuration 
      : this.config.sessionTimeout;
    this.state.expiresAt = new Date(now + duration);
    this.state.timeUntilExpiry = duration;
    
    // Reset timers
    this.setupTimers();
    
    // Callback
    this.callbacks.onRefresh?.();
  }
  
  /**
   * Extend session (e.g., when user clicks "Stay logged in")
   */
  extend(duration?: number): void {
    if (!this.state.isActive) return;
    
    const extensionDuration = duration || this.config.sessionTimeout;
    this.state.expiresAt = new Date(Date.now() + extensionDuration);
    this.state.timeUntilExpiry = extensionDuration;
    this.state.isWarning = false;
    
    this.setupTimers();
  }
  
  /**
   * Get current session state
   */
  getState(): SessionState {
    // Update time until expiry
    this.state.timeUntilExpiry = Math.max(
      0,
      this.state.expiresAt.getTime() - Date.now()
    );
    return { ...this.state };
  }
  
  /**
   * Check if session is expired
   */
  isExpired(): boolean {
    return Date.now() >= this.state.expiresAt.getTime();
  }
  
  /**
   * Handle user activity
   */
  private handleActivity = (): void => {
    if (!this.state.isActive) return;
    
    this.callbacks.onActivity?.();
    
    if (this.config.refreshOnActivity) {
      this.refresh();
    }
  };
  
  /**
   * Set up warning and expiry timers
   */
  private setupTimers(): void {
    this.clearTimers();
    
    const now = Date.now();
    const expiryTime = this.state.expiresAt.getTime();
    const timeUntilExpiry = expiryTime - now;
    const timeUntilWarning = timeUntilExpiry - this.config.warningTime;
    
    // Warning timer
    if (timeUntilWarning > 0) {
      this.warningTimer = setTimeout(() => {
        this.state.isWarning = true;
        this.callbacks.onWarning?.(this.config.warningTime);
      }, timeUntilWarning);
    }
    
    // Expiry timer
    if (timeUntilExpiry > 0) {
      this.expiryTimer = setTimeout(() => {
        this.state.isActive = false;
        this.callbacks.onExpire?.();
        this.stop();
      }, timeUntilExpiry);
    }
  }
  
  /**
   * Clear all timers
   */
  private clearTimers(): void {
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
      this.warningTimer = null;
    }
    if (this.expiryTimer) {
      clearTimeout(this.expiryTimer);
      this.expiryTimer = null;
    }
  }
}

// =============================================================================
// SUPABASE SESSION CONFIGURATION
// =============================================================================

/**
 * Get Supabase auth configuration for session management
 */
export function getSupabaseSessionConfig(config: Partial<SessionConfig> = {}): {
  autoRefreshToken: boolean;
  persistSession: boolean;
  detectSessionInUrl: boolean;
} {
  const mergedConfig = { ...DEFAULT_SESSION_CONFIG, ...config };
  
  return {
    autoRefreshToken: mergedConfig.refreshOnActivity,
    persistSession: mergedConfig.enableRememberMe,
    detectSessionInUrl: true,
  };
}

/**
 * Calculate session expiry for Supabase
 */
export function calculateSessionExpiry(
  rememberMe: boolean,
  config: Partial<SessionConfig> = {}
): number {
  const mergedConfig = { ...DEFAULT_SESSION_CONFIG, ...config };
  
  const duration = rememberMe
    ? mergedConfig.rememberMeDuration
    : mergedConfig.sessionTimeout;
  
  // Return expiry in seconds (Supabase uses seconds)
  return Math.floor(duration / 1000);
}

// =============================================================================
// REACT HOOK HELPERS
// =============================================================================

/**
 * Format time remaining for display
 */
export function formatTimeRemaining(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${remainingSeconds}s`;
}

/**
 * Check if session warning should be shown
 */
export function shouldShowWarning(state: SessionState, _config: SessionConfig): boolean {
  return state.isActive && state.isWarning && state.timeUntilExpiry > 0;
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let sessionManager: SessionManager | null = null;

/**
 * Get the session manager instance
 */
export function getSessionManager(
  config?: Partial<SessionConfig>,
  callbacks?: SessionCallbacks
): SessionManager {
  if (!sessionManager) {
    sessionManager = new SessionManager(config, callbacks);
  }
  return sessionManager;
}

/**
 * Reset the session manager
 */
export function resetSessionManager(): void {
  if (sessionManager) {
    sessionManager.stop();
    sessionManager = null;
  }
}
