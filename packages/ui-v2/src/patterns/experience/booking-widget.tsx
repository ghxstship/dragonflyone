/**
 * Booking Widget Component
 * Sticky widget for experience booking with price calculation
 */

'use client';

import React, { useState, useMemo } from 'react';
import type { BookingWidgetProps, BookingCalculation, AvailableDate } from './types';
import './booking-widget.css';

export function BookingWidget({ experience, sticky = true, onBook }: BookingWidgetProps) {
  const [selectedDate, setSelectedDate] = useState<AvailableDate | null>(null);
  const [guests, setGuests] = useState(experience.groupSize.min);
  const [selectedAddOns, setSelectedAddOns] = useState<Record<string, number>>({});

  // Calculate pricing
  const pricing: BookingCalculation = useMemo(() => {
    const basePrice = selectedDate?.price || experience.pricing.basePrice;
    const subtotal = basePrice * guests;

    // Calculate add-ons total
    const addOnsTotal = Object.entries(selectedAddOns).reduce((total, [addOnId, quantity]) => {
      const addOn = experience.addOns?.find((a) => a.id === addOnId);
      return total + (addOn ? addOn.price * quantity : 0);
    }, 0);

    // Service fee (10%)
    const serviceFee = (subtotal + addOnsTotal) * 0.1;

    // Tax (8%)
    const tax = (subtotal + addOnsTotal) * 0.08;

    // Group discount (5% for 5+ guests)
    const discount = guests >= 5 ? (subtotal + addOnsTotal) * 0.05 : 0;

    const total = subtotal + addOnsTotal + serviceFee + tax - discount;

    return {
      subtotal,
      addOnsTotal,
      serviceFee,
      tax,
      discount,
      total,
      currency: experience.pricing.currency,
    };
  }, [selectedDate, guests, selectedAddOns, experience]);

  const handleGuestChange = (delta: number) => {
    const newValue = guests + delta;
    if (newValue >= experience.groupSize.min && newValue <= experience.groupSize.max) {
      setGuests(newValue);
    }
  };

  const handleAddOnToggle = (addOnId: string) => {
    setSelectedAddOns((prev) => {
      const current = prev[addOnId] || 0;
      if (current > 0) {
        const { [addOnId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [addOnId]: 1 };
    });
  };

  const handleAddOnQuantityChange = (addOnId: string, delta: number) => {
    setSelectedAddOns((prev) => {
      const addOn = experience.addOns?.find((a) => a.id === addOnId);
      if (!addOn) return prev;

      const current = prev[addOnId] || 0;
      const newValue = current + delta;
      const maxQuantity = addOn.maxQuantity || 10;

      if (newValue <= 0) {
        const { [addOnId]: _, ...rest } = prev;
        return rest;
      }

      if (newValue > maxQuantity) return prev;

      return { ...prev, [addOnId]: newValue };
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: pricing.currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const canBook = selectedDate && guests >= experience.groupSize.min;

  return (
    <div className={`booking-widget ${sticky ? 'booking-widget--sticky' : ''}`}>
      <div className="booking-widget__card">
        {/* Price Header */}
        <div className="booking-widget__header">
          <div className="booking-widget__price-display">
            <span className="booking-widget__price">
              {formatCurrency(experience.pricing.basePrice)}
            </span>
            <span className="booking-widget__price-unit">/person</span>
          </div>
          {experience.availability.spotsLeft < 10 && (
            <div className="booking-widget__urgency">
              Only {experience.availability.spotsLeft} spots left!
            </div>
          )}
        </div>

        <div className="booking-widget__divider" />

        {/* Date Selection */}
        <div className="booking-widget__section">
          <label className="booking-widget__label">Select Date</label>
          <select
            className="booking-widget__select"
            value={selectedDate?.id || ''}
            onChange={(e) => {
              const date = experience.availability.dates.find((d) => d.id === e.target.value);
              setSelectedDate(date || null);
            }}
          >
            <option value="">Choose your dates</option>
            {experience.availability.dates
              .filter((date) => date.spotsAvailable > 0)
              .map((date) => (
                <option key={date.id} value={date.id}>
                  {new Date(date.startDate).toLocaleDateString()} -{' '}
                  {new Date(date.endDate).toLocaleDateString()} ({date.spotsAvailable} spots
                  available)
                </option>
              ))}
          </select>
        </div>

        {/* Guest Count */}
        <div className="booking-widget__section">
          <label className="booking-widget__label">Number of Guests</label>
          <div className="booking-widget__counter">
            <button
              className="booking-widget__counter-btn"
              onClick={() => handleGuestChange(-1)}
              disabled={guests <= experience.groupSize.min}
              aria-label="Decrease guests"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            <span className="booking-widget__counter-value">{guests} guests</span>
            <button
              className="booking-widget__counter-btn"
              onClick={() => handleGuestChange(1)}
              disabled={guests >= experience.groupSize.max}
              aria-label="Increase guests"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>
          <div className="booking-widget__hint">
            Min: {experience.groupSize.min}, Max: {experience.groupSize.max}
          </div>
        </div>

        {/* Add-ons */}
        {experience.addOns && experience.addOns.length > 0 && (
          <div className="booking-widget__section">
            <label className="booking-widget__label">Add-ons (Optional)</label>
            <div className="booking-widget__addons">
              {experience.addOns.map((addOn) => (
                <div key={addOn.id} className="booking-widget__addon">
                  <div className="booking-widget__addon-header">
                    <input
                      type="checkbox"
                      checked={(selectedAddOns[addOn.id] || 0) > 0}
                      onChange={() => handleAddOnToggle(addOn.id)}
                      id={`addon-${addOn.id}`}
                      className="booking-widget__addon-checkbox"
                    />
                    <label htmlFor={`addon-${addOn.id}`} className="booking-widget__addon-label">
                      <span className="booking-widget__addon-name">{addOn.name}</span>
                      <span className="booking-widget__addon-price">{formatCurrency(addOn.price)}</span>
                    </label>
                  </div>
                  {addOn.description && (
                    <div className="booking-widget__addon-description">{addOn.description}</div>
                  )}
                  {selectedAddOns[addOn.id] > 0 && addOn.maxQuantity && addOn.maxQuantity > 1 && (
                    <div className="booking-widget__addon-quantity">
                      <button
                        className="booking-widget__quantity-btn"
                        onClick={() => handleAddOnQuantityChange(addOn.id, -1)}
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span>{selectedAddOns[addOn.id]}</span>
                      <button
                        className="booking-widget__quantity-btn"
                        onClick={() => handleAddOnQuantityChange(addOn.id, 1)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="booking-widget__divider" />

        {/* Price Breakdown */}
        <div className="booking-widget__breakdown">
          <div className="booking-widget__breakdown-item">
            <span>
              {formatCurrency(selectedDate?.price || experience.pricing.basePrice)} × {guests} guests
            </span>
            <span>{formatCurrency(pricing.subtotal)}</span>
          </div>

          {pricing.addOnsTotal > 0 && (
            <div className="booking-widget__breakdown-item">
              <span>Add-ons</span>
              <span>{formatCurrency(pricing.addOnsTotal)}</span>
            </div>
          )}

          <div className="booking-widget__breakdown-item">
            <span>Service fee</span>
            <span>{formatCurrency(pricing.serviceFee)}</span>
          </div>

          <div className="booking-widget__breakdown-item">
            <span>Tax</span>
            <span>{formatCurrency(pricing.tax)}</span>
          </div>

          {pricing.discount > 0 && (
            <div className="booking-widget__breakdown-item booking-widget__breakdown-item--discount">
              <span>Group discount</span>
              <span>-{formatCurrency(pricing.discount)}</span>
            </div>
          )}

          <div className="booking-widget__divider" />

          <div className="booking-widget__breakdown-item booking-widget__breakdown-item--total">
            <span>Total</span>
            <span>{formatCurrency(pricing.total)}</span>
          </div>
        </div>

        {/* CTA Button */}
        <button
          className="booking-widget__cta"
          disabled={!canBook}
          onClick={() => {
            if (canBook && selectedDate) {
              onBook({
                experienceId: experience.id,
                selectedDate,
                guests,
                addOns: Object.entries(selectedAddOns).map(([addOnId, quantity]) => ({
                  addOnId,
                  quantity,
                })),
                contactInfo: {
                  firstName: '',
                  lastName: '',
                  email: '',
                  phone: '',
                },
              });
            }
          }}
        >
          {canBook ? 'Reserve Your Spot' : 'Select Dates to Book'}
        </button>

        {/* Trust Signals */}
        <div className="booking-widget__trust">
          <div className="booking-widget__trust-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>Free cancellation up to 7 days before</span>
          </div>
          <div className="booking-widget__trust-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>Secure payment processing</span>
          </div>
          <div className="booking-widget__trust-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>Instant confirmation</span>
          </div>
        </div>
      </div>
    </div>
  );
}

BookingWidget.displayName = 'BookingWidget';
