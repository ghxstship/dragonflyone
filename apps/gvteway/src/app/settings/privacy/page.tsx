'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '../../../components/navigation';
import {
  Container,
  Section,
  H1,
  H2,
  H3,
  Body,
  Label,
  Button,
  Card,
  Field,
  Input,
  Textarea,
  Select,
  Grid,
  Stack,
  Badge,
  Switch,
  Alert,
  Modal,
  LoadingSpinner,
} from '@ghxstship/ui';
import Image from 'next/image';

interface BlockedUser {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  blocked_at: string;
}

interface Report {
  id: string;
  reported_user_name: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'resolved';
  created_at: string;
}

export default function PrivacySettingsPage() {
  const router = useRouter();
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Privacy settings
  const [settings, setSettings] = useState({
    profile_visibility: 'public',
    show_activity: true,
    allow_messages: 'everyone',
    show_events_attended: true,
    show_reviews: true,
  });

  // Report form
  const [reportUserId, setReportUserId] = useState('');
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');

  // Block form
  const [blockUserId, setBlockUserId] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [blockedRes, reportsRes, settingsRes] = await Promise.all([
        fetch('/api/user/blocked'),
        fetch('/api/user/reports'),
        fetch('/api/user/privacy-settings'),
      ]);

      if (blockedRes.ok) {
        const data = await blockedRes.json();
        setBlockedUsers(data.blocked || []);
      }

      if (reportsRes.ok) {
        const data = await reportsRes.json();
        setReports(data.reports || []);
      }

      if (settingsRes.ok) {
        const data = await settingsRes.json();
        if (data.settings) setSettings(data.settings);
      }
    } catch (err) {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveSettings = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/user/privacy-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setSuccess('Privacy settings saved');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError('Failed to save settings');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnblock = async (userId: string) => {
    try {
      const response = await fetch(`/api/user/blocked/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccess('User unblocked');
        fetchData();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError('Failed to unblock user');
    }
  };

  const handleBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/user/blocked', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: blockUserId }),
      });

      if (response.ok) {
        setSuccess('User blocked');
        setShowBlockModal(false);
        setBlockUserId('');
        fetchData();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to block user');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/user/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reported_user_id: reportUserId,
          reason: reportReason,
          details: reportDetails,
        }),
      });

      if (response.ok) {
        setSuccess('Report submitted. We will review it shortly.');
        setShowReportModal(false);
        setReportUserId('');
        setReportReason('');
        setReportDetails('');
        fetchData();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to submit report');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-warning-500 text-white">Pending</Badge>;
      case 'reviewed':
        return <Badge className="bg-info-500 text-white">Reviewed</Badge>;
      case 'resolved':
        return <Badge className="bg-success-500 text-white">Resolved</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Section className="min-h-screen bg-white">
        <Navigation />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading privacy settings..." />
        </Container>
      </Section>
    );
  }

  return (
    <Section className="min-h-screen bg-white">
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2} className="border-b-2 border-black pb-8">
            <H1>Privacy & Safety</H1>
            <Body className="text-grey-600">
              Control your privacy settings and manage blocked users
            </Body>
          </Stack>

        {error && (
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" className="mb-6">
            {success}
          </Alert>
        )}

        <Grid cols={2} gap={8}>
          <Stack gap={6}>
            <Card className="p-6">
              <H2 className="mb-6">PRIVACY SETTINGS</H2>
              <Stack gap={4}>
                <Field label="Profile Visibility">
                  <Select
                    value={settings.profile_visibility}
                    onChange={(e) => setSettings({ ...settings, profile_visibility: e.target.value })}
                  >
                    <option value="public">Public - Anyone can view</option>
                    <option value="fans">Fans Only - Only verified fans</option>
                    <option value="private">Private - Only you</option>
                  </Select>
                </Field>

                <Field label="Who Can Message You">
                  <Select
                    value={settings.allow_messages}
                    onChange={(e) => setSettings({ ...settings, allow_messages: e.target.value })}
                  >
                    <option value="everyone">Everyone</option>
                    <option value="verified">Verified Fans Only</option>
                    <option value="none">No One</option>
                  </Select>
                </Field>

                <Stack direction="horizontal" className="justify-between items-center py-2">
                  <Stack>
                    <Body className="font-medium">Show Activity</Body>
                    <Body className="text-sm text-grey-500">Let others see your recent activity</Body>
                  </Stack>
                  <Switch
                    checked={settings.show_activity}
                    onChange={(e) => setSettings({ ...settings, show_activity: e.target.checked })}
                  />
                </Stack>

                <Stack direction="horizontal" className="justify-between items-center py-2">
                  <Stack>
                    <Body className="font-medium">Show Events Attended</Body>
                    <Body className="text-sm text-grey-500">Display events on your profile</Body>
                  </Stack>
                  <Switch
                    checked={settings.show_events_attended}
                    onChange={(e) => setSettings({ ...settings, show_events_attended: e.target.checked })}
                  />
                </Stack>

                <Stack direction="horizontal" className="justify-between items-center py-2">
                  <Stack>
                    <Body className="font-medium">Show Reviews</Body>
                    <Body className="text-sm text-grey-500">Display your reviews publicly</Body>
                  </Stack>
                  <Switch
                    checked={settings.show_reviews}
                    onChange={(e) => setSettings({ ...settings, show_reviews: e.target.checked })}
                  />
                </Stack>

                <Button variant="solid" onClick={handleSaveSettings} disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Settings'}
                </Button>
              </Stack>
            </Card>

            <Card className="p-6">
              <Stack direction="horizontal" className="justify-between items-center mb-6">
                <H2>BLOCKED USERS</H2>
                <Button variant="outline" size="sm" onClick={() => setShowBlockModal(true)}>
                  Block User
                </Button>
              </Stack>

              {blockedUsers.length > 0 ? (
                <Stack gap={3}>
                  {blockedUsers.map(blocked => (
                    <Stack
                      key={blocked.id}
                      direction="horizontal"
                      className="justify-between items-center py-2 border-b border-grey-100"
                    >
                      <Stack direction="horizontal" gap={3} className="items-center">
                        <Stack className="w-10 h-10 bg-grey-200 rounded-full flex items-center justify-center">
                          {blocked.user_avatar ? (
                            <Image
                              src={blocked.user_avatar}
                              alt={blocked.user_name}
                              width={40}
                              height={40}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <Body>{blocked.user_name.charAt(0)}</Body>
                          )}
                        </Stack>
                        <Stack>
                          <Body className="font-medium">{blocked.user_name}</Body>
                          <Body className="text-xs text-grey-500">
                            Blocked {new Date(blocked.blocked_at).toLocaleDateString()}
                          </Body>
                        </Stack>
                      </Stack>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUnblock(blocked.user_id)}
                      >
                        Unblock
                      </Button>
                    </Stack>
                  ))}
                </Stack>
              ) : (
                <Body className="text-grey-500 text-center py-4">
                  No blocked users
                </Body>
              )}
            </Card>
          </Stack>

          <Stack gap={6}>
            <Card className="p-6">
              <Stack direction="horizontal" className="justify-between items-center mb-6">
                <H2>YOUR REPORTS</H2>
                <Button variant="outline" size="sm" onClick={() => setShowReportModal(true)}>
                  Report User
                </Button>
              </Stack>

              {reports.length > 0 ? (
                <Stack gap={3}>
                  {reports.map(report => (
                    <Card key={report.id} className="p-4">
                      <Stack direction="horizontal" className="justify-between items-start mb-2">
                        <Body className="font-medium">{report.reported_user_name}</Body>
                        {getStatusBadge(report.status)}
                      </Stack>
                      <Body className="text-sm text-grey-600">{report.reason}</Body>
                      <Body className="text-xs text-grey-400 mt-2">
                        {new Date(report.created_at).toLocaleDateString()}
                      </Body>
                    </Card>
                  ))}
                </Stack>
              ) : (
                <Body className="text-grey-500 text-center py-4">
                  No reports submitted
                </Body>
              )}
            </Card>

            <Card className="p-6 bg-grey-50">
              <H3 className="mb-4">NEED HELP?</H3>
              <Body className="text-grey-600 mb-4">
                If you&apos;re experiencing harassment or safety concerns, please contact our support team.
              </Body>
              <Button variant="outline" onClick={() => router.push('/support/chat')}>
                Contact Support
              </Button>
            </Card>
          </Stack>
        </Grid>

        <Modal
          open={showBlockModal}
          onClose={() => setShowBlockModal(false)}
          title="Block User"
        >
          <Stack>
            <Stack gap={4}>
              <Body className="text-grey-600">
                Blocked users cannot message you or see your activity.
              </Body>
              <Field label="Username or User ID" required>
                <Input
                  value={blockUserId}
                  onChange={(e) => setBlockUserId(e.target.value)}
                  placeholder="Enter username or ID"
                  required
                />
              </Field>
              <Stack direction="horizontal" gap={4}>
                <Button variant="solid" disabled={submitting} onClick={handleBlock}>
                  {submitting ? 'Blocking...' : 'Block User'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowBlockModal(false)}>
                  Cancel
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </Modal>

        <Modal
          open={showReportModal}
          onClose={() => setShowReportModal(false)}
          title="Report User"
        >
          <Stack>
            <Stack gap={4}>
              <Field label="Username or User ID" required>
                <Input
                  value={reportUserId}
                  onChange={(e) => setReportUserId(e.target.value)}
                  placeholder="Enter username or ID"
                  required
                />
              </Field>

              <Field label="Reason" required>
                <Select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  required
                >
                  <option value="">Select a reason...</option>
                  <option value="harassment">Harassment</option>
                  <option value="spam">Spam</option>
                  <option value="inappropriate">Inappropriate Content</option>
                  <option value="impersonation">Impersonation</option>
                  <option value="scam">Scam/Fraud</option>
                  <option value="other">Other</option>
                </Select>
              </Field>

              <Field label="Details">
                <Textarea
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Provide additional details..."
                  rows={4}
                />
              </Field>

              <Stack direction="horizontal" gap={4}>
                <Button variant="solid" disabled={submitting} onClick={handleReport}>
                  {submitting ? 'Submitting...' : 'Submit Report'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowReportModal(false)}>
                  Cancel
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </Modal>
        </Stack>
      </Container>
    </Section>
  );
}
