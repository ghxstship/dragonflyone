/**
 * Workflow Helper Functions
 * Common utilities for cross-platform workflows
 */

import { PlatformRole, EventRole } from './roles';

export interface WorkflowContext {
  userId: string;
  platformRoles: PlatformRole[];
  eventRoles?: Record<string, EventRole[]>;
  currentPlatform: 'atlvs' | 'compvss' | 'gvteway';
  eventId?: string;
}

export interface WorkflowStep {
  id: string;
  name: string;
  status: 'pending' | 'in-progress' | 'complete' | 'blocked';
  assignedTo?: string;
  requiredRole?: PlatformRole | EventRole;
  dependencies?: string[];
}

export interface Workflow {
  id: string;
  name: string;
  platform: 'atlvs' | 'compvss' | 'gvteway' | 'cross-platform';
  steps: WorkflowStep[];
  currentStep: number;
  createdAt: string;
  updatedAt: string;
}

export function canAccessWorkflow(
  workflow: Workflow,
  context: WorkflowContext
): boolean {
  if (context.platformRoles.some(r => r.startsWith('LEGEND_'))) {
    return true;
  }

  if (workflow.platform === 'cross-platform') {
    return true;
  }

  const platformMatch = context.currentPlatform === workflow.platform;
  return platformMatch;
}

export function canCompleteStep(
  step: WorkflowStep,
  context: WorkflowContext
): boolean {
  if (!step.requiredRole) {
    return true;
  }

  if (context.platformRoles.includes(step.requiredRole as PlatformRole)) {
    return true;
  }

  if (context.eventId && context.eventRoles) {
    const eventRoles = context.eventRoles[context.eventId] || [];
    if (eventRoles.includes(step.requiredRole as EventRole)) {
      return true;
    }
  }

  return false;
}

export function getNextStep(workflow: Workflow): WorkflowStep | null {
  const pendingSteps = workflow.steps.filter(s => s.status === 'pending');
  
  for (const step of pendingSteps) {
    if (!step.dependencies || step.dependencies.length === 0) {
      return step;
    }

    const dependenciesMet = step.dependencies.every(depId => {
      const depStep = workflow.steps.find(s => s.id === depId);
      return depStep?.status === 'complete';
    });

    if (dependenciesMet) {
      return step;
    }
  }

  return null;
}

export function updateWorkflowStep(
  workflow: Workflow,
  stepId: string,
  status: WorkflowStep['status']
): Workflow {
  return {
    ...workflow,
    steps: workflow.steps.map(step =>
      step.id === stepId ? { ...step, status } : step
    ),
    updatedAt: new Date().toISOString(),
  };
}

export function calculateWorkflowProgress(workflow: Workflow): number {
  const completed = workflow.steps.filter(s => s.status === 'complete').length;
  return Math.round((completed / workflow.steps.length) * 100);
}

export const CROSS_PLATFORM_WORKFLOWS = {
  EVENT_LAUNCH: 'event-launch',
  CLIENT_ONBOARDING: 'client-onboarding',
  PROJECT_COMPLETION: 'project-completion',
  VENDOR_PAYMENT: 'vendor-payment',
  CREW_ASSIGNMENT: 'crew-assignment',
};

export function createEventLaunchWorkflow(eventId: string): Workflow {
  return {
    id: `event-launch-${eventId}`,
    name: 'Event Launch',
    platform: 'cross-platform',
    currentStep: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    steps: [
      {
        id: 'atlvs-contract',
        name: 'Contract Signed (ATLVS)',
        status: 'pending',
        requiredRole: PlatformRole.ATLVS_ADMIN,
      },
      {
        id: 'atlvs-budget',
        name: 'Budget Approved (ATLVS)',
        status: 'pending',
        requiredRole: PlatformRole.ATLVS_ADMIN,
        dependencies: ['atlvs-contract'],
      },
      {
        id: 'compvss-project',
        name: 'Production Project Created (COMPVSS)',
        status: 'pending',
        requiredRole: PlatformRole.COMPVSS_ADMIN,
        dependencies: ['atlvs-budget'],
      },
      {
        id: 'compvss-crew',
        name: 'Crew Assigned (COMPVSS)',
        status: 'pending',
        requiredRole: PlatformRole.COMPVSS_ADMIN,
        dependencies: ['compvss-project'],
      },
      {
        id: 'gvteway-event',
        name: 'Event Published (GVTEWAY)',
        status: 'pending',
        requiredRole: PlatformRole.GVTEWAY_EXPERIENCE_CREATOR,
        dependencies: ['compvss-crew'],
      },
      {
        id: 'gvteway-tickets',
        name: 'Tickets On Sale (GVTEWAY)',
        status: 'pending',
        requiredRole: PlatformRole.GVTEWAY_ADMIN,
        dependencies: ['gvteway-event'],
      },
    ],
  };
}

export function createCrewAssignmentWorkflow(projectId: string): Workflow {
  return {
    id: `crew-assignment-${projectId}`,
    name: 'Crew Assignment',
    platform: 'compvss',
    currentStep: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    steps: [
      {
        id: 'identify-needs',
        name: 'Identify Crew Needs',
        status: 'pending',
        requiredRole: PlatformRole.COMPVSS_ADMIN,
      },
      {
        id: 'check-availability',
        name: 'Check Crew Availability',
        status: 'pending',
        requiredRole: PlatformRole.COMPVSS_TEAM_MEMBER,
        dependencies: ['identify-needs'],
      },
      {
        id: 'assign-crew',
        name: 'Assign Crew Members',
        status: 'pending',
        requiredRole: PlatformRole.COMPVSS_ADMIN,
        dependencies: ['check-availability'],
      },
      {
        id: 'notify-crew',
        name: 'Notify Assigned Crew',
        status: 'pending',
        dependencies: ['assign-crew'],
      },
    ],
  };
}
