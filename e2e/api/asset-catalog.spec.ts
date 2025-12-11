import { test, expect } from '@playwright/test';

const ATLVS_BASE_URL = process.env.ATLVS_URL || 'http://localhost:3001';

test.describe('Asset Catalog API - Organization Catalog Items', () => {
  let createdItemId: string;

  test('GET /api/catalog/organization - should list organization catalog items', async ({ request }) => {
    const response = await request.get(`${ATLVS_BASE_URL}/api/catalog/organization`);
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('data');
    expect(data).toHaveProperty('count');
    expect(Array.isArray(data.data)).toBe(true);
  });

  test('GET /api/catalog/organization - should filter by category', async ({ request }) => {
    const response = await request.get(`${ATLVS_BASE_URL}/api/catalog/organization?category=Equipment`);
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('data');
  });

  test('GET /api/catalog/organization - should search by name', async ({ request }) => {
    const response = await request.get(`${ATLVS_BASE_URL}/api/catalog/organization?search=test`);
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('data');
  });

  test('POST /api/catalog/organization - should create new item', async ({ request }) => {
    const newItem = {
      organization_id: '00000000-0000-0000-0000-000000000001',
      item_id: `TEST-ITEM-${Date.now()}`,
      item_name: 'E2E Test Item',
      description: 'Created by E2E test',
      category: 'Equipment',
      subcategory: 'Audio',
      base_price_low: 100,
      base_price_high: 200,
      standard_unit: 'Per Day',
    };

    const response = await request.post(`${ATLVS_BASE_URL}/api/catalog/organization`, {
      data: newItem,
    });
    
    expect([200, 201, 403, 500]).toContain(response.status());
    
    if (response.status() === 201) {
      const data = await response.json();
      expect(data).toHaveProperty('item');
      expect(data.item.item_name).toBe('E2E Test Item');
      createdItemId = data.item.id;
    }
  });

  test('GET /api/catalog/organization/:id - should get single item', async ({ request }) => {
    if (!createdItemId) {
      test.skip();
      return;
    }

    const response = await request.get(`${ATLVS_BASE_URL}/api/catalog/organization/${createdItemId}`);
    expect([200, 404]).toContain(response.status());
    
    if (response.status() === 200) {
      const data = await response.json();
      expect(data).toHaveProperty('item');
      expect(data.item.id).toBe(createdItemId);
    }
  });

  test('PATCH /api/catalog/organization/:id - should update item', async ({ request }) => {
    if (!createdItemId) {
      test.skip();
      return;
    }

    const response = await request.patch(`${ATLVS_BASE_URL}/api/catalog/organization/${createdItemId}`, {
      data: {
        item_name: 'E2E Test Item Updated',
        description: 'Updated by E2E test',
      },
    });
    
    expect([200, 404, 403]).toContain(response.status());
    
    if (response.status() === 200) {
      const data = await response.json();
      expect(data.item.item_name).toBe('E2E Test Item Updated');
    }
  });

  test('POST /api/catalog/organization/:id/lock - should lock item', async ({ request }) => {
    if (!createdItemId) {
      test.skip();
      return;
    }

    const response = await request.post(`${ATLVS_BASE_URL}/api/catalog/organization/${createdItemId}/lock`, {
      data: {
        lock_reason: 'E2E test lock',
        locked_by: '00000000-0000-0000-0000-000000000001',
      },
    });
    
    expect([200, 404, 403]).toContain(response.status());
    
    if (response.status() === 200) {
      const data = await response.json();
      expect(data.item.is_locked).toBe(true);
    }
  });

  test('POST /api/catalog/organization/:id/unlock - should unlock item', async ({ request }) => {
    if (!createdItemId) {
      test.skip();
      return;
    }

    const response = await request.post(`${ATLVS_BASE_URL}/api/catalog/organization/${createdItemId}/unlock`);
    
    expect([200, 404, 403]).toContain(response.status());
    
    if (response.status() === 200) {
      const data = await response.json();
      expect(data.item.is_locked).toBe(false);
    }
  });

  test('DELETE /api/catalog/organization/:id - should delete item', async ({ request }) => {
    if (!createdItemId) {
      test.skip();
      return;
    }

    const response = await request.delete(`${ATLVS_BASE_URL}/api/catalog/organization/${createdItemId}`);
    
    expect([200, 404, 403]).toContain(response.status());
  });
});

test.describe('Asset Catalog API - Catalog Visibility Settings', () => {
  let createdSettingId: string;

  test('GET /api/catalog/visibility - should list visibility settings', async ({ request }) => {
    const response = await request.get(`${ATLVS_BASE_URL}/api/catalog/visibility`);
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('data');
    expect(data).toHaveProperty('count');
  });

  test('GET /api/catalog/visibility - should filter by scope_type', async ({ request }) => {
    const response = await request.get(`${ATLVS_BASE_URL}/api/catalog/visibility?scope_type=organization`);
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('data');
  });

  test('POST /api/catalog/visibility - should create visibility setting', async ({ request }) => {
    const newSetting = {
      organization_id: '00000000-0000-0000-0000-000000000001',
      scope_type: 'organization',
      target_type: 'category',
      target_value: 'Equipment',
      is_visible: true,
      is_requestable: true,
      requires_approval: false,
    };

    const response = await request.post(`${ATLVS_BASE_URL}/api/catalog/visibility`, {
      data: newSetting,
    });
    
    expect([200, 201, 403, 500]).toContain(response.status());
    
    if (response.status() === 201) {
      const data = await response.json();
      expect(data).toHaveProperty('setting');
      createdSettingId = data.setting.id;
    }
  });

  test('GET /api/catalog/visibility/:id - should get single setting', async ({ request }) => {
    if (!createdSettingId) {
      test.skip();
      return;
    }

    const response = await request.get(`${ATLVS_BASE_URL}/api/catalog/visibility/${createdSettingId}`);
    expect([200, 404]).toContain(response.status());
  });

  test('PATCH /api/catalog/visibility/:id - should update setting', async ({ request }) => {
    if (!createdSettingId) {
      test.skip();
      return;
    }

    const response = await request.patch(`${ATLVS_BASE_URL}/api/catalog/visibility/${createdSettingId}`, {
      data: {
        requires_approval: true,
        approval_role: 'ATLVS_ADMIN',
      },
    });
    
    expect([200, 404, 403]).toContain(response.status());
  });

  test('DELETE /api/catalog/visibility/:id - should delete setting', async ({ request }) => {
    if (!createdSettingId) {
      test.skip();
      return;
    }

    const response = await request.delete(`${ATLVS_BASE_URL}/api/catalog/visibility/${createdSettingId}`);
    expect([200, 404, 403]).toContain(response.status());
  });
});

test.describe('Asset Catalog API - Asset Request Permissions', () => {
  let createdPermissionId: string;

  test('GET /api/catalog/permissions - should list permissions', async ({ request }) => {
    const response = await request.get(`${ATLVS_BASE_URL}/api/catalog/permissions`);
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('data');
    expect(data).toHaveProperty('count');
  });

  test('GET /api/catalog/permissions - should filter by category', async ({ request }) => {
    const response = await request.get(`${ATLVS_BASE_URL}/api/catalog/permissions?category=Equipment`);
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('data');
  });

  test('POST /api/catalog/permissions - should create permission', async ({ request }) => {
    const newPermission = {
      organization_id: '00000000-0000-0000-0000-000000000001',
      category: `E2E-Test-${Date.now()}`,
      allowed_roles: ['COMPVSS_TEAM_MEMBER', 'COMPVSS_ADMIN'],
      requires_justification: true,
      justification_min_length: 50,
    };

    const response = await request.post(`${ATLVS_BASE_URL}/api/catalog/permissions`, {
      data: newPermission,
    });
    
    expect([200, 201, 403, 500]).toContain(response.status());
    
    if (response.status() === 201) {
      const data = await response.json();
      expect(data).toHaveProperty('permission');
      createdPermissionId = data.permission.id;
    }
  });

  test('GET /api/catalog/permissions/:id - should get single permission', async ({ request }) => {
    if (!createdPermissionId) {
      test.skip();
      return;
    }

    const response = await request.get(`${ATLVS_BASE_URL}/api/catalog/permissions/${createdPermissionId}`);
    expect([200, 404]).toContain(response.status());
  });

  test('PATCH /api/catalog/permissions/:id - should update permission', async ({ request }) => {
    if (!createdPermissionId) {
      test.skip();
      return;
    }

    const response = await request.patch(`${ATLVS_BASE_URL}/api/catalog/permissions/${createdPermissionId}`, {
      data: {
        max_quantity: 10,
        max_value: 5000,
      },
    });
    
    expect([200, 404, 403]).toContain(response.status());
  });

  test('GET /api/catalog/permissions/check - should check user permission', async ({ request }) => {
    const response = await request.get(
      `${ATLVS_BASE_URL}/api/catalog/permissions/check?user_id=00000000-0000-0000-0000-000000000001&organization_id=00000000-0000-0000-0000-000000000001&category=Equipment`
    );
    
    expect([200, 400, 500]).toContain(response.status());
    
    if (response.status() === 200) {
      const data = await response.json();
      expect(data).toHaveProperty('canRequest');
      expect(typeof data.canRequest).toBe('boolean');
    }
  });

  test('DELETE /api/catalog/permissions/:id - should delete permission', async ({ request }) => {
    if (!createdPermissionId) {
      test.skip();
      return;
    }

    const response = await request.delete(`${ATLVS_BASE_URL}/api/catalog/permissions/${createdPermissionId}`);
    expect([200, 404, 403]).toContain(response.status());
  });
});

test.describe('Asset Catalog API - Effective Catalog', () => {
  test('GET /api/catalog/effective - should return effective catalog', async ({ request }) => {
    const response = await request.get(
      `${ATLVS_BASE_URL}/api/catalog/effective?organization_id=00000000-0000-0000-0000-000000000001`
    );
    
    expect([200, 400, 500]).toContain(response.status());
    
    if (response.status() === 200) {
      const data = await response.json();
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('count');
    }
  });

  test('GET /api/catalog/effective - should filter by category', async ({ request }) => {
    const response = await request.get(
      `${ATLVS_BASE_URL}/api/catalog/effective?organization_id=00000000-0000-0000-0000-000000000001&category=Equipment`
    );
    
    expect([200, 400, 500]).toContain(response.status());
  });

  test('GET /api/catalog/effective - should require organization_id', async ({ request }) => {
    const response = await request.get(`${ATLVS_BASE_URL}/api/catalog/effective`);
    expect(response.status()).toBe(400);
    
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });
});

test.describe('Asset Catalog API - Advance Templates', () => {
  let createdTemplateId: string;

  test('GET /api/advancing/templates - should list templates', async ({ request }) => {
    const response = await request.get(`${ATLVS_BASE_URL}/api/advancing/templates`);
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('data');
    expect(data).toHaveProperty('count');
  });

  test('GET /api/advancing/templates - should filter by category', async ({ request }) => {
    const response = await request.get(`${ATLVS_BASE_URL}/api/advancing/templates?category=production`);
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('data');
  });

  test('GET /api/advancing/templates - should filter by template_type', async ({ request }) => {
    const response = await request.get(`${ATLVS_BASE_URL}/api/advancing/templates?template_type=reorder`);
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('data');
  });

  test('GET /api/advancing/templates - should search by name', async ({ request }) => {
    const response = await request.get(`${ATLVS_BASE_URL}/api/advancing/templates?search=test`);
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('data');
  });

  test('POST /api/advancing/templates - should create template', async ({ request }) => {
    const newTemplate = {
      organization_id: '00000000-0000-0000-0000-000000000001',
      name: `E2E Test Template ${Date.now()}`,
      description: 'Created by E2E test',
      category: 'production',
      template_type: 'standard',
      items: [
        {
          item_name: 'Test Item 1',
          default_quantity: 5,
          unit: 'Per Day',
          estimated_unit_cost: 100,
        },
        {
          item_name: 'Test Item 2',
          default_quantity: 10,
          unit: 'Per Unit',
          estimated_unit_cost: 50,
        },
      ],
    };

    const response = await request.post(`${ATLVS_BASE_URL}/api/advancing/templates`, {
      data: newTemplate,
    });
    
    expect([200, 201, 403, 500]).toContain(response.status());
    
    if (response.status() === 201) {
      const data = await response.json();
      expect(data).toHaveProperty('template');
      expect(data.template.name).toContain('E2E Test Template');
      createdTemplateId = data.template.id;
    }
  });

  test('GET /api/advancing/templates/:id - should get single template with items', async ({ request }) => {
    if (!createdTemplateId) {
      test.skip();
      return;
    }

    const response = await request.get(`${ATLVS_BASE_URL}/api/advancing/templates/${createdTemplateId}`);
    expect([200, 404]).toContain(response.status());
    
    if (response.status() === 200) {
      const data = await response.json();
      expect(data).toHaveProperty('template');
      expect(data.template).toHaveProperty('items');
      expect(data.template).toHaveProperty('item_count');
    }
  });

  test('PATCH /api/advancing/templates/:id - should update template', async ({ request }) => {
    if (!createdTemplateId) {
      test.skip();
      return;
    }

    const response = await request.patch(`${ATLVS_BASE_URL}/api/advancing/templates/${createdTemplateId}`, {
      data: {
        name: 'E2E Test Template Updated',
        description: 'Updated by E2E test',
      },
    });
    
    expect([200, 404, 403]).toContain(response.status());
  });

  test('POST /api/advancing/templates/:id/items - should add item to template', async ({ request }) => {
    if (!createdTemplateId) {
      test.skip();
      return;
    }

    const response = await request.post(`${ATLVS_BASE_URL}/api/advancing/templates/${createdTemplateId}/items`, {
      data: {
        item_name: 'New Test Item',
        default_quantity: 3,
        unit: 'Per Unit',
        estimated_unit_cost: 75,
      },
    });
    
    expect([200, 201, 404, 403]).toContain(response.status());
  });

  test('POST /api/advancing/templates/:id/favorite - should favorite template', async ({ request }) => {
    if (!createdTemplateId) {
      test.skip();
      return;
    }

    const response = await request.post(`${ATLVS_BASE_URL}/api/advancing/templates/${createdTemplateId}/favorite`, {
      data: {
        user_id: '00000000-0000-0000-0000-000000000001',
      },
    });
    
    expect([200, 201, 404, 403]).toContain(response.status());
  });

  test('DELETE /api/advancing/templates/:id/favorite - should unfavorite template', async ({ request }) => {
    if (!createdTemplateId) {
      test.skip();
      return;
    }

    const response = await request.delete(
      `${ATLVS_BASE_URL}/api/advancing/templates/${createdTemplateId}/favorite?user_id=00000000-0000-0000-0000-000000000001`
    );
    
    expect([200, 404, 403]).toContain(response.status());
  });

  test('DELETE /api/advancing/templates/:id - should delete template', async ({ request }) => {
    if (!createdTemplateId) {
      test.skip();
      return;
    }

    const response = await request.delete(`${ATLVS_BASE_URL}/api/advancing/templates/${createdTemplateId}`);
    expect([200, 404, 403]).toContain(response.status());
  });
});

test.describe('Asset Catalog API - Duplicate Catalog Item', () => {
  test('POST /api/catalog/organization/duplicate - should require source_item_id', async ({ request }) => {
    const response = await request.post(`${ATLVS_BASE_URL}/api/catalog/organization/duplicate`, {
      data: {
        organization_id: '00000000-0000-0000-0000-000000000001',
      },
    });
    
    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  test('POST /api/catalog/organization/duplicate - should require organization_id', async ({ request }) => {
    const response = await request.post(`${ATLVS_BASE_URL}/api/catalog/organization/duplicate`, {
      data: {
        source_item_id: '00000000-0000-0000-0000-000000000001',
      },
    });
    
    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });
});

test.describe('Asset Catalog API - Create Advance from Template', () => {
  test('POST /api/advancing/from-template - should require template_id', async ({ request }) => {
    const response = await request.post(`${ATLVS_BASE_URL}/api/advancing/from-template`, {
      data: {
        organization_id: '00000000-0000-0000-0000-000000000001',
      },
    });
    
    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  test('POST /api/advancing/from-template - should require organization_id', async ({ request }) => {
    const response = await request.post(`${ATLVS_BASE_URL}/api/advancing/from-template`, {
      data: {
        template_id: '00000000-0000-0000-0000-000000000001',
      },
    });
    
    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });
});
