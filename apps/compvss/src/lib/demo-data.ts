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

// =============================================================================
// ARTISTS (for artists/page.tsx)
// =============================================================================

export interface DemoArtist {
  id: string;
  name: string;
  genre: string;
  type: 'Solo' | 'Band' | 'DJ' | 'Orchestra' | 'Speaker';
  manager?: string;
  managerEmail?: string;
  managerPhone?: string;
  agent?: string;
  technicalRider: boolean;
  hospitalityRider: boolean;
  inputList: boolean;
  stageplot: boolean;
  lastPerformance?: string;
  upcomingShows: number;
  notes?: string;
  [key: string]: unknown;
}

export const DEMO_ARTISTS: DemoArtist[] = [
  { id: 'ART-001', name: 'The Midnight Collective', genre: 'Indie Rock', type: 'Band', manager: 'Sarah Mitchell', managerEmail: 'sarah@mgmt.com', managerPhone: '+1 555-0201', agent: 'CAA', technicalRider: true, hospitalityRider: true, inputList: true, stageplot: true, lastPerformance: '2024-10-15', upcomingShows: 3 },
  { id: 'ART-002', name: 'DJ Phantom', genre: 'Electronic', type: 'DJ', manager: 'Mike Torres', managerEmail: 'mike@djmgmt.com', managerPhone: '+1 555-0202', technicalRider: true, hospitalityRider: false, inputList: true, stageplot: false, lastPerformance: '2024-11-10', upcomingShows: 5 },
  { id: 'ART-003', name: 'Aurora Keys', genre: 'Pop', type: 'Solo', manager: 'Jennifer Lee', managerEmail: 'jen@starpower.com', managerPhone: '+1 555-0203', agent: 'WME', technicalRider: true, hospitalityRider: true, inputList: true, stageplot: true, upcomingShows: 2 },
  { id: 'ART-004', name: 'Tampa Symphony', genre: 'Classical', type: 'Orchestra', manager: 'Robert Chen', managerEmail: 'rchen@symphony.org', managerPhone: '+1 555-0204', technicalRider: true, hospitalityRider: true, inputList: true, stageplot: true, lastPerformance: '2024-09-20', upcomingShows: 1 },
  { id: 'ART-005', name: 'Dr. James Wilson', genre: 'Keynote', type: 'Speaker', manager: 'Lisa Park', managerEmail: 'lisa@speakers.com', managerPhone: '+1 555-0205', technicalRider: true, hospitalityRider: false, inputList: false, stageplot: false, upcomingShows: 0 },
];

// =============================================================================
// AVAILABILITY CREW MEMBERS (for availability/page.tsx)
// =============================================================================

export interface DemoAvailabilityCrewMember {
  id: string;
  name: string;
  role: string;
  department: string;
}

export const DEMO_AVAILABILITY_CREW_MEMBERS: DemoAvailabilityCrewMember[] = [
  { id: 'CREW-001', name: 'John Martinez', role: 'Audio Engineer', department: 'Audio' },
  { id: 'CREW-002', name: 'Sarah Chen', role: 'Lighting Designer', department: 'Lighting' },
  { id: 'CREW-003', name: 'Mike Thompson', role: 'Stage Manager', department: 'Stage' },
  { id: 'CREW-004', name: 'Lisa Park', role: 'Video Director', department: 'Video' },
  { id: 'CREW-005', name: 'Tom Wilson', role: 'Head Rigger', department: 'Rigging' },
];

export interface DemoAvailabilitySlot {
  id: string;
  user_id: string;
  user_name: string;
  role: string;
  department: string;
  date: string;
  status: 'available' | 'unavailable' | 'tentative' | 'booked';
  start_time?: string;
  end_time?: string;
  notes?: string;
  calendar_source?: 'manual' | 'google' | 'outlook' | 'ical';
  [key: string]: unknown;
}

export const generateDemoAvailability = (): DemoAvailabilitySlot[] => {
  const slots: DemoAvailabilitySlot[] = [];
  const statuses: DemoAvailabilitySlot['status'][] = ['available', 'unavailable', 'tentative', 'booked'];
  
  DEMO_AVAILABILITY_CREW_MEMBERS.forEach(member => {
    for (let i = 0; i < 14; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      slots.push({
        id: `SLOT-${member.id}-${dateStr}`,
        user_id: member.id,
        user_name: member.name,
        role: member.role,
        department: member.department,
        date: dateStr,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        calendar_source: Math.random() > 0.5 ? 'google' : 'manual',
      });
    }
  });
  
  return slots;
};

// =============================================================================
// BACKGROUND CHECKS (for background-checks/page.tsx)
// =============================================================================

export interface DemoBackgroundCheck {
  id: string;
  crewMemberId: string;
  crewMemberName: string;
  department: string;
  checkType: 'Standard' | 'Enhanced' | 'Federal';
  status: 'Pending' | 'In Progress' | 'Cleared' | 'Flagged' | 'Expired';
  submittedDate: string;
  completedDate?: string;
  expirationDate?: string;
  provider: string;
  daysUntilExpiry?: number;
  [key: string]: unknown;
}

export const DEMO_BACKGROUND_CHECKS: DemoBackgroundCheck[] = [
  { id: 'BGC-001', crewMemberId: 'CRW-101', crewMemberName: 'John Smith', department: 'Audio', checkType: 'Enhanced', status: 'Cleared', submittedDate: '2024-01-15', completedDate: '2024-01-22', expirationDate: '2025-01-22', provider: 'Sterling', daysUntilExpiry: 58 },
  { id: 'BGC-002', crewMemberId: 'CRW-102', crewMemberName: 'Sarah Johnson', department: 'Lighting', checkType: 'Standard', status: 'Cleared', submittedDate: '2024-03-10', completedDate: '2024-03-15', expirationDate: '2025-03-15', provider: 'Checkr', daysUntilExpiry: 110 },
  { id: 'BGC-003', crewMemberId: 'CRW-103', crewMemberName: 'Mike Davis', department: 'Stage', checkType: 'Enhanced', status: 'Expired', submittedDate: '2023-06-01', completedDate: '2023-06-08', expirationDate: '2024-06-08', provider: 'Sterling', daysUntilExpiry: -170 },
  { id: 'BGC-004', crewMemberId: 'CRW-104', crewMemberName: 'Emily Chen', department: 'Video', checkType: 'Standard', status: 'In Progress', submittedDate: '2024-11-20', provider: 'Checkr' },
  { id: 'BGC-005', crewMemberId: 'CRW-105', crewMemberName: 'Alex Rodriguez', department: 'Rigging', checkType: 'Federal', status: 'Pending', submittedDate: '2024-11-24', provider: 'Sterling' },
  { id: 'BGC-006', crewMemberId: 'CRW-106', crewMemberName: 'Lisa Park', department: 'Audio', checkType: 'Enhanced', status: 'Cleared', submittedDate: '2024-08-01', completedDate: '2024-08-10', expirationDate: '2024-12-10', provider: 'Checkr', daysUntilExpiry: 15 },
];

// =============================================================================
// BACKUP PLANS (for backup-plans/page.tsx)
// =============================================================================

export interface DemoBackupPlan {
  id: string;
  name: string;
  project: string;
  category: 'Weather' | 'Technical' | 'Staffing' | 'Vendor' | 'Venue' | 'Safety';
  triggerCondition: string;
  status: 'Active' | 'Draft' | 'Archived';
  lastUpdated: string;
  owner: string;
  steps: string[];
  [key: string]: unknown;
}

export const DEMO_BACKUP_PLANS: DemoBackupPlan[] = [
  { id: 'BP-001', name: 'Rain Delay Protocol', project: 'Summer Fest 2024', category: 'Weather', triggerCondition: 'Rainfall > 0.5in/hr or lightning within 10mi', status: 'Active', lastUpdated: '2024-11-20', owner: 'Production Manager', steps: ['Pause outdoor activities', 'Move guests to covered areas', 'Notify all departments via radio', 'Monitor weather radar', 'Resume when conditions clear'] },
  { id: 'BP-002', name: 'Main PA Failure', project: 'Summer Fest 2024', category: 'Technical', triggerCondition: 'Loss of main PA system', status: 'Active', lastUpdated: '2024-11-18', owner: 'Audio Lead', steps: ['Switch to backup system', 'Notify FOH engineer', 'Diagnose primary system', 'Inform production manager', 'Document incident'] },
  { id: 'BP-003', name: 'Key Crew No-Show', project: 'Summer Fest 2024', category: 'Staffing', triggerCondition: 'Department head unavailable', status: 'Active', lastUpdated: '2024-11-15', owner: 'Operations', steps: ['Contact backup personnel', 'Reassign duties if needed', 'Brief replacement on responsibilities', 'Update crew manifest', 'Document for post-event'] },
  { id: 'BP-004', name: 'Vendor Equipment Delay', project: 'Corporate Gala', category: 'Vendor', triggerCondition: 'Equipment delivery delayed > 2 hours', status: 'Draft', lastUpdated: '2024-11-22', owner: 'Logistics', steps: ['Contact vendor for ETA', 'Identify alternative sources', 'Adjust load-in schedule', 'Notify affected departments', 'Escalate if unresolved'] },
];
