'use client';

import { useState } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Input,
  Select,
  Button,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Badge,
  Pagination,
  EmptyState,
  Spinner,
  H3,
  Body,
} from '@ghxstship/ui';
import { useAdvanceTemplates, useCreateAdvanceFromTemplate, useAuthContext, PlatformRole } from '@ghxstship/config';
import type { AdvanceTemplateListItem, TemplateFilters } from '@ghxstship/config';

const ADMIN_ROLES = [
  PlatformRole.COMPVSS_ADMIN,
  PlatformRole.LEGEND_SUPER_ADMIN,
  PlatformRole.LEGEND_ADMIN,
  PlatformRole.LEGEND_DEVELOPER,
];

interface TemplateBrowserProps {
  onSelectTemplate?: (advanceId: string) => void;
  projectId?: string;
  organizationId?: string;
}

export function TemplateBrowser({ onSelectTemplate, projectId, organizationId }: TemplateBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const { hasRole } = useAuthContext();
  
  // RBAC: Check if user has admin access
  const canManageTemplates = ADMIN_ROLES.some(role => hasRole(role));

  const filters: TemplateFilters = {
    search: searchQuery || undefined,
    category: selectedCategory || undefined,
    template_type: selectedType as TemplateFilters['template_type'] || undefined,
    limit: itemsPerPage,
    offset: (currentPage - 1) * itemsPerPage,
  };

  const { data: templatesData, isLoading } = useAdvanceTemplates(filters);
  const createFromTemplate = useCreateAdvanceFromTemplate();

  const templates = templatesData?.data || [];
  const totalCount = templatesData?.count || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const handleUseTemplate = async (template: AdvanceTemplateListItem) => {
    if (!organizationId) {
      return;
    }

    try {
      const result = await createFromTemplate.mutateAsync({
        templateId: template.id,
        projectId,
      });
      onSelectTemplate?.(result.advanceId);
    } catch {
      // Error handled by React Query
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <H3>Advance Templates</H3>
        <Body>Reusable templates for quick advance creation</Body>
      </CardHeader>

      <CardBody>
        <div className="flex flex-col gap-md sm:flex-row">
          <Input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />

          <Select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Categories</option>
            <option value="production">Production</option>
            <option value="catering">Catering</option>
            <option value="equipment">Equipment</option>
            <option value="supplies">Supplies</option>
            <option value="services">Services</option>
          </Select>

          <Select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Types</option>
            <option value="reorder">Reorder</option>
            <option value="standard">Standard</option>
            <option value="emergency">Emergency</option>
            <option value="event_specific">Event Specific</option>
            <option value="department">Department</option>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-lg">
            <Spinner variant="grey" />
          </div>
        ) : templates.length === 0 ? (
          <EmptyState
            title="No templates found"
            description="Try adjusting your search or filters"
          />
        ) : (
          <>
            <Table variant="dark">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Est. Cost</TableHead>
                  <TableHead>Used</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template: AdvanceTemplateListItem) => (
                  <TableRow key={template.id}>
                    <TableCell>
                      <div>
                        <Body>{template.name}</Body>
                        {template.description && (
                          <Body className="text-on-dark-muted">{template.description}</Body>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {template.category ? (
                        <Badge>{template.category}</Badge>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{template.template_type}</Badge>
                    </TableCell>
                    <TableCell>{template.item_count}</TableCell>
                    <TableCell>{formatCurrency(template.estimated_cost)}</TableCell>
                    <TableCell>{template.usage_count}x</TableCell>
                    <TableCell>
                      {canManageTemplates && (
                        <Button
                          size="sm"
                          variant="solid"
                          onClick={() => handleUseTemplate(template)}
                          disabled={createFromTemplate.isPending}
                        >
                          {createFromTemplate.isPending ? 'Creating...' : 'Use'}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}
      </CardBody>
    </Card>
  );
}
