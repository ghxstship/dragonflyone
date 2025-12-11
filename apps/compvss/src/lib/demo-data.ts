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

// =============================================================================
// COMMUNICATION CHANNELS (for communications/channels/page.tsx)
// =============================================================================

export interface DemoChannel {
  id: string;
  name: string;
  department: string;
  type: 'Radio' | 'Intercom' | 'Chat' | 'All';
  members: number;
  frequency?: string;
  status: 'Active' | 'Inactive';
  description: string;
  [key: string]: unknown;
}

export const DEMO_CHANNELS: DemoChannel[] = [
  { id: 'CH-001', name: 'Production', department: 'Production', type: 'All', members: 45, frequency: 'Ch 1', status: 'Active', description: 'Main production coordination channel' },
  { id: 'CH-002', name: 'Audio', department: 'Audio', type: 'Radio', members: 12, frequency: 'Ch 2', status: 'Active', description: 'Audio department communications' },
  { id: 'CH-003', name: 'Lighting', department: 'Lighting', type: 'Radio', members: 8, frequency: 'Ch 3', status: 'Active', description: 'Lighting department communications' },
  { id: 'CH-004', name: 'Video', department: 'Video', type: 'Radio', members: 6, frequency: 'Ch 4', status: 'Active', description: 'Video department communications' },
  { id: 'CH-005', name: 'Stage Management', department: 'Stage', type: 'Intercom', members: 15, frequency: 'PL 1', status: 'Active', description: 'Stage management and cue calling' },
  { id: 'CH-006', name: 'Rigging', department: 'Rigging', type: 'Radio', members: 10, frequency: 'Ch 5', status: 'Active', description: 'Rigging crew coordination' },
  { id: 'CH-007', name: 'Security', department: 'Security', type: 'Radio', members: 20, frequency: 'Ch 6', status: 'Active', description: 'Security team communications' },
  { id: 'CH-008', name: 'Catering', department: 'Hospitality', type: 'Chat', members: 8, status: 'Active', description: 'Catering and hospitality coordination' },
];

// =============================================================================
// MESSAGING CHANNELS (for channels/page.tsx - different from communications/channels)
// =============================================================================

export interface DemoChannelMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  is_online: boolean;
  [key: string]: unknown;
}

export const DEMO_CHANNEL_MEMBERS: DemoChannelMember[] = [
  { id: 'MEM-001', name: 'John Martinez', role: 'Audio Lead', is_online: true },
  { id: 'MEM-002', name: 'Sarah Chen', role: 'Lighting Director', is_online: true },
  { id: 'MEM-003', name: 'Mike Thompson', role: 'Stage Manager', is_online: false },
  { id: 'MEM-004', name: 'Lisa Park', role: 'Video Tech', is_online: true },
  { id: 'MEM-005', name: 'Tom Wilson', role: 'Rigger', is_online: false },
];

export interface DemoMessagingChannel {
  id: string;
  name: string;
  type: 'department' | 'project' | 'broadcast' | 'private';
  department?: string;
  description?: string;
  members: DemoChannelMember[];
  is_active: boolean;
  created_at: string;
  last_message?: string;
  unread_count: number;
  [key: string]: unknown;
}

export const DEMO_MESSAGING_CHANNELS: DemoMessagingChannel[] = [
  { id: 'CH-001', name: 'Audio Department', type: 'department', department: 'Audio', description: 'All audio team communications', members: DEMO_CHANNEL_MEMBERS.slice(0, 2), is_active: true, created_at: '2024-11-01', last_message: 'FOH mix ready for soundcheck', unread_count: 3 },
  { id: 'CH-002', name: 'Lighting Department', type: 'department', department: 'Lighting', description: 'Lighting crew channel', members: DEMO_CHANNEL_MEMBERS.slice(1, 3), is_active: true, created_at: '2024-11-01', last_message: 'Focus complete on stage left', unread_count: 0 },
  { id: 'CH-003', name: 'Video Department', type: 'department', department: 'Video', description: 'Video and LED wall team', members: DEMO_CHANNEL_MEMBERS.slice(3, 5), is_active: true, created_at: '2024-11-01', last_message: 'Content loaded and tested', unread_count: 1 },
  { id: 'CH-004', name: 'Stage Management', type: 'department', department: 'Stage', description: 'Stage managers and crew chiefs', members: DEMO_CHANNEL_MEMBERS.slice(2, 4), is_active: true, created_at: '2024-11-01', last_message: 'Artist ETA 30 minutes', unread_count: 5 },
  { id: 'CH-005', name: 'All Hands', type: 'broadcast', description: 'Broadcast channel for all crew', members: DEMO_CHANNEL_MEMBERS, is_active: true, created_at: '2024-11-01', last_message: 'Doors in 2 hours', unread_count: 0 },
  { id: 'CH-006', name: 'Production Office', type: 'private', description: 'Production management only', members: DEMO_CHANNEL_MEMBERS.slice(0, 3), is_active: true, created_at: '2024-11-01', last_message: 'Budget update attached', unread_count: 2 },
];

export interface DemoMessage {
  id: string;
  channel_id: string;
  sender: DemoChannelMember;
  content: string;
  timestamp: string;
  is_priority: boolean;
  [key: string]: unknown;
}

export const DEMO_MESSAGES: DemoMessage[] = [
  { id: 'MSG-001', channel_id: 'CH-001', sender: DEMO_CHANNEL_MEMBERS[0], content: 'FOH mix ready for soundcheck', timestamp: '2024-11-24T14:30:00Z', is_priority: false },
  { id: 'MSG-002', channel_id: 'CH-001', sender: DEMO_CHANNEL_MEMBERS[1], content: 'Copy that, lighting ready when you are', timestamp: '2024-11-24T14:32:00Z', is_priority: false },
  { id: 'MSG-003', channel_id: 'CH-001', sender: DEMO_CHANNEL_MEMBERS[0], content: 'Starting soundcheck in 5', timestamp: '2024-11-24T14:35:00Z', is_priority: true },
];

// =============================================================================
// DELIVERIES (for deliveries/page.tsx)
// =============================================================================

export interface DemoDeliveryItem {
  name: string;
  quantity: number;
  received?: number;
}

export interface DemoDelivery {
  id: string;
  vendor: string;
  description: string;
  trackingNumber?: string;
  carrier?: string;
  status: 'Scheduled' | 'In Transit' | 'Arrived' | 'Received' | 'Delayed';
  scheduledDate: string;
  scheduledTime: string;
  actualArrival?: string;
  receivedBy?: string;
  accessPoint: string;
  projectId: string;
  items: DemoDeliveryItem[];
  notes?: string;
  [key: string]: unknown;
}

export const DEMO_DELIVERIES: DemoDelivery[] = [
  { id: 'DEL-001', vendor: 'PRG Lighting', description: 'Lighting fixtures and cables', trackingNumber: '1Z999AA10123456784', carrier: 'UPS Freight', status: 'In Transit', scheduledDate: '2024-11-24', scheduledTime: '10:00', accessPoint: 'Loading Dock 1', projectId: 'PROJ-089', items: [{ name: 'Robe MegaPointe', quantity: 24 }, { name: 'DMX Cable 50ft', quantity: 48 }] },
  { id: 'DEL-002', vendor: 'Meyer Sound', description: 'Line array system', status: 'Scheduled', scheduledDate: '2024-11-24', scheduledTime: '14:00', accessPoint: 'Loading Dock 2', projectId: 'PROJ-089', items: [{ name: 'LEO-M Line Array', quantity: 12 }, { name: '1100-LFC Subwoofer', quantity: 8 }] },
  { id: 'DEL-003', vendor: 'Stageline', description: 'Staging deck modules', trackingNumber: 'PRO123456', carrier: 'Company Truck', status: 'Arrived', scheduledDate: '2024-11-24', scheduledTime: '08:00', actualArrival: '08:15', accessPoint: 'Main Gate A', projectId: 'PROJ-089', items: [{ name: '4x8 Deck Module', quantity: 60 }, { name: 'Leg Assembly', quantity: 120 }] },
  { id: 'DEL-004', vendor: 'Audio Systems Inc', description: 'Wireless microphone systems', trackingNumber: 'FX123456789', carrier: 'FedEx', status: 'Received', scheduledDate: '2024-11-23', scheduledTime: '11:00', actualArrival: '10:45', receivedBy: 'John Martinez', accessPoint: 'Loading Dock 1', projectId: 'PROJ-089', items: [{ name: 'Shure ULXD4Q', quantity: 4, received: 4 }, { name: 'ULXD2 Handheld', quantity: 8, received: 8 }] },
  { id: 'DEL-005', vendor: 'Rigging Solutions', description: 'Chain motors and hardware', status: 'Delayed', scheduledDate: '2024-11-24', scheduledTime: '09:00', accessPoint: 'Loading Dock 2', projectId: 'PROJ-089', items: [{ name: 'CM Lodestar 1-Ton', quantity: 20 }], notes: 'Truck breakdown - ETA delayed 2 hours' },
];

// =============================================================================
// DRAWINGS (for drawings/page.tsx)
// =============================================================================

export interface DemoDrawing {
  id: string;
  name: string;
  type: 'CAD' | 'PDF' | 'Vectorworks' | 'AutoCAD' | 'SketchUp';
  category: 'Stage' | 'Lighting' | 'Audio' | 'Video' | 'Rigging' | 'Site';
  project: string;
  version: number;
  uploadedBy: string;
  uploadedAt: string;
  size: string;
  status: 'Current' | 'Superseded' | 'Draft';
  markups: number;
  [key: string]: unknown;
}

export const DEMO_DRAWINGS: DemoDrawing[] = [
  { id: 'DWG-001', name: 'Main Stage Layout', type: 'Vectorworks', category: 'Stage', project: 'Summer Fest 2024', version: 4, uploadedBy: 'John Smith', uploadedAt: '2024-11-24', size: '12.4 MB', status: 'Current', markups: 3 },
  { id: 'DWG-002', name: 'Lighting Plot', type: 'Vectorworks', category: 'Lighting', project: 'Summer Fest 2024', version: 6, uploadedBy: 'Sarah Johnson', uploadedAt: '2024-11-23', size: '8.7 MB', status: 'Current', markups: 5 },
  { id: 'DWG-003', name: 'Audio System Layout', type: 'AutoCAD', category: 'Audio', project: 'Summer Fest 2024', version: 3, uploadedBy: 'Mike Davis', uploadedAt: '2024-11-22', size: '5.2 MB', status: 'Current', markups: 2 },
  { id: 'DWG-004', name: 'Rigging Plot', type: 'CAD', category: 'Rigging', project: 'Summer Fest 2024', version: 2, uploadedBy: 'Emily Chen', uploadedAt: '2024-11-21', size: '6.8 MB', status: 'Current', markups: 1 },
  { id: 'DWG-005', name: 'Site Plan', type: 'PDF', category: 'Site', project: 'Summer Fest 2024', version: 1, uploadedBy: 'John Smith', uploadedAt: '2024-11-20', size: '3.5 MB', status: 'Current', markups: 0 },
];

// =============================================================================
// EMERGENCY CONTACTS & PROCEDURES (for emergency/page.tsx)
// =============================================================================

export interface DemoEmergencyContact {
  id: string;
  name: string;
  role: string;
  phone: string;
  email?: string;
  priority: number;
  category: 'Production' | 'Venue' | 'Medical' | 'Security' | 'Fire' | 'Police' | 'Management';
  available: boolean;
  [key: string]: unknown;
}

export const DEMO_EMERGENCY_CONTACTS: DemoEmergencyContact[] = [
  { id: 'EC-001', name: 'John Martinez', role: 'Production Manager', phone: '+1 555-0101', email: 'john@company.com', priority: 1, category: 'Production', available: true },
  { id: 'EC-002', name: 'Sarah Chen', role: 'Stage Manager', phone: '+1 555-0102', priority: 2, category: 'Production', available: true },
  { id: 'EC-003', name: 'Mike Thompson', role: 'Technical Director', phone: '+1 555-0103', priority: 3, category: 'Production', available: true },
  { id: 'EC-004', name: 'Venue Security', role: 'Security Lead', phone: '+1 555-0200', priority: 1, category: 'Security', available: true },
  { id: 'EC-005', name: 'On-Site Medical', role: 'EMT Team Lead', phone: '+1 555-0300', priority: 1, category: 'Medical', available: true },
  { id: 'EC-006', name: 'Tampa Fire Dept', role: 'Fire Marshal', phone: '911', priority: 1, category: 'Fire', available: true },
  { id: 'EC-007', name: 'Tampa PD', role: 'Event Liaison', phone: '+1 555-0400', priority: 1, category: 'Police', available: true },
  { id: 'EC-008', name: 'Venue Manager', role: 'Facility Contact', phone: '+1 555-0500', priority: 1, category: 'Venue', available: true },
];

export interface DemoEmergencyProcedure {
  id: string;
  type: 'Fire' | 'Medical' | 'Weather' | 'Security' | 'Evacuation' | 'Power Failure' | 'Crowd Control';
  title: string;
  steps: string[];
  contacts: string[];
  lastUpdated: string;
  [key: string]: unknown;
}

export const DEMO_EMERGENCY_PROCEDURES: DemoEmergencyProcedure[] = [
  { id: 'EP-001', type: 'Fire', title: 'Fire Emergency Response', steps: ['Activate fire alarm', 'Call 911 immediately', 'Notify Production Manager', 'Begin evacuation per venue plan', 'Account for all crew members', 'Meet at designated assembly point'], contacts: ['Fire Marshal', 'Production Manager', 'Venue Manager'], lastUpdated: '2024-11-01' },
  { id: 'EP-002', type: 'Medical', title: 'Medical Emergency Response', steps: ['Call for on-site medical team', 'Do not move injured person unless danger', 'Clear area around patient', 'Notify Production Manager', 'Document incident details', 'Follow up with incident report'], contacts: ['EMT Team Lead', 'Production Manager'], lastUpdated: '2024-11-01' },
  { id: 'EP-003', type: 'Weather', title: 'Severe Weather Protocol', steps: ['Monitor weather alerts continuously', 'Notify all department heads at warning', 'Prepare for show hold at watch', 'Evacuate outdoor areas if lightning within 8 miles', 'Resume 30 minutes after last lightning'], contacts: ['Production Manager', 'Venue Manager', 'Security Lead'], lastUpdated: '2024-11-01' },
  { id: 'EP-004', type: 'Evacuation', title: 'Full Venue Evacuation', steps: ['Announce evacuation via PA', 'Stop show immediately', 'House lights to full', 'Open all exit doors', 'Direct crowd to nearest exits', 'Account for all personnel'], contacts: ['Production Manager', 'Security Lead', 'Venue Manager'], lastUpdated: '2024-11-01' },
  { id: 'EP-005', type: 'Power Failure', title: 'Power Failure Response', steps: ['Remain calm - emergency lights will activate', 'Notify Technical Director', 'Check generator status', 'Assess scope of outage', 'Communicate status to all departments', 'Prepare for show hold or cancellation'], contacts: ['Technical Director', 'Venue Manager', 'Production Manager'], lastUpdated: '2024-11-01' },
];

// =============================================================================
// PROJECT FILES (for files/page.tsx)
// =============================================================================

export interface DemoProjectFile {
  id: string;
  name: string;
  type: 'PDF' | 'CAD' | 'Image' | 'Document' | 'Spreadsheet';
  size: string;
  project: string;
  uploadedBy: string;
  uploadedAt: string;
  version: number;
  status: 'Current' | 'Archived';
  [key: string]: unknown;
}

export const DEMO_PROJECT_FILES: DemoProjectFile[] = [
  { id: 'FILE-001', name: 'Stage_Layout_v3.dwg', type: 'CAD', size: '4.2 MB', project: 'Summer Fest 2024', uploadedBy: 'John Smith', uploadedAt: '2024-11-24', version: 3, status: 'Current' },
  { id: 'FILE-002', name: 'Audio_Plot.pdf', type: 'PDF', size: '1.8 MB', project: 'Summer Fest 2024', uploadedBy: 'Sarah Johnson', uploadedAt: '2024-11-23', version: 2, status: 'Current' },
  { id: 'FILE-003', name: 'Lighting_Design.pdf', type: 'PDF', size: '3.5 MB', project: 'Summer Fest 2024', uploadedBy: 'Mike Davis', uploadedAt: '2024-11-22', version: 4, status: 'Current' },
  { id: 'FILE-004', name: 'Budget_Tracker.xlsx', type: 'Spreadsheet', size: '256 KB', project: 'Corporate Gala', uploadedBy: 'Emily Chen', uploadedAt: '2024-11-24', version: 8, status: 'Current' },
  { id: 'FILE-005', name: 'Site_Photos.zip', type: 'Image', size: '45 MB', project: 'Summer Fest 2024', uploadedBy: 'John Smith', uploadedAt: '2024-11-20', version: 1, status: 'Current' },
];

export interface DemoFileVersion {
  version: number;
  uploadedBy: string;
  uploadedAt: string;
  changes: string;
  [key: string]: unknown;
}

export const DEMO_FILE_VERSIONS: DemoFileVersion[] = [
  { version: 3, uploadedBy: 'John Smith', uploadedAt: '2024-11-24 14:30', changes: 'Updated stage dimensions per client feedback' },
  { version: 2, uploadedBy: 'John Smith', uploadedAt: '2024-11-22 10:15', changes: 'Added rigging points' },
  { version: 1, uploadedBy: 'Sarah Johnson', uploadedAt: '2024-11-20 09:00', changes: 'Initial upload' },
];

// =============================================================================
// RADIO CHANNELS (for communications/page.tsx - radio channels overview)
// =============================================================================

export interface DemoRadioChannel {
  id: string;
  name: string;
  frequency: string;
  type: string;
  users: number;
  status: 'active' | 'standby' | 'inactive';
  priority: 'low' | 'medium' | 'high' | 'critical';
  [key: string]: unknown;
}

export const DEMO_RADIO_CHANNELS: DemoRadioChannel[] = [
  { id: '1', name: 'Main Production', frequency: '462.5625 MHz', type: 'Radio', users: 24, status: 'active', priority: 'high' },
  { id: '2', name: 'Stage Crew', frequency: '462.5875 MHz', type: 'Radio', users: 12, status: 'active', priority: 'medium' },
  { id: '3', name: 'Emergency Services', frequency: '462.6125 MHz', type: 'Radio', users: 8, status: 'standby', priority: 'critical' },
];

export interface DemoRadioMessage {
  id: string;
  channel: string;
  sender: string;
  message: string;
  timestamp: string;
  priority: 'normal' | 'high' | 'urgent';
  [key: string]: unknown;
}

export const DEMO_RADIO_MESSAGES: DemoRadioMessage[] = [
  { id: '1', channel: 'Main Production', sender: 'Production Manager', message: 'Load-in complete, ready for soundcheck', timestamp: '14:32', priority: 'normal' },
  { id: '2', channel: 'Stage Crew', sender: 'Stage Manager', message: 'Need assistance with riser setup stage left', timestamp: '14:35', priority: 'high' },
];

// =============================================================================
// CREW SOCIAL (for crew-social/page.tsx)
// =============================================================================

export interface DemoSocialCrewMember {
  id: string;
  name: string;
  role: string;
  department: string;
  avatar?: string;
  bio?: string;
  skills: string[];
  projects_count: number;
  connections: string[];
  is_online: boolean;
  joined_date: string;
  location?: string;
  phone?: string;
  email?: string;
  [key: string]: unknown;
}

export const DEMO_SOCIAL_CREW_MEMBERS: DemoSocialCrewMember[] = [
  { id: 'CREW-001', name: 'John Martinez', role: 'Audio Engineer', department: 'Audio', bio: 'FOH engineer with 15 years experience in live sound.', skills: ['FOH Mixing', 'System Design', 'RF Coordination'], projects_count: 127, connections: ['CREW-002', 'CREW-003'], is_online: true, joined_date: '2020-03-15', location: 'Los Angeles, CA', email: 'john@crew.com' },
  { id: 'CREW-002', name: 'Sarah Chen', role: 'Lighting Designer', department: 'Lighting', bio: 'Award-winning LD specializing in concert touring.', skills: ['grandMA', 'Vectorworks', 'Previz'], projects_count: 89, connections: ['CREW-001', 'CREW-004'], is_online: true, joined_date: '2019-08-22', location: 'Nashville, TN', email: 'sarah@crew.com' },
  { id: 'CREW-003', name: 'Mike Thompson', role: 'Stage Manager', department: 'Stage', bio: 'Production stage manager for festivals and arena tours.', skills: ['Cue Calling', 'Crew Management', 'Logistics'], projects_count: 156, connections: ['CREW-001', 'CREW-005'], is_online: false, joined_date: '2018-01-10', location: 'Austin, TX', email: 'mike@crew.com' },
  { id: 'CREW-004', name: 'Lisa Park', role: 'Video Director', department: 'Video', bio: 'Live video director and IMAG specialist.', skills: ['Switching', 'Camera Direction', 'LED Content'], projects_count: 72, connections: ['CREW-002'], is_online: true, joined_date: '2021-05-03', location: 'New York, NY', email: 'lisa@crew.com' },
  { id: 'CREW-005', name: 'Tom Wilson', role: 'Head Rigger', department: 'Rigging', bio: 'Certified rigger with arena and outdoor experience.', skills: ['Chain Motors', 'Truss Systems', 'Load Calculations'], projects_count: 203, connections: ['CREW-003'], is_online: false, joined_date: '2017-11-28', location: 'Chicago, IL', email: 'tom@crew.com' },
];

export interface DemoCrewPhoto {
  id: string;
  url: string;
  caption?: string;
  uploaded_by: string;
  project_name?: string;
  uploaded_at: string;
  likes: number;
  liked_by: string[];
  [key: string]: unknown;
}

export const DEMO_CREW_PHOTOS: DemoCrewPhoto[] = [
  { id: 'PHOTO-001', url: '/photos/crew-1.jpg', caption: 'FOH setup at Madison Square Garden', uploaded_by: 'John Martinez', project_name: 'Arena Tour 2024', uploaded_at: '2024-11-20', likes: 24, liked_by: ['CREW-002', 'CREW-003'] },
  { id: 'PHOTO-002', url: '/photos/crew-2.jpg', caption: 'Lighting rig ready for showtime', uploaded_by: 'Sarah Chen', project_name: 'Festival Main Stage', uploaded_at: '2024-11-18', likes: 31, liked_by: ['CREW-001', 'CREW-004', 'CREW-005'] },
  { id: 'PHOTO-003', url: '/photos/crew-3.jpg', caption: 'Crew dinner after load-in', uploaded_by: 'Mike Thompson', project_name: 'Corporate Event', uploaded_at: '2024-11-15', likes: 18, liked_by: ['CREW-001', 'CREW-002'] },
];

// =============================================================================
// CREW SOCIAL FEED (for crew/social/page.tsx)
// =============================================================================

export interface DemoCrewSocialMember {
  id: string;
  name: string;
  role: string;
  department: string;
  avatar: string;
  status: 'Online' | 'Away' | 'Offline';
  connections: number;
  projects: number;
  bio?: string;
  [key: string]: unknown;
}

export const DEMO_CREW_SOCIAL_MEMBERS: DemoCrewSocialMember[] = [
  { id: 'CRW-001', name: 'John Smith', role: 'Audio Engineer', department: 'Audio', avatar: 'JS', status: 'Online', connections: 45, projects: 28, bio: '15 years in live sound. L-Acoustics certified.' },
  { id: 'CRW-002', name: 'Sarah Johnson', role: 'Lighting Designer', department: 'Lighting', avatar: 'SJ', status: 'Online', connections: 62, projects: 35, bio: 'Creating memorable visual experiences since 2010.' },
  { id: 'CRW-003', name: 'Mike Davis', role: 'Stage Manager', department: 'Stage', avatar: 'MD', status: 'Away', connections: 78, projects: 52, bio: 'Keeping shows running smoothly for 20 years.' },
  { id: 'CRW-004', name: 'Emily Chen', role: 'Video Director', department: 'Video', avatar: 'EC', status: 'Offline', connections: 34, projects: 19, bio: 'Broadcast and live event video specialist.' },
];

export interface DemoCrewPost {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  type: 'Photo' | 'Update' | 'Achievement';
  [key: string]: unknown;
}

export const DEMO_CREW_POSTS: DemoCrewPost[] = [
  { id: 'POST-001', authorId: 'CRW-001', authorName: 'John Smith', authorRole: 'Audio Engineer', content: 'Just wrapped an amazing festival run! Great team effort everyone', timestamp: '2 hours ago', likes: 24, comments: 8, type: 'Update' },
  { id: 'POST-002', authorId: 'CRW-002', authorName: 'Sarah Johnson', authorRole: 'Lighting Designer', content: 'New certification achieved! MA3 Programming Level 2', timestamp: '5 hours ago', likes: 45, comments: 12, type: 'Achievement' },
  { id: 'POST-003', authorId: 'CRW-003', authorName: 'Mike Davis', authorRole: 'Stage Manager', content: 'Behind the scenes from last night\'s corporate gala', timestamp: '1 day ago', likes: 67, comments: 15, type: 'Photo' },
];

// =============================================================================
// ARTIST PORTAL (for artist-portal/page.tsx)
// =============================================================================

export interface DemoArtistData {
  artistName: string;
  upcomingShows: number;
  pendingRiders: number;
  confirmedBookings: number;
  [key: string]: unknown;
}

export const DEMO_ARTIST_DATA: DemoArtistData = {
  artistName: 'The Midnight Collective',
  upcomingShows: 3,
  pendingRiders: 1,
  confirmedBookings: 5,
};

export interface DemoUpcomingShow {
  id: string;
  event: string;
  venue: string;
  date: string;
  time: string;
  setLength: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  [key: string]: unknown;
}

export const DEMO_UPCOMING_SHOWS: DemoUpcomingShow[] = [
  { id: '1', event: 'Summer Music Festival', venue: 'Central Park Amphitheater', date: '2024-12-15', time: '20:00', setLength: '90 min', status: 'confirmed' },
  { id: '2', event: 'New Year\'s Eve Gala', venue: 'Grand Ballroom', date: '2024-12-31', time: '23:00', setLength: '60 min', status: 'confirmed' },
  { id: '3', event: 'Winter Concert Series', venue: 'Symphony Hall', date: '2025-01-10', time: '19:30', setLength: '120 min', status: 'pending' },
];

export interface DemoRiderStatus {
  category: string;
  status: 'approved' | 'pending' | 'rejected';
  lastUpdated: string;
  [key: string]: unknown;
}

export const DEMO_RIDER_STATUS: DemoRiderStatus[] = [
  { category: 'Technical Rider', status: 'approved', lastUpdated: '2024-11-01' },
  { category: 'Hospitality Rider', status: 'pending', lastUpdated: '2024-12-01' },
  { category: 'Backline Requirements', status: 'approved', lastUpdated: '2024-10-15' },
];

// =============================================================================
// CREW ASSIGN (for crew/assign/page.tsx)
// =============================================================================

export interface DemoAssignableCrewMember {
  id: string;
  name: string;
  role: string;
  skills: string[];
  available: boolean;
  [key: string]: unknown;
}

export const DEMO_ASSIGNABLE_CREW: DemoAssignableCrewMember[] = [
  { id: '1', name: 'Mike Johnson', role: 'Lighting Tech', skills: ['ETC', 'GrandMA', 'Rigging'], available: true },
  { id: '2', name: 'Sarah Chen', role: 'Sound Engineer', skills: ['DiGiCo', 'Meyer Sound', 'RF'], available: true },
  { id: '3', name: 'David Rodriguez', role: 'Video Director', skills: ['Barco', 'Resolume', 'IMAG'], available: false },
  { id: '4', name: 'Emily Watson', role: 'Stage Manager', skills: ['Production', 'Communication', 'Cueing'], available: true },
  { id: '5', name: 'James Kim', role: 'Rigger', skills: ['Structural', 'Safety', 'Motors'], available: true },
];

// =============================================================================
// CREW BACKGROUND CHECKS (for crew/background-checks/page.tsx)
// =============================================================================

export interface DemoCrewBackgroundCheck {
  id: string;
  employeeName: string;
  employeeId: string;
  department: string;
  checkType: 'Criminal' | 'Employment' | 'Education' | 'Credit' | 'Comprehensive';
  status: 'Pending' | 'In Progress' | 'Completed' | 'Failed' | 'Expired';
  submittedDate: string;
  completedDate?: string;
  expiryDate?: string;
  daysUntilExpiry?: number;
  result?: 'Clear' | 'Review Required' | 'Failed';
  [key: string]: unknown;
}

export const DEMO_CREW_BACKGROUND_CHECKS: DemoCrewBackgroundCheck[] = [
  { id: 'BC-001', employeeName: 'John Smith', employeeId: 'EMP-001', department: 'Audio', checkType: 'Comprehensive', status: 'Completed', submittedDate: '2024-01-15', completedDate: '2024-01-20', expiryDate: '2025-01-20', daysUntilExpiry: 56, result: 'Clear' },
  { id: 'BC-002', employeeName: 'Sarah Johnson', employeeId: 'EMP-002', department: 'Lighting', checkType: 'Criminal', status: 'Expired', submittedDate: '2023-11-01', completedDate: '2023-11-05', expiryDate: '2024-11-05', daysUntilExpiry: -20, result: 'Clear' },
  { id: 'BC-003', employeeName: 'Mike Davis', employeeId: 'EMP-003', department: 'Stage', checkType: 'Comprehensive', status: 'In Progress', submittedDate: '2024-11-20' },
  { id: 'BC-004', employeeName: 'Emily Chen', employeeId: 'EMP-004', department: 'Video', checkType: 'Employment', status: 'Completed', submittedDate: '2024-06-01', completedDate: '2024-06-10', expiryDate: '2025-06-10', daysUntilExpiry: 197, result: 'Clear' },
  { id: 'BC-005', employeeName: 'Robert Wilson', employeeId: 'EMP-005', department: 'Rigging', checkType: 'Comprehensive', status: 'Completed', submittedDate: '2024-09-15', completedDate: '2024-09-22', expiryDate: '2024-12-22', daysUntilExpiry: 27, result: 'Review Required' },
];

// =============================================================================
// DIRECTORY AVAILABILITY (for directory/availability/page.tsx)
// =============================================================================

export interface DemoCrewAvailability {
  id: string;
  name: string;
  role: string;
  department: string;
  avatar: string;
  status: 'Available' | 'Busy' | 'Tentative' | 'Unavailable';
  currentProject?: string;
  nextAvailable?: string;
  weekAvailability: boolean[];
  [key: string]: unknown;
}

export const DEMO_CREW_AVAILABILITY: DemoCrewAvailability[] = [
  { id: 'CRW-001', name: 'John Smith', role: 'Audio Engineer', department: 'Audio', avatar: 'JS', status: 'Available', weekAvailability: [true, true, true, true, true, false, false] },
  { id: 'CRW-002', name: 'Sarah Johnson', role: 'Lighting Designer', department: 'Lighting', avatar: 'SJ', status: 'Busy', currentProject: 'Summer Fest 2024', nextAvailable: '2024-12-01', weekAvailability: [false, false, false, false, false, false, false] },
  { id: 'CRW-003', name: 'Mike Davis', role: 'Stage Manager', department: 'Stage', avatar: 'MD', status: 'Tentative', weekAvailability: [true, true, false, false, true, true, false] },
  { id: 'CRW-004', name: 'Emily Chen', role: 'Video Director', department: 'Video', avatar: 'EC', status: 'Available', weekAvailability: [true, true, true, true, true, true, false] },
  { id: 'CRW-005', name: 'Robert Wilson', role: 'Rigger', department: 'Rigging', avatar: 'RW', status: 'Unavailable', nextAvailable: '2024-12-15', weekAvailability: [false, false, false, false, false, false, false] },
];

// =============================================================================
// DIRECTORY FILTERS (for directory/filters/page.tsx)
// =============================================================================

export interface DemoDirectoryEntry {
  id: string;
  name: string;
  type: 'Crew' | 'Vendor' | 'Venue';
  specialties: string[];
  languages: string[];
  location: string;
  rating: number;
  available: boolean;
  [key: string]: unknown;
}

export const DEMO_DIRECTORY_ENTRIES: DemoDirectoryEntry[] = [
  { id: 'DIR-001', name: 'John Smith', type: 'Crew', specialties: ['Audio Engineer', 'FOH Mixer', 'System Tech'], languages: ['English', 'Spanish'], location: 'Los Angeles, CA', rating: 4.9, available: true },
  { id: 'DIR-002', name: 'Maria Garcia', type: 'Crew', specialties: ['Lighting Designer', 'Programmer'], languages: ['Spanish', 'English', 'Portuguese'], location: 'Miami, FL', rating: 4.8, available: true },
  { id: 'DIR-003', name: 'PRG', type: 'Vendor', specialties: ['Audio', 'Lighting', 'Video', 'Staging'], languages: ['English'], location: 'Multiple', rating: 4.7, available: true },
  { id: 'DIR-004', name: 'Hans Mueller', type: 'Crew', specialties: ['Rigger', 'Head Rigger'], languages: ['German', 'English'], location: 'New York, NY', rating: 4.9, available: false },
  { id: 'DIR-005', name: 'Madison Square Garden', type: 'Venue', specialties: ['Arena', 'Concert', 'Sports'], languages: ['English'], location: 'New York, NY', rating: 4.8, available: true },
  { id: 'DIR-006', name: 'Yuki Tanaka', type: 'Crew', specialties: ['Video Director', 'LED Tech'], languages: ['Japanese', 'English'], location: 'Los Angeles, CA', rating: 4.7, available: true },
];

// =============================================================================
// ADVANCING CATALOG (for advancing/catalog/page.tsx)
// =============================================================================

export interface DemoCatalogItem {
  id: string;
  item_id: string;
  item_name: string;
  category: string;
  subcategory: string;
  specifications: string;
  standard_unit: string;
  common_variations: string[];
  industry_vertical: string;
  procurement_type: string;
  featured: boolean;
  [key: string]: unknown;
}

export const DEMO_CATALOG_ITEMS: DemoCatalogItem[] = [
  { id: 'demo-1', item_id: 'AV-001', item_name: 'LED Video Wall Panel', category: 'Audio Visual', subcategory: 'Video', specifications: '2.5mm pixel pitch, 500x500mm panel, indoor rated', standard_unit: 'panel', common_variations: ['2.5mm', '2.9mm', '3.9mm'], industry_vertical: 'events', procurement_type: 'rental', featured: true },
  { id: 'demo-2', item_id: 'LX-001', item_name: 'Moving Head Wash Light', category: 'Lighting', subcategory: 'Moving Lights', specifications: 'RGBW LED, 19x15W, zoom 7-50 degrees', standard_unit: 'fixture', common_variations: ['Wash', 'Spot', 'Beam'], industry_vertical: 'events', procurement_type: 'rental', featured: true },
  { id: 'demo-3', item_id: 'ST-001', item_name: 'Stage Deck Platform', category: 'Staging', subcategory: 'Decking', specifications: '4x8 ft aluminum frame, adjustable legs 16-24 inches', standard_unit: 'deck', common_variations: ['4x4', '4x8', '6x8'], industry_vertical: 'events', procurement_type: 'rental', featured: false },
];

export interface DemoCatalogData {
  items: DemoCatalogItem[];
  total: number;
  categories: string[];
  [key: string]: unknown;
}

export const DEMO_CATALOG_DATA: DemoCatalogData = {
  items: DEMO_CATALOG_ITEMS,
  total: 329,
  categories: ['Audio Visual', 'Lighting', 'Staging', 'Power', 'Rigging'],
};

// =============================================================================
// GLOSSARY (for glossary/page.tsx)
// =============================================================================

export interface DemoGlossaryTerm {
  id: string;
  term: string;
  definition: string;
  category: 'Audio' | 'Lighting' | 'Video' | 'Staging' | 'Rigging' | 'Production' | 'General';
  aliases?: string[];
  relatedTerms?: string[];
  [key: string]: unknown;
}

export const DEMO_GLOSSARY_TERMS: DemoGlossaryTerm[] = [
  { id: 'GLO-001', term: 'FOH', definition: 'Front of House - The area where the audience is located, or the mixing position for audio/lighting.', category: 'General', aliases: ['Front of House'], relatedTerms: ['BOH', 'Monitor World'] },
  { id: 'GLO-002', term: 'BOH', definition: 'Back of House - The backstage area including dressing rooms, production offices, and load-in areas.', category: 'General', aliases: ['Back of House', 'Backstage'], relatedTerms: ['FOH', 'Green Room'] },
  { id: 'GLO-003', term: 'Line Array', definition: 'A loudspeaker system where multiple speaker elements are arranged in a vertical line to create a coherent wavefront.', category: 'Audio', relatedTerms: ['Point Source', 'Subwoofer'] },
  { id: 'GLO-004', term: 'Truss', definition: 'Aluminum or steel structural framework used to hang lighting, audio, and video equipment.', category: 'Rigging', aliases: ['Box Truss', 'Triangle Truss'], relatedTerms: ['Motor', 'Bridle'] },
  { id: 'GLO-005', term: 'DMX', definition: 'Digital Multiplex - A standard protocol for controlling lighting fixtures and effects.', category: 'Lighting', aliases: ['DMX512'], relatedTerms: ['Art-Net', 'sACN'] },
  { id: 'GLO-006', term: 'IEM', definition: 'In-Ear Monitor - Personal monitoring system worn by performers to hear themselves and the mix.', category: 'Audio', aliases: ['In-Ears', 'Ears'], relatedTerms: ['Wedge', 'Monitor Mix'] },
  { id: 'GLO-007', term: 'LED Wall', definition: 'A video display made up of LED panels tiled together to create a seamless large-format screen.', category: 'Video', aliases: ['LED Screen', 'Video Wall'], relatedTerms: ['Pixel Pitch', 'Processing'] },
  { id: 'GLO-008', term: 'Deck', definition: 'The stage floor or platform surface where performers and equipment are positioned.', category: 'Staging', aliases: ['Stage Deck'], relatedTerms: ['Riser', 'Thrust'] },
  { id: 'GLO-009', term: 'Strike', definition: 'The process of dismantling and removing all production equipment after an event.', category: 'Production', aliases: ['Load-Out', 'Tear Down'], relatedTerms: ['Load-In', 'Bump Out'] },
  { id: 'GLO-010', term: 'Rider', definition: 'A document specifying technical and hospitality requirements for an artist or production.', category: 'Production', aliases: ['Tech Rider', 'Hospitality Rider'], relatedTerms: ['Advance', 'Input List'] },
  { id: 'GLO-011', term: 'Bridle', definition: 'A rigging configuration using multiple legs to distribute load from a single point.', category: 'Rigging', relatedTerms: ['Shackle', 'Motor'] },
  { id: 'GLO-012', term: 'Gobo', definition: 'A template or pattern placed in a lighting fixture to project shapes or textures.', category: 'Lighting', aliases: ['Pattern', 'Template'], relatedTerms: ['Moving Light', 'Profile'] },
];

// =============================================================================
// ISSUES (for issues/page.tsx)
// =============================================================================

export interface DemoIssue {
  id: string;
  title: string;
  description: string;
  category: 'technical' | 'safety' | 'logistics' | 'personnel' | 'vendor' | 'other';
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'escalated' | 'resolved' | 'closed';
  reported_by: string;
  assigned_to?: string;
  department: string;
  location?: string;
  created_at: string;
  updated_at: string;
  escalation_level: number;
  resolution?: string;
  [key: string]: unknown;
}

export const DEMO_ISSUES: DemoIssue[] = [
  { id: 'ISS-001', title: 'Main PA system feedback', description: 'Intermittent feedback from house left speaker cluster', category: 'technical', priority: 'high', status: 'in_progress', reported_by: 'John Martinez', assigned_to: 'Audio Team', department: 'Audio', location: 'Main Stage', created_at: '2024-11-24T14:30:00Z', updated_at: '2024-11-24T14:45:00Z', escalation_level: 1 },
  { id: 'ISS-002', title: 'Truss motor malfunction', description: 'Motor 3 on downstage truss not responding', category: 'technical', priority: 'critical', status: 'escalated', reported_by: 'Chris Brown', assigned_to: 'Rigging Lead', department: 'Rigging', location: 'Main Stage', created_at: '2024-11-24T13:00:00Z', updated_at: '2024-11-24T14:00:00Z', escalation_level: 2 },
  { id: 'ISS-003', title: 'Catering delivery delayed', description: 'Crew lunch delivery running 45 minutes late', category: 'logistics', priority: 'medium', status: 'open', reported_by: 'Production Office', department: 'Production', created_at: '2024-11-24T11:00:00Z', updated_at: '2024-11-24T11:00:00Z', escalation_level: 0 },
  { id: 'ISS-004', title: 'Missing crew member', description: 'Stagehand Alex Johnson not checked in, no response to calls', category: 'personnel', priority: 'high', status: 'open', reported_by: 'Stage Manager', department: 'Stage', created_at: '2024-11-24T09:00:00Z', updated_at: '2024-11-24T09:30:00Z', escalation_level: 1 },
  { id: 'ISS-005', title: 'Fire exit blocked', description: 'Equipment cases blocking emergency exit door 3', category: 'safety', priority: 'critical', status: 'resolved', reported_by: 'Safety Officer', assigned_to: 'Stagehands', department: 'Safety', location: 'Backstage', created_at: '2024-11-24T10:00:00Z', updated_at: '2024-11-24T10:15:00Z', escalation_level: 0, resolution: 'Cases moved to designated storage area' },
];

// =============================================================================
// MY SCHEDULE (for my-schedule/page.tsx)
// =============================================================================

export interface DemoScheduleItem {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  production: string;
  venue: string;
  department: string;
  role: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  [key: string]: unknown;
}

export const DEMO_MY_SCHEDULE: DemoScheduleItem[] = [
  { id: '1', date: '2024-12-05', startTime: '08:00', endTime: '16:00', production: 'Summer Music Festival 2024', venue: 'Central Park Amphitheater', department: 'Stage', role: 'Stage Manager', status: 'confirmed' },
  { id: '2', date: '2024-12-06', startTime: '10:00', endTime: '18:00', production: 'Summer Music Festival 2024', venue: 'Central Park Amphitheater', department: 'Stage', role: 'Stage Manager', status: 'confirmed' },
  { id: '3', date: '2024-12-07', startTime: '06:00', endTime: '14:00', production: 'Corporate Gala', venue: 'Grand Ballroom', department: 'Audio', role: 'A1', status: 'pending' },
  { id: '4', date: '2024-12-10', startTime: '12:00', endTime: '20:00', production: 'Tech Conference', venue: 'Convention Center', department: 'Video', role: 'LED Tech', status: 'confirmed' },
];

// =============================================================================
// MY ASSIGNMENTS (for my-assignments/page.tsx)
// =============================================================================

export interface DemoAssignment {
  id: string;
  production: string;
  venue: string;
  dates: string;
  department: string;
  role: string;
  rate: number;
  status: 'pending' | 'accepted' | 'declined';
  deadline: string;
  [key: string]: unknown;
}

export const DEMO_MY_ASSIGNMENTS: DemoAssignment[] = [
  { id: '1', production: "New Year's Eve Gala", venue: 'Grand Ballroom', dates: 'Dec 31, 2024 - Jan 1, 2025', department: 'Stage', role: 'Stage Manager', rate: 450, status: 'pending', deadline: '2024-12-20' },
  { id: '2', production: 'Winter Concert Series', venue: 'Symphony Hall', dates: 'Jan 5-7, 2025', department: 'Audio', role: 'A1', rate: 350, status: 'pending', deadline: '2024-12-25' },
  { id: '3', production: 'Corporate Awards', venue: 'Convention Center', dates: 'Jan 15, 2025', department: 'Video', role: 'LED Tech', rate: 300, status: 'accepted', deadline: '2024-12-15' },
  { id: '4', production: 'Trade Show', venue: 'Expo Center', dates: 'Jan 20-22, 2025', department: 'Lighting', role: 'LD', rate: 400, status: 'declined', deadline: '2024-12-10' },
];

// =============================================================================
// RUN OF SHOW (for run-of-show/page.tsx)
// =============================================================================

export interface DemoCueItem {
  id: string;
  time: string;
  cue: string;
  department: string;
  notes: string;
  status: 'pending' | 'ready' | 'complete';
  [key: string]: unknown;
}

export const DEMO_CUES: DemoCueItem[] = [
  { id: '1', time: '19:00', cue: 'Doors Open', department: 'FOH', notes: 'Begin guest entry', status: 'complete' },
  { id: '2', time: '19:45', cue: 'House Lights to Half', department: 'Lighting', notes: '15 min warning', status: 'complete' },
  { id: '3', time: '20:00', cue: 'Show Start - Intro Video', department: 'Video', notes: 'Q1 - Roll intro', status: 'ready' },
  { id: '4', time: '20:02', cue: 'Artist Walk On', department: 'Stage', notes: 'SR entrance', status: 'ready' },
  { id: '5', time: '20:03', cue: 'Song 1 - Opening Number', department: 'Sound', notes: 'Playback + Live', status: 'pending' },
  { id: '6', time: '20:08', cue: 'Lighting Look 2', department: 'Lighting', notes: 'Q12 - Blue wash', status: 'pending' },
];

// =============================================================================
// MESSAGES (for messages/page.tsx)
// =============================================================================

export interface DemoConversation {
  id: string;
  participantName: string;
  participantRole: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  online: boolean;
  [key: string]: unknown;
}

export interface DemoDirectMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  read: boolean;
  [key: string]: unknown;
}

export const DEMO_CONVERSATIONS: DemoConversation[] = [
  { id: 'CONV-001', participantName: 'John Smith', participantRole: 'Audio Lead', lastMessage: 'The console is set up and ready', timestamp: '2 min ago', unread: 2, online: true },
  { id: 'CONV-002', participantName: 'Sarah Johnson', participantRole: 'Stage Manager', lastMessage: 'Changeover complete, ready for soundcheck', timestamp: '15 min ago', unread: 0, online: true },
  { id: 'CONV-003', participantName: 'Mike Davis', participantRole: 'Lighting Designer', lastMessage: 'Focus session scheduled for 3pm', timestamp: '1 hr ago', unread: 1, online: false },
  { id: 'CONV-004', participantName: 'Emily Chen', participantRole: 'Video Director', lastMessage: 'Camera positions confirmed', timestamp: '3 hrs ago', unread: 0, online: false },
];

export const DEMO_DIRECT_MESSAGES: DemoDirectMessage[] = [
  { id: 'MSG-001', senderId: 'other', content: 'Hey, just wanted to check on the audio setup', timestamp: '10:30 AM', read: true },
  { id: 'MSG-002', senderId: 'me', content: 'All good here, console is patched and ready', timestamp: '10:32 AM', read: true },
  { id: 'MSG-003', senderId: 'other', content: 'Great! What about the monitor mixes?', timestamp: '10:33 AM', read: true },
  { id: 'MSG-004', senderId: 'me', content: 'Working on those now, should be done in 20', timestamp: '10:35 AM', read: true },
  { id: 'MSG-005', senderId: 'other', content: 'The console is set up and ready', timestamp: '10:45 AM', read: false },
];

// =============================================================================
// MENTORSHIP (for mentorship/page.tsx)
// =============================================================================

export interface DemoMentor {
  id: string;
  name: string;
  role: string;
  department: string;
  yearsExperience: number;
  specialties: string[];
  availability: 'Available' | 'Limited' | 'Full';
  mentees: number;
  maxMentees: number;
  rating: number;
  [key: string]: unknown;
}

export interface DemoMentorshipProgram {
  id: string;
  name: string;
  description: string;
  duration: string;
  level: 'Entry' | 'Intermediate' | 'Advanced';
  modules: number;
  enrolled: number;
  capacity: number;
  [key: string]: unknown;
}

export const DEMO_MENTORS: DemoMentor[] = [
  { id: 'MNT-001', name: 'Sarah Chen', role: 'Senior Production Manager', department: 'Production', yearsExperience: 15, specialties: ['Festival Production', 'Large Scale Events', 'Budget Management'], availability: 'Available', mentees: 2, maxMentees: 4, rating: 4.9 },
  { id: 'MNT-002', name: 'Mike Thompson', role: 'Technical Director', department: 'Technical', yearsExperience: 20, specialties: ['Audio Systems', 'Rigging', 'Safety'], availability: 'Limited', mentees: 3, maxMentees: 3, rating: 4.8 },
  { id: 'MNT-003', name: 'Lisa Park', role: 'Lighting Designer', department: 'Lighting', yearsExperience: 12, specialties: ['Concert Lighting', 'Programming', 'Design'], availability: 'Available', mentees: 1, maxMentees: 3, rating: 4.7 },
  { id: 'MNT-004', name: 'John Martinez', role: 'Stage Manager', department: 'Stage', yearsExperience: 18, specialties: ['Run of Show', 'Artist Relations', 'Crew Management'], availability: 'Full', mentees: 4, maxMentees: 4, rating: 4.9 },
];

export const DEMO_MENTORSHIP_PROGRAMS: DemoMentorshipProgram[] = [
  { id: 'PRG-001', name: 'Production Fundamentals', description: 'Learn the basics of live event production', duration: '8 weeks', level: 'Entry', modules: 12, enrolled: 24, capacity: 30 },
  { id: 'PRG-002', name: 'Technical Operations', description: 'Deep dive into technical production systems', duration: '12 weeks', level: 'Intermediate', modules: 18, enrolled: 15, capacity: 20 },
  { id: 'PRG-003', name: 'Leadership in Production', description: 'Develop management and leadership skills', duration: '16 weeks', level: 'Advanced', modules: 24, enrolled: 8, capacity: 12 },
];

// =============================================================================
// TEMPLATES (for templates/page.tsx)
// =============================================================================

export interface DemoTemplate {
  id: string;
  name: string;
  category: 'Contract' | 'Checklist' | 'Form' | 'Rider' | 'Report' | 'SOP';
  description: string;
  version: string;
  lastUpdated: string;
  updatedBy: string;
  downloads: number;
  tags: string[];
  fileType: 'PDF' | 'DOCX' | 'XLSX' | 'Google Doc';
  size: string;
  [key: string]: unknown;
}

export const DEMO_TEMPLATES: DemoTemplate[] = [
  { id: 'TPL-001', name: 'Production Services Agreement', category: 'Contract', description: 'Standard contract for production services with clients', version: '3.2', lastUpdated: '2024-11-15', updatedBy: 'Legal Team', downloads: 245, tags: ['legal', 'client', 'services'], fileType: 'DOCX', size: '125 KB' },
  { id: 'TPL-002', name: 'Crew Deal Memo', category: 'Contract', description: 'Day-call and freelance crew agreement', version: '2.1', lastUpdated: '2024-11-10', updatedBy: 'HR Team', downloads: 892, tags: ['crew', 'labor', 'freelance'], fileType: 'PDF', size: '85 KB' },
  { id: 'TPL-003', name: 'Load-In Checklist', category: 'Checklist', description: 'Comprehensive load-in verification checklist', version: '4.0', lastUpdated: '2024-11-20', updatedBy: 'Operations', downloads: 567, tags: ['load-in', 'operations', 'verification'], fileType: 'PDF', size: '45 KB' },
  { id: 'TPL-004', name: 'Safety Walk-Through Form', category: 'Form', description: 'Pre-event safety inspection documentation', version: '2.5', lastUpdated: '2024-11-18', updatedBy: 'Safety Team', downloads: 423, tags: ['safety', 'inspection', 'compliance'], fileType: 'PDF', size: '62 KB' },
  { id: 'TPL-005', name: 'Technical Rider Template', category: 'Rider', description: 'Standard technical rider for artists/performers', version: '1.8', lastUpdated: '2024-10-25', updatedBy: 'Production', downloads: 334, tags: ['technical', 'artist', 'requirements'], fileType: 'DOCX', size: '98 KB' },
  { id: 'TPL-006', name: 'Hospitality Rider Template', category: 'Rider', description: 'Artist hospitality and catering requirements', version: '1.5', lastUpdated: '2024-10-20', updatedBy: 'Production', downloads: 289, tags: ['hospitality', 'catering', 'artist'], fileType: 'DOCX', size: '75 KB' },
  { id: 'TPL-007', name: 'Show Report Template', category: 'Report', description: 'Post-event show report documentation', version: '3.0', lastUpdated: '2024-11-12', updatedBy: 'Operations', downloads: 678, tags: ['report', 'post-event', 'documentation'], fileType: 'XLSX', size: '156 KB' },
  { id: 'TPL-008', name: 'Incident Report Form', category: 'Form', description: 'Safety and security incident documentation', version: '2.2', lastUpdated: '2024-11-08', updatedBy: 'Safety Team', downloads: 234, tags: ['incident', 'safety', 'security'], fileType: 'PDF', size: '52 KB' },
  { id: 'TPL-009', name: 'Equipment Checkout SOP', category: 'SOP', description: 'Standard procedure for equipment checkout/return', version: '1.3', lastUpdated: '2024-10-30', updatedBy: 'Warehouse', downloads: 156, tags: ['equipment', 'procedure', 'warehouse'], fileType: 'PDF', size: '88 KB' },
  { id: 'TPL-010', name: 'Strike Checklist', category: 'Checklist', description: 'Post-event strike and packout verification', version: '3.5', lastUpdated: '2024-11-19', updatedBy: 'Operations', downloads: 445, tags: ['strike', 'packout', 'verification'], fileType: 'PDF', size: '48 KB' },
];
