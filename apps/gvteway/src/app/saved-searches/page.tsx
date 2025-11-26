'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '../../components/navigation';
import {
  Container,
  Section,
  H1,
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
  LoadingSpinner,
} from '@ghxstship/ui';

interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: {
    category?: string;
    location?: string;
    priceMin?: number;
    priceMax?: number;
    dateFrom?: string;
    dateTo?: string;
  };
  alerts_enabled: boolean;
  alert_frequency: 'instant' | 'daily' | 'weekly';
  last_run?: string;
  new_results_count: number;
  created_at: string;
}

export default function SavedSearchesPage() {
  const router = useRouter();
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSearch, setEditingSearch] = useState<SavedSearch | null>(null);
  const [error, setError] = useState<string | null>(null);
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

  const fetchSearches = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/saved-searches');
      if (response.ok) {
        const data = await response.json();
        setSearches(data.searches || []);
      }
    } catch (err) {
      setError('Failed to load saved searches');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSearches();
  }, [fetchSearches]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch('/api/saved-searches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
        }),
      });

      if (response.ok) {
        setSuccess('Search saved successfully');
        setShowCreateModal(false);
        resetForm();
        fetchSearches();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save search');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  const handleToggleAlerts = async (search: SavedSearch) => {
    try {
      const response = await fetch(`/api/saved-searches/${search.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alerts_enabled: !search.alerts_enabled,
        }),
      });

      if (response.ok) {
        fetchSearches();
      }
    } catch (err) {
      setError('Failed to update alerts');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this saved search?')) return;

    try {
      const response = await fetch(`/api/saved-searches/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccess('Search deleted');
        fetchSearches();
      }
    } catch (err) {
      setError('Failed to delete search');
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
    return (
      <Section className="min-h-screen bg-white">
        <Navigation />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading..." />
        </Container>
      </Section>
    );
  }

  return (
    <Section className="min-h-screen bg-white">
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
        <Stack direction="horizontal" className="flex-col md:flex-row md:items-center md:justify-between border-b-2 border-black pb-8">
          <Stack gap={2}>
            <H1>Saved Searches</H1>
            <Body className="text-grey-600">
              Get notified when new events match your criteria
            </Body>
          </Stack>
          <Button variant="solid" onClick={() => setShowCreateModal(true)}>
            Create Search
          </Button>
        </Stack>

        {error && (
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" className="mb-6">
            {success}
          </Alert>
        )}

        {searches.length > 0 ? (
          <Stack gap={4}>
            {searches.map(search => (
              <Card key={search.id} className="p-6">
                <Stack direction="horizontal" className="justify-between items-start">
                  <Stack gap={3} className="flex-1">
                    <Stack direction="horizontal" gap={3} className="items-center">
                      <H3>{search.name}</H3>
                      {search.new_results_count > 0 && (
                        <Badge>{search.new_results_count} new</Badge>
                      )}
                    </Stack>

                    {search.query && (
                      <Body className="text-gray-600">
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

                    <Stack direction="horizontal" gap={4} className="items-center mt-2">
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <Switch
                          checked={search.alerts_enabled}
                          onChange={() => handleToggleAlerts(search)}
                        />
                        <Label>Alerts {search.alerts_enabled ? 'On' : 'Off'}</Label>
                      </Stack>
                      {search.alerts_enabled && (
                        <Badge variant="outline">{search.alert_frequency}</Badge>
                      )}
                      {search.last_run && (
                        <Body className="text-sm text-gray-500">
                          Last checked: {new Date(search.last_run).toLocaleDateString()}
                        </Body>
                      )}
                    </Stack>
                  </Stack>

                  <Stack direction="horizontal" gap={2}>
                    <Button variant="solid" onClick={() => handleRunSearch(search)}>
                      Run Search
                    </Button>
                    <Button variant="outline" onClick={() => handleDelete(search.id)}>
                      Delete
                    </Button>
                  </Stack>
                </Stack>
              </Card>
            ))}
          </Stack>
        ) : (
          <Card className="p-12 text-center">
            <H3 className="mb-4">NO SAVED SEARCHES</H3>
            <Body className="text-gray-600 mb-6">
              Save your search criteria to get notified when new events match.
            </Body>
            <Button variant="solid" onClick={() => setShowCreateModal(true)}>
              Create Your First Search
            </Button>
          </Card>
        )}

        <Modal
          open={showCreateModal}
          onClose={() => { setShowCreateModal(false); resetForm(); }}
          title="Create Saved Search"
        >
          <form onSubmit={handleCreate}>
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

              <Grid cols={2} gap={4}>
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

              <Grid cols={2} gap={4}>
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

              <Grid cols={2} gap={4}>
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

              <Stack className="border-t border-gray-200 pt-4">
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
          </form>
        </Modal>
        </Stack>
      </Container>
    </Section>
  );
}
