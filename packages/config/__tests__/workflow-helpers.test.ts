import { describe, it, expect } from 'vitest';
import {
  canAccessWorkflow,
  canCompleteStep,
  getNextStep,
  updateWorkflowStep,
  calculateWorkflowProgress,
  createEventLaunchWorkflow,
  createCrewAssignmentWorkflow,
  CROSS_PLATFORM_WORKFLOWS,
  Workflow,
  WorkflowStep,
  WorkflowContext,
} from '../workflow-helpers';
import { PlatformRole, EventRole } from '../roles';

describe('workflow-helpers', () => {
  const mockContext: WorkflowContext = {
    userId: 'user-1',
    platformRoles: [PlatformRole.ATLVS_ADMIN],
    currentPlatform: 'atlvs',
  };

  const mockWorkflow: Workflow = {
    id: 'test-workflow',
    name: 'Test Workflow',
    platform: 'atlvs',
    currentStep: 0,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    steps: [
      { id: 'step-1', name: 'Step 1', status: 'complete' },
      { id: 'step-2', name: 'Step 2', status: 'in-progress', dependencies: ['step-1'] },
      { id: 'step-3', name: 'Step 3', status: 'pending', dependencies: ['step-2'] },
    ],
  };

  describe('canAccessWorkflow', () => {
    it('should allow access for LEGEND roles', () => {
      const legendContext: WorkflowContext = {
        ...mockContext,
        platformRoles: [PlatformRole.LEGEND_ADMIN],
      };
      expect(canAccessWorkflow(mockWorkflow, legendContext)).toBe(true);
    });

    it('should allow access for cross-platform workflows', () => {
      const crossPlatformWorkflow: Workflow = {
        ...mockWorkflow,
        platform: 'cross-platform',
      };
      expect(canAccessWorkflow(crossPlatformWorkflow, mockContext)).toBe(true);
    });

    it('should allow access when platform matches', () => {
      expect(canAccessWorkflow(mockWorkflow, mockContext)).toBe(true);
    });

    it('should deny access when platform does not match', () => {
      const compvssWorkflow: Workflow = {
        ...mockWorkflow,
        platform: 'compvss',
      };
      expect(canAccessWorkflow(compvssWorkflow, mockContext)).toBe(false);
    });
  });

  describe('canCompleteStep', () => {
    it('should allow completion when no role required', () => {
      const step: WorkflowStep = { id: 'step-1', name: 'Step 1', status: 'pending' };
      expect(canCompleteStep(step, mockContext)).toBe(true);
    });

    it('should allow completion when user has platform role', () => {
      const step: WorkflowStep = {
        id: 'step-1',
        name: 'Step 1',
        status: 'pending',
        requiredRole: PlatformRole.ATLVS_ADMIN,
      };
      expect(canCompleteStep(step, mockContext)).toBe(true);
    });

    it('should deny completion when user lacks required role', () => {
      const step: WorkflowStep = {
        id: 'step-1',
        name: 'Step 1',
        status: 'pending',
        requiredRole: PlatformRole.COMPVSS_ADMIN,
      };
      expect(canCompleteStep(step, mockContext)).toBe(false);
    });

    it('should check event roles when eventId is provided', () => {
      const contextWithEventRoles: WorkflowContext = {
        ...mockContext,
        eventId: 'event-1',
        eventRoles: {
          'event-1': [EventRole.EXECUTIVE],
        },
      };
      const step: WorkflowStep = {
        id: 'step-1',
        name: 'Step 1',
        status: 'pending',
        requiredRole: EventRole.EXECUTIVE,
      };
      expect(canCompleteStep(step, contextWithEventRoles)).toBe(true);
    });
  });

  describe('getNextStep', () => {
    it('should return first pending step with no dependencies', () => {
      const workflow: Workflow = {
        ...mockWorkflow,
        steps: [
          { id: 'step-1', name: 'Step 1', status: 'pending' },
          { id: 'step-2', name: 'Step 2', status: 'pending' },
        ],
      };
      const next = getNextStep(workflow);
      expect(next?.id).toBe('step-1');
    });

    it('should return step with met dependencies', () => {
      const workflow: Workflow = {
        ...mockWorkflow,
        steps: [
          { id: 'step-1', name: 'Step 1', status: 'complete' },
          { id: 'step-2', name: 'Step 2', status: 'pending', dependencies: ['step-1'] },
        ],
      };
      const next = getNextStep(workflow);
      expect(next?.id).toBe('step-2');
    });

    it('should skip steps with unmet dependencies', () => {
      const workflow: Workflow = {
        ...mockWorkflow,
        steps: [
          { id: 'step-1', name: 'Step 1', status: 'pending' },
          { id: 'step-2', name: 'Step 2', status: 'pending', dependencies: ['step-1'] },
        ],
      };
      const next = getNextStep(workflow);
      expect(next?.id).toBe('step-1');
    });

    it('should return null when all steps complete', () => {
      const workflow: Workflow = {
        ...mockWorkflow,
        steps: [
          { id: 'step-1', name: 'Step 1', status: 'complete' },
          { id: 'step-2', name: 'Step 2', status: 'complete' },
        ],
      };
      expect(getNextStep(workflow)).toBeNull();
    });

    it('should return null when no steps can proceed', () => {
      const workflow: Workflow = {
        ...mockWorkflow,
        steps: [
          { id: 'step-1', name: 'Step 1', status: 'blocked' },
          { id: 'step-2', name: 'Step 2', status: 'pending', dependencies: ['step-1'] },
        ],
      };
      expect(getNextStep(workflow)).toBeNull();
    });
  });

  describe('updateWorkflowStep', () => {
    it('should update step status', () => {
      const updated = updateWorkflowStep(mockWorkflow, 'step-2', 'complete');
      const step = updated.steps.find(s => s.id === 'step-2');
      expect(step?.status).toBe('complete');
    });

    it('should not modify other steps', () => {
      const updated = updateWorkflowStep(mockWorkflow, 'step-2', 'complete');
      const step1 = updated.steps.find(s => s.id === 'step-1');
      expect(step1?.status).toBe('complete');
    });

    it('should update updatedAt timestamp', () => {
      const updated = updateWorkflowStep(mockWorkflow, 'step-2', 'complete');
      expect(updated.updatedAt).not.toBe(mockWorkflow.updatedAt);
    });

    it('should return new workflow object', () => {
      const updated = updateWorkflowStep(mockWorkflow, 'step-2', 'complete');
      expect(updated).not.toBe(mockWorkflow);
    });
  });

  describe('calculateWorkflowProgress', () => {
    it('should return 0 for no completed steps', () => {
      const workflow: Workflow = {
        ...mockWorkflow,
        steps: [
          { id: 'step-1', name: 'Step 1', status: 'pending' },
          { id: 'step-2', name: 'Step 2', status: 'pending' },
        ],
      };
      expect(calculateWorkflowProgress(workflow)).toBe(0);
    });

    it('should return 100 for all completed steps', () => {
      const workflow: Workflow = {
        ...mockWorkflow,
        steps: [
          { id: 'step-1', name: 'Step 1', status: 'complete' },
          { id: 'step-2', name: 'Step 2', status: 'complete' },
        ],
      };
      expect(calculateWorkflowProgress(workflow)).toBe(100);
    });

    it('should return correct percentage for partial completion', () => {
      const workflow: Workflow = {
        ...mockWorkflow,
        steps: [
          { id: 'step-1', name: 'Step 1', status: 'complete' },
          { id: 'step-2', name: 'Step 2', status: 'pending' },
          { id: 'step-3', name: 'Step 3', status: 'pending' },
          { id: 'step-4', name: 'Step 4', status: 'pending' },
        ],
      };
      expect(calculateWorkflowProgress(workflow)).toBe(25);
    });

    it('should round to nearest integer', () => {
      expect(calculateWorkflowProgress(mockWorkflow)).toBe(33); // 1/3
    });
  });

  describe('CROSS_PLATFORM_WORKFLOWS', () => {
    it('should have event launch workflow', () => {
      expect(CROSS_PLATFORM_WORKFLOWS.EVENT_LAUNCH).toBe('event-launch');
    });

    it('should have client onboarding workflow', () => {
      expect(CROSS_PLATFORM_WORKFLOWS.CLIENT_ONBOARDING).toBe('client-onboarding');
    });

    it('should have crew assignment workflow', () => {
      expect(CROSS_PLATFORM_WORKFLOWS.CREW_ASSIGNMENT).toBe('crew-assignment');
    });
  });

  describe('createEventLaunchWorkflow', () => {
    it('should create workflow with correct id', () => {
      const workflow = createEventLaunchWorkflow('event-123');
      expect(workflow.id).toBe('event-launch-event-123');
    });

    it('should be cross-platform', () => {
      const workflow = createEventLaunchWorkflow('event-123');
      expect(workflow.platform).toBe('cross-platform');
    });

    it('should have 6 steps', () => {
      const workflow = createEventLaunchWorkflow('event-123');
      expect(workflow.steps).toHaveLength(6);
    });

    it('should have all steps pending', () => {
      const workflow = createEventLaunchWorkflow('event-123');
      expect(workflow.steps.every(s => s.status === 'pending')).toBe(true);
    });

    it('should have proper dependencies chain', () => {
      const workflow = createEventLaunchWorkflow('event-123');
      expect(workflow.steps[0].dependencies).toBeUndefined();
      expect(workflow.steps[1].dependencies).toContain('atlvs-contract');
      expect(workflow.steps[5].dependencies).toContain('gvteway-event');
    });
  });

  describe('createCrewAssignmentWorkflow', () => {
    it('should create workflow with correct id', () => {
      const workflow = createCrewAssignmentWorkflow('project-456');
      expect(workflow.id).toBe('crew-assignment-project-456');
    });

    it('should be compvss platform', () => {
      const workflow = createCrewAssignmentWorkflow('project-456');
      expect(workflow.platform).toBe('compvss');
    });

    it('should have 4 steps', () => {
      const workflow = createCrewAssignmentWorkflow('project-456');
      expect(workflow.steps).toHaveLength(4);
    });

    it('should have proper dependencies', () => {
      const workflow = createCrewAssignmentWorkflow('project-456');
      expect(workflow.steps[0].dependencies).toBeUndefined();
      expect(workflow.steps[3].dependencies).toContain('assign-crew');
    });
  });
});
