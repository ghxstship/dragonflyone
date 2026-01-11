/**
 * Customizer State Reducer
 * State management for theme customization
 */

import type { CustomizerState, CustomizerAction } from './types';
import type { ExperienceThemeConfig } from '../../whitelabel/experience-theme';

export function customizerReducer(
  state: CustomizerState,
  action: CustomizerAction
): CustomizerState {
  switch (action.type) {
    case 'SET_PRIMARY_COLOR':
      return {
        ...state,
        config: {
          ...state.config,
          branding: {
            ...state.config.branding,
            colors: {
              ...state.config.branding.colors,
              primary: action.color,
            },
          },
        },
        hasUnsavedChanges: true,
      };

    case 'SET_SECONDARY_COLOR':
      return {
        ...state,
        config: {
          ...state.config,
          branding: {
            ...state.config.branding,
            colors: {
              ...state.config.branding.colors,
              secondary: action.color,
            },
          },
        },
        hasUnsavedChanges: true,
      };

    case 'SET_ACCENT_COLOR':
      return {
        ...state,
        config: {
          ...state.config,
          branding: {
            ...state.config.branding,
            colors: {
              ...state.config.branding.colors,
              accent: action.color,
            },
          },
        },
        hasUnsavedChanges: true,
      };

    case 'SET_DISPLAY_FONT':
      return {
        ...state,
        config: {
          ...state.config,
          branding: {
            ...state.config.branding,
            typography: {
              ...state.config.branding.typography,
              displayFont: action.font,
            },
          },
        },
        hasUnsavedChanges: true,
      };

    case 'SET_BODY_FONT':
      return {
        ...state,
        config: {
          ...state.config,
          branding: {
            ...state.config.branding,
            typography: {
              ...state.config.branding.typography,
              bodyFont: action.font,
            },
          },
        },
        hasUnsavedChanges: true,
      };

    case 'SET_LOGO':
      return {
        ...state,
        config: {
          ...state.config,
          branding: {
            ...state.config.branding,
            logo: action.url,
          },
        },
        hasUnsavedChanges: true,
      };

    case 'ADD_NAV_LINK':
      return {
        ...state,
        config: {
          ...state.config,
          content: {
            ...state.config.content,
            customNavLinks: [
              ...state.config.content.customNavLinks,
              {
                label: action.link.label,
                href: action.link.href,
                order: action.link.order,
              },
            ],
          },
        },
        hasUnsavedChanges: true,
      };

    case 'UPDATE_NAV_LINK':
      return {
        ...state,
        config: {
          ...state.config,
          content: {
            ...state.config.content,
            customNavLinks: state.config.content.customNavLinks.map((link, index) =>
              index.toString() === action.id
                ? { ...link, ...action.link }
                : link
            ),
          },
        },
        hasUnsavedChanges: true,
      };

    case 'REMOVE_NAV_LINK':
      return {
        ...state,
        config: {
          ...state.config,
          content: {
            ...state.config.content,
            customNavLinks: state.config.content.customNavLinks.filter(
              (_, index) => index.toString() !== action.id
            ),
          },
        },
        hasUnsavedChanges: true,
      };

    case 'REORDER_NAV_LINKS':
      return {
        ...state,
        config: {
          ...state.config,
          content: {
            ...state.config.content,
            customNavLinks: action.links.map((link) => ({
              label: link.label,
              href: link.href,
              order: link.order,
            })),
          },
        },
        hasUnsavedChanges: true,
      };

    case 'SET_CUSTOM_DOMAIN':
      return {
        ...state,
        config: {
          ...state.config,
          branding: {
            ...state.config.branding,
            customDomain: action.domain,
          },
        },
        hasUnsavedChanges: true,
      };

    case 'APPLY_TEMPLATE':
      return {
        ...state,
        config: {
          ...state.config,
          ...action.config,
        },
        hasUnsavedChanges: true,
      };

    case 'RESET_TO_DEFAULT':
      return {
        ...state,
        hasUnsavedChanges: false,
      };

    case 'SET_PREVIEW_MODE':
      return {
        ...state,
        previewMode: action.mode,
      };

    case 'SET_ACTIVE_TAB':
      return {
        ...state,
        activeTab: action.tab,
      };

    case 'SAVE_START':
      return {
        ...state,
        isSaving: true,
      };

    case 'SAVE_SUCCESS':
      return {
        ...state,
        config: action.config,
        hasUnsavedChanges: false,
        isSaving: false,
      };

    case 'SAVE_ERROR':
      return {
        ...state,
        isSaving: false,
      };

    default:
      return state;
  }
}

// Initial state factory
export function createInitialCustomizerState(
  config: ExperienceThemeConfig
): CustomizerState {
  return {
    config,
    hasUnsavedChanges: false,
    isSaving: false,
    previewMode: 'desktop',
    activeTab: 'colors',
  };
}
