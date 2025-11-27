/**
 * User Preferences System
 * Centralized user settings and preferences management
 */

import { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Json } from './supabase-types';

export type ThemeMode = 'light' | 'dark' | 'system';
export type Language = 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ja';
export type DateFormat = 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
export type TimeFormat = '12h' | '24h';
export type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY' | 'CNY';

export interface UserPreferences {
  user_id: string;
  
  // Appearance
  theme: ThemeMode;
  compact_mode: boolean;
  sidebar_collapsed: boolean;
  
  // Localization
  language: Language;
  timezone: string;
  date_format: DateFormat;
  time_format: TimeFormat;
  currency: Currency;
  
  // Notifications
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  notification_sound: boolean;
  
  // Privacy
  show_online_status: boolean;
  allow_analytics: boolean;
  
  // Application Behavior
  default_view: string;
  items_per_page: number;
  auto_save: boolean;
  keyboard_shortcuts: boolean;
  
  // Custom Settings
  custom_settings: Record<string, any>;
  
  updated_at: string;
}

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
  default: any;
  description?: string;
}

/**
 * User Preferences Manager
 * Handles user preferences CRUD and validation
 */
export class UserPreferencesManager {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Get user preferences
   */
  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    const { data, error } = await this.supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return null;
    }

    return data as UserPreferences;
  }

  /**
   * Initialize default preferences for new user
   */
  async initializeUserPreferences(
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase.from('user_preferences').insert({
        user_id: userId,
        theme: 'system',
        compact_mode: false,
        sidebar_collapsed: false,
        language: 'en',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
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
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Update user preferences
   */
  async updateUserPreferences(
    userId: string,
    updates: Partial<Omit<UserPreferences, 'user_id' | 'updated_at'>>
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
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Update custom setting
   */
  async updateCustomSetting(
    userId: string,
    key: string,
    value: any
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get current preferences
      const prefs = await this.getUserPreferences(userId);
      if (!prefs) {
        return { success: false, error: 'Preferences not found' };
      }

      // Update custom settings
      const customSettings = { ...prefs.custom_settings, [key]: value };

      const { error } = await this.supabase
        .from('user_preferences')
        .update({ custom_settings: customSettings })
        .eq('user_id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get custom setting
   */
  async getCustomSetting(userId: string, key: string): Promise<any> {
    const prefs = await this.getUserPreferences(userId);
    if (!prefs) return null;

    return prefs.custom_settings[key] || null;
  }

  /**
   * Delete custom setting
   */
  async deleteCustomSetting(
    userId: string,
    key: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const prefs = await this.getUserPreferences(userId);
      if (!prefs) {
        return { success: false, error: 'Preferences not found' };
      }

      const customSettings = { ...prefs.custom_settings };
      delete customSettings[key];

      const { error } = await this.supabase
        .from('user_preferences')
        .update({ custom_settings: customSettings })
        .eq('user_id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Reset preferences to defaults
   */
  async resetToDefaults(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase
        .from('user_preferences')
        .update({
          theme: 'system',
          compact_mode: false,
          sidebar_collapsed: false,
          language: 'en',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
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
        })
        .eq('user_id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Export user preferences
   */
  async exportPreferences(userId: string): Promise<UserPreferences | null> {
    return await this.getUserPreferences(userId);
  }

  /**
   * Import user preferences
   */
  async importPreferences(
    userId: string,
    preferences: Partial<UserPreferences>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Remove system fields
      const { user_id, updated_at, ...updates } = preferences as any;

      const { error } = await this.supabase
        .from('user_preferences')
        .update(updates)
        .eq('user_id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
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
              { value: 'EUR', label: 'EUR (€)' },
              { value: 'GBP', label: 'GBP (£)' },
              { value: 'CAD', label: 'CAD ($)' },
              { value: 'AUD', label: 'AUD ($)' },
              { value: 'JPY', label: 'JPY (¥)' },
              { value: 'CNY', label: 'CNY (¥)' },
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
};

export default userPreferences;
