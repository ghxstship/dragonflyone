import type { ICredentialType, INodeProperties } from 'n8n-workflow';

export class GhxstshipApi implements ICredentialType {
  name = 'ghxstshipApi';
  displayName = 'GHXSTSHIP API';
  documentationUrl = 'https://docs.ghxstship.com/api/authentication';
  
  properties: INodeProperties[] = [
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: { password: true },
      default: '',
      required: true,
      description: 'Your GHXSTSHIP API key from the Developer Portal'
    },
    {
      displayName: 'Environment',
      name: 'environment',
      type: 'options',
      options: [
        { name: 'Production', value: 'production' },
        { name: 'Staging', value: 'staging' },
        { name: 'Development', value: 'development' }
      ],
      default: 'production',
      description: 'API environment to connect to'
    },
    {
      displayName: 'Platform',
      name: 'platform',
      type: 'options',
      options: [
        { name: 'ATLVS (Business Operations)', value: 'atlvs' },
        { name: 'COMPVSS (Production Operations)', value: 'compvss' },
        { name: 'GVTEWAY (Consumer Experience)', value: 'gvteway' }
      ],
      default: 'atlvs',
      description: 'GHXSTSHIP platform to connect to'
    },
    {
      displayName: 'Workspace ID',
      name: 'workspaceId',
      type: 'string',
      default: '',
      required: true,
      description: 'Your GHXSTSHIP workspace ID'
    }
  ];

  authenticate = {
    type: 'generic' as const,
    properties: {
      headers: {
        Authorization: '=Bearer {{$credentials.apiKey}}',
        'X-Workspace-ID': '={{$credentials.workspaceId}}',
        'X-Platform': '={{$credentials.platform}}'
      }
    }
  };
}
