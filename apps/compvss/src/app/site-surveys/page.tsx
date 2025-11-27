"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CreatorNavigationAuthenticated } from "../../components/navigation";
import {
  H1,
  H2,
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
  Section,
  useNotifications,
} from "@ghxstship/ui";

interface SiteSurvey {
  id: string;
  survey_number: string;
  project_id: string;
  project_name: string;
  venue_id: string;
  venue_name: string;
  venue_address: string;
  survey_date: string;
  surveyor_id: string;
  surveyor_name: string;
  survey_type: string;
  status: string;
  findings_count: number;
  photos_count: number;
  documents_count: number;
  power_assessment?: string;
  rigging_assessment?: string;
  load_in_assessment?: string;
  notes?: string;
}

interface SurveySummary {
  total_surveys: number;
  pending_surveys: number;
  completed_surveys: number;
  venues_surveyed: number;
  issues_identified: number;
  photos_captured: number;
}

export default function SiteSurveysPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const [surveys, setSurveys] = useState<SiteSurvey[]>([]);
  const [summary, setSummary] = useState<SurveySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");

  const fetchSurveys = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus !== "all") params.append("status", filterStatus);
      if (filterType !== "all") params.append("type", filterType);

      const response = await fetch(`/api/site-surveys?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch site surveys");
      
      const data = await response.json();
      setSurveys(data.surveys || []);
      setSummary(data.summary || null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterType]);

  useEffect(() => {
    fetchSurveys();
  }, [fetchSurveys]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusVariant = (status: string): "solid" | "outline" | "ghost" => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "approved":
        return "solid";
      case "scheduled":
      case "in_progress":
        return "outline";
      case "cancelled":
      case "pending":
        return "ghost";
      default:
        return "ghost";
    }
  };

  const getAssessmentColor = (assessment?: string) => {
    switch (assessment?.toLowerCase()) {
      case "good":
      case "adequate":
        return "text-success-400";
      case "fair":
      case "limited":
        return "text-warning-400";
      case "poor":
      case "inadequate":
        return "text-error-400";
      default:
        return "text-ink-400";
    }
  };

  if (loading) {
    return (
      <Section className="relative min-h-screen bg-black text-white">
        <CreatorNavigationAuthenticated />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading site surveys..." />
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
            title="Error Loading Site Surveys"
            description={error}
            action={{ label: "Retry", onClick: fetchSurveys }}
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
          <Stack gap={2}>
            <H1>Site Surveys</H1>
            <Body className="text-ink-400">
              Venue assessments, technical specifications, and site documentation
            </Body>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard
              value={summary?.total_surveys || 0}
              label="Total Surveys"
              className="bg-black text-white border-ink-800"
            />
            <StatCard
              value={summary?.pending_surveys || 0}
              label="Pending"
              className="bg-black text-white border-ink-800"
            />
            <StatCard
              value={summary?.venues_surveyed || 0}
              label="Venues Surveyed"
              className="bg-black text-white border-ink-800"
            />
            <StatCard
              value={summary?.photos_captured || 0}
              label="Photos Captured"
              className="bg-black text-white border-ink-800"
            />
          </Grid>

          <Card className="p-6 bg-black border-ink-800">
            <Stack gap={4}>
              <H2>Survey Checklist Categories</H2>
              <Grid cols={4} gap={4}>
                <Card className="p-4 bg-ink-900 border-ink-700">
                  <Stack gap={2}>
                    <Body className="text-ink-400 text-body-sm uppercase tracking-widest">Power/Electrical</Body>
                    <Body className="text-body-sm text-ink-300">Main service, distro, generator access</Body>
                  </Stack>
                </Card>
                <Card className="p-4 bg-ink-900 border-ink-700">
                  <Stack gap={2}>
                    <Body className="text-ink-400 text-body-sm uppercase tracking-widest">Rigging Points</Body>
                    <Body className="text-body-sm text-ink-300">Grid height, weight limits, motor positions</Body>
                  </Stack>
                </Card>
                <Card className="p-4 bg-ink-900 border-ink-700">
                  <Stack gap={2}>
                    <Body className="text-ink-400 text-body-sm uppercase tracking-widest">Load-In Access</Body>
                    <Body className="text-body-sm text-ink-300">Dock, doors, floor load, staging areas</Body>
                  </Stack>
                </Card>
                <Card className="p-4 bg-ink-900 border-ink-700">
                  <Stack gap={2}>
                    <Body className="text-ink-400 text-body-sm uppercase tracking-widest">FOH/BOH</Body>
                    <Body className="text-body-sm text-ink-300">Mix position, dressing rooms, green room</Body>
                  </Stack>
                </Card>
              </Grid>
            </Stack>
          </Card>

          <Stack gap={4} direction="horizontal">
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-black text-white border-ink-700"
            >
              <option value="all">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="approved">Approved</option>
            </Select>
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-black text-white border-ink-700"
            >
              <option value="all">All Types</option>
              <option value="initial">Initial Survey</option>
              <option value="technical">Technical Advance</option>
              <option value="follow_up">Follow-up</option>
              <option value="final_walk">Final Walk</option>
            </Select>
          </Stack>

          {surveys.length === 0 ? (
            <EmptyState
              title="No Site Surveys"
              description="Schedule your first site survey"
              action={{ label: "Schedule Survey", onClick: () => {} }}
            />
          ) : (
            <Table variant="bordered" className="bg-black">
              <TableHeader>
                <TableRow>
                  <TableHead>Survey #</TableHead>
                  <TableHead>Venue</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Surveyor</TableHead>
                  <TableHead>Power</TableHead>
                  <TableHead>Rigging</TableHead>
                  <TableHead>Load-In</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {surveys.map((survey) => (
                  <TableRow key={survey.id} className="bg-black text-white hover:bg-ink-900">
                    <TableCell className="font-mono text-white">
                      {survey.survey_number}
                    </TableCell>
                    <TableCell>
                      <Stack gap={1}>
                        <Body className="text-white">{survey.venue_name}</Body>
                        <Body className="text-ink-500 text-body-sm">{survey.venue_address}</Body>
                      </Stack>
                    </TableCell>
                    <TableCell className="text-ink-400">
                      {survey.project_name}
                    </TableCell>
                    <TableCell className="font-mono text-ink-400">
                      {formatDate(survey.survey_date)}
                    </TableCell>
                    <TableCell className="text-ink-400">
                      {survey.surveyor_name}
                    </TableCell>
                    <TableCell className={getAssessmentColor(survey.power_assessment)}>
                      {survey.power_assessment || "—"}
                    </TableCell>
                    <TableCell className={getAssessmentColor(survey.rigging_assessment)}>
                      {survey.rigging_assessment || "—"}
                    </TableCell>
                    <TableCell className={getAssessmentColor(survey.load_in_assessment)}>
                      {survey.load_in_assessment || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(survey.status)}>
                        {survey.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <Stack gap={3} direction="horizontal">
            <Button variant="outlineWhite" onClick={() => router.push('/site-surveys/schedule')}>
              Schedule Survey
            </Button>
            <Button variant="ghost" className="text-ink-400 hover:text-white" onClick={() => router.push('/site-surveys/templates')}>
              Survey Templates
            </Button>
            <Button variant="ghost" className="text-ink-400 hover:text-white" onClick={() => router.push('/site-surveys/export')}>
              Export Reports
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Section>
  );
}
