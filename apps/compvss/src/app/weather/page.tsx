"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CreatorNavigationAuthenticated } from "../../components/navigation";
import {
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
  PageLayout,
  SectionHeader,
  EnterprisePageHeader,
  MainContent,} from "@ghxstship/ui";

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
      <PageLayout background="white" header={<CreatorNavigationAuthenticated />}>
        <Section className="min-h-screen py-16">
          <Container className="flex min-h-[60vh] items-center justify-center">
            <LoadingSpinner size="lg" text="Loading weather data..." />
          </Container>
        </Section>
      </PageLayout>
    );
  }

  return (
    <PageLayout background="white" header={<CreatorNavigationAuthenticated />}>
      <Section className="min-h-screen py-16">
        <Container>
          <Stack gap={10}>
            <EnterprisePageHeader
        title="Weather Monitoring"
        subtitle="Track weather alerts and forecasts for event planning"
        breadcrumbs={[{ label: 'COMPVSS', href: '/dashboard' }, { label: 'Weather' }]}
        views={[
          { id: 'default', label: 'Default', icon: 'grid' },
        ]}
        activeView="default"
        showFavorite
        showSettings
      />

            <Grid cols={4} gap={6}>
              <StatCard
                value={activeAlerts.toString()}
                label="Active Alerts"
              />
              <StatCard
                value={highSeverity.toString()}
                label="High Severity"
              />
              <StatCard
                value="8"
                label="Monitored Events"
              />
              <StatCard
                value="5"
                label="Contingencies Ready"
              />
            </Grid>

            <Stack gap={4} direction="horizontal">
              <Select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
              >
                <option value="all">All Severities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </Select>
            </Stack>

            <Stack gap={4}>
              <H3>Active Weather Alerts</H3>
              <Table>
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
                    <TableRow key={alert.id}>
                      <TableCell><Body className="font-mono">{alert.id}</Body></TableCell>
                      <TableCell><Body>{alert.event}</Body></TableCell>
                      <TableCell><Body className="text-body-sm">{alert.location}</Body></TableCell>
                      <TableCell><Body className="text-body-sm">{alert.alertType}</Body></TableCell>
                      <TableCell>
                        <Badge variant={alert.severity === "High" ? "solid" : "outline"}>{alert.severity}</Badge>
                      </TableCell>
                      <TableCell><Body className="font-mono text-body-sm">{alert.validUntil}</Body></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Stack>

            <Stack gap={4}>
              <H3>3-Day Forecast: Ultra Miami 2025</H3>
              <Grid cols={3} gap={6}>
                {forecasts.map((day: Forecast, idx: number) => (
                  <Card key={idx}>
                    <Body className="font-mono text-body-sm">{day.date}</Body>
                    <Stack gap={2} direction="horizontal" className="mt-4 items-baseline">
                      <Body className="font-display">{day.high}°</Body>
                      <Body className="text-body-sm">/ {day.low}°</Body>
                    </Stack>
                    <Body className="mt-3 text-body-sm">{day.condition}</Body>
                    <Stack gap={2} className="mt-4 pt-4">
                      <Stack gap={2} direction="horizontal" className="justify-between text-body-sm">
                        <Body className="text-body-sm">Precipitation</Body>
                        <Body>{day.precipitation}%</Body>
                      </Stack>
                      <Stack gap={2} direction="horizontal" className="justify-between text-body-sm">
                        <Body className="text-body-sm">Wind</Body>
                        <Body>{day.wind} mph</Body>
                      </Stack>
                    </Stack>
                  </Card>
                ))}
              </Grid>
            </Stack>

            <Stack gap={3} direction="horizontal">
              <Button variant="solid" onClick={() => router.push('/weather/alerts/configure')}>
                Configure Alerts
              </Button>
              <Button variant="outline" onClick={() => router.push('/weather/contingency')}>
                View Contingency Plans
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Section>
    </PageLayout>
  );
}
