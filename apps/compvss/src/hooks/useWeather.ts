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
      // Mock weather data - integrate with weather API service
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
