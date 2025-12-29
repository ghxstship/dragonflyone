"use client";

/**
 * Careers Page
 * Job openings and company culture
 * Uses DetailPage template for consistent layout
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, MapPin, Clock, DollarSign, Heart, Users, Zap, List, Building2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  Badge,
  Body,
  Button,
  Card,
  Grid,
  StatCard,
  DetailPage,
  Section,
  SectionHeader,
} from "@ghxstship/ui";

interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  type: "full-time" | "part-time" | "contract";
  salary_range: string;
  posted_at: string;
}

const DEMO_JOBS: JobPosting[] = [
  { id: "1", title: "Senior Software Engineer", department: "Engineering", location: "Remote", type: "full-time", salary_range: "$150K - $200K", posted_at: "2024-12-10" },
  { id: "2", title: "Product Designer", department: "Design", location: "New York, NY", type: "full-time", salary_range: "$120K - $160K", posted_at: "2024-12-08" },
  { id: "3", title: "Customer Success Manager", department: "Customer Success", location: "Remote", type: "full-time", salary_range: "$80K - $110K", posted_at: "2024-12-05" },
  { id: "4", title: "DevOps Engineer", department: "Engineering", location: "San Francisco, CA", type: "full-time", salary_range: "$140K - $180K", posted_at: "2024-12-01" },
  { id: "5", title: "Marketing Manager", department: "Marketing", location: "Remote", type: "full-time", salary_range: "$90K - $130K", posted_at: "2024-11-28" },
];

const BENEFITS = [
  { icon: <Heart className="size-6" />, title: "Health & Wellness", description: "Comprehensive health, dental, and vision coverage" },
  { icon: <Clock className="size-6" />, title: "Flexible Hours", description: "Work when you're most productive" },
  { icon: <MapPin className="size-6" />, title: "Remote First", description: "Work from anywhere in the world" },
  { icon: <DollarSign className="size-6" />, title: "Competitive Pay", description: "Top-of-market compensation packages" },
  { icon: <Zap className="size-6" />, title: "Learning Budget", description: "$2,000 annual learning and development budget" },
  { icon: <Users className="size-6" />, title: "Team Events", description: "Regular team offsites and virtual events" },
];

const DEPARTMENTS = ["All", "Engineering", "Design", "Customer Success", "Marketing", "Sales"];

export default function CareersPage() {
  const router = useRouter();
  const [selectedDepartment, setSelectedDepartment] = useState("All");

  const { data: jobs = [], isLoading, error, refetch } = useQuery({
    queryKey: ["job-postings"],
    queryFn: async () => {
      const response = await fetch("/api/careers");
      if (!response.ok) return DEMO_JOBS;
      const data = await response.json();
      return data.jobs?.length ? data.jobs : DEMO_JOBS;
    },
  });

  const filteredJobs = selectedDepartment === "All" ? jobs : jobs.filter((job: JobPosting) => job.department === selectedDepartment);

  const formatDate = (dateStr: string) => {
    const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
  };

  const tabs = [
    {
      id: "openings",
      label: "Open Positions",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <Grid cols={3} gap={4} className="grid-cols-1 md:grid-cols-3 mb-6">
            <StatCard label="Open Positions" value={jobs.length.toString()} icon={<Briefcase className="size-5" />} />
            <StatCard label="Departments Hiring" value={new Set(jobs.map((j: JobPosting) => j.department)).size.toString()} icon={<Building2 className="size-5" />} />
            <StatCard label="Remote Positions" value={jobs.filter((j: JobPosting) => j.location === "Remote").length.toString()} icon={<MapPin className="size-5" />} />
          </Grid>

          <div className="flex gap-2 mb-6 flex-wrap">
            {DEPARTMENTS.map((dept) => (
              <Button key={dept} variant={selectedDepartment === dept ? "solid" : "outline"} size="sm" onClick={() => setSelectedDepartment(dept)}>
                {dept}
              </Button>
            ))}
          </div>

          {filteredJobs.length === 0 ? (
            <Card className="p-8 text-center">
              <Briefcase className="size-12 text-grey-600 mx-auto mb-4" />
              <Body className="font-weight-medium font-weight-medium mb-2">No Open Positions</Body>
              <Body className="text-grey-400">Check back soon for new opportunities</Body>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((job: JobPosting) => (
                <Card key={job.id} className="p-6 cursor-pointer hover:border-primary transition-colors" onClick={() => router.push(`/careers/${job.id}`)}>
                  <div className="flex justify-between items-start">
                    <div>
                      <Body className="font-weight-bold font-weight-medium">{job.title}</Body>
                      <div className="flex items-center gap-4 mt-2 text-grey-400">
                        <div className="flex items-center gap-1"><Building2 className="size-4" /><Body size="sm">{job.department}</Body></div>
                        <div className="flex items-center gap-1"><MapPin className="size-4" /><Body size="sm">{job.location}</Body></div>
                        <div className="flex items-center gap-1"><DollarSign className="size-4" /><Body size="sm">{job.salary_range}</Body></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{job.type}</Badge>
                      <Body size="sm" className="text-grey-500">{formatDate(job.posted_at)}</Body>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Section>
      ),
    },
    {
      id: "benefits",
      label: "Benefits",
      icon: <Heart className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Why Work at ATLVS?" description="We offer competitive benefits to help you do your best work" />
          <Grid cols={3} gap={6} className="grid-cols-1 md:grid-cols-3 mt-6">
            {BENEFITS.map((benefit, index) => (
              <Card key={index} className="p-6">
                <div className="p-3 bg-primary/20 rounded-card text-primary w-fit mb-4">{benefit.icon}</div>
                <Body className="font-weight-bold font-weight-medium mb-2">{benefit.title}</Body>
                <Body className="text-grey-400">{benefit.description}</Body>
              </Card>
            ))}
          </Grid>

          <Card className="p-8 mt-8 text-center">
            <Body className="font-weight-bold font-weight-bold mb-2">Don&apos;t see a role that fits?</Body>
            <Body className="text-grey-400 mb-4">We&apos;re always looking for talented people. Send us your resume!</Body>
            <Button variant="outline" onClick={() => router.push("/contact")}>Get in Touch</Button>
          </Card>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{
        kicker: "Join Us",
        title: "Careers at ATLVS",
        description: "Help us build the future of production management",
      }}
      loading={isLoading}
      error={error instanceof Error ? error : null}
      onRetry={refetch}
      tabs={tabs}
    />
  );
}
