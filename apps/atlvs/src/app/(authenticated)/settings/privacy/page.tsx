"use client";

/**
 * Privacy Settings Page
 * Manage privacy and data settings
 * Uses DetailPage template for consistent layout
 */

import { useState } from "react";
import { Shield, Eye, EyeOff, Download, Trash2, List, FileText } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Badge, Body, Button, Card, Modal, ModalBody, ModalFooter, ModalHeader, DetailPage, Section, SectionHeader, useToast, Box, Stack } from "@ghxstship/ui";

interface PrivacySettings {
  profile_visibility: "public" | "team" | "private";
  activity_tracking: boolean;
  analytics_sharing: boolean;
  marketing_emails: boolean;
  data_retention_days: number;
}

const DEMO_SETTINGS: PrivacySettings = {
  profile_visibility: "team",
  activity_tracking: true,
  analytics_sharing: false,
  marketing_emails: true,
  data_retention_days: 365,
};

export default function PrivacySettingsPage() {
  const queryClient = useQueryClient();
  const toast = useToast();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showExportConfirm, setShowExportConfirm] = useState(false);

  const { data: settings = DEMO_SETTINGS, isLoading, error, refetch } = useQuery({
    queryKey: ["privacy-settings"],
    queryFn: async () => {
      const response = await fetch("/api/settings/privacy");
      if (!response.ok) return DEMO_SETTINGS;
      return response.json() as Promise<PrivacySettings>;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (newSettings: Partial<PrivacySettings>) => {
      const response = await fetch("/api/settings/privacy", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSettings),
      });
      if (!response.ok) throw new Error("Failed to update settings");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["privacy-settings"] });
      toast.success("Saved", "Privacy settings updated");
    },
    onError: () => {
      toast.error("Error", "Failed to update settings");
    },
  });

  const exportMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/settings/privacy/export", { method: "POST" });
      if (!response.ok) throw new Error("Failed to export data");
      return response.json();
    },
    onSuccess: () => {
      toast.success("Export Started", "You will receive an email when your data is ready");
      setShowExportConfirm(false);
    },
    onError: () => {
      toast.error("Error", "Failed to start export");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/settings/privacy/delete-account", { method: "POST" });
      if (!response.ok) throw new Error("Failed to delete account");
      return response.json();
    },
    onSuccess: () => {
      toast.success("Account Scheduled for Deletion", "Your account will be deleted in 30 days");
      setShowDeleteConfirm(false);
    },
    onError: () => {
      toast.error("Error", "Failed to schedule deletion");
    },
  });

  const toggleSetting = (key: keyof PrivacySettings) => {
    if (typeof settings[key] === "boolean") {
      updateMutation.mutate({ [key]: !settings[key] });
    }
  };

  const tabs = [
    {
      id: "privacy",
      label: "Privacy",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <Card className="p-6 mb-6">
            <SectionHeader title="Profile Visibility" description="Control who can see your profile" />
            <Box className="flex gap-2 mt-4">
              {(["public", "team", "private"] as const).map((visibility) => (
                <Button
                  key={visibility}
                  variant={settings.profile_visibility === visibility ? "solid" : "outline"}
                  onClick={() => updateMutation.mutate({ profile_visibility: visibility })}
                  disabled={updateMutation.isPending}
                  className="capitalize"
                >
                  {visibility === "public" && <Eye className="size-4 mr-2" />}
                  {visibility === "team" && <Shield className="size-4 mr-2" />}
                  {visibility === "private" && <EyeOff className="size-4 mr-2" />}
                  {visibility}
                </Button>
              ))}
            </Box>
          </Card>

          <Card className="p-6 mb-6">
            <SectionHeader title="Data & Tracking" description="Control how your data is used" />
            <Stack gap={4} className="mt-4">
              {[
                { key: "activity_tracking" as const, label: "Activity Tracking", description: "Track your activity for personalized recommendations" },
                { key: "analytics_sharing" as const, label: "Analytics Sharing", description: "Share anonymous usage data to help improve the product" },
                { key: "marketing_emails" as const, label: "Marketing Emails", description: "Receive product updates and promotional emails" },
              ].map(({ key, label, description }) => (
                <Box key={key} className="flex items-center justify-between p-4 bg-grey-800 rounded-card">
                  <Box>
                    <Body className="font-weight-medium">{label}</Body>
                    <Body size="sm" className="text-on-dark-muted">{description}</Body>
                  </Box>
                  <Button
                    variant="ghost"
                    onClick={() => toggleSetting(key)}
                    disabled={updateMutation.isPending}
                    className={`relative w-12 h-6 rounded-avatar transition-colors ${settings[key] ? "bg-primary" : "bg-grey-600"}`}
                  >
                    <Box className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-avatar transition-transform ${settings[key] ? "translate-x-6" : "translate-x-0"}`} />
                  </Button>
                </Box>
              ))}
            </Stack>
          </Card>

          <Card className="p-6">
            <SectionHeader title="Data Retention" description="How long your data is stored" />
            <Box className="flex items-center gap-4 mt-4">
              <Badge variant="info" className="font-weight-medium px-4 py-2">{settings.data_retention_days} days</Badge>
              <Body className="text-on-dark-muted">Your data is automatically deleted after this period of inactivity</Body>
            </Box>
          </Card>
        </Section>
      ),
    },
    {
      id: "data",
      label: "Your Data",
      icon: <FileText className="size-4" />,
      content: (
        <Section>
          <Card className="p-6 mb-6">
            <SectionHeader title="Export Your Data" description="Download a copy of all your data" />
            <Box className="mt-4">
              <Body className="text-on-dark-muted mb-4">Request a complete export of your data including projects, contacts, and activity history. You will receive an email with a download link when ready.</Body>
              <Button variant="outline" onClick={() => setShowExportConfirm(true)} icon={<Download className="size-4" />} iconPosition="left">
                Request Data Export
              </Button>
            </Box>
          </Card>

          <Card className="p-6 border-error">
            <SectionHeader title="Delete Account" description="Permanently delete your account and all data" />
            <Box className="mt-4">
              <Body className="text-on-dark-muted mb-4">This action cannot be undone. All your data will be permanently deleted after a 30-day grace period.</Body>
              <Button variant="outline" className="border-error text-error" onClick={() => setShowDeleteConfirm(true)} icon={<Trash2 className="size-4" />} iconPosition="left">
                Delete Account
              </Button>
            </Box>
          </Card>
        </Section>
      ),
    },
  ];

  return (
    <>
      <DetailPage
        header={{ kicker: "Settings", title: "Privacy & Data", description: "Manage your privacy settings and data" }}
        backButton={{ label: "Settings", href: "/settings" }}
        loading={isLoading}
        error={error instanceof Error ? error : null}
        onRetry={refetch}
        tabs={tabs}
      />

      <Modal open={showExportConfirm} onClose={() => setShowExportConfirm(false)}>
        <ModalHeader><Body className="font-weight-bold font-weight-medium">Export Your Data</Body></ModalHeader>
        <ModalBody>
          <Body className="text-on-dark-muted">We will prepare a complete export of your data. This may take a few hours. You will receive an email with a download link when ready.</Body>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowExportConfirm(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => exportMutation.mutate()} disabled={exportMutation.isPending}>
            {exportMutation.isPending ? "Starting..." : "Start Export"}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}>
        <ModalHeader><Body className="font-weight-bold font-weight-medium text-error">Delete Account</Body></ModalHeader>
        <ModalBody>
          <Body className="text-on-dark-muted mb-4">Are you sure you want to delete your account? This action cannot be undone.</Body>
          <Card className="p-4 bg-error/10 border-error">
            <Body size="sm" className="text-error">All your data will be permanently deleted after a 30-day grace period. You can cancel this request within that time.</Body>
          </Card>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
          <Button variant="solid" className="bg-error" onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? "Processing..." : "Delete My Account"}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
