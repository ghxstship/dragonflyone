"use client";

/**
 * Membership Application Page
 * Multi-step form for applying to membership tiers
 */

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Body,
  Button,
  Card,
  Grid,
  Badge,
  Box,
  Stack,
  H2,
  H3,
  Text,
  Input,
  Checkbox,
  Alert,
} from "@ghxstship/ui";
import {
  Crown,
  Check,
  ArrowRight,
  ArrowLeft,
  CreditCard,
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  Loader2,
} from "lucide-react";
import { useMembershipTiersData } from "@/hooks/useMembershipTiers";

interface FormData {
  tier: string;
  billingCycle: "monthly" | "annual";
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  agreeToTerms: boolean;
  agreeToAutoRenew: boolean;
}

const INITIAL_FORM_DATA: FormData = {
  tier: "",
  billingCycle: "monthly",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  agreeToTerms: false,
  agreeToAutoRenew: true,
};

const STEPS = [
  { id: 1, name: "Select Tier", icon: Crown },
  { id: 2, name: "Your Info", icon: User },
  { id: 3, name: "Payment", icon: CreditCard },
  { id: 4, name: "Confirm", icon: Check },
];

const DEFAULT_TIERS = [
  { id: "free", name: "Free", price: 0, billingCycle: "Monthly" as const },
  { id: "silver", name: "Silver", price: 9.99, billingCycle: "Monthly" as const },
  { id: "gold", name: "Gold", price: 24.99, billingCycle: "Monthly" as const },
  { id: "platinum", name: "Platinum", price: 49.99, billingCycle: "Monthly" as const },
];

export default function MembershipApplyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { tiers: apiTiers, isLoading } = useMembershipTiersData();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const tiers = apiTiers.length > 0 ? apiTiers : DEFAULT_TIERS;

  useEffect(() => {
    const tierParam = searchParams.get("tier");
    if (tierParam) {
      setFormData((prev) => ({ ...prev, tier: tierParam }));
    }
  }, [searchParams]);

  const selectedTier = tiers.find((t) => t.id === formData.tier) || {
    id: formData.tier,
    name: formData.tier.charAt(0).toUpperCase() + formData.tier.slice(1),
    price: 0,
    billingCycle: "Monthly" as const,
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1 && !formData.tier) {
      newErrors.tier = "Please select a membership tier";
    }

    if (step === 2) {
      if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
      if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      }
    }

    if (step === 3 && !formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/membership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier_id: formData.tier,
          auto_renew: formData.agreeToAutoRenew,
          billing_cycle: formData.billingCycle,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create membership");
      }

      router.push("/membership/dashboard?welcome=true");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Stack gap={6}>
            <Box className="text-center">
              <H2 className="text-h2-desktop font-weight-bold mb-2">Select Your Tier</H2>
              <Body className="text-text-muted">
                Choose the membership level that best fits your needs
              </Body>
            </Box>

            {isLoading ? (
              <Box className="flex justify-center py-12">
                <Loader2 className="size-8 animate-spin text-primary" />
              </Box>
            ) : (
              <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2" data-testid="tier-select">
                {tiers.map((tier) => (
                  <Card
                    key={tier.id}
                    className={`p-6 cursor-pointer transition-all ${
                      formData.tier === tier.id
                        ? "border-2 border-primary shadow-primary"
                        : "border-2 border-border-primary hover:border-primary/50"
                    }`}
                    onClick={() => updateFormData("tier", tier.id)}
                  >
                    <Stack gap={3}>
                      <Box className="flex items-center justify-between">
                        <H3 className="text-h4-desktop font-weight-bold">{tier.name}</H3>
                        {formData.tier === tier.id && (
                          <Check className="size-5 text-primary" />
                        )}
                      </Box>
                      <Box>
                        <Text className="text-h3-desktop font-weight-bold">
                          ${tier.price.toFixed(2)}
                        </Text>
                        <Text className="text-text-muted">
                          /{tier.billingCycle === "Monthly" ? "month" : "year"}
                        </Text>
                      </Box>
                    </Stack>
                  </Card>
                ))}
              </Grid>
            )}

            {errors.tier && <Alert variant="error">{errors.tier}</Alert>}

            <Box className="mt-4">
              <Body size="sm" className="mb-2 block font-weight-medium">Billing Cycle</Body>
              <Box className="flex gap-4">
                <Button
                  variant={formData.billingCycle === "monthly" ? "solid" : "outline"}
                  onClick={() => updateFormData("billingCycle", "monthly")}
                >
                  Monthly
                </Button>
                <Button
                  variant={formData.billingCycle === "annual" ? "solid" : "outline"}
                  onClick={() => updateFormData("billingCycle", "annual")}
                >
                  Annual (Save 20%)
                </Button>
              </Box>
            </Box>
          </Stack>
        );

      case 2:
        return (
          <Stack gap={6}>
            <Box className="text-center">
              <H2 className="text-h2-desktop font-weight-bold mb-2">Your Information</H2>
              <Body className="text-text-muted">Tell us a bit about yourself</Body>
            </Box>

            <Stack gap={4}>
              <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2">
                <Box>
                  <Body size="sm" className="mb-2 block font-weight-medium">First Name *</Body>
                  <Input
                    id="firstName"
                    name="fullName"
                    value={formData.firstName}
                    onChange={(e) => updateFormData("firstName", e.target.value)}
                    placeholder="John"
                    className={errors.firstName ? "border-error" : ""}
                  />
                  {errors.firstName && (
                    <Body size="sm" className="text-error mt-1">{errors.firstName}</Body>
                  )}
                </Box>

                <Box>
                  <Body size="sm" className="mb-2 block font-weight-medium">Last Name *</Body>
                  <Input
                    id="lastName"
                    name="name"
                    value={formData.lastName}
                    onChange={(e) => updateFormData("lastName", e.target.value)}
                    placeholder="Doe"
                    className={errors.lastName ? "border-error" : ""}
                  />
                  {errors.lastName && (
                    <Body size="sm" className="text-error mt-1">{errors.lastName}</Body>
                  )}
                </Box>
              </Grid>

              <Box>
                <Body size="sm" className="mb-2 block font-weight-medium">Email Address *</Body>
                <Box className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted" />
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={(e) => updateFormData("email", e.target.value)}
                    placeholder="john@example.com"
                    className={`pl-10 ${errors.email ? "border-error" : ""}`}
                  />
                </Box>
                {errors.email && (
                  <Body size="sm" className="text-error mt-1">{errors.email}</Body>
                )}
              </Box>

              <Box>
                <Body size="sm" className="mb-2 block font-weight-medium">Phone Number (Optional)</Body>
                <Box className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted" />
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateFormData("phone", e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="pl-10"
                  />
                </Box>
              </Box>
            </Stack>
          </Stack>
        );

      case 3:
        return (
          <Stack gap={6}>
            <Box className="text-center">
              <H2 className="text-h2-desktop font-weight-bold mb-2">Payment Information</H2>
              <Body className="text-text-muted">Secure payment processing</Body>
            </Box>

            <Card className="p-6" data-testid="payment-info">
              <Stack gap={4}>
                <Box className="flex items-center gap-3 p-4 bg-surface-secondary rounded-card">
                  <Shield className="size-6 text-success" />
                  <Box>
                    <Body className="font-weight-medium">Secure Payment</Body>
                    <Body size="sm" className="text-text-muted">
                      Your payment information is encrypted and secure
                    </Body>
                  </Box>
                </Box>

                <Box className="p-4 border-2 border-dashed border-border-primary rounded-card text-center">
                  <CreditCard className="size-8 text-text-muted mx-auto mb-2" />
                  <Body className="text-text-muted">Payment integration coming soon</Body>
                  <Body size="sm" className="text-text-muted">
                    For demo purposes, continue to complete your application
                  </Body>
                </Box>

                <Stack gap={3}>
                  <Box className="flex items-start gap-3">
                    <Checkbox
                      id="agreeToAutoRenew"
                      checked={formData.agreeToAutoRenew}
                      onChange={(e) => updateFormData("agreeToAutoRenew", e.target.checked)}
                    />
                    <Body size="sm">Enable auto-renewal to keep your membership active</Body>
                  </Box>

                  <Box className="flex items-start gap-3">
                    <Checkbox
                      id="agreeToTerms"
                      name="terms"
                      checked={formData.agreeToTerms}
                      onChange={(e) => updateFormData("agreeToTerms", e.target.checked)}
                    />
                    <Body size="sm">I agree to the Terms of Service and Privacy Policy *</Body>
                  </Box>
                  {errors.agreeToTerms && (
                    <Body size="sm" className="text-error">{errors.agreeToTerms}</Body>
                  )}
                </Stack>
              </Stack>
            </Card>
          </Stack>
        );

      case 4:
        return (
          <Stack gap={6}>
            <Box className="text-center">
              <H2 className="text-h2-desktop font-weight-bold mb-2">Confirm Your Membership</H2>
              <Body className="text-text-muted">Review your details before completing</Body>
            </Box>

            <Card className="p-6">
              <Stack gap={4}>
                <Box className="flex items-center justify-between p-4 bg-surface-secondary rounded-card">
                  <Box>
                    <Body size="sm" className="text-text-muted">Selected Tier</Body>
                    <Body className="font-weight-bold">{selectedTier.name}</Body>
                  </Box>
                  <Badge variant="warning">
                    ${selectedTier.price.toFixed(2)}/{formData.billingCycle}
                  </Badge>
                </Box>

                <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2">
                  <Box>
                    <Body size="sm" className="text-text-muted">Name</Body>
                    <Body>{formData.firstName} {formData.lastName}</Body>
                  </Box>
                  <Box>
                    <Body size="sm" className="text-text-muted">Email</Body>
                    <Body>{formData.email}</Body>
                  </Box>
                  {formData.phone && (
                    <Box>
                      <Body size="sm" className="text-text-muted">Phone</Body>
                      <Body>{formData.phone}</Body>
                    </Box>
                  )}
                  <Box>
                    <Body size="sm" className="text-text-muted">Billing</Body>
                    <Body className="capitalize">{formData.billingCycle}</Body>
                  </Box>
                </Grid>

                <Box className="flex items-center gap-2 text-text-muted">
                  <Calendar className="size-4" />
                  <Body size="sm">Your membership will start immediately</Body>
                </Box>
              </Stack>
            </Card>

            {submitError && <Alert variant="error">{submitError}</Alert>}
          </Stack>
        );

      default:
        return null;
    }
  };

  return (
    <Box className="min-h-screen bg-surface-secondary py-12">
      <Box className="container mx-auto px-4 max-w-3xl">
        {/* Progress Steps */}
        <Box className="mb-8">
          <Box className="flex items-center justify-between">
            {STEPS.map((step, idx) => (
              <Box key={step.id} className="flex items-center">
                <Box
                  className={`flex items-center justify-center size-10 rounded-avatar border-2 ${
                    currentStep >= step.id
                      ? "bg-primary border-primary text-white"
                      : "bg-surface-primary border-border-primary text-text-muted"
                  }`}
                >
                  {currentStep > step.id ? (
                    <Check className="size-5" />
                  ) : (
                    <step.icon className="size-5" />
                  )}
                </Box>
                {idx < STEPS.length - 1 && (
                  <Box
                    className={`w-full h-1 mx-2 min-w-10 ${
                      currentStep > step.id ? "bg-primary" : "bg-border-primary"
                    }`}
                  />
                )}
              </Box>
            ))}
          </Box>
          <Box className="flex justify-between mt-2">
            {STEPS.map((step) => (
              <Body
                key={step.id}
                size="sm"
                className={currentStep >= step.id ? "text-primary" : "text-text-muted"}
              >
                {step.name}
              </Body>
            ))}
          </Box>
        </Box>

        {/* Step Content */}
        <Card className="p-8">
          {renderStepContent()}

          {/* Navigation Buttons */}
          <Box className="flex justify-between mt-8 pt-6 border-t border-border-primary">
            <Button variant="ghost" onClick={handleBack} disabled={currentStep === 1}>
              <ArrowLeft className="size-4 mr-2" />
              Back
            </Button>

            {currentStep < STEPS.length ? (
              <Button variant="solid" onClick={handleNext}>
                Continue
                <ArrowRight className="size-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="submit"
                variant="solid"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Complete Membership
                    <Check className="size-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </Box>
        </Card>
      </Box>
    </Box>
  );
}
