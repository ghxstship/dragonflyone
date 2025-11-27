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
  LoadingSpinner,
  EmptyState,
  Container,
  Grid,
  Stack,
  Card,
  CardBody,
  Section,
} from "@ghxstship/ui";

interface Scenario {
  id: string;
  name: string;
  description: string;
  category: string;
  scenario_type: string;
  revenue_forecast: number;
  cost_forecast: number;
  probability: number;
  impact_level: string;
  assumptions: string[];
  status: string;
  created_at: string;
}

interface ScenarioSummary {
  total: number;
  best_case_revenue: number;
  base_case_revenue: number;
  worst_case_revenue: number;
}

export default function ScenariosPage() {
  const router = useRouter();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [summary, setSummary] = useState<ScenarioSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState("all");

  const fetchScenarios = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterCategory !== "all") {
        params.append("category", filterCategory);
      }

      const response = await fetch(`/api/scenarios?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch scenarios");
      }
      const data = await response.json();
      setScenarios(data.scenarios || []);
      setSummary(data.summary || null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [filterCategory]);

  useEffect(() => {
    fetchScenarios();
  }, [fetchScenarios]);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount.toFixed(0)}`;
  };

  const getImpactVariant = (impact: string): "solid" | "outline" | "ghost" => {
    switch (impact?.toLowerCase()) {
      case "critical":
      case "high":
        return "solid";
      case "medium":
        return "outline";
      default:
        return "ghost";
    }
  };

  if (loading) {
    return (
      <Section className="relative min-h-screen bg-black text-white">
        <CreatorNavigationAuthenticated />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading scenarios..." />
        </Container>
      </Section>
    );
  }

  if (error) {
    return (
      <Section className="relative min-h-screen bg-black text-white">
        <CreatorNavigationAuthenticated />
        <Container className="py-16">
          <EmptyState
            title="Error Loading Scenarios"
            description={error}
            action={{ label: "Retry", onClick: fetchScenarios }}
          />
        </Container>
      </Section>
    );
  }

  return (
    <Section className="relative min-h-screen bg-black text-white">
      <CreatorNavigationAuthenticated />
      <Container className="py-16">
        <Stack gap={8}>
          <H1>Scenario Planning</H1>

          <Grid cols={4} gap={6}>
            <StatCard
              value={summary?.total || scenarios.length}
              label="Active Scenarios"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={formatCurrency(summary?.best_case_revenue || 0)}
              label="Best Case"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={formatCurrency(summary?.base_case_revenue || 0)}
              label="Base Case"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={formatCurrency(summary?.worst_case_revenue || 0)}
              label="Worst Case"
              className="bg-black text-white border-grey-800"
            />
          </Grid>

          <Stack gap={4} direction="horizontal">
            <Select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-black text-white border-grey-700"
            >
              <option value="all">All Categories</option>
              <option value="financial">Financial</option>
              <option value="operational">Operational</option>
              <option value="market">Market</option>
              <option value="strategic">Strategic</option>
              <option value="risk">Risk</option>
            </Select>
          </Stack>

          {scenarios.length === 0 ? (
            <EmptyState
              title="No Scenarios Found"
              description="Create your first scenario to start planning"
              action={{ label: "Create Scenario", onClick: () => router.push("/scenarios/new") }}
            />
          ) : (
            <Stack gap={6}>
              {scenarios.map((scenario) => (
                <Card key={scenario.id} className="bg-black border-grey-800">
                  <CardBody className="space-y-4">
                    <Stack gap={4} direction="horizontal" className="justify-between items-start">
                      <Stack gap={1}>
                        <H3 className="text-white">{scenario.name}</H3>
                        <Body className="font-mono text-xs uppercase tracking-wider text-grey-500">
                          {scenario.scenario_type?.replace("_", " ")}
                        </Body>
                      </Stack>
                      <Badge variant="outline">{scenario.category}</Badge>
                    </Stack>

                    <Grid cols={3} gap={4}>
                      <Card className="bg-grey-900 border-grey-700">
                        <CardBody>
                          <Body className="font-mono text-xs uppercase tracking-wider text-grey-500">
                            Revenue Forecast
                          </Body>
                          <H3 className="mt-2 text-white">
                            {formatCurrency(scenario.revenue_forecast || 0)}
                          </H3>
                        </CardBody>
                      </Card>
                      <Card className="bg-grey-900 border-grey-700">
                        <CardBody>
                          <Body className="font-mono text-xs uppercase tracking-wider text-grey-500">
                            Probability
                          </Body>
                          <H3 className="mt-2 text-white">{scenario.probability || 0}%</H3>
                        </CardBody>
                      </Card>
                      <Card className="bg-grey-900 border-grey-700">
                        <CardBody>
                          <Body className="font-mono text-xs uppercase tracking-wider text-grey-500">
                            Impact
                          </Body>
                          <Stack gap={2} direction="horizontal" className="mt-2 items-center">
                            <Badge variant={getImpactVariant(scenario.impact_level)}>
                              {scenario.impact_level || "Unknown"}
                            </Badge>
                          </Stack>
                        </CardBody>
                      </Card>
                    </Grid>

                    {scenario.assumptions && scenario.assumptions.length > 0 && (
                      <Stack gap={2}>
                        <Body className="font-mono text-xs uppercase tracking-wider text-grey-500">
                          Key Assumptions
                        </Body>
                        <Stack gap={2}>
                          {scenario.assumptions.map((assumption, idx) => (
                            <Body key={idx} className="text-sm text-grey-300">
                              • {assumption}
                            </Body>
                          ))}
                        </Stack>
                      </Stack>
                    )}
                  </CardBody>
                </Card>
              ))}
            </Stack>
          )}

          <Stack gap={3} direction="horizontal">
            <Button variant="outlineWhite" onClick={() => router.push("/scenarios/new")}>
              Create Scenario
            </Button>
            <Button variant="ghost" className="text-grey-400 hover:text-white" onClick={() => router.push("/scenarios/compare")}>
              Compare Scenarios
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Section>
  );
}
