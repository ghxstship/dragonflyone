/**
 * COMPVSS Demo Data
 * 
 * Centralized demo/mock data for COMPVSS application pages.
 * All inline mock data should be migrated here for consistency.
 */

// =============================================================================
// CREW MEMBERS (for crew/page.tsx)
// =============================================================================

export interface DemoCrewMember {
  id: string;
  name: string;
  role: string;
  department: string;
  availability: string;
  rate: number;
  rating: number;
  projectsCompleted: number;
  location: string;
  phone: string;
  email: string;
  specialties?: string[];
  certifications?: string[];
  [key: string]: unknown;
}

export const DEMO_CREW_MEMBERS: DemoCrewMember[] = [
  {
    id: 'CRW-001',
    name: 'Sarah Martinez',
    role: 'Production Manager',
    department: 'Production',
    specialties: ['Event Coordination', 'Budget Management', 'Team Leadership'],
    certifications: ['OSHA 30', 'First Aid/CPR'],
    availability: 'Available',
    rate: 850,
    rating: 4.9,
    projectsCompleted: 47,
    location: 'Miami, FL',
    phone: '(305) 555-0123',
    email: 'sarah.m@crew.ghxstship.com',
  },
  {
    id: 'CRW-002',
    name: 'Michael Chen',
    role: 'Technical Director',
    department: 'Technical',
    specialties: ['Audio Engineering', 'System Integration', 'Rigging'],
    certifications: ['ETCP Rigging', 'OSHA 30', 'CTS-D'],
    availability: 'Booked',
    rate: 950,
    rating: 4.8,
    projectsCompleted: 52,
    location: 'Tampa, FL',
    phone: '(813) 555-0234',
    email: 'michael.c@crew.ghxstship.com',
  },
  {
    id: 'CRW-003',
    name: 'Jessica Williams',
    role: 'Stage Manager',
    department: 'Production',
    specialties: ['Stage Management', 'Artist Relations', 'Scheduling'],
    certifications: ['OSHA 10', 'First Aid/CPR'],
    availability: 'Available',
    rate: 750,
    rating: 4.7,
    projectsCompleted: 38,
    location: 'Orlando, FL',
    phone: '(407) 555-0345',
    email: 'jessica.w@crew.ghxstship.com',
  },
  {
    id: 'CRW-004',
    name: 'David Thompson',
    role: 'Lighting Designer',
    department: 'Technical',
    specialties: ['Lighting Design', 'Programming', 'Visualization'],
    certifications: ['ETCP Entertainment Electrician', 'OSHA 30'],
    availability: 'Available',
    rate: 800,
    rating: 4.9,
    projectsCompleted: 45,
    location: 'Jacksonville, FL',
    phone: '(904) 555-0456',
    email: 'david.t@crew.ghxstship.com',
  },
  {
    id: 'CRW-005',
    name: 'Amanda Rodriguez',
    role: 'Audio Engineer',
    department: 'Technical',
    specialties: ['FOH Mixing', 'Monitor Engineering', 'RF Coordination'],
    certifications: ['Dante Level 3', 'OSHA 10'],
    availability: 'Booked',
    rate: 850,
    rating: 4.8,
    projectsCompleted: 41,
    location: 'Fort Lauderdale, FL',
    phone: '(954) 555-0567',
    email: 'amanda.r@crew.ghxstship.com',
  },
];
