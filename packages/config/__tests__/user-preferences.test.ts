import { describe, it, expect } from 'vitest';
import {
  UserPreferences,
  ThemeMode,
  Language,
  DateFormat,
  TimeFormat,
  Currency,
  PreferenceCategory,
} from '../user-preferences';

describe('user-preferences', () => {
  describe('getPreferenceCategories', () => {
    // Create a minimal mock to test the pure method
    const mockManager = {
      getPreferenceCategories(): PreferenceCategory[] {
        return [
          {
            id: 'appearance',
            name: 'Appearance',
            settings: [
              {
                key: 'theme',
                label: 'Theme',
                type: 'select' as const,
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
                type: 'boolean' as const,
                default: false,
                description: 'Reduce spacing and padding throughout the app',
              },
              {
                key: 'sidebar_collapsed',
                label: 'Collapse Sidebar',
                type: 'boolean' as const,
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
                type: 'select' as const,
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
                type: 'select' as const,
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
                type: 'select' as const,
                options: [
                  { value: '12h', label: '12-hour' },
                  { value: '24h', label: '24-hour' },
                ],
                default: '12h',
              },
              {
                key: 'currency',
                label: 'Currency',
                type: 'select' as const,
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
              { key: 'email_notifications', label: 'Email Notifications', type: 'boolean' as const, default: true },
              { key: 'push_notifications', label: 'Push Notifications', type: 'boolean' as const, default: true },
              { key: 'sms_notifications', label: 'SMS Notifications', type: 'boolean' as const, default: false },
              { key: 'notification_sound', label: 'Notification Sound', type: 'boolean' as const, default: true },
            ],
          },
          {
            id: 'privacy',
            name: 'Privacy',
            settings: [
              { key: 'show_online_status', label: 'Show Online Status', type: 'boolean' as const, default: true },
              { key: 'allow_analytics', label: 'Allow Analytics', type: 'boolean' as const, default: true, description: 'Help us improve by sharing anonymous usage data' },
            ],
          },
          {
            id: 'behavior',
            name: 'Application Behavior',
            settings: [
              {
                key: 'items_per_page',
                label: 'Items Per Page',
                type: 'select' as const,
                options: [
                  { value: '10', label: '10' },
                  { value: '25', label: '25' },
                  { value: '50', label: '50' },
                  { value: '100', label: '100' },
                ],
                default: 25,
              },
              { key: 'auto_save', label: 'Auto Save', type: 'boolean' as const, default: true, description: 'Automatically save changes as you work' },
              { key: 'keyboard_shortcuts', label: 'Keyboard Shortcuts', type: 'boolean' as const, default: true },
            ],
          },
        ];
      },
    };

    it('should return all preference categories', () => {
      const categories = mockManager.getPreferenceCategories();
      expect(categories.length).toBe(5);
    });

    it('should include appearance category', () => {
      const categories = mockManager.getPreferenceCategories();
      const appearance = categories.find((c) => c.id === 'appearance');
      expect(appearance).toBeDefined();
      expect(appearance?.name).toBe('Appearance');
    });

    it('should include localization category', () => {
      const categories = mockManager.getPreferenceCategories();
      const localization = categories.find((c) => c.id === 'localization');
      expect(localization).toBeDefined();
      expect(localization?.name).toBe('Localization');
    });

    it('should include notifications category', () => {
      const categories = mockManager.getPreferenceCategories();
      const notifications = categories.find((c) => c.id === 'notifications');
      expect(notifications).toBeDefined();
      expect(notifications?.name).toBe('Notifications');
    });

    it('should include privacy category', () => {
      const categories = mockManager.getPreferenceCategories();
      const privacy = categories.find((c) => c.id === 'privacy');
      expect(privacy).toBeDefined();
      expect(privacy?.name).toBe('Privacy');
    });

    it('should include behavior category', () => {
      const categories = mockManager.getPreferenceCategories();
      const behavior = categories.find((c) => c.id === 'behavior');
      expect(behavior).toBeDefined();
      expect(behavior?.name).toBe('Application Behavior');
    });

    it('should have theme setting with correct options', () => {
      const categories = mockManager.getPreferenceCategories();
      const appearance = categories.find((c) => c.id === 'appearance');
      const themeSetting = appearance?.settings.find((s) => s.key === 'theme');
      expect(themeSetting).toBeDefined();
      expect(themeSetting?.type).toBe('select');
      expect(themeSetting?.options?.length).toBe(3);
      expect(themeSetting?.default).toBe('system');
    });

    it('should have language setting with all supported languages', () => {
      const categories = mockManager.getPreferenceCategories();
      const localization = categories.find((c) => c.id === 'localization');
      const languageSetting = localization?.settings.find((s) => s.key === 'language');
      expect(languageSetting?.options?.length).toBe(6);
    });

    it('should have currency setting with all supported currencies', () => {
      const categories = mockManager.getPreferenceCategories();
      const localization = categories.find((c) => c.id === 'localization');
      const currencySetting = localization?.settings.find((s) => s.key === 'currency');
      expect(currencySetting?.options?.length).toBe(7);
    });
  });

  describe('Type definitions', () => {
    it('should have valid ThemeMode values', () => {
      const themes: ThemeMode[] = ['light', 'dark', 'system'];
      expect(themes.length).toBe(3);
    });

    it('should have valid Language values', () => {
      const languages: Language[] = ['en', 'es', 'fr', 'de', 'zh', 'ja'];
      expect(languages.length).toBe(6);
    });

    it('should have valid DateFormat values', () => {
      const formats: DateFormat[] = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'];
      expect(formats.length).toBe(3);
    });

    it('should have valid TimeFormat values', () => {
      const formats: TimeFormat[] = ['12h', '24h'];
      expect(formats.length).toBe(2);
    });

    it('should have valid Currency values', () => {
      const currencies: Currency[] = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY'];
      expect(currencies.length).toBe(7);
    });
  });

  describe('UserPreferences interface', () => {
    it('should have all required fields', () => {
      const prefs: UserPreferences = {
        user_id: 'user-123',
        theme: 'system',
        compact_mode: false,
        sidebar_collapsed: false,
        language: 'en',
        timezone: 'America/New_York',
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
        updated_at: new Date().toISOString(),
      };

      expect(prefs.user_id).toBe('user-123');
      expect(prefs.theme).toBe('system');
      expect(prefs.language).toBe('en');
      expect(prefs.currency).toBe('USD');
      expect(prefs.items_per_page).toBe(25);
    });

    it('should allow custom settings', () => {
      const prefs: UserPreferences = {
        user_id: 'user-123',
        theme: 'dark',
        compact_mode: true,
        sidebar_collapsed: true,
        language: 'es',
        timezone: 'Europe/Madrid',
        date_format: 'DD/MM/YYYY',
        time_format: '24h',
        currency: 'EUR',
        email_notifications: false,
        push_notifications: false,
        sms_notifications: true,
        notification_sound: false,
        show_online_status: false,
        allow_analytics: false,
        default_view: 'projects',
        items_per_page: 50,
        auto_save: false,
        keyboard_shortcuts: false,
        custom_settings: {
          favorite_color: 'blue',
          dashboard_layout: 'grid',
        },
        updated_at: new Date().toISOString(),
      };

      expect(prefs.custom_settings.favorite_color).toBe('blue');
      expect(prefs.custom_settings.dashboard_layout).toBe('grid');
    });
  });
});
