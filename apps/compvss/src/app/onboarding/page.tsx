'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthContext } from '@ghxstship/config';

type OnboardingStep = 'profile' | 'organization' | 'role' | 'preferences' | 'complete';

const STEPS: { id: OnboardingStep; label: string; description: string }[] = [
  { id: 'profile', label: 'Profile', description: 'Tell us about yourself' },
  { id: 'organization', label: 'Organization', description: 'Your company details' },
  { id: 'role', label: 'Role', description: 'Your role in crew management' },
  { id: 'preferences', label: 'Preferences', description: 'Customize your experience' },
  { id: 'complete', label: 'Complete', description: 'You\'re all set!' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuthContext();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [profile, setProfile] = useState({ firstName: '', lastName: '', phone: '', bio: '' });
  const [organization, setOrganization] = useState({ name: '', type: '', role: '', teamSize: '' });
  const [selectedRole, setSelectedRole] = useState('');
  const [preferences, setPreferences] = useState({ theme: 'system', emailNotifications: true, pushNotifications: true, marketingEmails: false });

  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep);

  const handleNext = async () => {
    setLoading(true);
    setError('');
    try {
      if (currentStep === 'profile') await fetch('/api/onboarding/profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profile) });
      else if (currentStep === 'organization') await fetch('/api/onboarding/organization', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(organization) });
      else if (currentStep === 'role') await fetch('/api/onboarding/role', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role: selectedRole }) });
      else if (currentStep === 'preferences') await fetch('/api/onboarding/preferences', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(preferences) });
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
      await fetch('/api/onboarding/complete', { method: 'POST' });
      router.push('/dashboard');
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
    <div className="min-h-screen flex flex-col bg-grey-100">
      <header className="py-6 px-8 border-b border-grey-200 bg-white">
        <Link href="/" className="font-heading text-h4 uppercase tracking-widest">COMPVSS</Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full space-y-8 bg-white p-8 border border-grey-200">
          <div className="flex items-center justify-between mb-8">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-code text-mono-sm ${index <= currentStepIndex ? 'bg-black text-white' : 'bg-grey-200 text-grey-500'}`}>
                  {index < currentStepIndex ? '✓' : index + 1}
                </div>
                {index < STEPS.length - 1 && <div className={`w-12 h-0.5 mx-2 ${index < currentStepIndex ? 'bg-black' : 'bg-grey-200'}`} />}
              </div>
            ))}
          </div>

          <div className="text-center mb-8">
            <h1 className="font-heading text-h2 uppercase tracking-widest">{STEPS[currentStepIndex].label}</h1>
            <p className="mt-2 font-body text-body-md text-grey-600">{STEPS[currentStepIndex].description}</p>
          </div>

          {error && <div className="p-4 bg-grey-100 border border-grey-300"><p className="font-code text-mono-sm text-black uppercase tracking-wider">{error}</p></div>}

          {currentStep === 'profile' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="font-heading text-h6-sm uppercase tracking-wider">First Name</label><input type="text" value={profile.firstName} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} className="mt-2 block w-full px-4 py-3 border border-grey-300 font-body text-body-md focus:outline-none focus:border-black" /></div>
                <div><label className="font-heading text-h6-sm uppercase tracking-wider">Last Name</label><input type="text" value={profile.lastName} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} className="mt-2 block w-full px-4 py-3 border border-grey-300 font-body text-body-md focus:outline-none focus:border-black" /></div>
              </div>
              <div><label className="font-heading text-h6-sm uppercase tracking-wider">Phone (Optional)</label><input type="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="mt-2 block w-full px-4 py-3 border border-grey-300 font-body text-body-md focus:outline-none focus:border-black" /></div>
              <div><label className="font-heading text-h6-sm uppercase tracking-wider">Bio (Optional)</label><textarea value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} rows={3} className="mt-2 block w-full px-4 py-3 border border-grey-300 font-body text-body-md focus:outline-none focus:border-black resize-none" /></div>
            </div>
          )}

          {currentStep === 'organization' && (
            <div className="space-y-6">
              <div><label className="font-heading text-h6-sm uppercase tracking-wider">Organization Name</label><input type="text" value={organization.name} onChange={(e) => setOrganization({ ...organization, name: e.target.value })} className="mt-2 block w-full px-4 py-3 border border-grey-300 font-body text-body-md focus:outline-none focus:border-black" /></div>
              <div><label className="font-heading text-h6-sm uppercase tracking-wider">Organization Type</label><select value={organization.type} onChange={(e) => setOrganization({ ...organization, type: e.target.value })} className="mt-2 block w-full px-4 py-3 border border-grey-300 font-body text-body-md focus:outline-none focus:border-black"><option value="">Select type...</option><option value="production_company">Production Company</option><option value="venue">Venue</option><option value="agency">Agency</option><option value="promoter">Promoter</option><option value="other">Other</option></select></div>
              <div><label className="font-heading text-h6-sm uppercase tracking-wider">Your Role</label><input type="text" value={organization.role} onChange={(e) => setOrganization({ ...organization, role: e.target.value })} placeholder="e.g., Crew Coordinator" className="mt-2 block w-full px-4 py-3 border border-grey-300 font-body text-body-md focus:outline-none focus:border-black" /></div>
              <div><label className="font-heading text-h6-sm uppercase tracking-wider">Team Size</label><select value={organization.teamSize} onChange={(e) => setOrganization({ ...organization, teamSize: e.target.value })} className="mt-2 block w-full px-4 py-3 border border-grey-300 font-body text-body-md focus:outline-none focus:border-black"><option value="">Select size...</option><option value="1">Just me</option><option value="2-10">2-10</option><option value="11-50">11-50</option><option value="51-200">51-200</option><option value="200+">200+</option></select></div>
            </div>
          )}

          {currentStep === 'role' && (
            <div className="space-y-4">
              <p className="font-body text-body-md text-grey-600 mb-6">Select your primary role in COMPVSS:</p>
              {['Crew Coordinator', 'Production Manager', 'HR Manager', 'Payroll Administrator', 'Department Head', 'Other'].map((role) => (
                <label key={role} className={`flex items-center p-4 border cursor-pointer transition-colors ${selectedRole === role ? 'border-black bg-grey-100' : 'border-grey-300 hover:border-grey-400'}`}>
                  <input type="radio" name="role" value={role} checked={selectedRole === role} onChange={(e) => setSelectedRole(e.target.value)} className="mr-4" />
                  <span className="font-body text-body-md">{role}</span>
                </label>
              ))}
            </div>
          )}

          {currentStep === 'preferences' && (
            <div className="space-y-6">
              <div><label className="font-heading text-h6-sm uppercase tracking-wider">Theme</label><select value={preferences.theme} onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })} className="mt-2 block w-full px-4 py-3 border border-grey-300 font-body text-body-md focus:outline-none focus:border-black"><option value="system">System Default</option><option value="light">Light</option><option value="dark">Dark</option></select></div>
              <div className="space-y-4">
                <label className="flex items-center"><input type="checkbox" checked={preferences.emailNotifications} onChange={(e) => setPreferences({ ...preferences, emailNotifications: e.target.checked })} className="mr-3 h-4 w-4" /><span className="font-body text-body-md">Email notifications for crew updates</span></label>
                <label className="flex items-center"><input type="checkbox" checked={preferences.pushNotifications} onChange={(e) => setPreferences({ ...preferences, pushNotifications: e.target.checked })} className="mr-3 h-4 w-4" /><span className="font-body text-body-md">Push notifications for urgent alerts</span></label>
                <label className="flex items-center"><input type="checkbox" checked={preferences.marketingEmails} onChange={(e) => setPreferences({ ...preferences, marketingEmails: e.target.checked })} className="mr-3 h-4 w-4" /><span className="font-body text-body-md">Receive product updates and tips</span></label>
              </div>
            </div>
          )}

          {currentStep === 'complete' && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto bg-grey-100 rounded-full flex items-center justify-center"><svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></div>
              <h2 className="font-heading text-h3 uppercase tracking-widest">Welcome to COMPVSS!</h2>
              <p className="font-body text-body-md text-grey-600">Your account is all set up. You&apos;re ready to start managing your crew.</p>
            </div>
          )}

          <div className="flex justify-between pt-8 border-t border-grey-200">
            {currentStep !== 'complete' && currentStep !== 'profile' && <button onClick={() => setCurrentStep(STEPS[currentStepIndex - 1].id)} className="py-3 px-6 border border-grey-300 font-heading text-h6-sm uppercase tracking-widest hover:bg-grey-100 transition-colors">Back</button>}
            {currentStep !== 'complete' && currentStep === 'profile' && <div />}
            {currentStep === 'complete' ? (
              <button onClick={handleComplete} disabled={loading} className="w-full py-3 px-6 bg-black text-white font-heading text-h6-sm uppercase tracking-widest hover:bg-grey-800 disabled:bg-grey-400 transition-colors">{loading ? 'Starting...' : 'Go to Dashboard'}</button>
            ) : (
              <div className="flex gap-4">
                {currentStep !== 'profile' && <button onClick={handleSkip} className="py-3 px-6 font-code text-mono-xs uppercase tracking-wider text-grey-600 hover:text-black transition-colors">Skip</button>}
                <button onClick={handleNext} disabled={loading} className="py-3 px-6 bg-black text-white font-heading text-h6-sm uppercase tracking-widest hover:bg-grey-800 disabled:bg-grey-400 transition-colors">{loading ? 'Saving...' : 'Continue'}</button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
