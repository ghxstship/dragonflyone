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

// =============================================================================
// BEST PRACTICES (for best-practices/page.tsx)
// =============================================================================

export interface DemoBestPractice {
  id: string;
  title: string;
  category: string;
  discipline: string;
  summary: string;
  author: string;
  views: number;
  rating: number;
  tags: string[];
  [key: string]: unknown;
}

export const DEMO_BEST_PRACTICES: DemoBestPractice[] = [
  { id: 'BP-001', title: 'Line Array Rigging Safety', category: 'Safety', discipline: 'Audio', summary: 'Essential safety protocols for flying line array systems.', author: 'Safety Team', views: 1245, rating: 4.9, tags: ['rigging', 'audio'] },
  { id: 'BP-002', title: 'LED Wall Calibration', category: 'Technical', discipline: 'Video', summary: 'Guide for calibrating LED video walls for optimal color accuracy.', author: 'Video Dept', views: 892, rating: 4.7, tags: ['video', 'calibration'] },
  { id: 'BP-003', title: 'Festival Stage Changeover', category: 'Operations', discipline: 'Stage', summary: 'Efficient changeover procedures for multi-act festival stages.', author: 'Stage Mgmt', views: 2156, rating: 4.8, tags: ['festival', 'changeover'] },
  { id: 'BP-004', title: 'Power Distribution Planning', category: 'Technical', discipline: 'Power', summary: 'Best practices for calculating power requirements.', author: 'Electrical', views: 1567, rating: 4.6, tags: ['power', 'planning'] },
  { id: 'BP-005', title: 'Crew Communication', category: 'Operations', discipline: 'General', summary: 'Effective radio and intercom communication protocols.', author: 'Ops Team', views: 1890, rating: 4.8, tags: ['communication', 'radio'] },
];

// =============================================================================
// BID OPPORTUNITIES (for bid-portal/page.tsx)
// =============================================================================

export interface DemoBidOpportunity {
  id: string;
  title: string;
  client: string;
  type: 'RFP' | 'RFQ' | 'Invitation';
  category: string;
  dueDate: string;
  budget?: string;
  status: 'Open' | 'Submitted' | 'Under Review' | 'Won' | 'Lost';
  description: string;
  requirements: string[];
  attachments: number;
  bidAmount?: number;
  [key: string]: unknown;
}

export const DEMO_BID_OPPORTUNITIES: DemoBidOpportunity[] = [
  { id: 'BID-001', title: 'Summer Festival 2025 - Full Production', client: 'Festival Productions', type: 'RFP', category: 'Full Service', dueDate: '2024-12-15', budget: '$500K-$750K', status: 'Open', description: 'Full production for 3-day outdoor festival', requirements: ['10+ years experience', 'Festival experience'], attachments: 5 },
  { id: 'BID-002', title: 'Corporate Gala - AV Services', client: 'TechCorp Events', type: 'RFQ', category: 'Audio', dueDate: '2024-12-01', budget: '$75K-$100K', status: 'Submitted', description: 'AV services for 500-person awards ceremony', requirements: ['Corporate experience'], attachments: 3, bidAmount: 85000 },
  { id: 'BID-003', title: 'Theater Production - Lighting', client: 'City Arts Center', type: 'Invitation', category: 'Lighting', dueDate: '2024-11-30', budget: '$25K-$35K', status: 'Under Review', description: 'Lighting design for 6-week theater run', requirements: ['Theater experience'], attachments: 2, bidAmount: 32000 },
  { id: 'BID-004', title: 'Concert Series - Staging', client: 'Live Nation', type: 'RFP', category: 'Staging', dueDate: '2024-11-25', status: 'Won', description: 'Staging for 10-city tour', requirements: ['Tour experience'], attachments: 6, bidAmount: 425000 },
];

// =============================================================================
// BUILD/STRIKE TASKS (for build-strike/page.tsx)
// =============================================================================

export interface DemoBuildStrikeTask {
  id: string;
  task: string;
  area: string;
  assignedTo: string;
  status: 'pending' | 'in-progress' | 'complete';
  priority: 'low' | 'medium' | 'high';
  [key: string]: unknown;
}

export const DEMO_BUILD_STRIKE_TASKS: DemoBuildStrikeTask[] = [
  { id: '1', task: 'Rig main truss', area: 'Stage', assignedTo: 'Rigging Team', status: 'complete', priority: 'high' },
  { id: '2', task: 'Install LED wall', area: 'Upstage', assignedTo: 'Video Team', status: 'in-progress', priority: 'high' },
  { id: '3', task: 'Run power distribution', area: 'FOH', assignedTo: 'Electric', status: 'in-progress', priority: 'high' },
  { id: '4', task: 'Set up console', area: 'FOH', assignedTo: 'Sound Team', status: 'pending', priority: 'medium' },
  { id: '5', task: 'Install monitors', area: 'Stage', assignedTo: 'Sound Team', status: 'pending', priority: 'medium' },
  { id: '6', task: 'Drape stage', area: 'Stage', assignedTo: 'Stage Team', status: 'pending', priority: 'low' },
];

// =============================================================================
// CASE STUDIES (for case-studies/page.tsx)
// =============================================================================

export interface DemoCaseStudy {
  id: string;
  title: string;
  projectName: string;
  type: 'Success' | 'Post-Mortem' | 'Lessons Learned';
  category: string;
  date: string;
  author: string;
  summary: string;
  keyTakeaways: string[];
  metrics?: { label: string; value: string }[];
  [key: string]: unknown;
}

export const DEMO_CASE_STUDIES: DemoCaseStudy[] = [
  { id: 'CS-001', title: 'Festival Stage Collapse Prevention', projectName: 'Summer Fest 2023', type: 'Success', category: 'Safety', date: '2024-02-15', author: 'Safety Team', summary: 'How early weather monitoring and proactive rigging inspection prevented a potential stage collapse during high winds.', keyTakeaways: ['Implement 48-hour weather monitoring', 'Daily rigging inspections during setup', 'Clear evacuation protocols'], metrics: [{ label: 'Wind Speed', value: '45 mph' }, { label: 'Response Time', value: '12 min' }] },
  { id: 'CS-002', title: 'Audio System Failure Analysis', projectName: 'Arena Tour 2023', type: 'Post-Mortem', category: 'Technical', date: '2024-01-20', author: 'Audio Dept', summary: 'Root cause analysis of main PA failure during headliner set and improvements implemented.', keyTakeaways: ['Redundant amplifier racks', 'Pre-show stress testing', 'Backup system hot standby'], metrics: [{ label: 'Downtime', value: '8 min' }, { label: 'Affected', value: '15,000' }] },
  { id: 'CS-003', title: 'Crew Scheduling Optimization', projectName: 'Corporate Gala', type: 'Lessons Learned', category: 'Operations', date: '2024-03-10', author: 'Ops Team', summary: 'How we reduced overtime by 30% through better advance planning and skill-based crew assignment.', keyTakeaways: ['Skill matrix for assignments', 'Buffer time between calls', 'Cross-training program'], metrics: [{ label: 'OT Reduction', value: '30%' }, { label: 'Cost Saved', value: '$45K' }] },
  { id: 'CS-004', title: 'LED Wall Calibration Standards', projectName: 'Multiple Events', type: 'Success', category: 'Video', date: '2024-04-05', author: 'Video Dept', summary: 'Establishing company-wide LED calibration standards that improved client satisfaction scores.', keyTakeaways: ['Standardized color profiles', 'Pre-event calibration checklist', 'Client approval workflow'], metrics: [{ label: 'Satisfaction', value: '+25%' }, { label: 'Callbacks', value: '-60%' }] },
];

// =============================================================================
// CERTIFICATIONS (for certifications/page.tsx)
// =============================================================================

export interface DemoCertification {
  id: string;
  crew_member_id?: string;
  crew_member_name: string;
  certification_type: string;
  issue_date: string;
  expiry_date: string;
  status: 'active' | 'expiring_soon' | 'expired';
  issuing_authority?: string;
  certificate_number?: string;
  [key: string]: unknown;
}

export const DEMO_CERTIFICATIONS: DemoCertification[] = [
  { id: 'CERT-001', crew_member_name: 'James Wilson', certification_type: 'OSHA Safety', issue_date: '2024-01-15', expiry_date: '2027-01-15', status: 'active' },
  { id: 'CERT-002', crew_member_name: 'Maria Garcia', certification_type: 'Rigging Level 3', issue_date: '2023-06-10', expiry_date: '2025-06-10', status: 'active' },
  { id: 'CERT-003', crew_member_name: 'David Chen', certification_type: 'First Aid/CPR', issue_date: '2023-11-20', expiry_date: '2024-11-20', status: 'expiring_soon' },
  { id: 'CERT-004', crew_member_name: 'Sarah Martinez', certification_type: 'Forklift Operator', issue_date: '2022-03-15', expiry_date: '2024-03-15', status: 'expired' },
  { id: 'CERT-005', crew_member_name: 'Michael Brown', certification_type: 'Electrical Safety', issue_date: '2024-09-01', expiry_date: '2027-09-01', status: 'active' },
];
