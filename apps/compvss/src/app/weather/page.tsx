"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CreatorNavigationAuthenticated } from "../../components/navigation";
import {
  H1,
  H3,
  Body,
  StatCard,
  Select,
  Button,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  LoadingSpinner,
  Container,
  Grid,
  Stack,
  Card,
  Section,
} from "@ghxstship/ui";

interface WeatherAlert {
  id: string;
  event: string;
  location: string;
  alertType: string;
  severity: string;
  issued: string;
  validUntil: string;
  impactedEvents: number;
}

interface Forecast {
  project: string;
  date: string;
  high: number;
  low: number;
  condition: string;
  precipitation: number;
  wind: number;
}

export default function WeatherPage() {
  const router = useRouter();
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [weatherAlerts, setWeatherAlerts] = useState<WeatherAlert[]>([]);
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWeatherData = useCallback(async () => {
    try {
      setLoading(true);
      const [alertsRes, forecastsRes] = await Promise.all([
        fetch('/api/weather/alerts'),
        fetch('/api/weather/forecasts'),
      ]);
      
      if (alertsRes.ok) {
        const alertsData = await alertsRes.json();
        setWeatherAlerts(alertsData.alerts || []);
      }
      
      if (forecastsRes.ok) {
        const forecastsData = await forecastsRes.json();
        setForecasts(forecastsData.forecasts || []);
      }
    } catch (err) {
      console.error('Failed to fetch weather data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeatherData();
  }, [fetchWeatherData]);

  const filteredAlerts = weatherAlerts.filter((alert: WeatherAlert) =>
    filterSeverity === "all" || alert.severity.toLowerCase() === filterSeverity
  );

  const highSeverity = weatherAlerts.filter((a: WeatherAlert) => a.severity === "High").length;
  const activeAlerts = weatherAlerts.filter((a: WeatherAlert) => a.severity !== "Low").length;

  if (loading) {
    return (
      <Section className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
        <CreatorNavigationAuthenticated />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading weather data..." />
        </Container>
      </Section>
    );
  }

  return (
    <Section className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <CreatorNavigationAuthenticated />
      <Container className="py-16">
        <Stack gap={8}>
          <H1>Weather Monitoring</H1>

          <Grid cols={4} gap={6}>
            <StatCard
              value={activeAlerts}
              label="Active Alerts"
              className="bg-black text-white border-ink-800"
            />
            <StatCard
              value={highSeverity}
              label="High Severity"
              className="bg-black text-white border-ink-800"
            />
            <StatCard
              value={8}
              label="Monitored Events"
              className="bg-black text-white border-ink-800"
            />
            <StatCard
              value={5}
              label="Contingencies Ready"
              className="bg-black text-white border-ink-800"
            />
          </Grid>

          <Stack gap={4} direction="horizontal">
            <Select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-black text-white border-ink-700"
            >
              <option value="all">All Severities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </Select>
          </Stack>

          <Stack gap={4}>
            <H3>Active Weather Alerts</H3>
            <Table variant="bordered" className="bg-black">
              <TableHeader>
                <TableRow>
                  <TableHead>Alert ID</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Alert Type</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Valid Until</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAlerts.map((alert: WeatherAlert) => (
                  <TableRow key={alert.id} className="bg-black text-white hover:bg-ink-900">
                    <TableCell className="font-mono text-white">{alert.id}</TableCell>
                    <TableCell className="text-white">{alert.event}</TableCell>
                    <TableCell className="text-ink-300">{alert.location}</TableCell>
                    <TableCell className="text-ink-300">{alert.alertType}</TableCell>
                    <TableCell>
                      <Badge variant={alert.severity === "High" ? "solid" : "outline"}>{alert.severity}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-ink-400">{alert.validUntil}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Stack>

          <Stack gap={4}>
            <H3>3-Day Forecast: Ultra Miami 2025</H3>
            <Grid cols={3} gap={6}>
              {forecasts.map((day: Forecast, idx: number) => (
                <Card key={idx} className="border-2 border-ink-800 p-6 bg-black">
                  <Body className="font-mono text-mono-xs uppercase tracking-widest text-ink-500">{day.date}</Body>
                  <Stack gap={2} direction="horizontal" className="mt-4 items-baseline">
                    <Body className="font-display text-h3-md text-white">{day.high}°</Body>
                    <Body className="text-ink-400">/ {day.low}°</Body>
                  </Stack>
                  <Body className="mt-3 text-body-sm text-white">{day.condition}</Body>
                  <Stack gap={2} className="mt-4 border-t border-ink-800 pt-4">
                    <Stack gap={2} direction="horizontal" className="justify-between text-body-sm">
                      <Body className="text-ink-500">Precipitation</Body>
                      <Body className="text-white">{day.precipitation}%</Body>
                    </Stack>
                    <Stack gap={2} direction="horizontal" className="justify-between text-body-sm">
                      <Body className="text-ink-500">Wind</Body>
                      <Body className="text-white">{day.wind} mph</Body>
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </Grid>
          </Stack>

          <Stack gap={3} direction="horizontal">
            <Button variant="outlineWhite" onClick={() => router.push('/weather/alerts/configure')}>
              Configure Alerts
            </Button>
            <Button variant="ghost" className="text-ink-400 hover:text-white" onClick={() => router.push('/weather/contingency')}>
              View Contingency Plans
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Section>
  );
}
