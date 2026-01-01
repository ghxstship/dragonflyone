"use client";

/**
 * Production Settings Page
 * Uses DetailPage template for consistent layout
 */

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Shield, List, AlertTriangle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Body, Button, Card, Input, Textarea, DetailPage, Section, SectionHeader, useToast, Box, Stack} from "@ghxstship/ui";

interface ProductionSettings {
  id: string;
  name: string;
  description: string;
  visibility: "private" | "team" | "public";
  notifications: boolean;
}

const DEMO_SETTINGS: ProductionSettings = {
  id: "1",
  name: "Summer Festival 2024",
  description: "Annual summer music festival",
  visibility: "team",
  notifications: true,
};

export default function ProductionSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const productionId = params.productionId as string;
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data: settings = DEMO_SETTINGS, isLoading, error, refetch } = useQuery({
    queryKey: ["production-settings", productionId],
    queryFn: async () => {
      const response = await fetch(`/api/productions/${productionId}/settings`);
      if (!response.ok) return DEMO_SETTINGS;
      const data = await response.json();
      return data.settings || DEMO_SETTINGS;
    },
  });

  const [formData, setFormData] = useState(settings);

  const updateSettings = useMutation({
    mutationFn: async (data: Partial<ProductionSettings>) => {
      const response = await fetch(`/api/productions/${productionId}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update settings");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["production-settings", productionId] });
      toast.success("Settings Saved", "Production settings updated successfully");
    },
    onError: (err: Error) => {
      toast.error("Error", err.message);
    },
  });

  const deleteProduction = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/productions/${productionId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete production");
      return response.json();
    },
    onSuccess: () => {
      toast.success("Production Deleted", "Production has been deleted");
      router.push("/productions");
    },
    onError: (err: Error) => {
      toast.error("Delete Failed", err.message);
    },
  });

  const tabs = [
    {
      id: "general",
      label: "General",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="General Settings" description="Basic production information" />
          <Card className="p-6 mt-4">
            <Stack gap={4}>
              <Box>
                <Body size="sm" className="mb-1">Production Name</Body>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </Box>
              <Box>
                <Body size="sm" className="mb-1">Description</Body>
                <Textarea rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </Box>
              <Button variant="solid" onClick={() => updateSettings.mutate(formData)} disabled={updateSettings.isPending}>
                {updateSettings.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </Stack>
          </Card>
        </Section>
      ),
    },
    {
      id: "access",
      label: "Access",
      icon: <Shield className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Access Control" description="Manage who can access this production" />
          <Card className="p-6 mt-4">
            <Stack gap={4}>
              <Box>
                <Body size="sm" className="mb-2">Visibility</Body>
                <Box className="flex gap-2">
                  {["private", "team", "public"].map((v) => (
                    <Button key={v} variant={formData.visibility === v ? "solid" : "outline"} size="sm" onClick={() => setFormData({ ...formData, visibility: v as ProductionSettings["visibility"] })}>
                      {v.charAt(0).toUpperCase() + v.slice(1)}
                    </Button>
                  ))}
                </Box>
              </Box>
              <Box className="flex items-center justify-between pt-4 border-t border-grey-800">
                <Box>
                  <Body className="font-weight-medium">Email Notifications</Body>
                  <Body size="sm" className="text-on-dark-muted">Receive updates about this production</Body>
                </Box>
                <Button variant={formData.notifications ? "solid" : "outline"} size="sm" onClick={() => setFormData({ ...formData, notifications: !formData.notifications })}>
                  {formData.notifications ? "Enabled" : "Disabled"}
                </Button>
              </Box>
            </Stack>
          </Card>
        </Section>
      ),
    },
    {
      id: "danger",
      label: "Danger Zone",
      icon: <AlertTriangle className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Danger Zone" description="Irreversible actions" />
          <Card className="p-6 mt-4 border-error">
            <Box className="flex items-center justify-between">
              <Box>
                <Body className="font-weight-bold text-error">Delete Production</Body>
                <Body size="sm" className="text-on-dark-muted">This action cannot be undone</Body>
              </Box>
              <Button variant="outline" className="border-error text-error" onClick={() => setShowDeleteModal(true)}>Delete</Button>
            </Box>
          </Card>
          {showDeleteModal && (
            <Card className="p-6 mt-4 border-error">
              <Body className="font-weight-bold mb-4">Are you sure you want to delete this production?</Body>
              <Box className="flex gap-4">
                <Button variant="solid" className="bg-error" onClick={() => deleteProduction.mutate()} disabled={deleteProduction.isPending}>
                  {deleteProduction.isPending ? "Deleting..." : "Yes, Delete"}
                </Button>
                <Button variant="outline" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
              </Box>
            </Card>
          )}
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{ kicker: "Production", title: "Settings", description: "Manage production settings" }}
      backButton={{ label: "Overview", href: `/p/${productionId}/overview` }}
      loading={isLoading}
      error={error instanceof Error ? error : null}
      onRetry={refetch}
      tabs={tabs}
    />
  );
}
