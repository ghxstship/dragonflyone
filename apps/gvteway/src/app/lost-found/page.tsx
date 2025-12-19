'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GvtewayAppLayout, GvtewayLoadingLayout } from '@/components/app-layout';
import {
  H2,
  H3,
  Body,
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
  Figure,
  Form,
  Kicker,
} from '@ghxstship/ui';
import Image from 'next/image';
import { useLostFoundData } from '@/hooks/useLostFound';

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
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState<'lost' | 'found'>('lost');
  const [localError, setLocalError] = useState<string | null>(null);
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

  const {
    items,
    isLoading: loading,
    error,
    refetch,
    reportItem,
    isSubmitting: submitting,
  } = useLostFoundData();

  const handleSubmit = async () => {
    setLocalError(null);

    try {
      await reportItem({
        ...formData,
        type: reportType,
      });
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
      refetch();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to submit report');
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
        return <Badge className="bg-ink-500 text-white">Closed</Badge>;
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
    return <GvtewayLoadingLayout text="Loading..." />;
  }

  return (
    <GvtewayAppLayout>
          <Stack gap={10}>
            {/* Page Header */}
            <Stack direction="horizontal" className="items-center justify-between">
              <Stack gap={2}>
                <Kicker colorScheme="on-dark">Services</Kicker>
                <H2 size="lg" className="text-white">Lost & Found</H2>
                <Body className="text-on-dark-muted">
                  Report lost items or help reunite found items with their owners
                </Body>
              </Stack>
            <Stack direction="horizontal" gap={2}>
              <Button
                variant="outlineInk"
                onClick={() => { setReportType('found'); setShowReportModal(true); }}
              >
                Report Found Item
              </Button>
              <Button
                variant="solid"
                inverted
                onClick={() => { setReportType('lost'); setShowReportModal(true); }}
              >
                Report Lost Item
              </Button>
            </Stack>
        </Stack>

        {(error || localError) && (
          <Alert variant="error" className="mb-6">
            {error instanceof Error ? error.message : localError || String(error)}
          </Alert>
        )}

        {success && (
          <Alert variant="success" className="mb-6">
            {success}
          </Alert>
        )}

        <Stack direction="horizontal" gap={2}>
          {['all', 'lost', 'found', 'mine'].map(f => (
            <Button
              key={f}
              variant={filter === f ? 'solid' : 'outlineInk'}
              inverted={filter === f}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All Items' : f === 'mine' ? 'My Reports' : `${f.charAt(0).toUpperCase() + f.slice(1)} Items`}
            </Button>
          ))}
        </Stack>

        {filteredItems.length > 0 ? (
          <Grid cols={3} gap={6} className="sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map(item => (
              <Card key={item.id} inverted interactive className="overflow-hidden">
                {item.photos && item.photos.length > 0 && (
                  <Figure className="relative h-40 overflow-hidden bg-ink-900">
                    <Image
                      src={item.photos[0]}
                      alt={item.description}
                      fill
                      className="object-cover"
                    />
                  </Figure>
                )}
                <Stack className="p-4" gap={3}>
                  <Stack direction="horizontal" className="items-start justify-between">
                    <Badge variant={item.type === 'lost' ? 'outline' : 'solid'}>
                      {item.type.toUpperCase()}
                    </Badge>
                    {getStatusBadge(item.status)}
                  </Stack>
                  
                  <Stack gap={1}>
                    <Body className="font-display text-white">{item.category}</Body>
                    <Body size="sm" className="line-clamp-2 text-on-dark-muted">
                      {item.description}
                    </Body>
                  </Stack>

                  {item.event_title && (
                    <Body size="sm" className="text-on-dark-disabled">
                      Event: {item.event_title}
                    </Body>
                  )}

                  <Stack direction="horizontal" className="items-center justify-between">
                    <Body size="sm" className="font-mono text-on-dark-disabled">
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
          <Card inverted className="p-12 text-center">
            <H3 className="mb-4 text-white">No Items Found</H3>
            <Body className="mb-6 text-on-dark-muted">
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
          <Form onSubmit={handleSubmit}>
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
          </Form>
        </Modal>
          </Stack>
    </GvtewayAppLayout>
  );
}
