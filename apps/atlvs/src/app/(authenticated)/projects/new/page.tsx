"use client";

/**
 * New Project Page
 * Create a new production project
 * Uses CreatePage template from @ghxstship/ui
 */

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, MapPin, Calendar } from "lucide-react";
import {
  Body, Grid, Input, Select, Stack, Textarea, CreatePage, useNotifications} from "@ghxstship/ui";
import { useAuthContext, ATLVS_ADMIN_ROLES } from "@ghxstship/config";
import { useCreateProject } from "@/hooks/useProjects";

export default function NewProjectPage() {
  const router = useRouter();
  const { hasRole } = useAuthContext();
  const { addNotification } = useNotifications();
  const createMutation = useCreateProject();

  const [formData, setFormData] = useState({
    name: "",
    client: "",
    type: "production",
    start_date: "",
    end_date: "",
    budget: "",
    description: "",
    venue: "",
    capacity: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof typeof formData, string>>>({});

  const canCreateProject = ATLVS_ADMIN_ROLES.some((role) => hasRole(role));

  const handleChange = useCallback((field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof typeof formData, string>> = {};
    if (!formData.name.trim()) newErrors.name = "Project name is required";
    if (!formData.client.trim()) newErrors.client = "Client is required";
    if (!formData.start_date) newErrors.start_date = "Start date is required";
    if (formData.end_date && formData.start_date && formData.end_date < formData.start_date) {
      newErrors.end_date = "End date must be after start date";
    }
    if (formData.budget && isNaN(parseFloat(formData.budget))) {
      newErrors.budget = "Budget must be a valid number";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await createMutation.mutateAsync({
        name: formData.name.trim(),
        client: formData.client.trim(),
        type: formData.type,
        start_date: formData.start_date,
        end_date: formData.end_date || undefined,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        description: formData.description.trim() || undefined,
        venue: formData.venue.trim() || undefined,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
      });

      addNotification({ type: "success", title: "Project Created", message: `${formData.name} has been created.` });
      router.push("/projects");
    } catch (err) {
      addNotification({ type: "error", title: "Failed to Create Project", message: err instanceof Error ? err.message : "An error occurred" });
    }
  };

  const sections: FormSection[] = useMemo(() => [
    {
      id: "details",
      title: "Project Details",
      icon: <Briefcase className="size-5" />,
      content: (
        <Stack gap={4}>
          <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2">
            <Stack gap={2}>
              <Body size="sm" className="font-weight-medium">Project Name *</Body>
              <Input id="name" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} placeholder="Enter project name" className={errors.name ? "border-error" : ""} />
              {errors.name && <Body size="sm" className="text-error">{errors.name}</Body>}
            </Stack>
            <Stack gap={2}>
              <Body size="sm" className="font-weight-medium">Client *</Body>
              <Input id="client" value={formData.client} onChange={(e) => handleChange("client", e.target.value)} placeholder="Select or enter client" className={errors.client ? "border-error" : ""} />
              {errors.client && <Body size="sm" className="text-error">{errors.client}</Body>}
            </Stack>
            <Stack gap={2}>
              <Body size="sm" className="font-weight-medium">Project Type</Body>
              <Select id="type" value={formData.type} onChange={(e) => handleChange("type", e.target.value)}>
                <option value="production">Production</option>
                <option value="event">Event</option>
                <option value="tour">Tour</option>
                <option value="festival">Festival</option>
                <option value="corporate">Corporate</option>
              </Select>
            </Stack>
            <Stack gap={2}>
              <Body size="sm" className="font-weight-medium">Budget</Body>
              <Input id="budget" type="number" value={formData.budget} onChange={(e) => handleChange("budget", e.target.value)} placeholder="Enter budget" className={errors.budget ? "border-error" : ""} />
              {errors.budget && <Body size="sm" className="text-error">{errors.budget}</Body>}
            </Stack>
          </Grid>
          <Stack gap={2}>
            <Body size="sm" className="font-weight-medium">Description</Body>
            <Textarea id="description" value={formData.description} onChange={(e) => handleChange("description", e.target.value)} placeholder="Enter project description..." rows={4} />
          </Stack>
        </Stack>
      ),
    },
    {
      id: "schedule",
      title: "Schedule",
      icon: <Calendar className="size-5" />,
      content: (
        <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2">
          <Stack gap={2}>
            <Body size="sm" className="font-weight-medium">Start Date *</Body>
            <Input id="start_date" type="date" value={formData.start_date} onChange={(e) => handleChange("start_date", e.target.value)} className={errors.start_date ? "border-error" : ""} />
            {errors.start_date && <Body size="sm" className="text-error">{errors.start_date}</Body>}
          </Stack>
          <Stack gap={2}>
            <Body size="sm" className="font-weight-medium">End Date</Body>
            <Input id="end_date" type="date" value={formData.end_date} onChange={(e) => handleChange("end_date", e.target.value)} className={errors.end_date ? "border-error" : ""} />
            {errors.end_date && <Body size="sm" className="text-error">{errors.end_date}</Body>}
          </Stack>
        </Grid>
      ),
    },
    {
      id: "venue",
      title: "Venue Information",
      icon: <MapPin className="size-5" />,
      content: (
        <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2">
          <Stack gap={2}>
            <Body size="sm" className="font-weight-medium">Venue</Body>
            <Input id="venue" value={formData.venue} onChange={(e) => handleChange("venue", e.target.value)} placeholder="Select or enter venue" />
          </Stack>
          <Stack gap={2}>
            <Body size="sm" className="font-weight-medium">Expected Capacity</Body>
            <Input id="capacity" type="number" value={formData.capacity} onChange={(e) => handleChange("capacity", e.target.value)} placeholder="Enter expected attendance" />
          </Stack>
        </Grid>
      ),
    },
  ], [formData, errors, handleChange]);

  return (
    <CreatePage
      title="New Project"
      subtitle="Create a new production project"
      breadcrumbs={[{ label: "Projects", href: "/projects" }, { label: "New Project" }]}
      backHref="/projects"
      backLabel="Back to Projects"
      sections={sections}
      onSubmit={handleSubmit}
      submitLabel="Create Project"
      isSubmitting={createMutation.isPending}
      isValid={true}
      accessDenied={!canCreateProject ? {
        title: "Permission Required",
        description: "You do not have permission to create projects. This action requires ATLVS Team Member or higher role.",
        action: { label: "Back to Projects", onClick: () => router.push("/projects") },
      } : undefined}
    />
  );
}
