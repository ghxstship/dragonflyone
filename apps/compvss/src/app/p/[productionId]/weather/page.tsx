'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
  SectionHeader,
  Card,
  CardBody,
  Stack,
  StatCard,
  Button,
  Badge,
  Grid,
  Body,
  H3,
} from '@ghxstship/ui';
import {
  Cloud,
  Sun,
  CloudRain,
  Wind,
  Thermometer,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { CompvssAppLayout } from '../../../../components/app-layout';
import { log } from '@ghxstship/config';

interface WeatherForecast {
  date: string;
  condition: 'sunny' | 'cloudy' | 'rain' | 'storm';
  tempHigh: number;
  tempLow: number;
  precipitation: number;
  wind: number;
  alert?: string;
}

export default function ProductionWeatherPage() {
  const params = useParams();
  const productionId = params?.productionId as string;
  const [forecast, setForecast] = useState<WeatherForecast[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchWeather = useCallback(async () => {
    if (!productionId) return;
    setIsRefreshing(true);
    try {
      const response = await fetch(`/api/productions/${productionId}/weather`);
      if (response.ok) {
        const data = await response.json();
        if (data.forecast && data.forecast.length > 0) {
          setForecast(data.forecast);
        }
      }
    } catch (error) {
      log.error('Failed to fetch weather:', error instanceof Error ? error : undefined);
    } finally {
      setIsRefreshing(false);
    }
  }, [productionId]);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  const getConditionIcon = (condition: WeatherForecast['condition']) => {
    switch (condition) {
      case 'sunny': return <Sun size={24} className="text-warning" />;
      case 'cloudy': return <Cloud size={24} className="text-grey-400" />;
      case 'rain': return <CloudRain size={24} className="text-info" />;
      case 'storm': return <CloudRain size={24} className="text-error" />;
    }
  };

  const hasAlerts = forecast.some(f => f.alert);

  useEffect(() => {
    const interval = setInterval(fetchWeather, 300000);
    return () => clearInterval(interval);
  }, [fetchWeather]);

  return (
    <CompvssAppLayout>
      <Stack gap={8}>
        <Stack direction="horizontal" className="items-start justify-between">
          <SectionHeader kicker="Production" title="Weather Monitor" description="Weather forecast and contingency planning" colorScheme="on-dark" />
          <Button variant="outline" onClick={fetchWeather} disabled={isRefreshing}>
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          </Button>
        </Stack>

        <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Today" value={`${forecast[0]?.tempHigh}°F`} icon={<Thermometer size={20} />} inverted />
          <StatCard label="Precipitation" value={`${forecast[0]?.precipitation}%`} icon={<CloudRain size={20} />} inverted />
          <StatCard label="Wind" value={`${forecast[0]?.wind} mph`} icon={<Wind size={20} />} inverted />
          <StatCard label="Alerts" value={hasAlerts ? 'Active' : 'None'} icon={<AlertTriangle size={20} />} inverted />
        </Grid>

        {hasAlerts && (
          <Card className="border-2 border-warning">
            <CardBody>
              <Stack direction="horizontal" gap={3} className="items-center">
                <AlertTriangle size={24} className="text-warning" />
                <Stack gap={1}>
                  <H3 className="text-warning">Weather Alert</H3>
                  {forecast.filter(f => f.alert).map((f, i) => (
                    <Body key={i} className="text-on-dark-muted">{f.date}: {f.alert}</Body>
                  ))}
                </Stack>
              </Stack>
            </CardBody>
          </Card>
        )}

        <Card variant="elevated" inverted>
          <CardBody>
            <Stack gap={4}>
              <H3 className="text-white">5-Day Forecast</H3>
              <Grid cols={3} gap={4} className="sm:grid-cols-2 lg:grid-cols-3">
                {forecast.map((day, index) => (
                  <Card key={index} variant="elevated" inverted>
                    <CardBody>
                      <Stack gap={3} className="items-center text-center">
                        <Body className="font-weight-semibold text-white">
                          {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </Body>
                        {getConditionIcon(day.condition)}
                        <Stack gap={1}>
                          <Body className="font-weight-bold text-white">{day.tempHigh}°</Body>
                          <Body size="sm" className=" text-on-dark-muted">{day.tempLow}°</Body>
                        </Stack>
                        <Stack direction="horizontal" gap={2}>
                          <Badge variant={day.precipitation > 30 ? 'warning' : 'info'}>{day.precipitation}%</Badge>
                        </Stack>
                        {day.alert && <AlertTriangle size={16} className="text-warning" />}
                      </Stack>
                    </CardBody>
                  </Card>
                ))}
              </Grid>
            </Stack>
          </CardBody>
        </Card>

        <Card variant="elevated" inverted>
          <CardBody>
            <Stack direction="horizontal" className="items-center justify-between">
              <Stack gap={1}>
                <H3 className="text-white">Contingency Plan</H3>
                <Body className="text-on-dark-muted">Weather contingency procedures for outdoor elements</Body>
              </Stack>
              <Button variant="solid"><AlertTriangle size={16} className="mr-2" />Activate Contingency</Button>
            </Stack>
          </CardBody>
        </Card>
      </Stack>
    </CompvssAppLayout>
  );
}
