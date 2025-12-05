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

interface WeatherForecast {
  date: string;
  condition: 'sunny' | 'cloudy' | 'rain' | 'storm';
  tempHigh: number;
  tempLow: number;
  precipitation: number;
  wind: number;
  alert?: string;
}

const MOCK_FORECAST: WeatherForecast[] = [
  { date: '2024-11-18', condition: 'sunny', tempHigh: 72, tempLow: 58, precipitation: 0, wind: 8 },
  { date: '2024-11-19', condition: 'cloudy', tempHigh: 68, tempLow: 55, precipitation: 10, wind: 12 },
  { date: '2024-11-20', condition: 'rain', tempHigh: 62, tempLow: 52, precipitation: 60, wind: 15, alert: 'Rain expected - prepare contingency' },
  { date: '2024-11-21', condition: 'cloudy', tempHigh: 65, tempLow: 54, precipitation: 20, wind: 10 },
  { date: '2024-11-22', condition: 'sunny', tempHigh: 70, tempLow: 56, precipitation: 5, wind: 6 },
];

export default function ProductionWeatherPage() {
  const params = useParams();
  const _productionId = params?.productionId as string;
  const [forecast, setForecast] = useState(MOCK_FORECAST);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getConditionIcon = (condition: WeatherForecast['condition']) => {
    switch (condition) {
      case 'sunny': return <Sun size={24} className="text-warning" />;
      case 'cloudy': return <Cloud size={24} className="text-grey-400" />;
      case 'rain': return <CloudRain size={24} className="text-info" />;
      case 'storm': return <CloudRain size={24} className="text-error" />;
    }
  };

  const hasAlerts = forecast.some(f => f.alert);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  }, []);

  useEffect(() => {
    const interval = setInterval(handleRefresh, 300000);
    return () => clearInterval(interval);
  }, [handleRefresh]);

  return (
    <CompvssAppLayout>
      <Stack gap={8}>
        <Stack direction="horizontal" className="items-start justify-between">
          <SectionHeader kicker="Production" title="Weather Monitor" description="Weather forecast and contingency planning" colorScheme="on-dark" />
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          </Button>
        </Stack>

        <Grid cols={4} gap={4}>
          <StatCard label="Today" value={`${forecast[0]?.tempHigh}°F`} icon={getConditionIcon(forecast[0]?.condition || 'sunny')} inverted />
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
              <Grid cols={3} gap={4}>
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
                          <Body className="text-body-sm text-on-dark-muted">{day.tempLow}°</Body>
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
