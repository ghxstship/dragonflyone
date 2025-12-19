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
      const response = await fetch(`/api/weather?location=${encodeURIComponent(location || '')}`);
      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }
      return response.json() as Promise<WeatherData>;
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

export function useWeatherPageData() {
  const alertsQuery = useQuery({
    queryKey: ['weather-alerts'],
    queryFn: async () => {
      const response = await fetch('/api/weather/alerts');
      if (!response.ok) {
        throw new Error('Failed to fetch weather alerts');
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
      if (!response.ok) {
        throw new Error('Failed to fetch weather forecasts');
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
