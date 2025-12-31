"use client";

/**
 * Person Detail Page
 * 
 * SSOT-compliant: Uses entity registry for status colors.
 */

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Pencil, Briefcase, FileText, Clock, Trash2,
} from "lucide-react";
import { 
  useAuthContext, 
  ATLVS_ADMIN_ROLES,
  PEOPLE_STATUS_COLORS,
} from "@ghxstship/config";
import {
  Badge, Body, Button, Card, DetailPage, Grid, StatCard, Section, SectionHeader, ConfirmDialog, useToast,
  type DetailPageTab,
} from "@ghxstship/ui";
import { usePersonQuery, useDeletePerson } from "@/hooks/usePeopleQuery";

const STATUS_COLORS = PEOPLE_STATUS_COLORS;

const TYPE_LABELS: Record<string, string> = {
  contact: "Contact",
  employee: "Employee",
  crew: "Crew",
  artist: "Artist",
  volunteer: "Volunteer",
  candidate: "Candidate",
};

export default function PersonDetailPage() {
  const router = useRouter();
  const params = useParams();
  const personId = params?.id as string;
  const toast = useToast();

  const { hasRole } = useAuthContext();
  const canEdit = ATLVS_ADMIN_ROLES.some((role) => hasRole(role));

  const { data: person, isLoading, error, refetch } = usePersonQuery(personId);
  const deleteMutation = useDeletePerson();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleDelete = async () => {
    if (!person) return;
    try {
      await deleteMutation.mutateAsync(person.id);
      toast.success("Person Deleted", `${person.display_name} has been deleted.`);
      router.push("/people");
    } catch (err) {
      toast.error("Failed to Delete", err instanceof Error ? err.message : "An error occurred",);
    }
  };

  // Define tabs for the detail page
  const tabs: DetailPageTab[] = [
    {
      id: "overview",
      label: "Overview",
      content: person ? (
        <>
          {/* Stats */}
          <Grid cols={4} gap={4} className="grid-cols-2 lg:grid-cols-4 mb-6">
            <StatCard label="Type" value={TYPE_LABELS[person.primary_type] || person.primary_type} />
            <StatCard label="Status" value={person.status} />
            <StatCard label="Created" value={formatDate(person.created_at)} />
            <StatCard label="Last Updated" value={formatDate(person.updated_at)} />
          </Grid>

          {/* Contact Information */}
          <Section border className="mb-6">
            <SectionHeader title="Contact Information" />
            <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2">
              <Card inverted className="p-4">
                <Body size="xs" className="text-on-dark-muted mb-1">Email</Body>
                <Body className="text-white">{person.email || "Not provided"}</Body>
              </Card>
              <Card inverted className="p-4">
                <Body size="xs" className="text-on-dark-muted mb-1">Phone</Body>
                <Body className="text-white">{person.phone || "Not provided"}</Body>
              </Card>
              <Card inverted className="p-4">
                <Body size="xs" className="text-on-dark-muted mb-1">Location</Body>
                <Body className="text-white">
                  {person.artist_profile?.hometown || person.crew_profile?.department || "Not provided"}
                </Body>
              </Card>
              <Card inverted className="p-4">
                <Body size="xs" className="text-on-dark-muted mb-1">Organization</Body>
                <Body className="text-white">
                  {person.contact_profile?.company || person.artist_profile?.management_company || "Not provided"}
                </Body>
              </Card>
            </Grid>
          </Section>

          {/* Professional Details */}
          <Section border className="mb-6">
            <SectionHeader title="Professional Details" />
            <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2">
              <Card inverted className="p-4">
                <Body size="xs" className="text-on-dark-muted mb-1">Title</Body>
                <Body className="text-white">
                  {person.title || person.contact_profile?.job_title || "Not provided"}
                </Body>
              </Card>
              <Card inverted className="p-4">
                <Body size="xs" className="text-on-dark-muted mb-1">Department</Body>
                <Body className="text-white">
                  {person.contact_profile?.department || person.crew_profile?.department || "Not provided"}
                </Body>
              </Card>
            </Grid>
          </Section>

          {/* Notes */}
          {person.notes && (
            <Section border>
              <SectionHeader title="Notes" />
              <Card inverted className="p-4">
                <Body className="text-white whitespace-pre-wrap">{person.notes}</Body>
              </Card>
            </Section>
          )}
        </>
      ) : null,
    },
    {
      id: "assignments",
      label: "Assignments",
      icon: <Briefcase className="size-4" />,
      content: (
        <Section border>
          <SectionHeader title="Assignments" />
          <Card inverted className="p-6">
            <Body className="text-on-dark-muted">Assignment history will be displayed here.</Body>
          </Card>
        </Section>
      ),
    },
    {
      id: "documents",
      label: "Documents",
      icon: <FileText className="size-4" />,
      content: (
        <Section border>
          <SectionHeader title="Documents" />
          <Card inverted className="p-6">
            <Body className="text-on-dark-muted">Documents will be displayed here.</Body>
          </Card>
        </Section>
      ),
    },
    {
      id: "timeline",
      label: "Timeline",
      icon: <Clock className="size-4" />,
      content: (
        <Section border>
          <SectionHeader title="Activity Timeline" />
          <Card inverted className="p-6">
            <Body className="text-on-dark-muted">Activity timeline will be displayed here.</Body>
          </Card>
        </Section>
      ),
    },
  ];

  return (
    <>
      <DetailPage
        header={{
          kicker: person?.primary_type ? TYPE_LABELS[person.primary_type] : "Person",
          title: person?.display_name || "Person Details",
          description: person?.email || undefined,
          badge: person?.status ? (
            <Badge variant={STATUS_COLORS[person.status] || "outline"}>
              {person.status}
            </Badge>
          ) : undefined,
        }}
        backButton={{ label: "Back to People", href: "/people" }}
        loading={isLoading}
        error={error instanceof Error ? error : null}
        onRetry={refetch}
        notFound={!isLoading && !error && !person}
        notFoundMessage="The person you're looking for doesn't exist or has been removed."
        tabs={tabs}
        actions={
          canEdit ? (
            <>
              <Button
                variant="solid"
                onClick={() => router.push(`/people/${personId}/edit`)}
                icon={<Pencil className="size-4" />}
                iconPosition="left"
              >
                Edit
              </Button>
              <Button
                variant="outline"
                inverted
                onClick={() => setDeleteConfirmOpen(true)}
                icon={<Trash2 className="size-4" />}
                iconPosition="left"
                className="border-error text-error hover:bg-error hover:text-white"
              >
                Delete
              </Button>
            </>
          ) : undefined
        }
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Person"
        message={`Are you sure you want to delete "${person?.display_name}"? This action cannot be undone.`}
        variant="danger"
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </>
  );
}
