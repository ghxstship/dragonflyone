// =============================================================================
// EXPERIENCE GENERATOR TYPES
// Type definitions for the AI-powered experience blueprint generator
// =============================================================================

export interface SenseActivation {
  primary: string;
  secondary: string[];
  technicalRequirements: string[];
  accessibility: string;
}

export interface Zone {
  name: string;
  code: string;
  type: "public" | "vip" | "backstage" | "production" | "operations" | "restricted";
  description: string;
  capacity: number;
  accessLevel: number;
}

export interface JourneyPhase {
  name: string;
  touchpoints: string[];
  emotionalState: string;
  actions: string[];
  technology: string[];
}

export interface BudgetTier {
  name: string;
  budget: string;
  description: string;
  includes: string[];
  excludes: string[];
}

export interface OrgNode {
  title: string;
  tier: number;
  department: string;
  reportsTo?: string;
}

export interface SchedulePhase {
  name: string;
  code: string;
  duration: string;
  description: string;
}

export interface CredentialType {
  name: string;
  code: string;
  accessLevel: number;
  color: string;
}

export interface ChecklistItem {
  category: string;
  item: string;
  required: boolean;
}

export interface GeneratedBlueprint {
  id: string;
  creativeSeed: string;
  generatedAt: string;
  
  // Creative Concept
  concept: {
    name: string;
    tagline: string;
    narrative: string;
    targetTransformation: string;
    visualIdentity: {
      colorPalette: string[];
      typography: string;
      moodKeywords: string[];
    };
  };
  
  // 5 Senses
  sensoryDesign: {
    sight: SenseActivation;
    sound: SenseActivation;
    touch: SenseActivation;
    taste: SenseActivation;
    smell: SenseActivation;
  };
  
  // XYZ Foundation
  spatialTemporal: {
    x: { level: number; description: string; rationale: string };
    y: { level: number; description: string; rationale: string };
    z: { level: number; description: string; rationale: string };
    zones: Zone[];
  };
  
  // URL→IRL Journey
  guestJourney: {
    phase1_digital_pre: JourneyPhase;
    phase2_threshold_in: JourneyPhase;
    phase3_physical: JourneyPhase;
    phase4_threshold_out: JourneyPhase;
    phase5_digital_post: JourneyPhase;
  };
  
  // Production Docs (Previews)
  documents: {
    onePageOverview: string;
    orgChartPreview: OrgNode[];
    schedulePhases: SchedulePhase[];
    credentialTypes: CredentialType[];
    complianceChecklist: ChecklistItem[];
  };
  
  // Scalable Tiers
  executionTiers: {
    tier1_minimal: BudgetTier;
    tier2_enhanced: BudgetTier;
    tier3_premium: BudgetTier;
    tier4_ultimate: BudgetTier;
  };
}

export interface GenerationProgress {
  step: number;
  totalSteps: number;
  currentStep: string;
  completedSteps: string[];
  percentage: number;
}

export interface GeneratorState {
  creativeSeed: string;
  isGenerating: boolean;
  progress: GenerationProgress | null;
  blueprint: GeneratedBlueprint | null;
  error: string | null;
}

// =============================================================================
// AI CHAT INTERFACE TYPES
// Types for the conversational AI experience
// =============================================================================

export type MessageRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  metadata?: {
    blueprintSection?: string;
    isStreaming?: boolean;
    attachments?: ChatAttachment[];
  };
}

export interface ChatAttachment {
  type: "blueprint" | "image" | "document";
  data: unknown;
  preview?: string;
}

export interface ConversationState {
  messages: ChatMessage[];
  isTyping: boolean;
  currentBlueprint: GeneratedBlueprint | null;
}
