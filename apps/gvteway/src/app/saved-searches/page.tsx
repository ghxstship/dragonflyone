'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GvtewayAppLayout, GvtewayLoadingLayout } from '@/components/app-layout';
import {
  H2,
  H3,
  Body,
  Label,
  Button,
  Card,
  Field,
  Input,
  Select,
  Grid,
  Stack,
  Badge,
  Switch,
  Alert,
  Modal,
  Form,
  Kicker,
} from '@ghxstship/ui';
import { useSavedSearchesData, type SavedSearch } from '@/hooks/useSavedSearches';

export default function SavedSearchesPage() {
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSearch, setEditingSearch] = useState<SavedSearch | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    query: '',
    category: 'all',
    location: '',
    priceMin: '',
    priceMax: '',
    dateFrom: '',
    dateTo: '',
    alerts_enabled: true,
    alert_frequency: 'daily' as 'instant' | 'daily' | 'weekly',
  });

  const {
    searches,
    isLoading: loading,
    error,
    refetch,
    createSearch,
    deleteSearch,
    toggleAlerts,
  } = useSavedSearchesData();

  const handleCreate = async () => {
    setLocalError(null);

    try {
      await createSearch({
        name: formData.name,
        query: formData.query,
        filters: {
          category: formData.category !== 'all' ? formData.category : undefined,
          location: formData.location || undefined,
          priceMin: formData.priceMin ? parseFloat(formData.priceMin) : undefined,
          priceMax: formData.priceMax ? parseFloat(formData.priceMax) : undefined,
          dateFrom: formData.dateFrom || undefined,
          dateTo: formData.dateTo || undefined,
        },
        alerts_enabled: formData.alerts_enabled,
        alert_frequency: formData.alert_frequency,
      });
      setSuccess('Search saved successfully');
      setShowCreateModal(false);
      resetForm();
      refetch();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to save search');
    }
  };

  const handleToggleAlerts = async (search: SavedSearch) => {
    try {
      await toggleAlerts({ searchId: search.id, enabled: !search.alerts_enabled });
    } catch {
      setLocalError('Failed to update alerts');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this saved search?')) return;

    try {
      await deleteSearch(id);
      setSuccess('Search deleted');
    } catch {
      setLocalError('Failed to delete search');
    }
  };

  const handleRunSearch = (search: SavedSearch) => {
    const params = new URLSearchParams();
    if (search.query) params.set('q', search.query);
    if (search.filters.category) params.set('category', search.filters.category);
    if (search.filters.location) params.set('location', search.filters.location);
    if (search.filters.priceMin) params.set('priceMin', search.filters.priceMin.toString());
    if (search.filters.priceMax) params.set('priceMax', search.filters.priceMax.toString());
    if (search.filters.dateFrom) params.set('dateFrom', search.filters.dateFrom);
    if (search.filters.dateTo) params.set('dateTo', search.filters.dateTo);
    
    router.push(`/browse?${params.toString()}`);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      query: '',
      category: 'all',
      location: '',
      priceMin: '',
      priceMax: '',
      dateFrom: '',
      dateTo: '',
      alerts_enabled: true,
      alert_frequency: 'daily',
    });
  };

  if (loading) {
    return <GvtewayLoadingLayout />;
  }

  return (
    <GvtewayAppLayout>
          <Stack gap={10}>
            {/* Page Header */}
            <Stack direction="horizontal" className="items-center justify-between">
              <Stack gap={2}>
                <Kicker colorScheme="on-dark">Alerts</Kicker>
                <H2 size="lg" className="text-white">Saved Searches</H2>
                <Body className="text-on-dark-muted">Get notified when new events match your criteria</Body>
              </Stack>
              <Button variant="solid" inverted onClick={() => setShowCreateModal(true)}>
                Create Search
              </Button>
            </Stack>

        {(error || localError) && (
          <Alert variant="error" className="mb-6">
            {error ? (error instanceof Error ? error.message : String(error)) : localError}
          </Alert>
        )}

        {success && (
          <Alert variant="success" className="mb-6">
            {success}
          </Alert>
        )}

        {searches.length > 0 ? (
          <Stack gap={4}>
            {searches.map((search: SavedSearch) => (
              <Card key={search.id} inverted interactive>
                <Stack direction="horizontal" className="items-start justify-between">
                  <Stack gap={3} className="flex-1">
                    <Stack direction="horizontal" gap={3} className="items-center">
                      <H3 className="text-white">{search.name}</H3>
                      {search.new_results_count > 0 && (
                        <Badge variant="solid">{search.new_results_count} new</Badge>
                      )}
                    </Stack>

                    {search.query && (
                      <Body className="text-on-dark-muted">
                        Search: &quot;{search.query}&quot;
                      </Body>
                    )}

                    <Stack direction="horizontal" gap={2} className="flex-wrap">
                      {search.filters.category && (
                        <Badge variant="outline">Category: {search.filters.category}</Badge>
                      )}
                      {search.filters.location && (
                        <Badge variant="outline">Location: {search.filters.location}</Badge>
                      )}
                      {search.filters.priceMin && (
                        <Badge variant="outline">Min: ${search.filters.priceMin}</Badge>
                      )}
                      {search.filters.priceMax && (
                        <Badge variant="outline">Max: ${search.filters.priceMax}</Badge>
                      )}
                      {search.filters.dateFrom && (
                        <Badge variant="outline">From: {search.filters.dateFrom}</Badge>
                      )}
                      {search.filters.dateTo && (
                        <Badge variant="outline">To: {search.filters.dateTo}</Badge>
                      )}
                    </Stack>

                    <Stack direction="horizontal" gap={4} className="mt-2 items-center">
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <Switch
                          checked={search.alerts_enabled}
                          onChange={() => handleToggleAlerts(search)}
                        />
                        <Label className="text-on-dark-muted">Alerts {search.alerts_enabled ? 'On' : 'Off'}</Label>
                      </Stack>
                      {search.alerts_enabled && (
                        <Badge variant="outline">{search.alert_frequency}</Badge>
                      )}
                      {search.last_run && (
                        <Body size="sm" className="text-on-dark-disabled">
                          Last checked: {new Date(search.last_run).toLocaleDateString()}
                        </Body>
                      )}
                    </Stack>
                  </Stack>

                  <Stack direction="horizontal" gap={2}>
                    <Button variant="solid" inverted onClick={() => handleRunSearch(search)}>
                      Run Search
                    </Button>
                    <Button variant="ghost" onClick={() => {
                      setEditingSearch(search);
                      setFormData({
                        name: search.name,
                        query: search.query || '',
                        category: search.filters.category || 'all',
                        location: search.filters.location || '',
                        priceMin: search.filters.priceMin?.toString() || '',
                        priceMax: search.filters.priceMax?.toString() || '',
                        dateFrom: search.filters.dateFrom || '',
                        dateTo: search.filters.dateTo || '',
                        alerts_enabled: search.alerts_enabled,
                        alert_frequency: search.alert_frequency,
                      });
                      setShowCreateModal(true);
                    }}>
                      Edit
                    </Button>
                    <Button variant="outlineInk" onClick={() => handleDelete(search.id)}>
                      Delete
                    </Button>
                  </Stack>
                </Stack>
              </Card>
            ))}
          </Stack>
        ) : (
          <Card inverted variant="elevated" className="p-12 text-center">
            <H3 className="mb-4 text-white">No Saved Searches</H3>
            <Body className="mb-6 text-on-dark-muted">
              Save your search criteria to get notified when new events match.
            </Body>
            <Button variant="solid" inverted onClick={() => setShowCreateModal(true)}>
              Create Your First Search
            </Button>
          </Card>
        )}

        <Modal
          open={showCreateModal}
          onClose={() => { setShowCreateModal(false); setEditingSearch(null); resetForm(); }}
          title={editingSearch ? 'Edit Saved Search' : 'Create Saved Search'}
        >
          <Form onSubmit={handleCreate}>
            <Stack gap={4}>
              <Field label="Search Name" required>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="My Concert Search"
                  required
                />
              </Field>

              <Field label="Search Keywords">
                <Input
                  value={formData.query}
                  onChange={(e) => setFormData({ ...formData, query: e.target.value })}
                  placeholder="Artist name, event title..."
                />
              </Field>

              <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                <Field label="Category">
                  <Select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="all">All Categories</option>
                    <option value="concert">Concerts</option>
                    <option value="festival">Festivals</option>
                    <option value="theater">Theater</option>
                    <option value="sports">Sports</option>
                    <option value="comedy">Comedy</option>
                  </Select>
                </Field>

                <Field label="Location">
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="City or state"
                  />
                </Field>
              </Grid>

              <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                <Field label="Min Price ($)">
                  <Input
                    type="number"
                    value={formData.priceMin}
                    onChange={(e) => setFormData({ ...formData, priceMin: e.target.value })}
                    placeholder="0"
                  />
                </Field>

                <Field label="Max Price ($)">
                  <Input
                    type="number"
                    value={formData.priceMax}
                    onChange={(e) => setFormData({ ...formData, priceMax: e.target.value })}
                    placeholder="500"
                  />
                </Field>
              </Grid>

              <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                <Field label="Date From">
                  <Input
                    type="date"
                    value={formData.dateFrom}
                    onChange={(e) => setFormData({ ...formData, dateFrom: e.target.value })}
                  />
                </Field>

                <Field label="Date To">
                  <Input
                    type="date"
                    value={formData.dateTo}
                    onChange={(e) => setFormData({ ...formData, dateTo: e.target.value })}
                  />
                </Field>
              </Grid>

              <Stack className="border-t border-ink-200 pt-4">
                <Stack direction="horizontal" gap={4} className="items-center mb-4">
                  <Switch
                    checked={formData.alerts_enabled}
                    onChange={(e) => setFormData({ ...formData, alerts_enabled: e.target.checked })}
                  />
                  <Label>Enable email alerts for new matches</Label>
                </Stack>

                {formData.alerts_enabled && (
                  <Field label="Alert Frequency">
                    <Select
                      value={formData.alert_frequency}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        alert_frequency: e.target.value as 'instant' | 'daily' | 'weekly' 
                      })}
                    >
                      <option value="instant">Instant</option>
                      <option value="daily">Daily Digest</option>
                      <option value="weekly">Weekly Digest</option>
                    </Select>
                  </Field>
                )}
              </Stack>

              <Stack direction="horizontal" gap={4} className="mt-4">
                <Button type="submit" variant="solid">
                  Save Search
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setShowCreateModal(false); resetForm(); }}
                >
                  Cancel
                </Button>
              </Stack>
            </Stack>
          </Form>
        </Modal>
          </Stack>
    </GvtewayAppLayout>
  );
}
