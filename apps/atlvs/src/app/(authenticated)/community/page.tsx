"use client";

/**
 * Community Page - Authenticated Experience
 * Full forum access with posting, discussions, and user profiles
 * Bold Contemporary Pop Art Adventure Design System
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  MessageSquare, Trophy, ThumbsUp, 
  MessageCircle, Eye, Clock, Plus,
  TrendingUp, Bookmark, Bell
} from "lucide-react";
import {
  HubPage, Card, Stack, Box, Body, Button, Badge, Avatar, Text
} from "@ghxstship/ui";
import { useAuthContext, ATLVS_ADMIN_ROLES } from "@ghxstship/config";

interface Discussion {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    initials: string;
    badge: string;
  };
  category: string;
  tags: string[];
  replies: number;
  views: number;
  likes: number;
  isPinned: boolean;
  isSolved: boolean;
  createdAt: string;
  lastActivity: string;
}

const DEMO_DISCUSSIONS: Discussion[] = [
  {
    id: "1",
    title: "Best practices for managing large-scale festival productions",
    content: "I'm looking for advice on how to effectively manage productions with 50+ vendors...",
    author: { id: "u1", name: "Sarah Mitchell", initials: "SM", badge: "Expert" },
    category: "Production Management",
    tags: ["festivals", "vendors", "best-practices"],
    replies: 45,
    views: 1247,
    likes: 89,
    isPinned: true,
    isSolved: true,
    createdAt: "2025-12-28T10:00:00Z",
    lastActivity: "2026-01-02T08:30:00Z",
  },
  {
    id: "2",
    title: "How to automate budget reconciliation workflows?",
    content: "We're spending too much time on manual budget reconciliation. Any tips for automation?",
    author: { id: "u2", name: "Michael Chen", initials: "MC", badge: "Pro" },
    category: "Finance",
    tags: ["budgets", "automation", "workflows"],
    replies: 32,
    views: 892,
    likes: 56,
    isPinned: false,
    isSolved: true,
    createdAt: "2025-12-30T14:00:00Z",
    lastActivity: "2026-01-01T16:45:00Z",
  },
  {
    id: "3",
    title: "Tips for onboarding new production crew members",
    content: "What's your process for getting new crew up to speed quickly?",
    author: { id: "u3", name: "Emily Rodriguez", initials: "ER", badge: "Rising Star" },
    category: "Team Management",
    tags: ["onboarding", "crew", "training"],
    replies: 28,
    views: 654,
    likes: 41,
    isPinned: false,
    isSolved: false,
    createdAt: "2025-12-31T09:00:00Z",
    lastActivity: "2026-01-02T11:20:00Z",
  },
  {
    id: "4",
    title: "Integrating ATLVS with external accounting software",
    content: "Has anyone successfully integrated with QuickBooks or Xero? Looking for guidance.",
    author: { id: "u4", name: "James Wilson", initials: "JW", badge: "Member" },
    category: "Integrations",
    tags: ["integrations", "accounting", "api"],
    replies: 19,
    views: 423,
    likes: 27,
    isPinned: false,
    isSolved: false,
    createdAt: "2026-01-01T11:00:00Z",
    lastActivity: "2026-01-02T09:15:00Z",
  },
  {
    id: "5",
    title: "Managing multi-venue events across different time zones",
    content: "We're planning a simultaneous event across 3 cities. How do you handle scheduling?",
    author: { id: "u5", name: "Lisa Park", initials: "LP", badge: "Pro" },
    category: "Operations",
    tags: ["multi-venue", "scheduling", "time-zones"],
    replies: 24,
    views: 567,
    likes: 38,
    isPinned: false,
    isSolved: false,
    createdAt: "2026-01-02T07:00:00Z",
    lastActivity: "2026-01-02T12:00:00Z",
  },
];

const CATEGORIES = [
  { id: "all", label: "All Discussions", count: 2891 },
  { id: "production", label: "Production Management", count: 542 },
  { id: "finance", label: "Finance", count: 389 },
  { id: "operations", label: "Operations", count: 456 },
  { id: "integrations", label: "Integrations", count: 234 },
  { id: "team", label: "Team Management", count: 312 },
];

const TOP_CONTRIBUTORS = [
  { id: "1", name: "Alex Chen", initials: "AC", points: 2847, badge: "Expert" },
  { id: "2", name: "Maria Garcia", initials: "MG", points: 2156, badge: "Expert" },
  { id: "3", name: "James Wilson", initials: "JW", points: 1823, badge: "Pro" },
  { id: "4", name: "Sarah Kim", initials: "SK", points: 1567, badge: "Pro" },
  { id: "5", name: "David Brown", initials: "DB", points: 1234, badge: "Rising Star" },
];

function formatTimeAgo(dateString: string): string {
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
}

function getBadgeVariant(badge: string): "success" | "warning" | "info" | "outline" {
  switch (badge) {
    case "Expert": return "success";
    case "Pro": return "warning";
    case "Rising Star": return "info";
    default: return "outline";
  }
}

export default function CommunityPage() {
  const router = useRouter();
  const { hasRole } = useAuthContext();
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeTab, setActiveTab] = useState<"discussions" | "following" | "my-posts">("discussions");

  const _canModerate = ATLVS_ADMIN_ROLES.some(role => hasRole(role));

  const filteredDiscussions = DEMO_DISCUSSIONS.filter(d => {
    if (activeCategory === "all") return true;
    return d.category.toLowerCase().includes(activeCategory);
  });

  const handleNewDiscussion = () => {
    router.push("/community/new");
  };

  const handleViewDiscussion = (id: string) => {
    router.push(`/community/${id}`);
  };

  const communitySidebar = (
    <Stack gap={6}>
      {/* Categories */}
      <Card className="p-5 border-2 border-grey-800 rounded-card">
        <Body className="text-white font-weight-bold mb-4">Categories</Body>
        <Stack gap={2}>
          {CATEGORIES.map((category) => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? "solid" : "ghost"}
              size="sm"
              fullWidth
              className="justify-between"
              onClick={() => setActiveCategory(category.id)}
            >
              <Text>{category.label}</Text>
              <Badge variant="outline" size="sm">{category.count}</Badge>
            </Button>
          ))}
        </Stack>
      </Card>

      {/* Top Contributors */}
      <Card className="p-5 border-2 border-grey-800 rounded-card">
        <Box className="flex items-center gap-2 mb-4">
          <Trophy className="size-5 text-warning" />
          <Body className="text-white font-weight-bold">Top Contributors</Body>
        </Box>
        <Stack gap={3}>
          {TOP_CONTRIBUTORS.map((contributor, idx) => (
            <Box key={contributor.id} className="flex items-center gap-3">
              <Body className="text-on-dark-disabled font-weight-bold w-4">
                {idx + 1}
              </Body>
              <Avatar initials={contributor.initials} size="sm" />
              <Box className="flex-1 min-w-0">
                <Body size="sm" className="text-white truncate">
                  {contributor.name}
                </Body>
                <Body size="xs" className="text-on-dark-disabled">
                  {contributor.points} pts
                </Body>
              </Box>
              <Badge variant={getBadgeVariant(contributor.badge)} size="sm">
                {contributor.badge}
              </Badge>
            </Box>
          ))}
        </Stack>
      </Card>

      {/* Trending Tags */}
      <Card className="p-5 border-2 border-grey-800 rounded-card">
        <Box className="flex items-center gap-2 mb-4">
          <TrendingUp className="size-5 text-primary" />
          <Body className="text-white font-weight-bold">Trending Tags</Body>
        </Box>
        <Box className="flex flex-wrap gap-2">
          {["festivals", "budgets", "automation", "vendors", "scheduling", "integrations", "crew", "workflows"].map((tag) => (
            <Badge 
              key={tag} 
              variant="outline" 
              className="cursor-pointer hover:bg-grey-800"
            >
              #{tag}
            </Badge>
          ))}
        </Box>
      </Card>
    </Stack>
  );

  return (
    <HubPage
      header={{
        kicker: "Connect",
        title: "Community",
        description: "Connect with fellow production professionals, share knowledge, and get help.",
      }}
      actions={
        <Button variant="solid" icon={<Plus className="size-4" />} onClick={handleNewDiscussion}>
          New Discussion
        </Button>
      }
      stats={[
        { label: "Members", value: "5,247", trend: "up" },
        { label: "Discussions", value: "2,891", trend: "up" },
        { label: "Replies", value: "18,432", trend: "up" },
        { label: "Online Now", value: "127" },
      ]}
      tabs={[
        { id: "discussions", label: "Discussions", count: 2891 },
        { id: "following", label: "Following" },
        { id: "my-posts", label: "My Posts" },
      ]}
      activeTab={activeTab}
      onTabChange={(tabId: string) => setActiveTab(tabId as "discussions" | "following" | "my-posts")}
      sidebar={communitySidebar}
      sidebarPosition="right"
      sidebarWidth={4}
    >

          {/* Discussions List */}
          {activeTab === "discussions" && (
            <Stack gap={4}>
              {filteredDiscussions.map((discussion) => (
                <Card 
                  key={discussion.id} 
                  className="p-5 border-2 border-grey-800 rounded-card cursor-pointer hover:border-grey-700 transition-colors"
                  onClick={() => handleViewDiscussion(discussion.id)}
                >
                  <Box className="flex gap-4">
                    <Avatar initials={discussion.author.initials} size="md" />
                    <Box className="flex-1 min-w-0">
                      <Box className="flex items-start justify-between gap-4 mb-2">
                        <Box>
                          <Box className="flex items-center gap-2 mb-1 flex-wrap">
                            {discussion.isPinned && (
                              <Badge variant="warning" size="sm">Pinned</Badge>
                            )}
                            {discussion.isSolved && (
                              <Badge variant="success" size="sm">Solved</Badge>
                            )}
                            <Badge variant="outline" size="sm">{discussion.category}</Badge>
                          </Box>
                          <Body className="text-white font-weight-bold hover:text-primary transition-colors">
                            {discussion.title}
                          </Body>
                        </Box>
                        <Box className="flex gap-2 shrink-0">
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); }}>
                            <Bookmark className="size-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); }}>
                            <Bell className="size-4" />
                          </Button>
                        </Box>
                      </Box>
                      <Body size="sm" className="text-on-dark-muted mb-3 line-clamp-2">
                        {discussion.content}
                      </Body>
                      <Box className="flex items-center justify-between flex-wrap gap-2">
                        <Box className="flex items-center gap-2">
                          <Body size="sm" className="text-on-dark-secondary">
                            {discussion.author.name}
                          </Body>
                          <Badge variant={getBadgeVariant(discussion.author.badge)} size="sm">
                            {discussion.author.badge}
                          </Badge>
                        </Box>
                        <Box className="flex items-center gap-4 text-on-dark-disabled">
                          <Box className="flex items-center gap-1">
                            <MessageCircle className="size-4" />
                            <Body size="sm">{discussion.replies}</Body>
                          </Box>
                          <Box className="flex items-center gap-1">
                            <Eye className="size-4" />
                            <Body size="sm">{discussion.views}</Body>
                          </Box>
                          <Box className="flex items-center gap-1">
                            <ThumbsUp className="size-4" />
                            <Body size="sm">{discussion.likes}</Body>
                          </Box>
                          <Box className="flex items-center gap-1">
                            <Clock className="size-4" />
                            <Body size="sm">{formatTimeAgo(discussion.lastActivity)}</Body>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Card>
              ))}
            </Stack>
          )}

          {/* Following Tab */}
          {activeTab === "following" && (
            <Card className="p-8 border-2 border-grey-800 rounded-card text-center">
              <Bell className="size-12 text-on-dark-disabled mx-auto mb-4" />
              <Body className="text-white font-weight-bold mb-2">No followed discussions</Body>
              <Body size="sm" className="text-on-dark-muted mb-4">
                Follow discussions to get notified about new replies.
              </Body>
              <Button variant="outline" onClick={() => setActiveTab("discussions")}>
                Browse Discussions
              </Button>
            </Card>
          )}

          {/* My Posts Tab */}
          {activeTab === "my-posts" && (
            <Card className="p-8 border-2 border-grey-800 rounded-card text-center">
              <MessageSquare className="size-12 text-on-dark-disabled mx-auto mb-4" />
              <Body className="text-white font-weight-bold mb-2">No posts yet</Body>
              <Body size="sm" className="text-on-dark-muted mb-4">
                Start a discussion to share your knowledge with the community.
              </Body>
              <Button variant="solid" onClick={handleNewDiscussion}>
                Create Discussion
              </Button>
            </Card>
          )}
    </HubPage>
  );
}
