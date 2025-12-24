'use client';

import {
  Body,
  Button,
  Form,
  H1,
  H3,
  Input,
  Label,
  Select,
  Text,
  Textarea,
} from '@ghxstship/ui';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Lightbulb, Plus, Search, ThumbsUp, MessageSquare, Clock, TrendingUp, Filter, AlertCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface FeatureRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'submitted' | 'under_review' | 'planned' | 'in_progress' | 'completed' | 'declined';
  votes: number;
  comments_count: number;
  created_at: string;
  author: string;
  has_voted: boolean;
}

const DEMO_FEATURES: FeatureRequest[] = [
  { id: 'FR-001', title: 'Bulk invoice generation', description: 'Allow generating multiple invoices at once for recurring clients or monthly billing cycles.', category: 'Billing', status: 'planned', votes: 156, comments_count: 23, created_at: '2025-01-10T10:00:00Z', author: 'John D.', has_voted: false },
  { id: 'FR-002', title: 'Mobile app for iOS and Android', description: 'A native mobile app to access schedules, submit expenses, and receive notifications on the go.', category: 'Platform', status: 'in_progress', votes: 324, comments_count: 67, created_at: '2024-11-15T08:00:00Z', author: 'Sarah M.', has_voted: true },
  { id: 'FR-003', title: 'AI-powered scheduling suggestions', description: 'Use AI to suggest optimal scheduling based on crew availability, location, and historical data.', category: 'Scheduling', status: 'under_review', votes: 89, comments_count: 12, created_at: '2025-01-05T14:00:00Z', author: 'Mike R.', has_voted: false },
  { id: 'FR-004', title: 'Custom dashboard widgets', description: 'Allow users to customize their dashboard with widgets they find most useful.', category: 'UI/UX', status: 'submitted', votes: 45, comments_count: 8, created_at: '2025-01-12T09:00:00Z', author: 'Lisa K.', has_voted: false },
  { id: 'FR-005', title: 'Integration with Final Draft', description: 'Sync script breakdowns and scene data directly from Final Draft.', category: 'Integrations', status: 'completed', votes: 78, comments_count: 15, created_at: '2024-10-20T11:00:00Z', author: 'Tom H.', has_voted: true },
  { id: 'FR-006', title: 'Multi-language support', description: 'Support for multiple languages in the interface for international productions.', category: 'Platform', status: 'planned', votes: 112, comments_count: 19, created_at: '2024-12-01T10:00:00Z', author: 'Anna P.', has_voted: false },
];

const CATEGORIES = ['All', 'Billing', 'Platform', 'Scheduling', 'UI/UX', 'Integrations', 'Reporting', 'Security'];
const STATUS_OPTIONS = ['all', 'submitted', 'under_review', 'planned', 'in_progress', 'completed'];

export default function FeatureRequestsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'votes' | 'newest'>('votes');
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [newRequest, setNewRequest] = useState({ title: '', description: '', category: 'Platform' });

  const { data, isLoading, error } = useQuery({
    queryKey: ['feature-requests', categoryFilter, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (categoryFilter !== 'All') params.append('category', categoryFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      
      const response = await fetch(`/api/feedback/features?${params}`);
      if (!response.ok) {
        return { features: DEMO_FEATURES };
      }
      return response.json();
    },
  });

  const features: FeatureRequest[] = data?.features || DEMO_FEATURES;

  const createRequest = useMutation({
    mutationFn: async (requestData: typeof newRequest) => {
      const response = await fetch('/api/feedback/features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });
      if (!response.ok) throw new Error('Failed to submit request');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-requests'] });
      setShowNewRequestModal(false);
      setNewRequest({ title: '', description: '', category: 'Platform' });
    },
  });

  const voteRequest = useMutation({
    mutationFn: async (featureId: string) => {
      const response = await fetch(`/api/feedback/features/${featureId}/vote`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to vote');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-requests'] });
    },
  });

  const filteredFeatures = features
    .filter((feature) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!feature.title.toLowerCase().includes(query) && !feature.description.toLowerCase().includes(query)) {
          return false;
        }
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'votes') return b.votes - a.votes;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-muted text-muted-foreground';
      case 'under_review': return 'bg-warning/10 text-warning';
      case 'planned': return 'bg-primary/10 text-primary';
      case 'in_progress': return 'bg-info/10 text-info';
      case 'completed': return 'bg-success/10 text-success';
      case 'declined': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading feature requests...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border-2 border-destructive rounded-card p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <Text className="text-destructive">Failed to load feature requests</Text>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/help"
            className="p-2 hover:bg-muted rounded-button transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div>
            <H1 className="text-h2-md font-weight-bold text-foreground flex items-center gap-2">
              <Lightbulb className="h-6 w-6" />
              Feature Requests
            </H1>
            <Body className="text-body-sm text-muted-foreground mt-1">
              Vote on features or suggest new ones
            </Body>
          </div>
        </div>
        <Button
          onClick={() => setShowNewRequestModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Submit Request
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-background border-2 border-border rounded-card p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </Select>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Status' : status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </option>
              ))}
            </Select>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'votes' | 'newest')}
              className="px-3 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
            >
              <option value="votes">Most Voted</option>
              <option value="newest">Newest</option>
            </Select>
          </div>
        </div>
      </div>

      {/* Feature List */}
      <div className="space-y-4">
        {filteredFeatures.length === 0 ? (
          <div className="bg-background border-2 border-border rounded-card p-8 text-center">
            <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <Body className="text-body-md text-muted-foreground">No feature requests found</Body>
            <Button
              onClick={() => setShowNewRequestModal(true)}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors"
            >
              Submit the First Request
            </Button>
          </div>
        ) : (
          filteredFeatures.map((feature) => (
            <div
              key={feature.id}
              className="bg-background border-2 border-border rounded-card p-4 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start gap-4">
                {/* Vote Button */}
                <Button
                  onClick={() => voteRequest.mutate(feature.id)}
                  className={`flex flex-col items-center p-3 rounded-card border-2 transition-colors ${
                    feature.has_voted
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary hover:bg-primary/5'
                  }`}
                >
                  <ThumbsUp className={`h-5 w-5 ${feature.has_voted ? 'fill-current' : ''}`} />
                  <Text className="text-body-sm font-weight-bold mt-1">{feature.votes}</Text>
                </Button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Text className={`px-2 py-0.5 text-body-xs rounded capitalize ${getStatusColor(feature.status)}`}>
                      {feature.status.replace('_', ' ')}
                    </Text>
                    <Text className="px-2 py-0.5 text-body-xs bg-muted rounded">{feature.category}</Text>
                  </div>
                  <H3 className="text-body-md font-weight-semibold text-foreground">{feature.title}</H3>
                  <Body className="text-body-sm text-muted-foreground mt-1 line-clamp-2">{feature.description}</Body>
                  <div className="flex items-center gap-4 mt-3 text-body-xs text-muted-foreground">
                    <Text className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(feature.created_at)}
                    </Text>
                    <Text>by {feature.author}</Text>
                    <Text className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {feature.comments_count} comments
                    </Text>
                  </div>
                </div>

                {/* Trending indicator */}
                {feature.votes > 100 && (
                  <div className="flex items-center gap-1 text-warning">
                    <TrendingUp className="h-4 w-4" />
                    <Text className="text-body-xs font-weight-medium">Trending</Text>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Request Modal */}
      {showNewRequestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border-2 border-border rounded-card p-6 max-w-lg w-full mx-4">
            <H3 className="text-h4-md font-weight-semibold text-foreground mb-4 flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Submit Feature Request
            </H3>
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                createRequest.mutate(newRequest);
              }}
              className="space-y-4"
            >
              <div>
                <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  Title *
                </Label>
                <Input
                  type="text"
                  value={newRequest.title}
                  onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                  required
                  placeholder="Brief title for your feature request"
                  className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  Description *
                </Label>
                <Textarea
                  value={newRequest.description}
                  onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                  required
                  rows={4}
                  placeholder="Describe your feature request in detail. What problem does it solve?"
                  className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary resize-none"
                />
              </div>
              <div>
                <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  Category
                </Label>
                <Select
                  value={newRequest.category}
                  onChange={(e) => setNewRequest({ ...newRequest, category: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                >
                  {CATEGORIES.slice(1).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </Select>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <Button
                  type="button"
                  onClick={() => setShowNewRequestModal(false)}
                  className="px-4 py-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createRequest.isPending}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {createRequest.isPending ? 'Submitting...' : 'Submit Request'}
                </Button>
              </div>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
}
