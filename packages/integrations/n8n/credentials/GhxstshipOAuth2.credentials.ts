import type { ICredentialType, INodeProperties } from 'n8n-workflow';

export class GhxstshipOAuth2 implements ICredentialType {
  name = 'ghxstshipOAuth2';
  displayName = 'GHXSTSHIP OAuth2';
  documentationUrl = 'https://docs.ghxstship.com/api/oauth2';
  extends = ['oAuth2Api'];

  properties: INodeProperties[] = [
    {
      displayName: 'Grant Type',
      name: 'grantType',
      type: 'hidden',
      default: 'authorizationCode'
    },
    {
      displayName: 'Authorization URL',
      name: 'authUrl',
      type: 'hidden',
      default: 'https://auth.ghxstship.com/oauth/authorize'
    },
    {
      displayName: 'Access Token URL',
      name: 'accessTokenUrl',
      type: 'hidden',
      default: 'https://auth.ghxstship.com/oauth/token'
    },
    {
      displayName: 'Scope',
      name: 'scope',
      type: 'string',
      default: 'read write webhooks',
      description: 'OAuth scopes to request (space-separated)'
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
    },
    {
      displayName: 'Authentication',
      name: 'authentication',
      type: 'hidden',
      default: 'header'
    }
  ];
}
