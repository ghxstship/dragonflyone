/**
 * Itinerary Section Component
 * Day-by-day timeline of experience activities
 */

import React from 'react';
import type { ItineraryDay } from './types';
import './itinerary-section.css';

interface ItinerarySectionProps {
  itinerary: ItineraryDay[];
}

export function ItinerarySection({ itinerary }: ItinerarySectionProps) {
  if (!itinerary || itinerary.length === 0) {
    return null;
  }

  return (
    <section className="itinerary-section" id="itinerary">
      <h2 className="itinerary-section__title">Itinerary</h2>
      <p className="itinerary-section__subtitle">
        Day-by-day breakdown of your experience
      </p>

      <div className="itinerary-timeline">
        {itinerary.map((day) => (
          <ItineraryDayCard key={day.id} day={day} />
        ))}
      </div>
    </section>
  );
}

interface ItineraryDayCardProps {
  day: ItineraryDay;
}

function ItineraryDayCard({ day }: ItineraryDayCardProps) {
  return (
    <div className="itinerary-day">
      {/* Timeline connector */}
      <div className="itinerary-day__connector">
        <div className="itinerary-day__dot">
          <span className="itinerary-day__day-number">{day.dayNumber}</span>
        </div>
        <div className="itinerary-day__line" />
      </div>

      {/* Day content */}
      <div className="itinerary-day__content">
        <div className="itinerary-day__header">
          <h3 className="itinerary-day__title">
            <span className="itinerary-day__label">Day {day.dayNumber}</span>
            {day.title}
          </h3>
        </div>

        {day.description && (
          <p className="itinerary-day__description">{day.description}</p>
        )}

        {/* Activities */}
        {day.activities && day.activities.length > 0 && (
          <div className="itinerary-day__activities">
            {day.activities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface ActivityItemProps {
  activity: {
    id: string;
    time: string;
    name: string;
    description: string;
    location?: string;
    duration?: string;
  };
}

function ActivityItem({ activity }: ActivityItemProps) {
  return (
    <div className="activity-item">
      <div className="activity-item__time">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <span>{activity.time}</span>
      </div>

      <div className="activity-item__content">
        <h4 className="activity-item__name">{activity.name}</h4>
        <p className="activity-item__description">{activity.description}</p>

        {(activity.location || activity.duration) && (
          <div className="activity-item__meta">
            {activity.location && (
              <div className="activity-item__meta-item">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>{activity.location}</span>
              </div>
            )}
            {activity.duration && (
              <div className="activity-item__meta-item">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>{activity.duration}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

ItinerarySection.displayName = 'ItinerarySection';
