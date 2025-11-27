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
  Checkbox,
  SectionLayout,
  Alert,
  Stack,
  Field,
  Grid,
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
  const { user } = useAuthContext();
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
      header={<Navigation logo={<Display size="md" className="text-display-md">GVTEWAY</Display>} cta={<></>} />}
      footer={
        <Footer logo={<Display size="md" className="text-white text-display-md">GVTEWAY</Display>} copyright="© 2024 GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED.">
          <FooterColumn title="Legal"><FooterLink href="#">Privacy</FooterLink><FooterLink href="#">Terms</FooterLink></FooterColumn>
        </Footer>
      }
    >
      <SectionLayout background="black">
        <Stack gap={8} className="mx-auto max-w-2xl">
          {/* Progress Steps */}
          <Stack direction="horizontal" className="justify-between items-center">
            {STEPS.map((step, index) => (
              <Stack key={step.id} direction="horizontal" className="items-center">
                <Stack className={`w-10 h-10 rounded-full items-center justify-center ${index <= currentStepIndex ? 'bg-white text-black' : 'bg-grey-800 text-grey-500'}`}>
                  <Body size="sm" className="font-bold">{index < currentStepIndex ? '✓' : index + 1}</Body>
                </Stack>
                {index < STEPS.length - 1 && <Stack className={`w-16 h-0.5 mx-2 ${index < currentStepIndex ? 'bg-white' : 'bg-grey-800'}`} />}
              </Stack>
            ))}
          </Stack>

          {/* Step Header */}
          <Stack gap={2} className="text-center">
            <H2 className="text-white">{STEPS[currentStepIndex].label}</H2>
            <Body className="text-grey-400">{STEPS[currentStepIndex].description}</Body>
          </Stack>

          {error && <Alert variant="error">{error}</Alert>}

          {/* Profile Step */}
          {currentStep === 'profile' && (
            <Stack gap={6}>
              <Grid cols={2} gap={4}>
                <Field label="First Name" className="text-white">
                  <Input type="text" value={profile.firstName} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} placeholder="John" className="border-grey-700 bg-black text-white" />
                </Field>
                <Field label="Last Name" className="text-white">
                  <Input type="text" value={profile.lastName} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} placeholder="Doe" className="border-grey-700 bg-black text-white" />
                </Field>
              </Grid>
              <Field label="Phone (Optional)" className="text-white">
                <Input type="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="+1 (555) 000-0000" className="border-grey-700 bg-black text-white" />
              </Field>
              <Field label="Location (Optional)" className="text-white">
                <Input type="text" value={profile.location} onChange={(e) => setProfile({ ...profile, location: e.target.value })} placeholder="City, Country" className="border-grey-700 bg-black text-white" />
              </Field>
            </Stack>
          )}

          {/* Interests Step */}
          {currentStep === 'interests' && (
            <Stack gap={4}>
              <Body className="text-grey-400 text-center">Select the types of events you&apos;re interested in:</Body>
              <Grid cols={2} gap={3}>
                {EVENT_INTERESTS.map((interest) => (
                  <Button
                    key={interest}
                    variant={interests.includes(interest) ? 'solid' : 'outline'}
                    onClick={() => toggleInterest(interest)}
                    className={interests.includes(interest) ? '' : 'border-grey-700 text-grey-400 hover:border-white hover:text-white'}
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
              <Field label="Theme" className="text-white">
                <Select
                  value={preferences.theme}
                  onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
                  className="border-grey-700 bg-black text-white"
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                  <option value="system">System Default</option>
                </Select>
              </Field>
              <Stack gap={4}>
                <Stack direction="horizontal" gap={3} className="items-center">
                  <Checkbox id="email" checked={preferences.emailNotifications} onChange={(e) => setPreferences({ ...preferences, emailNotifications: e.target.checked })} />
                  <Body className="text-grey-400">Email notifications for event updates</Body>
                </Stack>
                <Stack direction="horizontal" gap={3} className="items-center">
                  <Checkbox id="push" checked={preferences.pushNotifications} onChange={(e) => setPreferences({ ...preferences, pushNotifications: e.target.checked })} />
                  <Body className="text-grey-400">Push notifications for ticket sales</Body>
                </Stack>
                <Stack direction="horizontal" gap={3} className="items-center">
                  <Checkbox id="marketing" checked={preferences.marketingEmails} onChange={(e) => setPreferences({ ...preferences, marketingEmails: e.target.checked })} />
                  <Body className="text-grey-400">Receive personalized event recommendations</Body>
                </Stack>
              </Stack>
            </Stack>
          )}

          {/* Complete Step */}
          {currentStep === 'complete' && (
            <Stack gap={6} className="text-center">
              <Stack className="w-20 h-20 mx-auto bg-grey-800 rounded-full items-center justify-center">
                <Check className="w-10 h-10 text-white" />
              </Stack>
              <H3 className="text-white">Welcome to GVTEWAY!</H3>
              <Body className="text-grey-400">Your account is all set up. Discover amazing events and experiences.</Body>
            </Stack>
          )}

          {/* Navigation */}
          <Stack direction="horizontal" className="justify-between pt-8 border-t border-grey-800">
            {currentStep !== 'complete' && currentStep !== 'profile' && (
              <Button variant="outline" onClick={() => setCurrentStep(STEPS[currentStepIndex - 1].id)} className="border-grey-700 text-grey-400 hover:border-white hover:text-white">
                Back
              </Button>
            )}
            {currentStep !== 'complete' && currentStep === 'profile' && <div />}
            
            {currentStep === 'complete' ? (
              <Button variant="solid" className="w-full" onClick={handleComplete} disabled={loading}>
                {loading ? 'Starting...' : 'Explore Events'}
              </Button>
            ) : (
              <Stack direction="horizontal" gap={3}>
                {currentStep !== 'profile' && (
                  <Button variant="ghost" onClick={handleSkip} className="text-grey-500 hover:text-white">Skip</Button>
                )}
                <Button variant="solid" onClick={handleNext} disabled={loading}>
                  {loading ? 'Saving...' : 'Continue'}
                </Button>
              </Stack>
            )}
          </Stack>
        </Stack>
      </SectionLayout>
    </PageLayout>
  );
}
