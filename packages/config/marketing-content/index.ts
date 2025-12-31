/**
 * Marketing Content - Centralized Content Configuration
 * 
 * This module exports all marketing content for use across the GHXSTSHIP platform.
 * Content is organized by type and can be filtered by platform, category, and other criteria.
 * 
 * Usage:
 * ```typescript
 * import { FAQS, getFAQsByCategory, searchFAQs } from '@ghxstship/config/marketing-content';
 * import { TEMPLATES, getFeaturedTemplates } from '@ghxstship/config/marketing-content';
 * ```
 */

// Import for local use
import {
  FAQS as _FAQS,
  searchFAQs as _searchFAQs,
  getFAQsByPlatform as _getFAQsByPlatform,
  type FAQ as _FAQ,
} from './faqs';

import {
  TEMPLATES as _TEMPLATES,
  searchTemplates as _searchTemplates,
  getTemplatesByPlatform as _getTemplatesByPlatform,
  getFeaturedTemplates as _getFeaturedTemplates,
  type Template as _Template,
} from './templates';

import {
  GUIDES as _GUIDES,
  searchGuides as _searchGuides,
  getGuidesByPlatform as _getGuidesByPlatform,
  getFeaturedGuides as _getFeaturedGuides,
  type Guide as _Guide,
} from './guides';

import {
  VIDEOS as _VIDEOS,
  searchVideos as _searchVideos,
  getVideosByPlatform as _getVideosByPlatform,
  getFeaturedVideos as _getFeaturedVideos,
  type Video as _Video,
} from './videos';

import {
  TOOLS as _TOOLS,
  searchTools as _searchTools,
  getToolsByPlatform as _getToolsByPlatform,
  getFeaturedTools as _getFeaturedTools,
  type Tool as _Tool,
} from './tools';

import {
  WEBINARS as _WEBINARS,
  searchWebinars as _searchWebinars,
  getWebinarsByPlatform as _getWebinarsByPlatform,
  getFeaturedWebinars as _getFeaturedWebinars,
  type Webinar as _Webinar,
} from './webinars';

// FAQs
export {
  FAQS,
  FAQ_CATEGORIES,
  getFAQsByCategory,
  getFAQsByPlatform,
  searchFAQs,
  getActiveCategories,
  getFAQCountByCategory,
  type FAQ,
  type FAQCategory,
} from './faqs';

// Templates
export {
  TEMPLATES,
  TEMPLATE_CATEGORIES,
  FORMAT_INFO,
  getTemplatesByCategory,
  getTemplatesByPlatform,
  getFeaturedTemplates,
  getNewTemplates,
  searchTemplates,
  getPopularTemplates,
  getTemplateCountByCategory,
  type Template,
  type TemplateCategory,
  type TemplateFormat,
} from './templates';

// Guides
export {
  GUIDES,
  GUIDE_CATEGORIES,
  DIFFICULTY_INFO,
  getGuidesByCategory,
  getGuidesByPlatform,
  getGuidesByDifficulty,
  getFeaturedGuides,
  getNewGuides,
  searchGuides,
  getLearningPathTime,
  type Guide,
  type GuideCategory,
  type GuideDifficulty,
  type GuideChapter,
} from './guides';

// Videos
export {
  VIDEOS,
  VIDEO_CATEGORIES,
  getVideosByCategory,
  getVideosByPlatform,
  getFeaturedVideos,
  getNewVideos,
  getPopularVideos,
  searchVideos,
  getPlaylistDuration,
  getVideoCountByCategory,
  type Video,
  type VideoCategory,
} from './videos';

// Tools
export {
  TOOLS,
  TOOL_CATEGORIES,
  getToolsByCategory,
  getToolsByPlatform,
  getFeaturedTools,
  getNewTools,
  searchTools,
  type Tool,
  type ToolCategory,
  type ToolInput,
  type ToolOutput,
} from './tools';

// Webinars
export {
  WEBINARS,
  WEBINAR_SERIES,
  getWebinarsByType,
  getWebinarsBySeries,
  getWebinarsByPlatform,
  getFeaturedWebinars,
  getUpcomingWebinars,
  getOnDemandWebinars,
  getRecurringWebinars,
  searchWebinars,
  getRegistrationAvailability,
  type Webinar,
  type WebinarType,
  type WebinarSeries,
  type WebinarHost,
  type WebinarSpeaker,
} from './webinars';

/**
 * Search across all content types
 */
export function searchAllContent(query: string): {
  faqs: _FAQ[];
  templates: _Template[];
  guides: _Guide[];
  videos: _Video[];
  tools: _Tool[];
  webinars: _Webinar[];
} {
  return {
    faqs: _searchFAQs(query),
    templates: _searchTemplates(query),
    guides: _searchGuides(query),
    videos: _searchVideos(query),
    tools: _searchTools(query),
    webinars: _searchWebinars(query),
  };
}

/**
 * Get all featured content
 */
export function getAllFeaturedContent(): {
  faqs: _FAQ[];
  templates: _Template[];
  guides: _Guide[];
  videos: _Video[];
  tools: _Tool[];
  webinars: _Webinar[];
} {
  return {
    faqs: [], // FAQs don't have featured flag
    templates: _getFeaturedTemplates(),
    guides: _getFeaturedGuides(),
    videos: _getFeaturedVideos(),
    tools: _getFeaturedTools(),
    webinars: _getFeaturedWebinars(),
  };
}

/**
 * Get content by platform
 */
export function getContentByPlatform(platform: 'atlvs' | 'compvss' | 'gvteway' | 'all'): {
  faqs: _FAQ[];
  templates: _Template[];
  guides: _Guide[];
  videos: _Video[];
  tools: _Tool[];
  webinars: _Webinar[];
} {
  return {
    faqs: _getFAQsByPlatform(platform),
    templates: _getTemplatesByPlatform(platform),
    guides: _getGuidesByPlatform(platform),
    videos: _getVideosByPlatform(platform),
    tools: _getToolsByPlatform(platform),
    webinars: _getWebinarsByPlatform(platform),
  };
}

/**
 * Get content statistics
 */
export function getContentStats(): {
  totalFAQs: number;
  totalTemplates: number;
  totalGuides: number;
  totalVideos: number;
  totalTools: number;
  totalWebinars: number;
  total: number;
} {
  return {
    totalFAQs: _FAQS.length,
    totalTemplates: _TEMPLATES.length,
    totalGuides: _GUIDES.length,
    totalVideos: _VIDEOS.length,
    totalTools: _TOOLS.length,
    totalWebinars: _WEBINARS.length,
    total: _FAQS.length + _TEMPLATES.length + _GUIDES.length + _VIDEOS.length + _TOOLS.length + _WEBINARS.length,
  };
}
