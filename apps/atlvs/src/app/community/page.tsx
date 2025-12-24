'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AtlvsAppLayout } from '../../components/app-layout';
import {
  Badge,
  Body,
  Button,
  Card,
  Container,
  Display,
  FullBleedSection,
  Grid,
  H1,
  H3,
  Input,
  Label,
  Select,
  Stack,
  Textarea,
} from '@ghxstship/ui';
import {
  MessageSquare,
  Users,
  TrendingUp,
  Clock,
  ThumbsUp,
  MessageCircle,
  Plus,
  Search,
  X,
  Eye,
  Pin,
  Award,
} from 'lucide-react';

// Demo data for community forum
const DEMO_TOPICS = [
  {
    id: 'topic-1',
    title: 'Best practices for managing large crew schedules',
    category: 'Tips & Tricks',
    author: 'Sarah M.',
    authorRole: 'Production Manager',
    replies: 24,
    views: 512,
    likes: 47,
    isPinned: true,
    isHot: true,
    lastActivity: '2 hours ago',
    preview: 'After managing crews of 100+ for major productions, here are my top tips...',
  },
  {
    id: 'topic-2',
    title: 'How to set up automated budget alerts?',
    category: 'How-To',
    author: 'Mike R.',
    authorRole: 'Finance Director',
    replies: 12,
    views: 234,
    likes: 18,
    isPinned: false,
    isHot: false,
    lastActivity: '5 hours ago',
    preview: 'I want to get notified when my production budget exceeds certain thresholds...',
  },
  {
    id: 'topic-3',
    title: 'Introducing myself - New to ATLVS!',
    category: 'Introductions',
    author: 'Emily C.',
    authorRole: 'Event Coordinator',
    replies: 8,
    views: 156,
    likes: 22,
    isPinned: false,
    isHot: false,
    lastActivity: '1 day ago',
    preview: 'Hi everyone! Just started using ATLVS for our corporate events team...',
  },
  {
    id: 'topic-4',
    title: 'Feature Request: Dark mode for mobile app',
    category: 'Feature Requests',
    author: 'Alex T.',
    authorRole: 'Technical Director',
    replies: 45,
    views: 892,
    likes: 156,
    isPinned: true,
    isHot: true,
    lastActivity: '30 minutes ago',
    preview: 'Would love to see a dark mode option for the mobile app, especially for late-night venue work...',
  },
  {
    id: 'topic-5',
    title: 'Integrating ATLVS with our existing payroll system',
    category: 'Integrations',
    author: 'David K.',
    authorRole: 'Operations Manager',
    replies: 15,
    views: 287,
    likes: 31,
    isPinned: false,
    isHot: false,
    lastActivity: '3 days ago',
    preview: 'We use ADP for payroll and I am wondering if there is a way to sync crew hours...',
  },
  {
    id: 'topic-6',
    title: 'Success story: Managed 50 events in one month',
    category: 'Success Stories',
    author: 'Jennifer L.',
    authorRole: 'Agency Owner',
    replies: 32,
    views: 678,
    likes: 89,
    isPinned: false,
    isHot: true,
    lastActivity: '6 hours ago',
    preview: 'Just wanted to share how ATLVS helped our agency handle our busiest month ever...',
  },
];

const DEMO_CATEGORIES = [
  { name: 'All Topics', count: 156, icon: MessageSquare },
  { name: 'Tips & Tricks', count: 42, icon: TrendingUp },
  { name: 'How-To', count: 38, icon: Award },
  { name: 'Feature Requests', count: 28, icon: Plus },
  { name: 'Integrations', count: 22, icon: Users },
  { name: 'Success Stories', count: 18, icon: ThumbsUp },
  { name: 'Introductions', count: 8, icon: MessageCircle },
];

const DEMO_STATS = [
  { label: 'MEMBERS', value: '12,450' },
  { label: 'TOPICS', value: '3,280' },
  { label: 'REPLIES', value: '28,500' },
  { label: 'ONLINE NOW', value: '342' },
];

interface Topic {
  id: string;
  title: string;
  category: string;
  author: string;
  authorRole: string;
  replies: number;
  views: number;
  likes: number;
  isPinned: boolean;
  isHot: boolean;
  lastActivity: string;
  preview: string;
}

export default function CommunityForumPage() {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState('All Topics');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewTopicModal, setShowNewTopicModal] = useState(false);
  const [newTopic, setNewTopic] = useState({
    title: '',
    category: 'Tips & Tricks',
    content: '',
  });

  // Fetch topics
  const { data: topics, isLoading, error } = useQuery({
    queryKey: ['community-topics', selectedCategory, searchQuery],
    queryFn: async () => {
      const response = await fetch(`/api/community/topics?category=${selectedCategory}&search=${searchQuery}`);
      if (!response.ok) return DEMO_TOPICS;
      return response.json();
    },
    initialData: DEMO_TOPICS,
  });

  // Create topic mutation
  const createTopicMutation = useMutation({
    mutationFn: async (topicData: typeof newTopic) => {
      const response = await fetch('/api/community/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(topicData),
      });
      if (!response.ok) throw new Error('Failed to create topic');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-topics'] });
      setShowNewTopicModal(false);
      setNewTopic({ title: '', category: 'Tips & Tricks', content: '' });
    },
  });

  const filteredTopics = (topics as Topic[]).filter((topic) => {
    const matchesCategory = selectedCategory === 'All Topics' || topic.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.preview.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCreateTopic = () => {
    if (!newTopic.title.trim() || !newTopic.content.trim()) return;
    createTopicMutation.mutate(newTopic);
  };

  return (
    <AtlvsAppLayout variant="public" background="white" rawContent>
      {/* Hero Section */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.03} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Stack gap={8} className="items-center text-center">
            <Stack className="flex size-16 items-center justify-center border-2 border-ink-700 bg-ink-800">
              <Users className="size-8 text-brand-pink" />
            </Stack>
            <Label size="xs" className="text-on-dark-muted">
              COMMUNITY
            </Label>
            <Display size="lg" className="text-white">
              ATLVS COMMUNITY FORUM
            </Display>
            <Body size="lg" className="max-w-2xl text-on-dark-secondary">
              Connect with production professionals, share knowledge, and get help from the community.
            </Body>
            <Button variant="pop" size="lg" icon={<Plus />} onClick={() => setShowNewTopicModal(true)}>
              Start a Discussion
            </Button>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Stats */}
      <FullBleedSection background="white" className="py-8 border-b border-grey-200">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Grid cols={4} gap={8} className="sm:grid-cols-2">
            {DEMO_STATS.map((stat) => (
              <Stack key={stat.label} className="text-center">
                <Display size="md" className="text-ink-950">{stat.value}</Display>
                <Label size="xs" className="text-grey-500">{stat.label}</Label>
              </Stack>
            ))}
          </Grid>
        </Container>
      </FullBleedSection>

      {/* Main Content */}
      <FullBleedSection background="white" pattern="grid" patternOpacity={0.03} className="py-12">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Grid cols={4} gap={8} className="sm:grid-cols-2 lg:grid-cols-4">
            {/* Sidebar - Categories */}
            <Stack gap={6} className="col-span-1">
              <H3 size="sm" className="text-ink-950">CATEGORIES</H3>
              <Stack gap={2}>
                {DEMO_CATEGORIES.map((category) => (
                  <Button
                    key={category.name}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`flex items-center justify-between px-4 py-3 border-2 transition-all ${
                      selectedCategory === category.name
                        ? 'border-ink-950 bg-ink-950 text-white'
                        : 'border-grey-200 bg-white text-grey-700 hover:border-ink-950'
                    }`}
                  >
                    <Stack direction="horizontal" gap={3} className="items-center">
                      <category.icon className="size-4" />
                      <Label size="xs">{category.name}</Label>
                    </Stack>
                    <Label size="xs" className={selectedCategory === category.name ? 'text-grey-300' : 'text-grey-400'}>
                      {category.count}
                    </Label>
                  </Button>
                ))}
              </Stack>
            </Stack>

            {/* Main - Topics List */}
            <Stack gap={6} className="col-span-3">
              {/* Search */}
              <Stack direction="horizontal" gap={4} className="items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-grey-400" />
                  <Input
                    placeholder="Search discussions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-2 border-grey-200"
                  />
                </div>
                <Button variant="outline" size="md" icon={<Clock />}>
                  Recent
                </Button>
                <Button variant="outline" size="md" icon={<TrendingUp />}>
                  Popular
                </Button>
              </Stack>

              {/* Loading State */}
              {isLoading && (
                <Stack gap={4}>
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="border-2 border-grey-200 bg-grey-50 p-6 animate-pulse">
                      <Stack gap={4}>
                        <div className="h-6 w-3/4 bg-grey-200 rounded" />
                        <div className="h-4 w-full bg-grey-200 rounded" />
                        <div className="h-4 w-1/2 bg-grey-200 rounded" />
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              )}

              {/* Error State */}
              {error && (
                <Card className="border-2 border-danger bg-danger/10 p-6">
                  <Stack gap={2} className="items-center text-center">
                    <Body className="text-danger">Failed to load discussions. Please try again.</Body>
                    <Button variant="outline" size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: ['community-topics'] })}>
                      Retry
                    </Button>
                  </Stack>
                </Card>
              )}

              {/* Empty State */}
              {!isLoading && !error && filteredTopics.length === 0 && (
                <Card className="border-2 border-grey-200 bg-grey-50 p-12">
                  <Stack gap={4} className="items-center text-center">
                    <MessageSquare className="size-12 text-grey-400" />
                    <H3 className="text-grey-600">No discussions found</H3>
                    <Body size="sm" className="text-grey-500">
                      Be the first to start a discussion in this category!
                    </Body>
                    <Button variant="pop" size="md" icon={<Plus />} onClick={() => setShowNewTopicModal(true)}>
                      Start Discussion
                    </Button>
                  </Stack>
                </Card>
              )}

              {/* Topics List */}
              {!isLoading && !error && filteredTopics.length > 0 && (
                <Stack gap={4}>
                  {filteredTopics.map((topic) => (
                    <Card key={topic.id} className="border-2 border-ink-950 bg-white p-6 shadow-md hover:shadow-lg transition-shadow">
                      <Stack gap={4}>
                        <Stack direction="horizontal" gap={3} className="items-start justify-between">
                          <Stack gap={2} className="flex-1">
                            <Stack direction="horizontal" gap={2} className="items-center flex-wrap">
                              {topic.isPinned && (
                                <Badge variant="outline" className="border-brand-pink text-brand-pink">
                                  <Pin className="size-3 mr-1" /> Pinned
                                </Badge>
                              )}
                              {topic.isHot && (
                                <Badge variant="outline" className="border-warning text-warning">
                                  <TrendingUp className="size-3 mr-1" /> Hot
                                </Badge>
                              )}
                              <Badge variant="outline" className="border-grey-300 text-grey-600">
                                {topic.category}
                              </Badge>
                            </Stack>
                            <H3 size="sm" className="text-ink-950 hover:text-brand-pink cursor-pointer">
                              {topic.title}
                            </H3>
                            <Body size="sm" className="text-grey-600 line-clamp-2">
                              {topic.preview}
                            </Body>
                          </Stack>
                        </Stack>

                        <Stack direction="horizontal" className="items-center justify-between">
                          <Stack direction="horizontal" gap={4} className="items-center">
                            <Stack direction="horizontal" gap={2} className="items-center">
                              <div className="size-8 bg-grey-200 rounded-avatar flex items-center justify-center">
                                <Users className="size-4 text-grey-500" />
                              </div>
                              <Stack gap={0}>
                                <Label size="xs" className="text-ink-950">{topic.author}</Label>
                                <Label size="xs" className="text-grey-500">{topic.authorRole}</Label>
                              </Stack>
                            </Stack>
                          </Stack>

                          <Stack direction="horizontal" gap={6} className="items-center">
                            <Stack direction="horizontal" gap={1} className="items-center text-grey-500">
                              <MessageCircle className="size-4" />
                              <Label size="xs">{topic.replies}</Label>
                            </Stack>
                            <Stack direction="horizontal" gap={1} className="items-center text-grey-500">
                              <Eye className="size-4" />
                              <Label size="xs">{topic.views}</Label>
                            </Stack>
                            <Stack direction="horizontal" gap={1} className="items-center text-grey-500">
                              <ThumbsUp className="size-4" />
                              <Label size="xs">{topic.likes}</Label>
                            </Stack>
                            <Label size="xs" className="text-grey-400">{topic.lastActivity}</Label>
                          </Stack>
                        </Stack>
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              )}
            </Stack>
          </Grid>
        </Container>
      </FullBleedSection>

      {/* New Topic Modal */}
      {showNewTopicModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/50">
          <Card className="w-full max-w-2xl border-2 border-ink-950 bg-white p-8 shadow-xl mx-4">
            <Stack gap={6}>
              <Stack direction="horizontal" className="items-center justify-between">
                <H1 size="sm" className="text-ink-950">Start a Discussion</H1>
                <Button onClick={() => setShowNewTopicModal(false)} className="p-2 hover:bg-grey-100 rounded">
                  <X className="size-5 text-grey-500" />
                </Button>
              </Stack>

              <Stack gap={4}>
                <Stack gap={2}>
                  <Label size="xs" className="text-ink-950">TITLE</Label>
                  <Input
                    placeholder="What would you like to discuss?"
                    value={newTopic.title}
                    onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                    className="border-2 border-ink-950"
                  />
                </Stack>

                <Stack gap={2}>
                  <Label size="xs" className="text-ink-950">CATEGORY</Label>
                  <Select
                    value={newTopic.category}
                    onChange={(e) => setNewTopic({ ...newTopic, category: e.target.value })}
                    className="w-full border-2 border-ink-950 bg-white px-4 py-3 text-ink-950"
                  >
                    {DEMO_CATEGORIES.filter(c => c.name !== 'All Topics').map((cat) => (
                      <option key={cat.name} value={cat.name}>{cat.name}</option>
                    ))}
                  </Select>
                </Stack>

                <Stack gap={2}>
                  <Label size="xs" className="text-ink-950">CONTENT</Label>
                  <Textarea
                    placeholder="Share your thoughts, questions, or insights..."
                    value={newTopic.content}
                    onChange={(e) => setNewTopic({ ...newTopic, content: e.target.value })}
                    rows={6}
                    className="w-full border-2 border-ink-950 bg-white px-4 py-3 text-ink-950 placeholder:text-grey-400 focus:outline-none focus:ring-2 focus:ring-brand-pink"
                  />
                </Stack>
              </Stack>

              <Stack direction="horizontal" gap={4} className="justify-end">
                <Button variant="outline" onClick={() => setShowNewTopicModal(false)}>
                  Cancel
                </Button>
                <Button
                  variant="pop"
                  onClick={handleCreateTopic}
                  disabled={!newTopic.title.trim() || !newTopic.content.trim() || createTopicMutation.isPending}
                >
                  {createTopicMutation.isPending ? 'Posting...' : 'Post Discussion'}
                </Button>
              </Stack>
            </Stack>
          </Card>
        </div>
      )}
    </AtlvsAppLayout>
  );
}
