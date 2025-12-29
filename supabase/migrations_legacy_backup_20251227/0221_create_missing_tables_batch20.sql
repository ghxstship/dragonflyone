-- Migration: Create missing tables (Batch 20 - Vendor through Zone)
-- Tables: vendor_activity_log through zones

-- VENDOR ACTIVITY LOG
CREATE TABLE IF NOT EXISTS public.vendor_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    description TEXT,
    old_values JSONB,
    new_values JSONB,
    performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- VENDOR APPLICATIONS
CREATE TABLE IF NOT EXISTS public.vendor_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    company_name TEXT NOT NULL,
    contact_name TEXT,
    email TEXT,
    phone TEXT,
    vendor_type TEXT,
    products_services TEXT,
    booth_requirements JSONB DEFAULT '{}'::jsonb,
    insurance_info JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'submitted',
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- VENDOR CATEGORIES
CREATE TABLE IF NOT EXISTS public.vendor_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID,
    name TEXT NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES public.vendor_categories(id) ON DELETE SET NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- VENDOR CERTIFICATIONS
CREATE TABLE IF NOT EXISTS public.vendor_certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
    certification_type TEXT NOT NULL,
    certification_name TEXT NOT NULL,
    issuing_body TEXT,
    certificate_number TEXT,
    issue_date DATE,
    expiry_date DATE,
    document_url TEXT,
    is_verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- VENDOR COMPLIANCE
CREATE TABLE IF NOT EXISTS public.vendor_compliance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
    compliance_type TEXT NOT NULL,
    requirement TEXT,
    status TEXT DEFAULT 'pending',
    due_date DATE,
    completed_date DATE,
    document_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- VENDOR CONTACTS
CREATE TABLE IF NOT EXISTS public.vendor_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
    contact_type TEXT DEFAULT 'primary',
    name TEXT NOT NULL,
    title TEXT,
    email TEXT,
    phone TEXT,
    is_primary BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- VENDOR CONTRACTS
CREATE TABLE IF NOT EXISTS public.vendor_contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
    contract_id UUID REFERENCES public.contracts(id) ON DELETE SET NULL,
    contract_type TEXT,
    start_date DATE,
    end_date DATE,
    value DECIMAL(14,2),
    terms TEXT,
    document_url TEXT,
    status TEXT DEFAULT 'draft',
    signed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- VENDOR DOCUMENTS
CREATE TABLE IF NOT EXISTS public.vendor_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    expiry_date DATE,
    is_verified BOOLEAN DEFAULT false,
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- VENDOR INSURANCE
CREATE TABLE IF NOT EXISTS public.vendor_insurance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
    insurance_type TEXT NOT NULL,
    policy_number TEXT,
    provider TEXT,
    coverage_amount DECIMAL(14,2),
    effective_date DATE,
    expiry_date DATE,
    certificate_url TEXT,
    is_verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- VENDOR INVOICES
CREATE TABLE IF NOT EXISTS public.vendor_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
    invoice_number TEXT,
    invoice_date DATE NOT NULL,
    due_date DATE,
    amount DECIMAL(14,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT DEFAULT 'pending',
    paid_date DATE,
    paid_amount DECIMAL(14,2),
    document_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- VENDOR NOTES
CREATE TABLE IF NOT EXISTS public.vendor_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
    note_type TEXT DEFAULT 'general',
    content TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- VENDOR PAYMENTS
CREATE TABLE IF NOT EXISTS public.vendor_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES public.vendor_invoices(id) ON DELETE SET NULL,
    payment_date DATE NOT NULL,
    amount DECIMAL(14,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    payment_method TEXT,
    reference_number TEXT,
    notes TEXT,
    processed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- VENDOR PERFORMANCE
CREATE TABLE IF NOT EXISTS public.vendor_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
    evaluation_period_start DATE,
    evaluation_period_end DATE,
    quality_score DECIMAL(5,2),
    delivery_score DECIMAL(5,2),
    communication_score DECIMAL(5,2),
    price_score DECIMAL(5,2),
    overall_score DECIMAL(5,2),
    notes TEXT,
    evaluated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- VENDOR RATINGS
CREATE TABLE IF NOT EXISTS public.vendor_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
    rated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
    quality_rating INTEGER,
    timeliness_rating INTEGER,
    communication_rating INTEGER,
    value_rating INTEGER,
    review_text TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- VENUE AMENITIES
CREATE TABLE IF NOT EXISTS public.venue_amenities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE,
    amenity_type TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    quantity INTEGER DEFAULT 1,
    location TEXT,
    is_included BOOLEAN DEFAULT true,
    additional_cost DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- VENUE AVAILABILITY
CREATE TABLE IF NOT EXISTS public.venue_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    is_available BOOLEAN DEFAULT true,
    availability_type TEXT DEFAULT 'full_day',
    start_time TIME,
    end_time TIME,
    hold_type TEXT,
    held_by TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- VENUE BLACKOUT DATES
CREATE TABLE IF NOT EXISTS public.venue_blackout_dates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    is_recurring BOOLEAN DEFAULT false,
    recurrence_rule TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- VENUE BOOKINGS
CREATE TABLE IF NOT EXISTS public.venue_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    organization_id UUID NOT NULL,
    booking_type TEXT NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    setup_start TIMESTAMPTZ,
    teardown_end TIMESTAMPTZ,
    spaces JSONB DEFAULT '[]'::jsonb,
    rental_fee DECIMAL(12,2),
    deposit_amount DECIMAL(12,2),
    deposit_paid BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'pending',
    contract_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- VENUE CONTACTS
CREATE TABLE IF NOT EXISTS public.venue_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE,
    contact_type TEXT DEFAULT 'general',
    name TEXT NOT NULL,
    title TEXT,
    email TEXT,
    phone TEXT,
    is_primary BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- VENUE DOCUMENTS
CREATE TABLE IF NOT EXISTS public.venue_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- VENUE EQUIPMENT
CREATE TABLE IF NOT EXISTS public.venue_equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE,
    equipment_type TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    quantity INTEGER DEFAULT 1,
    condition TEXT,
    is_included BOOLEAN DEFAULT true,
    rental_rate DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- VENUE FLOOR PLANS
CREATE TABLE IF NOT EXISTS public.venue_floor_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    file_url TEXT,
    file_type TEXT,
    dimensions JSONB,
    scale TEXT,
    is_current BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- VENUE HOLDS
CREATE TABLE IF NOT EXISTS public.venue_holds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE,
    hold_type TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    held_by TEXT,
    organization_id UUID,
    priority INTEGER DEFAULT 1,
    expires_at TIMESTAMPTZ,
    released_at TIMESTAMPTZ,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- VENUE IMAGES
CREATE TABLE IF NOT EXISTS public.venue_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE,
    image_type TEXT DEFAULT 'general',
    title TEXT,
    description TEXT,
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    display_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- VENUE INSPECTIONS
CREATE TABLE IF NOT EXISTS public.venue_inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE,
    inspection_type TEXT NOT NULL,
    inspection_date DATE,
    inspector_name TEXT,
    inspector_company TEXT,
    checklist JSONB DEFAULT '[]'::jsonb,
    findings JSONB DEFAULT '[]'::jsonb,
    passed BOOLEAN,
    certificate_url TEXT,
    expiry_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- VENUE NOTES
CREATE TABLE IF NOT EXISTS public.venue_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE,
    note_type TEXT DEFAULT 'general',
    content TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- VENUE PRICING
CREATE TABLE IF NOT EXISTS public.venue_pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE,
    pricing_type TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    base_rate DECIMAL(12,2),
    rate_type TEXT DEFAULT 'flat',
    minimum_hours INTEGER,
    overtime_rate DECIMAL(10,2),
    deposit_percentage DECIMAL(5,2),
    cancellation_policy TEXT,
    valid_from DATE,
    valid_until DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- VENUE RATINGS
CREATE TABLE IF NOT EXISTS public.venue_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE,
    rated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
    facilities_rating INTEGER,
    staff_rating INTEGER,
    location_rating INTEGER,
    value_rating INTEGER,
    review_text TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- VENUE RESTRICTIONS
CREATE TABLE IF NOT EXISTS public.venue_restrictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE,
    restriction_type TEXT NOT NULL,
    description TEXT NOT NULL,
    applies_to TEXT,
    enforcement_level TEXT DEFAULT 'required',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- VENUE ROOMS
CREATE TABLE IF NOT EXISTS public.venue_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    room_type TEXT,
    capacity_seated INTEGER,
    capacity_standing INTEGER,
    square_footage INTEGER,
    dimensions TEXT,
    amenities JSONB DEFAULT '[]'::jsonb,
    hourly_rate DECIMAL(10,2),
    daily_rate DECIMAL(10,2),
    is_available BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- VENUE SPACES
CREATE TABLE IF NOT EXISTS public.venue_spaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    space_type TEXT NOT NULL,
    capacity INTEGER,
    square_footage INTEGER,
    dimensions JSONB,
    features JSONB DEFAULT '[]'::jsonb,
    hourly_rate DECIMAL(10,2),
    daily_rate DECIMAL(10,2),
    is_indoor BOOLEAN DEFAULT true,
    is_available BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- VENUE TECHNICAL SPECS
CREATE TABLE IF NOT EXISTS public.venue_technical_specs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE,
    spec_category TEXT NOT NULL,
    spec_name TEXT NOT NULL,
    spec_value TEXT,
    unit TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- VIDEO ASSETS
CREATE TABLE IF NOT EXISTS public.video_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    duration_seconds INTEGER,
    file_size BIGINT,
    resolution TEXT,
    format TEXT,
    is_public BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- VIP EXPERIENCES
CREATE TABLE IF NOT EXISTS public.vip_experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(12,2),
    capacity INTEGER,
    sold_count INTEGER DEFAULT 0,
    inclusions JSONB DEFAULT '[]'::jsonb,
    schedule JSONB DEFAULT '{}'::jsonb,
    location TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- VIP GUESTS
CREATE TABLE IF NOT EXISTS public.vip_guests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    guest_name TEXT NOT NULL,
    guest_type TEXT DEFAULT 'vip',
    company TEXT,
    title TEXT,
    email TEXT,
    phone TEXT,
    dietary_restrictions TEXT[],
    accessibility_needs TEXT[],
    special_requests TEXT,
    arrival_time TIMESTAMPTZ,
    departure_time TIMESTAMPTZ,
    assigned_host UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- VIP PACKAGES
CREATE TABLE IF NOT EXISTS public.vip_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(12,2) NOT NULL,
    quantity_available INTEGER,
    quantity_sold INTEGER DEFAULT 0,
    inclusions JSONB DEFAULT '[]'::jsonb,
    exclusions JSONB DEFAULT '[]'::jsonb,
    terms TEXT,
    is_active BOOLEAN DEFAULT true,
    valid_from TIMESTAMPTZ,
    valid_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- VIRTUAL QUEUES
CREATE TABLE IF NOT EXISTS public.virtual_queues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    queue_name TEXT NOT NULL,
    queue_type TEXT DEFAULT 'general',
    max_capacity INTEGER,
    current_count INTEGER DEFAULT 0,
    average_wait_minutes INTEGER,
    is_active BOOLEAN DEFAULT true,
    opens_at TIMESTAMPTZ,
    closes_at TIMESTAMPTZ,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- VOLUNTEER APPLICATIONS
CREATE TABLE IF NOT EXISTS public.volunteer_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    applicant_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    preferred_roles TEXT[],
    availability JSONB DEFAULT '{}'::jsonb,
    experience TEXT,
    skills TEXT[],
    emergency_contact JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'submitted',
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- VOLUNTEER HOURS
CREATE TABLE IF NOT EXISTS public.volunteer_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    volunteer_id UUID NOT NULL,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    shift_id UUID,
    check_in_time TIMESTAMPTZ,
    check_out_time TIMESTAMPTZ,
    hours_worked DECIMAL(6,2),
    role TEXT,
    supervisor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- VOLUNTEER SHIFTS
CREATE TABLE IF NOT EXISTS public.volunteer_shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    shift_name TEXT NOT NULL,
    role TEXT,
    department TEXT,
    shift_date DATE,
    start_time TIME,
    end_time TIME,
    location TEXT,
    required_count INTEGER DEFAULT 1,
    assigned_count INTEGER DEFAULT 0,
    description TEXT,
    requirements TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- VOLUNTEERS
CREATE TABLE IF NOT EXISTS public.volunteers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL,
    status TEXT DEFAULT 'active',
    total_hours DECIMAL(8,2) DEFAULT 0,
    events_participated INTEGER DEFAULT 0,
    skills TEXT[],
    certifications TEXT[],
    t_shirt_size TEXT,
    emergency_contact JSONB DEFAULT '{}'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- WAITLIST ENTRIES
CREATE TABLE IF NOT EXISTS public.waitlist_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    waitlist_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    position INTEGER,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    notified_at TIMESTAMPTZ,
    converted_at TIMESTAMPTZ,
    expired_at TIMESTAMPTZ,
    status TEXT DEFAULT 'waiting',
    metadata JSONB DEFAULT '{}'::jsonb
);

-- WALLET TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID REFERENCES public.user_wallets(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL,
    amount DECIMAL(14,2) NOT NULL,
    balance_after DECIMAL(14,2),
    description TEXT,
    reference_type TEXT,
    reference_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- WAREHOUSE LOCATIONS
CREATE TABLE IF NOT EXISTS public.warehouse_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    name TEXT NOT NULL,
    location_code TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT,
    postal_code TEXT,
    contact_name TEXT,
    contact_phone TEXT,
    operating_hours JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- WARRANTY CLAIMS
CREATE TABLE IF NOT EXISTS public.warranty_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    equipment_id UUID REFERENCES public.equipment(id) ON DELETE CASCADE,
    claim_number TEXT,
    claim_date DATE NOT NULL,
    issue_description TEXT NOT NULL,
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'submitted',
    resolution TEXT,
    resolved_date DATE,
    cost_recovered DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- WEATHER FORECASTS
CREATE TABLE IF NOT EXISTS public.weather_forecasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    venue_id UUID REFERENCES public.venues(id) ON DELETE SET NULL,
    forecast_date DATE NOT NULL,
    forecast_time TIME,
    temperature_high DECIMAL(5,2),
    temperature_low DECIMAL(5,2),
    precipitation_chance DECIMAL(5,2),
    precipitation_type TEXT,
    wind_speed DECIMAL(6,2),
    wind_direction TEXT,
    humidity DECIMAL(5,2),
    conditions TEXT,
    alerts JSONB DEFAULT '[]'::jsonb,
    source TEXT,
    fetched_at TIMESTAMPTZ DEFAULT NOW()
);

-- WEBHOOK DELIVERIES
CREATE TABLE IF NOT EXISTS public.webhook_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    webhook_id UUID NOT NULL,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    response_status INTEGER,
    response_body TEXT,
    delivered_at TIMESTAMPTZ,
    attempts INTEGER DEFAULT 1,
    next_retry_at TIMESTAMPTZ,
    status TEXT DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- WEBHOOK_EVENTS
CREATE TABLE IF NOT EXISTS public.webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    source TEXT,
    processed BOOLEAN DEFAULT false,
    processed_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- WEBHOOKS
CREATE TABLE IF NOT EXISTS public.webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    secret TEXT,
    events TEXT[] NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_triggered_at TIMESTAMPTZ,
    failure_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- WRISTBAND_ACTIVATIONS
CREATE TABLE IF NOT EXISTS public.wristband_activations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    wristband_id TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ticket_id UUID REFERENCES public.tickets(id) ON DELETE SET NULL,
    activated_at TIMESTAMPTZ DEFAULT NOW(),
    deactivated_at TIMESTAMPTZ,
    status TEXT DEFAULT 'active',
    metadata JSONB DEFAULT '{}'::jsonb
);

-- WRISTBAND_SCANS
CREATE TABLE IF NOT EXISTS public.wristband_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wristband_id TEXT NOT NULL,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    scan_type TEXT NOT NULL,
    location TEXT,
    reader_id TEXT,
    scanned_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- ZONES
CREATE TABLE IF NOT EXISTS public.zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    zone_name TEXT NOT NULL,
    zone_type TEXT NOT NULL,
    capacity INTEGER,
    current_count INTEGER DEFAULT 0,
    access_level TEXT DEFAULT 'general',
    description TEXT,
    boundaries JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_vendor_activity_log_vendor ON public.vendor_activity_log(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_applications_org ON public.vendor_applications(organization_id);
CREATE INDEX IF NOT EXISTS idx_vendor_certifications_vendor ON public.vendor_certifications(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_contacts_vendor ON public.vendor_contacts(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_documents_vendor ON public.vendor_documents(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_insurance_vendor ON public.vendor_insurance(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_invoices_vendor ON public.vendor_invoices(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_payments_vendor ON public.vendor_payments(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_ratings_vendor ON public.vendor_ratings(vendor_id);
CREATE INDEX IF NOT EXISTS idx_venue_amenities_venue ON public.venue_amenities(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_availability_venue ON public.venue_availability(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_bookings_venue ON public.venue_bookings(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_contacts_venue ON public.venue_contacts(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_rooms_venue ON public.venue_rooms(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_spaces_venue ON public.venue_spaces(venue_id);
CREATE INDEX IF NOT EXISTS idx_vip_guests_event ON public.vip_guests(event_id);
CREATE INDEX IF NOT EXISTS idx_vip_packages_event ON public.vip_packages(event_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_applications_event ON public.volunteer_applications(event_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_hours_event ON public.volunteer_hours(event_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_shifts_event ON public.volunteer_shifts(event_id);
CREATE INDEX IF NOT EXISTS idx_volunteers_user ON public.volunteers(user_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_entries_entity ON public.waitlist_entries(entity_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet ON public.wallet_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_webhook ON public.webhook_deliveries(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_org ON public.webhooks(organization_id);
CREATE INDEX IF NOT EXISTS idx_wristband_activations_event ON public.wristband_activations(event_id);
CREATE INDEX IF NOT EXISTS idx_zones_venue ON public.zones(venue_id);

-- Enable RLS
ALTER TABLE public.vendor_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_compliance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_insurance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_blackout_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_floor_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_holds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_restrictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_technical_specs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vip_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vip_guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vip_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.virtual_queues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouse_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warranty_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wristband_activations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wristband_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;
