import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';

export class Ghxstship implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'GHXSTSHIP',
    name: 'ghxstship',
    icon: 'file:ghxstship.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Interact with GHXSTSHIP platforms (ATLVS, COMPVSS, GVTEWAY)',
    defaults: {
      name: 'GHXSTSHIP',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'ghxstshipApi',
        required: true,
        displayOptions: {
          show: { authentication: ['apiKey'] }
        }
      },
      {
        name: 'ghxstshipOAuth2',
        required: true,
        displayOptions: {
          show: { authentication: ['oAuth2'] }
        }
      }
    ],
    properties: [
      {
        displayName: 'Authentication',
        name: 'authentication',
        type: 'options',
        options: [
          { name: 'API Key', value: 'apiKey' },
          { name: 'OAuth2', value: 'oAuth2' }
        ],
        default: 'apiKey'
      },
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
        description: 'GHXSTSHIP platform to interact with'
      },
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          { name: 'Deal', value: 'deal' },
          { name: 'Project', value: 'project' },
          { name: 'Event', value: 'event' },
          { name: 'Ticket', value: 'ticket' },
          { name: 'Asset', value: 'asset' },
          { name: 'Crew', value: 'crew' },
          { name: 'Invoice', value: 'invoice' },
          { name: 'Contact', value: 'contact' }
        ],
        default: 'deal'
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: { resource: ['deal', 'project', 'event', 'ticket', 'asset', 'crew', 'invoice', 'contact'] }
        },
        options: [
          { name: 'Create', value: 'create', action: 'Create a record' },
          { name: 'Get', value: 'get', action: 'Get a record' },
          { name: 'Get Many', value: 'getAll', action: 'Get many records' },
          { name: 'Update', value: 'update', action: 'Update a record' },
          { name: 'Delete', value: 'delete', action: 'Delete a record' }
        ],
        default: 'getAll'
      },
      {
        displayName: 'Record ID',
        name: 'recordId',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
          show: { operation: ['get', 'update', 'delete'] }
        },
        description: 'ID of the record'
      },
      {
        displayName: 'Return All',
        name: 'returnAll',
        type: 'boolean',
        default: false,
        displayOptions: {
          show: { operation: ['getAll'] }
        },
        description: 'Whether to return all results or only up to a given limit'
      },
      {
        displayName: 'Limit',
        name: 'limit',
        type: 'number',
        default: 50,
        typeOptions: { minValue: 1, maxValue: 100 },
        displayOptions: {
          show: { operation: ['getAll'], returnAll: [false] }
        },
        description: 'Max number of results to return'
      },
      {
        displayName: 'Additional Fields',
        name: 'additionalFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: {
          show: { operation: ['create', 'update'] }
        },
        options: [
          { displayName: 'Name', name: 'name', type: 'string', default: '' },
          { displayName: 'Status', name: 'status', type: 'string', default: '' },
          { displayName: 'Value', name: 'value', type: 'number', default: 0 },
          { displayName: 'Description', name: 'description', type: 'string', default: '' },
          { displayName: 'Custom Fields', name: 'customFields', type: 'json', default: '{}' }
        ]
      },
      {
        displayName: 'Filters',
        name: 'filters',
        type: 'collection',
        placeholder: 'Add Filter',
        default: {},
        displayOptions: {
          show: { operation: ['getAll'] }
        },
        options: [
          { displayName: 'Status', name: 'status', type: 'string', default: '' },
          { displayName: 'Created After', name: 'createdAfter', type: 'dateTime', default: '' },
          { displayName: 'Created Before', name: 'createdBefore', type: 'dateTime', default: '' },
          { displayName: 'Search', name: 'search', type: 'string', default: '' }
        ]
      }
    ]
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    const platform = this.getNodeParameter('platform', 0) as string;
    const resource = this.getNodeParameter('resource', 0) as string;
    const operation = this.getNodeParameter('operation', 0) as string;

    const baseUrls: Record<string, string> = {
      atlvs: 'https://api.ghxstship.com/atlvs',
      compvss: 'https://api.ghxstship.com/compvss',
      gvteway: 'https://api.ghxstship.com/gvteway'
    };

    const baseUrl = baseUrls[platform];

    for (let i = 0; i < items.length; i++) {
      try {
        let responseData;
        const endpoint = `${baseUrl}/${resource}s`;

        if (operation === 'getAll') {
          const returnAll = this.getNodeParameter('returnAll', i) as boolean;
          const limit = returnAll ? 10000 : (this.getNodeParameter('limit', i) as number);
          const filters = this.getNodeParameter('filters', i, {}) as Record<string, unknown>;

          const qs: Record<string, unknown> = { limit, ...filters };

          responseData = await this.helpers.requestWithAuthentication.call(
            this, 'ghxstshipApi', { method: 'GET', url: endpoint, qs, json: true }
          );
        } else if (operation === 'get') {
          const recordId = this.getNodeParameter('recordId', i) as string;
          responseData = await this.helpers.requestWithAuthentication.call(
            this, 'ghxstshipApi', { method: 'GET', url: `${endpoint}/${recordId}`, json: true }
          );
        } else if (operation === 'create') {
          const additionalFields = this.getNodeParameter('additionalFields', i, {});
          responseData = await this.helpers.requestWithAuthentication.call(
            this, 'ghxstshipApi', { method: 'POST', url: endpoint, body: additionalFields, json: true }
          );
        } else if (operation === 'update') {
          const recordId = this.getNodeParameter('recordId', i) as string;
          const additionalFields = this.getNodeParameter('additionalFields', i, {});
          responseData = await this.helpers.requestWithAuthentication.call(
            this, 'ghxstshipApi', { method: 'PATCH', url: `${endpoint}/${recordId}`, body: additionalFields, json: true }
          );
        } else if (operation === 'delete') {
          const recordId = this.getNodeParameter('recordId', i) as string;
          responseData = await this.helpers.requestWithAuthentication.call(
            this, 'ghxstshipApi', { method: 'DELETE', url: `${endpoint}/${recordId}`, json: true }
          );
        }

        const executionData = this.helpers.constructExecutionMetaData(
          this.helpers.returnJsonArray(responseData),
          { itemData: { item: i } }
        );
        returnData.push(...executionData);
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({ json: { error: (error as Error).message }, pairedItem: { item: i } });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}
