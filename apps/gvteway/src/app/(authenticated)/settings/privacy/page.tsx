'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GvtewayAppLayout, GvtewayLoadingLayout } from '@/components/app-layout';
import {
  H2,
  H3,
  Body,
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
  Kicker,
} from '@ghxstship/ui';
import Image from 'next/image';
import { usePrivacyData, type PrivacySettings } from '@/hooks/usePrivacySettings';

export default function PrivacySettingsPage() {
  const router = useRouter();
  const {
    blockedUsers,
    reports,
    settings: fetchedSettings,
    isLoading,
    updateSettings,
    isUpdatingSettings,
    blockUser,
    isBlockingUser,
    unblockUser,
    isUnblockingUser,
    reportUser,
    isReportingUser,
  } = usePrivacyData();

  const [showReportModal, setShowReportModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Local settings state for form editing
  const [settings, setSettings] = useState<PrivacySettings>(fetchedSettings);

  // Report form
  const [reportUserId, setReportUserId] = useState('');
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');

  // Block form
  const [blockUserId, setBlockUserId] = useState('');

  // Sync local settings with fetched settings
  useEffect(() => {
    setSettings(fetchedSettings);
  }, [fetchedSettings]);

  const handleSaveSettings = async () => {
    setError(null);
    try {
      await updateSettings(settings);
      setSuccess('Privacy settings saved');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    }
  };

  const handleUnblock = async (userId: string) => {
    setError(null);
    try {
      await unblockUser(userId);
      setSuccess('User unblocked');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unblock user');
    }
  };

  const handleBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await blockUser(blockUserId);
      setSuccess('User blocked');
      setShowBlockModal(false);
      setBlockUserId('');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to block user');
    }
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await reportUser({
        reported_user_id: reportUserId,
        reason: reportReason,
        details: reportDetails,
      });
      setSuccess('Report submitted. We will review it shortly.');
      setShowReportModal(false);
      setReportUserId('');
      setReportReason('');
      setReportDetails('');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit report');
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

  if (isLoading) {
    return <GvtewayLoadingLayout text="Loading privacy settings..." />;
  }

  return (
    <GvtewayAppLayout>
          <Stack gap={10}>
            {/* Page Header */}
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Account</Kicker>
              <H2 size="lg" className="text-white">Privacy & Safety</H2>
              <Body className="text-on-dark-muted">Control your privacy settings and manage blocked users</Body>
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

        <Grid cols={2} gap={8} className="sm:grid-cols-1 lg:grid-cols-2">
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
                    <Body className="font-weight-medium">Show Activity</Body>
                    <Body size="sm" className=" text-ink-500">Let others see your recent activity</Body>
                  </Stack>
                  <Switch
                    checked={settings.show_activity}
                    onChange={(e) => setSettings({ ...settings, show_activity: e.target.checked })}
                  />
                </Stack>

                <Stack direction="horizontal" className="justify-between items-center py-2">
                  <Stack>
                    <Body className="font-weight-medium">Show Events Attended</Body>
                    <Body size="sm" className=" text-ink-500">Display events on your profile</Body>
                  </Stack>
                  <Switch
                    checked={settings.show_events_attended}
                    onChange={(e) => setSettings({ ...settings, show_events_attended: e.target.checked })}
                  />
                </Stack>

                <Stack direction="horizontal" className="justify-between items-center py-2">
                  <Stack>
                    <Body className="font-weight-medium">Show Reviews</Body>
                    <Body size="sm" className=" text-ink-500">Display your reviews publicly</Body>
                  </Stack>
                  <Switch
                    checked={settings.show_reviews}
                    onChange={(e) => setSettings({ ...settings, show_reviews: e.target.checked })}
                  />
                </Stack>

                <Button variant="solid" onClick={handleSaveSettings} disabled={isUpdatingSettings}>
                  {isUpdatingSettings ? 'Saving...' : 'Save Settings'}
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
                      className="justify-between items-center py-2 border-b border-ink-100"
                    >
                      <Stack direction="horizontal" gap={3} className="items-center">
                        <Stack className="w-10 h-10 bg-ink-200 rounded-avatar flex items-center justify-center">
                          {blocked.user_avatar ? (
                            <Image
                              src={blocked.user_avatar}
                              alt={blocked.user_name}
                              width={40}
                              height={40}
                              className="w-full h-full rounded-avatar object-cover"
                            />
                          ) : (
                            <Body>{blocked.user_name.charAt(0)}</Body>
                          )}
                        </Stack>
                        <Stack>
                          <Body className="font-weight-medium">{blocked.user_name}</Body>
                          <Body className="text-mono-xs text-ink-500">
                            Blocked {new Date(blocked.blocked_at).toLocaleDateString()}
                          </Body>
                        </Stack>
                      </Stack>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUnblock(blocked.user_id)}
                        disabled={isUnblockingUser}
                      >
                        {isUnblockingUser ? 'Unblocking...' : 'Unblock'}
                      </Button>
                    </Stack>
                  ))}
                </Stack>
              ) : (
                <Body className="text-ink-500 text-center py-4">
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
                        <Body className="font-weight-medium">{report.reported_user_name}</Body>
                        {getStatusBadge(report.status)}
                      </Stack>
                      <Body size="sm" className=" text-ink-600">{report.reason}</Body>
                      <Body className="text-mono-xs text-ink-600 mt-2">
                        {new Date(report.created_at).toLocaleDateString()}
                      </Body>
                    </Card>
                  ))}
                </Stack>
              ) : (
                <Body className="text-ink-500 text-center py-4">
                  No reports submitted
                </Body>
              )}
            </Card>

            <Card className="p-6 bg-ink-50">
              <H3 className="mb-4">NEED HELP?</H3>
              <Body className="text-ink-600 mb-4">
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
              <Body className="text-ink-600">
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
                <Button variant="solid" disabled={isBlockingUser} onClick={handleBlock}>
                  {isBlockingUser ? 'Blocking...' : 'Block User'}
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
                <Button variant="solid" disabled={isReportingUser} onClick={handleReport}>
                  {isReportingUser ? 'Submitting...' : 'Submit Report'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowReportModal(false)}>
                  Cancel
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </Modal>
          </Stack>
    </GvtewayAppLayout>
  );
}
