'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Section,
  Display,
  H2,
  Button,
  Card,
  Field,
  Input,
  Textarea,
  Select,
  Grid,
  Alert,
  Spinner,
  Stack,
} from '@ghxstship/ui';

export default function NewProjectPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    client: '',
    type: 'concert',
    venue: '',
    loadInDate: '',
    eventDate: '',
    loadOutDate: '',
    budget: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch('/api/projects/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create project');
      }

      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Section className="min-h-screen bg-white">
      <Container>
        <Stack className="border-b-2 border-black py-8 mb-8">
          <Display>NEW PRODUCTION</Display>
        </Stack>

        {error && (
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Card className="p-6 mb-6">
            <H2 className="mb-6">PROJECT INFORMATION</H2>
            
            <Stack gap={6}>
              <Field label="Project Name" required>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Summer Music Festival 2024"
                  required
                />
              </Field>

              <Grid cols={2}>
                <Field label="Client" required>
                  <Input
                    value={formData.client}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                    placeholder="Client Name"
                    required
                  />
                </Field>

                <Field label="Production Type" required>
                  <Select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="concert">Concert</option>
                    <option value="festival">Festival</option>
                    <option value="corporate">Corporate Event</option>
                    <option value="theater">Theater</option>
                    <option value="sports">Sports Event</option>
                  </Select>
                </Field>
              </Grid>

              <Field label="Venue" required>
                <Input
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  placeholder="Venue Name"
                  required
                />
              </Field>
            </Stack>
          </Card>

          <Card className="p-6 mb-6">
            <H2 className="mb-6">SCHEDULE</H2>
            
            <Grid cols={3}>
              <Field label="Load-In Date" required>
                <Input
                  type="date"
                  value={formData.loadInDate}
                  onChange={(e) => setFormData({ ...formData, loadInDate: e.target.value })}
                  required
                />
              </Field>

              <Field label="Event Date" required>
                <Input
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                  required
                />
              </Field>

              <Field label="Load-Out Date" required>
                <Input
                  type="date"
                  value={formData.loadOutDate}
                  onChange={(e) => setFormData({ ...formData, loadOutDate: e.target.value })}
                  required
                />
              </Field>
            </Grid>
          </Card>

          <Card className="p-6 mb-6">
            <H2 className="mb-6">BUDGET & NOTES</H2>
            
            <Stack gap={6}>
              <Field label="Budget (USD)" required>
                <Input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  placeholder="50000"
                  required
                />
              </Field>

              <Field label="Production Notes">
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Special requirements, technical notes..."
                  rows={4}
                />
              </Field>
            </Stack>
          </Card>

          <Stack direction="horizontal" gap={4}>
            <Button type="submit" variant="solid" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Creating...
                </>
              ) : (
                'Create Project'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </Stack>
        </form>
      </Container>
    </Section>
  );
}
