"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../components/navigation";
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
  EmptyState,
  Container,
  Grid,
  Stack,
  Card,
  CardBody,
  ProgressBar,
  Section,
} from "@ghxstship/ui";

interface Review {
  id: string;
  employee_id: string;
  reviewer_id: string;
  employee?: { id: string; full_name: string; email: string };
  reviewer?: { id: string; full_name: string; email: string };
  review_period: string;
  review_type: string;
  status: string;
  overall_score: number;
  strengths: string[];
  improvements: string[];
  scheduled_date: string;
  created_at: string;
}

interface Goal {
  id: string;
  employee_id: string;
  employee?: { id: string; full_name: string; email: string };
  title: string;
  description: string;
  target_date: string;
  progress: number;
  status: string;
  category: string;
}

interface PerformanceSummary {
  total_reviews: number;
  by_status: Record<string, number>;
  average_score: string;
  goals_on_track: number;
  goals_at_risk: number;
}

export default function PerformancePage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [summary, setSummary] = useState<PerformanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchPerformance = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus !== "all") {
        params.append("status", filterStatus);
      }
      params.append("include_goals", "true");

      const response = await fetch(`/api/performance?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch performance data");
      }
      const data = await response.json();
      setReviews(data.reviews || []);
      setGoals(data.goals || []);
      setSummary(data.summary || null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchPerformance();
  }, [fetchPerformance]);

  const getStatusVariant = (status: string): "solid" | "outline" | "ghost" => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "solid";
      case "in_progress":
      case "on_track":
        return "outline";
      default:
        return "ghost";
    }
  };

  const formatStatus = (status: string) => {
    return status?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || status;
  };

  if (loading) {
    return (
      <Section className="relative min-h-screen bg-black text-white">
        <Navigation />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading performance data..." />
        </Container>
      </Section>
    );
  }

  if (error) {
    return (
      <Section className="relative min-h-screen bg-black text-white">
        <Navigation />
        <Container className="py-16">
          <EmptyState
            title="Error Loading Performance Data"
            description={error}
            action={{ label: "Retry", onClick: fetchPerformance }}
          />
        </Container>
      </Section>
    );
  }

  return (
    <Section className="relative min-h-screen bg-black text-white">
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
          <H1>Performance Reviews</H1>

          <Grid cols={4} gap={6}>
            <StatCard
              value={summary?.total_reviews || 0}
              label="Total Reviews"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={summary?.by_status?.completed || 0}
              label="Completed"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={summary?.average_score || "0.0"}
              label="Avg Score"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={summary?.goals_on_track || 0}
              label="Goals On Track"
              className="bg-black text-white border-grey-800"
            />
          </Grid>

          <Stack gap={4} direction="horizontal">
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-black text-white border-grey-700"
            >
              <option value="all">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </Select>
          </Stack>

          <Stack gap={4}>
            <H3 className="text-white">Recent Reviews</H3>
            {reviews.length === 0 ? (
              <EmptyState
                title="No Reviews Found"
                description="Schedule your first performance review to get started"
                action={{ label: "Schedule Review", onClick: () => router.push("/performance/reviews/new") }}
              />
            ) : (
              <Table variant="bordered" className="bg-black">
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Reviewer</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviews.map((review) => (
                    <TableRow key={review.id} className="bg-black text-white hover:bg-grey-900">
                      <TableCell className="text-white">
                        {review.employee?.full_name || "—"}
                      </TableCell>
                      <TableCell className="text-grey-400">
                        {review.reviewer?.full_name || "—"}
                      </TableCell>
                      <TableCell className="font-mono text-grey-400">
                        {review.review_period}
                      </TableCell>
                      <TableCell>
                        <Badge variant="ghost">{formatStatus(review.review_type)}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-white">
                        {review.overall_score > 0 ? review.overall_score.toFixed(1) : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(review.status)}>
                          {formatStatus(review.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost" onClick={() => router.push(`/performance/reviews/${review.id}`)}>
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Stack>

          {goals.length > 0 && (
            <Stack gap={4}>
              <H3 className="text-white">Active Goals</H3>
              <Stack gap={4}>
                {goals.map((goal) => (
                  <Card key={goal.id} className="bg-black border-grey-800">
                    <CardBody>
                      <Stack gap={4} direction="horizontal" className="justify-between items-start">
                        <Stack gap={2} className="flex-1">
                          <H3 className="text-white">{goal.employee?.full_name || "Employee"}</H3>
                          <Body className="text-grey-300">{goal.title}</Body>
                          <Body className="text-sm text-grey-500">
                            Due: {goal.target_date ? new Date(goal.target_date).toLocaleDateString() : "—"}
                          </Body>
                        </Stack>
                        <Badge variant={getStatusVariant(goal.status)}>
                          {formatStatus(goal.status)}
                        </Badge>
                      </Stack>
                      <Stack gap={2} className="mt-4">
                        <Stack gap={4} direction="horizontal" className="justify-between text-sm">
                          <Body className="text-grey-500">Progress</Body>
                          <Body className="text-white">{goal.progress}%</Body>
                        </Stack>
                        <ProgressBar value={goal.progress} variant="inverse" />
                      </Stack>
                    </CardBody>
                  </Card>
                ))}
              </Stack>
            </Stack>
          )}

          <Stack gap={3} direction="horizontal">
            <Button variant="outlineWhite" onClick={() => router.push("/performance/reviews/new")}>
              Schedule Review
            </Button>
            <Button variant="ghost" className="text-grey-400 hover:text-white" onClick={() => router.push("/performance/goals/new")}>
              Set Goals
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Section>
  );
}
