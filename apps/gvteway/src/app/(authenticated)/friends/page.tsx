"use client";

import { useState } from "react";
import { Users, Search, UserPlus, List } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Body, Button, Card, Input, Grid, DetailPage, Section, Box} from "@ghxstship/ui";

interface Friend { id: string; name: string; events: number; }
const DEMO: Friend[] = [
  { id: "1", name: "Sarah Johnson", events: 5 },
  { id: "2", name: "Mike Chen", events: 3 },
];

export default function FriendsPage() {
  const [search, setSearch] = useState("");

  const { data: friends = [], isLoading, error, refetch } = useQuery({
    queryKey: ["friends"],
    queryFn: async () => { const r = await fetch("/api/friends"); if (!r.ok) return DEMO; return (await r.json()).friends?.length ? (await r.json()).friends : DEMO; },
  });

  const filtered = friends.filter((f: Friend) => f.name.toLowerCase().includes(search.toLowerCase()));

  const tabs = [{
    id: "friends", label: "Friends", icon: <List className="size-4" />,
    content: (
      <Section>
        <Box className="flex gap-4 items-center mb-6">
          <Box className="relative flex-1 max-w-md">
            <label htmlFor="friend-search" className="sr-only">Search friends</label>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted" />
            <Input id="friend-search" placeholder="Search friends..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </Box>
        </Box>
        {filtered.length === 0 ? (
          <Card className="p-8 text-center"><Users className="size-12 text-text-disabled mx-auto mb-4" /><Body className="font-weight-medium mb-2">No friends yet</Body><Body className="text-text-muted mb-4">Connect with other attendees</Body><Button variant="solid" icon={<UserPlus className="size-4" />} iconPosition="left">Find Friends</Button></Card>
        ) : (
          <Grid cols={3} gap={4} className="grid-cols-1 md:grid-cols-3">
            {filtered.map((friend: Friend) => (
              <Card key={friend.id} className="p-4">
                <Box className="flex items-center gap-4">
                  <Box className="size-12 bg-primary rounded-avatar flex items-center justify-center text-text-primary font-weight-bold">{friend.name[0]}</Box>
                  <Box><Body className="font-weight-bold">{friend.name}</Body><Body size="sm" className="text-text-muted">{friend.events} events together</Body></Box>
                </Box>
              </Card>
            ))}
          </Grid>
        )}
      </Section>
    ),
  }];

  return <DetailPage header={{ kicker: "Social", title: "Friends", description: "Your connections" }} loading={isLoading} error={error instanceof Error ? error : null} onRetry={refetch} tabs={tabs} actions={<Button variant="solid" icon={<UserPlus className="size-4" />} iconPosition="left">Add Friend</Button>} />;
}
