/**
 * OAuth 2.0 + SCIM-friendly provisioning for Zapier integration
 * Implements Zapier's authentication requirements for certified apps
 */

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  authorizationUrl: string;
  tokenUrl: string;
  refreshUrl: string;
  scopes: string[];
  redirectUri: string;
}

export interface SCIMUser {
  id: string;
  userName: string;
  name: {
    givenName: string;
    familyName: string;
  };
  emails: Array<{ value: string; primary: boolean }>;
  active: boolean;
  groups: string[];
  meta: {
    resourceType: string;
    created: string;
    lastModified: string;
  };
}

export interface ZapierAuthConfig {
  type: 'oauth2';
  oauth2Config: {
    authorizeUrl: string;
    getAccessToken: {
      url: string;
      method: 'POST';
      body: Record<string, string>;
    };
    refreshAccessToken: {
      url: string;
      method: 'POST';
      body: Record<string, string>;
    };
    scope: string;
    autoRefresh: boolean;
  };
  test: {
    url: string;
    method: 'GET';
  };
  connectionLabel: string;
}

/**
 * Generate Zapier-compatible OAuth2 configuration
 */
export function generateZapierOAuthConfig(platform: 'atlvs' | 'compvss' | 'gvteway'): ZapierAuthConfig {
  const baseUrl = `https://auth.ghxstship.com`;
  const apiUrl = `https://api.ghxstship.com/${platform}/v1`;

  return {
    type: 'oauth2',
    oauth2Config: {
      authorizeUrl: `${baseUrl}/oauth/authorize`,
      getAccessToken: {
        url: `${baseUrl}/oauth/token`,
        method: 'POST',
        body: {
          grant_type: 'authorization_code',
          code: '{{bundle.inputData.code}}',
          client_id: '{{process.env.CLIENT_ID}}',
          client_secret: '{{process.env.CLIENT_SECRET}}',
          redirect_uri: '{{bundle.inputData.redirect_uri}}'
        }
      },
      refreshAccessToken: {
        url: `${baseUrl}/oauth/token`,
        method: 'POST',
        body: {
          grant_type: 'refresh_token',
          refresh_token: '{{bundle.authData.refresh_token}}',
          client_id: '{{process.env.CLIENT_ID}}',
          client_secret: '{{process.env.CLIENT_SECRET}}'
        }
      },
      scope: 'read write webhooks',
      autoRefresh: true
    },
    test: {
      url: `${apiUrl}/me`,
      method: 'GET'
    },
    connectionLabel: '{{bundle.authData.workspace_name}} ({{bundle.authData.user_email}})'
  };
}

/**
 * SCIM 2.0 User provisioning endpoints
 */
export const scimEndpoints = {
  users: {
    list: {
      method: 'GET',
      path: '/scim/v2/Users',
      description: 'List all users with pagination',
      queryParams: ['startIndex', 'count', 'filter'],
      response: {
        schemas: ['urn:ietf:params:scim:api:messages:2.0:ListResponse'],
        totalResults: 'number',
        startIndex: 'number',
        itemsPerPage: 'number',
        Resources: 'SCIMUser[]'
      }
    },
    get: {
      method: 'GET',
      path: '/scim/v2/Users/:id',
      description: 'Get a specific user',
      response: 'SCIMUser'
    },
    create: {
      method: 'POST',
      path: '/scim/v2/Users',
      description: 'Create a new user',
      body: 'SCIMUser',
      response: 'SCIMUser'
    },
    update: {
      method: 'PUT',
      path: '/scim/v2/Users/:id',
      description: 'Replace a user',
      body: 'SCIMUser',
      response: 'SCIMUser'
    },
    patch: {
      method: 'PATCH',
      path: '/scim/v2/Users/:id',
      description: 'Update specific user attributes',
      body: {
        schemas: ['urn:ietf:params:scim:api:messages:2.0:PatchOp'],
        Operations: 'PatchOperation[]'
      },
      response: 'SCIMUser'
    },
    delete: {
      method: 'DELETE',
      path: '/scim/v2/Users/:id',
      description: 'Deactivate a user',
      response: 204
    }
  },
  groups: {
    list: {
      method: 'GET',
      path: '/scim/v2/Groups',
      description: 'List all groups'
    },
    get: {
      method: 'GET',
      path: '/scim/v2/Groups/:id',
      description: 'Get a specific group'
    },
    create: {
      method: 'POST',
      path: '/scim/v2/Groups',
      description: 'Create a new group'
    },
    patch: {
      method: 'PATCH',
      path: '/scim/v2/Groups/:id',
      description: 'Update group membership'
    }
  }
};

/**
 * Token validation and refresh logic
 */
export async function validateAndRefreshToken(
  accessToken: string,
  refreshToken: string,
  config: OAuthConfig
): Promise<{ accessToken: string; refreshToken: string; expiresAt: Date } | null> {
  // First, try to validate the current token
  try {
    const response = await fetch(`${config.authorizationUrl.replace('/authorize', '')}/userinfo`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (response.ok) {
      // Token is still valid
      return null;
    }
  } catch {
    // Token validation failed, try to refresh
  }

  // Refresh the token
  try {
    const response = await fetch(config.refreshUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: config.clientId,
        client_secret: config.clientSecret
      })
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken,
      expiresAt: new Date(Date.now() + data.expires_in * 1000)
    };
  } catch (error) {
    console.error('Token refresh error:', error);
    return null;
  }
}

/**
 * Workspace provisioning for new Zapier connections
 */
export async function provisionWorkspace(
  userId: string,
  workspaceName: string,
  platform: 'atlvs' | 'compvss' | 'gvteway'
): Promise<{ workspaceId: string; apiKey: string }> {
  // This would be implemented with actual Supabase calls
  const workspaceId = `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const apiKey = `sk_${platform}_${Math.random().toString(36).substr(2, 32)}`;

  return { workspaceId, apiKey };
}

/**
 * Connection test for Zapier
 */
export async function testConnection(
  accessToken: string,
  platform: 'atlvs' | 'compvss' | 'gvteway'
): Promise<{ success: boolean; user?: { id: string; email: string; workspace: string } }> {
  try {
    const response = await fetch(`https://api.ghxstship.com/${platform}/v1/me`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!response.ok) {
      return { success: false };
    }

    const user = await response.json();
    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        workspace: user.workspace_name
      }
    };
  } catch {
    return { success: false };
  }
}
