-- ============================================================================
-- 0001_extensions_and_types.sql
-- PostgreSQL Extensions and Enum Types for 3NF Normalized Schema
-- GHXSTSHIP Platform - Single Source of Truth
-- ============================================================================

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- LEGEND ENUM TYPES (Entities/Nouns)
-- ============================================================================

-- Legend entity type enum
CREATE TYPE legend_entity_type AS ENUM (
  'person',
  'place',
  'organization',
  'product',
  'event',
  'document'
);

-- Legend status enum
CREATE TYPE legend_status AS ENUM (
  'active',
  'inactive',
  'archived',
  'pending',
  'draft'
);

-- ============================================================================
-- SAGA ENUM TYPES (Workflows/Verbs)
-- ============================================================================

-- Saga type enum
CREATE TYPE saga_type AS ENUM (
  'approval',
  'request',
  'submission',
  'process',
  'automation',
  'change'
);

-- Saga state enum
CREATE TYPE saga_state AS ENUM (
  'draft',
  'pending',
  'in_progress',
  'review',
  'approved',
  'rejected',
  'completed',
  'cancelled',
  'failed',
  'expired'
);

-- Saga priority enum
CREATE TYPE saga_priority AS ENUM (
  'low',
  'normal',
  'high',
  'urgent',
  'critical'
);

-- ============================================================================
-- CHRONICLE ENUM TYPES (Activities/Transactions)
-- ============================================================================

-- Chronicle type enum
CREATE TYPE chronicle_type AS ENUM (
  'transaction',
  'timesheet',
  'movement',
  'audit',
  'automation',
  'communication'
);

-- Chronicle action category enum
CREATE TYPE chronicle_action_category AS ENUM (
  'create',
  'read',
  'update',
  'delete',
  'transfer',
  'approve',
  'reject',
  'submit',
  'complete',
  'cancel',
  'execute',
  'send',
  'receive',
  'login',
  'logout',
  'other'
);

-- ============================================================================
-- LEGACY COMPATIBILITY ENUM TYPES
-- ============================================================================

CREATE TYPE employment_type AS ENUM ('full_time', 'part_time', 'contractor', 'freelancer');
CREATE TYPE employee_status AS ENUM ('active', 'on_leave', 'inactive', 'terminated');
