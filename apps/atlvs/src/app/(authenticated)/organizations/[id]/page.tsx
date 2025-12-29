"use client";

/**
 * Organization Detail Page
 * Shows detailed information about a specific organization from the unified organizations table
 * Consolidates: vendors, clients, sponsors, partners
 * Uses normalized DetailPage template from @ghxstship/ui
 */

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Pencil,
  FileText,
  Users,
  DollarSign,
  Trash2,
} from "lucide-react";
import { useAuthContext, ATLVS_ADMIN_ROLES } from "@ghxstship/config";
import {
  Badge,
  Body,
  Button,
  Card,
  DetailPage,
  Grid,
  StatCard,
  Section,
  SectionHeader,
  ConfirmDialog,
  useNotifications,
  type DetailPageTab,
} from "@ghxstship/ui";
import { useOrganizationQuery, useDeleteOrganization } from "@/hooks/useOrganizationsQuery";

const STATUS_COLORS: Record<string, "success" | "warning" | "error" | "info" | "outline"> = {
  active: "success",
  inactive: "outline",
  pending: "warning",
  archived: "error",
  draft: "outline",
};

const TYPE_LABELS: Record<string, string> = {
  vendor: "Vendor",
  client: "Client",
  sponsor: "Sponsor",
  partner: "Partner",
  agency: "Agency",
  subsidiary: "Subsidiary",
  other: "Other",
  all: "All",
};

export default function OrganizationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orgId = params?.id as string;
  const { addNotification } = useNotifications();

  const { hasRole } = useAuthContext();
  const canEdit = ATLVS_ADMIN_ROLES.some((role) => hasRole(role));

  const { data: organization, isLoading, error, refetch } = useOrganizationQuery(orgId);
  const deleteMutation = useDeleteOrganization();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleDelete = async () => {
    if (!organization) return;
    try {
      await deleteMutation.mutateAsync(organization.id);
      addNotification({
        type: "success",
        title: "Organization Deleted",
        message: `${organization.name} has been deleted.`,
      });
      router.push("/organizations");
    } catch (err) {
      addNotification({
        type: "error",
        title: "Failed to Delete",
        message: err instanceof Error ? err.message : "An error occurred",
      });
    }
  };

  // Define tabs for the detail page
  const tabs: DetailPageTab[] = [
    {
      id: "overview",
      label: "Overview",
      content: organization ? (
        <>
          {/* Stats */}
          <Grid cols={4} gap={4} className="grid-cols-2 lg:grid-cols-4 mb-6">
            <StatCard label="Type" value={TYPE_LABELS[organization.org_type] || organization.org_type} />
            <StatCard label="Status" value={organization.status} />
            <StatCard label="Created" value={formatDate(organization.created_at)} />
            <StatCard label="Last Updated" value={formatDate(organization.updated_at)} />
          </Grid>

          {/* Contact Information */}
          <Section border className="mb-6">
            <SectionHeader title="Contact Information" />
            <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2">
              <Card inverted className="p-4">
                <Body size="xs" className="text-grey-400 mb-1">Email</Body>
                <Body className="text-white">{organization.email || "Not provided"}</Body>
              </Card>
              <Card inverted className="p-4">
                <Body size="xs" className="text-grey-400 mb-1">Phone</Body>
                <Body className="text-white">{organization.phone || "Not provided"}</Body>
              </Card>
              <Card inverted className="p-4">
                <Body size="xs" className="text-grey-400 mb-1">Website</Body>
                <Body className="text-white">{organization.website || "Not provided"}</Body>
              </Card>
              <Card inverted className="p-4">
                <Body size="xs" className="text-grey-400 mb-1">Industry</Body>
                <Body className="text-white">{organization.industry || "Not specified"}</Body>
              </Card>
            </Grid>
          </Section>

          {/* Business Details */}
          <Section border className="mb-6">
            <SectionHeader title="Business Details" />
            <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2">
              <Card inverted className="p-4">
                <Body size="xs" className="text-grey-400 mb-1">Legal Name</Body>
                <Body className="text-white">{organization.legal_name || organization.name}</Body>
              </Card>
              <Card inverted className="p-4">
                <Body size="xs" className="text-grey-400 mb-1">Tax ID</Body>
                <Body className="text-white">{organization.tax_id || "Not provided"}</Body>
              </Card>
              <Card inverted className="p-4">
                <Body size="xs" className="text-grey-400 mb-1">DUNS Number</Body>
                <Body className="text-white">{organization.duns_number || "Not provided"}</Body>
              </Card>
              <Card inverted className="p-4">
                <Body size="xs" className="text-grey-400 mb-1">Company Size</Body>
                <Body className="text-white">{organization.company_size || "Not specified"}</Body>
              </Card>
            </Grid>
          </Section>

          {/* Description */}
          {organization.description && (
            <Section border className="mb-6">
              <SectionHeader title="Description" />
              <Card inverted className="p-4">
                <Body className="text-white whitespace-pre-wrap">{organization.description}</Body>
              </Card>
            </Section>
          )}

          {/* Notes */}
          {organization.notes && (
            <Section border className="mb-6">
              <SectionHeader title="Notes" />
              <Card inverted className="p-4">
                <Body className="text-white whitespace-pre-wrap">{organization.notes}</Body>
              </Card>
            </Section>
          )}

          {/* Primary Contact */}
          {organization.primary_contact && (
            <Section border>
              <SectionHeader title="Primary Contact" />
              <Grid cols={3} gap={4} className="grid-cols-1 md:grid-cols-3">
                <Card inverted className="p-4">
                  <Body size="xs" className="text-grey-400 mb-1">Name</Body>
                  <Body className="text-white">{organization.primary_contact.display_name}</Body>
                </Card>
                <Card inverted className="p-4">
                  <Body size="xs" className="text-grey-400 mb-1">Email</Body>
                  <Body className="text-white">{organization.primary_contact.email || "Not provided"}</Body>
                </Card>
                <Card inverted className="p-4">
                  <Body size="xs" className="text-grey-400 mb-1">Phone</Body>
                  <Body className="text-white">{organization.primary_contact.phone || "Not provided"}</Body>
                </Card>
              </Grid>
            </Section>
          )}
        </>
      ) : null,
    },
    {
      id: "contacts",
      label: "Contacts",
      icon: <Users className="size-4" />,
      content: (
        <Section border>
          <SectionHeader title="Organization Contacts" />
          <Card inverted className="p-6">
            <Body className="text-grey-400">Contact list will be displayed here.</Body>
          </Card>
        </Section>
      ),
    },
    {
      id: "contracts",
      label: "Contracts",
      icon: <FileText className="size-4" />,
      content: (
        <Section border>
          <SectionHeader title="Contracts" />
          <Card inverted className="p-6">
            <Body className="text-grey-400">Contract history will be displayed here.</Body>
          </Card>
        </Section>
      ),
    },
    {
      id: "financials",
      label: "Financials",
      icon: <DollarSign className="size-4" />,
      content: (
        <Section border>
          <SectionHeader title="Financial Overview" />
          <Card inverted className="p-6">
            <Body className="text-grey-400">Financial data will be displayed here.</Body>
          </Card>
        </Section>
      ),
    },
  ];

  return (
    <>
      <DetailPage
        header={{
          kicker: organization?.org_type ? TYPE_LABELS[organization.org_type] : "Organization",
          title: organization?.name || "Organization Details",
          description: organization?.industry || undefined,
          badge: organization?.status ? (
            <Badge variant={STATUS_COLORS[organization.status] || "outline"}>
              {organization.status}
            </Badge>
          ) : undefined,
        }}
        backButton={{ label: "Back to Organizations", href: "/organizations" }}
        loading={isLoading}
        error={error instanceof Error ? error : null}
        onRetry={refetch}
        notFound={!isLoading && !error && !organization}
        notFoundMessage="The organization you're looking for doesn't exist or has been removed."
        tabs={tabs}
        actions={
          canEdit ? (
            <>
              <Button
                variant="solid"
                onClick={() => router.push(`/organizations/${orgId}/edit`)}
                icon={<Pencil className="size-4" />}
                iconPosition="left"
              >
                Edit
              </Button>
              <Button
                variant="outline"
                inverted
                onClick={() => setDeleteConfirmOpen(true)}
                icon={<Trash2 className="size-4" />}
                iconPosition="left"
                className="border-error text-error hover:bg-error hover:text-white"
              >
                Delete
              </Button>
            </>
          ) : undefined
        }
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Organization"
        message={`Are you sure you want to delete "${organization?.name}"? This action cannot be undone.`}
        variant="danger"
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </>
  );
}
