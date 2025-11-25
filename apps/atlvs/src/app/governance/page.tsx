"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../components/navigation";
import {
  H1,
  H2,
  Body,
  StatCard,
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

interface BoardMeeting {
  id: string;
  title: string;
  meeting_type: string;
  scheduled_date: string;
  location: string;
  status: string;
  attendees: string[];
  agenda_items: string[];
  minutes_url?: string;
  resolutions?: string[];
}

interface GovernanceDocument {
  id: string;
  title: string;
  document_type: string;
  version: string;
  effective_date: string;
  review_date: string;
  owner: string;
  status: string;
}

interface GovernanceSummary {
  total_meetings: number;
  upcoming_meetings: number;
  total_documents: number;
  pending_reviews: number;
  board_members: number;
  committees: number;
}

export default function GovernancePage() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const [meetings, setMeetings] = useState<BoardMeeting[]>([]);
  const [documents, setDocuments] = useState<GovernanceDocument[]>([]);
  const [summary, setSummary] = useState<GovernanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"meetings" | "documents">("meetings");

  const fetchGovernanceData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/governance");
      if (!response.ok) throw new Error("Failed to fetch governance data");
      
      const data = await response.json();
      setMeetings(data.meetings || []);
      setDocuments(data.documents || []);
      setSummary(data.summary || null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGovernanceData();
  }, [fetchGovernanceData]);

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
      case "active":
        return "solid";
      case "scheduled":
      case "pending":
        return "outline";
      case "draft":
      case "cancelled":
        return "ghost";
      default:
        return "ghost";
    }
  };

  if (loading) {
    return (
      <Section className="relative min-h-screen bg-black text-white">
        <Navigation />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading governance data..." />
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
            title="Error Loading Governance Data"
            description={error}
            action={{ label: "Retry", onClick: fetchGovernanceData }}
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
          <Stack gap={2}>
            <H1>Corporate Governance</H1>
            <Body className="text-grey-400">
              Board meetings, corporate policies, and governance documentation
            </Body>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard
              value={summary?.board_members || 0}
              label="Board Members"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={summary?.committees || 0}
              label="Committees"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={summary?.upcoming_meetings || 0}
              label="Upcoming Meetings"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={summary?.pending_reviews || 0}
              label="Pending Reviews"
              className="bg-black text-white border-grey-800"
            />
          </Grid>

          <Card className="p-6 bg-black border-grey-800">
            <Stack gap={4}>
              <H2>Board of Directors</H2>
              <Grid cols={4} gap={4}>
                <Card className="p-4 bg-grey-900 border-grey-700">
                  <Stack gap={2}>
                    <Body className="text-grey-400 text-sm uppercase tracking-wider">Chair</Body>
                    <Body className="text-lg font-bold">Marcus Chen</Body>
                    <Body className="text-sm text-grey-400">CEO & Founder</Body>
                  </Stack>
                </Card>
                <Card className="p-4 bg-grey-900 border-grey-700">
                  <Stack gap={2}>
                    <Body className="text-grey-400 text-sm uppercase tracking-wider">Director</Body>
                    <Body className="text-lg">Sarah Williams</Body>
                    <Body className="text-sm text-grey-400">CFO</Body>
                  </Stack>
                </Card>
                <Card className="p-4 bg-grey-900 border-grey-700">
                  <Stack gap={2}>
                    <Body className="text-grey-400 text-sm uppercase tracking-wider">Director</Body>
                    <Body className="text-lg">James Rodriguez</Body>
                    <Body className="text-sm text-grey-400">Independent</Body>
                  </Stack>
                </Card>
                <Card className="p-4 bg-grey-900 border-grey-700">
                  <Stack gap={2}>
                    <Body className="text-grey-400 text-sm uppercase tracking-wider">Director</Body>
                    <Body className="text-lg">Emily Park</Body>
                    <Body className="text-sm text-grey-400">Independent</Body>
                  </Stack>
                </Card>
              </Grid>
            </Stack>
          </Card>

          <Stack gap={4} direction="horizontal">
            <Button 
              variant={activeTab === "meetings" ? "solid" : "ghost"}
              onClick={() => setActiveTab("meetings")}
            >
              Board Meetings
            </Button>
            <Button 
              variant={activeTab === "documents" ? "solid" : "ghost"}
              onClick={() => setActiveTab("documents")}
            >
              Governance Documents
            </Button>
          </Stack>

          {activeTab === "meetings" && (
            <>
              {meetings.length === 0 ? (
                <EmptyState
                  title="No Meetings Scheduled"
                  description="Schedule your first board meeting"
                  action={{ label: "Schedule Meeting", onClick: () => {} }}
                />
              ) : (
                <Table variant="bordered" className="bg-black">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Meeting</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Attendees</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {meetings.map((meeting) => (
                      <TableRow key={meeting.id} className="bg-black text-white hover:bg-grey-900">
                        <TableCell className="text-white font-medium">
                          {meeting.title}
                        </TableCell>
                        <TableCell className="text-grey-400">
                          {meeting.meeting_type}
                        </TableCell>
                        <TableCell className="font-mono text-grey-400">
                          {formatDate(meeting.scheduled_date)}
                        </TableCell>
                        <TableCell className="text-grey-400">
                          {meeting.location}
                        </TableCell>
                        <TableCell className="text-grey-400">
                          {meeting.attendees?.length || 0} members
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(meeting.status)}>
                            {meeting.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Stack gap={2} direction="horizontal">
                            <Button size="sm" variant="ghost" onClick={() => router.push(`/governance/meetings/${meeting.id}`)}>
                              View
                            </Button>
                            {meeting.minutes_url && (
                              <Button size="sm" variant="ghost" onClick={() => window.open(meeting.minutes_url, '_blank')}>
                                Minutes
                              </Button>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </>
          )}

          {activeTab === "documents" && (
            <>
              {documents.length === 0 ? (
                <EmptyState
                  title="No Documents Found"
                  description="Upload your first governance document"
                  action={{ label: "Upload Document", onClick: () => {} }}
                />
              ) : (
                <Table variant="bordered" className="bg-black">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Version</TableHead>
                      <TableHead>Effective Date</TableHead>
                      <TableHead>Review Date</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((doc) => (
                      <TableRow key={doc.id} className="bg-black text-white hover:bg-grey-900">
                        <TableCell className="text-white font-medium">
                          {doc.title}
                        </TableCell>
                        <TableCell className="text-grey-400">
                          {doc.document_type}
                        </TableCell>
                        <TableCell className="font-mono text-grey-400">
                          v{doc.version}
                        </TableCell>
                        <TableCell className="font-mono text-grey-400">
                          {formatDate(doc.effective_date)}
                        </TableCell>
                        <TableCell className="font-mono text-grey-400">
                          {formatDate(doc.review_date)}
                        </TableCell>
                        <TableCell className="text-grey-400">
                          {doc.owner}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(doc.status)}>
                            {doc.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </>
          )}

          <Stack gap={3} direction="horizontal">
            <Button variant="outlineWhite" onClick={() => router.push(activeTab === "meetings" ? '/governance/meetings/new' : '/governance/documents/upload')}>
              {activeTab === "meetings" ? "Schedule Meeting" : "Upload Document"}
            </Button>
            <Button variant="ghost" className="text-grey-400 hover:text-white" onClick={() => router.push('/governance/export')}>
              Export Records
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Section>
  );
}
