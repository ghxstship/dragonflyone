"use client";

/**
 * Contact Page - 2026 Landing Page Best Practices
 * Full-width marketing layout with hero, contact form, offices, and FAQ
 * Bold Contemporary Pop Art Adventure Design System
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Phone, MapPin, Send, Clock } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import {
  MarketingPage,
  HeroSection,
  FAQSection,
  Container,
  Stack,
  Grid,
  Card,
  Body,
  H3,
  Button,
  Input,
  Select,
  Textarea,
  Form,
  useNotifications,
  type FAQItem,
} from "@ghxstship/ui";

const CONTACT_REASONS = ["General Inquiry", "Sales", "Support", "Partnership", "Press", "Other"];

const OFFICES = [
  { city: "New York", address: "123 Broadway, Suite 500", phone: "+1 (212) 555-0100", timezone: "EST" },
  { city: "San Francisco", address: "456 Market St, Floor 10", phone: "+1 (415) 555-0200", timezone: "PST" },
  { city: "London", address: "789 Oxford St, Unit 3", phone: "+44 20 7123 4567", timezone: "GMT" },
];

const FAQS: FAQItem[] = [
  { id: "response-time", question: "How quickly will I get a response?", answer: "We typically respond to all inquiries within 24 hours during business days. For urgent matters, please call our support line." },
  { id: "demo", question: "Can I schedule a demo?", answer: "Absolutely! You can schedule a personalized demo directly from our demo page, or mention it in your message and we'll set one up for you." },
  { id: "support", question: "How do I get technical support?", answer: "Existing customers can access support through the Help Center in their dashboard. For general support inquiries, use this contact form." },
  { id: "partnership", question: "How can I become a partner?", answer: "We're always looking for great partners! Select 'Partnership' as your reason for contact and tell us about your organization." },
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

  return (
    <MarketingPage
      sections={[
        {
          id: "hero",
          background: "gradient",
          pattern: "halftone",
          patternOpacity: 0.05,
          content: (
            <HeroSection
              kicker="Get in Touch"
              title="We'd Love to Hear From You"
              description="Have a question, feedback, or want to learn more? Our team is here to help."
              background="gradient"
              pattern="none"
              fullHeight={false}
              align="center"
            />
          ),
        },
        {
          id: "contact-form",
          background: "ink",
          pattern: "grid",
          patternOpacity: 0.03,
          content: (
            <Container size="xl" className="py-20">
              <Grid cols={2} gap={8} className="grid-cols-1 lg:grid-cols-2">
                {/* Contact Form */}
                <Card className="p-8 border-2 border-grey-800 rounded-card">
                  <Stack gap={6}>
                    <Stack gap={2}>
                      <H3 className="text-white">Send us a message</H3>
                      <Body className="text-grey-400">Fill out the form and we will get back to you within 24 hours</Body>
                    </Stack>

                    <Form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Body size="sm" className="text-grey-400 mb-2">Name *</Body>
                        <Input
                          placeholder="Your name"
                          value={formData.name}
                          onChange={(e) => handleChange("name", e.target.value)}
                          className={errors.name ? "border-error" : ""}
                        />
                        {errors.name && <Body size="sm" className="text-error mt-1">{errors.name}</Body>}
                      </div>

                      <div>
                        <Body size="sm" className="text-grey-400 mb-2">Email *</Body>
                        <Input
                          type="email"
                          placeholder="you@company.com"
                          value={formData.email}
                          onChange={(e) => handleChange("email", e.target.value)}
                          className={errors.email ? "border-error" : ""}
                        />
                        {errors.email && <Body size="sm" className="text-error mt-1">{errors.email}</Body>}
                      </div>

                      <div>
                        <Body size="sm" className="text-grey-400 mb-2">Company</Body>
                        <Input
                          placeholder="Your company"
                          value={formData.company}
                          onChange={(e) => handleChange("company", e.target.value)}
                        />
                      </div>

                      <div>
                        <Body size="sm" className="text-grey-400 mb-2">Reason for Contact</Body>
                        <Select
                          value={formData.reason}
                          onChange={(e) => handleChange("reason", e.target.value)}
                        >
                          {CONTACT_REASONS.map((reason) => (
                            <option key={reason} value={reason}>{reason}</option>
                          ))}
                        </Select>
                      </div>

                      <div>
                        <Body size="sm" className="text-grey-400 mb-2">Message *</Body>
                        <Textarea
                          placeholder="How can we help?"
                          rows={5}
                          value={formData.message}
                          onChange={(e) => handleChange("message", e.target.value)}
                          className={errors.message ? "border-error" : ""}
                        />
                        {errors.message && <Body size="sm" className="text-error mt-1">{errors.message}</Body>}
                      </div>

                      <Button
                        type="submit"
                        variant="solid"
                        disabled={submitMutation.isPending}
                        icon={<Send className="size-4" />}
                        iconPosition="left"
                        className="w-full"
                      >
                        {submitMutation.isPending ? "Sending..." : "Send Message"}
                      </Button>
                    </Form>
                  </Stack>
                </Card>

                {/* Contact Info & Quick Links */}
                <Stack gap={6}>
                  <Card className="p-8 border-2 border-grey-800 rounded-card">
                    <Stack gap={6}>
                      <H3 className="text-white">Contact Information</H3>
                      <Stack gap={4}>
                        <Stack direction="horizontal" gap={4} className="items-center">
                          <div className="p-3 bg-primary/20 rounded-card">
                            <Mail className="size-5 text-primary" />
                          </div>
                          <Stack gap={0}>
                            <Body size="sm" className="text-grey-500">Email</Body>
                            <Body className="text-white font-weight-semibold">hello@atlvs.com</Body>
                          </Stack>
                        </Stack>

                        <Stack direction="horizontal" gap={4} className="items-center">
                          <div className="p-3 bg-primary/20 rounded-card">
                            <Phone className="size-5 text-primary" />
                          </div>
                          <Stack gap={0}>
                            <Body size="sm" className="text-grey-500">Phone</Body>
                            <Body className="text-white font-weight-semibold">+1 (800) 555-ATLVS</Body>
                          </Stack>
                        </Stack>

                        <Stack direction="horizontal" gap={4} className="items-center">
                          <div className="p-3 bg-primary/20 rounded-card">
                            <Clock className="size-5 text-primary" />
                          </div>
                          <Stack gap={0}>
                            <Body size="sm" className="text-grey-500">Hours</Body>
                            <Body className="text-white font-weight-semibold">Mon-Fri, 9am-6pm EST</Body>
                          </Stack>
                        </Stack>
                      </Stack>
                    </Stack>
                  </Card>

                  <Card className="p-8 border-2 border-grey-800 rounded-card">
                    <Stack gap={4}>
                      <H3 className="text-white">Quick Links</H3>
                      <Stack gap={2}>
                        <Button variant="ghost" className="w-full justify-start" onClick={() => router.push("/help")}>
                          Help Center
                        </Button>
                        <Button variant="ghost" className="w-full justify-start" onClick={() => router.push("/demo")}>
                          Request a Demo
                        </Button>
                        <Button variant="ghost" className="w-full justify-start" onClick={() => router.push("/careers")}>
                          Careers
                        </Button>
                        <Button variant="ghost" className="w-full justify-start" onClick={() => router.push("/status")}>
                          System Status
                        </Button>
                      </Stack>
                    </Stack>
                  </Card>
                </Stack>
              </Grid>
            </Container>
          ),
        },
        {
          id: "offices",
          background: "black",
          content: (
            <Container size="xl" className="py-20">
              <Stack gap={12}>
                <Stack gap={4} className="text-center items-center">
                  <Body className="text-primary uppercase tracking-kicker font-weight-semibold">Global Presence</Body>
                  <H3 className="text-white">Our Offices</H3>
                  <Body className="text-grey-400 max-w-2xl">Visit us at one of our locations around the world</Body>
                </Stack>

                <Grid cols={3} gap={6} className="grid-cols-1 md:grid-cols-3">
                  {OFFICES.map((office, index) => (
                    <Card key={index} className="p-6 border-2 border-grey-800 rounded-card hover:border-primary/50 transition-colors">
                      <Stack gap={4}>
                        <Body className="text-white font-weight-semibold">{office.city}</Body>
                        <Stack gap={3}>
                          <Stack direction="horizontal" gap={2} className="items-start">
                            <MapPin className="size-4 text-grey-500 mt-1 flex-shrink-0" />
                            <Body size="sm" className="text-grey-400">{office.address}</Body>
                          </Stack>
                          <Stack direction="horizontal" gap={2} className="items-center">
                            <Phone className="size-4 text-grey-500 flex-shrink-0" />
                            <Body size="sm" className="text-grey-400">{office.phone}</Body>
                          </Stack>
                          <Stack direction="horizontal" gap={2} className="items-center">
                            <Clock className="size-4 text-grey-500 flex-shrink-0" />
                            <Body size="sm" className="text-grey-400">{office.timezone}</Body>
                          </Stack>
                        </Stack>
                      </Stack>
                    </Card>
                  ))}
                </Grid>
              </Stack>
            </Container>
          ),
        },
        {
          id: "faq",
          background: "ink",
          content: (
            <FAQSection
              kicker="FAQ"
              title="Common Questions"
              description="Quick answers to frequently asked questions"
              faqs={FAQS}
              background="ink"
            />
          ),
        },
      ]}
    />
  );
}
