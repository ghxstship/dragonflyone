"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GvtewayLoadingLayout } from "@/components/app-layout";
import {
  H2,
  Body,
  StatCard,
  Select,
  Button,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  EmptyState,
  Grid,
  Stack,
  Card,
  Input,
  Field,
  Kicker,
  MainContent,
  Container,
} from "@ghxstship/ui";
import { useForumsData } from "@/hooks/useForums";

import { DEMO_FORUM_CATEGORIES } from "@/lib/demo-data";

const DEMO_CATEGORIES = DEMO_FORUM_CATEGORIES;

export default function ForumsPage() {
  const router = useRouter();
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const categories = DEMO_CATEGORIES;

  const {
    threads,
    summary,
    isLoading: loading,
    error,
  } = useForumsData({ category: filterCategory, search: searchQuery });

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return <GvtewayLoadingLayout text="Loading forums..." />;
  }

  if (error) {
    return (
      <>
        <EmptyState
          title="Error Loading Forums"
          description={error instanceof Error ? error.message : String(error)}
          action={{ label: "Retry", onClick: () => window.location.reload() }}
          inverted
        />
      </>
    );
  }

  return (
    <>
      <MainContent padding="lg">
        <Container>
          <Stack gap={8}>
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Connect & Share</Kicker>
              <H2 size="lg" className="text-white">Community Forums</H2>
              <Body className="text-on-dark-muted">
                Discuss events, share experiences, and connect with other fans
              </Body>
            </Stack>

            <Grid cols={4} gap={6} className="sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                value={(summary?.total_threads || 0).toString()}
                label="Discussions"
                inverted
              />
              <StatCard
                value={(summary?.total_posts || 0).toString()}
                label="Posts"
                inverted
              />
              <StatCard
                value={(summary?.active_users || 0).toString()}
                label="Active Users"
                inverted
              />
              <StatCard
                value={(summary?.new_today || 0).toString()}
                label="New Today"
                inverted
              />
            </Grid>

          <Card inverted variant="elevated">
            <Stack gap={4}>
              <H2 className="text-white">Categories</H2>
              <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
                {categories.map((cat) => (
                  <Card 
                    key={cat.id} 
                    inverted
                    interactive
                    onClick={() => setFilterCategory(cat.id)}
                  >
                    <Stack gap={2}>
                      <Body className="font-display text-white">{cat.name}</Body>
                      <Body size="sm" className="text-on-dark-muted">{cat.description}</Body>
                      <Body size="sm" className="font-mono text-on-dark-disabled">
                        {cat.thread_count} threads • {cat.post_count} posts
                      </Body>
                    </Stack>
                  </Card>
                ))}
              </Grid>
            </Stack>
          </Card>

          <Stack gap={4} direction="horizontal">
            <Field className="flex-1">
              <Input
                placeholder="Search discussions..."
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
              <option value="general">General Discussion</option>
              <option value="events">Event Talk</option>
              <option value="reviews">Reviews</option>
              <option value="tickets">Tickets & Sales</option>
              <option value="meetups">Meetups</option>
            </Select>
            <Button variant="outlineInk" onClick={() => router.push("/forums/new")}>
              New Thread
            </Button>
          </Stack>

          {threads.length === 0 ? (
            <EmptyState
              title="No Discussions Found"
              description="Start a new discussion"
              action={{ label: "Create Thread", onClick: () => router.push("/forums/new") }}
              inverted
            />
          ) : (
            <Card inverted className="overflow-hidden p-0">
              <Table variant="dark">
                <TableHeader>
                  <TableRow>
                    <TableHead>Discussion</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Replies</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Last Activity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {threads.map((thread: { id: string; title: string; category: string; author_name: string; reply_count: number; view_count: number; last_reply_at: string; last_reply_by?: string; is_pinned: boolean; is_locked: boolean; created_at: string }) => (
                    <TableRow 
                      key={thread.id} 
                      className="cursor-pointer"
                      onClick={() => router.push(`/forums/${thread.id}`)}
                    >
                      <TableCell>
                        <Stack gap={1}>
                          <Stack gap={2} direction="horizontal" className="items-center">
                            {thread.is_pinned && <Badge variant="solid">Pinned</Badge>}
                            {thread.is_locked && <Badge variant="ghost">Locked</Badge>}
                            <Body className="font-display text-white">{thread.title}</Body>
                          </Stack>
                          <Body size="sm" className="text-on-dark-disabled">
                            by {thread.author_name} • {formatTimeAgo(thread.created_at)}
                          </Body>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{thread.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Body className="font-mono text-on-dark-muted">{thread.reply_count}</Body>
                      </TableCell>
                      <TableCell>
                        <Body className="font-mono text-on-dark-muted">{thread.view_count}</Body>
                      </TableCell>
                      <TableCell>
                        <Stack gap={1}>
                          <Body size="sm" className="text-on-dark-muted">{formatTimeAgo(thread.last_reply_at)}</Body>
                          {thread.last_reply_by && (
                            <Body size="sm" className="font-mono text-on-dark-disabled">by {thread.last_reply_by}</Body>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
          </Stack>
        </Container>
      </MainContent>
    </>
  );
}
