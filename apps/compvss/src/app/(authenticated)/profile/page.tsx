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
  Body, Button, Card, Input, Grid, DetailPage, Section, SectionHeader} from "@ghxstship/ui";

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
            <div className="flex items-start gap-6 mb-6">
              <div className="size-24 bg-primary rounded-avatar flex items-center justify-center relative">
                <User className="size-12 text-white" />
                <Button variant="ghost" size="sm" className="absolute -bottom-1 -right-1 bg-grey-800 rounded-avatar p-2">
                  <Camera className="size-4" />
                </Button>
              </div>
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Body size="sm" className="mb-1">Name</Body>
                      <Input value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div>
                      <Body size="sm" className="mb-1">Role</Body>
                      <Input value={formData.role || ""} onChange={(e) => setFormData({ ...formData, role: e.target.value })} />
                    </div>
                  </div>
                ) : (
                  <>
                    <Body className="font-weight-bold">{profile.name}</Body>
                    <Body className="text-on-dark-muted">{profile.role}</Body>
                    <Body size="sm" className="text-on-dark-disabled mt-2">Member since {formatDate(profile.joined)}</Body>
                  </>
                )}
              </div>
              {!isEditing && <Button variant="outline" onClick={handleEdit}>Edit Profile</Button>}
            </div>

            <div className="border-t border-grey-800 pt-6">
              <SectionHeader title="Contact Information" />
              <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2 mt-4">
                <div>
                  <Body size="sm" className="text-on-dark-muted mb-1">Email</Body>
                  {isEditing ? (
                    <Input value={formData.email || ""} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  ) : (
                    <div className="flex items-center gap-2"><Mail className="size-4 text-on-dark-muted" /><Body>{profile.email}</Body></div>
                  )}
                </div>
                <div>
                  <Body size="sm" className="text-on-dark-muted mb-1">Phone</Body>
                  {isEditing ? (
                    <Input value={formData.phone || ""} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                  ) : (
                    <div className="flex items-center gap-2"><Phone className="size-4 text-on-dark-muted" /><Body>{profile.phone}</Body></div>
                  )}
                </div>
                <div>
                  <Body size="sm" className="text-on-dark-muted mb-1">Location</Body>
                  {isEditing ? (
                    <Input value={formData.location || ""} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                  ) : (
                    <div className="flex items-center gap-2"><MapPin className="size-4 text-on-dark-muted" /><Body>{profile.location}</Body></div>
                  )}
                </div>
              </Grid>
            </div>

            {isEditing && (
              <div className="flex gap-4 mt-6 pt-6 border-t border-grey-800">
                <Button variant="solid" onClick={handleSave} disabled={updateProfile.isPending}>
                  {updateProfile.isPending ? "Saving..." : "Save Changes"}
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
              </div>
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
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Body className="font-weight-medium">Password</Body>
                  <Body size="sm" className="text-on-dark-muted">Last changed 30 days ago</Body>
                </div>
                <Button variant="outline">Change Password</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Body className="font-weight-medium">Two-Factor Authentication</Body>
                  <Body size="sm" className="text-on-dark-muted">Add an extra layer of security</Body>
                </div>
                <Button variant="outline">Enable</Button>
              </div>
            </div>
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
