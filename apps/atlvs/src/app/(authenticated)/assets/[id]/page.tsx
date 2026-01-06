"use client";

/**
 * Asset Detail Page
 * Shows detailed information about a specific asset from the asset catalog
 * Uses normalized DetailPage template from @ghxstship/ui
 */

import { useRouter, useParams } from "next/navigation";
import { Pencil, Wrench, Upload, History, Trash2 } from "lucide-react";
import { useAuthContext, ATLVS_ADMIN_ROLES } from "@ghxstship/config";
import {
  Badge, Body, Card, DetailPage, Grid, StatCard, Section, SectionHeader, ConfirmDialog, useToast,
  type DetailPageTab} from "@ghxstship/ui";
import { useAssets, useDeleteAsset } from "@/hooks/useAssets";
import { useState } from "react";

const STATE_COLORS: Record<string, "success" | "warning" | "error" | "info" | "outline"> = {
  available: "success",
  reserved: "warning",
  deployed: "info",
  maintenance: "error",
  retired: "outline",
};

const STATE_LABELS: Record<string, string> = {
  available: "Available",
  reserved: "Reserved",
  deployed: "Deployed",
  maintenance: "In Maintenance",
  retired: "Retired",
};

const CATEGORY_LABELS: Record<string, string> = {
  audio: "Audio Equipment",
  video: "Video Equipment",
  lighting: "Lighting",
  staging: "Staging",
  rigging: "Rigging",
  power: "Power Distribution",
  furniture: "Furniture",
  vehicles: "Vehicles",
  tools: "Tools",
  other: "Other",
};

export default function AssetDetailPage() {
  const router = useRouter();
  const params = useParams();
  const assetId = params?.id as string;
  const toast = useToast();

  const { hasRole } = useAuthContext();
  const canEdit = ATLVS_ADMIN_ROLES.some((role) => hasRole(role));

  const { data: assets, isLoading, error, refetch } = useAssets();
  const deleteMutation = useDeleteAsset();
  const asset = assets?.find((a) => a.id === assetId);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const handleDelete = async () => {
    if (!asset) return;
    try {
      await deleteMutation.mutateAsync(asset.id);
      toast.success("Asset Deleted", `${asset.tag} has been deleted.`);
      router.push("/assets");
    } catch (err) {
      toast.error("Failed to Delete", err instanceof Error ? err.message : "An error occurred",);
    }
  };

  const currentValue = asset?.current_value ?? asset?.purchase_price;

  // Define tabs for the detail page
  const tabs: DetailPageTab[] = [
    {
      id: "overview",
      label: "Overview",
      content: asset ? (
        <>
          {/* Stats */}
          <Grid cols={4} gap={4} className="grid-cols-2 lg:grid-cols-4 mb-6">
            <StatCard
              label="Category"
              value={CATEGORY_LABELS[asset.category] || asset.category}
            />
            <StatCard
              label="Status"
              value={STATE_LABELS[asset.state] || asset.state}
            />
            <StatCard
              label="Purchase Price"
              value={formatCurrency(asset.purchase_price)}
            />
            <StatCard
              label="Current Value"
              value={formatCurrency(currentValue)}
            />
          </Grid>

          {/* Asset Details */}
          <Section border className="mb-6">
            <SectionHeader title="Asset Information" />
            <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2">
              <Card className="p-4">
                <Body size="xs" className="text-text-muted mb-1">Asset Tag</Body>
                <Body className="text-text-primary font-mono">{asset.tag}</Body>
              </Card>
              <Card className="p-4">
                <Body size="xs" className="text-text-muted mb-1">Name / Description</Body>
                <Body className="text-text-primary">{asset.tag || "Not provided"}</Body>
              </Card>
              <Card className="p-4">
                <Body size="xs" className="text-text-muted mb-1">Location</Body>
                <Body className="text-text-primary">{asset.location || "Not specified"}</Body>
              </Card>
              <Card className="p-4">
                <Body size="xs" className="text-text-muted mb-1">Category</Body>
                <Body className="text-text-primary">{CATEGORY_LABELS[asset.category] || asset.category}</Body>
              </Card>
            </Grid>
          </Section>

          {/* Financial Details */}
          <Section border className="mb-6">
            <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2">
              <Card className="p-4">
                <Body size="xs" className="text-text-muted mb-1">Purchase Price</Body>
                <Body className="text-text-primary font-mono">{formatCurrency(asset.purchase_price)}</Body>
              </Card>
              <Card className="p-4">
                <Body size="xs" className="text-text-muted mb-1">Purchase Date</Body>
                <Body className="text-text-primary">{formatDate(asset.purchase_date || asset.acquired_at)}</Body>
              </Card>
              <Card className="p-4">
                <Body size="xs" className="text-text-muted mb-1">Current Value</Body>
                <Body className="text-text-primary font-mono">{formatCurrency(currentValue)}</Body>
              </Card>
              <Card className="p-4">
                <Body size="xs" className="text-text-muted mb-1">Depreciation Rate</Body>
                <Body className="text-text-primary">{asset.depreciation_rate ? `${asset.depreciation_rate}%` : "Not set"}</Body>
              </Card>
            </Grid>
          </Section>

          {/* Assignment */}
          <Section border>
            <SectionHeader title="Assignment" />
            <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2">
              <Card className="p-4">
                <Body size="xs" className="text-text-muted mb-1">Assigned To</Body>
                <Body className="text-text-primary">{asset.assigned_to || "Unassigned"}</Body>
              </Card>
              <Card className="p-4">
                <Body size="xs" className="text-text-muted mb-1">Project</Body>
                <Body className="text-text-primary">{asset.project_id || "No project"}</Body>
              </Card>
              <Card className="p-4">
                <Body size="xs" className="text-text-muted mb-1">Created</Body>
                <Body className="text-text-primary">{formatDate(asset.created_at)}</Body>
              </Card>
              <Card className="p-4">
                <Body size="xs" className="text-text-muted mb-1">Last Updated</Body>
                <Body className="text-text-primary">{formatDate(asset.updated_at)}</Body>
              </Card>
            </Grid>
          </Section>
        </>
      ) : null,
    },
    {
      id: "history",
      label: "History",
      icon: <History className="size-4" />,
      content: (
        <Section border>
          <SectionHeader title="Asset History" />
          <Card className="p-6">
            <Body className="text-text-muted">No history records available for this asset.</Body>
          </Card>
        </Section>
      ),
    },
    {
      id: "maintenance",
      label: "Maintenance",
      icon: <Wrench className="size-4" />,
      content: (
        <Section border>
          <SectionHeader title="Maintenance Records" />
          <Card className="p-6">
            <Body className="text-text-muted">No maintenance records available for this asset.</Body>
          </Card>
        </Section>
      ),
    },
  ];

  return (
    <>
      <DetailPage
        entityType="assets"
        entityId={assetId}
        entitySelector={() => asset || null}
        header={{
          kicker: asset?.category ? CATEGORY_LABELS[asset.category] : "Asset",
          title: asset?.tag || "Asset Details",
          description: asset?.tag || undefined,
          badge: asset?.state ? (
            <Badge variant={STATE_COLORS[asset.state] || "outline"}>
              {STATE_LABELS[asset.state] || asset.state}
            </Badge>
          ) : undefined,
        }}
        backButton={{ label: "Back to Assets", href: "/assets" }}
        isLoading={isLoading}
        error={error instanceof Error ? error : null}
        onRetry={refetch}
        notFound={!isLoading && !error && !asset}
        notFoundMessage="The asset you're looking for doesn't exist or has been removed."
        tabs={tabs}
        actions={
          canEdit ? [
            {
              id: 'checkout',
              label: 'Check Out',
              icon: <Upload className="size-4" />,
              onClick: () => router.push(`/assets/${assetId}/checkout`),
            },
            {
              id: 'maintenance',
              label: 'Maintenance',
              icon: <Wrench className="size-4" />,
              onClick: () => router.push(`/assets/${assetId}/maintenance`),
            },
            {
              id: 'edit',
              label: 'Edit',
              icon: <Pencil className="size-4" />,
              onClick: () => router.push(`/assets/${assetId}/edit`),
            },
            {
              id: 'delete',
              label: 'Delete',
              icon: <Trash2 className="size-4" />,
              onClick: () => setDeleteConfirmOpen(true),
              variant: 'danger' as const,
            },
          ] : undefined
        }
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Asset"
        message={`Are you sure you want to delete "${asset?.tag}"? This action cannot be undone.`}
        variant="danger"
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </>
  );
}
