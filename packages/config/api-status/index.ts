/**
 * API Status Page Configuration
 * Tracks uptime, incidents, and planned changes
 */

export interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'partial_outage' | 'major_outage' | 'maintenance';
  description?: string;
  lastUpdated: string;
}

export interface Incident {
  id: string;
  title: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  severity: 'minor' | 'major' | 'critical';
  affectedServices: string[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  updates: IncidentUpdate[];
}

export interface IncidentUpdate {
  id: string;
  status: string;
  message: string;
  createdAt: string;
}

export interface MaintenanceWindow {
  id: string;
  title: string;
  description: string;
  affectedServices: string[];
  scheduledStart: string;
  scheduledEnd: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

export interface UptimeMetric {
  service: string;
  period: '24h' | '7d' | '30d' | '90d';
  uptime: number; // percentage
  incidents: number;
  avgResponseTime: number; // ms
}

// Service definitions
export const SERVICES: Record<string, { name: string; description: string; platform: string }> = {
  'atlvs-api': {
    name: 'ATLVS API',
    description: 'Business operations API endpoints',
    platform: 'atlvs',
  },
  'atlvs-auth': {
    name: 'ATLVS Authentication',
    description: 'User authentication and authorization',
    platform: 'atlvs',
  },
  'compvss-api': {
    name: 'COMPVSS API',
    description: 'Production operations API endpoints',
    platform: 'compvss',
  },
  'compvss-realtime': {
    name: 'COMPVSS Real-time',
    description: 'Real-time communication and updates',
    platform: 'compvss',
  },
  'gvteway-api': {
    name: 'GVTEWAY API',
    description: 'Consumer experience API endpoints',
    platform: 'gvteway',
  },
  'gvteway-payments': {
    name: 'GVTEWAY Payments',
    description: 'Payment processing via Stripe',
    platform: 'gvteway',
  },
  'gvteway-ticketing': {
    name: 'GVTEWAY Ticketing',
    description: 'Ticket sales and management',
    platform: 'gvteway',
  },
  'database': {
    name: 'Database',
    description: 'Supabase PostgreSQL database',
    platform: 'infrastructure',
  },
  'storage': {
    name: 'File Storage',
    description: 'Supabase Storage for files and media',
    platform: 'infrastructure',
  },
  'cdn': {
    name: 'CDN',
    description: 'Content delivery network',
    platform: 'infrastructure',
  },
};

// In-memory status store (would be backed by database in production)
let currentStatus: Record<string, ServiceStatus> = {};
let incidents: Incident[] = [];
let maintenanceWindows: MaintenanceWindow[] = [];

// Initialize all services as operational
Object.keys(SERVICES).forEach(serviceId => {
  currentStatus[serviceId] = {
    name: SERVICES[serviceId].name,
    status: 'operational',
    lastUpdated: new Date().toISOString(),
  };
});

export function getServiceStatus(serviceId: string): ServiceStatus | null {
  return currentStatus[serviceId] || null;
}

export function getAllServiceStatuses(): Record<string, ServiceStatus> {
  return { ...currentStatus };
}

export function updateServiceStatus(
  serviceId: string,
  status: ServiceStatus['status'],
  description?: string
): void {
  if (!currentStatus[serviceId]) {
    throw new Error(`Unknown service: ${serviceId}`);
  }
  
  currentStatus[serviceId] = {
    ...currentStatus[serviceId],
    status,
    description,
    lastUpdated: new Date().toISOString(),
  };
}

export function getOverallStatus(): 'operational' | 'degraded' | 'partial_outage' | 'major_outage' {
  const statuses = Object.values(currentStatus).map(s => s.status);
  
  if (statuses.every(s => s === 'operational')) {
    return 'operational';
  }
  
  if (statuses.some(s => s === 'major_outage')) {
    return 'major_outage';
  }
  
  if (statuses.some(s => s === 'partial_outage')) {
    return 'partial_outage';
  }
  
  return 'degraded';
}

export function createIncident(incident: Omit<Incident, 'id' | 'createdAt' | 'updatedAt' | 'updates'>): Incident {
  const newIncident: Incident = {
    ...incident,
    id: `inc_${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    updates: [],
  };
  
  incidents.unshift(newIncident);
  
  // Update affected service statuses
  incident.affectedServices.forEach(serviceId => {
    if (currentStatus[serviceId]) {
      const newStatus = incident.severity === 'critical' ? 'major_outage' :
                       incident.severity === 'major' ? 'partial_outage' : 'degraded';
      updateServiceStatus(serviceId, newStatus, incident.title);
    }
  });
  
  return newIncident;
}

export function updateIncident(
  incidentId: string,
  update: { status?: Incident['status']; message: string }
): Incident | null {
  const incident = incidents.find(i => i.id === incidentId);
  
  if (!incident) return null;
  
  if (update.status) {
    incident.status = update.status;
  }
  
  incident.updatedAt = new Date().toISOString();
  
  if (update.status === 'resolved') {
    incident.resolvedAt = new Date().toISOString();
    
    // Reset affected service statuses
    incident.affectedServices.forEach(serviceId => {
      if (currentStatus[serviceId]) {
        updateServiceStatus(serviceId, 'operational');
      }
    });
  }
  
  incident.updates.push({
    id: `upd_${Date.now()}`,
    status: update.status || incident.status,
    message: update.message,
    createdAt: new Date().toISOString(),
  });
  
  return incident;
}

export function getActiveIncidents(): Incident[] {
  return incidents.filter(i => i.status !== 'resolved');
}

export function getRecentIncidents(limit: number = 10): Incident[] {
  return incidents.slice(0, limit);
}

export function scheduleMaintenanceWindow(
  maintenance: Omit<MaintenanceWindow, 'id' | 'status'>
): MaintenanceWindow {
  const newMaintenance: MaintenanceWindow = {
    ...maintenance,
    id: `mnt_${Date.now()}`,
    status: 'scheduled',
  };
  
  maintenanceWindows.push(newMaintenance);
  return newMaintenance;
}

export function getUpcomingMaintenance(): MaintenanceWindow[] {
  const now = new Date();
  return maintenanceWindows.filter(
    m => m.status === 'scheduled' && new Date(m.scheduledStart) > now
  );
}

export function getStatusPageData(): {
  overall: ReturnType<typeof getOverallStatus>;
  services: Record<string, ServiceStatus>;
  activeIncidents: Incident[];
  upcomingMaintenance: MaintenanceWindow[];
  lastUpdated: string;
} {
  return {
    overall: getOverallStatus(),
    services: getAllServiceStatuses(),
    activeIncidents: getActiveIncidents(),
    upcomingMaintenance: getUpcomingMaintenance(),
    lastUpdated: new Date().toISOString(),
  };
}
