'use client';

import {
  Body,
  Button,
  Form,
  H1,
  H2,
  Input,
  Label,
  Select,
  Text,
  Textarea,
} from '@ghxstship/ui';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, FileText, Plus, Trash2, Clock, Users, MapPin } from 'lucide-react';
import { useCreateBEO } from '@/hooks/useBEOs';

interface TimelineItem {
  time: string;
  activity: string;
  location: string;
  notes: string;
}

export default function NewBEOPage() {
  const router = useRouter();
  const createMutation = useCreateBEO();

  const [formData, setFormData] = useState({
    name: '',
    event_date: new Date().toISOString().split('T')[0],
    event_start_time: '',
    event_end_time: '',
    venue_name: '',
    room_name: '',
    guest_count: 0,
    notes: '',
  });

  const [eventInfo] = useState({
    event_name: '',
    event_type: '',
    client_name: '',
    client_phone: '',
    client_email: '',
    account_manager: '',
  });

  const [timeline, setTimeline] = useState<TimelineItem[]>([
    { time: '', activity: '', location: '', notes: '' },
  ]);

  const [roomSetup, setRoomSetup] = useState({
    layout: 'theater',
    capacity: 0,
    tables: 0,
    chairs: 0,
    stage: false,
    dance_floor: false,
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAddTimelineItem = () => {
    setTimeline((prev) => [...prev, { time: '', activity: '', location: '', notes: '' }]);
  };

  const handleRemoveTimelineItem = (index: number) => {
    if (timeline.length > 1) {
      setTimeline((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleTimelineChange = (index: number, field: keyof TimelineItem, value: string) => {
    setTimeline((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'BEO name is required';
    if (!formData.event_date) newErrors.event_date = 'Event date is required';
    if (!formData.venue_name) newErrors.venue_name = 'Venue is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const result = await createMutation.mutateAsync({
        organization_id: 'current',
        name: formData.name,
        event_date: formData.event_date,
        event_start_time: formData.event_start_time || undefined,
        event_end_time: formData.event_end_time || undefined,
        venue_name: formData.venue_name,
        room_name: formData.room_name || undefined,
        guest_count: formData.guest_count || undefined,
        notes: formData.notes || undefined,
        sections: {
          event_info: eventInfo,
          timeline: timeline.filter((t) => t.time || t.activity),
          room_setup: roomSetup,
        },
      });
      router.push(`/beos/${result.beo.id}`);
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to create BEO',
      });
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          href="/beos"
          className="inline-flex items-center gap-2 text-body-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to BEOs
        </Link>
      </div>

      <div className="bg-background border-2 border-border rounded-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-primary/10 rounded-card">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <H1 className="text-h3-md font-weight-bold text-foreground">New Banquet Event Order</H1>
            <Body className="text-body-sm text-muted-foreground">
              Create a BEO for your production team
            </Body>
          </div>
        </div>

        {errors.submit && (
          <div className="mb-6 p-4 bg-destructive/10 border-2 border-destructive rounded-card text-destructive text-body-sm">
            {errors.submit}
          </div>
        )}

        <Form onSubmit={handleSubmit} className="space-y-8">
          <section className="space-y-4">
            <H2 className="text-h4-md font-weight-semibold text-foreground border-b border-border pb-2">
              Basic Information
            </H2>
            <div>
              <Label className="block text-body-sm font-weight-medium text-foreground mb-2">
                BEO Name *
              </Label>
              <Input
                type="text"
                placeholder="e.g., Smith Wedding Reception"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
              {errors.name && (
                <Body className="mt-1 text-body-xs text-destructive">{errors.name}</Body>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="block text-body-sm font-weight-medium text-foreground mb-2">
                  Event Date *
                </Label>
                <Input
                  type="date"
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
                {errors.event_date && (
                  <Body className="mt-1 text-body-xs text-destructive">{errors.event_date}</Body>
                )}
              </div>
              <div>
                <Label className="block text-body-sm font-weight-medium text-foreground mb-2">
                  Start Time
                </Label>
                <Input
                  type="time"
                  value={formData.event_start_time}
                  onChange={(e) => setFormData({ ...formData, event_start_time: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <Label className="block text-body-sm font-weight-medium text-foreground mb-2">
                  End Time
                </Label>
                <Input
                  type="time"
                  value={formData.event_end_time}
                  onChange={(e) => setFormData({ ...formData, event_end_time: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="block text-body-sm font-weight-medium text-foreground mb-2">
                  Venue *
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Venue name"
                    value={formData.venue_name}
                    onChange={(e) => setFormData({ ...formData, venue_name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                {errors.venue_name && (
                  <Body className="mt-1 text-body-xs text-destructive">{errors.venue_name}</Body>
                )}
              </div>
              <div>
                <Label className="block text-body-sm font-weight-medium text-foreground mb-2">
                  Room/Space
                </Label>
                <Input
                  type="text"
                  placeholder="Room name"
                  value={formData.room_name}
                  onChange={(e) => setFormData({ ...formData, room_name: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <Label className="block text-body-sm font-weight-medium text-foreground mb-2">
                  Guest Count
                </Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.guest_count || ''}
                    onChange={(e) => setFormData({ ...formData, guest_count: Number(e.target.value) || 0 })}
                    className="w-full pl-10 pr-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <H2 className="text-h4-md font-weight-semibold text-foreground flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Event Timeline
              </H2>
              <Button
                type="button"
                onClick={handleAddTimelineItem}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-body-sm font-weight-medium text-primary hover:bg-primary/10 rounded-button transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Item
              </Button>
            </div>

            <div className="space-y-3">
              {timeline.map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-4 border-2 border-border rounded-card">
                  <div className="flex-1 grid grid-cols-4 gap-3">
                    <Input
                      type="time"
                      value={item.time}
                      onChange={(e) => handleTimelineChange(index, 'time', e.target.value)}
                      className="px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <Input
                      type="text"
                      placeholder="Activity"
                      value={item.activity}
                      onChange={(e) => handleTimelineChange(index, 'activity', e.target.value)}
                      className="px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <Input
                      type="text"
                      placeholder="Location"
                      value={item.location}
                      onChange={(e) => handleTimelineChange(index, 'location', e.target.value)}
                      className="px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <Input
                      type="text"
                      placeholder="Notes"
                      value={item.notes}
                      onChange={(e) => handleTimelineChange(index, 'notes', e.target.value)}
                      className="px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={() => handleRemoveTimelineItem(index)}
                    disabled={timeline.length === 1}
                    className="p-2 text-muted-foreground hover:text-destructive disabled:opacity-30 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <H2 className="text-h4-md font-weight-semibold text-foreground border-b border-border pb-2">
              Room Setup
            </H2>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label className="block text-body-sm font-weight-medium text-foreground mb-2">
                  Layout
                </Label>
                <Select
                  value={roomSetup.layout}
                  onChange={(e) => setRoomSetup({ ...roomSetup, layout: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="theater">Theater</option>
                  <option value="classroom">Classroom</option>
                  <option value="banquet">Banquet</option>
                  <option value="cocktail">Cocktail</option>
                  <option value="u-shape">U-Shape</option>
                  <option value="hollow-square">Hollow Square</option>
                  <option value="boardroom">Boardroom</option>
                </Select>
              </div>
              <div>
                <Label className="block text-body-sm font-weight-medium text-foreground mb-2">
                  Tables
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={roomSetup.tables || ''}
                  onChange={(e) => setRoomSetup({ ...roomSetup, tables: Number(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <Label className="block text-body-sm font-weight-medium text-foreground mb-2">
                  Chairs
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={roomSetup.chairs || ''}
                  onChange={(e) => setRoomSetup({ ...roomSetup, chairs: Number(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <div className="flex items-end gap-4">
                <Label className="flex items-center gap-2">
                  <Input
                    type="checkbox"
                    checked={roomSetup.stage}
                    onChange={(e) => setRoomSetup({ ...roomSetup, stage: e.target.checked })}
                    className="w-4 h-4 border-2 border-border rounded"
                  />
                  <Text className="text-body-sm">Stage</Text>
                </Label>
                <Label className="flex items-center gap-2">
                  <Input
                    type="checkbox"
                    checked={roomSetup.dance_floor}
                    onChange={(e) => setRoomSetup({ ...roomSetup, dance_floor: e.target.checked })}
                    className="w-4 h-4 border-2 border-border rounded"
                  />
                  <Text className="text-body-sm">Dance Floor</Text>
                </Label>
              </div>
            </div>
          </section>

          <div>
            <Label className="block text-body-sm font-weight-medium text-foreground mb-2">
              Notes
            </Label>
            <Textarea
              rows={4}
              placeholder="Additional notes for the production team..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Link
              href="/beos"
              className="px-4 py-2 border-2 border-border rounded-button text-body-sm font-weight-medium hover:bg-muted transition-colors"
            >
              Cancel
            </Link>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 border-2 border-border rounded-button text-body-sm font-weight-medium hover:bg-muted transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              Save as Draft
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={createMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary font-weight-medium text-body-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {createMutation.isPending ? 'Creating...' : 'Submit for Review'}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
