import { describe, it, expect } from 'vitest';
import type { WeatherData } from '../useWeather';

describe('useWeather', () => {
  describe('WeatherData interface', () => {
    it('should have all required fields', () => {
      const weather: WeatherData = {
        location: 'Miami, FL',
        temperature: 78,
        condition: 'Partly Cloudy',
        humidity: 65,
        windSpeed: 12,
        forecast: [],
      };

      expect(weather.location).toBe('Miami, FL');
      expect(weather.temperature).toBe(78);
      expect(weather.condition).toBe('Partly Cloudy');
      expect(weather.humidity).toBe(65);
      expect(weather.windSpeed).toBe(12);
    });

    it('should support forecast array', () => {
      const weather: WeatherData = {
        location: 'Los Angeles, CA',
        temperature: 72,
        condition: 'Sunny',
        humidity: 45,
        windSpeed: 8,
        forecast: [
          { date: '2025-01-15', high: 75, low: 60, condition: 'Sunny' },
          { date: '2025-01-16', high: 73, low: 58, condition: 'Cloudy' },
          { date: '2025-01-17', high: 70, low: 55, condition: 'Rain' },
        ],
      };

      expect(weather.forecast.length).toBe(3);
      expect(weather.forecast[0].high).toBe(75);
      expect(weather.forecast[0].low).toBe(60);
      expect(weather.forecast[0].condition).toBe('Sunny');
    });

    it('should support various weather conditions', () => {
      const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rain', 'Thunderstorm', 'Snow', 'Fog'];
      
      conditions.forEach((condition) => {
        const weather: WeatherData = {
          location: 'Test City',
          temperature: 70,
          condition,
          humidity: 50,
          windSpeed: 10,
          forecast: [],
        };
        expect(weather.condition).toBe(condition);
      });
    });

    it('should handle extreme temperatures', () => {
      const hotWeather: WeatherData = {
        location: 'Phoenix, AZ',
        temperature: 115,
        condition: 'Sunny',
        humidity: 10,
        windSpeed: 5,
        forecast: [],
      };
      expect(hotWeather.temperature).toBe(115);

      const coldWeather: WeatherData = {
        location: 'Anchorage, AK',
        temperature: -10,
        condition: 'Snow',
        humidity: 80,
        windSpeed: 20,
        forecast: [],
      };
      expect(coldWeather.temperature).toBe(-10);
    });

    it('should support multi-day forecast', () => {
      const weather: WeatherData = {
        location: 'New York, NY',
        temperature: 55,
        condition: 'Cloudy',
        humidity: 70,
        windSpeed: 15,
        forecast: [
          { date: '2025-01-15', high: 58, low: 45, condition: 'Cloudy' },
          { date: '2025-01-16', high: 52, low: 40, condition: 'Rain' },
          { date: '2025-01-17', high: 48, low: 35, condition: 'Rain' },
          { date: '2025-01-18', high: 45, low: 32, condition: 'Snow' },
          { date: '2025-01-19', high: 50, low: 38, condition: 'Sunny' },
        ],
      };

      expect(weather.forecast.length).toBe(5);
      expect(weather.forecast[3].condition).toBe('Snow');
    });

    it('should track humidity percentage', () => {
      const dryWeather: WeatherData = {
        location: 'Las Vegas, NV',
        temperature: 95,
        condition: 'Sunny',
        humidity: 15,
        windSpeed: 8,
        forecast: [],
      };
      expect(dryWeather.humidity).toBe(15);

      const humidWeather: WeatherData = {
        location: 'Houston, TX',
        temperature: 85,
        condition: 'Partly Cloudy',
        humidity: 90,
        windSpeed: 5,
        forecast: [],
      };
      expect(humidWeather.humidity).toBe(90);
    });

    it('should track wind speed', () => {
      const calmWeather: WeatherData = {
        location: 'Denver, CO',
        temperature: 65,
        condition: 'Sunny',
        humidity: 30,
        windSpeed: 2,
        forecast: [],
      };
      expect(calmWeather.windSpeed).toBe(2);

      const windyWeather: WeatherData = {
        location: 'Chicago, IL',
        temperature: 45,
        condition: 'Cloudy',
        humidity: 60,
        windSpeed: 35,
        forecast: [],
      };
      expect(windyWeather.windSpeed).toBe(35);
    });
  });
});
