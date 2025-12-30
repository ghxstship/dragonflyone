"use client";

/**
 * Production Settings Page
 * Production configuration and settings
 * Uses DetailPage template for consistent layout
 */

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Save, Trash2, Users, Lock, List, AlertTriangle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Body, Button, Card, Input, Select, Textarea, Modal, ModalBody, ModalFooter, ModalHeader, DetailPage, Section, SectionHeader, useNotifications} from "@ghxstship/ui";

interface ProductionSettings {
  name: string;
  description: string;
  status: string;
  visibility: string;
  notifications: boolean;
}

export default function ProductionSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();
  const productionId = params.productionId as string;

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState<ProductionSettings>({
    name: "",
    description: "",
    status: "active",
    visibility: "team",
    notifications: true,
  });

  const { isLoading, error, refetch } = useQuery({
    queryKey: ["production-settings", productionId],
    queryFn: async () => {
      const response = await fetch(`/api/productions/${productionId}/settings`);
      if (!response.ok) throw new Error("Failed to fetch settings");
      const data = await response.json();
      setFormData(data);
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: ProductionSettings) => {
      const response = await fetch(`/api/productions/${productionId}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to save settings");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["production-settings", productionId] });
      addNotification({ type: "success", title: "Saved", message: "Production settings updated" });
    },
    onError: () => {
      addNotification({ type: "error", title: "Error", message: "Failed to save settings" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/productions/${productionId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete production");
    },
    onSuccess: () => {
      addNotification({ type: "success", title: "Deleted", message: "Production has been deleted" });
      router.push("/projects");
    },
    onError: () => {
      addNotification({ type: "error", title: "Error", message: "Failed to delete production" });
    },
  });

  const handleChange = (field: keyof ProductionSettings, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const tabs = [
    {
      id: "general",
      label: "General",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <Card className="p-6">
            <SectionHeader title="General Settings" description="Basic production information" />
            <div className="space-y-4 mt-4">
              <div>
                <Body size="sm" className="text-grey-400 mb-1">Production Name</Body>
                <Input value={formData.name} onChange={(e) => handleChange("name", e.target.value)} placeholder="Enter production name" />
              </div>
              <div>
                <Body size="sm" className="text-grey-400 mb-1">Description</Body>
                <Textarea value={formData.description} onChange={(e) => handleChange("description", e.target.value)} placeholder="Enter description" rows={3} />
              </div>
              <div>
                <Body size="sm" className="text-grey-400 mb-1">Status</Body>
                <Select value={formData.status} onChange={(e) => handleChange("status", e.target.value)}>
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </Select>
              </div>
            </div>
            <Button variant="solid" className="mt-6" onClick={() => saveMutation.mutate(formData)} disabled={saveMutation.isPending} icon={<Save className="size-4" />} iconPosition="left">
              {saveMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </Card>
        </Section>
      ),
    },
    {
      id: "access",
      label: "Access",
      icon: <Lock className="size-4" />,
      content: (
        <Section>
          <Card className="p-6">
            <SectionHeader title="Access Settings" description="Control who can access this production" />
            <div className="space-y-4 mt-4">
              <div>
                <Body size="sm" className="text-grey-400 mb-1">Visibility</Body>
                <Select value={formData.visibility} onChange={(e) => handleChange("visibility", e.target.value)}>
                  <option value="private">Private - Only invited members</option>
                  <option value="team">Team - All team members</option>
                  <option value="organization">Organization - All organization members</option>
                </Select>
              </div>
            </div>
            <Button variant="outline" className="mt-6" onClick={() => router.push(`/p/${productionId}/team`)} icon={<Users className="size-4" />} iconPosition="left">
              Manage Team
            </Button>
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
          <Card className="p-6 border-error">
            <SectionHeader title="Danger Zone" description="Irreversible actions" />
            <div className="mt-4 p-4 bg-error/10 rounded-card">
              <Body className="font-weight-medium mb-2">Delete Production</Body>
              <Body size="sm" className="text-grey-400 mb-4">Once you delete a production, there is no going back. Please be certain.</Body>
              <Button variant="outline" className="border-error text-error" onClick={() => setShowDeleteModal(true)} icon={<Trash2 className="size-4" />} iconPosition="left">
                Delete Production
              </Button>
            </div>
          </Card>
        </Section>
      ),
    },
  ];

  return (
    <>
      <DetailPage
        header={{
          kicker: "Production",
          title: "Settings",
          description: "Configure production settings",
        }}
        backButton={{ label: "Overview", href: `/p/${productionId}/overview` }}
        loading={isLoading}
        error={error instanceof Error ? error : null}
        onRetry={refetch}
        tabs={tabs}
      />

      <Modal open={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <ModalHeader><Body className="font-weight-bold font-weight-medium">Delete Production</Body></ModalHeader>
        <ModalBody>
          <Body className="text-grey-400">Are you sure you want to delete this production? This action cannot be undone and all associated data will be permanently removed.</Body>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button variant="solid" className="bg-error" onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? "Deleting..." : "Delete Production"}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
