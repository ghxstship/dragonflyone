"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@ghxstship/config";
import { Check, User, Building2, Briefcase, Settings, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import {
  Display,
  H2,
  H3,
  Body,
  Button,
  Input,
  Textarea,
  Select,
  Checkbox,
  Radio,
  Alert,
  Stack,
  Field,
  Card,
  Section,
  Container,
  Label,
  ScrollReveal,
} from "@ghxstship/ui";
import NextLink from "next/link";

// =============================================================================
// ONBOARDING PAGE - COMPVSS User Setup Wizard
// Bold Contemporary Pop Art Adventure Design System - Light Theme
// =============================================================================

type OnboardingStep = "profile" | "organization" | "role" | "preferences" | "complete";

const STEPS: { id: OnboardingStep; label: string; description: string; icon: React.ReactNode }[] = [
  { id: "profile", label: "Profile", description: "Tell us about yourself", icon: <User className="size-5" /> },
  { id: "organization", label: "Organization", description: "Your company details", icon: <Building2 className="size-5" /> },
  { id: "role", label: "Role", description: "Your role in crew management", icon: <Briefcase className="size-5" /> },
  { id: "preferences", label: "Preferences", description: "Customize your experience", icon: <Settings className="size-5" /> },
  { id: "complete", label: "Complete", description: "You're all set!", icon: <Sparkles className="size-5" /> },
];

const COMPVSS_ROLES = [
  "Crew Coordinator",
  "Production Manager",
  "HR Manager",
  "Payroll Administrator",
  "Department Head",
  "Other",
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user: _user } = useAuthContext();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("profile");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [profile, setProfile] = useState({ firstName: "", lastName: "", phone: "", bio: "" });
  const [organization, setOrganization] = useState({ name: "", type: "", role: "", teamSize: "" });
  const [selectedRole, setSelectedRole] = useState("");
  const [preferences, setPreferences] = useState({
    theme: "system",
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
  });

  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep);

  const handleNext = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("ghxstship_access_token");
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      if (currentStep === "profile") {
        await fetch("/api/onboarding/profile", { method: "POST", headers, body: JSON.stringify(profile) });
      } else if (currentStep === "organization") {
        await fetch("/api/onboarding/organization", { method: "POST", headers, body: JSON.stringify(organization) });
      } else if (currentStep === "role") {
        await fetch("/api/onboarding/role", { method: "POST", headers, body: JSON.stringify({ role: selectedRole }) });
      } else if (currentStep === "preferences") {
        await fetch("/api/onboarding/preferences", { method: "POST", headers, body: JSON.stringify(preferences) });
      }

      const nextIndex = currentStepIndex + 1;
      if (nextIndex < STEPS.length) {
        setCurrentStep(STEPS[nextIndex].id);
      }
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
      router.push("/dashboard");
    } catch (err) {
      setError("Failed to complete onboarding. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex].id);
    }
  };

  return (
    <Section background="white" className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b-2 border-black/10 bg-white">
        <Container className="flex h-14 items-center justify-between px-4 sm:h-16 sm:px-6">
          <NextLink href="/" className="transition-transform hover:-translate-y-0.5">
            <Display size="md" className="text-black">COMPVSS</Display>
          </NextLink>
        </Container>
      </header>

      {/* Main Content */}
      <main className="relative flex flex-1 items-center justify-center overflow-hidden bg-grey-100 px-4 py-8 sm:px-6 sm:py-12 md:py-16">
        {/* Grid Pattern Background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
          aria-hidden="true"
        />

        <Container className="relative z-10 w-full max-w-xl">
          <ScrollReveal animation="slide-up" duration={600}>
            <Card className="border-2 border-black/10 bg-white p-6 shadow-md sm:p-8">
              <Stack gap={6} className="sm:gap-8">
                {/* Progress Steps - Desktop */}
                <div className="hidden sm:block">
                  <Stack direction="horizontal" className="items-center justify-between">
                    {STEPS.map((step, index) => (
                      <Stack key={step.id} direction="horizontal" className="items-center">
                        <div
                          className={`flex size-10 items-center justify-center border-2 text-sm ${
                            index <= currentStepIndex
                              ? "border-black bg-black text-white"
                              : "border-grey-300 bg-grey-100 text-muted"
                          }`}
                        >
                          {index < currentStepIndex ? <Check className="size-5" /> : step.icon}
                        </div>
                        {index < STEPS.length - 1 && (
                          <div className={`mx-2 h-0.5 w-6 md:w-10 lg:w-14 ${index < currentStepIndex ? "bg-black" : "bg-grey-300"}`} />
                        )}
                      </Stack>
                    ))}
                  </Stack>
                </div>

                {/* Mobile Progress Indicator */}
                <div className="block sm:hidden">
                  <Stack gap={2} className="text-center">
                    <Label size="xs" className="text-muted">Step {currentStepIndex + 1} of {STEPS.length}</Label>
                    <div className="flex gap-1">
                      {STEPS.map((_, index) => (
                        <div key={index} className={`h-1 flex-1 ${index <= currentStepIndex ? "bg-black" : "bg-grey-300"}`} />
                      ))}
                    </div>
                  </Stack>
                </div>

                {/* Step Header */}
                <Stack gap={3} className="text-center sm:gap-4">
                  <div className="mx-auto flex size-12 items-center justify-center border-2 border-black/10 bg-grey-100 sm:size-16">
                    {STEPS[currentStepIndex].icon}
                  </div>
                  <H2 className="text-black">{STEPS[currentStepIndex].label.toUpperCase()}</H2>
                  <Body size="sm" className="text-muted">{STEPS[currentStepIndex].description}</Body>
                </Stack>

                {error && <Alert variant="error">{error}</Alert>}

                {/* Profile Step */}
                {currentStep === "profile" && (
                  <Stack gap={4} className="sm:gap-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field label="First Name">
                        <Input type="text" value={profile.firstName} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} placeholder="John" />
                      </Field>
                      <Field label="Last Name">
                        <Input type="text" value={profile.lastName} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} placeholder="Doe" />
                      </Field>
                    </div>
                    <Field label="Phone (Optional)">
                      <Input type="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="+1 (555) 000-0000" />
                    </Field>
                    <Field label="Bio (Optional)">
                      <Textarea value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} placeholder="Tell us about yourself..." rows={3} />
                    </Field>
                  </Stack>
                )}

                {/* Organization Step */}
                {currentStep === "organization" && (
                  <Stack gap={4} className="sm:gap-6">
                    <Field label="Organization Name">
                      <Input type="text" value={organization.name} onChange={(e) => setOrganization({ ...organization, name: e.target.value })} placeholder="Acme Productions" />
                    </Field>
                    <Field label="Organization Type">
                      <Select value={organization.type} onChange={(e) => setOrganization({ ...organization, type: e.target.value })}>
                        <option value="">Select type...</option>
                        <option value="production_company">Production Company</option>
                        <option value="venue">Venue</option>
                        <option value="agency">Agency</option>
                        <option value="promoter">Promoter</option>
                        <option value="other">Other</option>
                      </Select>
                    </Field>
                    <Field label="Your Role">
                      <Input type="text" value={organization.role} onChange={(e) => setOrganization({ ...organization, role: e.target.value })} placeholder="e.g., Crew Coordinator" />
                    </Field>
                    <Field label="Team Size">
                      <Select value={organization.teamSize} onChange={(e) => setOrganization({ ...organization, teamSize: e.target.value })}>
                        <option value="">Select size...</option>
                        <option value="1">Just me</option>
                        <option value="2-10">2-10</option>
                        <option value="11-50">11-50</option>
                        <option value="51-200">51-200</option>
                        <option value="200+">200+</option>
                      </Select>
                    </Field>
                  </Stack>
                )}

                {/* Role Step */}
                {currentStep === "role" && (
                  <Stack gap={4} className="sm:gap-6">
                    <Body size="sm" className="text-center text-muted">Select your primary role in COMPVSS:</Body>
                    <Stack gap={3}>
                      {COMPVSS_ROLES.map((role) => (
                        <Stack
                          key={role}
                          direction="horizontal"
                          gap={3}
                          className={`cursor-pointer border-2 p-4 transition-colors ${selectedRole === role ? "border-black bg-grey-100" : "border-grey-200 hover:border-black"}`}
                          onClick={() => setSelectedRole(role)}
                        >
                          <Radio name="role" value={role} checked={selectedRole === role} onChange={() => setSelectedRole(role)} />
                          <Body>{role}</Body>
                        </Stack>
                      ))}
                    </Stack>
                  </Stack>
                )}

                {/* Preferences Step */}
                {currentStep === "preferences" && (
                  <Stack gap={4} className="sm:gap-6">
                    <Field label="Theme">
                      <Select value={preferences.theme} onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}>
                        <option value="system">System Default</option>
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                      </Select>
                    </Field>
                    <Stack gap={4}>
                      <Stack direction="horizontal" gap={3} className="items-center">
                        <Checkbox id="email" checked={preferences.emailNotifications} onChange={(e) => setPreferences({ ...preferences, emailNotifications: e.target.checked })} />
                        <Label size="sm" className="text-muted">Email notifications for crew updates</Label>
                      </Stack>
                      <Stack direction="horizontal" gap={3} className="items-center">
                        <Checkbox id="push" checked={preferences.pushNotifications} onChange={(e) => setPreferences({ ...preferences, pushNotifications: e.target.checked })} />
                        <Label size="sm" className="text-muted">Push notifications for urgent alerts</Label>
                      </Stack>
                      <Stack direction="horizontal" gap={3} className="items-center">
                        <Checkbox id="marketing" checked={preferences.marketingEmails} onChange={(e) => setPreferences({ ...preferences, marketingEmails: e.target.checked })} />
                        <Label size="sm" className="text-muted">Receive product updates and tips</Label>
                      </Stack>
                    </Stack>
                  </Stack>
                )}

                {/* Complete Step */}
                {currentStep === "complete" && (
                  <Stack gap={6} className="text-center sm:gap-8">
                    <div className="mx-auto flex size-16 items-center justify-center border-2 border-black/10 bg-grey-100 sm:size-20">
                      <Check className="size-8 text-success sm:size-10" />
                    </div>
                    <Stack gap={3} className="sm:gap-4">
                      <H3 className="text-black">Welcome to COMPVSS!</H3>
                      <Body size="sm" className="text-muted">Your account is all set up. You&apos;re ready to start managing your crew.</Body>
                    </Stack>
                  </Stack>
                )}

                {/* Navigation */}
                <Stack direction="horizontal" className="flex-col items-stretch gap-3 border-t border-black/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  {currentStep !== "complete" && currentStep !== "profile" && (
                    <Button type="button" variant="outline" onClick={() => setCurrentStep(STEPS[currentStepIndex - 1].id)} icon={<ArrowLeft className="size-4" />} iconPosition="left" className="order-2 sm:order-1">
                      Back
                    </Button>
                  )}
                  {currentStep !== "complete" && currentStep === "profile" && <div className="hidden sm:block" />}

                  {currentStep === "complete" ? (
                    <Button type="button" variant="solid" size="lg" fullWidth onClick={handleComplete} disabled={loading} icon={<ArrowRight className="size-4" />} iconPosition="right">
                      {loading ? "Starting..." : "Go to Dashboard"}
                    </Button>
                  ) : (
                    <Stack direction="horizontal" gap={3} className="order-1 w-full justify-end sm:order-2 sm:w-auto">
                      {currentStep !== "profile" && (
                        <Button type="button" variant="ghost" size="sm" onClick={handleSkip}>Skip</Button>
                      )}
                      <Button type="button" variant="solid" onClick={handleNext} disabled={loading} icon={<ArrowRight className="size-4" />} iconPosition="right" className="flex-1 sm:flex-none">
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
      <footer className="border-t-2 border-black/10 bg-white py-6">
        <Container className="px-4 text-center sm:px-6">
          <Stack gap={4}>
            <Stack direction="horizontal" gap={4} className="flex-wrap justify-center">
              <NextLink href="/legal/privacy" className="text-mono-xs uppercase text-muted transition-colors hover:text-black">Privacy</NextLink>
              <NextLink href="/legal/terms" className="text-mono-xs uppercase text-muted transition-colors hover:text-black">Terms</NextLink>
              <NextLink href="/help" className="text-mono-xs uppercase text-muted transition-colors hover:text-black">Help</NextLink>
            </Stack>
            <Label size="xxs" className="text-muted">© {new Date().getFullYear()} GHXSTSHIP INDUSTRIES</Label>
          </Stack>
        </Container>
      </footer>
    </Section>
  );
}
