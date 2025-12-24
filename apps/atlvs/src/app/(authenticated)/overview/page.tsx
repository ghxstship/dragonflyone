"use client";

import { TrendingUp, Calendar, Users, DollarSign, FileText, AlertTriangle, CheckCircle } from "lucide-react";
import {
  Stack,
  Grid,
  Card,
  H2,
  H3,
  Body,
  Badge,
  EnterprisePageHeader,
} from "@ghxstship/ui";

interface StatCard {
  label: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: React.ReactNode;
}

interface ActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: "success" | "warning" | "info";
}

const stats: StatCard[] = [
  { label: "Active Projects", value: "24", change: "+3 this month", changeType: "positive", icon: <FileText className="size-5" /> },
  { label: "Team Members", value: "48", change: "+5 this quarter", changeType: "positive", icon: <Users className="size-5" /> },
  { label: "Revenue YTD", value: "$2.4M", change: "+14% vs last year", changeType: "positive", icon: <DollarSign className="size-5" /> },
  { label: "Upcoming Events", value: "12", change: "Next 30 days", changeType: "neutral", icon: <Calendar className="size-5" /> },
];

const recentActivity: ActivityItem[] = [
  { id: "1", title: "Summer Festival approved", description: "Budget of $450K approved by finance", timestamp: "2 hours ago", type: "success" },
  { id: "2", title: "Vendor contract expiring", description: "AV Solutions contract expires in 14 days", timestamp: "5 hours ago", type: "warning" },
  { id: "3", title: "New team member added", description: "Sarah Johnson joined as Production Manager", timestamp: "1 day ago", type: "info" },
  { id: "4", title: "Q4 planning complete", description: "All milestones finalized for Q4 2025", timestamp: "2 days ago", type: "success" },
];

const upcomingDeadlines = [
  { id: "1", title: "Summer Festival Setup", date: "Dec 28, 2025", status: "on_track" },
  { id: "2", title: "Vendor Payments Due", date: "Dec 30, 2025", status: "at_risk" },
  { id: "3", title: "Q1 Budget Submission", date: "Jan 5, 2026", status: "on_track" },
  { id: "4", title: "Annual Review Meeting", date: "Jan 10, 2026", status: "on_track" },
];

const getActivityIcon = (type: ActivityItem["type"]) => {
  switch (type) {
    case "success": return <CheckCircle className="size-4 text-success" />;
    case "warning": return <AlertTriangle className="size-4 text-warning" />;
    default: return <FileText className="size-4 text-info" />;
  }
};

export default function OverviewPage() {
  return (
    <Stack gap={8}>
      <EnterprisePageHeader
        title="Overview"
        subtitle="Production overview dashboard"
        showFavorite
        showSettings
      />

      <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => (
          <Card key={idx} inverted className="border-2 border-ink-800 p-4">
            <Stack gap={3}>
              <div className="flex items-center justify-between">
                <div className="text-grey-400">{stat.icon}</div>
                {stat.change && (
                  <Badge variant="ghost" className={stat.changeType === "positive" ? "text-success" : stat.changeType === "negative" ? "text-error" : "text-grey-400"}>
                    {stat.changeType === "positive" && <TrendingUp className="size-3 mr-1" />}
                    {stat.change}
                  </Badge>
                )}
              </div>
              <div>
                <Body size="sm" className="text-grey-400">{stat.label}</Body>
                <H2 className="text-white">{stat.value}</H2>
              </div>
            </Stack>
          </Card>
        ))}
      </Grid>

      <Grid cols={2} gap={6} className="sm:grid-cols-1 lg:grid-cols-2">
        <Card inverted className="border-2 border-ink-800 p-6">
          <Stack gap={4}>
            <H3 className="text-white">Recent Activity</H3>
            <Stack gap={3}>
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-card bg-ink-900/50">
                  {getActivityIcon(activity.type)}
                  <div className="flex-1">
                    <Body size="sm" className="text-white font-weight-medium">{activity.title}</Body>
                    <Body size="sm" className="text-grey-400">{activity.description}</Body>
                  </div>
                  <Body size="sm" className="text-grey-500">{activity.timestamp}</Body>
                </div>
              ))}
            </Stack>
          </Stack>
        </Card>

        <Card inverted className="border-2 border-ink-800 p-6">
          <Stack gap={4}>
            <H3 className="text-white">Upcoming Deadlines</H3>
            <Stack gap={3}>
              {upcomingDeadlines.map((deadline) => (
                <div key={deadline.id} className="flex items-center justify-between p-3 rounded-card bg-ink-900/50">
                  <div className="flex items-center gap-3">
                    <Calendar className="size-4 text-grey-400" />
                    <div>
                      <Body size="sm" className="text-white">{deadline.title}</Body>
                      <Body size="sm" className="text-grey-400">{deadline.date}</Body>
                    </div>
                  </div>
                  <Badge variant={deadline.status === "on_track" ? "solid" : "outline"} className={deadline.status === "on_track" ? "text-success" : "text-warning"}>
                    {deadline.status.replace("_", " ")}
                  </Badge>
                </div>
              ))}
            </Stack>
          </Stack>
        </Card>
      </Grid>
    </Stack>
  );
}
