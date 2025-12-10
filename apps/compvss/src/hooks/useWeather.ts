'use client';

import { useQuery } from '@tanstack/react-query';

export interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  forecast: {
    date: string;
    high: number;
    low: number;
    condition: string;
  }[];
}

export const useWeather = (location?: string) => {
  return useQuery({
    queryKey: ['weather', location],
    queryFn: async () => {
      const mockWeather: WeatherData = {
        location: location || 'Miami, FL',
        temperature: 78,
        condition: 'Partly Cloudy',
        humidity: 65,
        windSpeed: 12,
        forecast: [
          { date: '2024-11-25', high: 80, low: 72, condition: 'Sunny' },
          { date: '2024-11-26', high: 79, low: 71, condition: 'Cloudy' },
          { date: '2024-11-27', high: 77, low: 70, condition: 'Rain' },
        ],
      };
      return mockWeather;
    },
    enabled: !!location,
  });
};

// =============================================================================
// WEATHER PAGE HOOKS (API-based with demo fallback)
// =============================================================================

export interface WeatherAlert {
  id: string;
  event: string;
  location: string;
  alertType: string;
  severity: string;
  issued: string;
  validUntil: string;
  impactedEvents: number;
}

export interface Forecast {
  project: string;
  date: string;
  high: number;
  low: number;
  condition: string;
  precipitation: number;
  wind: number;
}

const DEMO_ALERTS: WeatherAlert[] = [
  { id: '1', event: 'Heat Advisory', location: 'Central Park', alertType: 'advisory', severity: 'moderate', issued: new Date().toISOString(), validUntil: new Date(Date.now() + 86400000).toISOString(), impactedEvents: 2 },
];

const DEMO_FORECASTS: Forecast[] = [
  { project: 'Summer Festival', date: new Date().toISOString(), high: 85, low: 72, condition: 'Sunny', precipitation: 10, wind: 8 },
  { project: 'Corporate Gala', date: new Date(Date.now() + 86400000).toISOString(), high: 78, low: 65, condition: 'Cloudy', precipitation: 30, wind: 12 },
];

export function useWeatherPageData() {
  const alertsQuery = useQuery({
    queryKey: ['weather-alerts'],
    queryFn: async () => {
      const response = await fetch('/api/weather/alerts');
      if (response.status === 401 || !response.ok) {
        return DEMO_ALERTS;
      }
      const data = await response.json();
      return data.alerts || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const forecastsQuery = useQuery({
    queryKey: ['weather-forecasts'],
    queryFn: async () => {
      const response = await fetch('/api/weather/forecasts');
      if (response.status === 401 || !response.ok) {
        return DEMO_FORECASTS;
      }
      const data = await response.json();
      return data.forecasts || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    alerts: alertsQuery.data || [],
    forecasts: forecastsQuery.data || [],
    isLoading: alertsQuery.isLoading || forecastsQuery.isLoading,
    error: alertsQuery.error || forecastsQuery.error,
    refetch: () => {
      alertsQuery.refetch();
      forecastsQuery.refetch();
    },
  };
}
