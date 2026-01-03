"use client";

/**
 * Account Settings Page
 * Password, security, and account management
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Body,
  Button,
  Card,
  Grid,
  Box,
  Stack,
  SettingsPageLayout,
  SectionHeader,
  Input,
  Alert,
  Badge,
  Form,
} from "@ghxstship/ui";
import {
  Lock,
  Shield,
  Trash2,
  Save,
  Key,
  Smartphone,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

async function updatePassword(data: PasswordForm): Promise<void> {
  const response = await fetch("/api/settings/password", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update password");
  }
}

async function deleteAccount(): Promise<void> {
  const response = await fetch("/api/settings/account", {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete account");
}

export default function AccountSettingsPage() {
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const passwordMutation = useMutation({
    mutationFn: updatePassword,
    onSuccess: () => {
      setSuccessMessage("Password updated successfully");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setSuccessMessage(null), 3000);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      router.push("/auth/signin");
    },
  });

  const handlePasswordChange = (field: keyof PasswordForm, value: string) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return;
    }
    passwordMutation.mutate(passwordForm);
  };

  const handleDeleteAccount = () => {
    if (showDeleteConfirm) {
      deleteMutation.mutate();
    } else {
      setShowDeleteConfirm(true);
    }
  };

  const handleToggle2FA = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
    setSuccessMessage(twoFactorEnabled ? "Two-factor authentication disabled" : "Two-factor authentication enabled");
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <SettingsPageLayout
      title="Account Settings"
      description="Manage your account security and preferences"
      maxWidth="lg"
    >
      <Stack gap={6}>
        {successMessage && (
          <Alert variant="success" className="mb-6">
            {successMessage}
          </Alert>
        )}

        {passwordMutation.error && (
          <Alert variant="error" className="mb-6">
            {passwordMutation.error instanceof Error ? passwordMutation.error.message : "Failed to update password"}
          </Alert>
        )}

        <Card className="p-6 mb-6" data-testid="change-password">
          <SectionHeader
            title="Change Password"
            description="Update your account password"
          />
          <Form onSubmit={handlePasswordSubmit}>
            <Stack gap={4} className="mt-4">
              <Box>
                <Body size="sm" className="mb-2 font-weight-medium">
                  Current Password
                </Body>
                <Box className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted" />
                  <Input
                    name="currentPassword"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                    placeholder="Enter current password"
                    className="pl-10"
                  />
                </Box>
              </Box>

              <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2">
                <Box>
                  <Body size="sm" className="mb-2 font-weight-medium">
                    New Password
                  </Body>
                  <Box className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted" />
                    <Input
                      name="newPassword"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                      placeholder="Enter new password"
                      className="pl-10"
                    />
                  </Box>
                </Box>

                <Box>
                  <Body size="sm" className="mb-2 font-weight-medium">
                    Confirm New Password
                  </Body>
                  <Box className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted" />
                    <Input
                      name="confirmPassword"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                      placeholder="Confirm new password"
                      className="pl-10"
                    />
                  </Box>
                </Box>
              </Grid>

              <Box className="flex justify-end">
                <Button
                  variant="solid"
                  type="submit"
                  disabled={passwordMutation.isPending || !passwordForm.currentPassword || !passwordForm.newPassword}
                >
                  <Save className="size-4 mr-2" />
                  {passwordMutation.isPending ? "Updating..." : "Update Password"}
                </Button>
              </Box>
            </Stack>
          </Form>
        </Card>

        <Card className="p-6 mb-6" data-testid="two-factor">
          <SectionHeader
            title="Two-Factor Authentication"
            description="Add an extra layer of security to your account"
          />
          <Box className="flex items-center justify-between mt-4">
            <Box className="flex items-center gap-4">
              <Box className={`p-3 rounded-card ${twoFactorEnabled ? "bg-success/10" : "bg-surface-secondary"}`}>
                <Smartphone className={`size-6 ${twoFactorEnabled ? "text-success" : "text-text-muted"}`} />
              </Box>
              <Box>
                <Body className="font-weight-medium">Authenticator App</Body>
                <Body size="sm" className="text-text-muted">
                  Use an authenticator app to generate verification codes
                </Body>
              </Box>
            </Box>
            <Box className="flex items-center gap-3">
              <Badge variant={twoFactorEnabled ? "success" : "outline"}>
                {twoFactorEnabled ? "Enabled" : "Disabled"}
              </Badge>
              <Button
                variant={twoFactorEnabled ? "outline" : "solid"}
                onClick={handleToggle2FA}
              >
                {twoFactorEnabled ? "Disable" : "Enable"}
              </Button>
            </Box>
          </Box>
        </Card>

        <Card className="p-6 mb-6" data-testid="connected-accounts">
          <SectionHeader
            title="Connected Accounts"
            description="Manage linked social accounts"
          />
          <Stack gap={4} className="mt-4">
            <Box className="flex items-center justify-between p-4 bg-surface-secondary rounded-card">
              <Box className="flex items-center gap-3">
                <Box className="p-2 bg-white rounded-card">
                  <Shield className="size-5 text-primary" />
                </Box>
                <Box>
                  <Body className="font-weight-medium">Google</Body>
                  <Body size="sm" className="text-text-muted">Not connected</Body>
                </Box>
              </Box>
              <Button variant="outline" data-testid="connect-google">
                Connect
              </Button>
            </Box>

            <Box className="flex items-center justify-between p-4 bg-surface-secondary rounded-card">
              <Box className="flex items-center gap-3">
                <Box className="p-2 bg-white rounded-card">
                  <Shield className="size-5 text-primary" />
                </Box>
                <Box>
                  <Body className="font-weight-medium">Microsoft</Body>
                  <Body size="sm" className="text-text-muted">Not connected</Body>
                </Box>
              </Box>
              <Button variant="outline">
                Connect
              </Button>
            </Box>
          </Stack>
        </Card>

        <Card className="p-6 border-error/20" data-testid="delete-account">
          <SectionHeader
            title="Delete Account"
            description="Permanently delete your account and all data"
          />
          <Box className="flex items-center justify-between mt-4">
            <Box>
              <Body className="text-text-muted">
                This action cannot be undone. All your data will be permanently removed.
              </Body>
            </Box>
            <Button
              variant="ghost"
              className="text-error"
              onClick={handleDeleteAccount}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="size-4 mr-2" />
              {showDeleteConfirm ? "Confirm Delete" : "Delete Account"}
            </Button>
          </Box>
          {showDeleteConfirm && (
            <Alert variant="error" className="mt-4">
              Are you sure? Click the button again to permanently delete your account.
            </Alert>
          )}
        </Card>
      </Stack>
    </SettingsPageLayout>
  );
}
