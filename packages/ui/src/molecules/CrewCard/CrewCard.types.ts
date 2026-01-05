/**
 * CrewCard status types
 */
export type CrewCardStatus = 
  | "available"
  | "assigned"
  | "unavailable"
  | "on-call";

/**
 * CrewCard variant types
 */
export type CrewCardVariant = 
  | "default"
  | "compact"
  | "detailed";

/**
 * CrewCard component props
 */
export interface CrewCardProps {
  /** Crew member ID */
  id: string;
  
  /** Full name */
  name: string;
  
  /** Primary role/position */
  role: string;
  
  /** Department */
  department?: string;
  
  /** Profile image URL */
  imageUrl?: string;
  
  /** Contact email */
  email?: string;
  
  /** Contact phone */
  phone?: string;
  
  /** Skills/certifications */
  skills?: string[];
  
  /** Availability status */
  status?: CrewCardStatus;
  
  /** Current project/event assignment */
  currentAssignment?: string;
  
  /** Rating (1-5) */
  rating?: number;
  
  /** Card variant */
  variant?: CrewCardVariant;
  
  /** Click handler */
  onClick?: () => void;
  
  /** Inverted theme (dark background) */
  inverted?: boolean;
  
  /** Custom className */
  className?: string;
}
