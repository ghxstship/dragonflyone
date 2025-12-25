'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, FileText, Edit2, Trash2, Copy, Check } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Body,
  Box,
  Button,
  Card,
  Container,
  EmptyState,
  EnterprisePageHeader,
  Form,
  Grid,
  H3,
  Input,
  Label,
  MainContent,
  Modal,
  Select,
  Skeleton,
  Stack,
  Text,
  Textarea,
} from '@ghxstship/ui';

interface BEOTemplate {
  id: string;
  name: string;
  description?: string;
  event_type: string;
  sections: {
    timeline: Array<{ time: string; description: string; department?: string }>;
    room_setup: { layout: string; notes?: string };
    catering: { menu_items: Array<{ name: string; quantity: number }> };
    av_requirements: Array<{ item: string; quantity: number }>;
  };
  is_default: boolean;
  usage_count: number;
  created_at: string;
}

export default function BEOTemplatesPage() {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['beo-templates'],
    queryFn: async () => {
      const response = await fetch('/api/beo-templates');
      if (!response.ok) {
        return { templates: [] };
      }
      return response.json();
    },
  });

  const templates: BEOTemplate[] = data?.templates || [];

  const createTemplate = useMutation({
    mutationFn: async (template: Partial<BEOTemplate>) => {
      const response = await fetch('/api/beo-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template),
      });
      if (!response.ok) throw new Error('Failed to create template');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beo-templates'] });
      setShowAddModal(false);
    },
  });

  const deleteTemplate = useMutation({
    mutationFn: async (templateId: string) => {
      const response = await fetch(`/api/beo-templates/${templateId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete template');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beo-templates'] });
    },
  });

  if (isLoading) {
    return (
      <>
        <EnterprisePageHeader title="BEO Templates" subtitle="Loading..." />
        <MainContent padding="lg">
          <Container>
            <Grid cols={3} gap={4}>
              <Skeleton className="h-40" />
              <Skeleton className="h-40" />
              <Skeleton className="h-40" />
            </Grid>
          </Container>
        </MainContent>
      </>
    );
  }

  return (
    <>
      <EnterprisePageHeader
        title="BEO Templates"
        subtitle="Reusable templates for faster BEO creation"
        primaryAction={{ label: 'New Template', onClick: () => setShowAddModal(true) }}
      />
      <MainContent padding="lg">
        <Container>
          {templates.length === 0 ? (
            <EmptyState
              title="No templates yet"
              description="Create your first BEO template to speed up event planning."
              icon={<FileText className="h-12 w-12" />}
              action={{ label: 'Create Template', onClick: () => setShowAddModal(true) }}
            />
          ) : (
            <Grid cols={3} gap={4}>
              {templates.map((template) => (
                <Card
                  key={template.id}
                  className={`overflow-hidden ${template.is_default ? 'border-primary' : ''}`}
                >
                  {template.is_default && (
                    <Box className="bg-primary text-primary-foreground text-center py-1">
                      <Text size="xs">
                        <Check className="inline h-3 w-3 mr-1" />
                        Default Template
                      </Text>
                    </Box>
                  )}
                  <Box className="p-4">
                    <Stack direction="horizontal" className="justify-between mb-2">
                      <Stack gap={0}>
                        <H3>{template.name}</H3>
                        <Text size="xs" className="text-muted-foreground capitalize">
                          {template.event_type.replace('_', ' ')}
                        </Text>
                      </Stack>
                      <Stack direction="horizontal" gap={1}>
                        <Button variant="ghost" size="sm">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm('Delete this template?')) {
                              deleteTemplate.mutate(template.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </Stack>
                    </Stack>
                    {template.description && (
                      <Body size="sm" className="text-muted-foreground mb-3 line-clamp-2">
                        {template.description}
                      </Body>
                    )}
                    <Stack direction="horizontal" className="justify-between pt-3 border-t border-border">
                      <Text size="xs" className="text-muted-foreground">
                        {template.sections.timeline?.length || 0} timeline items
                      </Text>
                      <Text size="xs" className="text-muted-foreground">
                        Used {template.usage_count} times
                      </Text>
                    </Stack>
                  </Box>
                </Card>
              ))}
            </Grid>
          )}

          <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="New BEO Template">
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                createTemplate.mutate({
                  name: formData.get('name') as string,
                  event_type: formData.get('event_type') as string,
                  description: formData.get('description') as string || undefined,
                  sections: {
                    timeline: [],
                    room_setup: { layout: 'theater' },
                    catering: { menu_items: [] },
                    av_requirements: [],
                  },
                  is_default: formData.get('is_default') === 'on',
                  usage_count: 0,
                });
              }}
            >
              <Stack gap={4}>
                <Stack gap={1}>
                  <Label>Template Name *</Label>
                  <Input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g., Wedding Reception BEO"
                  />
                </Stack>
                <Stack gap={1}>
                  <Label>Event Type *</Label>
                  <Select name="event_type" required>
                    <option value="wedding">Wedding</option>
                    <option value="corporate">Corporate Event</option>
                    <option value="social">Social Event</option>
                    <option value="conference">Conference</option>
                    <option value="gala">Gala</option>
                    <option value="custom">Custom</option>
                  </Select>
                </Stack>
                <Stack gap={1}>
                  <Label>Description</Label>
                  <Textarea
                    name="description"
                    rows={2}
                    placeholder="Brief description of this template"
                  />
                </Stack>
                <Stack direction="horizontal" gap={2} className="items-center">
                  <Input type="checkbox" name="is_default" id="is_default" className="w-4 h-4" />
                  <Label htmlFor="is_default">Set as default template</Label>
                </Stack>
                <Stack direction="horizontal" gap={3} className="justify-end pt-4">
                  <Button variant="outline" type="button" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createTemplate.isPending}>
                    {createTemplate.isPending ? 'Creating...' : 'Create Template'}
                  </Button>
                </Stack>
              </Stack>
            </Form>
          </Modal>
        </Container>
      </MainContent>
    </>
  );
}
