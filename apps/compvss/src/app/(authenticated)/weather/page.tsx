"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CompvssAppLayout } from '../../../components/app-layout';
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
  Spinner,
  Container,
  Grid,
  Stack,
  Card,
  EnterprisePageHeader,
  MainContent,
} from "@ghxstship/ui";
import { useWeatherPageData, type WeatherAlert, type Forecast } from "@/hooks/useWeather";

export default function WeatherPage() {
  const router = useRouter();
  const [filterSeverity, setFilterSeverity] = useState("all");
  const {
    alerts: weatherAlerts,
    forecasts,
    isLoading: loading,
  } = useWeatherPageData();

  const filteredAlerts = weatherAlerts.filter((alert: WeatherAlert) =>
    filterSeverity === "all" || alert.severity.toLowerCase() === filterSeverity
  );

  const highSeverity = weatherAlerts.filter((a: WeatherAlert) => a.severity === "High").length;
  const activeAlerts = weatherAlerts.filter((a: WeatherAlert) => a.severity !== "Low").length;

  if (loading) {
    return (
      <CompvssAppLayout>
        <EnterprisePageHeader
          title="Weather Monitoring"
          subtitle="Track weather alerts and forecasts for event planning"
  
  
          showFavorite
          showSettings
        />
        <MainContent padding="lg">
          <Container className="flex min-h-[60vh] items-center justify-center">
            <Spinner variant="grey" size="lg" text="Loading weather data..." />
          </Container>
        </MainContent>
      </CompvssAppLayout>
    );
  }

  return (
    <CompvssAppLayout>
      <EnterprisePageHeader
        title="Weather Monitoring"
        subtitle="Track weather alerts and forecasts for event planning"


        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>

            <Grid cols={4} gap={6} className="sm:grid-cols-2 lg:grid-cols-4">
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
              <Table variant="dark">
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
                      <TableCell><Body size="sm" className="">{alert.location}</Body></TableCell>
                      <TableCell><Body size="sm" className="">{alert.alertType}</Body></TableCell>
                      <TableCell>
                        <Badge variant={alert.severity === "High" ? "solid" : "outline"}>{alert.severity}</Badge>
                      </TableCell>
                      <TableCell><Body className="font-mono">{alert.validUntil}</Body></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Stack>

            <Stack gap={4}>
              <H3>3-Day Forecast: Ultra Miami 2025</H3>
              <Grid cols={3} gap={6} className="sm:grid-cols-2 lg:grid-cols-3">
                {forecasts.map((day: Forecast, idx: number) => (
                  <Card key={idx}>
                    <Body className="font-mono">{day.date}</Body>
                    <Stack gap={2} direction="horizontal" className="mt-4 items-baseline">
                      <Body className="font-display">{day.high}°</Body>
                      <Body size="sm" className="">/ {day.low}°</Body>
                    </Stack>
                    <Body className="mt-3">{day.condition}</Body>
                    <Stack gap={2} className="mt-4 pt-4">
                      <Stack gap={2} direction="horizontal" className="justify-between">
                        <Body size="sm" className="">Precipitation</Body>
                        <Body>{day.precipitation}%</Body>
                      </Stack>
                      <Stack gap={2} direction="horizontal" className="justify-between">
                        <Body size="sm" className="">Wind</Body>
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
      </MainContent>
    </CompvssAppLayout>
  );
}
