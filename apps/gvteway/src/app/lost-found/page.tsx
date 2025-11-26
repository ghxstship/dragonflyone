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
  Textarea,
  Select,
  Grid,
  Stack,
  Badge,
  Alert,
  Modal,
  LoadingSpinner,
  Figure,
} from '@ghxstship/ui';
import Image from 'next/image';

interface LostFoundItem {
  id: string;
  type: 'lost' | 'found';
  category: string;
  description: string;
  event_id?: string;
  event_title?: string;
  venue_name?: string;
  location_details?: string;
  date_lost_found: string;
  status: 'open' | 'matched' | 'claimed' | 'closed';
  photos?: string[];
  contact_email?: string;
  created_at: string;
}

const ITEM_CATEGORIES = [
  'Phone/Electronics',
  'Wallet/Purse',
  'Keys',
  'Jewelry',
  'Clothing',
  'Bag/Backpack',
  'ID/Documents',
  'Glasses/Sunglasses',
  'Other',
];

export default function LostFoundPage() {
  const router = useRouter();
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState<'lost' | 'found'>('lost');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');

  // Form state
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    event_id: '',
    location_details: '',
    date_lost_found: new Date().toISOString().split('T')[0],
    contact_email: '',
  });

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/lost-found');
      if (response.ok) {
        const data = await response.json();
        setItems(data.items || []);
      }
    } catch (err) {
      console.error('Failed to fetch items');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/lost-found', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          type: reportType,
        }),
      });

      if (response.ok) {
        setSuccess(`Your ${reportType} item report has been submitted. We'll notify you if there's a match.`);
        setShowReportModal(false);
        setFormData({
          category: '',
          description: '',
          event_id: '',
          location_details: '',
          date_lost_found: new Date().toISOString().split('T')[0],
          contact_email: '',
        });
        fetchItems();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to submit report');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-info-500 text-white">Open</Badge>;
      case 'matched':
        return <Badge className="bg-warning-500 text-white">Potential Match</Badge>;
      case 'claimed':
        return <Badge className="bg-success-500 text-white">Claimed</Badge>;
      case 'closed':
        return <Badge className="bg-grey-500 text-white">Closed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const filteredItems = items.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'lost') return item.type === 'lost';
    if (filter === 'found') return item.type === 'found';
    if (filter === 'mine') return true; // Would filter by user
    return true;
  });

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
            <H1>Lost & Found</H1>
            <Body className="text-grey-600">
              Report lost items or help reunite found items with their owners
            </Body>
          </Stack>
            <Stack direction="horizontal" gap={2}>
              <Button
                variant="outline"
                onClick={() => { setReportType('found'); setShowReportModal(true); }}
              >
                Report Found Item
              </Button>
              <Button
                variant="solid"
                onClick={() => { setReportType('lost'); setShowReportModal(true); }}
              >
                Report Lost Item
              </Button>
            </Stack>
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

        <Stack direction="horizontal" gap={2} className="mb-6">
          {['all', 'lost', 'found', 'mine'].map(f => (
            <Button
              key={f}
              variant={filter === f ? 'solid' : 'outline'}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All Items' : f === 'mine' ? 'My Reports' : `${f.charAt(0).toUpperCase() + f.slice(1)} Items`}
            </Button>
          ))}
        </Stack>

        {filteredItems.length > 0 ? (
          <Grid cols={3} gap={6}>
            {filteredItems.map(item => (
              <Card key={item.id} className="overflow-hidden">
                {item.photos && item.photos.length > 0 && (
                  <Figure className="relative h-40 bg-grey-100 overflow-hidden">
                    <Image
                      src={item.photos[0]}
                      alt={item.description}
                      fill
                      className="object-cover"
                    />
                  </Figure>
                )}
                <Stack className="p-4" gap={3}>
                  <Stack direction="horizontal" className="justify-between items-start">
                    <Badge variant={item.type === 'lost' ? 'outline' : 'solid'}>
                      {item.type.toUpperCase()}
                    </Badge>
                    {getStatusBadge(item.status)}
                  </Stack>
                  
                  <Stack gap={1}>
                    <Body className="font-bold">{item.category}</Body>
                    <Body className="text-grey-600 text-sm line-clamp-2">
                      {item.description}
                    </Body>
                  </Stack>

                  {item.event_title && (
                    <Body className="text-sm text-grey-500">
                      Event: {item.event_title}
                    </Body>
                  )}

                  <Stack direction="horizontal" className="justify-between items-center">
                    <Body className="text-xs text-grey-400">
                      {new Date(item.date_lost_found).toLocaleDateString()}
                    </Body>
                    <Button variant="ghost" size="sm" onClick={() => router.push(`/lost-found/${item.id}`)}>
                      View Details
                    </Button>
                  </Stack>
                </Stack>
              </Card>
            ))}
          </Grid>
        ) : (
          <Card className="p-12 text-center">
            <H3 className="mb-4">NO ITEMS FOUND</H3>
            <Body className="text-grey-600 mb-6">
              {filter === 'mine'
                ? "You haven't reported any lost or found items."
                : 'No items match your current filter.'}
            </Body>
          </Card>
        )}

        <Modal
          open={showReportModal}
          onClose={() => setShowReportModal(false)}
          title={`Report ${reportType === 'lost' ? 'Lost' : 'Found'} Item`}
        >
          <form onSubmit={handleSubmit}>
            <Stack gap={4}>
              <Field label="Category" required>
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  <option value="">Select category...</option>
                  {ITEM_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </Select>
              </Field>

              <Field label="Description" required>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the item in detail (color, brand, distinguishing features)..."
                  rows={3}
                  required
                />
              </Field>

              <Field label={`Date ${reportType === 'lost' ? 'Lost' : 'Found'}`}>
                <Input
                  type="date"
                  value={formData.date_lost_found}
                  onChange={(e) => setFormData({ ...formData, date_lost_found: e.target.value })}
                />
              </Field>

              <Field label="Location Details">
                <Input
                  value={formData.location_details}
                  onChange={(e) => setFormData({ ...formData, location_details: e.target.value })}
                  placeholder="Where was the item lost/found? (section, seat, area)"
                />
              </Field>

              <Field label="Contact Email">
                <Input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  placeholder="Email for notifications"
                />
              </Field>

              <Stack direction="horizontal" gap={4}>
                <Button type="submit" variant="solid" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Report'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowReportModal(false)}
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
