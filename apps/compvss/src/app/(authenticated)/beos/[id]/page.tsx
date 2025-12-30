"use client";

/**
 * BEO Detail Page
 * Shows detailed information about a specific Banquet Event Order
 * Uses normalized DetailPage template from @ghxstship/ui
 */

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Edit2, CheckCircle, Send, FileText, Clock, Users, MapPin, Utensils, ListChecks} from "lucide-react";
import {
  Badge, Body, Button, Card, DetailPage, Grid, StatCard, Section, SectionHeader, Modal, useNotifications} from "@ghxstship/ui";
import { useBEO, useApproveBEO, useDistributeBEO } from "@/hooks/useBEOs";
import { useAuthContext, PlatformRole } from "@ghxstship/config";

const ADMIN_ROLES = [
  PlatformRole.COMPVSS_ADMIN,
  PlatformRole.LEGEND_SUPER_ADMIN,
  PlatformRole.LEGEND_ADMIN,
  PlatformRole.LEGEND_DEVELOPER,
];

const STATUS_COLORS: Record<string, "success" | "warning" | "error" | "info" | "outline"> = {
  draft: "outline",
  pending_review: "warning",
  approved: "success",
  distributed: "info",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  pending_review: "Pending Review",
  approved: "Approved",
  distributed: "Distributed",
};

const DEPARTMENTS = [
  { id: "kitchen", label: "Kitchen", icon: Utensils },
  { id: "bar", label: "Bar", icon: Utensils },
  { id: "service", label: "Service", icon: Users },
  { id: "av", label: "Audio/Visual", icon: FileText },
  { id: "setup", label: "Setup Crew", icon: MapPin },
];

export default function BEODetailPage() {
  const params = useParams();
  const router = useRouter();
  const { hasRole } = useAuthContext();
  const { addNotification } = useNotifications();
  const beoId = params.id as string;

  const canManageBEO = ADMIN_ROLES.some((role) => hasRole(role));

  const { data, isLoading, error, refetch } = useBEO(beoId);
  const beo = data?.beo;
  const approveMutation = useApproveBEO();
  const distributeMutation = useDistributeBEO();

  const [showDistributeModal, setShowDistributeModal] = useState(false);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeStr: string) => {
    return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const handleApprove = async () => {
    try {
      await approveMutation.mutateAsync(beoId);
      addNotification({
        type: "success",
        title: "BEO Approved",
        message: "The BEO has been approved successfully.",
      });
    } catch (err) {
      addNotification({
        type: "error",
        title: "Approval Failed",
        message: err instanceof Error ? err.message : "An error occurred",
      });
    }
  };

  const handleDistribute = async () => {
    if (selectedDepartments.length === 0) return;
    try {
      await distributeMutation.mutateAsync({
        id: beoId,
        recipients: selectedDepartments,
      });
      setShowDistributeModal(false);
      setSelectedDepartments([]);
      addNotification({
        type: "success",
        title: "BEO Distributed",
        message: `BEO sent to ${selectedDepartments.length} department(s).`,
      });
    } catch (err) {
      addNotification({
        type: "error",
        title: "Distribution Failed",
        message: err instanceof Error ? err.message : "An error occurred",
      });
    }
  };

  // Define tabs for the detail page
  const tabs: DetailPageTab[] = [
    {
      id: "overview",
      label: "Overview",
      content: beo ? (
        <>
          {/* Stats */}
          <Grid cols={4} gap={4} className="grid-cols-2 lg:grid-cols-4 mb-6">
            <StatCard label="Event Date" value={formatDate(beo.event_date)} />
            <StatCard
              label="Event Time"
              value={beo.event_start_time ? `${formatTime(beo.event_start_time)}${beo.event_end_time ? ` - ${formatTime(beo.event_end_time)}` : ""}` : "TBD"}
            />
            <StatCard label="Guest Count" value={`${beo.guest_count || 0} guests`} />
            <StatCard label="Room Setup" value={beo.sections?.room_setup?.layout || "Standard"} />
          </Grid>

          {/* Event Details */}
          {beo.sections && Object.keys(beo.sections).length > 0 && (
            <Section border className="mb-6">
              <SectionHeader title="Event Details" />
              <div className="space-y-4">
                {Object.entries(beo.sections).map(([sectionKey, sectionData]) => (
                  <Card key={sectionKey} inverted className="p-4">
                    <Body className="text-white font-weight-medium capitalize mb-2">
                      {sectionKey.replace(/_/g, " ")}
                    </Body>
                    <Body size="sm" className="text-grey-300">
                      {typeof sectionData === "string"
                        ? sectionData
                        : Array.isArray(sectionData)
                          ? sectionData.map((item) => (typeof item === "string" ? item : JSON.stringify(item))).join(", ")
                          : JSON.stringify(sectionData, null, 2)}
                    </Body>
                  </Card>
                ))}
              </div>
            </Section>
          )}

          {/* Notes */}
          {beo.notes && (
            <Section border>
              <SectionHeader title="Notes" />
              <Card inverted className="p-4">
                <Body className="text-white whitespace-pre-wrap">{beo.notes}</Body>
              </Card>
            </Section>
          )}
        </>
      ) : null,
    },
    {
      id: "timeline",
      label: "Timeline",
      icon: <Clock className="size-4" />,
      content: beo?.sections?.timeline && beo.sections.timeline.length > 0 ? (
        <Section border>
          <SectionHeader title="Event Timeline" />
          <div className="space-y-3">
            {beo.sections.timeline.map((item: { time: string; activity: string; notes?: string }, idx: number) => (
              <Card key={idx} inverted className="p-4">
                <div className="flex items-start gap-4">
                  <Body className="text-primary font-weight-medium w-20 flex-shrink-0">{item.time}</Body>
                  <div className="flex-1">
                    <Body className="text-white font-weight-medium">{item.activity}</Body>
                    {item.notes && (
                      <Body size="xs" className="text-grey-400 mt-1">{item.notes}</Body>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Section>
      ) : (
        <Section border>
          <SectionHeader title="Event Timeline" />
          <Card inverted className="p-6">
            <Body className="text-grey-400">No timeline items have been added yet.</Body>
          </Card>
        </Section>
      ),
    },
    {
      id: "distribution",
      label: "Distribution",
      icon: <Send className="size-4" />,
      content: (
        <Section border>
          <SectionHeader title="Distribution History" />
          <Card inverted className="p-6">
            <Body className="text-grey-400">Distribution history will be displayed here.</Body>
          </Card>
        </Section>
      ),
    },
    {
      id: "checklist",
      label: "Checklist",
      icon: <ListChecks className="size-4" />,
      content: (
        <Section border>
          <SectionHeader title="Event Checklist" />
          <Card inverted className="p-6">
            <Body className="text-grey-400">Event checklist items will be displayed here.</Body>
          </Card>
        </Section>
      ),
    },
  ];

  // Build actions based on BEO status
  const buildActions = () => {
    if (!canManageBEO || !beo) return undefined;

    const actions: React.ReactNode[] = [];

    if (beo.status === "draft") {
      actions.push(
        <Button
          key="edit"
          variant="solid"
          onClick={() => router.push(`/beos/${beoId}/edit`)}
          icon={<Edit2 className="size-4" />}
          iconPosition="left"
        >
          Edit
        </Button>
      );
    }

    if (beo.status === "pending_review") {
      actions.push(
        <Button
          key="approve"
          variant="solid"
          onClick={handleApprove}
          disabled={approveMutation.isPending}
          icon={<CheckCircle className="size-4" />}
          iconPosition="left"
          className="bg-success hover:bg-success/90"
        >
          {approveMutation.isPending ? "Approving..." : "Approve"}
        </Button>
      );
    }

    if (beo.status === "approved") {
      actions.push(
        <Button
          key="distribute"
          variant="solid"
          onClick={() => setShowDistributeModal(true)}
          icon={<Send className="size-4" />}
          iconPosition="left"
        >
          Distribute
        </Button>
      );
    }

    return actions.length > 0 ? <>{actions}</> : undefined;
  };

  return (
    <>
      <DetailPage
        header={{
          kicker: "Banquet Event Order",
          title: beo?.beo_number || "BEO Details",
          description: beo?.name || undefined,
          badge: beo?.status ? (
            <Badge variant={STATUS_COLORS[beo.status] || "outline"}>
              {STATUS_LABELS[beo.status] || beo.status}
            </Badge>
          ) : undefined,
        }}
        backButton={{ label: "Back to BEOs", href: "/beos" }}
        loading={isLoading}
        error={error instanceof Error ? error : null}
        onRetry={refetch}
        notFound={!isLoading && !error && !beo}
        notFoundMessage="The BEO you're looking for doesn't exist or has been removed."
        tabs={tabs}
        actions={buildActions()}
      />

      {/* Distribute Modal */}
      <Modal
        open={showDistributeModal}
        onClose={() => setShowDistributeModal(false)}
        title="Distribute BEO"
      >
        <Body className="mb-4">Select departments to receive this BEO:</Body>
        <div className="space-y-2 mb-4">
          {DEPARTMENTS.map((dept) => {
            const Icon = dept.icon;
            const isSelected = selectedDepartments.includes(dept.id);
            return (
              <Button
                key={dept.id}
                type="button"
                variant="outline"
                onClick={() => {
                  setSelectedDepartments((prev) =>
                    isSelected ? prev.filter((d) => d !== dept.id) : [...prev, dept.id]
                  );
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-card border-2 transition-colors ${
                  isSelected ? "border-primary bg-primary/10" : "border-border hover:border-muted-foreground"
                }`}
              >
                <Icon className={`h-5 w-5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                <Body size="sm" className={`font-weight-medium ${isSelected ? "text-primary" : "text-foreground"}`}>
                  {dept.label}
                </Body>
                {isSelected && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
              </Button>
            );
          })}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setShowDistributeModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={handleDistribute} disabled={distributeMutation.isPending}>
            {distributeMutation.isPending ? "Sending..." : "Send"}
          </Button>
        </div>
      </Modal>
    </>
  );
}
