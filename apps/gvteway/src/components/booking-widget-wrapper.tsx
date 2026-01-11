/**
 * Booking Widget Wrapper
 * Client component wrapper for booking widget with modal integration
 */

'use client';

import React, { useState, useCallback } from 'react';
import { BookingWidget } from '@/ui-v2/patterns/experience';
import { BookingModal } from '@/ui-v2/patterns/booking';
import type { Experience } from '@/ui-v2/patterns/experience/types';
import type { BookingConfirmation } from '@/ui-v2/patterns/booking/types';

interface BookingWidgetWrapperProps {
  experience: Experience;
}

export function BookingWidgetWrapper({ experience }: BookingWidgetWrapperProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookingData, setBookingData] = useState<any>(null);

  const handleBook = useCallback((details: any) => {
    // Store booking data from widget
    setBookingData({
      experienceId: experience.id,
      availabilityId: details.selectedDate?.id || '',
      startDate: details.selectedDate?.startDate || new Date(),
      endDate: details.selectedDate?.endDate || new Date(),
      guests: details.guests,
      selectedAddOns: Object.entries(details.selectedAddOns).map(([addOnId, quantity]) => ({
        addOnId,
        quantity: quantity as number,
      })),
      pricing: details.pricing,
    });

    // Open booking modal
    setIsModalOpen(true);
  }, [experience.id]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleBookingComplete = useCallback((confirmation: BookingConfirmation) => {
    console.log('Booking completed:', confirmation);
    // Could redirect to booking confirmation page
    // router.push(`/bookings/${confirmation.bookingId}`);
  }, []);

  return (
    <>
      <BookingWidget
        experience={experience}
        sticky
        onBook={handleBook}
      />

      {bookingData && (
        <BookingModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          initialData={bookingData}
          experienceTitle={experience.title}
          organizerName={experience.organizer.name}
          onBookingComplete={handleBookingComplete}
        />
      )}
    </>
  );
}
