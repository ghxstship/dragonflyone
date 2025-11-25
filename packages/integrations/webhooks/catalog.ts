/**
 * Webhook Event Catalog for GHXSTSHIP Platforms
 * Defines all webhook events with example payloads and retry semantics
 */

export interface WebhookEvent {
  name: string;
  description: string;
  platform: 'atlvs' | 'compvss' | 'gvteway';
  category: string;
  version: string;
  deprecated?: boolean;
  deprecationDate?: string;
  replacedBy?: string;
}

export interface WebhookPayload {
  event: string;
  version: string;
  timestamp: string;
  data: Record<string, unknown>;
  metadata?: {
    correlation_id?: string;
    idempotency_key?: string;
    retry_count?: number;
  };
}

export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 5,
  initialDelayMs: 1000,
  maxDelayMs: 300000, // 5 minutes
  backoffMultiplier: 2
};

/**
 * Complete webhook event catalog
 */
export const WebhookCatalog = {
  // ATLVS Events
  atlvs: {
    deals: {
      'deal.created': {
        name: 'deal.created',
        description: 'Fired when a new deal is created in the CRM',
        platform: 'atlvs' as const,
        category: 'deals',
        version: '1.0',
        examplePayload: {
          event: 'deal.created',
          version: '1.0',
          timestamp: '2024-01-15T10:30:00Z',
          data: {
            id: 'deal_abc123',
            name: 'Enterprise Contract',
            value: 150000,
            currency: 'USD',
            stage: 'qualification',
            owner_id: 'user_xyz789',
            created_at: '2024-01-15T10:30:00Z'
          }
        }
      },
      'deal.updated': {
        name: 'deal.updated',
        description: 'Fired when a deal is updated',
        platform: 'atlvs' as const,
        category: 'deals',
        version: '1.0',
        examplePayload: {
          event: 'deal.updated',
          version: '1.0',
          timestamp: '2024-01-15T11:00:00Z',
          data: {
            id: 'deal_abc123',
            changes: { stage: { from: 'qualification', to: 'proposal' } }
          }
        }
      },
      'deal.won': {
        name: 'deal.won',
        description: 'Fired when a deal is marked as won',
        platform: 'atlvs' as const,
        category: 'deals',
        version: '1.0'
      },
      'deal.lost': {
        name: 'deal.lost',
        description: 'Fired when a deal is marked as lost',
        platform: 'atlvs' as const,
        category: 'deals',
        version: '1.0'
      }
    },
    finance: {
      'invoice.created': {
        name: 'invoice.created',
        description: 'Fired when a new invoice is generated',
        platform: 'atlvs' as const,
        category: 'finance',
        version: '1.0'
      },
      'invoice.paid': {
        name: 'invoice.paid',
        description: 'Fired when an invoice is marked as paid',
        platform: 'atlvs' as const,
        category: 'finance',
        version: '1.0'
      },
      'expense.submitted': {
        name: 'expense.submitted',
        description: 'Fired when an expense report is submitted',
        platform: 'atlvs' as const,
        category: 'finance',
        version: '1.0'
      },
      'expense.approved': {
        name: 'expense.approved',
        description: 'Fired when an expense is approved',
        platform: 'atlvs' as const,
        category: 'finance',
        version: '1.0'
      }
    },
    assets: {
      'asset.created': {
        name: 'asset.created',
        description: 'Fired when a new asset is added to inventory',
        platform: 'atlvs' as const,
        category: 'assets',
        version: '1.0'
      },
      'asset.maintenance_due': {
        name: 'asset.maintenance_due',
        description: 'Fired when asset maintenance is due',
        platform: 'atlvs' as const,
        category: 'assets',
        version: '1.0'
      },
      'asset.checked_out': {
        name: 'asset.checked_out',
        description: 'Fired when an asset is checked out',
        platform: 'atlvs' as const,
        category: 'assets',
        version: '1.0'
      }
    },
    compliance: {
      'compliance.alert': {
        name: 'compliance.alert',
        description: 'Fired when a compliance issue is detected',
        platform: 'atlvs' as const,
        category: 'compliance',
        version: '1.0'
      },
      'certification.expiring': {
        name: 'certification.expiring',
        description: 'Fired when a certification is about to expire',
        platform: 'atlvs' as const,
        category: 'compliance',
        version: '1.0'
      }
    }
  },

  // COMPVSS Events
  compvss: {
    projects: {
      'project.created': {
        name: 'project.created',
        description: 'Fired when a new production project is created',
        platform: 'compvss' as const,
        category: 'projects',
        version: '1.0'
      },
      'project.status_changed': {
        name: 'project.status_changed',
        description: 'Fired when project status changes',
        platform: 'compvss' as const,
        category: 'projects',
        version: '1.0'
      }
    },
    crew: {
      'crew.assigned': {
        name: 'crew.assigned',
        description: 'Fired when crew member is assigned to a project',
        platform: 'compvss' as const,
        category: 'crew',
        version: '1.0'
      },
      'crew.checked_in': {
        name: 'crew.checked_in',
        description: 'Fired when crew member checks in on site',
        platform: 'compvss' as const,
        category: 'crew',
        version: '1.0'
      },
      'crew.onboarding_complete': {
        name: 'crew.onboarding_complete',
        description: 'Fired when crew onboarding is completed',
        platform: 'compvss' as const,
        category: 'crew',
        version: '1.0'
      }
    },
    inventory: {
      'inventory.low_stock': {
        name: 'inventory.low_stock',
        description: 'Fired when inventory falls below threshold',
        platform: 'compvss' as const,
        category: 'inventory',
        version: '1.0'
      },
      'inventory.synced': {
        name: 'inventory.synced',
        description: 'Fired when inventory sync completes',
        platform: 'compvss' as const,
        category: 'inventory',
        version: '1.0'
      }
    }
  },

  // GVTEWAY Events
  gvteway: {
    tickets: {
      'ticket.purchased': {
        name: 'ticket.purchased',
        description: 'Fired when a ticket is purchased',
        platform: 'gvteway' as const,
        category: 'tickets',
        version: '1.0',
        examplePayload: {
          event: 'ticket.purchased',
          version: '1.0',
          timestamp: '2024-01-15T14:00:00Z',
          data: {
            order_id: 'ord_abc123',
            event_id: 'evt_xyz789',
            tickets: [{ type: 'GA', quantity: 2, price: 75.00 }],
            total: 150.00,
            customer: { id: 'cust_123', email: 'fan@example.com' }
          }
        }
      },
      'ticket.transferred': {
        name: 'ticket.transferred',
        description: 'Fired when a ticket is transferred to another user',
        platform: 'gvteway' as const,
        category: 'tickets',
        version: '1.0'
      },
      'ticket.refunded': {
        name: 'ticket.refunded',
        description: 'Fired when a ticket is refunded',
        platform: 'gvteway' as const,
        category: 'tickets',
        version: '1.0'
      },
      'ticket.escalation': {
        name: 'ticket.escalation',
        description: 'Fired when a support ticket is escalated',
        platform: 'gvteway' as const,
        category: 'tickets',
        version: '1.0'
      }
    },
    events: {
      'event.created': {
        name: 'event.created',
        description: 'Fired when a new event is created',
        platform: 'gvteway' as const,
        category: 'events',
        version: '1.0'
      },
      'event.published': {
        name: 'event.published',
        description: 'Fired when an event goes on sale',
        platform: 'gvteway' as const,
        category: 'events',
        version: '1.0'
      },
      'event.sold_out': {
        name: 'event.sold_out',
        description: 'Fired when an event sells out',
        platform: 'gvteway' as const,
        category: 'events',
        version: '1.0'
      }
    },
    marketing: {
      'campaign.started': {
        name: 'campaign.started',
        description: 'Fired when a marketing campaign starts',
        platform: 'gvteway' as const,
        category: 'marketing',
        version: '1.0'
      },
      'subscriber.added': {
        name: 'subscriber.added',
        description: 'Fired when a new subscriber is added',
        platform: 'gvteway' as const,
        category: 'marketing',
        version: '1.0'
      }
    },
    vip: {
      'vip.upgrade': {
        name: 'vip.upgrade',
        description: 'Fired when a customer upgrades to VIP',
        platform: 'gvteway' as const,
        category: 'vip',
        version: '1.0'
      },
      'vip.concierge_request': {
        name: 'vip.concierge_request',
        description: 'Fired when a VIP concierge request is made',
        platform: 'gvteway' as const,
        category: 'vip',
        version: '1.0'
      }
    }
  }
};

/**
 * Get all events for a platform
 */
export function getEventsByPlatform(platform: 'atlvs' | 'compvss' | 'gvteway'): WebhookEvent[] {
  const platformEvents = WebhookCatalog[platform];
  const events: WebhookEvent[] = [];

  for (const category of Object.values(platformEvents)) {
    for (const event of Object.values(category)) {
      events.push(event as WebhookEvent);
    }
  }

  return events;
}

/**
 * Get all events across all platforms
 */
export function getAllEvents(): WebhookEvent[] {
  return [
    ...getEventsByPlatform('atlvs'),
    ...getEventsByPlatform('compvss'),
    ...getEventsByPlatform('gvteway')
  ];
}
