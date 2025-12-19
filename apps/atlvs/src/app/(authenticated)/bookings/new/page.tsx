'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Calendar, Users, MapPin, DollarSign, Check } from 'lucide-react';
import { useSpaces } from '@/hooks/useSpaces';
import { useCreateBooking } from '@/hooks/useBookings';

type WizardStep = 'details' | 'space' | 'services' | 'review';

export default function NewBookingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<WizardStep>('details');
  const [formData, setFormData] = useState({
    event_name: '',
    event_date: '',
    start_time: '',
    end_time: '',
    guest_count: '',
    event_type: '',
    space_id: '',
    notes: '',
  });

  const { data: spacesData } = useSpaces();
  const createBooking = useCreateBooking();

  const spaces = spacesData?.spaces || [];

  const steps: { id: WizardStep; label: string }[] = [
    { id: 'details', label: 'Event Details' },
    { id: 'space', label: 'Select Space' },
    { id: 'services', label: 'Add Services' },
    { id: 'review', label: 'Review' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id);
    }
  };

  const handleSubmit = async () => {
    try {
      const result = await createBooking.mutateAsync({
        event_name: formData.event_name,
        event_date: formData.event_date,
        start_time: formData.start_time || undefined,
        end_time: formData.end_time || undefined,
        guest_count_expected: parseInt(formData.guest_count) || undefined,
        event_type: formData.event_type || undefined,
        space_id: formData.space_id || undefined,
        notes: formData.notes || undefined,
        status: 'draft',
      });
      if (result?.booking?.id) {
        router.push(`/bookings/${result.booking.id}`);
      } else {
        router.push('/bookings');
      }
    } catch (error) {
      // Error handled by mutation
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="border-b border-border bg-background">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/bookings"
              className="p-2 hover:bg-muted rounded-button transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            </Link>
            <h1 className="text-h3-md font-weight-bold text-foreground">New Booking</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-avatar flex items-center justify-center text-body-sm font-weight-medium ${
                    index < currentStepIndex
                      ? 'bg-success text-white'
                      : index === currentStepIndex
                        ? 'bg-primary text-white'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {index < currentStepIndex ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className={`text-body-sm ${
                  index <= currentStepIndex ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-0.5 mx-4 ${
                  index < currentStepIndex ? 'bg-success' : 'bg-border'
                }`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-background border-2 border-border rounded-card p-6">
          {currentStep === 'details' && (
            <div className="space-y-6">
              <h2 className="text-h4-md font-weight-semibold text-foreground">Event Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-body-sm font-weight-medium text-foreground mb-1">
                    Event Name *
                  </label>
                  <input
                    type="text"
                    name="event_name"
                    value={formData.event_name}
                    onChange={handleChange}
                    placeholder="e.g., Annual Company Gala"
                    className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-body-sm font-weight-medium text-foreground mb-1">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    name="event_date"
                    value={formData.event_date}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-body-sm font-weight-medium text-foreground mb-1">
                    Guest Count
                  </label>
                  <input
                    type="number"
                    name="guest_count"
                    value={formData.guest_count}
                    onChange={handleChange}
                    placeholder="Expected guests"
                    className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-body-sm font-weight-medium text-foreground mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-body-sm font-weight-medium text-foreground mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    name="end_time"
                    value={formData.end_time}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-body-sm font-weight-medium text-foreground mb-1">
                    Event Type
                  </label>
                  <select
                    name="event_type"
                    value={formData.event_type}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                  >
                    <option value="">Select event type...</option>
                    <option value="wedding">Wedding</option>
                    <option value="corporate">Corporate Event</option>
                    <option value="social">Social Gathering</option>
                    <option value="conference">Conference</option>
                    <option value="gala">Gala</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'space' && (
            <div className="space-y-6">
              <h2 className="text-h4-md font-weight-semibold text-foreground">Select Space</h2>
              <div className="grid grid-cols-2 gap-4">
                {spaces.map((space) => (
                  <button
                    key={space.id}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, space_id: space.id }))}
                    className={`p-4 rounded-card border-2 text-left transition-colors ${
                      formData.space_id === space.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-body-md font-weight-semibold text-foreground">
                        {space.name}
                      </h3>
                      {formData.space_id === space.id && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-body-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {space.capacity} guests
                      </span>
                      {space.base_price && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          ${space.base_price}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              {spaces.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No spaces available
                </div>
              )}
            </div>
          )}

          {currentStep === 'services' && (
            <div className="space-y-6">
              <h2 className="text-h4-md font-weight-semibold text-foreground">Add Services</h2>
              <div className="text-center py-12 bg-muted/30 border-2 border-dashed border-border rounded-card">
                <p className="text-body-md text-muted-foreground">
                  Service selection coming soon
                </p>
                <p className="text-body-sm text-muted-foreground mt-1">
                  You can add services after creating the booking
                </p>
              </div>
              <div>
                <label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  Additional Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Any special requirements or notes..."
                  className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary resize-none"
                />
              </div>
            </div>
          )}

          {currentStep === 'review' && (
            <div className="space-y-6">
              <h2 className="text-h4-md font-weight-semibold text-foreground">Review Booking</h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-body-xs text-muted-foreground">Event</p>
                      <p className="text-body-md font-weight-medium text-foreground">
                        {formData.event_name || 'Untitled'}
                      </p>
                      <p className="text-body-sm text-muted-foreground">
                        {formatDate(formData.event_date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-body-xs text-muted-foreground">Guests</p>
                      <p className="text-body-md font-weight-medium text-foreground">
                        {formData.guest_count || 'TBD'} expected
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-body-xs text-muted-foreground">Space</p>
                      <p className="text-body-md font-weight-medium text-foreground">
                        {spaces.find((s) => s.id === formData.space_id)?.name || 'Not selected'}
                      </p>
                    </div>
                  </div>
                  {formData.start_time && (
                    <div>
                      <p className="text-body-xs text-muted-foreground">Time</p>
                      <p className="text-body-md font-weight-medium text-foreground">
                        {formData.start_time} - {formData.end_time || 'TBD'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              {formData.notes && (
                <div className="p-4 bg-muted/30 rounded-card">
                  <p className="text-body-xs text-muted-foreground mb-1">Notes</p>
                  <p className="text-body-sm text-foreground">{formData.notes}</p>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-6 mt-6 border-t border-border">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStepIndex === 0}
              className="flex items-center gap-2 px-4 py-2 border-2 border-border rounded-button hover:bg-muted transition-colors disabled:opacity-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            {currentStep === 'review' ? (
              <button
                onClick={handleSubmit}
                disabled={createBooking.isPending || !formData.event_name || !formData.event_date}
                className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {createBooking.isPending ? 'Creating...' : 'Create Booking'}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
