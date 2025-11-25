import type {
  IHookFunctions,
  IWebhookFunctions,
  INodeType,
  INodeTypeDescription,
  IWebhookResponseData,
} from 'n8n-workflow';

export class GhxstshipTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'GHXSTSHIP Trigger',
    name: 'ghxstshipTrigger',
    icon: 'file:ghxstship.svg',
    group: ['trigger'],
    version: 1,
    subtitle: '={{$parameter["event"]}}',
    description: 'Starts workflow when GHXSTSHIP events occur',
    defaults: {
      name: 'GHXSTSHIP Trigger',
    },
    inputs: [],
    outputs: ['main'],
    credentials: [
      {
        name: 'ghxstshipApi',
        required: true
      }
    ],
    webhooks: [
      {
        name: 'default',
        httpMethod: 'POST',
        responseMode: 'onReceived',
        path: 'webhook'
      }
    ],
    properties: [
      {
        displayName: 'Platform',
        name: 'platform',
        type: 'options',
        options: [
          { name: 'ATLVS', value: 'atlvs' },
          { name: 'COMPVSS', value: 'compvss' },
          { name: 'GVTEWAY', value: 'gvteway' }
        ],
        default: 'atlvs',
        description: 'GHXSTSHIP platform to listen for events'
      },
      {
        displayName: 'Event',
        name: 'event',
        type: 'options',
        options: [
          // ATLVS Events
          { name: 'Deal Created', value: 'deal.created' },
          { name: 'Deal Updated', value: 'deal.updated' },
          { name: 'Deal Won', value: 'deal.won' },
          { name: 'Deal Lost', value: 'deal.lost' },
          { name: 'Invoice Created', value: 'invoice.created' },
          { name: 'Invoice Paid', value: 'invoice.paid' },
          { name: 'Expense Submitted', value: 'expense.submitted' },
          { name: 'Expense Approved', value: 'expense.approved' },
          { name: 'Asset Maintenance Due', value: 'asset.maintenance_due' },
          { name: 'Compliance Alert', value: 'compliance.alert' },
          { name: 'Certification Expiring', value: 'certification.expiring' },
          // COMPVSS Events
          { name: 'Project Created', value: 'project.created' },
          { name: 'Project Status Changed', value: 'project.status_changed' },
          { name: 'Crew Assigned', value: 'crew.assigned' },
          { name: 'Crew Checked In', value: 'crew.checked_in' },
          { name: 'Crew Onboarding Complete', value: 'crew.onboarding_complete' },
          { name: 'Inventory Low Stock', value: 'inventory.low_stock' },
          { name: 'Inventory Synced', value: 'inventory.synced' },
          // GVTEWAY Events
          { name: 'Ticket Purchased', value: 'ticket.purchased' },
          { name: 'Ticket Transferred', value: 'ticket.transferred' },
          { name: 'Ticket Refunded', value: 'ticket.refunded' },
          { name: 'Ticket Escalation', value: 'ticket.escalation' },
          { name: 'Event Created', value: 'event.created' },
          { name: 'Event Published', value: 'event.published' },
          { name: 'Event Sold Out', value: 'event.sold_out' },
          { name: 'VIP Upgrade', value: 'vip.upgrade' },
          { name: 'VIP Concierge Request', value: 'vip.concierge_request' }
        ],
        default: 'deal.created',
        description: 'Event to trigger on'
      }
    ]
  };

  webhookMethods = {
    default: {
      async checkExists(this: IHookFunctions): Promise<boolean> {
        const webhookUrl = this.getNodeWebhookUrl('default');
        const platform = this.getNodeParameter('platform') as string;
        const event = this.getNodeParameter('event') as string;

        const baseUrl = `https://api.ghxstship.com/${platform}`;

        try {
          const webhooks = await this.helpers.requestWithAuthentication.call(
            this, 'ghxstshipApi',
            { method: 'GET', url: `${baseUrl}/webhooks`, json: true }
          );

          for (const webhook of webhooks.data || []) {
            if (webhook.url === webhookUrl && webhook.events.includes(event)) {
              const webhookData = this.getWorkflowStaticData('node');
              webhookData.webhookId = webhook.id;
              return true;
            }
          }
          return false;
        } catch {
          return false;
        }
      },

      async create(this: IHookFunctions): Promise<boolean> {
        const webhookUrl = this.getNodeWebhookUrl('default');
        const platform = this.getNodeParameter('platform') as string;
        const event = this.getNodeParameter('event') as string;

        const baseUrl = `https://api.ghxstship.com/${platform}`;

        const body = {
          url: webhookUrl,
          events: [event],
          active: true
        };

        const response = await this.helpers.requestWithAuthentication.call(
          this, 'ghxstshipApi',
          { method: 'POST', url: `${baseUrl}/webhooks`, body, json: true }
        );

        const webhookData = this.getWorkflowStaticData('node');
        webhookData.webhookId = response.id;

        return true;
      },

      async delete(this: IHookFunctions): Promise<boolean> {
        const platform = this.getNodeParameter('platform') as string;
        const webhookData = this.getWorkflowStaticData('node');
        const webhookId = webhookData.webhookId;

        if (!webhookId) return true;

        const baseUrl = `https://api.ghxstship.com/${platform}`;

        try {
          await this.helpers.requestWithAuthentication.call(
            this, 'ghxstshipApi',
            { method: 'DELETE', url: `${baseUrl}/webhooks/${webhookId}`, json: true }
          );
        } catch {
          return false;
        }

        delete webhookData.webhookId;
        return true;
      }
    }
  };

  async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
    const req = this.getRequestObject();
    const body = this.getBodyData();

    // Verify webhook signature
    const signature = req.headers['x-ghxstship-signature'] as string;
    if (!signature) {
      return { workflowData: [[{ json: { error: 'Missing signature' } }]] };
    }

    // Return the webhook payload
    return {
      workflowData: [
        this.helpers.returnJsonArray({
          event: body.event,
          timestamp: body.timestamp,
          data: body.data,
          metadata: body.metadata
        })
      ]
    };
  }
}
