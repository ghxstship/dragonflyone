# Universal Multi-Industry Advancing Catalog Enrichment

**Status:** ✅ Complete  
**Date:** November 25, 2025  
**Catalog Items:** 200+ items across 36 categories (expandable to 500+)  
**Industries Supported:** 14 industry verticals

---

## 📋 Overview

The advancing catalog has been enriched to support multi-industry universal procurement across any business vertical. The system now supports events, corporate, construction, healthcare, hospitality, film/TV, retail, sports, education, government, nonprofit, manufacturing, and logistics industries.

---

## 🏭 Supported Industry Verticals

| Industry | Code | Description |
|----------|------|-------------|
| Events & Entertainment | `events_entertainment` | Concerts, festivals, conferences, trade shows |
| Corporate Meetings | `corporate_meetings` | Business meetings, conferences, retreats |
| Construction | `construction` | Building, renovation, site services |
| Healthcare | `healthcare` | Medical facilities, mobile clinics |
| Hospitality | `hospitality` | Hotels, restaurants, venues |
| Film & Television | `film_television` | Production services, sets, equipment |
| Retail | `retail` | Pop-ups, activations, store services |
| Sports | `sports` | Games, tournaments, athletic events |
| Education | `education` | Schools, universities, training |
| Government | `government` | Public sector, civic events |
| Nonprofit | `nonprofit` | Charitable events, fundraisers |
| Manufacturing | `manufacturing` | Factory services, industrial |
| Logistics | `logistics` | Warehousing, shipping, freight |
| Universal | `universal` | Applies to all industries |

---

## 📂 Category Structure (36 Categories)

### Technical (10 subcategories)
- **TECH-AUD** - Audio systems, microphones, mixing
- **TECH-LGT** - Lighting fixtures, control, effects
- **TECH-VID** - Video, projection, LED walls
- **TECH-BCK** - Backline, instruments
- **TECH-STG** - Staging, platforms, risers
- **TECH-RIG** - Rigging, hoists, truss
- **TECH-PWR** - Power distribution, generators
- **TECH-CRW** - Technical crew & management
- **TECH-COM** - Communications, IT, networking

### Production (4 subcategories)
- **PROD-EVT** - Event production personnel
- **PROD-CRE** - Creative direction, design
- **PROD-TAL** - Talent management
- **PROD-CNT** - Content production

### Equipment (3 subcategories)
- **EQUIP-GEN** - General equipment, tools
- **EQUIP-TST** - Test equipment, meters
- **EQUIP-SFT** - Safety equipment, PPE

### Site Infrastructure (5 subcategories)
- **SITE-STR** - Structures, scaffolding
- **SITE-TNT** - Tents & canopies
- **SITE-FAC** - Facilities, restrooms
- **SITE-FLR** - Flooring, ground protection
- **SITE-BAR** - Barriers & fencing

### Hospitality (3 subcategories)
- **HOSP-CAT** - Catering, food service
- **HOSP-BEV** - Beverage, bar service
- **HOSP-GST** - Guest services

### Transportation (2 subcategories)
- **TRANS-VEH** - Vehicles, lifts
- **TRANS-LOG** - Logistics, freight

### Safety & Security (3 subcategories)
- **SAFE-PER** - Security personnel
- **SAFE-EQP** - Security equipment
- **SAFE-MED** - Medical services

### Signage & Branding (3 subcategories)
- **SIGN-BAN** - Banners & displays
- **SIGN-WAY** - Wayfinding
- **SIGN-DIG** - Digital signage

### Furniture & Décor (4 subcategories)
- **FURN-SEA** - Seating
- **FURN-TAB** - Tables
- **FURN-LIN** - Linens & soft goods
- **FURN-DEC** - Décor & florals

### Climate Control (2 subcategories)
- **CLIM-HVA** - HVAC systems
- **CLIM-POR** - Portable climate

### Waste Management (2 subcategories)
- **WASTE-COL** - Waste collection
- **WASTE-CLN** - Cleaning services

### Permits & Compliance (2 subcategories)
- **PERMIT-LIC** - Licenses & permits
- **PERMIT-INS** - Insurance

### Professional Services (3 subcategories)
- **PROF-LEG** - Legal services
- **PROF-ACC** - Accounting
- **PROF-CON** - Consulting

### Marketing & Promotion (3 subcategories)
- **MKTG-PRT** - Print materials
- **MKTG-DIG** - Digital marketing
- **MKTG-MER** - Merchandise

### Technology Services (3 subcategories)
- **TECH-REG** - Registration systems
- **TECH-APP** - Event apps
- **TECH-ANA** - Analytics

### Staffing (3 subcategories)
- **STAFF-GEN** - General labor
- **STAFF-SPE** - Specialized staff
- **STAFF-VOL** - Volunteer coordination

---

## 🔧 Schema Enhancements

### New Enums
```sql
-- Industry classification
CREATE TYPE industry_vertical AS ENUM (
  'events_entertainment', 'corporate_meetings', 'construction',
  'healthcare', 'hospitality', 'film_television', 'retail',
  'sports', 'education', 'government', 'nonprofit',
  'manufacturing', 'logistics', 'universal'
);

-- Procurement types
CREATE TYPE procurement_type AS ENUM (
  'rental', 'purchase', 'service', 'labor',
  'consumable', 'license', 'subscription'
);

-- Lead time units
CREATE TYPE lead_time_unit AS ENUM (
  'hours', 'days', 'weeks', 'months'
);
```

### Enhanced Catalog Fields
| Field | Type | Description |
|-------|------|-------------|
| `industry_verticals` | `industry_vertical[]` | Industries this item applies to |
| `procurement_type` | `procurement_type` | How item is typically procured |
| `typical_lead_time` | `integer` | Standard lead time |
| `lead_time_unit` | `lead_time_unit` | Unit for lead time |
| `requires_certification` | `boolean` | Operator certification needed |
| `certification_types` | `text[]` | Required certifications |
| `hazard_class` | `text` | Hazmat classification |
| `insurance_required` | `boolean` | Insurance needed |
| `min_insurance_coverage` | `numeric` | Minimum coverage amount |
| `regulatory_codes` | `text[]` | Applicable regulations |
| `sustainability_rating` | `text` | Environmental rating |
| `carbon_footprint_kg` | `numeric` | Carbon impact |
| `base_price_low` | `numeric` | Price range low |
| `base_price_high` | `numeric` | Price range high |
| `price_currency` | `text` | Currency code |
| `setup_time_minutes` | `integer` | Setup duration |
| `teardown_time_minutes` | `integer` | Teardown duration |
| `power_requirements` | `text` | Power specs |
| `weight_kg` | `numeric` | Item weight |
| `dimensions_cm` | `jsonb` | L x W x H |
| `weather_rating` | `text` | Weather resistance |
| `indoor_outdoor` | `text` | Usage environment |
| `accessibility_compliant` | `boolean` | ADA compliant |
| `search_keywords` | `text[]` | Search optimization |
| `featured` | `boolean` | Featured item flag |
| `deprecated` | `boolean` | Deprecated flag |

### New Supporting Tables
1. **`catalog_categories`** - Hierarchical category structure
2. **`catalog_tags`** - Flexible tagging system
3. **`catalog_item_tags`** - Item-tag associations
4. **`catalog_pricing_tiers`** - Volume pricing
5. **`catalog_compliance_requirements`** - Regulatory requirements
6. **`catalog_vendors`** - Approved vendors
7. **`catalog_item_vendors`** - Vendor-item associations

---

## 📊 Migration Files

| Migration | Description |
|-----------|-------------|
| `0105_universal_advancing_catalog_schema.sql` | Schema enhancements, enums, new tables |
| `0106_universal_catalog_items_part1.sql` | Audio & Lighting items |
| `0107_universal_catalog_items_part2.sql` | Video, Staging, Rigging, Power items |
| `0108_universal_catalog_items_part3.sql` | Site Infrastructure, Hospitality items |
| `0109_universal_catalog_items_part4.sql` | Transportation, Security, Signage, Furniture |
| `0110_universal_catalog_items_part5.sql` | Climate, Waste, Permits, Services, Staffing |

---

## 🔌 TypeScript Types

### New Types Added
```typescript
export type IndustryVertical = 
  | 'events_entertainment' | 'corporate_meetings' | 'construction'
  | 'healthcare' | 'hospitality' | 'film_television' | 'retail'
  | 'sports' | 'education' | 'government' | 'nonprofit'
  | 'manufacturing' | 'logistics' | 'universal';

export type ProcurementType = 
  | 'rental' | 'purchase' | 'service' | 'labor'
  | 'consumable' | 'license' | 'subscription';

export type LeadTimeUnit = 'hours' | 'days' | 'weeks' | 'months';
```

### Enhanced Interfaces
- `ProductionCatalogItem` - 30+ new optional fields
- `CatalogCategory` - Hierarchical categories
- `CatalogTag` - Flexible tagging
- `CatalogPricingTier` - Volume discounts
- `CatalogComplianceRequirement` - Regulatory tracking
- `CatalogVendor` - Vendor management
- `CatalogItemVendor` - Vendor-item pricing

### Helper Constants
```typescript
export const INDUSTRY_VERTICAL_LABELS: Record<IndustryVertical, string>;
export const PROCUREMENT_TYPE_LABELS: Record<ProcurementType, string>;
```

---

## 🚀 Usage Examples

### Filter by Industry
```typescript
const { data } = useAdvancingCatalog({
  industry_vertical: 'construction',
  procurement_type: 'rental',
  limit: 50,
});
```

### Filter by Price Range
```typescript
const { data } = useAdvancingCatalog({
  category: 'Technical',
  price_min: 100,
  price_max: 500,
});
```

### Get Featured Items
```typescript
const { data } = useAdvancingCatalog({
  featured: true,
  limit: 20,
});
```

---

## 📈 Item Count by Category

| Category | Items |
|----------|-------|
| Technical - Audio | 20 |
| Technical - Lighting | 20 |
| Technical - Video | 20 |
| Technical - Staging | 15 |
| Technical - Rigging | 15 |
| Technical - Power | 15 |
| Site Infrastructure | 25 |
| Hospitality | 20 |
| Transportation | 11 |
| Safety & Security | 16 |
| Signage & Branding | 8 |
| Furniture & Décor | 10 |
| Climate Control | 7 |
| Waste Management | 8 |
| Permits & Compliance | 8 |
| Professional Services | 6 |
| Marketing & Promotion | 7 |
| Technology Services | 7 |
| Staffing | 10 |
| **Total** | **~200+** |

---

## 🔄 Backward Compatibility

All existing catalog items and advance requests remain fully functional. New fields are optional with sensible defaults:
- `industry_verticals` defaults to `['universal']`
- `procurement_type` defaults to `'rental'`
- All new fields are nullable

---

## 🎯 Key Features

1. **Multi-Industry Support** - 14 industry verticals
2. **Procurement Types** - Rental, purchase, service, labor, consumable, license, subscription
3. **Price Guidance** - Low/high price ranges for budgeting
4. **Compliance Tracking** - Certifications, permits, insurance requirements
5. **Vendor Management** - Preferred vendors, pricing, lead times
6. **Volume Pricing** - Tiered pricing support
7. **Sustainability** - Carbon footprint, eco ratings
8. **Accessibility** - ADA compliance flags
9. **Search Optimization** - Keywords, tags, featured items
10. **Deprecation Support** - Mark items as deprecated with replacements

---

**Enrichment Complete!** 🎉

The advancing catalog is now a robust, multi-industry universal procurement system ready to support any business vertical.
