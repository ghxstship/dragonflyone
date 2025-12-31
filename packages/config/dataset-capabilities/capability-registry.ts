/**
 * Dataset Capability Detection System - Capability Registry
 * 
 * Defines all capability requirements with their field pattern matchers.
 * This registry is the source of truth for what fields enable which capabilities.
 */

import type { CapabilityRequirement } from './types';

/**
 * Pattern matchers for common field types
 */
export const FIELD_PATTERNS: Record<string, RegExp[]> = {
  // Identifier patterns
  QR_CODE: [/^qr_code$/i, /^qrcode$/i, /qr_id$/i, /^qr$/i],
  BARCODE: [/^barcode$/i, /^upc$/i, /^sku$/i, /^ean$/i, /serial_number/i, /asset_tag/i, /^tag$/i, /badge_id/i, /badge_number/i],
  RFID: [/^rfid$/i, /rfid_tag/i, /rfid_id/i, /^rfid_code$/i],
  NFC: [/^nfc$/i, /^nfc_id$/i, /nfc_tag/i, /^nfc_code$/i],

  // Date patterns
  DATE_GENERIC: [/^date$/i, /^created_at$/i, /^updated_at$/i, /^due_date$/i, /^event_date$/i, /^scheduled_date$/i, /^deadline$/i, /^timestamp$/i, /_date$/i, /_at$/i],
  START_DATE: [/^start_date$/i, /^start$/i, /^begin_date$/i, /^from_date$/i, /^scheduled_start$/i, /^planned_start$/i, /^start_time$/i],
  END_DATE: [/^end_date$/i, /^end$/i, /^finish_date$/i, /^to_date$/i, /^due_date$/i, /^deadline$/i, /^scheduled_end$/i, /^planned_end$/i, /^completion_date$/i, /^end_time$/i],

  // Progress patterns
  PROGRESS: [/^progress$/i, /^completion$/i, /^percent_complete$/i, /^percentage$/i, /^complete_percent$/i],

  // Location patterns
  LATITUDE: [/^latitude$/i, /^lat$/i, /^geo_lat$/i, /^location_lat$/i, /^coords_lat$/i],
  LONGITUDE: [/^longitude$/i, /^lng$/i, /^lon$/i, /^geo_lng$/i, /^location_lng$/i, /^coords_lng$/i],
  ADDRESS: [/^address$/i, /^location$/i, /^venue$/i, /^place$/i, /^street_address$/i, /^full_address$/i, /^site$/i, /^site_location$/i],

  // Image patterns
  IMAGE: [/^image$/i, /^image_url$/i, /^photo$/i, /^photo_url$/i, /^thumbnail$/i, /^thumbnail_url$/i, /^avatar$/i, /^avatar_url$/i, /^cover$/i, /^cover_url$/i, /^poster$/i, /^media_url$/i, /_image$/i, /_photo$/i, /_thumbnail$/i, /^picture$/i],
  THUMBNAIL: [/^thumbnail$/i, /^thumbnail_url$/i, /^thumb$/i, /^preview$/i, /^preview_url$/i],

  // Status/workflow patterns
  STATUS: [/^status$/i, /^state$/i, /^stage$/i, /^phase$/i, /^category$/i, /^type$/i, /^priority$/i, /^pipeline_stage$/i, /^workflow_status$/i, /^deal_stage$/i, /^project_status$/i, /_status$/i, /_stage$/i, /_state$/i],

  // Title/name patterns
  TITLE: [/^title$/i, /^name$/i, /^subject$/i, /^heading$/i, /^label$/i, /^display_name$/i, /^full_name$/i],

  // Description patterns
  DESCRIPTION: [/^description$/i, /^desc$/i, /^summary$/i, /^notes$/i, /^details$/i, /^content$/i, /^body$/i],
};

/**
 * Complete capability registry
 */
export const CAPABILITY_REGISTRY: CapabilityRequirement[] = [
  // =========================================================================
  // SCANNING CAPABILITIES
  // =========================================================================
  {
    capability: 'scannable:qr',
    category: 'scanning',
    label: 'QR Code Scan',
    description: 'Dataset has QR code identifiers that can be scanned',
    icon: 'QrCode',
    requiredFields: [
      { patterns: FIELD_PATTERNS.QR_CODE, description: 'QR code field' }
    ],
    routeTemplate: '/:entityType/scan?mode=qr',
  },
  {
    capability: 'scannable:barcode',
    category: 'scanning',
    label: 'Barcode Scan',
    description: 'Dataset has barcode/serial identifiers that can be scanned',
    icon: 'Barcode',
    requiredFields: [
      { patterns: FIELD_PATTERNS.BARCODE, description: 'Barcode/serial field' }
    ],
    routeTemplate: '/:entityType/scan?mode=barcode',
  },
  {
    capability: 'scannable:rfid',
    category: 'scanning',
    label: 'RFID Scan',
    description: 'Dataset has RFID tags that can be scanned',
    icon: 'Radio',
    requiredFields: [
      { patterns: FIELD_PATTERNS.RFID, description: 'RFID tag field' }
    ],
    routeTemplate: '/:entityType/scan?mode=rfid',
  },
  {
    capability: 'scannable:nfc',
    category: 'scanning',
    label: 'NFC Scan',
    description: 'Dataset has NFC tags that can be scanned',
    icon: 'Nfc',
    requiredFields: [
      { patterns: FIELD_PATTERNS.NFC, description: 'NFC tag field' }
    ],
    routeTemplate: '/:entityType/scan?mode=nfc',
  },

  // =========================================================================
  // VIEW CAPABILITIES
  // =========================================================================
  {
    capability: 'view:timeline',
    category: 'views',
    label: 'Timeline View',
    description: 'Dataset has temporal data with start and end dates for timeline visualization',
    icon: 'Clock',
    requiredFields: [
      { patterns: FIELD_PATTERNS.START_DATE, description: 'Start date field' },
      { patterns: FIELD_PATTERNS.END_DATE, description: 'End date field' },
    ],
  },
  {
    capability: 'view:calendar',
    category: 'views',
    label: 'Calendar View',
    description: 'Dataset has date/event data suitable for calendar display',
    icon: 'Calendar',
    requiredFields: [
      { patterns: FIELD_PATTERNS.DATE_GENERIC, description: 'Date field' }
    ],
    optionalFields: [
      { patterns: FIELD_PATTERNS.TITLE, description: 'Title/name field' },
    ],
  },
  {
    capability: 'view:gantt',
    category: 'views',
    label: 'Gantt Chart',
    description: 'Dataset has project timeline data with start/end dates and optional progress',
    icon: 'GanttChart',
    requiredFields: [
      { patterns: FIELD_PATTERNS.START_DATE, description: 'Start date field' },
      { patterns: FIELD_PATTERNS.END_DATE, description: 'End date field' },
    ],
    optionalFields: [
      { patterns: FIELD_PATTERNS.PROGRESS, description: 'Progress field' },
      { patterns: FIELD_PATTERNS.TITLE, description: 'Title/name field' },
    ],
  },
  {
    capability: 'view:map',
    category: 'views',
    label: 'Map View',
    description: 'Dataset has geographic location data (coordinates or address)',
    icon: 'MapPin',
    requiredFields: [
      { patterns: [...FIELD_PATTERNS.ADDRESS, ...FIELD_PATTERNS.LATITUDE], description: 'Location field (address or latitude)' }
    ],
    optionalFields: [
      { patterns: FIELD_PATTERNS.LONGITUDE, description: 'Longitude field' },
    ],
    minRequiredMatches: 1,
  },
  {
    capability: 'view:gallery',
    category: 'views',
    label: 'Gallery View',
    description: 'Dataset has image/media content for visual browsing',
    icon: 'Image',
    requiredFields: [
      { patterns: FIELD_PATTERNS.IMAGE, description: 'Image/media field' }
    ],
    optionalFields: [
      { patterns: FIELD_PATTERNS.THUMBNAIL, description: 'Thumbnail field' },
      { patterns: FIELD_PATTERNS.TITLE, description: 'Title/name field' },
    ],
  },
  {
    capability: 'view:kanban',
    category: 'views',
    label: 'Board View',
    description: 'Dataset has status/stage workflow for kanban-style organization',
    icon: 'Columns3',
    requiredFields: [
      { patterns: FIELD_PATTERNS.STATUS, description: 'Status/stage field' }
    ],
    optionalFields: [
      { patterns: FIELD_PATTERNS.TITLE, description: 'Title/name field' },
    ],
  },

  // =========================================================================
  // IMPORT CAPABILITIES
  // =========================================================================
  {
    capability: 'import:csv',
    category: 'import',
    label: 'CSV Import',
    description: 'Import data from CSV files',
    icon: 'FileSpreadsheet',
    requiredFields: [], // Always available
  },
  {
    capability: 'import:json',
    category: 'import',
    label: 'JSON Import',
    description: 'Import data from JSON files',
    icon: 'FileJson',
    requiredFields: [], // Always available
  },
  {
    capability: 'import:excel',
    category: 'import',
    label: 'Excel Import',
    description: 'Import data from Excel files',
    icon: 'FileSpreadsheet',
    requiredFields: [], // Always available
  },

  // =========================================================================
  // EXPORT CAPABILITIES
  // =========================================================================
  {
    capability: 'export:csv',
    category: 'export',
    label: 'CSV Export',
    description: 'Export data to CSV format',
    icon: 'Download',
    requiredFields: [], // Always available
  },
  {
    capability: 'export:json',
    category: 'export',
    label: 'JSON Export',
    description: 'Export data to JSON format',
    icon: 'FileJson',
    requiredFields: [], // Always available
  },
  {
    capability: 'export:pdf',
    category: 'export',
    label: 'PDF Export',
    description: 'Export data to PDF format',
    icon: 'FileText',
    requiredFields: [], // Always available
  },

  // =========================================================================
  // BULK OPERATION CAPABILITIES
  // =========================================================================
  {
    capability: 'bulk:edit',
    category: 'bulk-operations',
    label: 'Bulk Edit',
    description: 'Edit multiple records at once',
    icon: 'Pencil',
    requiredFields: [], // Always available when data exists
  },
  {
    capability: 'bulk:delete',
    category: 'bulk-operations',
    label: 'Bulk Delete',
    description: 'Delete multiple records at once',
    icon: 'Trash2',
    requiredFields: [], // Always available when data exists
  },
  {
    capability: 'bulk:assign',
    category: 'bulk-operations',
    label: 'Bulk Assign',
    description: 'Assign multiple records to a project/person',
    icon: 'UserPlus',
    requiredFields: [
      { patterns: [/assigned_to/i, /assignee/i, /owner/i, /project_id/i, /team_id/i], description: 'Assignment field' }
    ],
  },
  {
    capability: 'bulk:status-change',
    category: 'bulk-operations',
    label: 'Bulk Status Change',
    description: 'Change status of multiple records at once',
    icon: 'RefreshCw',
    requiredFields: [
      { patterns: FIELD_PATTERNS.STATUS, description: 'Status field' }
    ],
  },

  // =========================================================================
  // FEATURE CAPABILITIES
  // =========================================================================
  {
    capability: 'notifications:enabled',
    category: 'features',
    label: 'Notifications',
    description: 'Dataset supports notification triggers',
    icon: 'Bell',
    requiredFields: [
      { patterns: [/notification/i, /alert/i, /remind/i, /due_date/i, /deadline/i], description: 'Notification trigger field' }
    ],
  },
  {
    capability: 'audit:trail',
    category: 'features',
    label: 'Audit Trail',
    description: 'Dataset has audit/history tracking',
    icon: 'History',
    requiredFields: [
      { patterns: [/created_at/i, /updated_at/i, /created_by/i, /updated_by/i, /modified_at/i], description: 'Audit timestamp field' }
    ],
    minRequiredMatches: 1,
  },
  {
    capability: 'versioning:enabled',
    category: 'features',
    label: 'Version History',
    description: 'Dataset supports version tracking',
    icon: 'GitBranch',
    requiredFields: [
      { patterns: [/version/i, /revision/i, /^v\d/i], description: 'Version field' }
    ],
  },
];

/**
 * Get capability requirement by capability type
 */
export function getCapabilityRequirement(capability: string): CapabilityRequirement | undefined {
  return CAPABILITY_REGISTRY.find(r => r.capability === capability);
}

/**
 * Get all capabilities in a category
 */
export function getCapabilitiesByCategory(category: string): CapabilityRequirement[] {
  return CAPABILITY_REGISTRY.filter(r => r.category === category);
}

/**
 * Get all scanning capabilities
 */
export function getScanningCapabilities(): CapabilityRequirement[] {
  return getCapabilitiesByCategory('scanning');
}

/**
 * Get all view capabilities
 */
export function getViewCapabilities(): CapabilityRequirement[] {
  return getCapabilitiesByCategory('views');
}
