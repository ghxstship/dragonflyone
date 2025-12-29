"use client";

/**
 * COMPVSS New Advance Request Page
 * Form for creating new advancing requests
 * Uses DetailPage template for consistent layout
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext, PlatformRole } from "@ghxstship/config";
import { Button, DetailPage, Card } from "@ghxstship/ui";
import { AdvanceRequestForm } from "@/components/advancing/advance-request-form";
import { ArrowLeft } from "lucide-react";

const ADMIN_ROLES = [
  PlatformRole.COMPVSS_ADMIN,
  PlatformRole.LEGEND_SUPER_ADMIN,
  PlatformRole.LEGEND_ADMIN,
  PlatformRole.LEGEND_DEVELOPER,
];

export default function NewAdvanceRequestPage() {
  const router = useRouter();
  const { hasRole } = useAuthContext();

  const canCreateRequest = ADMIN_ROLES.some((role) => hasRole(role));

  useEffect(() => {
    if (!canCreateRequest) {
      router.replace("/advancing");
    }
  }, [canCreateRequest, router]);

  if (!canCreateRequest) {
    return null;
  }

  const headerActions = (
    <Button
      variant="outline"
      icon={<ArrowLeft className="size-4" />}
      iconPosition="left"
      onClick={() => router.back()}
    >
      Back
    </Button>
  );

  return (
    <DetailPage
      header={{
        kicker: "Operations",
        title: "Create Advance Request",
        description: "Request production items and services for your event",
      }}
      loading={false}
      error={null}
      actions={headerActions}
    >
      <Card className="p-6">
        <AdvanceRequestForm
          onSuccess={(requestId) => router.push(`/advancing/${requestId}`)}
          onCancel={() => router.back()}
        />
      </Card>
    </DetailPage>
  );
}
