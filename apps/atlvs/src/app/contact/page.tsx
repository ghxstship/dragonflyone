"use client";

/**
 * Contact Page
 * Contact form and company information
 * Uses DetailPage template for consistent layout
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Phone, MapPin, MessageSquare, Send, Clock, List, Building2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import {
  Body,
  Button,
  Card,
  Grid,
  Input,
  Select,
  Textarea,
  Form,
  DetailPage,
  Section,
  SectionHeader,
  useNotifications,
} from "@ghxstship/ui";

const CONTACT_REASONS = ["General Inquiry", "Sales", "Support", "Partnership", "Press", "Other"];

const OFFICES = [
  { city: "New York", address: "123 Broadway, Suite 500", phone: "+1 (212) 555-0100" },
  { city: "San Francisco", address: "456 Market St, Floor 10", phone: "+1 (415) 555-0200" },
  { city: "London", address: "789 Oxford St, Unit 3", phone: "+44 20 7123 4567" },
];

export default function ContactPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    reason: "General Inquiry",
    message: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const submitMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to send message");
      return response.json();
    },
    onSuccess: () => {
      addNotification({ type: "success", title: "Message Sent", message: "We'll get back to you within 24 hours" });
      setFormData({ name: "", email: "", company: "", reason: "General Inquiry", message: "" });
    },
    onError: () => {
      addNotification({ type: "error", title: "Error", message: "Failed to send message. Please try again." });
    },
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email format";
    if (!formData.message.trim()) newErrors.message = "Message is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) submitMutation.mutate(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const tabs = [
    {
      id: "contact",
      label: "Contact Us",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <Grid cols={2} gap={8} className="grid-cols-1 lg:grid-cols-2">
            <Card className="p-6">
              <SectionHeader title="Send us a message" description="Fill out the form and we'll get back to you" />
              <Form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div>
                  <Body size="sm" className="text-grey-400 mb-1">Name *</Body>
                  <Input placeholder="Your name" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} className={errors.name ? "border-error" : ""} />
                  {errors.name && <Body size="sm" className="text-error mt-1">{errors.name}</Body>}
                </div>
                <div>
                  <Body size="sm" className="text-grey-400 mb-1">Email *</Body>
                  <Input type="email" placeholder="you@company.com" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} className={errors.email ? "border-error" : ""} />
                  {errors.email && <Body size="sm" className="text-error mt-1">{errors.email}</Body>}
                </div>
                <div>
                  <Body size="sm" className="text-grey-400 mb-1">Company</Body>
                  <Input placeholder="Your company" value={formData.company} onChange={(e) => handleChange("company", e.target.value)} />
                </div>
                <div>
                  <Body size="sm" className="text-grey-400 mb-1">Reason for Contact</Body>
                  <Select value={formData.reason} onChange={(e) => handleChange("reason", e.target.value)}>
                    {CONTACT_REASONS.map((reason) => <option key={reason} value={reason}>{reason}</option>)}
                  </Select>
                </div>
                <div>
                  <Body size="sm" className="text-grey-400 mb-1">Message *</Body>
                  <Textarea placeholder="How can we help?" rows={5} value={formData.message} onChange={(e) => handleChange("message", e.target.value)} className={errors.message ? "border-error" : ""} />
                  {errors.message && <Body size="sm" className="text-error mt-1">{errors.message}</Body>}
                </div>
                <Button type="submit" variant="solid" disabled={submitMutation.isPending} icon={<Send className="size-4" />} iconPosition="left" className="w-full">
                  {submitMutation.isPending ? "Sending..." : "Send Message"}
                </Button>
              </Form>
            </Card>

            <div className="space-y-6">
              <Card className="p-6">
                <SectionHeader title="Get in touch" />
                <div className="space-y-4 mt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/20 rounded-card"><Mail className="size-5 text-primary" /></div>
                    <div>
                      <Body size="sm" className="text-grey-400">Email</Body>
                      <Body className="font-weight-medium">hello@atlvs.com</Body>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/20 rounded-card"><Phone className="size-5 text-primary" /></div>
                    <div>
                      <Body size="sm" className="text-grey-400">Phone</Body>
                      <Body className="font-weight-medium">+1 (800) 555-ATLVS</Body>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/20 rounded-card"><Clock className="size-5 text-primary" /></div>
                    <div>
                      <Body size="sm" className="text-grey-400">Hours</Body>
                      <Body className="font-weight-medium">Mon-Fri, 9am-6pm EST</Body>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <SectionHeader title="Quick Links" />
                <div className="space-y-2 mt-4">
                  <Button variant="ghost" className="w-full justify-start" onClick={() => router.push("/help")}>Help Center</Button>
                  <Button variant="ghost" className="w-full justify-start" onClick={() => router.push("/demo")}>Request a Demo</Button>
                  <Button variant="ghost" className="w-full justify-start" onClick={() => router.push("/careers")}>Careers</Button>
                </div>
              </Card>
            </div>
          </Grid>
        </Section>
      ),
    },
    {
      id: "offices",
      label: "Our Offices",
      icon: <Building2 className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Global Offices" description="Visit us at one of our locations" />
          <Grid cols={3} gap={6} className="grid-cols-1 md:grid-cols-3 mt-6">
            {OFFICES.map((office, index) => (
              <Card key={index} className="p-6">
                <Body className="font-weight-bold font-weight-medium mb-4">{office.city}</Body>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="size-4 text-grey-400 mt-1" />
                    <Body size="sm" className="text-grey-400">{office.address}</Body>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="size-4 text-grey-400" />
                    <Body size="sm" className="text-grey-400">{office.phone}</Body>
                  </div>
                </div>
              </Card>
            ))}
          </Grid>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{
        kicker: "Get in Touch",
        title: "Contact Us",
        description: "We'd love to hear from you. Send us a message and we'll respond as soon as possible.",
      }}
      tabs={tabs}
    />
  );
}
