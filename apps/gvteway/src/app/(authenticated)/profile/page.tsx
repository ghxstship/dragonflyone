"use client";

import { useRouter } from "next/navigation";
import { User, Ticket, Heart, Settings, List } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Body, Button, Card, Grid, StatCard, DetailPage, Section, SectionHeader, Box} from "@ghxstship/ui";

interface Profile { name: string; email: string; tickets: number; wishlist: number; }
const DEMO: Profile = { name: "John Smith", email: "john@example.com", tickets: 5, wishlist: 12 };

export default function ProfilePage() {
  const router = useRouter();
  const { data: profile = DEMO, isLoading, error, refetch } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => { const r = await fetch("/api/profile"); if (!r.ok) return DEMO; return (await r.json()).profile || DEMO; },
  });

  const tabs = [{
    id: "profile", label: "Profile", icon: <List className="size-4" />,
    content: (
      <Section>
        <Card className="p-6 mb-6">
          <Box className="flex items-center gap-6">
            <Box className="size-20 bg-primary rounded-avatar flex items-center justify-center"><User className="size-10 text-white" /></Box>
            <Box><Body className="font-weight-bold">{profile.name}</Body><Body className="text-text-muted">{profile.email}</Body></Box>
          </Box>
        </Card>
        <Grid cols={2} gap={4} className="grid-cols-2 mb-6">
          <StatCard label="Tickets" value={profile.tickets.toString()} icon={<Ticket className="size-5" />} />
          <StatCard label="Wishlist" value={profile.wishlist.toString()} icon={<Heart className="size-5" />} />
        </Grid>
        <SectionHeader title="Quick Actions" />
        <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2 mt-4">
          <Card className="p-4 cursor-pointer hover:border-primary transition-colors" onClick={() => router.push("/account/profile")}><Box className="flex items-center gap-3"><Settings className="size-5 text-primary" /><Body className="font-weight-medium">Account Settings</Body></Box></Card>
          <Card className="p-4 cursor-pointer hover:border-primary transition-colors" onClick={() => router.push("/wishlist")}><Box className="flex items-center gap-3"><Heart className="size-5 text-primary" /><Body className="font-weight-medium">My Wishlist</Body></Box></Card>
        </Grid>
      </Section>
    ),
  }];

  return <DetailPage header={{ kicker: "Account", title: profile.name, description: profile.email }} loading={isLoading} error={error instanceof Error ? error : null} onRetry={refetch} tabs={tabs} actions={<Button variant="outline" icon={<Settings className="size-4" />} onClick={() => router.push("/account/profile")}>Settings</Button>} />;
}
