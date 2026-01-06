"use client";

/**
 * Profile Page
 * User profile management
 * Uses DetailPage template for consistent layout
 */

import { useState } from "react";
import { User, Mail, Phone, MapPin, Camera, List, Shield } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Body, Button, Card, Input, Grid, DetailPage, Section, SectionHeader, Box, Stack} from "@ghxstship/ui";

interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  role: string;
  joined: string;
  avatar: string;
}

const DEMO_PROFILE: Profile = {
  id: "1",
  name: "John Smith",
  email: "john@example.com",
  phone: "+1 555-123-4567",
  location: "Los Angeles, CA",
  role: "Production Manager",
  joined: "2023-01-15",
  avatar: "",
};

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Profile>>({});

  const { data: profile = DEMO_PROFILE, isLoading, error, refetch } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await fetch("/api/profile");
      if (!response.ok) return DEMO_PROFILE;
      const data = await response.json();
      return data.profile || DEMO_PROFILE;
    },
  });

  const updateProfile = useMutation({
    mutationFn: async (data: Partial<Profile>) => {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update profile");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setIsEditing(false);
    },
  });

  const handleEdit = () => {
    setFormData(profile);
    setIsEditing(true);
  };

  const handleSave = () => {
    updateProfile.mutate(formData);
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const tabs = [
    {
      id: "profile",
      label: "Profile",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <Card className="p-6">
            <Box className="flex items-start gap-6 mb-6">
              <Box className="size-24 bg-primary rounded-avatar flex items-center justify-center relative">
                <User className="size-12 text-white" />
                <Button variant="ghost" size="sm" className="absolute -bottom-1 -right-1 bg-surface-elevated rounded-avatar p-2" aria-label="Change profile photo">
                  <Camera className="size-4" />
                </Button>
              </Box>
              <Box className="flex-1">
                {isEditing ? (
                  <Stack gap={4}>
                    <Box>
                      <Body size="sm" className="mb-1">Name</Body>
                      <Input value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </Box>
                    <Box>
                      <Body size="sm" className="mb-1">Role</Body>
                      <Input value={formData.role || ""} onChange={(e) => setFormData({ ...formData, role: e.target.value })} />
                    </Box>
                  </Stack>
                ) : (
                  <>
                    <Body className="font-weight-bold">{profile.name}</Body>
                    <Body className="text-text-muted">{profile.role}</Body>
                    <Body size="sm" className="text-text-disabled mt-2">Member since {formatDate(profile.joined)}</Body>
                  </>
                )}
              </Box>
              {!isEditing && <Button variant="outline" onClick={handleEdit}>Edit Profile</Button>}
            </Box>

            <Box className="border-t border-border pt-6">
              <SectionHeader title="Contact Information" />
              <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2 mt-4">
                <Box>
                  <Body size="sm" className="text-text-muted mb-1">Email</Body>
                  {isEditing ? (
                    <Input value={formData.email || ""} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  ) : (
                    <Box className="flex items-center gap-2"><Mail className="size-4 text-text-muted" /><Body>{profile.email}</Body></Box>
                  )}
                </Box>
                <Box>
                  <Body size="sm" className="text-text-muted mb-1">Phone</Body>
                  {isEditing ? (
                    <Input value={formData.phone || ""} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                  ) : (
                    <Box className="flex items-center gap-2"><Phone className="size-4 text-text-muted" /><Body>{profile.phone}</Body></Box>
                  )}
                </Box>
                <Box>
                  <Body size="sm" className="text-text-muted mb-1">Location</Body>
                  {isEditing ? (
                    <Input value={formData.location || ""} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                  ) : (
                    <Box className="flex items-center gap-2"><MapPin className="size-4 text-text-muted" /><Body>{profile.location}</Body></Box>
                  )}
                </Box>
              </Grid>
            </Box>

            {isEditing && (
              <Box className="flex gap-4 mt-6 pt-6 border-t border-border">
                <Button variant="solid" onClick={handleSave} disabled={updateProfile.isPending}>
                  {updateProfile.isPending ? "Saving..." : "Save Changes"}
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
              </Box>
            )}
          </Card>
        </Section>
      ),
    },
    {
      id: "security",
      label: "Security",
      icon: <Shield className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Security Settings" description="Manage your account security" />
          <Card className="p-6 mt-4">
            <Stack gap={6}>
              <Box className="flex items-center justify-between">
                <Box>
                  <Body className="font-weight-medium">Password</Body>
                  <Body size="sm" className="text-text-muted">Last changed 30 days ago</Body>
                </Box>
                <Button variant="outline">Change Password</Button>
              </Box>
              <Box className="flex items-center justify-between">
                <Box>
                  <Body className="font-weight-medium">Two-Factor Authentication</Body>
                  <Body size="sm" className="text-text-muted">Add an extra layer of security</Body>
                </Box>
                <Button variant="outline">Enable</Button>
              </Box>
            </Stack>
          </Card>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{ kicker: "Account", title: "Profile", description: "Manage your personal information" }}
      loading={isLoading}
      error={error instanceof Error ? error : null}
      onRetry={refetch}
      tabs={tabs}
    />
  );
}
