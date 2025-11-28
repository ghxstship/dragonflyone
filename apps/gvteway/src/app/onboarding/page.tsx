"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@ghxstship/config";
import { Check } from "lucide-react";
import { ConsumerNavigationPublic } from '@/components/navigation';
import {
  PageLayout,
  Footer,
  FooterColumn,
  FooterLink,
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
  Grid,
  Label,
  Select,
} from "@ghxstship/ui";

type OnboardingStep = 'profile' | 'interests' | 'preferences' | 'complete';

const STEPS: { id: OnboardingStep; label: string; description: string }[] = [
  { id: 'profile', label: 'Profile', description: 'Tell us about yourself' },
  { id: 'interests', label: 'Interests', description: 'What events interest you?' },
  { id: 'preferences', label: 'Preferences', description: 'Customize your experience' },
  { id: 'complete', label: 'Complete', description: 'You\'re all set!' },
];

const EVENT_INTERESTS = ['Concerts', 'Festivals', 'Sports', 'Theater', 'Comedy', 'Conferences', 'Workshops', 'Nightlife'];

export default function OnboardingPage() {
  const router = useRouter();
  const { user: _user } = useAuthContext();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [profile, setProfile] = useState({ firstName: '', lastName: '', phone: '', location: '' });
  const [interests, setInterests] = useState<string[]>([]);
  const [preferences, setPreferences] = useState({ theme: 'dark', emailNotifications: true, pushNotifications: true, marketingEmails: false });

  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep);

  const toggleInterest = (interest: string) => {
    setInterests(prev => prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]);
  };

  const handleNext = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem("ghxstship_access_token");
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      if (currentStep === 'profile') {
        await fetch('/api/onboarding/profile', { method: 'POST', headers, body: JSON.stringify(profile) });
      } else if (currentStep === 'interests') {
        await fetch('/api/onboarding/interests', { method: 'POST', headers, body: JSON.stringify({ interests }) });
      } else if (currentStep === 'preferences') {
        await fetch('/api/onboarding/preferences', { method: 'POST', headers, body: JSON.stringify(preferences) });
      }
      const nextIndex = currentStepIndex + 1;
      if (nextIndex < STEPS.length) setCurrentStep(STEPS[nextIndex].id);
    } catch (err) {
      setError('Failed to save. Please try again.');
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

      await fetch('/api/onboarding/complete', { method: 'POST', headers });
      router.push('/');
    } catch (err) {
      setError('Failed to complete onboarding.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) setCurrentStep(STEPS[nextIndex].id);
  };

  return (
    <PageLayout
      background="black"
      header={<ConsumerNavigationPublic />}
      footer={
        <Footer logo={<Display size="md" className="text-white">GVTEWAY</Display>} copyright="© 2024 GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED.">
          <FooterColumn title="Legal">
            <FooterLink href="/legal/privacy">Privacy</FooterLink>
            <FooterLink href="/legal/terms">Terms</FooterLink>
          </FooterColumn>
        </Footer>
      }
    >
      <Section background="black" className="flex min-h-[80vh] items-center justify-center py-12">
        <Container className="w-full max-w-xl">
          {/* Onboarding Card - Pop Art Style */}
          <Card inverted variant="elevated" className="p-8">
            <Stack gap={8}>
              {/* Progress Steps */}
              <Stack direction="horizontal" className="items-center justify-between">
                {STEPS.map((step, index) => (
                  <Stack key={step.id} direction="horizontal" className="items-center">
                    <Stack
                      className={`flex size-10 items-center justify-center border-2 text-sm font-bold ${
                        index <= currentStepIndex
                          ? 'border-white bg-white text-black'
                          : 'border-grey-700 bg-grey-800 text-on-dark-muted'
                      }`}
                    >
                      {index < currentStepIndex ? '✓' : index + 1}
                    </Stack>
                    {index < STEPS.length - 1 && (
                      <Stack
                        className={`mx-2 h-0.5 w-16 ${
                          index < currentStepIndex ? 'bg-white' : 'bg-grey-800'
                        }`}
                      />
                    )}
                  </Stack>
                ))}
              </Stack>

              {/* Step Header */}
              <Stack gap={4} className="text-center">
                <H2 className="text-white">{STEPS[currentStepIndex].label}</H2>
                <Body className="text-on-dark-muted">{STEPS[currentStepIndex].description}</Body>
              </Stack>

              {/* Error Alert */}
              {error && <Alert variant="error">{error}</Alert>}

              {/* Profile Step */}
              {currentStep === 'profile' && (
                <Stack gap={6}>
                  <Grid cols={2} gap={4}>
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
                  </Grid>
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
              {currentStep === 'interests' && (
                <Stack gap={6}>
                  <Body className="text-center text-on-dark-muted">
                    Select the types of events you&apos;re interested in:
                  </Body>
                  <Grid cols={2} gap={3}>
                    {EVENT_INTERESTS.map((interest) => (
                      <Button
                        key={interest}
                        type="button"
                        variant={interests.includes(interest) ? 'solid' : 'outlineInk'}
                        size="md"
                        onClick={() => toggleInterest(interest)}
                        inverted
                      >
                        {interest}
                      </Button>
                    ))}
                  </Grid>
                </Stack>
              )}

              {/* Preferences Step */}
              {currentStep === 'preferences' && (
                <Stack gap={6}>
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
                        onChange={(e) => setPreferences({ ...preferences, emailNotifications: e.target.checked })}
                        inverted
                      />
                      <Label size="sm" className="text-on-dark-muted">Email notifications for event updates</Label>
                    </Stack>
                    <Stack direction="horizontal" gap={3} className="items-center">
                      <Checkbox
                        id="pushNotifications"
                        checked={preferences.pushNotifications}
                        onChange={(e) => setPreferences({ ...preferences, pushNotifications: e.target.checked })}
                        inverted
                      />
                      <Label size="sm" className="text-on-dark-muted">Push notifications for ticket sales</Label>
                    </Stack>
                    <Stack direction="horizontal" gap={3} className="items-center">
                      <Checkbox
                        id="marketingEmails"
                        checked={preferences.marketingEmails}
                        onChange={(e) => setPreferences({ ...preferences, marketingEmails: e.target.checked })}
                        inverted
                      />
                      <Label size="sm" className="text-on-dark-muted">Receive personalized event recommendations</Label>
                    </Stack>
                  </Stack>
                </Stack>
              )}

              {/* Complete Step */}
              {currentStep === 'complete' && (
                <Stack gap={6} className="text-center">
                  <Card inverted className="mx-auto flex size-20 items-center justify-center">
                    <Check size={40} className="text-white" />
                  </Card>
                  <Stack gap={4}>
                    <H3 className="text-white">Welcome to GVTEWAY!</H3>
                    <Body className="text-on-dark-muted">
                      Your account is all set up. Discover amazing events and experiences.
                    </Body>
                  </Stack>
                </Stack>
              )}

              {/* Navigation */}
              <Stack
                direction="horizontal"
                className="items-center justify-between border-t-2 border-grey-700 pt-6"
              >
                {currentStep !== 'complete' && currentStep !== 'profile' && (
                  <Button
                    type="button"
                    variant="outlineInk"
                    onClick={() => setCurrentStep(STEPS[currentStepIndex - 1].id)}
                  >
                    Back
                  </Button>
                )}
                {currentStep !== 'complete' && currentStep === 'profile' && <div />}
                
                {currentStep === 'complete' ? (
                  <Button
                    type="button"
                    variant="solid"
                    size="lg"
                    fullWidth
                    inverted
                    onClick={handleComplete}
                    disabled={loading}
                  >
                    {loading ? 'Starting...' : 'Explore Events'}
                  </Button>
                ) : (
                  <Stack direction="horizontal" gap={3}>
                    {currentStep !== 'profile' && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        inverted
                        onClick={handleSkip}
                        className="text-on-dark-muted"
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
                    >
                      {loading ? 'Saving...' : 'Continue'}
                    </Button>
                  </Stack>
                )}
              </Stack>
            </Stack>
          </Card>
        </Container>
      </Section>
    </PageLayout>
  );
}
