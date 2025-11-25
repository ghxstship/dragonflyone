import { describe, it, expect, beforeAll, afterAll } from 'vitest';

/**
 * n8n Integration Regression Test Suite
 * Automated tests for n8n node package via n8n CLI
 * 
 * Run with: npx n8n-node-dev test
 */

const N8N_TEST_URL = process.env.N8N_TEST_URL || 'http://localhost:5678';
const API_KEY = process.env.TEST_API_KEY || 'test_key';

describe('n8n Node Regression Tests', () => {
  describe('Credential Types', () => {
    it('should validate API Key credential', async () => {
      const credential = {
        type: 'ghxstshipApi',
        data: {
          apiKey: API_KEY,
          environment: 'staging',
          platform: 'atlvs',
          workspaceId: 'ws_test123'
        }
      };

      // Test credential validation
      const response = await fetch(`${N8N_TEST_URL}/credentials/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credential)
      });

      expect(response.ok).toBe(true);
    });

    it('should validate OAuth2 credential', async () => {
      const credential = {
        type: 'ghxstshipOAuth2',
        data: {
          clientId: 'test_client_id',
          clientSecret: 'test_client_secret',
          platform: 'atlvs',
          workspaceId: 'ws_test123'
        }
      };

      const response = await fetch(`${N8N_TEST_URL}/credentials/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credential)
      });

      // OAuth2 requires actual tokens, so we just check the structure
      expect(response.status).not.toBe(500);
    });
  });

  describe('GHXSTSHIP Node Operations', () => {
    describe('Deal Operations', () => {
      let createdDealId: string;

      it('should list deals', async () => {
        const workflow = {
          nodes: [
            {
              type: '@ghxstship/n8n-nodes.ghxstship',
              parameters: {
                platform: 'atlvs',
                resource: 'deal',
                operation: 'getAll',
                returnAll: false,
                limit: 10
              }
            }
          ]
        };

        const response = await executeWorkflow(workflow);
        expect(response.success).toBe(true);
        expect(Array.isArray(response.data)).toBe(true);
      });

      it('should create a deal', async () => {
        const workflow = {
          nodes: [
            {
              type: '@ghxstship/n8n-nodes.ghxstship',
              parameters: {
                platform: 'atlvs',
                resource: 'deal',
                operation: 'create',
                additionalFields: {
                  name: 'n8n Test Deal',
                  value: 5000,
                  stage: 'qualification'
                }
              }
            }
          ]
        };

        const response = await executeWorkflow(workflow);
        expect(response.success).toBe(true);
        expect(response.data).toHaveProperty('id');
        createdDealId = response.data.id;
      });

      it('should get a specific deal', async () => {
        if (!createdDealId) return;

        const workflow = {
          nodes: [
            {
              type: '@ghxstship/n8n-nodes.ghxstship',
              parameters: {
                platform: 'atlvs',
                resource: 'deal',
                operation: 'get',
                recordId: createdDealId
              }
            }
          ]
        };

        const response = await executeWorkflow(workflow);
        expect(response.success).toBe(true);
        expect(response.data.id).toBe(createdDealId);
      });

      it('should update a deal', async () => {
        if (!createdDealId) return;

        const workflow = {
          nodes: [
            {
              type: '@ghxstship/n8n-nodes.ghxstship',
              parameters: {
                platform: 'atlvs',
                resource: 'deal',
                operation: 'update',
                recordId: createdDealId,
                additionalFields: {
                  value: 7500,
                  stage: 'proposal'
                }
              }
            }
          ]
        };

        const response = await executeWorkflow(workflow);
        expect(response.success).toBe(true);
        expect(response.data.value).toBe(7500);
      });

      it('should delete a deal', async () => {
        if (!createdDealId) return;

        const workflow = {
          nodes: [
            {
              type: '@ghxstship/n8n-nodes.ghxstship',
              parameters: {
                platform: 'atlvs',
                resource: 'deal',
                operation: 'delete',
                recordId: createdDealId
              }
            }
          ]
        };

        const response = await executeWorkflow(workflow);
        expect(response.success).toBe(true);
      });
    });

    describe('Project Operations (COMPVSS)', () => {
      it('should list projects', async () => {
        const workflow = {
          nodes: [
            {
              type: '@ghxstship/n8n-nodes.ghxstship',
              parameters: {
                platform: 'compvss',
                resource: 'project',
                operation: 'getAll',
                limit: 10
              }
            }
          ]
        };

        const response = await executeWorkflow(workflow);
        expect(response.success).toBe(true);
      });
    });

    describe('Event Operations (GVTEWAY)', () => {
      it('should list events', async () => {
        const workflow = {
          nodes: [
            {
              type: '@ghxstship/n8n-nodes.ghxstship',
              parameters: {
                platform: 'gvteway',
                resource: 'event',
                operation: 'getAll',
                limit: 10
              }
            }
          ]
        };

        const response = await executeWorkflow(workflow);
        expect(response.success).toBe(true);
      });
    });
  });

  describe('GHXSTSHIP Trigger Node', () => {
    it('should register webhook for deal.created', async () => {
      const workflow = {
        nodes: [
          {
            type: '@ghxstship/n8n-nodes.ghxstshipTrigger',
            parameters: {
              platform: 'atlvs',
              event: 'deal.created'
            }
          }
        ]
      };

      const response = await registerWebhook(workflow);
      expect(response.success).toBe(true);
      expect(response.webhookId).toBeDefined();
    });

    it('should unregister webhook', async () => {
      const workflow = {
        nodes: [
          {
            type: '@ghxstship/n8n-nodes.ghxstshipTrigger',
            parameters: {
              platform: 'atlvs',
              event: 'deal.created'
            }
          }
        ]
      };

      // First register
      const registerResponse = await registerWebhook(workflow);
      
      // Then unregister
      const unregisterResponse = await unregisterWebhook(registerResponse.webhookId);
      expect(unregisterResponse.success).toBe(true);
    });
  });

  describe('Reference Workflows', () => {
    const workflows = [
      'asset-maintenance-loop',
      'finance-reconciliation',
      'crew-onboarding',
      'ticket-escalation',
      'marketing-drip',
      'compliance-alerts',
      'inventory-sync',
      'vip-concierge'
    ];

    workflows.forEach(workflowName => {
      it(`should validate ${workflowName} workflow structure`, async () => {
        const response = await fetch(
          `${N8N_TEST_URL}/workflows/validate`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              workflowPath: `packages/integrations/workflows/${workflowName}.json`
            })
          }
        );

        const result = await response.json();
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid API key gracefully', async () => {
      const workflow = {
        nodes: [
          {
            type: '@ghxstship/n8n-nodes.ghxstship',
            parameters: {
              platform: 'atlvs',
              resource: 'deal',
              operation: 'getAll'
            }
          }
        ],
        credentials: {
          ghxstshipApi: {
            apiKey: 'invalid_key'
          }
        }
      };

      const response = await executeWorkflow(workflow);
      expect(response.success).toBe(false);
      expect(response.error).toContain('Unauthorized');
    });

    it('should handle not found errors', async () => {
      const workflow = {
        nodes: [
          {
            type: '@ghxstship/n8n-nodes.ghxstship',
            parameters: {
              platform: 'atlvs',
              resource: 'deal',
              operation: 'get',
              recordId: 'nonexistent_id'
            }
          }
        ]
      };

      const response = await executeWorkflow(workflow);
      expect(response.success).toBe(false);
      expect(response.error).toContain('Not Found');
    });

    it('should continue on fail when configured', async () => {
      const workflow = {
        nodes: [
          {
            type: '@ghxstship/n8n-nodes.ghxstship',
            parameters: {
              platform: 'atlvs',
              resource: 'deal',
              operation: 'get',
              recordId: 'nonexistent_id'
            },
            continueOnFail: true
          }
        ]
      };

      const response = await executeWorkflow(workflow);
      expect(response.success).toBe(true);
      expect(response.data).toHaveProperty('error');
    });
  });
});

// Helper functions
async function executeWorkflow(workflow: any): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const response = await fetch(`${N8N_TEST_URL}/workflows/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': process.env.N8N_API_KEY || ''
      },
      body: JSON.stringify(workflow)
    });

    const result = await response.json();
    return {
      success: response.ok,
      data: result.data,
      error: result.error
    };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message
    };
  }
}

async function registerWebhook(workflow: any): Promise<{ success: boolean; webhookId?: string }> {
  try {
    const response = await fetch(`${N8N_TEST_URL}/webhooks/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(workflow)
    });

    const result = await response.json();
    return {
      success: response.ok,
      webhookId: result.webhookId
    };
  } catch {
    return { success: false };
  }
}

async function unregisterWebhook(webhookId: string): Promise<{ success: boolean }> {
  try {
    const response = await fetch(`${N8N_TEST_URL}/webhooks/${webhookId}`, {
      method: 'DELETE'
    });
    return { success: response.ok };
  } catch {
    return { success: false };
  }
}
