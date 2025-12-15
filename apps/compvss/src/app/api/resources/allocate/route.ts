export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase';
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';

const allocateResourcesSchema = z.object({
  project_id: z.string().uuid(),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  crew_requirements: z.array(z.object({
    role: z.string(),
    count: z.number().int().positive(),
    skills: z.array(z.string()).optional(),
  })).optional(),
  equipment_requirements: z.array(z.object({
    type: z.string(),
    quantity: z.number().int().positive(),
  })).optional(),
  auto_assign: z.boolean().default(false),
});

export const POST = apiRoute(
  async (request: NextRequest, context: Record<string, unknown>) => {
    const body = await request.json();
    const data = allocateResourcesSchema.parse(body);
    const userId = (context.user as { id?: string })?.id;

    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('id, name, status')
      .eq('id', data.project_id)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const conflicts: unknown[] = [];
    const allocations: unknown[] = [];

    // Check crew availability
    if (data.crew_requirements && data.crew_requirements.length > 0) {
      for (const requirement of data.crew_requirements) {
        const { data: availableCrew } = await supabaseAdmin
          .from('crew_members')
          .select('id, full_name, role, skills, status')
          .eq('role', requirement.role)
          .eq('status', 'active');

        const { data: existingAssignments } = await supabaseAdmin
          .from('crew_assignments')
          .select('crew_id, project_id')
          .gte('end_date', data.start_date)
          .lte('start_date', data.end_date);

        const assignedCrewIds = new Set(existingAssignments?.map((a: Record<string, unknown>) => a.crew_id) || []);
        
        const eligibleCrew = (availableCrew || []).filter((crew: Record<string, unknown>) => {
          if (assignedCrewIds.has(crew.id)) return false;
          
          if (requirement.skills && requirement.skills.length > 0) {
            const crewSkills = crew.skills || [];
            return requirement.skills.every(skill => crewSkills.includes(skill));
          }
          
          return true;
        });

        if (eligibleCrew.length < requirement.count) {
          conflicts.push({
            type: 'crew_shortage',
            role: requirement.role,
            required: requirement.count,
            available: eligibleCrew.length,
          });
        }

        if (data.auto_assign && eligibleCrew.length > 0) {
          const toAssign = eligibleCrew.slice(0, requirement.count);
          for (const crew of toAssign) {
            allocations.push({
              resource_type: 'crew',
              resource_id: crew.id,
              resource_name: crew.full_name,
              role: requirement.role,
            });

            if (data.auto_assign) {
              await supabaseAdmin.from('crew_assignments').insert({
                project_id: data.project_id,
                crew_id: crew.id,
                role: requirement.role,
                start_date: data.start_date,
                end_date: data.end_date,
                assigned_by: userId,
              });
            }
          }
        }
      }
    }

    // Check equipment availability
    if (data.equipment_requirements && data.equipment_requirements.length > 0) {
      for (const requirement of data.equipment_requirements) {
        const { data: availableEquipment } = await supabaseAdmin
          .from('assets')
          .select('id, name, type, status')
          .eq('type', requirement.type)
          .eq('status', 'available');

        const { data: existingBookings } = await supabaseAdmin
          .from('asset_assignments')
          .select('asset_id')
          .gte('end_date', data.start_date)
          .lte('start_date', data.end_date);

        const bookingAssetIds = new Set(existingBookings?.map((b: Record<string, unknown>) => b.asset_id) || []);
        
        const eligibleEquipment = (availableEquipment || []).filter((asset: Record<string, unknown>) => !bookingAssetIds.has(asset.id)
        );

        if (eligibleEquipment.length < requirement.quantity) {
          conflicts.push({
            type: 'equipment_shortage',
            equipment_type: requirement.type,
            required: requirement.quantity,
            available: eligibleEquipment.length,
          });
        }

        if (data.auto_assign && eligibleEquipment.length > 0) {
          const toAssign = eligibleEquipment.slice(0, requirement.quantity);
          for (const asset of toAssign) {
            allocations.push({
              resource_type: 'equipment',
              resource_id: asset.id,
              resource_name: asset.name,
              equipment_type: requirement.type,
            });

            if (data.auto_assign) {
              await supabaseAdmin.from('asset_assignments').insert({
                project_id: data.project_id,
                asset_id: asset.id,
                start_date: data.start_date,
                end_date: data.end_date,
                assigned_by: userId,
              });
            }
          }
        }
      }
    }

    return NextResponse.json({
      success: conflicts.length === 0,
      conflicts,
      allocations,
      auto_assigned: data.auto_assign,
      message: conflicts.length === 0
        ? 'All resources allocated successfully'
        : 'Some resources are unavailable',
    });
  },
  {
    auth: true,
    roles: [PlatformRole.COMPVSS_ADMIN, PlatformRole.COMPVSS_TEAM_MEMBER],
    validation: allocateResourcesSchema,
    audit: { action: 'resources:allocate', resource: 'resource_allocation' },
  }
);
