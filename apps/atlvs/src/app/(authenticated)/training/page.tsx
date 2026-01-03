"use client";

/**
 * Training Page - Authenticated Experience
 * Course enrollment, progress tracking, and certifications
 * Bold Contemporary Pop Art Adventure Design System
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  GraduationCap, Award, BookOpen, Video, Clock, CheckCircle, 
  Play, Lock, Trophy, Star, ArrowRight
} from "lucide-react";
import {
  HubPage, Card, Stack, Box, Body, Button, Badge,
  ProgressBar, Text
} from "@ghxstship/ui";
import { useAuthContext, ATLVS_ADMIN_ROLES } from "@ghxstship/config";

interface Course {
  id: string;
  title: string;
  description: string;
  level: "beginner" | "intermediate" | "advanced";
  duration: string;
  modules: number;
  completedModules: number;
  enrolled: boolean;
  locked: boolean;
  category: string;
  instructor: {
    name: string;
    initials: string;
    role: string;
  };
}

interface Certificate {
  id: string;
  title: string;
  issuedDate: string;
  expiresDate: string | null;
  credentialId: string;
}

const DEMO_COURSES: Course[] = [
  {
    id: "1",
    title: "ATLVS Fundamentals",
    description: "Master the basics of production management with ATLVS. Learn dashboard navigation, project setup, and essential workflows.",
    level: "beginner",
    duration: "4 hours",
    modules: 8,
    completedModules: 8,
    enrolled: true,
    locked: false,
    category: "Core",
    instructor: { name: "Sarah Mitchell", initials: "SM", role: "Head of Training" },
  },
  {
    id: "2",
    title: "Financial Management",
    description: "Advanced budgeting, invoicing, and financial reporting. Learn to manage production finances like a pro.",
    level: "intermediate",
    duration: "6 hours",
    modules: 12,
    completedModules: 7,
    enrolled: true,
    locked: false,
    category: "Finance",
    instructor: { name: "Michael Chen", initials: "MC", role: "Finance Director" },
  },
  {
    id: "3",
    title: "Team Collaboration",
    description: "Effective team management, communication workflows, and collaboration best practices.",
    level: "intermediate",
    duration: "5 hours",
    modules: 10,
    completedModules: 0,
    enrolled: false,
    locked: false,
    category: "Operations",
    instructor: { name: "Emily Rodriguez", initials: "ER", role: "Operations Lead" },
  },
  {
    id: "4",
    title: "Advanced Analytics",
    description: "Deep dive into reporting, dashboards, and data-driven decision making for productions.",
    level: "advanced",
    duration: "8 hours",
    modules: 16,
    completedModules: 0,
    enrolled: false,
    locked: true,
    category: "Analytics",
    instructor: { name: "James Wilson", initials: "JW", role: "Data Analyst" },
  },
  {
    id: "5",
    title: "API & Integrations",
    description: "Connect ATLVS with external tools. Learn API basics, webhooks, and integration patterns.",
    level: "advanced",
    duration: "10 hours",
    modules: 20,
    completedModules: 0,
    enrolled: false,
    locked: true,
    category: "Technical",
    instructor: { name: "Lisa Park", initials: "LP", role: "Developer Advocate" },
  },
];

const DEMO_CERTIFICATES: Certificate[] = [
  {
    id: "1",
    title: "ATLVS Fundamentals Certified",
    issuedDate: "2025-11-15",
    expiresDate: null,
    credentialId: "ATLVS-FUND-2025-001234",
  },
];

const CATEGORIES = [
  { id: "all", label: "All Courses", count: 5 },
  { id: "core", label: "Core", count: 1 },
  { id: "finance", label: "Finance", count: 1 },
  { id: "operations", label: "Operations", count: 1 },
  { id: "analytics", label: "Analytics", count: 1 },
  { id: "technical", label: "Technical", count: 1 },
];

function getLevelVariant(level: string): "success" | "warning" | "error" {
  switch (level) {
    case "beginner": return "success";
    case "intermediate": return "warning";
    case "advanced": return "error";
    default: return "success";
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", { 
    year: "numeric", 
    month: "short", 
    day: "numeric" 
  });
}

export default function TrainingPage() {
  const router = useRouter();
  const { hasRole } = useAuthContext();
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeTab, setActiveTab] = useState<"courses" | "my-learning" | "certificates">("courses");

  const canManageTraining = ATLVS_ADMIN_ROLES.some(role => hasRole(role));

  const filteredCourses = DEMO_COURSES.filter(c => {
    if (activeCategory === "all") return true;
    return c.category.toLowerCase() === activeCategory;
  });

  const enrolledCourses = DEMO_COURSES.filter(c => c.enrolled);
  const completedCourses = enrolledCourses.filter(c => c.completedModules === c.modules);
  const inProgressCourses = enrolledCourses.filter(c => c.completedModules > 0 && c.completedModules < c.modules);

  const handleViewCourse = (id: string) => {
    router.push(`/training/${id}`);
  };

  const handleEnroll = (id: string) => {
    router.push(`/training/${id}/enroll`);
  };

  const trainingSidebar = (
    <Stack gap={6}>
      {/* Categories */}
      <Card className="p-5 border-2 border-border rounded-card">
        <Body className="text-text-primary font-weight-bold mb-4">Categories</Body>
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

      {/* Learning Path */}
      <Card className="p-5 border-2 border-border rounded-card">
        <Box className="flex items-center gap-2 mb-4">
          <Star className="size-5 text-warning" />
          <Body className="text-text-primary font-weight-bold">Recommended Path</Body>
        </Box>
        <Stack gap={3}>
          {["ATLVS Fundamentals", "Financial Management", "Team Collaboration", "Advanced Analytics"].map((course, idx) => (
            <Box key={idx} className="flex items-center gap-3">
              <Box className={`size-6 rounded-[var(--radius-circle)] flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-success text-text-primary' : idx === 1 ? 'bg-primary text-text-primary' : 'bg-border text-text-disabled'}`}>
                {idx + 1}
              </Box>
              <Body size="sm" className={idx < 2 ? "text-text-primary" : "text-text-disabled"}>
                {course}
              </Body>
              {idx === 0 && <CheckCircle className="size-4 text-success ml-auto" />}
            </Box>
          ))}
        </Stack>
      </Card>

      {/* Upcoming Live Sessions */}
      <Card className="p-5 border-2 border-border rounded-card">
        <Box className="flex items-center gap-2 mb-4">
          <Video className="size-5 text-primary" />
          <Body className="text-text-primary font-weight-bold">Live Sessions</Body>
        </Box>
        <Stack gap={3}>
          <Box className="p-3 bg-surface-elevated rounded-card">
            <Body size="sm" className="text-text-primary font-weight-medium">Production Planning Workshop</Body>
            <Body size="xs" className="text-text-muted">Jan 15, 2026 at 2:00 PM EST</Body>
          </Box>
          <Box className="p-3 bg-surface-elevated rounded-card">
            <Body size="sm" className="text-text-primary font-weight-medium">Q&A: Financial Best Practices</Body>
            <Body size="xs" className="text-text-muted">Jan 22, 2026 at 11:00 AM EST</Body>
          </Box>
        </Stack>
        <Button variant="outline" size="sm" fullWidth className="mt-4">
          View All Sessions
        </Button>
      </Card>
    </Stack>
  );

  return (
    <HubPage
      header={{
        kicker: "Learn",
        title: "Training & Certification",
        description: "Master ATLVS with comprehensive courses and earn industry-recognized certifications.",
      }}
      actions={
        <Stack direction="horizontal" gap={2}>
          {canManageTraining && (
            <Button variant="outline" icon={<GraduationCap className="size-4" />} onClick={() => router.push("/training/manage")}>
              Manage Courses
            </Button>
          )}
          <Button variant="outline" icon={<Trophy className="size-4" />} onClick={() => setActiveTab("certificates")}>
            View Certificates
          </Button>
        </Stack>
      }
      stats={[
        { label: "Courses Available", value: "50+" },
        { label: "Enrolled", value: enrolledCourses.length.toString() },
        { label: "Completed", value: completedCourses.length.toString(), trend: "up" },
        { label: "Certificates", value: DEMO_CERTIFICATES.length.toString() },
      ]}
      tabs={[
        { id: "courses", label: "All Courses", count: filteredCourses.length },
        { id: "my-learning", label: "My Learning", count: enrolledCourses.length },
        { id: "certificates", label: "Certificates", count: DEMO_CERTIFICATES.length },
      ]}
      activeTab={activeTab}
      onTabChange={(tabId: string) => setActiveTab(tabId as "courses" | "my-learning" | "certificates")}
      sidebar={trainingSidebar}
      sidebarPosition="right"
      sidebarWidth={4}
    >

          {/* All Courses */}
          {activeTab === "courses" && (
            <Stack gap={4}>
              {filteredCourses.map((course) => (
                <Card 
                  key={course.id} 
                  className="p-5 border-2 border-border rounded-card cursor-pointer hover:border-border transition-colors"
                  onClick={() => course.locked ? null : handleViewCourse(course.id)}
                >
                  <Box className="flex gap-4">
                    <Box className={`p-4 rounded-card shrink-0 ${course.locked ? 'bg-surface-elevated' : 'bg-primary/20'}`}>
                      {course.locked ? (
                        <Lock className="size-8 text-text-disabled" />
                      ) : (
                        <GraduationCap className="size-8 text-primary" />
                      )}
                    </Box>
                    <Box className="flex-1 min-w-0">
                      <Box className="flex items-start justify-between gap-4 mb-2">
                        <Box>
                          <Box className="flex items-center gap-2 mb-1 flex-wrap">
                            <Badge variant={getLevelVariant(course.level)} size="sm">
                              {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                            </Badge>
                            <Badge variant="outline" size="sm">{course.category}</Badge>
                            {course.enrolled && course.completedModules === course.modules && (
                              <Badge variant="success" size="sm">Completed</Badge>
                            )}
                            {course.locked && (
                              <Badge variant="outline" size="sm">Locked</Badge>
                            )}
                          </Box>
                          <Body className={`font-weight-bold ${course.locked ? 'text-text-disabled' : 'text-text-primary'}`}>
                            {course.title}
                          </Body>
                        </Box>
                      </Box>
                      <Body size="sm" className="text-text-muted mb-3 line-clamp-2">
                        {course.description}
                      </Body>
                      <Box className="flex items-center justify-between flex-wrap gap-2">
                        <Box className="flex items-center gap-4 text-text-disabled">
                          <Box className="flex items-center gap-1">
                            <Clock className="size-4" />
                            <Body size="sm">{course.duration}</Body>
                          </Box>
                          <Box className="flex items-center gap-1">
                            <BookOpen className="size-4" />
                            <Body size="sm">{course.modules} modules</Body>
                          </Box>
                        </Box>
                        {course.enrolled ? (
                          <Box className="flex items-center gap-2">
                            <ProgressBar 
                              value={(course.completedModules / course.modules) * 100} 
                              className="w-24" 
                            />
                            <Body size="sm" className="text-text-secondary">
                              {course.completedModules}/{course.modules}
                            </Body>
                          </Box>
                        ) : !course.locked ? (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={(e) => { e.stopPropagation(); handleEnroll(course.id); }}
                          >
                            Enroll
                          </Button>
                        ) : null}
                      </Box>
                    </Box>
                  </Box>
                </Card>
              ))}
            </Stack>
          )}

          {/* My Learning */}
          {activeTab === "my-learning" && (
            <Stack gap={6}>
              {/* In Progress */}
              {inProgressCourses.length > 0 && (
                <Box>
                  <Body className="text-text-primary font-weight-bold mb-4">In Progress</Body>
                  <Stack gap={4}>
                    {inProgressCourses.map((course) => (
                      <Card 
                        key={course.id} 
                        className="p-5 border-2 border-border rounded-card cursor-pointer hover:border-border"
                        onClick={() => handleViewCourse(course.id)}
                      >
                        <Box className="flex items-center gap-4">
                          <Box className="p-3 bg-primary/20 rounded-card">
                            <Play className="size-6 text-primary" />
                          </Box>
                          <Box className="flex-1">
                            <Body className="text-text-primary font-weight-medium">{course.title}</Body>
                            <Box className="flex items-center gap-2 mt-2">
                              <ProgressBar 
                                value={(course.completedModules / course.modules) * 100} 
                                className="flex-1" 
                              />
                              <Body size="sm" className="text-text-secondary">
                                {Math.round((course.completedModules / course.modules) * 100)}%
                              </Body>
                            </Box>
                          </Box>
                          <Button variant="solid" size="sm" icon={<ArrowRight className="size-4" />}>
                            Continue
                          </Button>
                        </Box>
                      </Card>
                    ))}
                  </Stack>
                </Box>
              )}

              {/* Completed */}
              {completedCourses.length > 0 && (
                <Box>
                  <Body className="text-text-primary font-weight-bold mb-4">Completed</Body>
                  <Stack gap={4}>
                    {completedCourses.map((course) => (
                      <Card 
                        key={course.id} 
                        className="p-5 border-2 border-border rounded-card"
                      >
                        <Box className="flex items-center gap-4">
                          <Box className="p-3 bg-success/20 rounded-card">
                            <CheckCircle className="size-6 text-success" />
                          </Box>
                          <Box className="flex-1">
                            <Body className="text-text-primary font-weight-medium">{course.title}</Body>
                            <Body size="sm" className="text-text-muted">Completed</Body>
                          </Box>
                          <Button variant="outline" size="sm">
                            Review
                          </Button>
                        </Box>
                      </Card>
                    ))}
                  </Stack>
                </Box>
              )}

              {enrolledCourses.length === 0 && (
                <Card className="p-8 border-2 border-border rounded-card text-center">
                  <BookOpen className="size-12 text-text-disabled mx-auto mb-4" />
                  <Body className="text-text-primary font-weight-bold mb-2">No courses enrolled</Body>
                  <Body size="sm" className="text-text-muted mb-4">
                    Start your learning journey by enrolling in a course.
                  </Body>
                  <Button variant="solid" onClick={() => setActiveTab("courses")}>
                    Browse Courses
                  </Button>
                </Card>
              )}
            </Stack>
          )}

          {/* Certificates */}
          {activeTab === "certificates" && (
            <Stack gap={4}>
              {DEMO_CERTIFICATES.length > 0 ? (
                DEMO_CERTIFICATES.map((cert) => (
                  <Card key={cert.id} className="p-6 border-2 border-border rounded-card">
                    <Box className="flex items-center gap-4">
                      <Box className="p-4 bg-warning/20 rounded-card">
                        <Award className="size-10 text-warning" />
                      </Box>
                      <Box className="flex-1">
                        <Body className="text-text-primary font-weight-bold">{cert.title}</Body>
                        <Body size="sm" className="text-text-muted">
                          Issued: {formatDate(cert.issuedDate)}
                        </Body>
                        <Body size="sm" className="text-text-disabled">
                          Credential ID: {cert.credentialId}
                        </Body>
                      </Box>
                      <Stack gap={2}>
                        <Button variant="solid" size="sm">
                          View Certificate
                        </Button>
                        <Button variant="outline" size="sm">
                          Share
                        </Button>
                      </Stack>
                    </Box>
                  </Card>
                ))
              ) : (
                <Card className="p-8 border-2 border-border rounded-card text-center">
                  <Award className="size-12 text-text-disabled mx-auto mb-4" />
                  <Body className="text-text-primary font-weight-bold mb-2">No certificates yet</Body>
                  <Body size="sm" className="text-text-muted mb-4">
                    Complete courses to earn certificates.
                  </Body>
                  <Button variant="solid" onClick={() => setActiveTab("courses")}>
                    Start Learning
                  </Button>
                </Card>
              )}
            </Stack>
          )}
    </HubPage>
  );
}
