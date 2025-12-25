'use client';

import {
  Badge,
  Body,
  Box,
  Button,
  Card,
  Container,
  EmptyState,
  EnterprisePageHeader,
  Grid,
  Input,
  MainContent,
  Skeleton,
  Stack,
  Text,
} from '@ghxstship/ui';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, MoreVertical, Eye, Edit2, Trash2, Code, BarChart3, ExternalLink, FileText } from 'lucide-react';
import { useLeadForms, useDeleteLeadForm } from '@/hooks/useLeadForms';

export default function LeadFormsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const { data, isLoading, error } = useLeadForms();
  const deleteForm = useDeleteLeadForm();

  const forms = data || [];
  const filteredForms = forms.filter(
    (form) =>
      form.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (form.description && form.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleDelete = async (formId: string) => {
    if (confirm('Are you sure you want to delete this form?')) {
      await deleteForm.mutateAsync(formId);
    }
    setActiveMenu(null);
  };

  if (isLoading) {
    return (
      <>
        <EnterprisePageHeader title="Lead Forms" subtitle="Loading..." />
        <MainContent padding="lg">
          <Container>
            <Grid cols={3} gap={4}>
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
            </Grid>
          </Container>
        </MainContent>
      </>
    );
  }

  if (error) {
    return (
      <>
        <EnterprisePageHeader title="Lead Forms" subtitle="Error" />
        <MainContent padding="lg">
          <Container>
            <EmptyState
              title="Failed to load lead forms"
              description="Please try again."
              action={{ label: 'Retry', onClick: () => window.location.reload() }}
            />
          </Container>
        </MainContent>
      </>
    );
  }

  return (
    <>
      <EnterprisePageHeader
        title="Lead Forms"
        subtitle="Create and manage lead capture forms"
        primaryAction={{ label: 'New Form', onClick: () => router.push('/lead-forms/new') }}
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={6}>
            <Box className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search forms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </Box>

            {filteredForms.length === 0 ? (
              <EmptyState
                title={searchQuery ? 'No forms match your search' : 'No lead forms yet'}
                description={searchQuery ? 'Try adjusting your search' : 'Create your first form to start capturing leads'}
                icon={<FileText className="h-12 w-12" />}
                action={!searchQuery ? { label: 'Create Form', onClick: () => router.push('/lead-forms/new') } : undefined}
              />
            ) : (
              <Grid cols={3} gap={4}>
                {filteredForms.map((form) => (
                  <Card key={form.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <Box className="p-4">
                      <Stack direction="horizontal" className="justify-between items-start mb-2">
                        <Stack direction="horizontal" gap={2} className="items-center">
                          <Link href={`/lead-forms/${form.id}`} className="font-weight-semibold hover:text-primary">
                            {form.name}
                          </Link>
                          <Badge className={form.active ? 'bg-success-100 text-success-800' : 'bg-ink-100 text-ink-800'}>
                            {form.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </Stack>
                        <Box className="relative">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setActiveMenu(activeMenu === form.id ? null : form.id)}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                          {activeMenu === form.id && (
                            <Card className="absolute right-0 mt-1 w-48 shadow-lg z-10">
                              <Link href={`/lead-forms/${form.id}`} className="flex items-center gap-2 px-4 py-2 hover:bg-muted">
                                <Eye className="h-4 w-4" /> View
                              </Link>
                              <Link href={`/lead-forms/${form.id}/edit`} className="flex items-center gap-2 px-4 py-2 hover:bg-muted">
                                <Edit2 className="h-4 w-4" /> Edit
                              </Link>
                              <Link href={`/lead-forms/${form.id}/submissions`} className="flex items-center gap-2 px-4 py-2 hover:bg-muted">
                                <BarChart3 className="h-4 w-4" /> Submissions
                              </Link>
                              <Link href={`/lead-forms/${form.id}/embed`} className="flex items-center gap-2 px-4 py-2 hover:bg-muted">
                                <Code className="h-4 w-4" /> Embed Code
                              </Link>
                              <Button
                                variant="ghost"
                                onClick={() => handleDelete(form.id)}
                                className="flex items-center gap-2 w-full px-4 py-2 text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" /> Delete
                              </Button>
                            </Card>
                          )}
                        </Box>
                      </Stack>
                      {form.description && (
                        <Body size="sm" className="text-muted-foreground mb-3 line-clamp-2">
                          {form.description}
                        </Body>
                      )}
                      <Stack direction="horizontal" className="justify-between text-muted-foreground">
                        <Text size="xs">{form.submissions_count || 0} submissions</Text>
                        <Text size="xs">{form.fields?.length || 0} fields</Text>
                      </Stack>
                    </Box>
                    <Box className="px-4 py-3 bg-muted/30 border-t border-border">
                      <Stack direction="horizontal" className="justify-between">
                        <Link href={`/lead-forms/${form.id}/analytics`} className="flex items-center gap-1 text-primary hover:underline">
                          <BarChart3 className="h-3 w-3" />
                          <Text size="xs">Analytics</Text>
                        </Link>
                        <Link href={`/f/${form.slug}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                          <ExternalLink className="h-3 w-3" />
                          <Text size="xs">Preview</Text>
                        </Link>
                      </Stack>
                    </Box>
                  </Card>
                ))}
              </Grid>
            )}
          </Stack>
        </Container>
      </MainContent>
    </>
  );
}
