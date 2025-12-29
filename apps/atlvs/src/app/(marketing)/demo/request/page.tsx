"use client";

/**
 * Demo Request Page
 * Schedule a demo form
 * Uses CreatePage template for form submission
 */

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Building2, Users, Mail } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import {
  Body,
  Grid,
  Input,
  Select,
  Stack,
  Textarea,
  CreatePage,
  useNotifications,
  type FormSection,
} from "@ghxstship/ui";

const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-500", "500+"];
const INDUSTRIES = ["Music Festivals", "Corporate Events", "Theater", "Sports", "Experiential Marketing", "Other"];

export default function DemoRequestPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    jobTitle: "",
    companySize: "",
    industry: "",
    message: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  }, [errors]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email format";
    if (!formData.company.trim()) newErrors.company = "Company is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch("/api/demo/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to submit request");
      return response.json();
    },
    onSuccess: () => {
      addNotification({ type: "success", title: "Request Submitted", message: "We'll be in touch within 24 hours to schedule your demo" });
      router.push("/demo");
    },
    onError: () => {
      addNotification({ type: "error", title: "Error", message: "Failed to submit request. Please try again." });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) submitMutation.mutate(formData);
  };

  const sections: FormSection[] = useMemo(() => [
    {
      id: "contact",
      title: "Contact Information",
      icon: <Mail className="size-5" />,
      content: (
        <Stack gap={4}>
          <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2">
            <Stack gap={2}>
              <Body size="sm" className="font-weight-medium">First Name *</Body>
              <Input value={formData.firstName} onChange={(e) => handleChange("firstName", e.target.value)} placeholder="John" className={errors.firstName ? "border-error" : ""} />
              {errors.firstName && <Body size="sm" className="text-error">{errors.firstName}</Body>}
            </Stack>
            <Stack gap={2}>
              <Body size="sm" className="font-weight-medium">Last Name *</Body>
              <Input value={formData.lastName} onChange={(e) => handleChange("lastName", e.target.value)} placeholder="Smith" className={errors.lastName ? "border-error" : ""} />
              {errors.lastName && <Body size="sm" className="text-error">{errors.lastName}</Body>}
            </Stack>
            <Stack gap={2}>
              <Body size="sm" className="font-weight-medium">Work Email *</Body>
              <Input type="email" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} placeholder="john@company.com" className={errors.email ? "border-error" : ""} />
              {errors.email && <Body size="sm" className="text-error">{errors.email}</Body>}
            </Stack>
            <Stack gap={2}>
              <Body size="sm" className="font-weight-medium">Phone Number</Body>
              <Input type="tel" value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} placeholder="+1 (555) 000-0000" />
            </Stack>
          </Grid>
        </Stack>
      ),
    },
    {
      id: "company",
      title: "Company Information",
      icon: <Building2 className="size-5" />,
      content: (
        <Stack gap={4}>
          <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2">
            <Stack gap={2}>
              <Body size="sm" className="font-weight-medium">Company Name *</Body>
              <Input value={formData.company} onChange={(e) => handleChange("company", e.target.value)} placeholder="Acme Inc" className={errors.company ? "border-error" : ""} />
              {errors.company && <Body size="sm" className="text-error">{errors.company}</Body>}
            </Stack>
            <Stack gap={2}>
              <Body size="sm" className="font-weight-medium">Job Title</Body>
              <Input value={formData.jobTitle} onChange={(e) => handleChange("jobTitle", e.target.value)} placeholder="Production Manager" />
            </Stack>
            <Stack gap={2}>
              <Body size="sm" className="font-weight-medium">Company Size</Body>
              <Select value={formData.companySize} onChange={(e) => handleChange("companySize", e.target.value)}>
                <option value="">Select size</option>
                {COMPANY_SIZES.map((size) => <option key={size} value={size}>{size} employees</option>)}
              </Select>
            </Stack>
            <Stack gap={2}>
              <Body size="sm" className="font-weight-medium">Industry</Body>
              <Select value={formData.industry} onChange={(e) => handleChange("industry", e.target.value)}>
                <option value="">Select industry</option>
                {INDUSTRIES.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
              </Select>
            </Stack>
          </Grid>
        </Stack>
      ),
    },
    {
      id: "details",
      title: "Additional Details",
      icon: <Calendar className="size-5" />,
      content: (
        <Stack gap={4}>
          <Stack gap={2}>
            <Body size="sm" className="font-weight-medium">What would you like to learn about?</Body>
            <Textarea value={formData.message} onChange={(e) => handleChange("message", e.target.value)} placeholder="Tell us about your production management needs and what you'd like to see in the demo..." rows={4} />
          </Stack>
        </Stack>
      ),
    },
  ], [formData, errors, handleChange]);

  return (
    <CreatePage
      title="Schedule a Demo"
      subtitle="Fill out the form and we'll be in touch to schedule your personalized demo"
      breadcrumbs={[{ label: "Demo", href: "/demo" }, { label: "Request Demo" }]}
      backHref="/demo"
      backLabel="Back to Demo"
      sections={sections}
      onSubmit={handleSubmit}
      submitLabel="Request Demo"
      isSubmitting={submitMutation.isPending}
      isValid={true}
    />
  );
}
