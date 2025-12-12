"use client";

import { useParams, useRouter } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Button, Body, Grid, StatCard } from "@ghxstship/ui";
import { BarChart, TrendingUp, Users, DollarSign, Clock, Target } from "lucide-react";
import { atlvsDemoProductions } from "../../../../data/atlvs";

export default function ProductionMetricsPage() {
  const params = useParams();
  const router = useRouter();
  const productionId = params?.productionId as string;
  const production = atlvsDemoProductions.find((p) => p.id === productionId);

  const metrics = {
    attendance: 4500,
    revenue: 225000,
    satisfaction: 4.7,
    onTime: 92,
    budget: 95,
    safety: 100,
  };

  return (
    <Stack gap={8}>
      <Stack gap={4}>
        <SectionHeader
          kicker={production?.name || "Production"}
          title="Metrics & KPIs"
          description="Performance tracking and analytics"
          colorScheme="on-dark"
        />
        <Stack direction="horizontal" gap={2}>
          <Button variant="outline" size="sm" onClick={() => router.push(`/p/${productionId}/metrics/reports`)}>
            <BarChart size={16} className="mr-2" />
            Reports
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push(`/p/${productionId}/metrics/export`)}>
            Export Data
          </Button>
        </Stack>
      </Stack>

      <Grid cols={3} gap={4}>
        <StatCard label="Attendance" value={metrics.attendance.toLocaleString()} icon={<Users size={20} />} trend="up" trendValue="+12% vs target" inverted />
        <StatCard label="Revenue" value={`$${(metrics.revenue / 1000).toFixed(0)}K`} icon={<DollarSign size={20} />} trend="up" trendValue="+8% vs budget" inverted />
        <StatCard label="Satisfaction" value={`${metrics.satisfaction}/5`} icon={<Target size={20} />} trend="up" trendValue="Above target" inverted />
        <StatCard label="On-Time Delivery" value={`${metrics.onTime}%`} icon={<Clock size={20} />} trend="up" inverted />
        <StatCard label="Budget Adherence" value={`${metrics.budget}%`} icon={<TrendingUp size={20} />} trend="up" inverted />
        <StatCard label="Safety Score" value={`${metrics.safety}%`} icon={<Target size={20} />} trend="up" trendValue="No incidents" inverted />
      </Grid>

      <Card variant="elevated" inverted>
        <CardBody>
          <Stack gap={4}>
            <Body className="font-weight-bold text-white">Performance Summary</Body>
            <Body size="sm" className=" text-on-dark-muted">
              This production is performing above expectations across all key metrics. 
              Attendance exceeded targets by 12%, revenue is 8% above budget, and customer 
              satisfaction remains high at 4.7/5. All safety protocols have been followed 
              with zero incidents reported.
            </Body>
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}
