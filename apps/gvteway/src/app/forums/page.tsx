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
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
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

interface ForumThread {
  id: string;
  title: string;
  category: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  reply_count: number;
  view_count: number;
  last_reply_at: string;
  last_reply_by?: string;
  is_pinned: boolean;
  is_locked: boolean;
  created_at: string;
}

interface ForumCategory {
  id: string;
  name: string;
  description: string;
  thread_count: number;
  post_count: number;
}

interface ForumSummary {
  total_threads: number;
  total_posts: number;
  active_users: number;
  new_today: number;
}

export default function ForumsPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [summary, setSummary] = useState<ForumSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchForums = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterCategory !== "all") params.append("category", filterCategory);
      if (searchQuery) params.append("search", searchQuery);

      const response = await fetch(`/api/forums?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch forums");
      
      const data = await response.json();
      setThreads(data.threads || []);
      setCategories(data.categories || []);
      setSummary(data.summary || null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [filterCategory, searchQuery]);

  useEffect(() => {
    fetchForums();
  }, [fetchForums]);

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
    return (
      <Section className="relative min-h-screen bg-black text-white">
        <ConsumerNavigationPublic />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading forums..." />
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
            title="Error Loading Forums"
            description={error}
            action={{ label: "Retry", onClick: fetchForums }}
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
            <H1>Community Forums</H1>
            <Body className="text-grey-400">
              Discuss events, share experiences, and connect with other fans
            </Body>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard
              value={summary?.total_threads || 0}
              label="Discussions"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={summary?.total_posts || 0}
              label="Posts"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={summary?.active_users || 0}
              label="Active Users"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={summary?.new_today || 0}
              label="New Today"
              className="bg-black text-white border-grey-800"
            />
          </Grid>

          <Card className="p-6 bg-black border-grey-800">
            <Stack gap={4}>
              <H2>Categories</H2>
              <Grid cols={4} gap={4}>
                {categories.map((cat) => (
                  <Card 
                    key={cat.id} 
                    className="p-4 bg-grey-900 border-grey-700 cursor-pointer hover:border-grey-600"
                    onClick={() => setFilterCategory(cat.id)}
                  >
                    <Stack gap={2}>
                      <Body className="font-medium">{cat.name}</Body>
                      <Body className="text-grey-400 text-body-sm">{cat.description}</Body>
                      <Body className="text-grey-500 text-mono-xs">
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
                className="bg-black text-white border-grey-700"
              />
            </Field>
            <Select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-black text-white border-grey-700"
            >
              <option value="all">All Categories</option>
              <option value="general">General Discussion</option>
              <option value="events">Event Talk</option>
              <option value="reviews">Reviews</option>
              <option value="tickets">Tickets & Sales</option>
              <option value="meetups">Meetups</option>
            </Select>
            <Button variant="outlineWhite" onClick={() => router.push("/forums/new")}>
              New Thread
            </Button>
          </Stack>

          {threads.length === 0 ? (
            <EmptyState
              title="No Discussions Found"
              description="Start a new discussion"
              action={{ label: "Create Thread", onClick: () => router.push("/forums/new") }}
            />
          ) : (
            <Table variant="bordered" className="bg-black">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/2">Discussion</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Replies</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Last Activity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {threads.map((thread) => (
                  <TableRow 
                    key={thread.id} 
                    className="bg-black text-white hover:bg-grey-900 cursor-pointer"
                    onClick={() => router.push(`/forums/${thread.id}`)}
                  >
                    <TableCell>
                      <Stack gap={1}>
                        <Stack gap={2} direction="horizontal" className="items-center">
                          {thread.is_pinned && <Badge variant="solid">Pinned</Badge>}
                          {thread.is_locked && <Badge variant="ghost">Locked</Badge>}
                          <Body className="text-white font-medium">{thread.title}</Body>
                        </Stack>
                        <Body className="text-grey-500 text-body-sm">
                          by {thread.author_name} • {formatTimeAgo(thread.created_at)}
                        </Body>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{thread.category}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-grey-400">
                      {thread.reply_count}
                    </TableCell>
                    <TableCell className="font-mono text-grey-400">
                      {thread.view_count}
                    </TableCell>
                    <TableCell className="text-grey-400">
                      <Stack gap={1}>
                        <Body className="text-body-sm">{formatTimeAgo(thread.last_reply_at)}</Body>
                        {thread.last_reply_by && (
                          <Body className="text-grey-500 text-mono-xs">by {thread.last_reply_by}</Body>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Stack>
      </Container>
    </Section>
  );
}
