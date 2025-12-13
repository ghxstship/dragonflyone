/**
 * User Preferences System
 * Centralized user settings and preferences management
 * 
 * NOTE: This module works with the user_preferences table which stores
 * fan preferences (genres, venues, etc.) and uses the notification_preferences
 * JSON field to store app-level settings like theme, language, etc.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Json } from './supabase-types';

// Database row type from Supabase
type UserPreferencesRow = Database['public']['Tables']['user_preferences']['Row'];
type UserPreferencesInsert = Database['public']['Tables']['user_preferences']['Insert'];
type UserPreferencesUpdate = Database['public']['Tables']['user_preferences']['Update'];

// App settings stored in notification_preferences JSON field
export type ThemeMode = 'light' | 'dark' | 'system';
export type Language = 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ja';
export type DateFormat = 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
export type TimeFormat = '12h' | '24h';
export type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY' | 'CNY';

export interface AppSettings {
  theme?: ThemeMode;
  compact_mode?: boolean;
  sidebar_collapsed?: boolean;
  language?: Language;
  timezone?: string;
  date_format?: DateFormat;
  time_format?: TimeFormat;
  currency?: Currency;
  email_notifications?: boolean;
  push_notifications?: boolean;
  sms_notifications?: boolean;
  notification_sound?: boolean;
  show_online_status?: boolean;
  allow_analytics?: boolean;
  default_view?: string;
  items_per_page?: number;
  auto_save?: boolean;
  keyboard_shortcuts?: boolean;
  custom_settings?: Record<string, unknown>;
}

// Re-export the database type for external use
export type UserPreferences = UserPreferencesRow;

export interface PreferenceCategory {
  id: string;
  name: string;
  settings: PreferenceSetting[];
}

export interface PreferenceSetting {
  key: string;
  label: string;
  type: 'boolean' | 'select' | 'number' | 'text';
  options?: Array<{ value: string; label: string }>;
  default: string | number | boolean;
  description?: string;
}

const DEFAULT_APP_SETTINGS: AppSettings = {
  theme: 'system',
  compact_mode: false,
  sidebar_collapsed: false,
  language: 'en',
  timezone: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC',
  date_format: 'MM/DD/YYYY',
  time_format: '12h',
  currency: 'USD',
  email_notifications: true,
  push_notifications: true,
  sms_notifications: false,
  notification_sound: true,
  show_online_status: true,
  allow_analytics: true,
  default_view: 'dashboard',
  items_per_page: 25,
  auto_save: true,
  keyboard_shortcuts: true,
  custom_settings: {},
};

/**
 * Parse notification_preferences JSON to AppSettings
 */
function parseAppSettings(json: Json | null): AppSettings {
  if (!json || typeof json !== 'object' || Array.isArray(json)) {
    return { ...DEFAULT_APP_SETTINGS };
  }
  return { ...DEFAULT_APP_SETTINGS, ...json } as AppSettings;
}

/**
 * User Preferences Manager
 * Handles user preferences CRUD and validation
 */
export class UserPreferencesManager {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Get user preferences (full database row)
   */
  async getUserPreferences(userId: string): Promise<UserPreferencesRow | null> {
    const { data, error } = await this.supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  }

  /**
   * Get app settings from notification_preferences JSON
   */
  async getAppSettings(userId: string): Promise<AppSettings> {
    const prefs = await this.getUserPreferences(userId);
    if (!prefs) {
      return { ...DEFAULT_APP_SETTINGS };
    }
    return parseAppSettings(prefs.notification_preferences);
  }

  /**
   * Initialize default preferences for new user
   */
  async initializeUserPreferences(
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const insertData: UserPreferencesInsert = {
        user_id: userId,
        notification_preferences: DEFAULT_APP_SETTINGS as unknown as Json,
        onboarding_completed: false,
        discovery_quiz_completed: false,
      };

      const { error } = await this.supabase
        .from('user_preferences')
        .insert(insertData);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: message };
    }
  }

  /**
   * Update user preferences (database columns)
   */
  async updateUserPreferences(
    userId: string,
    updates: UserPreferencesUpdate
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase
        .from('user_preferences')
        .update(updates)
        .eq('user_id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: message };
    }
  }

  /**
   * Update app settings (stored in notification_preferences JSON)
   */
  async updateAppSettings(
    userId: string,
    updates: Partial<AppSettings>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const currentSettings = await this.getAppSettings(userId);
      const newSettings = { ...currentSettings, ...updates };

      const { error } = await this.supabase
        .from('user_preferences')
        .update({ notification_preferences: newSettings as unknown as Json })
        .eq('user_id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: message };
    }
  }

  /**
   * Update custom setting within app settings
   */
  async updateCustomSetting(
    userId: string,
    key: string,
    value: unknown
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const currentSettings = await this.getAppSettings(userId);
      const customSettings = { ...(currentSettings.custom_settings || {}), [key]: value };

      return await this.updateAppSettings(userId, { custom_settings: customSettings });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: message };
    }
  }

  /**
   * Get custom setting
   */
  async getCustomSetting(userId: string, key: string): Promise<unknown> {
    const settings = await this.getAppSettings(userId);
    return settings.custom_settings?.[key] ?? null;
  }

  /**
   * Delete custom setting
   */
  async deleteCustomSetting(
    userId: string,
    key: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const currentSettings = await this.getAppSettings(userId);
      const customSettings = { ...(currentSettings.custom_settings || {}) };
      delete customSettings[key];

      return await this.updateAppSettings(userId, { custom_settings: customSettings });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: message };
    }
  }

  /**
   * Reset app settings to defaults
   */
  async resetToDefaults(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase
        .from('user_preferences')
        .update({ notification_preferences: DEFAULT_APP_SETTINGS as unknown as Json })
        .eq('user_id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: message };
    }
  }

  /**
   * Export user preferences
   */
  async exportPreferences(userId: string): Promise<UserPreferencesRow | null> {
    return await this.getUserPreferences(userId);
  }

  /**
   * Import app settings
   */
  async importAppSettings(
    userId: string,
    settings: Partial<AppSettings>
  ): Promise<{ success: boolean; error?: string }> {
    return await this.updateAppSettings(userId, settings);
  }

  /**
   * Get preference categories for UI
   */
  getPreferenceCategories(): PreferenceCategory[] {
    return [
      {
        id: 'appearance',
        name: 'Appearance',
        settings: [
          {
            key: 'theme',
            label: 'Theme',
            type: 'select',
            options: [
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
              { value: 'system', label: 'System' },
            ],
            default: 'system',
          },
          {
            key: 'compact_mode',
            label: 'Compact Mode',
            type: 'boolean',
            default: false,
            description: 'Reduce spacing and padding throughout the app',
          },
          {
            key: 'sidebar_collapsed',
            label: 'Collapse Sidebar',
            type: 'boolean',
            default: false,
          },
        ],
      },
      {
        id: 'localization',
        name: 'Localization',
        settings: [
          {
            key: 'language',
            label: 'Language',
            type: 'select',
            options: [
              { value: 'en', label: 'English' },
              { value: 'es', label: 'Spanish' },
              { value: 'fr', label: 'French' },
              { value: 'de', label: 'German' },
              { value: 'zh', label: 'Chinese' },
              { value: 'ja', label: 'Japanese' },
            ],
            default: 'en',
          },
          {
            key: 'date_format',
            label: 'Date Format',
            type: 'select',
            options: [
              { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
              { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
              { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
            ],
            default: 'MM/DD/YYYY',
          },
          {
            key: 'time_format',
            label: 'Time Format',
            type: 'select',
            options: [
              { value: '12h', label: '12-hour' },
              { value: '24h', label: '24-hour' },
            ],
            default: '12h',
          },
          {
            key: 'currency',
            label: 'Currency',
            type: 'select',
            options: [
              { value: 'USD', label: 'USD ($)' },
              { value: 'EUR', label: 'EUR' },
              { value: 'GBP', label: 'GBP' },
              { value: 'CAD', label: 'CAD ($)' },
              { value: 'AUD', label: 'AUD ($)' },
              { value: 'JPY', label: 'JPY' },
              { value: 'CNY', label: 'CNY' },
            ],
            default: 'USD',
          },
        ],
      },
      {
        id: 'notifications',
        name: 'Notifications',
        settings: [
          {
            key: 'email_notifications',
            label: 'Email Notifications',
            type: 'boolean',
            default: true,
          },
          {
            key: 'push_notifications',
            label: 'Push Notifications',
            type: 'boolean',
            default: true,
          },
          {
            key: 'sms_notifications',
            label: 'SMS Notifications',
            type: 'boolean',
            default: false,
          },
          {
            key: 'notification_sound',
            label: 'Notification Sound',
            type: 'boolean',
            default: true,
          },
        ],
      },
      {
        id: 'privacy',
        name: 'Privacy',
        settings: [
          {
            key: 'show_online_status',
            label: 'Show Online Status',
            type: 'boolean',
            default: true,
          },
          {
            key: 'allow_analytics',
            label: 'Allow Analytics',
            type: 'boolean',
            default: true,
            description: 'Help us improve by sharing anonymous usage data',
          },
        ],
      },
      {
        id: 'behavior',
        name: 'Application Behavior',
        settings: [
          {
            key: 'items_per_page',
            label: 'Items Per Page',
            type: 'select',
            options: [
              { value: '10', label: '10' },
              { value: '25', label: '25' },
              { value: '50', label: '50' },
              { value: '100', label: '100' },
            ],
            default: 25,
          },
          {
            key: 'auto_save',
            label: 'Auto Save',
            type: 'boolean',
            default: true,
            description: 'Automatically save changes as you work',
          },
          {
            key: 'keyboard_shortcuts',
            label: 'Keyboard Shortcuts',
            type: 'boolean',
            default: true,
          },
        ],
      },
    ];
  }
}

/**
 * Export user preferences utilities
 */
export const userPreferences = {
  createManager: (supabase: SupabaseClient<Database>) =>
    new UserPreferencesManager(supabase),
  DEFAULT_APP_SETTINGS,
};

export default userPreferences;
