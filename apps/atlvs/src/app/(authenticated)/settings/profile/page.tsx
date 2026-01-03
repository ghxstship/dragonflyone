"use client";

/**
 * Profile Settings Page
 * Manage personal profile information
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
  Form,
  Textarea,
} from "@ghxstship/ui";
import Image from "next/image";
import {
  User,
  Mail,
  Phone,
  Camera,
  Save,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  avatar_url?: string;
}

async function fetchProfile(): Promise<UserProfile> {
  const response = await fetch("/api/settings/profile");
  if (!response.ok) {
    return {
      id: "demo",
      name: "Demo User",
      email: "demo@example.com",
      phone: "",
      bio: "",
    };
  }
  const data = await response.json();
  return data.profile || data;
}

async function updateProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
  const response = await fetch("/api/settings/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  });
  if (!response.ok) throw new Error("Failed to update profile");
  return response.json();
}

export default function ProfileSettingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ["user-profile"],
    queryFn: fetchProfile,
  });

  const [formData, setFormData] = useState<Partial<UserProfile>>({});

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      setSuccessMessage("Profile updated successfully");
      setTimeout(() => setSuccessMessage(null), 3000);
    },
  });

  const handleChange = (field: keyof UserProfile, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const displayData = { ...profile, ...formData };

  if (isLoading) {
    return (
      <SettingsPageLayout
        title="Profile Settings"
        description="Manage your personal profile information"
        maxWidth="lg"
      >
        <Stack gap={4} className="animate-pulse">
          <Box className="h-48 bg-surface-secondary rounded-card" />
          <Box className="h-64 bg-surface-secondary rounded-card" />
        </Stack>
      </SettingsPageLayout>
    );
  }

  if (error) {
    return (
      <SettingsPageLayout
        title="Profile Settings"
        description="Manage your personal profile information"
        maxWidth="lg"
      >
        <Alert variant="error">
          {error instanceof Error ? error.message : "Failed to load profile"}
        </Alert>
      </SettingsPageLayout>
    );
  }

  return (
    <SettingsPageLayout
      title="Profile Settings"
      description="Manage your personal profile information"
      maxWidth="lg"
    >
      <Stack gap={6}>
        {successMessage && (
          <Alert variant="success" className="mb-6">
            {successMessage}
          </Alert>
        )}

        {mutation.error && (
          <Alert variant="error" className="mb-6">
            {mutation.error instanceof Error ? mutation.error.message : "Failed to update profile"}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Card className="p-6 mb-6">
            <SectionHeader
              title="Profile Photo"
              description="Upload a profile picture"
            />
            <Box className="flex items-center gap-6 mt-4">
              <Box className="size-24 rounded-avatar bg-surface-secondary flex items-center justify-center overflow-hidden">
                {displayData.avatar_url ? (
                  <Image
                    src={displayData.avatar_url}
                    alt="Profile"
                    width={96}
                    height={96}
                    className="size-full object-cover"
                  />
                ) : (
                  <User className="size-12 text-text-muted" />
                )}
              </Box>
              <Stack gap={2}>
                <Button variant="outline" type="button" data-testid="avatar-upload">
                  <Camera className="size-4 mr-2" />
                  Upload Photo
                </Button>
                <Body size="sm" className="text-text-muted">
                  JPG, PNG or GIF. Max 2MB.
                </Body>
                <Input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  data-testid="avatar-file-input"
                />
              </Stack>
            </Box>
          </Card>

          <Card className="p-6 mb-6">
            <SectionHeader
              title="Personal Information"
              description="Update your personal details"
            />
            <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2 mt-4">
              <Box>
                <Body size="sm" className="mb-2 font-weight-medium">
                  Full Name
                </Body>
                <Box className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted" />
                  <Input
                    name="name"
                    value={displayData.name || ""}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Your full name"
                    className="pl-10"
                  />
                </Box>
              </Box>

              <Box>
                <Body size="sm" className="mb-2 font-weight-medium">
                  Email Address
                </Body>
                <Box className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted" />
                  <Input
                    name="email"
                    type="email"
                    value={displayData.email || ""}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="you@example.com"
                    className="pl-10"
                  />
                </Box>
              </Box>

              <Box>
                <Body size="sm" className="mb-2 font-weight-medium">
                  Phone Number
                </Body>
                <Box className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted" />
                  <Input
                    name="phone"
                    type="tel"
                    value={displayData.phone || ""}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="pl-10"
                  />
                </Box>
              </Box>
            </Grid>
          </Card>

          <Card className="p-6 mb-6">
            <SectionHeader
              title="About"
              description="Tell others about yourself"
            />
            <Box className="mt-4">
              <Body size="sm" className="mb-2 font-weight-medium">
                Bio
              </Body>
              <Textarea
                name="bio"
                value={displayData.bio || ""}
                onChange={(e) => handleChange("bio", e.target.value)}
                placeholder="Write a short bio about yourself..."
                rows={4}
              />
            </Box>
          </Card>

          <Box className="flex justify-end gap-3">
            <Button
              variant="ghost"
              type="button"
              onClick={() => router.push("/settings")}
            >
              Cancel
            </Button>
            <Button
              variant="solid"
              type="submit"
              disabled={mutation.isPending}
            >
              <Save className="size-4 mr-2" />
              {mutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </Box>
        </Form>
      </Stack>
    </SettingsPageLayout>
  );
}
