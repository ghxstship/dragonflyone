-- Migration: Fix existing tables by adding missing columns
-- This migration adds missing columns to tables that already exist but have different schemas

-- Add event_id to sponsor_activations if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'sponsor_activations' 
        AND column_name = 'event_id'
    ) THEN
        ALTER TABLE public.sponsor_activations 
        ADD COLUMN event_id UUID REFERENCES public.events(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add missing columns to social_connections if needed
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'social_connections' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.social_connections 
        ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add missing columns to social_posts if needed
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'social_posts' 
        AND column_name = 'organization_id'
    ) THEN
        ALTER TABLE public.social_posts 
        ADD COLUMN organization_id UUID NOT NULL DEFAULT gen_random_uuid();
    END IF;
END $$;

-- Add missing columns to sponsor_deliverables if needed
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'sponsor_deliverables' 
        AND column_name = 'sponsorship_id'
    ) THEN
        ALTER TABLE public.sponsor_deliverables 
        ADD COLUMN sponsorship_id UUID NOT NULL DEFAULT gen_random_uuid();
    END IF;
END $$;

-- Add missing columns to sponsor_tiers if needed
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'sponsor_tiers' 
        AND column_name = 'organization_id'
    ) THEN
        ALTER TABLE public.sponsor_tiers 
        ADD COLUMN organization_id UUID NOT NULL DEFAULT gen_random_uuid();
    END IF;
END $$;

-- Now create indexes that may have failed before (only if columns exist)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'sponsor_activations' 
        AND column_name = 'event_id'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_sponsor_activations_event ON public.sponsor_activations(event_id);
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'social_connections' 
        AND column_name = 'user_id'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_social_connections_user ON public.social_connections(user_id);
    END IF;
END $$;
