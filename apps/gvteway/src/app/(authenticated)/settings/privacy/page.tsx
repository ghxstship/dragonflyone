"use client";

/**
 * GVTEWAY Privacy Settings Page
 * Control privacy settings and manage blocked users
 * Uses DetailPage template for consistent layout
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Body,
  Box,
  Button,
  Card,
  Input,
  Textarea,
  Select,
  Badge,
  Switch,
  Modal,
  Stack,
  useToast,
  DetailPage,
  Section,
  SectionHeader,
} from "@ghxstship/ui";
import Image from "next/image";
import { usePrivacyData, type PrivacySettings } from "@/hooks/usePrivacySettings";
import { Shield, UserX, Flag, Save, Plus, HelpCircle } from "lucide-react";

export default function PrivacySettingsPage() {
  const router = useRouter();
  const toast = useToast();
  const {
    blockedUsers,
    reports,
    settings: fetchedSettings,
    isLoading,
    error,
    updateSettings,
    isUpdatingSettings,
    blockUser,
    isBlockingUser,
    unblockUser,
    isUnblockingUser,
    reportUser,
    isReportingUser,
    refetch,
  } = usePrivacyData();

  const [showReportModal, setShowReportModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [settings, setSettings] = useState<PrivacySettings>(fetchedSettings);
  const [reportUserId, setReportUserId] = useState("");
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [blockUserId, setBlockUserId] = useState("");

  useEffect(() => {
    setSettings(fetchedSettings);
  }, [fetchedSettings]);

  const handleSaveSettings = async () => {
    try {
      await updateSettings(settings);
      toast.success("Saved", "Privacy settings saved");
    } catch (err) {
      toast.error("Error", err instanceof Error ? err.message : "Failed to save settings");
    }
  };

  const handleUnblock = async (userId: string) => {
    try {
      await unblockUser(userId);
      toast.success("Unblocked", "User unblocked");
    } catch (err) {
      toast.error("Error", err instanceof Error ? err.message : "Failed to unblock user");
    }
  };

  const handleBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await blockUser(blockUserId);
      toast.success("Blocked", "User blocked");
      setShowBlockModal(false);
      setBlockUserId("");
    } catch (err) {
      toast.error("Error", err instanceof Error ? err.message : "Failed to block user");
    }
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await reportUser({
        reported_user_id: reportUserId,
        reason: reportReason,
        details: reportDetails,
      });
      toast.success("Submitted", "Report submitted. We will review it shortly.");
      setShowReportModal(false);
      setReportUserId("");
      setReportReason("");
      setReportDetails("");
    } catch (err) {
      toast.error("Error", err instanceof Error ? err.message : "Failed to submit report");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="warning">Pending</Badge>;
      case "reviewed":
        return <Badge variant="info">Reviewed</Badge>;
      case "resolved":
        return <Badge variant="success">Resolved</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const headerActions = (
    <Button
      variant="solid"
      onClick={handleSaveSettings}
      disabled={isUpdatingSettings}
      icon={<Save className="size-4" />}
      iconPosition="left"
    >
      {isUpdatingSettings ? "Saving..." : "Save Settings"}
    </Button>
  );

  const tabs = [
    {
      id: "privacy",
      label: "Privacy",
      icon: <Shield className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Privacy Settings" description="Control who can see your profile and activity" />
          <Card className="p-6">
            <Stack gap={6}>
              <Stack gap={2}>
                <Body size="sm" className="text-text-muted">Profile Visibility</Body>
                <Select
                  value={settings.profile_visibility}
                  onChange={(e) => setSettings({ ...settings, profile_visibility: e.target.value })}
                >
                  <option value="public">Public - Anyone can view</option>
                  <option value="fans">Fans Only - Only verified fans</option>
                  <option value="private">Private - Only you</option>
                </Select>
              </Stack>

              <Stack gap={2}>
                <Body size="sm" className="text-text-muted">Who Can Message You</Body>
                <Select
                  value={settings.allow_messages}
                  onChange={(e) => setSettings({ ...settings, allow_messages: e.target.value })}
                >
                  <option value="everyone">Everyone</option>
                  <option value="verified">Verified Fans Only</option>
                  <option value="none">No One</option>
                </Select>
              </Stack>

              <Stack direction="horizontal" className="items-center justify-between py-3 border-t border-border">
                <Stack gap={0}>
                  <Body className="font-weight-medium text-white">Show Activity</Body>
                  <Body size="sm" className="text-text-muted">Let others see your recent activity</Body>
                </Stack>
                <Switch
                  checked={settings.show_activity}
                  onChange={(e) => setSettings({ ...settings, show_activity: e.target.checked })}
                />
              </Stack>

              <Stack direction="horizontal" className="items-center justify-between py-3 border-t border-border">
                <Stack gap={0}>
                  <Body className="font-weight-medium text-white">Show Events Attended</Body>
                  <Body size="sm" className="text-text-muted">Display events on your profile</Body>
                </Stack>
                <Switch
                  checked={settings.show_events_attended}
                  onChange={(e) => setSettings({ ...settings, show_events_attended: e.target.checked })}
                />
              </Stack>

              <Stack direction="horizontal" className="items-center justify-between py-3 border-t border-border">
                <Stack gap={0}>
                  <Body className="font-weight-medium text-white">Show Reviews</Body>
                  <Body size="sm" className="text-text-muted">Display your reviews publicly</Body>
                </Stack>
                <Switch
                  checked={settings.show_reviews}
                  onChange={(e) => setSettings({ ...settings, show_reviews: e.target.checked })}
                />
              </Stack>
            </Stack>
          </Card>
        </Section>
      ),
    },
    {
      id: "blocked",
      label: "Blocked Users",
      icon: <UserX className="size-4" />,
      content: (
        <Section>
          <Stack direction="horizontal" className="items-center justify-between mb-4">
            <SectionHeader title="Blocked Users" description="Users you have blocked" />
            <Button variant="outline" size="sm" onClick={() => setShowBlockModal(true)} icon={<Plus className="size-4" />} iconPosition="left">
              Block User
            </Button>
          </Stack>
          {blockedUsers.length > 0 ? (
            <Stack gap={3}>
              {blockedUsers.map((blocked) => (
                <Card key={blocked.id} className="p-4">
                  <Stack direction="horizontal" className="items-center justify-between">
                    <Stack direction="horizontal" gap={3} className="items-center">
                      <Box className="w-10 h-10 bg-border rounded-avatar flex items-center justify-center">
                        {blocked.user_avatar ? (
                          <Image
                            src={blocked.user_avatar}
                            alt={blocked.user_name}
                            width={40}
                            height={40}
                            className="w-full h-full rounded-avatar object-cover"
                          />
                        ) : (
                          <Body className="text-white">{blocked.user_name.charAt(0)}</Body>
                        )}
                      </Box>
                      <Stack gap={0}>
                        <Body className="font-weight-medium text-white">{blocked.user_name}</Body>
                        <Body size="sm" className="text-text-muted">
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
                      {isUnblockingUser ? "Unblocking..." : "Unblock"}
                    </Button>
                  </Stack>
                </Card>
              ))}
            </Stack>
          ) : (
            <Stack className="text-center py-12 items-center">
              <UserX className="size-12 text-text-disabled mx-auto mb-4" />
              <Body className="text-text-muted">No blocked users</Body>
            </Stack>
          )}
        </Section>
      ),
    },
    {
      id: "reports",
      label: "Reports",
      icon: <Flag className="size-4" />,
      content: (
        <Section>
          <Stack direction="horizontal" className="items-center justify-between mb-4">
            <SectionHeader title="Your Reports" description="Reports you have submitted" />
            <Button variant="outline" size="sm" onClick={() => setShowReportModal(true)} icon={<Plus className="size-4" />} iconPosition="left">
              Report User
            </Button>
          </Stack>
          {reports.length > 0 ? (
            <Stack gap={3}>
              {reports.map((report) => (
                <Card key={report.id} className="p-4">
                  <Stack direction="horizontal" className="items-start justify-between mb-2">
                    <Body className="font-weight-medium text-white">{report.reported_user_name}</Body>
                    {getStatusBadge(report.status)}
                  </Stack>
                  <Body size="sm" className="text-text-muted">{report.reason}</Body>
                  <Body size="sm" className="text-text-disabled mt-2">
                    {new Date(report.created_at).toLocaleDateString()}
                  </Body>
                </Card>
              ))}
            </Stack>
          ) : (
            <Stack className="text-center py-12 items-center">
              <Flag className="size-12 text-text-disabled mx-auto mb-4" />
              <Body className="text-text-muted">No reports submitted</Body>
            </Stack>
          )}

          <Card className="p-6 mt-6 bg-surface-elevated">
            <Stack direction="horizontal" gap={3} className="items-start">
              <HelpCircle className="size-6 text-text-muted flex-shrink-0" />
              <Stack gap={2}>
                <Body className="font-weight-medium text-white mb-2">Need Help?</Body>
                <Body size="sm" className="text-text-muted mb-4">
                  If you are experiencing harassment or safety concerns, please contact our support team.
                </Body>
                <Button variant="outline" onClick={() => router.push("/support/chat")}>
                  Contact Support
                </Button>
              </Stack>
            </Stack>
          </Card>
        </Section>
      ),
    },
  ];

  return (
    <>
      <DetailPage
        header={{
          kicker: "Settings",
          title: "Privacy & Safety",
          description: "Control your privacy settings and manage blocked users",
        }}
        loading={isLoading}
        error={error instanceof Error ? error : null}
        onRetry={refetch}
        tabs={tabs}
        actions={headerActions}
        backButton={{
          label: "Settings",
          href: "/settings",
        }}
      />

      <Modal
        open={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        title="Block User"
      >
        <Stack gap={4}>
          <Body className="text-text-muted">
            Blocked users cannot message you or see your activity.
          </Body>
          <Stack gap={2}>
            <Body size="sm" className="text-text-muted">Username or User ID</Body>
            <Input
              value={blockUserId}
              onChange={(e) => setBlockUserId(e.target.value)}
              placeholder="Enter username or ID"
            />
          </Stack>
          <Stack direction="horizontal" gap={4}>
            <Button variant="solid" disabled={isBlockingUser} onClick={handleBlock}>
              {isBlockingUser ? "Blocking..." : "Block User"}
            </Button>
            <Button variant="outline" onClick={() => setShowBlockModal(false)}>
              Cancel
            </Button>
          </Stack>
        </Stack>
      </Modal>

      <Modal
        open={showReportModal}
        onClose={() => setShowReportModal(false)}
        title="Report User"
      >
        <Stack gap={4}>
          <Stack gap={2}>
            <Body size="sm" className="text-text-muted">Username or User ID</Body>
            <Input
              value={reportUserId}
              onChange={(e) => setReportUserId(e.target.value)}
              placeholder="Enter username or ID"
            />
          </Stack>

          <Stack gap={2}>
            <Body size="sm" className="text-text-muted">Reason</Body>
            <Select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
            >
              <option value="">Select a reason...</option>
              <option value="harassment">Harassment</option>
              <option value="spam">Spam</option>
              <option value="inappropriate">Inappropriate Content</option>
              <option value="impersonation">Impersonation</option>
              <option value="scam">Scam/Fraud</option>
              <option value="other">Other</option>
            </Select>
          </Stack>

          <Stack gap={2}>
            <Body size="sm" className="text-text-muted">Details</Body>
            <Textarea
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              placeholder="Provide additional details..."
              rows={4}
            />
          </Stack>

          <Stack direction="horizontal" gap={4}>
            <Button variant="solid" disabled={isReportingUser} onClick={handleReport}>
              {isReportingUser ? "Submitting..." : "Submit Report"}
            </Button>
            <Button variant="outline" onClick={() => setShowReportModal(false)}>
              Cancel
            </Button>
          </Stack>
        </Stack>
      </Modal>
    </>
  );
}
