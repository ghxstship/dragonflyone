"use client";

import { useParams } from "next/navigation";
import {
  SectionHeader,
  Card,
  CardBody,
  Stack,
  StatCard,
  Button,
  Badge,
  Container,
} from "@ghxstship/ui";
import {
  Calendar,
  Users,
  DollarSign,
  CheckCircle,
  Clock,
  AlertTriangle,
  MapPin,
  TrendingUp,
  FileText,
  Package,
} from "lucide-react";
import { atlvsDemoProductions } from "../../../../data/atlvs";

/**
 * Production Overview Page
 * Dashboard for a specific production showing key metrics and quick actions
 */
export default function ProductionOverviewPage() {
  const params = useParams();
  const productionId = params?.productionId as string;
  
  // Find the production
  const production = atlvsDemoProductions.find((p) => p.id === productionId);
  
  if (!production) {
    return (
      <Container>
        <SectionHeader
          kicker="Production"
          title="Production Not Found"
          description="The requested production could not be found."
          colorScheme="on-dark"
        />
      </Container>
    );
  }

  // Mock metrics for the production
  const metrics = {
    budget: { total: 250000, spent: 175000, remaining: 75000 },
    tasks: { total: 48, completed: 32, inProgress: 12, overdue: 4 },
    team: { total: 24, confirmed: 20, pending: 4 },
    advances: { pending: 8, approved: 15, fulfilled: 12 },
  };

  const budgetPercentage = Math.round((metrics.budget.spent / metrics.budget.total) * 100);
  const taskPercentage = Math.round((metrics.tasks.completed / metrics.tasks.total) * 100);

  return (
    <Stack gap={8}>
      {/* Header */}
      <Stack gap={4}>
        <SectionHeader
          kicker="Production"
          title={production.name}
          description={`${production.venue} | ${production.startDate} - ${production.endDate}`}
          colorScheme="on-dark"
        />
        <Stack direction="horizontal" gap={2} className="flex-wrap">
          <Badge variant={production.status === "active" ? "success" : "info"}>
            {production.status.toUpperCase()}
          </Badge>
          <Badge variant="outline">
            <MapPin size={12} className="mr-1" />
            {production.venue}
          </Badge>
          <Badge variant="outline">
            <Calendar size={12} className="mr-1" />
            {new Date(production.startDate || "").toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </Badge>
        </Stack>
      </Stack>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Budget"
          value={`$${(metrics.budget.spent / 1000).toFixed(0)}K`}
          icon={<DollarSign size={20} />}
          trend={budgetPercentage > 80 ? "down" : "up"}
          trendValue={`${100 - budgetPercentage}% remaining`}
          inverted
        />
        <StatCard
          label="Tasks"
          value={`${metrics.tasks.completed}/${metrics.tasks.total}`}
          icon={<CheckCircle size={20} />}
          trend="up"
          trendValue={`${taskPercentage}% complete`}
          inverted
        />
        <StatCard
          label="Team"
          value={metrics.team.confirmed.toString()}
          icon={<Users size={20} />}
          trend={metrics.team.pending > 0 ? "neutral" : "up"}
          trendValue={`${metrics.team.pending} pending`}
          inverted
        />
        <StatCard
          label="Advances"
          value={metrics.advances.pending.toString()}
          icon={<Package size={20} />}
          trend={metrics.advances.pending > 5 ? "down" : "neutral"}
          trendValue={`${metrics.advances.approved} approved`}
          inverted
        />
      </div>

      {/* Quick Actions & Alerts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card variant="elevated" inverted>
          <CardBody>
            <Stack gap={4}>
              <h3 className="font-heading text-body-lg font-weight-bold text-white">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" size="sm" className="justify-start">
                  <Calendar size={16} className="mr-2" />
                  View Schedule
                </Button>
                <Button variant="outline" size="sm" className="justify-start">
                  <Users size={16} className="mr-2" />
                  Manage Team
                </Button>
                <Button variant="outline" size="sm" className="justify-start">
                  <DollarSign size={16} className="mr-2" />
                  Review Budget
                </Button>
                <Button variant="outline" size="sm" className="justify-start">
                  <Package size={16} className="mr-2" />
                  Process Advances
                </Button>
                <Button variant="outline" size="sm" className="justify-start">
                  <FileText size={16} className="mr-2" />
                  View Reports
                </Button>
                <Button variant="outline" size="sm" className="justify-start">
                  <TrendingUp size={16} className="mr-2" />
                  View Metrics
                </Button>
              </div>
            </Stack>
          </CardBody>
        </Card>

        {/* Alerts & Notifications */}
        <Card variant="elevated" inverted>
          <CardBody>
            <Stack gap={4}>
              <h3 className="font-heading text-body-lg font-weight-bold text-white">Alerts</h3>
              <Stack gap={3}>
                {metrics.tasks.overdue > 0 && (
                  <div className="flex items-center gap-3 rounded border-2 border-error-500/30 bg-error-500/10 p-3">
                    <AlertTriangle size={20} className="text-error-500" />
                    <div>
                      <p className="text-body-sm font-weight-medium text-white">
                        {metrics.tasks.overdue} Overdue Tasks
                      </p>
                      <p className="text-mono-xs text-on-dark-muted">
                        Review and update task deadlines
                      </p>
                    </div>
                  </div>
                )}
                {metrics.advances.pending > 5 && (
                  <div className="flex items-center gap-3 rounded border-2 border-warning-500/30 bg-warning-500/10 p-3">
                    <Clock size={20} className="text-warning-500" />
                    <div>
                      <p className="text-body-sm font-weight-medium text-white">
                        {metrics.advances.pending} Pending Advances
                      </p>
                      <p className="text-mono-xs text-on-dark-muted">
                        Review advance requests from crew
                      </p>
                    </div>
                  </div>
                )}
                {metrics.team.pending > 0 && (
                  <div className="flex items-center gap-3 rounded border-2 border-primary-500/30 bg-primary-500/10 p-3">
                    <Users size={20} className="text-primary-500" />
                    <div>
                      <p className="text-body-sm font-weight-medium text-white">
                        {metrics.team.pending} Pending Confirmations
                      </p>
                      <p className="text-mono-xs text-on-dark-muted">
                        Follow up with unconfirmed team members
                      </p>
                    </div>
                  </div>
                )}
              </Stack>
            </Stack>
          </CardBody>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card variant="elevated" inverted>
        <CardBody>
          <Stack gap={4}>
            <h3 className="font-heading text-body-lg font-weight-bold text-white">Recent Activity</h3>
            <Stack gap={2}>
              {[
                { action: "Task completed", detail: "Stage setup checklist", time: "2 hours ago", icon: CheckCircle },
                { action: "Advance approved", detail: "Audio equipment rental", time: "4 hours ago", icon: Package },
                { action: "Team member confirmed", detail: "John Smith - Stage Manager", time: "Yesterday", icon: Users },
                { action: "Budget updated", detail: "Catering allocation increased", time: "Yesterday", icon: DollarSign },
                { action: "Document uploaded", detail: "Venue floor plan v2", time: "2 days ago", icon: FileText },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 border-b border-ink-800 py-3 last:border-0"
                >
                  <div className="flex size-8 items-center justify-center rounded bg-ink-800">
                    <activity.icon size={16} className="text-ink-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-body-sm font-weight-medium text-white">{activity.action}</p>
                    <p className="text-mono-xs text-on-dark-muted">{activity.detail}</p>
                  </div>
                  <span className="text-mono-xs text-ink-500">{activity.time}</span>
                </div>
              ))}
            </Stack>
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}
