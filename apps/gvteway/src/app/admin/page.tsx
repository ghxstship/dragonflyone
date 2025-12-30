"use client";

/**
 * Admin Dashboard Page
 * Central hub for GVTEWAY administration
 * Uses DetailPage template for consistent layout
 */

import { useRouter } from "next/navigation";
import {
  Ticket,
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronRight,
  LayoutDashboard,
  Activity,
} from "lucide-react";
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
import { useQuery } from "@tanstack/react-query";

interface AdminStats {
  totalEvents: number;
  activeEvents: number;
  totalTicketsSold: number;
  totalRevenue: number;
  pendingOrders: number;
  recentSales: number;
}

interface RecentActivity {
  id: string;
  type: "sale" | "refund" | "event" | "user";
  description: string;
  timestamp: string;
  amount?: number;
}

const DEMO_STATS: AdminStats = {
  totalEvents: 45,
  activeEvents: 12,
  totalTicketsSold: 8432,
  totalRevenue: 425680,
  pendingOrders: 23,
  recentSales: 156,
};

const DEMO_ACTIVITY: RecentActivity[] = [
  { id: "1", type: "sale", description: "VIP Pass sold for Summer Festival", timestamp: "2024-11-24T10:30:00Z", amount: 299 },
  { id: "2", type: "sale", description: "General Admission x3 for Concert Series", timestamp: "2024-11-24T10:15:00Z", amount: 225 },
  { id: "3", type: "refund", description: "Refund processed for cancelled event", timestamp: "2024-11-24T09:45:00Z", amount: 75 },
  { id: "4", type: "event", description: "New event created: Winter Gala 2024", timestamp: "2024-11-24T09:00:00Z" },
  { id: "5", type: "user", description: "New organizer registered", timestamp: "2024-11-24T08:30:00Z" },
];

export default function AdminDashboardPage() {
  const router = useRouter();

  const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const response = await fetch("/api/admin/stats");
      if (!response.ok) return DEMO_STATS;
      const data = await response.json();
      return data.stats || DEMO_STATS;
    },
  });

  const { data: activity, isLoading: activityLoading } = useQuery({
    queryKey: ["admin", "activity"],
    queryFn: async () => {
      const response = await fetch("/api/admin/activity");
      if (!response.ok) return DEMO_ACTIVITY;
      const data = await response.json();
      return data.activity || DEMO_ACTIVITY;
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "sale": return <DollarSign className="size-4 text-success" />;
      case "refund": return <AlertCircle className="size-4 text-warning" />;
      case "event": return <Calendar className="size-4 text-info" />;
      case "user": return <Users className="size-4 text-primary" />;
      default: return <CheckCircle className="size-4" />;
    }
  };

  const isLoading = statsLoading || activityLoading;
  const adminStats = stats || DEMO_STATS;
  const recentActivity = activity || DEMO_ACTIVITY;

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: <LayoutDashboard className="size-4" />,
      content: (
        <Section>
          <Grid cols={4} gap={4} className="grid-cols-2 lg:grid-cols-4 mb-6">
            <StatCard label="Total Events" value={adminStats.totalEvents.toString()} icon={<Calendar className="size-5" />} />
            <StatCard label="Tickets Sold" value={adminStats.totalTicketsSold.toLocaleString()} icon={<Ticket className="size-5" />} />
            <StatCard label="Total Revenue" value={formatCurrency(adminStats.totalRevenue)} icon={<DollarSign className="size-5" />} />
            <StatCard label="Pending Orders" value={adminStats.pendingOrders.toString()} icon={<Clock className="size-5" />} />
          </Grid>

          <Grid cols={2} gap={6} className="grid-cols-1 lg:grid-cols-2">
            <Card className="p-6">
              <SectionHeader title="Quick Actions" />
              <Grid cols={2} gap={3} className="grid-cols-1 lg:grid-cols-2 mt-4">
                <Button variant="outline" className="justify-start" onClick={() => router.push("/admin/events")} icon={<Calendar className="size-4" />} iconPosition="left">
                  Manage Events
                </Button>
                <Button variant="outline" className="justify-start" onClick={() => router.push("/admin/ticketing")} icon={<Ticket className="size-4" />} iconPosition="left">
                  Ticketing
                </Button>
                <Button variant="outline" className="justify-start" onClick={() => router.push("/admin/pos")} icon={<DollarSign className="size-4" />} iconPosition="left">
                  Point of Sale
                </Button>
                <Button variant="outline" className="justify-start" onClick={() => router.push("/admin/moderation")} icon={<Users className="size-4" />} iconPosition="left">
                  Moderation
                </Button>
              </Grid>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <SectionHeader title="Recent Activity" />
                <Button variant="ghost" size="sm" icon={<ChevronRight className="size-4" />} iconPosition="right">
                  View All
                </Button>
              </div>
              <div className="space-y-3">
                {recentActivity.slice(0, 5).map((item: RecentActivity) => (
                  <div key={item.id} className="flex items-center gap-3 py-2 border-b border-grey-700 last:border-0">
                    <div className="p-2 rounded-avatar bg-grey-800">{getActivityIcon(item.type)}</div>
                    <div className="flex-1">
                      <Body size="sm">{item.description}</Body>
                      <Body size="sm" className="text-on-dark-muted">{formatTime(item.timestamp)}</Body>
                    </div>
                    {item.amount && (
                      <Badge variant={item.type === "refund" ? "warning" : "success"}>
                        {item.type === "refund" ? "-" : "+"}{formatCurrency(item.amount)}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </Grid>
        </Section>
      ),
    },
    {
      id: "performance",
      label: "Performance",
      icon: <Activity className="size-4" />,
      content: (
        <Section>
          <div className="flex items-center justify-between mb-6">
            <SectionHeader title="Performance Overview" />
            <Badge variant="success">
              <TrendingUp className="size-3 mr-1" />
              +12% this month
            </Badge>
          </div>
          <Grid cols={3} gap={6} className="grid-cols-1 lg:grid-cols-3">
            <Card className="p-6">
              <Body size="sm" className="text-on-dark-muted">Active Events</Body>
              <Body className="text-display-md font-weight-bold mt-2">{adminStats.activeEvents}</Body>
              <Body size="sm" className="text-success mt-1">Currently live</Body>
            </Card>
            <Card className="p-6">
              <Body size="sm" className="text-on-dark-muted">Today&apos;s Sales</Body>
              <Body className="text-display-md font-weight-bold mt-2">{adminStats.recentSales}</Body>
              <Body size="sm" className="text-success mt-1">+8% from yesterday</Body>
            </Card>
            <Card className="p-6">
              <Body size="sm" className="text-on-dark-muted">Conversion Rate</Body>
              <Body className="text-display-md font-weight-bold mt-2">4.2%</Body>
              <Body size="sm" className="text-on-dark-muted mt-1">Industry avg: 3.1%</Body>
            </Card>
          </Grid>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{
        kicker: "Admin",
        title: "Admin Dashboard",
        description: "Manage events, tickets, and platform operations",
      }}
      loading={isLoading}
      error={statsError instanceof Error ? statsError : null}
      onRetry={refetchStats}
      tabs={tabs}
    />
  );
}
