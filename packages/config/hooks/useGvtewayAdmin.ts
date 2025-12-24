import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types
interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: string;
  authorAvatar?: string;
  category: string;
  tags: string[];
  likes: number;
  replies: number;
  views: number;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: string;
  lastReplyAt?: string;
}

interface EmbedWidget {
  id: string;
  name: string;
  type: 'Calendar' | 'Ticket' | 'Event List' | 'Countdown';
  eventId?: string;
  settings: Record<string, unknown>;
  embedCode: string;
  views: number;
  conversions: number;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

interface SeoSettings {
  id: string;
  pageType: string;
  pagePath: string;
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
  canonicalUrl?: string;
  noIndex: boolean;
  structuredData?: Record<string, unknown>;
  updatedAt: string;
}

interface MarketingWidget {
  id: string;
  name: string;
  type: 'Banner' | 'Popup' | 'Slider' | 'Notification Bar';
  content: string;
  targetUrl?: string;
  displayRules: {
    pages?: string[];
    startDate?: string;
    endDate?: string;
    frequency?: string;
  };
  impressions: number;
  clicks: number;
  status: 'Active' | 'Scheduled' | 'Inactive';
  createdAt: string;
}

interface ModerationItem {
  id: string;
  type: 'Review' | 'Comment' | 'Photo' | 'Post';
  content: string;
  author: string;
  reportedBy?: string;
  reportReason?: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Flagged';
  createdAt: string;
  moderatedAt?: string;
  moderatedBy?: string;
}

interface MerchItem {
  id: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  category: string;
  artistId?: string;
  artistName?: string;
  eventId?: string;
  eventName?: string;
  inventory: number;
  sold: number;
  status: 'Active' | 'Draft' | 'Out of Stock';
  variants?: MerchVariant[];
}

interface MerchVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  inventory: number;
}

interface EventTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  settings: Record<string, unknown>;
  ticketTypes: TemplateTicketType[];
  isPublic: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

interface TemplateTicketType {
  name: string;
  price: number;
  quantity: number;
  description?: string;
}

interface EventFriend {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  status: 'Going' | 'Interested' | 'Maybe';
  visibility: 'Public' | 'Friends Only' | 'Private';
  checkedIn: boolean;
  checkedInAt?: string;
}

interface EventBlueprint {
  id: string;
  name: string;
  description: string;
  venueType: string;
  capacity: number;
  layout: Record<string, unknown>;
  defaultSettings: Record<string, unknown>;
  thumbnail?: string;
  usageCount: number;
  createdAt: string;
}

interface CheckInRecord {
  id: string;
  eventId: string;
  ticketId: string;
  attendeeName: string;
  attendeeEmail: string;
  ticketType: string;
  checkInTime: string;
  checkInMethod: 'Scan' | 'Manual' | 'Self';
  gate?: string;
  staffId?: string;
  staffName?: string;
}

// API Base
const API_BASE = '/api/admin';

// Forums
async function fetchForumPosts(): Promise<ForumPost[]> {
  const response = await fetch(`${API_BASE}/forums/posts`);
  if (!response.ok) throw new Error('Failed to fetch forum posts');
  return response.json();
}

export function useForumPostsQuery() {
  return useQuery({
    queryKey: ['forum-posts'],
    queryFn: fetchForumPosts,
  });
}

export function useCreateForumPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<ForumPost>) => {
      const response = await fetch(`${API_BASE}/forums/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create forum post');
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['forum-posts'] }),
  });
}

export function useForumPosts() {
  const query = useForumPostsQuery();
  const posts = query.data || [];
  const pinnedPosts = posts.filter(p => p.isPinned).length;
  const totalReplies = posts.reduce((sum, p) => sum + p.replies, 0);
  return { posts, isLoading: query.isLoading, error: query.error, refetch: query.refetch, pinnedPosts, totalReplies };
}

// Embed Widgets
async function fetchEmbedWidgets(): Promise<EmbedWidget[]> {
  const response = await fetch(`${API_BASE}/marketing/embed`);
  if (!response.ok) throw new Error('Failed to fetch embed widgets');
  return response.json();
}

export function useEmbedWidgetsQuery() {
  return useQuery({
    queryKey: ['embed-widgets'],
    queryFn: fetchEmbedWidgets,
  });
}

export function useCreateEmbedWidget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<EmbedWidget>) => {
      const response = await fetch(`${API_BASE}/marketing/embed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create embed widget');
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['embed-widgets'] }),
  });
}

export function useEmbedWidgets() {
  const query = useEmbedWidgetsQuery();
  const widgets = query.data || [];
  const activeWidgets = widgets.filter(w => w.status === 'Active').length;
  const totalConversions = widgets.reduce((sum, w) => sum + w.conversions, 0);
  return { widgets, isLoading: query.isLoading, error: query.error, refetch: query.refetch, activeWidgets, totalConversions };
}

// SEO Settings
async function fetchSeoSettings(): Promise<SeoSettings[]> {
  const response = await fetch(`${API_BASE}/marketing/seo`);
  if (!response.ok) throw new Error('Failed to fetch SEO settings');
  return response.json();
}

export function useSeoSettingsQuery() {
  return useQuery({
    queryKey: ['seo-settings'],
    queryFn: fetchSeoSettings,
  });
}

export function useUpdateSeoSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<SeoSettings> & { id: string }) => {
      const response = await fetch(`${API_BASE}/marketing/seo/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update SEO settings');
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['seo-settings'] }),
  });
}

export function useSeoSettings() {
  const query = useSeoSettingsQuery();
  const settings = query.data || [];
  const optimizedPages = settings.filter(s => s.title && s.description).length;
  return { settings, isLoading: query.isLoading, error: query.error, refetch: query.refetch, optimizedPages };
}

// Marketing Widgets
async function fetchMarketingWidgets(): Promise<MarketingWidget[]> {
  const response = await fetch(`${API_BASE}/marketing/widgets`);
  if (!response.ok) throw new Error('Failed to fetch marketing widgets');
  return response.json();
}

export function useMarketingWidgetsQuery() {
  return useQuery({
    queryKey: ['marketing-widgets'],
    queryFn: fetchMarketingWidgets,
  });
}

export function useCreateMarketingWidget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<MarketingWidget>) => {
      const response = await fetch(`${API_BASE}/marketing/widgets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create marketing widget');
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['marketing-widgets'] }),
  });
}

export function useMarketingWidgets() {
  const query = useMarketingWidgetsQuery();
  const widgets = query.data || [];
  const activeWidgets = widgets.filter(w => w.status === 'Active').length;
  const totalClicks = widgets.reduce((sum, w) => sum + w.clicks, 0);
  return { widgets, isLoading: query.isLoading, error: query.error, refetch: query.refetch, activeWidgets, totalClicks };
}

// Moderation
async function fetchModerationItems(): Promise<ModerationItem[]> {
  const response = await fetch(`${API_BASE}/moderation`);
  if (!response.ok) throw new Error('Failed to fetch moderation items');
  return response.json();
}

export function useModerationItemsQuery() {
  return useQuery({
    queryKey: ['moderation-items'],
    queryFn: fetchModerationItems,
  });
}

export function useModerateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'approve' | 'reject' | 'flag' }) => {
      const response = await fetch(`${API_BASE}/moderation/${id}/${action}`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to moderate item');
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['moderation-items'] }),
  });
}

export function useModerationItems() {
  const query = useModerationItemsQuery();
  const items = query.data || [];
  const pendingItems = items.filter(i => i.status === 'Pending').length;
  const flaggedItems = items.filter(i => i.status === 'Flagged').length;
  return { items, isLoading: query.isLoading, error: query.error, refetch: query.refetch, pendingItems, flaggedItems };
}

// Merch
async function fetchMerchItems(): Promise<MerchItem[]> {
  const response = await fetch(`${API_BASE}/merch`);
  if (!response.ok) throw new Error('Failed to fetch merch items');
  return response.json();
}

export function useMerchItemsQuery() {
  return useQuery({
    queryKey: ['merch-items'],
    queryFn: fetchMerchItems,
  });
}

export function useCreateMerchItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<MerchItem>) => {
      const response = await fetch(`${API_BASE}/merch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create merch item');
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['merch-items'] }),
  });
}

export function useMerchItems() {
  const query = useMerchItemsQuery();
  const items = query.data || [];
  const activeItems = items.filter(i => i.status === 'Active').length;
  const totalRevenue = items.reduce((sum, i) => sum + (i.price * i.sold), 0);
  return { items, isLoading: query.isLoading, error: query.error, refetch: query.refetch, activeItems, totalRevenue };
}

// Event Templates
async function fetchEventTemplates(): Promise<EventTemplate[]> {
  const response = await fetch(`${API_BASE}/events/templates`);
  if (!response.ok) throw new Error('Failed to fetch event templates');
  return response.json();
}

export function useEventTemplatesQuery() {
  return useQuery({
    queryKey: ['event-templates'],
    queryFn: fetchEventTemplates,
  });
}

export function useCreateEventTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<EventTemplate>) => {
      const response = await fetch(`${API_BASE}/events/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create event template');
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['event-templates'] }),
  });
}

export function useEventTemplates() {
  const query = useEventTemplatesQuery();
  const templates = query.data || [];
  const publicTemplates = templates.filter(t => t.isPublic).length;
  const totalUsage = templates.reduce((sum, t) => sum + t.usageCount, 0);
  return { templates, isLoading: query.isLoading, error: query.error, refetch: query.refetch, publicTemplates, totalUsage };
}

// Event Friends
async function fetchEventFriends(eventId: string): Promise<EventFriend[]> {
  const response = await fetch(`${API_BASE}/events/${eventId}/friends`);
  if (!response.ok) throw new Error('Failed to fetch event friends');
  return response.json();
}

export function useEventFriendsQuery(eventId: string | undefined) {
  return useQuery({
    queryKey: ['event-friends', eventId],
    queryFn: () => fetchEventFriends(eventId!),
    enabled: !!eventId,
  });
}

export function useEventFriends(eventId: string | undefined) {
  const query = useEventFriendsQuery(eventId);
  const friends = query.data || [];
  const goingCount = friends.filter(f => f.status === 'Going').length;
  const checkedInCount = friends.filter(f => f.checkedIn).length;
  return { friends, isLoading: query.isLoading, error: query.error, refetch: query.refetch, goingCount, checkedInCount };
}

// Event Blueprints
async function fetchEventBlueprints(): Promise<EventBlueprint[]> {
  const response = await fetch(`${API_BASE}/events/blueprints`);
  if (!response.ok) throw new Error('Failed to fetch event blueprints');
  return response.json();
}

export function useEventBlueprintsQuery() {
  return useQuery({
    queryKey: ['event-blueprints'],
    queryFn: fetchEventBlueprints,
  });
}

export function useEventBlueprints() {
  const query = useEventBlueprintsQuery();
  const blueprints = query.data || [];
  const totalUsage = blueprints.reduce((sum, b) => sum + b.usageCount, 0);
  return { blueprints, isLoading: query.isLoading, error: query.error, refetch: query.refetch, totalUsage };
}

// Check-In
async function fetchCheckInRecords(eventId: string): Promise<CheckInRecord[]> {
  const response = await fetch(`${API_BASE}/events/${eventId}/check-ins`);
  if (!response.ok) throw new Error('Failed to fetch check-in records');
  return response.json();
}

export function useCheckInRecordsQuery(eventId: string | undefined) {
  return useQuery({
    queryKey: ['check-in-records', eventId],
    queryFn: () => fetchCheckInRecords(eventId!),
    enabled: !!eventId,
  });
}

export function useCheckInAttendee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ eventId, ticketId, method }: { eventId: string; ticketId: string; method: string }) => {
      const response = await fetch(`${API_BASE}/events/${eventId}/check-ins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId, method }),
      });
      if (!response.ok) throw new Error('Failed to check in attendee');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['check-in-records', variables.eventId] });
    },
  });
}

export function useCheckInRecords(eventId: string | undefined) {
  const query = useCheckInRecordsQuery(eventId);
  const records = query.data || [];
  const totalCheckedIn = records.length;
  const scanCount = records.filter(r => r.checkInMethod === 'Scan').length;
  return { records, isLoading: query.isLoading, error: query.error, refetch: query.refetch, totalCheckedIn, scanCount };
}
