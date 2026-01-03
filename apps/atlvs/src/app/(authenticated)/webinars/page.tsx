"use client";

/**
 * Webinars Page - Authenticated Experience
 * Live and recorded webinar sessions with registration and viewing
 * Bold Contemporary Pop Art Adventure Design System
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Video, Calendar, Clock, Users, Play, 
  CalendarPlus, Bell, CheckCircle, ExternalLink
} from "lucide-react";
import {
  HubPage, Card, Stack, Box, Body, Button, Badge, Avatar, Text
} from "@ghxstship/ui";
import { useAuthContext, ATLVS_ADMIN_ROLES } from "@ghxstship/config";

interface Webinar {
  id: string;
  title: string;
  description: string;
  host: {
    name: string;
    initials: string;
    role: string;
  };
  category: string;
  date: string;
  time: string;
  duration: string;
  attendees: number;
  maxAttendees: number;
  isLive: boolean;
  isRecorded: boolean;
  isRegistered: boolean;
  thumbnail?: string;
}

const DEMO_WEBINARS: Webinar[] = [
  {
    id: "1",
    title: "Production Planning Masterclass",
    description: "Learn advanced techniques for planning large-scale productions with multiple vendors and tight deadlines.",
    host: { name: "Sarah Mitchell", initials: "SM", role: "Head of Training" },
    category: "Production",
    date: "2026-01-15",
    time: "2:00 PM EST",
    duration: "90 min",
    attendees: 156,
    maxAttendees: 200,
    isLive: false,
    isRecorded: false,
    isRegistered: true,
  },
  {
    id: "2",
    title: "Financial Reporting Deep Dive",
    description: "Master the art of financial reporting for productions. Generate insights that drive better decisions.",
    host: { name: "Michael Chen", initials: "MC", role: "Finance Director" },
    category: "Finance",
    date: "2026-01-22",
    time: "11:00 AM EST",
    duration: "60 min",
    attendees: 89,
    maxAttendees: 150,
    isLive: false,
    isRecorded: false,
    isRegistered: false,
  },
  {
    id: "3",
    title: "Q&A: Getting Started with ATLVS",
    description: "Live Q&A session for new users. Get your questions answered by our product experts.",
    host: { name: "Emily Rodriguez", initials: "ER", role: "Customer Success" },
    category: "Getting Started",
    date: "2026-01-08",
    time: "3:00 PM EST",
    duration: "45 min",
    attendees: 234,
    maxAttendees: 300,
    isLive: true,
    isRecorded: false,
    isRegistered: true,
  },
  {
    id: "4",
    title: "Advanced Budget Management",
    description: "Take your budget management skills to the next level with advanced forecasting and variance analysis.",
    host: { name: "James Wilson", initials: "JW", role: "Senior Consultant" },
    category: "Finance",
    date: "2025-12-15",
    time: "1:00 PM EST",
    duration: "75 min",
    attendees: 312,
    maxAttendees: 300,
    isLive: false,
    isRecorded: true,
    isRegistered: false,
  },
  {
    id: "5",
    title: "Team Collaboration Best Practices",
    description: "Discover how top production teams use ATLVS to collaborate effectively across departments.",
    host: { name: "Lisa Park", initials: "LP", role: "Operations Lead" },
    category: "Operations",
    date: "2025-12-08",
    time: "10:00 AM EST",
    duration: "60 min",
    attendees: 278,
    maxAttendees: 250,
    isLive: false,
    isRecorded: true,
    isRegistered: true,
  },
];

const CATEGORIES = [
  { id: "all", label: "All Webinars", count: 24 },
  { id: "production", label: "Production", count: 8 },
  { id: "finance", label: "Finance", count: 6 },
  { id: "operations", label: "Operations", count: 5 },
  { id: "getting-started", label: "Getting Started", count: 3 },
  { id: "advanced", label: "Advanced", count: 2 },
];

const FEATURED_HOSTS = [
  { id: "1", name: "Sarah Mitchell", initials: "SM", role: "Head of Training", webinars: 12 },
  { id: "2", name: "Michael Chen", initials: "MC", role: "Finance Director", webinars: 8 },
  { id: "3", name: "Emily Rodriguez", initials: "ER", role: "Customer Success", webinars: 6 },
];

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays < 7 && diffDays > 0) return date.toLocaleDateString("en-US", { weekday: "long" });
  
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getWebinarStatus(webinar: Webinar): { label: string; variant: "success" | "warning" | "error" | "info" | "outline" } {
  if (webinar.isLive) return { label: "Live Now", variant: "error" };
  if (webinar.isRecorded) return { label: "Recording Available", variant: "success" };
  
  const date = new Date(webinar.date);
  const now = new Date();
  if (date > now) return { label: "Upcoming", variant: "info" };
  
  return { label: "Past", variant: "outline" };
}

export default function WebinarsPage() {
  const router = useRouter();
  const { hasRole } = useAuthContext();
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeTab, setActiveTab] = useState<"upcoming" | "registered" | "recordings">("upcoming");

  const canManage = ATLVS_ADMIN_ROLES.some(role => hasRole(role));

  const filteredWebinars = DEMO_WEBINARS.filter(w => {
    if (activeCategory === "all") return true;
    return w.category.toLowerCase().replace(" ", "-") === activeCategory;
  });

  const upcomingWebinars = filteredWebinars.filter(w => !w.isRecorded);
  const registeredWebinars = DEMO_WEBINARS.filter(w => w.isRegistered && !w.isRecorded);
  const recordedWebinars = filteredWebinars.filter(w => w.isRecorded);

  const handleViewWebinar = (id: string) => {
    router.push(`/webinars/${id}`);
  };

  const handleRegister = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/webinars/${id}/register`);
  };

  const handleWatch = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/webinars/${id}/watch`);
  };

  const webinarsSidebar = (
    <Stack gap={6}>
      {/* Categories */}
      <Card className="p-5 border-2 border-border rounded-card">
        <Body className="text-white font-weight-bold mb-4">Categories</Body>
        <Stack gap={2}>
          {CATEGORIES.map((category) => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? "solid" : "ghost"}
              size="sm"
              fullWidth
              className="justify-between"
              onClick={() => setActiveCategory(category.id)}
            >
              <Text>{category.label}</Text>
              <Badge variant="outline" size="sm">{category.count}</Badge>
            </Button>
          ))}
        </Stack>
      </Card>

      {/* Featured Hosts */}
      <Card className="p-5 border-2 border-border rounded-card">
        <Box className="flex items-center gap-2 mb-4">
          <Users className="size-5 text-primary" />
          <Body className="text-white font-weight-bold">Featured Hosts</Body>
        </Box>
        <Stack gap={3}>
          {FEATURED_HOSTS.map((host) => (
            <Box key={host.id} className="flex items-center gap-3">
              <Avatar initials={host.initials} size="sm" />
              <Box className="flex-1 min-w-0">
                <Body size="sm" className="text-white truncate">
                  {host.name}
                </Body>
                <Body size="xs" className="text-text-disabled">
                  {host.webinars} webinars
                </Body>
              </Box>
            </Box>
          ))}
        </Stack>
      </Card>

      {/* Upcoming Schedule */}
      <Card className="p-5 border-2 border-border rounded-card">
        <Box className="flex items-center gap-2 mb-4">
          <Calendar className="size-5 text-warning" />
          <Body className="text-white font-weight-bold">This Week</Body>
        </Box>
        <Stack gap={3}>
          {DEMO_WEBINARS.filter(w => !w.isRecorded).slice(0, 3).map((webinar) => (
            <Box key={webinar.id} className="p-3 bg-surface-elevated rounded-card cursor-pointer hover:bg-surface-elevated" onClick={() => handleViewWebinar(webinar.id)}>
              <Body size="sm" className="text-white font-weight-medium line-clamp-1">{webinar.title}</Body>
              <Body size="xs" className="text-text-muted">{formatDate(webinar.date)} at {webinar.time}</Body>
            </Box>
          ))}
        </Stack>
        <Button variant="outline" size="sm" fullWidth className="mt-4">
          View Full Calendar
        </Button>
      </Card>

      {/* Host a Webinar CTA */}
      {canManage && (
        <Card className="p-5 border-2 border-primary rounded-card bg-primary/10">
          <Body className="text-white font-weight-bold mb-2">Host a Webinar</Body>
          <Body size="sm" className="text-text-muted mb-4">
            Share your expertise with the community.
          </Body>
          <Button variant="solid" size="sm" fullWidth>
            Create Webinar
          </Button>
        </Card>
      )}
    </Stack>
  );

  return (
    <HubPage
      header={{
        kicker: "Learn",
        title: "Webinars",
        description: "Join live sessions and watch recordings from industry experts.",
      }}
      actions={
        <Button variant="solid" icon={<CalendarPlus className="size-4" />}>
          Browse Schedule
        </Button>
      }
      stats={[
        { label: "Upcoming", value: upcomingWebinars.length.toString() },
        { label: "Registered", value: registeredWebinars.length.toString() },
        { label: "Recordings", value: recordedWebinars.length.toString() },
        { label: "Total Hours", value: "48+" },
      ]}
      tabs={[
        { id: "upcoming", label: "Upcoming", count: upcomingWebinars.length },
        { id: "registered", label: "My Registrations", count: registeredWebinars.length },
        { id: "recordings", label: "Recordings", count: recordedWebinars.length },
      ]}
      activeTab={activeTab}
      onTabChange={(tabId: string) => setActiveTab(tabId as "upcoming" | "registered" | "recordings")}
      sidebar={webinarsSidebar}
      sidebarPosition="right"
      sidebarWidth={4}
    >
      {/* Upcoming Webinars */}
      {activeTab === "upcoming" && (
        <Stack gap={4}>
          {upcomingWebinars.length > 0 ? (
            upcomingWebinars.map((webinar) => {
              const status = getWebinarStatus(webinar);
              return (
                <Card 
                  key={webinar.id} 
                  className="p-5 border-2 border-border rounded-card cursor-pointer hover:border-border transition-colors"
                  onClick={() => handleViewWebinar(webinar.id)}
                >
                  <Box className="flex gap-4">
                    <Box className={`p-4 rounded-card shrink-0 ${webinar.isLive ? 'bg-error/20' : 'bg-primary/20'}`}>
                      {webinar.isLive ? (
                        <Video className="size-8 text-error animate-pulse" />
                      ) : (
                        <Calendar className="size-8 text-primary" />
                      )}
                    </Box>
                    <Box className="flex-1 min-w-0">
                      <Box className="flex items-start justify-between gap-4 mb-2">
                        <Box>
                          <Box className="flex items-center gap-2 mb-1 flex-wrap">
                            <Badge variant={status.variant} size="sm">{status.label}</Badge>
                            <Badge variant="outline" size="sm">{webinar.category}</Badge>
                          </Box>
                          <Body className="text-white font-weight-bold">
                            {webinar.title}
                          </Body>
                        </Box>
                        {webinar.isRegistered ? (
                          <Badge variant="success" size="sm" className="shrink-0">
                            <CheckCircle className="size-3 mr-1" />
                            Registered
                          </Badge>
                        ) : null}
                      </Box>
                      <Body size="sm" className="text-text-muted mb-3 line-clamp-2">
                        {webinar.description}
                      </Body>
                      <Box className="flex items-center justify-between flex-wrap gap-2">
                        <Box className="flex items-center gap-4 text-text-disabled">
                          <Box className="flex items-center gap-1">
                            <Calendar className="size-4" />
                            <Body size="sm">{formatDate(webinar.date)}</Body>
                          </Box>
                          <Box className="flex items-center gap-1">
                            <Clock className="size-4" />
                            <Body size="sm">{webinar.time}</Body>
                          </Box>
                          <Box className="flex items-center gap-1">
                            <Users className="size-4" />
                            <Body size="sm">{webinar.attendees}/{webinar.maxAttendees}</Body>
                          </Box>
                        </Box>
                        <Box className="flex items-center gap-2">
                          <Avatar initials={webinar.host.initials} size="xs" />
                          <Body size="sm" className="text-text-secondary">{webinar.host.name}</Body>
                        </Box>
                      </Box>
                      <Box className="flex gap-2 mt-4">
                        {webinar.isLive ? (
                          <Button variant="solid" size="sm" icon={<Play className="size-4" />} onClick={(e) => handleWatch(webinar.id, e)}>
                            Join Now
                          </Button>
                        ) : webinar.isRegistered ? (
                          <Button variant="outline" size="sm" icon={<Bell className="size-4" />}>
                            Add to Calendar
                          </Button>
                        ) : (
                          <Button variant="solid" size="sm" onClick={(e) => handleRegister(webinar.id, e)}>
                            Register
                          </Button>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </Card>
              );
            })
          ) : (
            <Card className="p-8 border-2 border-border rounded-card text-center">
              <Calendar className="size-12 text-text-disabled mx-auto mb-4" />
              <Body className="text-white font-weight-bold mb-2">No upcoming webinars</Body>
              <Body size="sm" className="text-text-muted mb-4">
                Check back soon for new sessions.
              </Body>
            </Card>
          )}
        </Stack>
      )}

      {/* Registered Webinars */}
      {activeTab === "registered" && (
        <Stack gap={4}>
          {registeredWebinars.length > 0 ? (
            registeredWebinars.map((webinar) => {
              const status = getWebinarStatus(webinar);
              return (
                <Card 
                  key={webinar.id} 
                  className="p-5 border-2 border-border rounded-card cursor-pointer hover:border-border"
                  onClick={() => handleViewWebinar(webinar.id)}
                >
                  <Box className="flex items-center gap-4">
                    <Box className={`p-3 rounded-card ${webinar.isLive ? 'bg-error/20' : 'bg-success/20'}`}>
                      {webinar.isLive ? (
                        <Video className="size-6 text-error" />
                      ) : (
                        <CheckCircle className="size-6 text-success" />
                      )}
                    </Box>
                    <Box className="flex-1">
                      <Box className="flex items-center gap-2 mb-1">
                        <Badge variant={status.variant} size="sm">{status.label}</Badge>
                      </Box>
                      <Body className="text-white font-weight-medium">{webinar.title}</Body>
                      <Body size="sm" className="text-text-muted">
                        {formatDate(webinar.date)} at {webinar.time}
                      </Body>
                    </Box>
                    {webinar.isLive ? (
                      <Button variant="solid" size="sm" icon={<Play className="size-4" />}>
                        Join Now
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" icon={<Bell className="size-4" />}>
                        Reminder
                      </Button>
                    )}
                  </Box>
                </Card>
              );
            })
          ) : (
            <Card className="p-8 border-2 border-border rounded-card text-center">
              <Bell className="size-12 text-text-disabled mx-auto mb-4" />
              <Body className="text-white font-weight-bold mb-2">No registrations yet</Body>
              <Body size="sm" className="text-text-muted mb-4">
                Register for upcoming webinars to see them here.
              </Body>
              <Button variant="solid" onClick={() => setActiveTab("upcoming")}>
                Browse Webinars
              </Button>
            </Card>
          )}
        </Stack>
      )}

      {/* Recordings */}
      {activeTab === "recordings" && (
        <Stack gap={4}>
          {recordedWebinars.length > 0 ? (
            recordedWebinars.map((webinar) => (
              <Card 
                key={webinar.id} 
                className="p-5 border-2 border-border rounded-card cursor-pointer hover:border-border"
                onClick={() => handleViewWebinar(webinar.id)}
              >
                <Box className="flex gap-4">
                  <Box className="p-4 bg-success/20 rounded-card shrink-0">
                    <Play className="size-8 text-success" />
                  </Box>
                  <Box className="flex-1 min-w-0">
                    <Box className="flex items-start justify-between gap-4 mb-2">
                      <Box>
                        <Box className="flex items-center gap-2 mb-1 flex-wrap">
                          <Badge variant="success" size="sm">Recording</Badge>
                          <Badge variant="outline" size="sm">{webinar.category}</Badge>
                        </Box>
                        <Body className="text-white font-weight-bold">
                          {webinar.title}
                        </Body>
                      </Box>
                    </Box>
                    <Body size="sm" className="text-text-muted mb-3 line-clamp-2">
                      {webinar.description}
                    </Body>
                    <Box className="flex items-center justify-between flex-wrap gap-2">
                      <Box className="flex items-center gap-4 text-text-disabled">
                        <Box className="flex items-center gap-1">
                          <Clock className="size-4" />
                          <Body size="sm">{webinar.duration}</Body>
                        </Box>
                        <Box className="flex items-center gap-1">
                          <Users className="size-4" />
                          <Body size="sm">{webinar.attendees} watched</Body>
                        </Box>
                      </Box>
                      <Box className="flex items-center gap-2">
                        <Avatar initials={webinar.host.initials} size="xs" />
                        <Body size="sm" className="text-text-secondary">{webinar.host.name}</Body>
                      </Box>
                    </Box>
                    <Box className="flex gap-2 mt-4">
                      <Button variant="solid" size="sm" icon={<Play className="size-4" />} onClick={(e) => handleWatch(webinar.id, e)}>
                        Watch Recording
                      </Button>
                      <Button variant="outline" size="sm" icon={<ExternalLink className="size-4" />}>
                        Share
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </Card>
            ))
          ) : (
            <Card className="p-8 border-2 border-border rounded-card text-center">
              <Video className="size-12 text-text-disabled mx-auto mb-4" />
              <Body className="text-white font-weight-bold mb-2">No recordings available</Body>
              <Body size="sm" className="text-text-muted mb-4">
                Recordings will appear here after webinars are completed.
              </Body>
            </Card>
          )}
        </Stack>
      )}
    </HubPage>
  );
}
