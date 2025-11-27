"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ConsumerNavigationPublic } from "../../components/navigation";
import {
  H1,
  H2,
  Body,
  StatCard,
  Select,
  Button,
  Badge,
  LoadingSpinner,
  EmptyState,
  Container,
  Grid,
  Stack,
  Card,
  Section,
  Input,
  Field,
  useNotifications,
} from "@ghxstship/ui";

interface Group {
  id: string;
  name: string;
  description: string;
  category: string;
  member_count: number;
  event_count: number;
  image_url?: string;
  is_private: boolean;
  is_member: boolean;
  created_at: string;
  admin_name: string;
}

interface GroupSummary {
  total_groups: number;
  my_groups: number;
  trending_count: number;
  new_this_week: number;
}

export default function GroupsPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const [groups, setGroups] = useState<Group[]>([]);
  const [summary, setSummary] = useState<GroupSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterCategory !== "all") params.append("category", filterCategory);
      if (searchQuery) params.append("search", searchQuery);

      const response = await fetch(`/api/groups?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch groups");
      
      const data = await response.json();
      setGroups(data.groups || []);
      setSummary(data.summary || null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [filterCategory, searchQuery]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleJoinGroup = async (groupId: string) => {
    try {
      const response = await fetch(`/api/groups/${groupId}/join`, {
        method: "POST",
      });
      if (response.ok) {
        addNotification({ type: "success", title: "Joined!", message: "You've joined the group" });
        fetchGroups();
      }
    } catch (err) {
      addNotification({ type: "error", title: "Error", message: "Failed to join group" });
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    try {
      const response = await fetch(`/api/groups/${groupId}/leave`, {
        method: "POST",
      });
      if (response.ok) {
        addNotification({ type: "success", title: "Left", message: "You've left the group" });
        fetchGroups();
      }
    } catch (err) {
      addNotification({ type: "error", title: "Error", message: "Failed to leave group" });
    }
  };

  if (loading) {
    return (
      <Section className="relative min-h-screen bg-black text-white">
        <ConsumerNavigationPublic />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading groups..." />
        </Container>
      </Section>
    );
  }

  if (error) {
    return (
      <Section className="relative min-h-screen bg-black text-white">
        <ConsumerNavigationPublic />
        <Container className="py-16">
          <EmptyState
            title="Error Loading Groups"
            description={error}
            action={{ label: "Retry", onClick: fetchGroups }}
          />
        </Container>
      </Section>
    );
  }

  return (
    <Section className="relative min-h-screen bg-black text-white">
      <ConsumerNavigationPublic />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>Groups</H1>
            <Body className="text-grey-400">
              Connect with fans who share your interests
            </Body>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard
              value={summary?.total_groups || 0}
              label="Total Groups"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={summary?.my_groups || 0}
              label="My Groups"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={summary?.trending_count || 0}
              label="Trending"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={summary?.new_this_week || 0}
              label="New This Week"
              className="bg-black text-white border-grey-800"
            />
          </Grid>

          <Stack gap={4} direction="horizontal">
            <Field className="flex-1">
              <Input
                placeholder="Search groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-black text-white border-grey-700"
              />
            </Field>
            <Select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-black text-white border-grey-700"
            >
              <option value="all">All Categories</option>
              <option value="music">Music</option>
              <option value="sports">Sports</option>
              <option value="comedy">Comedy</option>
              <option value="theater">Theater</option>
              <option value="festivals">Festivals</option>
              <option value="local">Local Events</option>
            </Select>
          </Stack>

          {groups.length === 0 ? (
            <EmptyState
              title="No Groups Found"
              description="Create a new group or try different filters"
              action={{ label: "Create Group", onClick: () => router.push("/groups/new") }}
            />
          ) : (
            <Grid cols={3} gap={6}>
              {groups.map((group) => (
                <Card key={group.id} className="p-6 bg-black border-grey-800 hover:border-grey-700 transition-colors">
                  <Stack gap={4}>
                    <Stack gap={2}>
                      <Stack gap={2} direction="horizontal" className="justify-between items-start">
                        <H2 className="text-body-md">{group.name}</H2>
                        {group.is_private && (
                          <Badge variant="ghost">Private</Badge>
                        )}
                      </Stack>
                      <Body className="text-grey-400 text-body-sm line-clamp-2">
                        {group.description}
                      </Body>
                    </Stack>

                    <Stack gap={2}>
                      <Badge variant="outline">{group.category}</Badge>
                      <Stack gap={1} direction="horizontal" className="text-grey-500 text-body-sm">
                        <Body>{group.member_count} members</Body>
                        <Body>•</Body>
                        <Body>{group.event_count} events</Body>
                      </Stack>
                    </Stack>

                    <Stack gap={2} direction="horizontal">
                      {group.is_member ? (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => router.push(`/groups/${group.id}`)}
                            className="flex-1"
                          >
                            View Group
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleLeaveGroup(group.id)}
                          >
                            Leave
                          </Button>
                        </>
                      ) : (
                        <Button 
                          variant="solid" 
                          size="sm"
                          onClick={() => handleJoinGroup(group.id)}
                          className="flex-1"
                        >
                          Join Group
                        </Button>
                      )}
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </Grid>
          )}

          <Stack gap={3} direction="horizontal" className="justify-center">
            <Button variant="outlineWhite" onClick={() => router.push("/groups/new")}>
              Create a Group
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Section>
  );
}
