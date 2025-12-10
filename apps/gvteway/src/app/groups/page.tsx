"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GvtewayAppLayout, GvtewayLoadingLayout, GvtewayEmptyLayout } from "@/components/app-layout";
import {
  H2,
  Body,
  StatCard,
  Select,
  Button,
  Badge,
  Grid,
  Stack,
  Card,
  Input,
  Field,
  useNotifications,
  Kicker,
  EmptyState,
} from "@ghxstship/ui";
import { useGroupsData } from "@/hooks/useGroups";

export default function GroupsPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const {
    groups,
    summary,
    isLoading: loading,
    error,
    joinGroup,
    leaveGroup,
    refetch,
  } = useGroupsData({ category: filterCategory, search: searchQuery });

  const handleJoinGroup = async (groupId: string) => {
    await joinGroup(groupId);
    addNotification({ type: "success", title: "Joined!", message: "You've joined the group" });
  };

  const handleLeaveGroup = async (groupId: string) => {
    await leaveGroup(groupId);
    addNotification({ type: "success", title: "Left", message: "You've left the group" });
  };

  if (loading) {
    return <GvtewayLoadingLayout text="Loading groups..." />;
  }

  if (error) {
    return (
      <GvtewayEmptyLayout
        title="Error Loading Groups"
        description={error instanceof Error ? error.message : String(error)}
        action={{ label: "Retry", onClick: () => refetch() }}
      />
    );
  }

  return (
    <GvtewayAppLayout>
          <Stack gap={8}>
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Community</Kicker>
              <H2 size="lg" className="text-white">Groups</H2>
              <Body className="text-on-dark-muted">
                Connect with fans who share your interests
              </Body>
            </Stack>

            <Grid cols={4} gap={6}>
              <StatCard
                value={(summary?.total_groups || 0).toString()}
                label="Total Groups"
                inverted
              />
              <StatCard
                value={(summary?.my_groups || 0).toString()}
                label="My Groups"
                inverted
              />
              <StatCard
                value={(summary?.trending_count || 0).toString()}
                label="Trending"
                inverted
              />
              <StatCard
                value={(summary?.new_this_week || 0).toString()}
                label="New This Week"
                inverted
              />
            </Grid>

          <Stack gap={4} direction="horizontal">
            <Field className="flex-1">
              <Input
                placeholder="Search groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                inverted
              />
            </Field>
            <Select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              inverted
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
              inverted
            />
          ) : (
            <Grid cols={3} gap={6}>
              {groups.map((group) => (
                <Card key={group.id} inverted interactive>
                  <Stack gap={4}>
                    <Stack gap={2}>
                      <Stack gap={2} direction="horizontal" className="items-start justify-between">
                        <H2 className="text-body-md">{group.name}</H2>
                        {group.is_private && (
                          <Badge variant="ghost">Private</Badge>
                        )}
                      </Stack>
                      <Body size="sm" className="text-on-dark-muted line-clamp-2">
                        {group.description}
                      </Body>
                    </Stack>

                    <Stack gap={2}>
                      <Badge variant="outline">{group.category}</Badge>
                      <Stack gap={1} direction="horizontal" className="text-on-dark-disabled">
                        <Body>{group.member_count} members</Body>
                        <Body>•</Body>
                        <Body>{group.event_count} events</Body>
                      </Stack>
                    </Stack>

                    <Stack gap={2} direction="horizontal">
                      {group.is_member ? (
                        <>
                          <Button 
                            variant="outlineInk" 
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
                          inverted
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
            <Button variant="outlineInk" onClick={() => router.push("/groups/new")}>
              Create a Group
            </Button>
          </Stack>
          </Stack>
    </GvtewayAppLayout>
  );
}
