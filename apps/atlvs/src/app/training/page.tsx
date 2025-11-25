"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../components/navigation";
import {
  H1,
  H3,
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
  Section,
  useNotifications,
} from "@ghxstship/ui";

interface TrainingProgram {
  id: string;
  title: string;
  description: string;
  category: string;
  duration_hours: number;
  instructor_name: string;
  instructor?: { id: string; full_name: string; email: string };
  capacity: number;
  enrolled_count: number;
  start_date: string;
  end_date: string;
  status: string;
  is_virtual: boolean;
  created_at: string;
}

interface TrainingCompletion {
  id: string;
  completed_at: string;
  score: number;
  employee?: { id: string; full_name: string; email: string };
  program?: { id: string; title: string };
}

interface TrainingSummary {
  total_programs: number;
  active_programs: number;
  total_enrolled: number;
  by_category: Record<string, number>;
}

export default function TrainingPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [completions, setCompletions] = useState<TrainingCompletion[]>([]);
  const [summary, setSummary] = useState<TrainingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");

  const fetchTraining = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus !== "all") {
        params.append("status", filterStatus);
      }
      if (filterCategory !== "all") {
        params.append("category", filterCategory);
      }

      const response = await fetch(`/api/training?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch training programs");
      }
      const data = await response.json();
      setPrograms(data.programs || []);
      setCompletions(data.recent_completions || []);
      setSummary(data.summary || null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterCategory]);

  useEffect(() => {
    fetchTraining();
  }, [fetchTraining]);

  const getStatusVariant = (status: string): "solid" | "outline" | "ghost" => {
    switch (status?.toLowerCase()) {
      case "active":
        return "solid";
      case "full":
      case "completed":
        return "outline";
      default:
        return "ghost";
    }
  };

  if (loading) {
    return (
      <Section className="relative min-h-screen bg-black text-white">
        <Navigation />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading training programs..." />
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
            title="Error Loading Training"
            description={error}
            action={{ label: "Retry", onClick: fetchTraining }}
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
          <H1>Training & Development</H1>

          <Grid cols={4} gap={6}>
            <StatCard
              value={summary?.active_programs || 0}
              label="Active Programs"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={summary?.total_enrolled || 0}
              label="Total Enrolled"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={`${summary?.total_programs || 0}`}
              label="Total Programs"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={completions.length}
              label="Recent Completions"
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
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="full">Full</option>
              <option value="completed">Completed</option>
            </Select>
            <Select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-black text-white border-grey-700"
            >
              <option value="all">All Categories</option>
              <option value="safety">Safety</option>
              <option value="management">Management</option>
              <option value="compliance">Compliance</option>
              <option value="technical">Technical</option>
              <option value="soft_skills">Soft Skills</option>
              <option value="certification">Certification</option>
            </Select>
          </Stack>

          <Stack gap={4}>
            <H3 className="text-white">Available Programs</H3>
            {programs.length === 0 ? (
              <EmptyState
                title="No Programs Found"
                description="Create your first training program to get started"
                action={{ label: "Create Program", onClick: () => router.push("/training/new") }}
              />
            ) : (
              <Table variant="bordered" className="bg-black">
                <TableHeader>
                  <TableRow>
                    <TableHead>Program</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Instructor</TableHead>
                    <TableHead>Enrolled</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {programs.map((program) => (
                    <TableRow key={program.id} className="bg-black text-white hover:bg-grey-900">
                      <TableCell className="text-white">{program.title}</TableCell>
                      <TableCell>
                        <Badge variant="ghost">{program.category?.replace("_", " ")}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-grey-400">
                        {program.duration_hours} hours
                      </TableCell>
                      <TableCell className="text-grey-400">
                        {program.instructor?.full_name || program.instructor_name || "—"}
                      </TableCell>
                      <TableCell className="font-mono text-white">
                        {program.enrolled_count || 0}/{program.capacity}
                      </TableCell>
                      <TableCell className="font-mono text-grey-400">
                        {program.start_date
                          ? new Date(program.start_date).toLocaleDateString()
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(program.status)}>{program.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Stack gap={2} direction="horizontal">
                          <Button size="sm" variant="ghost" onClick={() => router.push(`/training/${program.id}`)}>
                            View
                          </Button>
                          {program.status === "active" && (
                            <Button size="sm" variant="outline" onClick={() => router.push(`/training/${program.id}/enroll`)}>
                              Enroll
                            </Button>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Stack>

          {completions.length > 0 && (
            <Stack gap={4}>
              <H3 className="text-white">Recent Completions</H3>
              <Table variant="bordered" className="bg-black">
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead>Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completions.map((record) => (
                    <TableRow key={record.id} className="bg-black text-white hover:bg-grey-900">
                      <TableCell className="text-white">
                        {record.employee?.full_name || "—"}
                      </TableCell>
                      <TableCell className="text-grey-400">
                        {record.program?.title || "—"}
                      </TableCell>
                      <TableCell className="font-mono text-grey-400">
                        {record.completed_at
                          ? new Date(record.completed_at).toLocaleDateString()
                          : "—"}
                      </TableCell>
                      <TableCell className="font-mono text-white">
                        {record.score ? `${record.score}%` : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Stack>
          )}

          <Stack gap={3} direction="horizontal">
            <Button variant="outlineWhite" onClick={() => router.push("/training/new")}>
              Create Program
            </Button>
            <Button variant="ghost" className="text-grey-400 hover:text-white" onClick={() => router.push("/training/enroll")}>
              Enroll Employee
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Section>
  );
}
