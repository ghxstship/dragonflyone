"use client";

/**
 * Advance Request Detail Page
 * Shows detailed information about a specific advance request
 * Uses normalized DetailPage template from @ghxstship/ui
 */

import { useRouter } from "next/navigation";
import { ClipboardList, Package } from "lucide-react";
import { useAuthContext, PlatformRole, useAdvancingRequest } from "@ghxstship/config";
import {
  Badge, DetailPage} from "@ghxstship/ui";
import { AdvanceRequestDetail } from "@/components/advancing/advance-request-detail";
import { FulfillmentManager } from "@/components/advancing/fulfillment-manager";

const ADMIN_ROLES = [
  PlatformRole.COMPVSS_ADMIN,
  PlatformRole.LEGEND_SUPER_ADMIN,
  PlatformRole.LEGEND_ADMIN,
  PlatformRole.LEGEND_DEVELOPER,
];

const STATUS_COLORS: Record<string, "success" | "warning" | "error" | "info" | "outline"> = {
  pending: "warning",
  approved: "success",
  in_progress: "info",
  fulfilled: "success",
  rejected: "error",
  cancelled: "error",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  in_progress: "In Progress",
  fulfilled: "Fulfilled",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

export default function AdvanceRequestPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { hasRole } = useAuthContext();
  const { data: request, isLoading, error, refetch } = useAdvancingRequest(params.id);

  const canFulfillRequest = ADMIN_ROLES.some((role) => hasRole(role));
  const canFulfill = canFulfillRequest && request && ["approved", "in_progress"].includes(request.status);

  // Define tabs for the detail page
  const tabs: DetailPageTab[] = [
    {
      id: "details",
      label: "Details",
      icon: <ClipboardList className="size-4" />,
      content: <AdvanceRequestDetail requestId={params.id} onUpdate={() => router.refresh()} />,
    },
  ];

  // Add fulfillment tab if user has permission
  if (canFulfill) {
    tabs.push({
      id: "fulfill",
      label: "Fulfill Items",
      icon: <Package className="size-4" />,
      content: <FulfillmentManager requestId={params.id} onSuccess={() => router.refresh()} />,
    });
  }

  return (
    <DetailPage
      header={{
        kicker: "Advance Request",
        title: request?.activation_name || `Request ${params.id}`,
        description: request?.project?.name || undefined,
        badge: request?.status ? (
          <Badge variant={STATUS_COLORS[request.status] || "outline"}>
            {STATUS_LABELS[request.status] || request.status}
          </Badge>
        ) : undefined,
      }}
      backButton={{ label: "Back to Advancing", href: "/advancing" }}
      loading={isLoading}
      error={error instanceof Error ? error : null}
      onRetry={refetch}
      notFound={!isLoading && !error && !request}
      notFoundMessage="The advance request you're looking for doesn't exist or has been removed."
      tabs={tabs}
    />
  );
}
