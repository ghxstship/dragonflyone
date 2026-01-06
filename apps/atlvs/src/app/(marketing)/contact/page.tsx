"use client";

/**
 * Contact Page - 2026 Landing Page Best Practices
 * Full-width marketing layout with hero, contact form, and FAQ
 * Bold Contemporary Pop Art Adventure Design System
 * 
 * Features:
 * - Proper InputGroup/SelectGroup/TextareaGroup components with ARIA
 * - Card variants with pop-art shadows and hover effects
 * - Interactive quick links with icons and descriptions
 * - Consolidated contact info (removed redundant offices section)
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Phone, Send, Clock, HelpCircle, Calendar, Briefcase, Activity, MapPin, ArrowRight } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import {
  MarketingPage,
  HeroSection,
  FAQSection,
  Container,
  Stack,
  Grid,
  Card,
  CardHeader,
  CardBody,
  Body,
  H2,
  H3,
  Button,
  InputGroup,
  SelectGroup,
  TextareaGroup,
  Form,
  useToast,
  Box,
  Kicker,
  Link,
  type FAQItem,
} from "@ghxstship/ui";

const CONTACT_REASONS = [
  { value: "general", label: "General Inquiry" },
  { value: "sales", label: "Sales" },
  { value: "support", label: "Support" },
  { value: "partnership", label: "Partnership" },
  { value: "press", label: "Press" },
  { value: "other", label: "Other" },
];

const QUICK_LINKS = [
  {
    id: "help",
    title: "Help Center",
    description: "Browse our knowledge base and tutorials",
    icon: HelpCircle,
    href: "/help",
  },
  {
    id: "demo",
    title: "Request a Demo",
    description: "See ATLVS in action with a personalized walkthrough",
    icon: Calendar,
    href: "/demo",
  },
  {
    id: "careers",
    title: "Careers",
    description: "Join our team and shape the future of events",
    icon: Briefcase,
    href: "/careers",
  },
  {
    id: "status",
    title: "System Status",
    description: "Check our platform uptime and performance",
    icon: Activity,
    href: "/status",
  },
];

const FAQS: FAQItem[] = [
  {
    id: "response-time",
    question: "How quickly will I get a response?",
    answer:
      "We typically respond to all inquiries within 24 hours during business days. For urgent matters, please call our support line.",
  },
  {
    id: "demo",
    question: "Can I schedule a demo?",
    answer:
      "Absolutely! You can schedule a personalized demo directly from our demo page, or mention it in your message and we'll set one up for you.",
  },
  {
    id: "support",
    question: "How do I get technical support?",
    answer:
      "Existing customers can access support through the Help Center in their dashboard. For general support inquiries, use this contact form.",
  },
  {
    id: "partnership",
    question: "How can I become a partner?",
    answer:
      "We're always looking for great partners! Select 'Partnership' as your reason for contact and tell us about your organization.",
  },
];

export default function ContactPage() {
  const router = useRouter();
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    reason: "general",
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
      toast.success("Message Sent", "We'll get back to you within 24 hours");
      setFormData({ name: "", email: "", company: "", reason: "general", message: "" });
      setErrors({});
    },
    onError: () => {
      toast.error("Error", "Failed to send message. Please try again.");
    },
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Please enter a valid email address";
    if (!formData.message.trim()) newErrors.message = "Message is required";
    else if (formData.message.trim().length < 10)
      newErrors.message = "Message must be at least 10 characters";
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
              title="Let's Start a Conversation"
              description="Questions, feedback, or partnership inquiries - we're here to help you succeed."
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
            <Container size="2xl" className="py-16 md:py-24">
              <Grid cols={2} gap={8} className="grid-cols-1 lg:grid-cols-5">
                {/* Contact Form - Takes 3 columns */}
                <Card variant="elevated" className="lg:col-span-3">
                  <CardHeader>
                    <Stack gap={2}>
                      <H2 className="text-text-primary">Send us a message</H2>
                      <Body className="text-text-muted">
                        Fill out the form below and we will get back to you within 24 hours
                      </Body>
                    </Stack>
                  </CardHeader>
                  <CardBody>
                    <Form onSubmit={handleSubmit}>
                      <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2">
                        <InputGroup
                          label="Name"
                          required
                          placeholder="Your full name"
                          value={formData.name}
                          onChange={(e) => handleChange("name", e.target.value)}
                          errorMessage={errors.name}
                          inverted
                          fullWidth
                        />
                        <InputGroup
                          label="Email"
                          required
                          type="email"
                          placeholder="you@company.com"
                          value={formData.email}
                          onChange={(e) => handleChange("email", e.target.value)}
                          errorMessage={errors.email}
                          inverted
                          fullWidth
                        />
                      </Grid>

                      <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2">
                        <InputGroup
                          label="Company"
                          placeholder="Your company (optional)"
                          value={formData.company}
                          onChange={(e) => handleChange("company", e.target.value)}
                          inverted
                          fullWidth
                        />
                        <SelectGroup
                          label="Reason for Contact"
                          value={formData.reason}
                          onChange={(e) => handleChange("reason", e.target.value)}
                          inverted
                          fullWidth
                        >
                          {CONTACT_REASONS.map((reason) => (
                            <option key={reason.value} value={reason.value}>
                              {reason.label}
                            </option>
                          ))}
                        </SelectGroup>
                      </Grid>

                      <TextareaGroup
                        label="Message"
                        required
                        placeholder="Tell us how we can help you..."
                        rows={5}
                        value={formData.message}
                        onChange={(e) => handleChange("message", e.target.value)}
                        errorMessage={errors.message}
                        hint="Be as detailed as possible so we can assist you better"
                        inverted
                        fullWidth
                      />

                      <Button
                        type="submit"
                        variant="solid"
                        size="lg"
                        disabled={submitMutation.isPending}
                        icon={<Send className="size-4" />}
                        iconPosition="left"
                        className="w-full md:w-auto"
                      >
                        {submitMutation.isPending ? "Sending..." : "Send Message"}
                      </Button>
                    </Form>
                  </CardBody>
                </Card>

                {/* Contact Info - Takes 2 columns */}
                <Stack gap={6} className="lg:col-span-2">
                  {/* Contact Information Card */}
                  <Card variant="primary" interactive>
                    <Stack gap={6}>
                      <H3 className="text-text-primary">Contact Information</H3>
                      <Stack gap={5}>
                        {/* Email */}
                        <Link
                          href="mailto:hello@atlvs.com"
                          className="group flex items-center gap-4 no-underline"
                        >
                          <Box className="p-3 bg-primary/20 rounded-card border-2 border-primary/30 group-hover:bg-primary/30 transition-colors">
                            <Mail className="size-5 text-primary" />
                          </Box>
                          <Stack gap={0}>
                            <Body size="sm" className="text-text-disabled">
                              Email
                            </Body>
                            <Body className="text-text-primary font-weight-semibold group-hover:text-primary transition-colors">
                              hello@atlvs.com
                            </Body>
                          </Stack>
                        </Link>

                        {/* Phone */}
                        <Link
                          href="tel:+18005552858"
                          className="group flex items-center gap-4 no-underline"
                        >
                          <Box className="p-3 bg-primary/20 rounded-card border-2 border-primary/30 group-hover:bg-primary/30 transition-colors">
                            <Phone className="size-5 text-primary" />
                          </Box>
                          <Stack gap={0}>
                            <Body size="sm" className="text-text-disabled">
                              Phone
                            </Body>
                            <Body className="text-text-primary font-weight-semibold group-hover:text-primary transition-colors">
                              +1 (800) 555-ATLVS
                            </Body>
                          </Stack>
                        </Link>

                        {/* Hours */}
                        <Stack direction="horizontal" gap={4} className="items-center">
                          <Box className="p-3 bg-primary/20 rounded-card border-2 border-primary/30">
                            <Clock className="size-5 text-primary" />
                          </Box>
                          <Stack gap={0}>
                            <Body size="sm" className="text-text-disabled">
                              Business Hours
                            </Body>
                            <Body className="text-text-primary font-weight-semibold">Mon-Fri, 9am-6pm EST</Body>
                          </Stack>
                        </Stack>

                        {/* Location */}
                        <Stack direction="horizontal" gap={4} className="items-center">
                          <Box className="p-3 bg-primary/20 rounded-card border-2 border-primary/30">
                            <MapPin className="size-5 text-primary" />
                          </Box>
                          <Stack gap={0}>
                            <Body size="sm" className="text-text-disabled">
                              Headquarters
                            </Body>
                            <Body className="text-text-primary font-weight-semibold">Tampa, FL</Body>
                          </Stack>
                        </Stack>
                      </Stack>
                    </Stack>
                  </Card>

                  {/* Response Time Badge */}
                  <Card variant="accent" className="text-center">
                    <Stack gap={2} className="items-center">
                      <Kicker className="text-accent">Average Response Time</Kicker>
                      <H3 className="text-text-primary">Under 24 Hours</H3>
                      <Body size="sm" className="text-text-muted">
                        During business days
                      </Body>
                    </Stack>
                  </Card>
                </Stack>
              </Grid>
            </Container>
          ),
        },
        {
          id: "quick-links",
          background: "black",
          content: (
            <Container size="2xl" className="py-16 md:py-24">
              <Stack gap={12}>
                <Stack gap={4} className="text-center items-center">
                  <Kicker>Resources</Kicker>
                  <H2 className="text-text-primary">Quick Links</H2>
                  <Body className="text-text-muted max-w-2xl">
                    Find what you need faster with these helpful resources
                  </Body>
                </Stack>

                <Grid cols={4} gap={6} className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                  {QUICK_LINKS.map((link) => {
                    const IconComponent = link.icon;
                    return (
                      <Card
                        key={link.id}
                        variant="primary"
                        interactive
                        onClick={() => router.push(link.href)}
                        className="group cursor-pointer"
                      >
                        <Stack gap={4}>
                          <Box className="p-3 bg-primary/20 rounded-card border-2 border-primary/30 w-fit group-hover:bg-primary/30 group-hover:border-primary/50 transition-all">
                            <IconComponent className="size-6 text-primary" />
                          </Box>
                          <Stack gap={2}>
                            <Stack
                              direction="horizontal"
                              gap={2}
                              className="items-center justify-between"
                            >
                              <Body className="text-text-primary font-weight-semibold">{link.title}</Body>
                              <ArrowRight className="size-4 text-text-disabled group-hover:text-primary group-hover:translate-x-1 transition-all" />
                            </Stack>
                            <Body size="sm" className="text-text-muted">
                              {link.description}
                            </Body>
                          </Stack>
                        </Stack>
                      </Card>
                    );
                  })}
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
