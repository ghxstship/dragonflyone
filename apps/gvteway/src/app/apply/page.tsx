"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GvtewayAppLayout } from "@/components/app-layout";
import {
  Display,
  H2,
  H3,
  Body,
  Button,
  Input,
  Textarea,
  Stack,
  Grid,
  Card,
  Label,
  Field,
  Select,
  ScrollReveal,
  StaggerChildren,
} from "@ghxstship/ui";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Lock,
  Clock,
  Sparkles,
} from "lucide-react";
import NextLink from "next/link";

// =============================================================================
// MEMBERSHIP APPLICATION PAGE
// Multi-step application form for exclusive membership
// =============================================================================

const membershipTiers = [
  {
    id: "member",
    name: "MEMBER",
    price: "$29",
    period: "/mo",
    description: "Your gateway to extraordinary experiences",
    features: [
      "Priority access to all experiences",
      "Member-only pricing",
      "48-hour early access windows",
      "Community access",
    ],
  },
  {
    id: "plus",
    name: "PLUS",
    price: "$79",
    period: "/mo",
    description: "Enhanced access with premium perks",
    features: [
      "Everything in Member",
      "VIP upgrades when available",
      "Personal concierge service",
      "Exclusive member events",
      "Priority support",
    ],
  },
  {
    id: "extra",
    name: "EXTRA",
    price: "$199",
    period: "/mo",
    description: "The ultimate experience membership",
    features: [
      "Everything in Plus",
      "Backstage passes",
      "Curated adventure trips",
      "Artist meet & greets",
      "Dedicated account manager",
      "Complimentary +1 on select experiences",
    ],
    popular: true,
  },
];

const experienceInterests = [
  "Concerts & Festivals",
  "Adventure Travel",
  "Nightlife & Clubs",
  "Art & Culture",
  "Culinary Experiences",
  "Wellness Retreats",
  "Sporting Events",
  "Private Parties",
];

export default function ApplyPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1: Personal Info
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    country: "",
    // Step 2: Interests
    interests: [] as string[],
    experienceFrequency: "",
    referralSource: "",
    // Step 3: Tier Selection
    selectedTier: "member",
    // Step 4: About You
    bio: "",
    instagram: "",
    linkedin: "",
  });

  const totalSteps = 4;

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleInterestToggle = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/membership/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        router.push("/apply/confirmation");
      }
    } catch (error) {
      console.error("Application submission failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.firstName && formData.lastName && formData.email;
      case 2:
        return formData.interests.length > 0;
      case 3:
        return formData.selectedTier;
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <GvtewayAppLayout variant="membership">
          <Stack gap={12} className="mx-auto max-w-2xl">
            {/* Header */}
            <ScrollReveal animation="fade">
              <Stack gap={4} className="text-center">
                <Display size="md" className="text-white">
                  REQUEST MEMBERSHIP
                </Display>
                <Body className="text-on-dark-muted">
                  Join 847 members worldwide who experience more.
                </Body>
              </Stack>
            </ScrollReveal>

            {/* Progress Indicator */}
            <Stack gap={4}>
              <Stack direction="horizontal" gap={2} className="justify-center">
                {[1, 2, 3, 4].map((s) => (
                  <div
                    key={s}
                    className={`h-1 w-16 transition-colors ${
                      s <= step ? "bg-warning" : "bg-ink-800"
                    }`}
                  />
                ))}
              </Stack>
              <Label size="xs" className="text-center text-on-dark-disabled">
                STEP {step} OF {totalSteps}
              </Label>
            </Stack>

            {/* Form Card */}
            <Card inverted className="border-2 border-ink-800 bg-ink-950 p-8">
              {/* Step 1: Personal Information */}
              {step === 1 && (
                <ScrollReveal animation="slide-up">
                  <Stack gap={8}>
                    <Stack gap={2}>
                      <H2 className="text-white">Personal Information</H2>
                      <Body size="sm" className="text-on-dark-muted">
                        Tell us about yourself
                      </Body>
                    </Stack>

                    <Grid cols={2} gap={4}>
                      <Field label="First Name" inverted required>
                        <Input
                          value={formData.firstName}
                          onChange={(e) => handleInputChange("firstName", e.target.value)}
                          placeholder="Your first name"
                          inverted
                        />
                      </Field>
                      <Field label="Last Name" inverted required>
                        <Input
                          value={formData.lastName}
                          onChange={(e) => handleInputChange("lastName", e.target.value)}
                          placeholder="Your last name"
                          inverted
                        />
                      </Field>
                    </Grid>

                    <Field label="Email Address" inverted required>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="your@email.com"
                        inverted
                      />
                    </Field>

                    <Field label="Phone Number" inverted>
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        inverted
                      />
                    </Field>

                    <Grid cols={2} gap={4}>
                      <Field label="City" inverted>
                        <Input
                          value={formData.city}
                          onChange={(e) => handleInputChange("city", e.target.value)}
                          placeholder="Your city"
                          inverted
                        />
                      </Field>
                      <Field label="Country" inverted>
                        <Input
                          value={formData.country}
                          onChange={(e) => handleInputChange("country", e.target.value)}
                          placeholder="Your country"
                          inverted
                        />
                      </Field>
                    </Grid>
                  </Stack>
                </ScrollReveal>
              )}

              {/* Step 2: Interests */}
              {step === 2 && (
                <ScrollReveal animation="slide-up">
                  <Stack gap={8}>
                    <Stack gap={2}>
                      <H2 className="text-white">Your Interests</H2>
                      <Body size="sm" className="text-on-dark-muted">
                        Select the experiences that excite you most
                      </Body>
                    </Stack>

                    <Grid cols={2} gap={3}>
                      {experienceInterests.map((interest) => (
                        <Button
                          key={interest}
                          variant={formData.interests.includes(interest) ? "solid" : "outline"}
                          onClick={() => handleInterestToggle(interest)}
                          className={`justify-start ${
                            formData.interests.includes(interest)
                              ? "border-warning bg-warning text-black"
                              : "border-ink-700 text-on-dark-secondary hover:border-white"
                          }`}
                        >
                          {formData.interests.includes(interest) && (
                            <Check className="mr-2 size-4" />
                          )}
                          {interest}
                        </Button>
                      ))}
                    </Grid>

                    <Field label="How often do you attend live experiences?" inverted>
                      <Select
                        value={formData.experienceFrequency}
                        onChange={(e) => handleInputChange("experienceFrequency", e.target.value)}
                        inverted
                      >
                        <option value="">Select frequency</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">A few times per year</option>
                        <option value="rarely">Rarely, but want to do more</option>
                      </Select>
                    </Field>

                    <Field label="How did you hear about GVTEWAY?" inverted>
                      <Select
                        value={formData.referralSource}
                        onChange={(e) => handleInputChange("referralSource", e.target.value)}
                        inverted
                      >
                        <option value="">Select source</option>
                        <option value="friend">Friend or colleague</option>
                        <option value="social">Social media</option>
                        <option value="event">At an event</option>
                        <option value="search">Online search</option>
                        <option value="press">Press or media</option>
                        <option value="other">Other</option>
                      </Select>
                    </Field>
                  </Stack>
                </ScrollReveal>
              )}

              {/* Step 3: Tier Selection */}
              {step === 3 && (
                <ScrollReveal animation="slide-up">
                  <Stack gap={8}>
                    <Stack gap={2}>
                      <H2 className="text-white">Choose Your Tier</H2>
                      <Body size="sm" className="text-on-dark-muted">
                        Select the membership level that fits your lifestyle
                      </Body>
                    </Stack>

                    <Stack gap={4}>
                      {membershipTiers.map((tier) => (
                        <Card
                          key={tier.id}
                          inverted
                          interactive
                          onClick={() => handleInputChange("selectedTier", tier.id)}
                          className={`cursor-pointer border-2 p-6 transition-all ${
                            formData.selectedTier === tier.id
                              ? "border-warning shadow-accent"
                              : "border-ink-800 hover:border-ink-600"
                          }`}
                        >
                          <Stack gap={4} direction="horizontal" className="items-start justify-between">
                            <Stack gap={3}>
                              <Stack gap={1}>
                                <Stack direction="horizontal" gap={2} className="items-center">
                                  <H3 className="text-white">{tier.name}</H3>
                                  {tier.popular && (
                                    <Label size="xs" className="bg-warning px-2 py-0.5 text-black">
                                      POPULAR
                                    </Label>
                                  )}
                                </Stack>
                                <Body size="sm" className="text-on-dark-muted">
                                  {tier.description}
                                </Body>
                              </Stack>
                              <Stack gap={2}>
                                {tier.features.slice(0, 3).map((feature) => (
                                  <Stack key={feature} direction="horizontal" gap={2} className="items-center">
                                    <Check className="size-3 text-warning" />
                                    <Label size="xs" className="text-on-dark-secondary">
                                      {feature}
                                    </Label>
                                  </Stack>
                                ))}
                                {tier.features.length > 3 && (
                                  <Label size="xs" className="text-on-dark-disabled">
                                    +{tier.features.length - 3} more benefits
                                  </Label>
                                )}
                              </Stack>
                            </Stack>
                            <Stack className="items-end">
                              <Display size="md" className="text-white">
                                {tier.price}
                              </Display>
                              <Label size="xs" className="text-on-dark-muted">
                                {tier.period}
                              </Label>
                            </Stack>
                          </Stack>
                        </Card>
                      ))}
                    </Stack>
                  </Stack>
                </ScrollReveal>
              )}

              {/* Step 4: About You */}
              {step === 4 && (
                <ScrollReveal animation="slide-up">
                  <Stack gap={8}>
                    <Stack gap={2}>
                      <H2 className="text-white">Tell Us More</H2>
                      <Body size="sm" className="text-on-dark-muted">
                        Help us understand what you&apos;re looking for (optional)
                      </Body>
                    </Stack>

                    <Field label="About You" inverted>
                      <Textarea
                        value={formData.bio}
                        onChange={(e) => handleInputChange("bio", e.target.value)}
                        placeholder="Tell us about yourself, your passions, and what kind of experiences you're seeking..."
                        rows={4}
                        inverted
                      />
                    </Field>

                    <Grid cols={2} gap={4}>
                      <Field label="Instagram Handle" inverted>
                        <Input
                          value={formData.instagram}
                          onChange={(e) => handleInputChange("instagram", e.target.value)}
                          placeholder="@yourhandle"
                          inverted
                        />
                      </Field>
                      <Field label="LinkedIn Profile" inverted>
                        <Input
                          value={formData.linkedin}
                          onChange={(e) => handleInputChange("linkedin", e.target.value)}
                          placeholder="linkedin.com/in/yourprofile"
                          inverted
                        />
                      </Field>
                    </Grid>

                    {/* Summary */}
                    <Card className="border-2 border-ink-700 bg-ink-900 p-6">
                      <Stack gap={4}>
                        <H3 className="text-white">Application Summary</H3>
                        <Grid cols={2} gap={4}>
                          <Stack gap={1}>
                            <Label size="xs" className="text-on-dark-disabled">Name</Label>
                            <Body size="sm" className="text-white">
                              {formData.firstName} {formData.lastName}
                            </Body>
                          </Stack>
                          <Stack gap={1}>
                            <Label size="xs" className="text-on-dark-disabled">Email</Label>
                            <Body size="sm" className="text-white">{formData.email}</Body>
                          </Stack>
                          <Stack gap={1}>
                            <Label size="xs" className="text-on-dark-disabled">Selected Tier</Label>
                            <Body size="sm" className="text-warning">
                              {membershipTiers.find((t) => t.id === formData.selectedTier)?.name}
                            </Body>
                          </Stack>
                          <Stack gap={1}>
                            <Label size="xs" className="text-on-dark-disabled">Interests</Label>
                            <Body size="sm" className="text-white">
                              {formData.interests.length} selected
                            </Body>
                          </Stack>
                        </Grid>
                      </Stack>
                    </Card>

                    {/* Trust Signals */}
                    <Stack gap={3}>
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <Lock className="size-4 text-on-dark-disabled" />
                        <Label size="xs" className="text-on-dark-disabled">
                          Your information is secure and never shared
                        </Label>
                      </Stack>
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <Clock className="size-4 text-on-dark-disabled" />
                        <Label size="xs" className="text-on-dark-disabled">
                          Applications reviewed within 24-48 hours
                        </Label>
                      </Stack>
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <Sparkles className="size-4 text-on-dark-disabled" />
                        <Label size="xs" className="text-on-dark-disabled">
                          No payment required until approved
                        </Label>
                      </Stack>
                    </Stack>
                  </Stack>
                </ScrollReveal>
              )}

              {/* Navigation Buttons */}
              <Stack direction="horizontal" gap={4} className="mt-8 justify-between">
                {step > 1 ? (
                  <Button
                    variant="outline"
                    onClick={() => setStep(step - 1)}
                    icon={<ArrowLeft className="size-4" />}
                    iconPosition="left"
                    className="border-ink-700 text-on-dark-secondary hover:border-white hover:text-white"
                  >
                    Back
                  </Button>
                ) : (
                  <NextLink href="/">
                    <Button
                      variant="outline"
                      icon={<ArrowLeft className="size-4" />}
                      iconPosition="left"
                      className="border-ink-700 text-on-dark-secondary hover:border-white hover:text-white"
                    >
                      Cancel
                    </Button>
                  </NextLink>
                )}

                {step < totalSteps ? (
                  <Button
                    variant="solid"
                    onClick={() => setStep(step + 1)}
                    disabled={!canProceed()}
                    icon={<ArrowRight className="size-4" />}
                    iconPosition="right"
                    className="bg-warning text-black hover:bg-warning/90 disabled:opacity-50"
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    variant="solid"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    icon={<ArrowRight className="size-4" />}
                    iconPosition="right"
                    className="bg-warning text-black hover:bg-warning/90"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                  </Button>
                )}
              </Stack>
            </Card>
          </Stack>
    </GvtewayAppLayout>
  );
}
