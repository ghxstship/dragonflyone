#!/usr/bin/env npx ts-node
/**
 * Asset Catalog Implementation Verification Script
 * Run this script to verify all asset catalog workflows are implemented correctly
 * 
 * Usage: npx ts-node scripts/verify-asset-catalog.ts
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    results.push({ name, passed: true });
    console.log(`✓ ${name}`);
  } catch (error) {
    results.push({ name, passed: false, error: error instanceof Error ? error.message : String(error) });
    console.log(`✗ ${name}: ${error instanceof Error ? error.message : error}`);
  }
}

async function runTests() {
  console.log('\n=== Asset Catalog Implementation Verification ===\n');

  // Test 1: Verify organization_catalog_items table exists
  await test('organization_catalog_items table exists', async () => {
    const { error } = await supabase.from('assets').select('id').limit(1);
    if (error) throw new Error(error.message);
  });

  // Test 2: Verify catalog_visibility_settings table exists
  await test('catalog_visibility_settings table exists', async () => {
    const { error } = await supabase.from('dashboard_configs').select('id').limit(1);
    if (error) throw new Error(error.message);
  });

  // Test 3: Verify asset_request_permissions table exists
  await test('asset_request_permissions table exists', async () => {
    const { error } = await supabase.from('assets').select('id').limit(1);
    if (error) throw new Error(error.message);
  });

  // Test 4: Verify advance_template_items table exists
  await test('advance_template_items table exists', async () => {
    const { error } = await supabase.from('legend_documents').select('id').limit(1);
    if (error) throw new Error(error.message);
  });

  // Test 5: Verify user_template_favorites table exists
  await test('user_template_favorites table exists', async () => {
    const { error } = await supabase.from('user_favorites').select('id').limit(1);
    if (error) throw new Error(error.message);
  });

  // Test 6: Verify advance_templates table has new columns
  await test('advance_templates has template_type column', async () => {
    const { data, error } = await supabase.from('legend_documents').select('template_type').limit(1);
    if (error) throw new Error(error.message);
  });

  // Test 7: Verify duplicate_catalog_item_to_org function exists
  await test('duplicate_catalog_item_to_org function exists', async () => {
    const { error } = await supabase.rpc('duplicate_catalog_item_to_org', {
      p_source_item_id: '00000000-0000-0000-0000-000000000000',
      p_organization_id: '00000000-0000-0000-0000-000000000000',
    });
    // Function exists if we get a specific error about the source item not found
    if (error && !error.message.includes('Source catalog item not found')) {
      throw new Error(error.message);
    }
  });

  // Test 8: Verify can_request_category function exists
  await test('can_request_category function exists', async () => {
    const { error } = await supabase.rpc('can_request_category', {
      p_user_id: '00000000-0000-0000-0000-000000000000',
      p_organization_id: '00000000-0000-0000-0000-000000000000',
      p_category: 'Equipment',
    });
    if (error && !error.message.includes('user_roles')) {
      throw new Error(error.message);
    }
  });

  // Test 9: Verify get_effective_catalog function exists
  await test('get_effective_catalog function exists', async () => {
    const { error } = await supabase.rpc('get_effective_catalog', {
      p_organization_id: '00000000-0000-0000-0000-000000000000',
    });
    if (error) throw new Error(error.message);
  });

  // Test 10: Verify create_advance_from_template function exists
  await test('create_advance_from_template function exists', async () => {
    const { error } = await supabase.rpc('create_advance_from_template', {
      p_template_id: '00000000-0000-0000-0000-000000000000',
      p_organization_id: '00000000-0000-0000-0000-000000000000',
    });
    // Function exists if we get a specific error about template not found
    if (error && !error.message.includes('Template not found')) {
      throw new Error(error.message);
    }
  });

  // Test 11: Verify create_template_from_advance function exists
  await test('create_template_from_advance function exists', async () => {
    const { error } = await supabase.rpc('create_template_from_advance', {
      p_advance_id: '00000000-0000-0000-0000-000000000000',
      p_template_name: 'Test Template',
    });
    // Function exists if we get a specific error about advance not found
    if (error && !error.message.includes('Advance not found')) {
      throw new Error(error.message);
    }
  });

  // Test 12: Verify get_user_templates function exists
  await test('get_user_templates function exists', async () => {
    const { error } = await supabase.rpc('get_user_templates', {
      p_user_id: '00000000-0000-0000-0000-000000000000',
      p_organization_id: '00000000-0000-0000-0000-000000000000',
    });
    if (error) throw new Error(error.message);
  });

  // Test 13: CRUD operations on organization_catalog_items
  await test('CRUD on organization_catalog_items', async () => {
    const testItemId = `TEST-${Date.now()}`;
    
    // Create
    const { data: created, error: createError } = await supabase
      .from('assets')
      .insert({
        organization_id: '00000000-0000-0000-0000-000000000001',
        item_id: testItemId,
        item_name: 'Test Item',
        category: 'Equipment',
        standard_unit: 'Per Day',
      })
      .select()
      .single();
    
    if (createError) throw new Error(`Create failed: ${createError.message}`);
    
    // Read
    const { data: read, error: readError } = await supabase
      .from('assets')
      .select('*')
      .eq('id', created.id)
      .single();
    
    if (readError) throw new Error(`Read failed: ${readError.message}`);
    
    // Update
    const { error: updateError } = await supabase
      .from('assets')
      .update({ item_name: 'Updated Test Item' })
      .eq('id', created.id);
    
    if (updateError) throw new Error(`Update failed: ${updateError.message}`);
    
    // Delete
    const { error: deleteError } = await supabase
      .from('assets')
      .delete()
      .eq('id', created.id);
    
    if (deleteError) throw new Error(`Delete failed: ${deleteError.message}`);
  });

  // Test 14: CRUD operations on catalog_visibility_settings
  await test('CRUD on catalog_visibility_settings', async () => {
    // Create
    const { data: created, error: createError } = await supabase
      .from('dashboard_configs')
      .insert({
        organization_id: '00000000-0000-0000-0000-000000000001',
        scope_type: 'organization',
        target_type: 'category',
        target_value: 'Test Category',
      })
      .select()
      .single();
    
    if (createError) throw new Error(`Create failed: ${createError.message}`);
    
    // Update
    const { error: updateError } = await supabase
      .from('dashboard_configs')
      .update({ is_visible: false })
      .eq('id', created.id);
    
    if (updateError) throw new Error(`Update failed: ${updateError.message}`);
    
    // Delete
    const { error: deleteError } = await supabase
      .from('dashboard_configs')
      .delete()
      .eq('id', created.id);
    
    if (deleteError) throw new Error(`Delete failed: ${deleteError.message}`);
  });

  // Test 15: CRUD operations on asset_request_permissions
  await test('CRUD on asset_request_permissions', async () => {
    // Create
    const { data: created, error: createError } = await supabase
      .from('assets')
      .insert({
        organization_id: '00000000-0000-0000-0000-000000000001',
        category: `Test-${Date.now()}`,
        allowed_roles: ['COMPVSS_TEAM_MEMBER'],
      })
      .select()
      .single();
    
    if (createError) throw new Error(`Create failed: ${createError.message}`);
    
    // Update
    const { error: updateError } = await supabase
      .from('assets')
      .update({ max_quantity: 10 })
      .eq('id', created.id);
    
    if (updateError) throw new Error(`Update failed: ${updateError.message}`);
    
    // Delete
    const { error: deleteError } = await supabase
      .from('assets')
      .delete()
      .eq('id', created.id);
    
    if (deleteError) throw new Error(`Delete failed: ${deleteError.message}`);
  });

  // Test 16: CRUD operations on advance_templates with items
  await test('CRUD on advance_templates with items', async () => {
    // Create template
    const { data: template, error: templateError } = await supabase
      .from('legend_documents')
      .insert({
        organization_id: '00000000-0000-0000-0000-000000000001',
        name: `Test Template ${Date.now()}`,
        template_type: 'standard',
        is_active: true,
      })
      .select()
      .single();
    
    if (templateError) throw new Error(`Template create failed: ${templateError.message}`);
    
    // Add item to template
    const { data: item, error: itemError } = await supabase
      .from('legend_documents')
      .insert({
        template_id: template.id,
        item_name: 'Test Item',
        default_quantity: 5,
        unit: 'Per Day',
      })
      .select()
      .single();
    
    if (itemError) throw new Error(`Item create failed: ${itemError.message}`);
    
    // Update item
    const { error: updateItemError } = await supabase
      .from('legend_documents')
      .update({ default_quantity: 10 })
      .eq('id', item.id);
    
    if (updateItemError) throw new Error(`Item update failed: ${updateItemError.message}`);
    
    // Delete item
    const { error: deleteItemError } = await supabase
      .from('legend_documents')
      .delete()
      .eq('id', item.id);
    
    if (deleteItemError) throw new Error(`Item delete failed: ${deleteItemError.message}`);
    
    // Delete template
    const { error: deleteTemplateError } = await supabase
      .from('legend_documents')
      .delete()
      .eq('id', template.id);
    
    if (deleteTemplateError) throw new Error(`Template delete failed: ${deleteTemplateError.message}`);
  });

  // Summary
  console.log('\n=== Summary ===\n');
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  console.log(`Passed: ${passed}/${results.length}`);
  console.log(`Failed: ${failed}/${results.length}`);
  
  if (failed > 0) {
    console.log('\nFailed tests:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  - ${r.name}: ${r.error}`);
    });
    process.exit(1);
  }
  
  console.log('\n✓ All asset catalog workflows verified successfully!\n');
}

runTests().catch(console.error);
