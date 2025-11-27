"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@ghxstship/config";
import { Check } from "lucide-react";
import {
  PageLayout,
  Navigation,
  Footer,
  FooterColumn,
  FooterLink,
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
  SectionLayout,
  Alert,
  Stack,
  Field,
  Grid,
  Stepper,
} from "@ghxstship/ui";

type OnboardingStep = "profile" | "organization" | "role" | "preferences" | "complete";

const STEPS: { id: OnboardingStep; label: string; description: string }[] = [
  { id: "profile", label: "Profile", description: "Tell us about yourself" },
  { id: "organization", label: "Organization", description: "Your company details" },
  { id: "role", label: "Role", description: "Your role in crew management" },
  { id: "preferences", label: "Preferences", description: "Customize your experience" },
  { id: "complete", label: "Complete", description: "You're all set!" },
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
  const { user } = useAuthContext();
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

  const stepperSteps = STEPS.map((step, index) => ({
    id: step.id,
    label: step.label,
    status: index < currentStepIndex ? "completed" as const : index === currentStepIndex ? "current" as const : "upcoming" as const,
  }));

  return (
    <PageLayout
      background="white"
      header={
        <Navigation
          logo={<Display size="md" className="text-display-md text-black">COMPVSS</Display>}
          cta={<></>}
        />
      }
      footer={
        <Footer
          logo={<Display size="md" className="text-black text-display-md">COMPVSS</Display>}
          copyright="© 2024 GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED."
        >
          <FooterColumn title="Legal">
            <FooterLink href="/privacy">Privacy</FooterLink>
            <FooterLink href="/terms">Terms</FooterLink>
          </FooterColumn>
        </Footer>
      }
    >
      <SectionLayout background="grey">
        <Stack gap={8} className="mx-auto max-w-2xl bg-white p-8 border border-ink-200">
          <Stepper steps={stepperSteps} currentStep={currentStepIndex} />

          <Stack gap={2} className="text-center">
            <H2>{STEPS[currentStepIndex].label}</H2>
            <Body className="text-ink-600">{STEPS[currentStepIndex].description}</Body>
          </Stack>

          {error && <Alert variant="error">{error}</Alert>}

          {currentStep === "profile" && (
            <Stack gap={6}>
              <Grid cols={2} gap={4}>
                <Field label="First Name">
                  <Input
                    type="text"
                    value={profile.firstName}
                    onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                    placeholder="John"
                  />
                </Field>
                <Field label="Last Name">
                  <Input
                    type="text"
                    value={profile.lastName}
                    onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                    placeholder="Doe"
                  />
                </Field>
              </Grid>
              <Field label="Phone (Optional)">
                <Input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                />
              </Field>
              <Field label="Bio (Optional)">
                <Textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  rows={3}
                />
              </Field>
            </Stack>
          )}

          {currentStep === "organization" && (
            <Stack gap={6}>
              <Field label="Organization Name">
                <Input
                  type="text"
                  value={organization.name}
                  onChange={(e) => setOrganization({ ...organization, name: e.target.value })}
                  placeholder="Acme Productions"
                />
              </Field>
              <Field label="Organization Type">
                <Select
                  value={organization.type}
                  onChange={(e) => setOrganization({ ...organization, type: e.target.value })}
                >
                  <option value="">Select type...</option>
                  <option value="production_company">Production Company</option>
                  <option value="venue">Venue</option>
                  <option value="agency">Agency</option>
                  <option value="promoter">Promoter</option>
                  <option value="other">Other</option>
                </Select>
              </Field>
              <Field label="Your Role">
                <Input
                  type="text"
                  value={organization.role}
                  onChange={(e) => setOrganization({ ...organization, role: e.target.value })}
                  placeholder="e.g., Crew Coordinator"
                />
              </Field>
              <Field label="Team Size">
                <Select
                  value={organization.teamSize}
                  onChange={(e) => setOrganization({ ...organization, teamSize: e.target.value })}
                >
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

          {currentStep === "role" && (
            <Stack gap={4}>
              <Body className="text-ink-600 text-center">Select your primary role in COMPVSS:</Body>
              <Stack gap={3}>
                {COMPVSS_ROLES.map((role) => (
                  <Stack
                    key={role}
                    direction="horizontal"
                    gap={3}
                    className={`p-4 border cursor-pointer transition-colors ${
                      selectedRole === role ? "border-black bg-ink-100" : "border-ink-300 hover:border-ink-400"
                    }`}
                    onClick={() => setSelectedRole(role)}
                  >
                    <Radio
                      name="role"
                      value={role}
                      checked={selectedRole === role}
                      onChange={() => setSelectedRole(role)}
                    />
                    <Body>{role}</Body>
                  </Stack>
                ))}
              </Stack>
            </Stack>
          )}

          {currentStep === "preferences" && (
            <Stack gap={6}>
              <Field label="Theme">
                <Select
                  value={preferences.theme}
                  onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
                >
                  <option value="system">System Default</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </Select>
              </Field>
              <Stack gap={4}>
                <Stack direction="horizontal" gap={3} className="items-center">
                  <Checkbox
                    id="email"
                    checked={preferences.emailNotifications}
                    onChange={(e) => setPreferences({ ...preferences, emailNotifications: e.target.checked })}
                  />
                  <Body>Email notifications for crew updates</Body>
                </Stack>
                <Stack direction="horizontal" gap={3} className="items-center">
                  <Checkbox
                    id="push"
                    checked={preferences.pushNotifications}
                    onChange={(e) => setPreferences({ ...preferences, pushNotifications: e.target.checked })}
                  />
                  <Body>Push notifications for urgent alerts</Body>
                </Stack>
                <Stack direction="horizontal" gap={3} className="items-center">
                  <Checkbox
                    id="marketing"
                    checked={preferences.marketingEmails}
                    onChange={(e) => setPreferences({ ...preferences, marketingEmails: e.target.checked })}
                  />
                  <Body>Receive product updates and tips</Body>
                </Stack>
              </Stack>
            </Stack>
          )}

          {currentStep === "complete" && (
            <Stack gap={6} className="text-center">
              <Stack className="w-20 h-20 mx-auto bg-ink-100 rounded-full items-center justify-center">
                <Check className="w-10 h-10" />
              </Stack>
              <H3>Welcome to COMPVSS!</H3>
              <Body className="text-ink-600">Your account is all set up. You&apos;re ready to start managing your crew.</Body>
            </Stack>
          )}

          <Stack direction="horizontal" className="justify-between pt-8 border-t border-ink-200">
            {currentStep !== "complete" && currentStep !== "profile" && (
              <Button variant="outline" onClick={() => setCurrentStep(STEPS[currentStepIndex - 1].id)}>
                Back
              </Button>
            )}
            {currentStep !== "complete" && currentStep === "profile" && <div />}

            {currentStep === "complete" ? (
              <Button variant="solid" className="w-full" onClick={handleComplete} disabled={loading}>
                {loading ? "Starting..." : "Go to Dashboard"}
              </Button>
            ) : (
              <Stack direction="horizontal" gap={3}>
                {currentStep !== "profile" && (
                  <Button variant="ghost" onClick={handleSkip}>Skip</Button>
                )}
                <Button variant="solid" onClick={handleNext} disabled={loading}>
                  {loading ? "Saving..." : "Continue"}
                </Button>
              </Stack>
            )}
          </Stack>
        </Stack>
      </SectionLayout>
    </PageLayout>
  );
}
