'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Save, Calendar } from 'lucide-react';
import { useCreateVendorSchedule } from '@/hooks/useVendorSchedules';

const SCHEDULE_TYPES = [
  { value: 'load_in', label: 'Load In', description: 'Vendor arrival and equipment delivery' },
  { value: 'setup', label: 'Setup', description: 'Equipment installation and preparation' },
  { value: 'service', label: 'Service', description: 'Active service period during event' },
  { value: 'standby', label: 'Standby', description: 'On-site but not actively working' },
  { value: 'breakdown', label: 'Breakdown', description: 'Dismantling and packing equipment' },
  { value: 'load_out', label: 'Load Out', description: 'Equipment removal and departure' },
];

export default function NewVendorSchedulePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingIdParam = searchParams.get('booking');
  const vendorIdParam = searchParams.get('vendor');

  const createMutation = useCreateVendorSchedule();

  const [formData, setFormData] = useState({
    booking_id: bookingIdParam || '',
    vendor_profile_id: vendorIdParam || '',
    schedule_type: 'load_in' as const,
    start_date: '',
    start_time: '08:00',
    end_date: '',
    end_time: '10:00',
    location: '',
    access_point: '',
    access_instructions: '',
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    crew_count: 1,
    equipment_notes: '',
    special_requirements: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.vendor_profile_id) newErrors.vendor_profile_id = 'Vendor is required';
    if (!formData.start_date) newErrors.start_date = 'Start date is required';
    if (!formData.start_time) newErrors.start_time = 'Start time is required';
    if (!formData.end_date) newErrors.end_date = 'End date is required';
    if (!formData.end_time) newErrors.end_time = 'End time is required';

    // Validate times
    const startDateTime = new Date(`${formData.start_date}T${formData.start_time}`);
    const endDateTime = new Date(`${formData.end_date}T${formData.end_time}`);
    if (endDateTime <= startDateTime) {
      newErrors.end_time = 'End time must be after start time';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await createMutation.mutateAsync({
        booking_id: formData.booking_id || undefined,
        vendor_profile_id: formData.vendor_profile_id,
        schedule_type: formData.schedule_type,
        start_time: `${formData.start_date}T${formData.start_time}:00Z`,
        end_time: `${formData.end_date}T${formData.end_time}:00Z`,
        location: formData.location || undefined,
        access_point: formData.access_point || undefined,
        access_instructions: formData.access_instructions || undefined,
        contact_name: formData.contact_name || undefined,
        contact_phone: formData.contact_phone || undefined,
        contact_email: formData.contact_email || undefined,
        crew_count: formData.crew_count,
        equipment_notes: formData.equipment_notes || undefined,
        special_requirements: formData.special_requirements || undefined,
      });
      router.push('/vendor-schedules');
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to create schedule',
      });
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <a
          href="/vendor-schedules"
          className="inline-flex items-center gap-2 text-body-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Schedules
        </a>
      </div>

      <div className="bg-background border-2 border-border rounded-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-primary/10 rounded-card">
            <Calendar className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-h3-md font-weight-bold text-foreground">New Vendor Schedule</h1>
            <p className="text-body-sm text-muted-foreground">
              Schedule vendor load-in, setup, or service times
            </p>
          </div>
        </div>

        {errors.submit && (
          <div className="mb-6 p-4 bg-destructive/10 border-2 border-destructive rounded-card text-destructive text-body-sm">
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-h4-md font-weight-semibold text-foreground border-b border-border pb-2">
              Schedule Type
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {SCHEDULE_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, schedule_type: type.value as typeof formData.schedule_type })}
                  className={`p-4 rounded-card border-2 text-left transition-colors ${
                    formData.schedule_type === type.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <p className="text-body-sm font-weight-semibold text-foreground">{type.label}</p>
                  <p className="text-body-xs text-muted-foreground mt-1">{type.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-h4-md font-weight-semibold text-foreground border-b border-border pb-2">
              Vendor & Event
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-body-sm font-weight-medium text-foreground mb-2">
                  Vendor *
                </label>
                <input
                  type="text"
                  placeholder="Enter vendor ID"
                  value={formData.vendor_profile_id}
                  onChange={(e) => setFormData({ ...formData, vendor_profile_id: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
                {errors.vendor_profile_id && (
                  <p className="mt-1 text-body-xs text-destructive">{errors.vendor_profile_id}</p>
                )}
              </div>
              <div>
                <label className="block text-body-sm font-weight-medium text-foreground mb-2">
                  Booking (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Link to booking"
                  value={formData.booking_id}
                  onChange={(e) => setFormData({ ...formData, booking_id: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-h4-md font-weight-semibold text-foreground border-b border-border pb-2">
              Date & Time
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-body-sm font-weight-medium text-foreground mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value, end_date: e.target.value || formData.end_date })}
                  className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
                {errors.start_date && (
                  <p className="mt-1 text-body-xs text-destructive">{errors.start_date}</p>
                )}
              </div>
              <div>
                <label className="block text-body-sm font-weight-medium text-foreground mb-2">
                  Start Time *
                </label>
                <input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
                {errors.start_time && (
                  <p className="mt-1 text-body-xs text-destructive">{errors.start_time}</p>
                )}
              </div>
              <div>
                <label className="block text-body-sm font-weight-medium text-foreground mb-2">
                  End Date *
                </label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
                {errors.end_date && (
                  <p className="mt-1 text-body-xs text-destructive">{errors.end_date}</p>
                )}
              </div>
              <div>
                <label className="block text-body-sm font-weight-medium text-foreground mb-2">
                  End Time *
                </label>
                <input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
                {errors.end_time && (
                  <p className="mt-1 text-body-xs text-destructive">{errors.end_time}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-h4-md font-weight-semibold text-foreground border-b border-border pb-2">
              Location & Access
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-body-sm font-weight-medium text-foreground mb-2">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Main Ballroom"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-body-sm font-weight-medium text-foreground mb-2">
                  Access Point
                </label>
                <input
                  type="text"
                  placeholder="e.g. Loading Dock B"
                  value={formData.access_point}
                  onChange={(e) => setFormData({ ...formData, access_point: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-body-sm font-weight-medium text-foreground mb-2">
                  Access Instructions
                </label>
                <textarea
                  rows={2}
                  placeholder="Parking, check-in procedures, security requirements..."
                  value={formData.access_instructions}
                  onChange={(e) => setFormData({ ...formData, access_instructions: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-h4-md font-weight-semibold text-foreground border-b border-border pb-2">
              Contact & Crew
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-body-sm font-weight-medium text-foreground mb-2">
                  Contact Name
                </label>
                <input
                  type="text"
                  placeholder="On-site contact"
                  value={formData.contact_name}
                  onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-body-sm font-weight-medium text-foreground mb-2">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  placeholder="Phone number"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-body-sm font-weight-medium text-foreground mb-2">
                  Crew Count
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.crew_count}
                  onChange={(e) => setFormData({ ...formData, crew_count: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-body-sm font-weight-medium text-foreground mb-2">
              Special Requirements
            </label>
            <textarea
              rows={2}
              placeholder="Power needs, equipment lists, special considerations..."
              value={formData.special_requirements}
              onChange={(e) => setFormData({ ...formData, special_requirements: e.target.value })}
              className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <a
              href="/vendor-schedules"
              className="px-4 py-2 border-2 border-border rounded-button text-body-sm font-weight-medium hover:bg-muted transition-colors"
            >
              Cancel
            </a>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary font-weight-medium text-body-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {createMutation.isPending ? 'Creating...' : 'Create Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
