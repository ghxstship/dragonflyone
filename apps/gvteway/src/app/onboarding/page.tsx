"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@ghxstship/config";
import { Check, User, Heart, Settings, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import {
  Display,
  H2,
  H3,
  Body,
  Button,
  Input,
  Alert,
  Stack,
  Card,
  Field,
  Checkbox,
  Section,
  Container,
  Label,
  Select,
  ScrollReveal,
} from "@ghxstship/ui";
import NextLink from "next/link";

// =============================================================================
// ONBOARDING PAGE - GVTEWAY User Setup Wizard
// Bold Contemporary Pop Art Adventure Design System - Dark Theme
// =============================================================================

type OnboardingStep = "profile" | "interests" | "preferences" | "complete";

const STEPS: { id: OnboardingStep; label: string; description: string; icon: React.ReactNode }[] = [
  { id: "profile", label: "Profile", description: "Tell us about yourself", icon: <User className="size-5" /> },
  { id: "interests", label: "Interests", description: "What events interest you?", icon: <Heart className="size-5" /> },
  { id: "preferences", label: "Preferences", description: "Customize your experience", icon: <Settings className="size-5" /> },
  { id: "complete", label: "Complete", description: "You're all set!", icon: <Sparkles className="size-5" /> },
];

const EVENT_INTERESTS = [
  "Concerts",
  "Festivals",
  "Sports",
  "Theater",
  "Comedy",
  "Conferences",
  "Workshops",
  "Nightlife",
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user: _user } = useAuthContext();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("profile");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    location: "",
  });
  const [interests, setInterests] = useState<string[]>([]);
  const [preferences, setPreferences] = useState({
    theme: "dark",
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
  });

  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep);

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleNext = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("ghxstship_access_token");
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      if (currentStep === "profile") {
        await fetch("/api/onboarding/profile", {
          method: "POST",
          headers,
          body: JSON.stringify(profile),
        });
      } else if (currentStep === "interests") {
        await fetch("/api/onboarding/interests", {
          method: "POST",
          headers,
          body: JSON.stringify({ interests }),
        });
      } else if (currentStep === "preferences") {
        await fetch("/api/onboarding/preferences", {
          method: "POST",
          headers,
          body: JSON.stringify(preferences),
        });
      }
      const nextIndex = currentStepIndex + 1;
      if (nextIndex < STEPS.length) setCurrentStep(STEPS[nextIndex].id);
    } catch (err) {
      setError("Failed to save. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("ghxstship_access_token");
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      await fetch("/api/onboarding/complete", { method: "POST", headers });
      router.push("/");
    } catch (err) {
      setError("Failed to complete onboarding.");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) setCurrentStep(STEPS[nextIndex].id);
  };

  return (
    <Section background="black" className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b-2 border-white/10 bg-black">
        <Container className="flex h-14 items-center justify-between px-4 sm:h-16 sm:px-6">
          <NextLink href="/" className="transition-transform hover:-translate-y-0.5">
            <Display size="md" className="text-white">
              GVTEWAY
            </Display>
          </NextLink>
        </Container>
      </header>

      {/* Main Content */}
      <main className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-8 sm:px-6 sm:py-12 md:py-16">
        {/* Halftone Pattern Background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
          aria-hidden="true"
        />

        <Container className="relative z-10 w-full max-w-xl">
          <ScrollReveal animation="slide-up" duration={600}>
            {/* Onboarding Card - Pop Art Style */}
            <Card
              inverted
              className="border-2 border-white/10 bg-ink-950 p-6 shadow-md sm:p-8"
            >
              <Stack gap={6} className="sm:gap-8">
                {/* Progress Steps - Responsive */}
                <div className="hidden sm:block">
                  <Stack direction="horizontal" className="items-center justify-between">
                    {STEPS.map((step, index) => (
                      <Stack key={step.id} direction="horizontal" className="items-center">
                        <div
                          className={`flex size-10 items-center justify-center border-2 text-sm ${
                            index <= currentStepIndex
                              ? "border-white bg-white text-black"
                              : "border-ink-700 bg-ink-900 text-on-dark-muted"
                          }`}
                        >
                          {index < currentStepIndex ? (
                            <Check className="size-5" />
                          ) : (
                            step.icon
                          )}
                        </div>
                        {index < STEPS.length - 1 && (
                          <div
                            className={`mx-2 h-0.5 w-8 md:w-12 lg:w-16 ${
                              index < currentStepIndex ? "bg-white" : "bg-ink-800"
                            }`}
                          />
                        )}
                      </Stack>
                    ))}
                  </Stack>
                </div>

                {/* Mobile Progress Indicator */}
                <div className="block sm:hidden">
                  <Stack gap={2} className="text-center">
                    <Label size="xs" className="text-on-dark-muted">
                      Step {currentStepIndex + 1} of {STEPS.length}
                    </Label>
                    <div className="flex gap-1">
                      {STEPS.map((_, index) => (
                        <div
                          key={index}
                          className={`h-1 flex-1 ${
                            index <= currentStepIndex ? "bg-white" : "bg-ink-800"
                          }`}
                        />
                      ))}
                    </div>
                  </Stack>
                </div>

                {/* Step Header */}
                <Stack gap={3} className="text-center sm:gap-4">
                  <div className="mx-auto flex size-12 items-center justify-center border-2 border-white/10 bg-ink-900 sm:size-16">
                    {STEPS[currentStepIndex].icon}
                  </div>
                  <H2 className="text-white">{STEPS[currentStepIndex].label.toUpperCase()}</H2>
                  <Body size="sm" className="text-on-dark-muted">
                    {STEPS[currentStepIndex].description}
                  </Body>
                </Stack>

                {/* Error Alert */}
                {error && <Alert variant="error">{error}</Alert>}

                {/* Profile Step */}
                {currentStep === "profile" && (
                  <Stack gap={4} className="sm:gap-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field label="First Name" inverted>
                        <Input
                          type="text"
                          value={profile.firstName}
                          onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                          placeholder="John"
                          inverted
                        />
                      </Field>
                      <Field label="Last Name" inverted>
                        <Input
                          type="text"
                          value={profile.lastName}
                          onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                          placeholder="Doe"
                          inverted
                        />
                      </Field>
                    </div>
                    <Field label="Phone (Optional)" inverted>
                      <Input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        placeholder="+1 (555) 000-0000"
                        inverted
                      />
                    </Field>
                    <Field label="Location (Optional)" inverted>
                      <Input
                        type="text"
                        value={profile.location}
                        onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                        placeholder="City, Country"
                        inverted
                      />
                    </Field>
                  </Stack>
                )}

                {/* Interests Step */}
                {currentStep === "interests" && (
                  <Stack gap={4} className="sm:gap-6">
                    <Body size="sm" className="text-center text-on-dark-muted">
                      Select the types of events you&apos;re interested in:
                    </Body>
                    <div className="grid grid-cols-2 gap-3">
                      {EVENT_INTERESTS.map((interest) => (
                        <Button
                          key={interest}
                          type="button"
                          variant={interests.includes(interest) ? "solid" : "outline"}
                          size="md"
                          onClick={() => toggleInterest(interest)}
                          inverted
                          className={interests.includes(interest) ? "" : "border-ink-700"}
                        >
                          {interest}
                        </Button>
                      ))}
                    </div>
                  </Stack>
                )}

                {/* Preferences Step */}
                {currentStep === "preferences" && (
                  <Stack gap={4} className="sm:gap-6">
                    <Field label="Theme" inverted>
                      <Select
                        value={preferences.theme}
                        onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
                        inverted
                      >
                        <option value="dark">Dark</option>
                        <option value="light">Light</option>
                        <option value="system">System Default</option>
                      </Select>
                    </Field>
                    <Stack gap={4}>
                      <Stack direction="horizontal" gap={3} className="items-center">
                        <Checkbox
                          id="emailNotifications"
                          checked={preferences.emailNotifications}
                          onChange={(e) =>
                            setPreferences({ ...preferences, emailNotifications: e.target.checked })
                          }
                          inverted
                        />
                        <Label size="sm" className="text-on-dark-muted">
                          Email notifications for event updates
                        </Label>
                      </Stack>
                      <Stack direction="horizontal" gap={3} className="items-center">
                        <Checkbox
                          id="pushNotifications"
                          checked={preferences.pushNotifications}
                          onChange={(e) =>
                            setPreferences({ ...preferences, pushNotifications: e.target.checked })
                          }
                          inverted
                        />
                        <Label size="sm" className="text-on-dark-muted">
                          Push notifications for ticket sales
                        </Label>
                      </Stack>
                      <Stack direction="horizontal" gap={3} className="items-center">
                        <Checkbox
                          id="marketingEmails"
                          checked={preferences.marketingEmails}
                          onChange={(e) =>
                            setPreferences({ ...preferences, marketingEmails: e.target.checked })
                          }
                          inverted
                        />
                        <Label size="sm" className="text-on-dark-muted">
                          Receive personalized event recommendations
                        </Label>
                      </Stack>
                    </Stack>
                  </Stack>
                )}

                {/* Complete Step */}
                {currentStep === "complete" && (
                  <Stack gap={6} className="text-center sm:gap-8">
                    <div className="mx-auto flex size-16 items-center justify-center border-2 border-white/10 bg-ink-900 sm:size-20">
                      <Check className="size-8 text-success sm:size-10" />
                    </div>
                    <Stack gap={3} className="sm:gap-4">
                      <H3 className="text-white">Welcome to GVTEWAY!</H3>
                      <Body size="sm" className="text-on-dark-muted">
                        Your account is all set up. Discover amazing events and experiences.
                      </Body>
                    </Stack>
                  </Stack>
                )}

                {/* Navigation */}
                <Stack
                  direction="horizontal"
                  className="flex-col items-stretch gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between"
                >
                  {currentStep !== "complete" && currentStep !== "profile" && (
                    <Button
                      type="button"
                      variant="outline"
                      inverted
                      onClick={() => setCurrentStep(STEPS[currentStepIndex - 1].id)}
                      icon={<ArrowLeft className="size-4" />}
                      iconPosition="left"
                      className="order-2 sm:order-1"
                    >
                      Back
                    </Button>
                  )}
                  {currentStep !== "complete" && currentStep === "profile" && (
                    <div className="hidden sm:block" />
                  )}

                  {currentStep === "complete" ? (
                    <Button
                      type="button"
                      variant="solid"
                      size="lg"
                      fullWidth
                      inverted
                      onClick={handleComplete}
                      disabled={loading}
                      icon={<ArrowRight className="size-4" />}
                      iconPosition="right"
                    >
                      {loading ? "Starting..." : "Explore Events"}
                    </Button>
                  ) : (
                    <Stack
                      direction="horizontal"
                      gap={3}
                      className="order-1 w-full justify-end sm:order-2 sm:w-auto"
                    >
                      {currentStep !== "profile" && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          inverted
                          onClick={handleSkip}
                        >
                          Skip
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="solid"
                        inverted
                        onClick={handleNext}
                        disabled={loading}
                        icon={<ArrowRight className="size-4" />}
                        iconPosition="right"
                        className="flex-1 sm:flex-none"
                      >
                        {loading ? "Saving..." : "Continue"}
                      </Button>
                    </Stack>
                  )}
                </Stack>
              </Stack>
            </Card>
          </ScrollReveal>
        </Container>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-white/10 bg-black py-6">
        <Container className="px-4 text-center sm:px-6">
          <Stack gap={4}>
            <Stack direction="horizontal" gap={4} className="flex-wrap justify-center">
              <NextLink
                href="/legal/privacy"
                className="text-mono-xs uppercase text-on-dark-muted transition-colors hover:text-white"
              >
                Privacy
              </NextLink>
              <NextLink
                href="/legal/terms"
                className="text-mono-xs uppercase text-on-dark-muted transition-colors hover:text-white"
              >
                Terms
              </NextLink>
              <NextLink
                href="/help"
                className="text-mono-xs uppercase text-on-dark-muted transition-colors hover:text-white"
              >
                Help
              </NextLink>
            </Stack>
            <Label size="xxs" className="text-on-dark-muted">
              © {new Date().getFullYear()} GHXSTSHIP INDUSTRIES
            </Label>
          </Stack>
        </Container>
      </footer>
    </Section>
  );
}
