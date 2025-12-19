// ============================================================================
// UNIFIED CATALOG CATEGORY SYSTEM
// Single source of truth for all category/classification systems
// Based on the canonical catalog_categories table schema
// ============================================================================

import type { IndustryVertical } from './types/advancing';

// ============================================================================
// CATEGORY CODES - Primary identifiers matching database
// ============================================================================

export const CATALOG_CATEGORY_CODES = {
  // Top-level categories
  TECH: 'TECH',
  PROD: 'PROD',
  EQUIP: 'EQUIP',
  SITE: 'SITE',
  HOSP: 'HOSP',
  TRANS: 'TRANS',
  SAFE: 'SAFE',
  SIGN: 'SIGN',
  FURN: 'FURN',
  CLIM: 'CLIM',
  WASTE: 'WASTE',
  PERMIT: 'PERMIT',
  PROF: 'PROF',
  MKTG: 'MKTG',
  APPS: 'APPS',
  STAFF: 'STAFF',

  // Technical subcategories
  TECH_AUD: 'TECH-AUD',
  TECH_LGT: 'TECH-LGT',
  TECH_VID: 'TECH-VID',
  TECH_BCK: 'TECH-BCK',
  TECH_STG: 'TECH-STG',
  TECH_RIG: 'TECH-RIG',
  TECH_PWR: 'TECH-PWR',
  TECH_CRW: 'TECH-CRW',
  TECH_COM: 'TECH-COM',

  // Production subcategories
  PROD_EVT: 'PROD-EVT',
  PROD_CRE: 'PROD-CRE',
  PROD_TAL: 'PROD-TAL',
  PROD_CNT: 'PROD-CNT',

  // Equipment subcategories
  EQUIP_GEN: 'EQUIP-GEN',
  EQUIP_TST: 'EQUIP-TST',
  EQUIP_SFT: 'EQUIP-SFT',

  // Site subcategories
  SITE_STR: 'SITE-STR',
  SITE_TNT: 'SITE-TNT',
  SITE_FAC: 'SITE-FAC',
  SITE_FLR: 'SITE-FLR',
  SITE_BAR: 'SITE-BAR',

  // Hospitality subcategories
  HOSP_CAT: 'HOSP-CAT',
  HOSP_BEV: 'HOSP-BEV',
  HOSP_GST: 'HOSP-GST',

  // Transportation subcategories
  TRANS_VEH: 'TRANS-VEH',
  TRANS_LOG: 'TRANS-LOG',

  // Safety subcategories
  SAFE_PER: 'SAFE-PER',
  SAFE_EQP: 'SAFE-EQP',
  SAFE_MED: 'SAFE-MED',

  // Signage subcategories
  SIGN_BAN: 'SIGN-BAN',
  SIGN_WAY: 'SIGN-WAY',
  SIGN_DIG: 'SIGN-DIG',

  // Furniture subcategories
  FURN_SEA: 'FURN-SEA',
  FURN_TAB: 'FURN-TAB',
  FURN_LIN: 'FURN-LIN',
  FURN_DEC: 'FURN-DEC',

  // Climate subcategories
  CLIM_HVA: 'CLIM-HVA',
  CLIM_POR: 'CLIM-POR',

  // Waste subcategories
  WASTE_COL: 'WASTE-COL',
  WASTE_CLN: 'WASTE-CLN',

  // Permit subcategories
  PERMIT_LIC: 'PERMIT-LIC',
  PERMIT_INS: 'PERMIT-INS',

  // Professional services subcategories
  PROF_LEG: 'PROF-LEG',
  PROF_ACC: 'PROF-ACC',
  PROF_CON: 'PROF-CON',

  // Marketing subcategories
  MKTG_PRT: 'MKTG-PRT',
  MKTG_DIG: 'MKTG-DIG',
  MKTG_MER: 'MKTG-MER',

  // Apps/Tech services subcategories
  TECH_REG: 'TECH-REG',
  TECH_APP: 'TECH-APP',
  TECH_ANA: 'TECH-ANA',

  // Staffing subcategories
  STAFF_GEN: 'STAFF-GEN',
  STAFF_SPE: 'STAFF-SPE',
  STAFF_VOL: 'STAFF-VOL',
} as const;

export type CatalogCategoryCode = (typeof CATALOG_CATEGORY_CODES)[keyof typeof CATALOG_CATEGORY_CODES];

// ============================================================================
// CATEGORY DEFINITIONS - Full category metadata
// ============================================================================

export interface CatalogCategoryDefinition {
  code: CatalogCategoryCode;
  name: string;
  description: string;
  icon: string;
  parentCode: CatalogCategoryCode | null;
  displayOrder: number;
  industryVerticals: IndustryVertical[];
}

export const CATALOG_CATEGORIES: Record<CatalogCategoryCode, CatalogCategoryDefinition> = {
  // ========== TOP-LEVEL CATEGORIES ==========
  'TECH': {
    code: 'TECH',
    name: 'Technical',
    description: 'Technical equipment and services',
    icon: 'settings',
    parentCode: null,
    displayOrder: 1,
    industryVerticals: ['universal'],
  },
  'PROD': {
    code: 'PROD',
    name: 'Production',
    description: 'Production services and personnel',
    icon: 'film',
    parentCode: null,
    displayOrder: 2,
    industryVerticals: ['events_entertainment', 'film_television', 'corporate_meetings'],
  },
  'EQUIP': {
    code: 'EQUIP',
    name: 'Equipment',
    description: 'General equipment and tools',
    icon: 'tool',
    parentCode: null,
    displayOrder: 3,
    industryVerticals: ['universal'],
  },
  'SITE': {
    code: 'SITE',
    name: 'Site Infrastructure',
    description: 'Structures, facilities, and site services',
    icon: 'building',
    parentCode: null,
    displayOrder: 4,
    industryVerticals: ['events_entertainment', 'construction', 'corporate_meetings'],
  },
  'HOSP': {
    code: 'HOSP',
    name: 'Hospitality',
    description: 'Food, beverage, and guest services',
    icon: 'coffee',
    parentCode: null,
    displayOrder: 5,
    industryVerticals: ['events_entertainment', 'hospitality', 'corporate_meetings'],
  },
  'TRANS': {
    code: 'TRANS',
    name: 'Transportation',
    description: 'Vehicles, logistics, and freight',
    icon: 'truck',
    parentCode: null,
    displayOrder: 6,
    industryVerticals: ['universal'],
  },
  'SAFE': {
    code: 'SAFE',
    name: 'Safety & Security',
    description: 'Security personnel and safety services',
    icon: 'shield-check',
    parentCode: null,
    displayOrder: 7,
    industryVerticals: ['universal'],
  },
  'SIGN': {
    code: 'SIGN',
    name: 'Signage & Branding',
    description: 'Visual communications and branding',
    icon: 'flag',
    parentCode: null,
    displayOrder: 8,
    industryVerticals: ['events_entertainment', 'retail', 'corporate_meetings'],
  },
  'FURN': {
    code: 'FURN',
    name: 'Furniture & Decor',
    description: 'Furnishings, linens, and decorations',
    icon: 'armchair',
    parentCode: null,
    displayOrder: 9,
    industryVerticals: ['events_entertainment', 'hospitality', 'corporate_meetings'],
  },
  'CLIM': {
    code: 'CLIM',
    name: 'Climate Control',
    description: 'HVAC, heating, and cooling systems',
    icon: 'thermometer',
    parentCode: null,
    displayOrder: 10,
    industryVerticals: ['events_entertainment', 'construction'],
  },
  'WASTE': {
    code: 'WASTE',
    name: 'Waste Management',
    description: 'Waste disposal and cleaning services',
    icon: 'trash-2',
    parentCode: null,
    displayOrder: 11,
    industryVerticals: ['events_entertainment', 'construction'],
  },
  'PERMIT': {
    code: 'PERMIT',
    name: 'Permits & Compliance',
    description: 'Licenses, permits, and regulatory compliance',
    icon: 'file-check',
    parentCode: null,
    displayOrder: 12,
    industryVerticals: ['universal'],
  },
  'PROF': {
    code: 'PROF',
    name: 'Professional Services',
    description: 'Consulting and professional services',
    icon: 'briefcase',
    parentCode: null,
    displayOrder: 13,
    industryVerticals: ['universal'],
  },
  'MKTG': {
    code: 'MKTG',
    name: 'Marketing & Promotion',
    description: 'Marketing materials and promotional services',
    icon: 'megaphone',
    parentCode: null,
    displayOrder: 14,
    industryVerticals: ['events_entertainment', 'retail', 'corporate_meetings'],
  },
  'APPS': {
    code: 'APPS',
    name: 'Applications & Technology Services',
    description: 'Software, apps, and digital services',
    icon: 'laptop',
    parentCode: null,
    displayOrder: 15,
    industryVerticals: ['universal'],
  },
  'STAFF': {
    code: 'STAFF',
    name: 'Staffing',
    description: 'Personnel and labor services',
    icon: 'users',
    parentCode: null,
    displayOrder: 16,
    industryVerticals: ['universal'],
  },

  // ========== TECHNICAL SUBCATEGORIES ==========
  'TECH-AUD': {
    code: 'TECH-AUD',
    name: 'Audio',
    description: 'Sound systems, microphones, and audio equipment',
    icon: 'volume-2',
    parentCode: 'TECH',
    displayOrder: 10,
    industryVerticals: ['events_entertainment', 'film_television', 'corporate_meetings'],
  },
  'TECH-LGT': {
    code: 'TECH-LGT',
    name: 'Lighting',
    description: 'Lighting fixtures, control, and effects',
    icon: 'lightbulb',
    parentCode: 'TECH',
    displayOrder: 20,
    industryVerticals: ['events_entertainment', 'film_television', 'corporate_meetings'],
  },
  'TECH-VID': {
    code: 'TECH-VID',
    name: 'Video',
    description: 'Screens, projectors, cameras, and video systems',
    icon: 'monitor',
    parentCode: 'TECH',
    displayOrder: 30,
    industryVerticals: ['events_entertainment', 'film_television', 'corporate_meetings'],
  },
  'TECH-BCK': {
    code: 'TECH-BCK',
    name: 'Backline',
    description: 'Musical instruments and amplification',
    icon: 'music',
    parentCode: 'TECH',
    displayOrder: 40,
    industryVerticals: ['events_entertainment', 'film_television'],
  },
  'TECH-STG': {
    code: 'TECH-STG',
    name: 'Staging',
    description: 'Stage decks, risers, and platforms',
    icon: 'square',
    parentCode: 'TECH',
    displayOrder: 50,
    industryVerticals: ['events_entertainment', 'corporate_meetings'],
  },
  'TECH-RIG': {
    code: 'TECH-RIG',
    name: 'Rigging',
    description: 'Hoists, truss, and rigging hardware',
    icon: 'anchor',
    parentCode: 'TECH',
    displayOrder: 60,
    industryVerticals: ['events_entertainment', 'construction', 'film_television'],
  },
  'TECH-PWR': {
    code: 'TECH-PWR',
    name: 'Power Distribution',
    description: 'Generators, distribution, and cabling',
    icon: 'zap',
    parentCode: 'TECH',
    displayOrder: 70,
    industryVerticals: ['events_entertainment', 'construction'],
  },
  'TECH-CRW': {
    code: 'TECH-CRW',
    name: 'Crew & Management',
    description: 'Technical personnel and management',
    icon: 'users',
    parentCode: 'TECH',
    displayOrder: 80,
    industryVerticals: ['events_entertainment', 'film_television'],
  },
  'TECH-COM': {
    code: 'TECH-COM',
    name: 'Communications',
    description: 'IT, networking, and radio systems',
    icon: 'radio',
    parentCode: 'TECH',
    displayOrder: 90,
    industryVerticals: ['universal'],
  },

  // ========== PRODUCTION SUBCATEGORIES ==========
  'PROD-EVT': {
    code: 'PROD-EVT',
    name: 'Event Production',
    description: 'Event producers and coordinators',
    icon: 'calendar',
    parentCode: 'PROD',
    displayOrder: 100,
    industryVerticals: ['events_entertainment', 'corporate_meetings'],
  },
  'PROD-CRE': {
    code: 'PROD-CRE',
    name: 'Creative Direction',
    description: 'Creative and design services',
    icon: 'palette',
    parentCode: 'PROD',
    displayOrder: 110,
    industryVerticals: ['events_entertainment', 'film_television'],
  },
  'PROD-TAL': {
    code: 'PROD-TAL',
    name: 'Talent Management',
    description: 'Talent booking and management',
    icon: 'star',
    parentCode: 'PROD',
    displayOrder: 120,
    industryVerticals: ['events_entertainment', 'film_television'],
  },
  'PROD-CNT': {
    code: 'PROD-CNT',
    name: 'Content Production',
    description: 'Video, photo, and media production',
    icon: 'camera',
    parentCode: 'PROD',
    displayOrder: 130,
    industryVerticals: ['events_entertainment', 'film_television', 'corporate_meetings'],
  },

  // ========== EQUIPMENT SUBCATEGORIES ==========
  'EQUIP-GEN': {
    code: 'EQUIP-GEN',
    name: 'General Equipment',
    description: 'Hand tools, power tools, and supplies',
    icon: 'wrench',
    parentCode: 'EQUIP',
    displayOrder: 140,
    industryVerticals: ['universal'],
  },
  'EQUIP-TST': {
    code: 'EQUIP-TST',
    name: 'Test Equipment',
    description: 'Meters, testers, and analyzers',
    icon: 'activity',
    parentCode: 'EQUIP',
    displayOrder: 150,
    industryVerticals: ['universal'],
  },
  'EQUIP-SFT': {
    code: 'EQUIP-SFT',
    name: 'Safety Equipment',
    description: 'PPE, fall protection, and safety gear',
    icon: 'shield',
    parentCode: 'EQUIP',
    displayOrder: 160,
    industryVerticals: ['universal'],
  },

  // ========== SITE INFRASTRUCTURE SUBCATEGORIES ==========
  'SITE-STR': {
    code: 'SITE-STR',
    name: 'Structures',
    description: 'Stages, scaffolding, and temporary structures',
    icon: 'home',
    parentCode: 'SITE',
    displayOrder: 170,
    industryVerticals: ['events_entertainment', 'construction'],
  },
  'SITE-TNT': {
    code: 'SITE-TNT',
    name: 'Tents & Canopies',
    description: 'Temporary covered structures',
    icon: 'umbrella',
    parentCode: 'SITE',
    displayOrder: 180,
    industryVerticals: ['events_entertainment'],
  },
  'SITE-FAC': {
    code: 'SITE-FAC',
    name: 'Facilities',
    description: 'Restrooms, showers, and mobile offices',
    icon: 'building-2',
    parentCode: 'SITE',
    displayOrder: 190,
    industryVerticals: ['events_entertainment', 'construction'],
  },
  'SITE-FLR': {
    code: 'SITE-FLR',
    name: 'Flooring',
    description: 'Event flooring and ground protection',
    icon: 'grid',
    parentCode: 'SITE',
    displayOrder: 200,
    industryVerticals: ['events_entertainment'],
  },
  'SITE-BAR': {
    code: 'SITE-BAR',
    name: 'Barriers & Fencing',
    description: 'Crowd control and perimeter security',
    icon: 'minus-square',
    parentCode: 'SITE',
    displayOrder: 210,
    industryVerticals: ['events_entertainment', 'construction'],
  },

  // ========== HOSPITALITY SUBCATEGORIES ==========
  'HOSP-CAT': {
    code: 'HOSP-CAT',
    name: 'Catering',
    description: 'Food service and catering equipment',
    icon: 'utensils',
    parentCode: 'HOSP',
    displayOrder: 220,
    industryVerticals: ['events_entertainment', 'hospitality', 'corporate_meetings'],
  },
  'HOSP-BEV': {
    code: 'HOSP-BEV',
    name: 'Beverage',
    description: 'Bar service and beverage equipment',
    icon: 'glass-water',
    parentCode: 'HOSP',
    displayOrder: 230,
    industryVerticals: ['events_entertainment', 'hospitality'],
  },
  'HOSP-GST': {
    code: 'HOSP-GST',
    name: 'Guest Services',
    description: 'Registration, concierge, and VIP services',
    icon: 'user-check',
    parentCode: 'HOSP',
    displayOrder: 240,
    industryVerticals: ['events_entertainment', 'hospitality', 'corporate_meetings'],
  },

  // ========== TRANSPORTATION SUBCATEGORIES ==========
  'TRANS-VEH': {
    code: 'TRANS-VEH',
    name: 'Vehicles',
    description: 'Trucks, vans, carts, and specialty vehicles',
    icon: 'car',
    parentCode: 'TRANS',
    displayOrder: 250,
    industryVerticals: ['universal'],
  },
  'TRANS-LOG': {
    code: 'TRANS-LOG',
    name: 'Logistics',
    description: 'Freight, shipping, and customs',
    icon: 'package',
    parentCode: 'TRANS',
    displayOrder: 260,
    industryVerticals: ['universal'],
  },

  // ========== SAFETY & SECURITY SUBCATEGORIES ==========
  'SAFE-PER': {
    code: 'SAFE-PER',
    name: 'Security Personnel',
    description: 'Guards, crowd management, and access control',
    icon: 'user-shield',
    parentCode: 'SAFE',
    displayOrder: 270,
    industryVerticals: ['events_entertainment', 'corporate_meetings'],
  },
  'SAFE-EQP': {
    code: 'SAFE-EQP',
    name: 'Security Equipment',
    description: 'Surveillance, screening, and detection',
    icon: 'eye',
    parentCode: 'SAFE',
    displayOrder: 280,
    industryVerticals: ['universal'],
  },
  'SAFE-MED': {
    code: 'SAFE-MED',
    name: 'Medical Services',
    description: 'First aid, EMTs, and medical facilities',
    icon: 'heart-pulse',
    parentCode: 'SAFE',
    displayOrder: 290,
    industryVerticals: ['events_entertainment', 'healthcare'],
  },

  // ========== SIGNAGE & BRANDING SUBCATEGORIES ==========
  'SIGN-BAN': {
    code: 'SIGN-BAN',
    name: 'Banners & Displays',
    description: 'Banners, flags, and display systems',
    icon: 'image',
    parentCode: 'SIGN',
    displayOrder: 300,
    industryVerticals: ['events_entertainment', 'retail'],
  },
  'SIGN-WAY': {
    code: 'SIGN-WAY',
    name: 'Wayfinding',
    description: 'Directional signage and navigation',
    icon: 'map-pin',
    parentCode: 'SIGN',
    displayOrder: 310,
    industryVerticals: ['events_entertainment', 'retail'],
  },
  'SIGN-DIG': {
    code: 'SIGN-DIG',
    name: 'Digital Signage',
    description: 'LED displays and digital messaging',
    icon: 'tv',
    parentCode: 'SIGN',
    displayOrder: 320,
    industryVerticals: ['events_entertainment', 'retail', 'corporate_meetings'],
  },

  // ========== FURNITURE & DECOR SUBCATEGORIES ==========
  'FURN-SEA': {
    code: 'FURN-SEA',
    name: 'Seating',
    description: 'Chairs, sofas, and seating arrangements',
    icon: 'sofa',
    parentCode: 'FURN',
    displayOrder: 330,
    industryVerticals: ['events_entertainment', 'hospitality'],
  },
  'FURN-TAB': {
    code: 'FURN-TAB',
    name: 'Tables',
    description: 'Tables, counters, and work surfaces',
    icon: 'table',
    parentCode: 'FURN',
    displayOrder: 340,
    industryVerticals: ['events_entertainment', 'hospitality'],
  },
  'FURN-LIN': {
    code: 'FURN-LIN',
    name: 'Linens & Soft Goods',
    description: 'Tablecloths, draping, and fabrics',
    icon: 'shirt',
    parentCode: 'FURN',
    displayOrder: 350,
    industryVerticals: ['events_entertainment', 'hospitality'],
  },
  'FURN-DEC': {
    code: 'FURN-DEC',
    name: 'Decor & Florals',
    description: 'Decorations, florals, and centerpieces',
    icon: 'flower',
    parentCode: 'FURN',
    displayOrder: 360,
    industryVerticals: ['events_entertainment', 'hospitality'],
  },

  // ========== CLIMATE CONTROL SUBCATEGORIES ==========
  'CLIM-HVA': {
    code: 'CLIM-HVA',
    name: 'HVAC Systems',
    description: 'Air conditioning and heating units',
    icon: 'wind',
    parentCode: 'CLIM',
    displayOrder: 370,
    industryVerticals: ['events_entertainment', 'construction'],
  },
  'CLIM-POR': {
    code: 'CLIM-POR',
    name: 'Portable Climate',
    description: 'Fans, heaters, and spot coolers',
    icon: 'fan',
    parentCode: 'CLIM',
    displayOrder: 380,
    industryVerticals: ['events_entertainment', 'construction'],
  },

  // ========== WASTE MANAGEMENT SUBCATEGORIES ==========
  'WASTE-COL': {
    code: 'WASTE-COL',
    name: 'Waste Collection',
    description: 'Bins, dumpsters, and recycling',
    icon: 'recycle',
    parentCode: 'WASTE',
    displayOrder: 390,
    industryVerticals: ['events_entertainment', 'construction'],
  },
  'WASTE-CLN': {
    code: 'WASTE-CLN',
    name: 'Cleaning Services',
    description: 'Janitorial and cleaning crews',
    icon: 'sparkles',
    parentCode: 'WASTE',
    displayOrder: 400,
    industryVerticals: ['events_entertainment', 'hospitality'],
  },

  // ========== PERMITS & COMPLIANCE SUBCATEGORIES ==========
  'PERMIT-LIC': {
    code: 'PERMIT-LIC',
    name: 'Licenses & Permits',
    description: 'Event permits and operational licenses',
    icon: 'badge',
    parentCode: 'PERMIT',
    displayOrder: 410,
    industryVerticals: ['universal'],
  },
  'PERMIT-INS': {
    code: 'PERMIT-INS',
    name: 'Insurance',
    description: 'Liability, equipment, and event insurance',
    icon: 'shield-plus',
    parentCode: 'PERMIT',
    displayOrder: 420,
    industryVerticals: ['universal'],
  },

  // ========== PROFESSIONAL SERVICES SUBCATEGORIES ==========
  'PROF-LEG': {
    code: 'PROF-LEG',
    name: 'Legal Services',
    description: 'Contracts, compliance, and legal counsel',
    icon: 'scale',
    parentCode: 'PROF',
    displayOrder: 430,
    industryVerticals: ['universal'],
  },
  'PROF-ACC': {
    code: 'PROF-ACC',
    name: 'Accounting',
    description: 'Financial services and bookkeeping',
    icon: 'calculator',
    parentCode: 'PROF',
    displayOrder: 440,
    industryVerticals: ['universal'],
  },
  'PROF-CON': {
    code: 'PROF-CON',
    name: 'Consulting',
    description: 'Strategy, planning, and advisory',
    icon: 'lightbulb',
    parentCode: 'PROF',
    displayOrder: 450,
    industryVerticals: ['universal'],
  },

  // ========== MARKETING SUBCATEGORIES ==========
  'MKTG-PRT': {
    code: 'MKTG-PRT',
    name: 'Print Materials',
    description: 'Brochures, programs, and printed collateral',
    icon: 'printer',
    parentCode: 'MKTG',
    displayOrder: 460,
    industryVerticals: ['events_entertainment', 'corporate_meetings'],
  },
  'MKTG-DIG': {
    code: 'MKTG-DIG',
    name: 'Digital Marketing',
    description: 'Social media, email, and digital campaigns',
    icon: 'globe',
    parentCode: 'MKTG',
    displayOrder: 470,
    industryVerticals: ['universal'],
  },
  'MKTG-MER': {
    code: 'MKTG-MER',
    name: 'Merchandise',
    description: 'Branded merchandise and giveaways',
    icon: 'gift',
    parentCode: 'MKTG',
    displayOrder: 480,
    industryVerticals: ['events_entertainment', 'retail'],
  },

  // ========== APPS & TECH SERVICES SUBCATEGORIES ==========
  'TECH-REG': {
    code: 'TECH-REG',
    name: 'Registration Systems',
    description: 'Ticketing and registration platforms',
    icon: 'ticket',
    parentCode: 'APPS',
    displayOrder: 490,
    industryVerticals: ['events_entertainment', 'corporate_meetings'],
  },
  'TECH-APP': {
    code: 'TECH-APP',
    name: 'Event Apps',
    description: 'Mobile apps and digital experiences',
    icon: 'smartphone',
    parentCode: 'APPS',
    displayOrder: 500,
    industryVerticals: ['events_entertainment', 'corporate_meetings'],
  },
  'TECH-ANA': {
    code: 'TECH-ANA',
    name: 'Analytics',
    description: 'Data collection and reporting',
    icon: 'bar-chart',
    parentCode: 'APPS',
    displayOrder: 510,
    industryVerticals: ['universal'],
  },

  // ========== STAFFING SUBCATEGORIES ==========
  'STAFF-GEN': {
    code: 'STAFF-GEN',
    name: 'General Labor',
    description: 'Setup, teardown, and general assistance',
    icon: 'hard-hat',
    parentCode: 'STAFF',
    displayOrder: 520,
    industryVerticals: ['events_entertainment', 'construction'],
  },
  'STAFF-SPE': {
    code: 'STAFF-SPE',
    name: 'Specialized Staff',
    description: 'Interpreters, photographers, stylists',
    icon: 'user-cog',
    parentCode: 'STAFF',
    displayOrder: 530,
    industryVerticals: ['events_entertainment', 'corporate_meetings'],
  },
  'STAFF-VOL': {
    code: 'STAFF-VOL',
    name: 'Volunteer Coordination',
    description: 'Volunteer management and training',
    icon: 'heart-handshake',
    parentCode: 'STAFF',
    displayOrder: 540,
    industryVerticals: ['events_entertainment', 'nonprofit'],
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all top-level (parent) categories
 */
export function getTopLevelCategories(): CatalogCategoryDefinition[] {
  return Object.values(CATALOG_CATEGORIES)
    .filter((cat) => cat.parentCode === null)
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

/**
 * Get subcategories for a given parent category
 */
export function getSubcategories(parentCode: CatalogCategoryCode): CatalogCategoryDefinition[] {
  return Object.values(CATALOG_CATEGORIES)
    .filter((cat) => cat.parentCode === parentCode)
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

/**
 * Get category by code
 */
export function getCategoryByCode(code: CatalogCategoryCode): CatalogCategoryDefinition | undefined {
  return CATALOG_CATEGORIES[code];
}

/**
 * Get all categories as a flat list (for dropdowns)
 */
export function getAllCategoriesFlat(): CatalogCategoryDefinition[] {
  return Object.values(CATALOG_CATEGORIES).sort((a, b) => a.displayOrder - b.displayOrder);
}

/**
 * Get categories filtered by industry vertical
 */
export function getCategoriesByIndustry(industry: IndustryVertical): CatalogCategoryDefinition[] {
  return Object.values(CATALOG_CATEGORIES)
    .filter((cat) => cat.industryVerticals.includes(industry) || cat.industryVerticals.includes('universal'))
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

/**
 * Build category tree structure
 */
export function getCategoryTree(): (CatalogCategoryDefinition & { children: CatalogCategoryDefinition[] })[] {
  const topLevel = getTopLevelCategories();
  return topLevel.map((parent) => ({
    ...parent,
    children: getSubcategories(parent.code),
  }));
}

/**
 * Get category options for select dropdowns (code + name pairs)
 */
export function getCategoryOptions(includeTopLevel = true): { value: string; label: string }[] {
  const categories = includeTopLevel
    ? getAllCategoriesFlat()
    : Object.values(CATALOG_CATEGORIES).filter((cat) => cat.parentCode !== null);

  return categories.map((cat) => ({
    value: cat.code,
    label: cat.parentCode ? `${CATALOG_CATEGORIES[cat.parentCode].name} > ${cat.name}` : cat.name,
  }));
}

/**
 * Get category names for simple string-based dropdowns
 * This provides compatibility with legacy code that uses simple string categories
 */
export function getCategoryNames(includeTopLevel = true): string[] {
  const categories = includeTopLevel
    ? getAllCategoriesFlat()
    : Object.values(CATALOG_CATEGORIES).filter((cat) => cat.parentCode !== null);

  return categories.map((cat) => cat.name);
}

/**
 * Get subcategory names for a parent category (for simple string-based dropdowns)
 */
export function getSubcategoryNames(parentCode: CatalogCategoryCode): string[] {
  return getSubcategories(parentCode).map((cat) => cat.name);
}

