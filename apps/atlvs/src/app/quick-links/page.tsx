"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AtlvsAppLayout, AtlvsLoadingLayout } from "@/components/app-layout";
import {
  H3,
  Body,
  Button,
  Badge,
  Select,
  EmptyState,
  Stack,
  Card,
  StatCard,
  Grid,
  Label,
  EnterprisePageHeader,
  Section,
  SectionHeader,
  Input,
} from "@ghxstship/ui";
import {
  Star,
  Link as LinkIcon,
  Search,
  FolderPlus,
  Receipt,
  Calendar,
  FileBarChart,
  UserPlus,
  Handshake,
  Package,
  HelpCircle,
  AlertTriangle,
  ShoppingCart,
  CreditCard,
  MessageSquare,
  Send,
  CalendarPlus,
  LayoutGrid,
  Target,
  User,
  Bell,
  Plug,
  Users,
  MessageCircle,
  Keyboard,
  Sparkles,
  LogOut,
  Upload,
  FilePlus2,
} from "lucide-react";
import { useQuickLinks, useUserQuickLinkFavorites, useToggleQuickLinkFavorite, type QuickLink } from "@/hooks/useQuickLinks";

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  FolderPlus,
  Receipt,
  Calendar,
  FileBarChart,
  UserPlus,
  Handshake,
  Package,
  HelpCircle,
  AlertTriangle,
  ShoppingCart,
  CreditCard,
  MessageSquare,
  Send,
  CalendarPlus,
  LayoutGrid,
  Target,
  User,
  Bell,
  Plug,
  Users,
  MessageCircle,
  Keyboard,
  Sparkles,
  LogOut,
  Upload,
  FilePlus2,
  Link: LinkIcon,
};

const categoryLabels: Record<string, string> = {
  projects: 'Projects',
  finance: 'Finance',
  assets: 'Assets',
  crm: 'CRM & Sales',
  reports: 'Reports & Analytics',
  settings: 'Settings',
  general: 'General',
};

export default function QuickLinksPage() {
  const router = useRouter();
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Demo user ID - in production this would come from auth
  const userId = "demo-user";

  const { data: quickLinks, isLoading } = useQuickLinks();
  const { data: favorites } = useUserQuickLinkFavorites(userId);
  const toggleFavorite = useToggleQuickLinkFavorite();

  // Get favorited link IDs
  const favoritedIds = useMemo(() => {
    return new Set(favorites?.map(f => f.quick_link_id) || []);
  }, [favorites]);

  const favoriteCount = favoritedIds.size;

  // Filter and search links
  const filteredLinks = useMemo(() => {
    if (!quickLinks) return [];
    
    return quickLinks.filter(link => {
      const matchesCategory = filterCategory === "all" || link.category === filterCategory;
      const matchesSearch = !searchQuery || 
        link.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [quickLinks, filterCategory, searchQuery]);

  // Group links by category
  const linksByCategory = useMemo(() => {
    const grouped: Record<string, QuickLink[]> = {};
    filteredLinks.forEach(link => {
      if (!grouped[link.category]) {
        grouped[link.category] = [];
      }
      grouped[link.category].push(link);
    });
    return grouped;
  }, [filteredLinks]);

  const handleToggleFavorite = async (linkId: string) => {
    const isFavorited = favoritedIds.has(linkId);
    
    // Check max favorites limit
    if (!isFavorited && favoriteCount >= 10) {
      alert('Maximum of 10 favorites allowed. Please remove a favorite first.');
      return;
    }

    try {
      await toggleFavorite.mutateAsync({
        userId,
        quickLinkId: linkId,
        isFavorited,
      });
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName] || LinkIcon;
    return <IconComponent className="size-5" />;
  };

  if (isLoading) {
    return <AtlvsLoadingLayout text="Loading forms library..." />;
  }

  return (
    <AtlvsAppLayout>
      <Stack gap={10}>
        <EnterprisePageHeader
          title="Forms Library"
          subtitle="Quick access to all forms and actions - star up to 10 favorites"
          showFavorite
          showSettings
        />

        {/* Stats */}
        <Grid cols={4} gap={6}>
          <StatCard
            label="Total Forms"
            value={quickLinks?.length?.toString() || "0"}
            trend="neutral"
          />
          <StatCard
            label="Your Favorites"
            value={favoriteCount.toString()}
            trend={favoriteCount > 0 ? "up" : "neutral"}
            trendValue={`${10 - favoriteCount} slots remaining`}
          />
          <StatCard
            label="Categories"
            value={Object.keys(linksByCategory).length.toString()}
            trend="neutral"
          />
          <StatCard
            label="Recently Used"
            value="--"
            trend="neutral"
          />
        </Grid>

        {/* Search and Filters */}
        <Section border>
          <SectionHeader
            kicker="Search"
            title="Find Forms"
            icon={<Search className="size-5" />}
          />
          <Stack direction="horizontal" gap={4} className="items-end">
            <Stack gap={2} className="flex-1">
              <Label size="xs" className="text-on-dark-muted">Search</Label>
              <Input
                placeholder="Search forms by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                inverted
              />
            </Stack>
            <Stack gap={2}>
              <Label size="xs" className="text-on-dark-muted">Category</Label>
              <Select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                inverted
              >
                <option value="all">All Categories</option>
                <option value="projects">Projects</option>
                <option value="finance">Finance</option>
                <option value="assets">Assets</option>
                <option value="crm">CRM & Sales</option>
                <option value="reports">Reports & Analytics</option>
                <option value="settings">Settings</option>
                <option value="general">General</option>
              </Select>
            </Stack>
            <Button
              variant="outlineWhite"
              size="sm"
              onClick={() => {
                setFilterCategory("all");
                setSearchQuery("");
              }}
            >
              Clear Filters
            </Button>
          </Stack>
        </Section>

        {/* Favorites Section */}
        {favoriteCount > 0 && (
          <Section border>
            <SectionHeader
              kicker="Starred"
              title="Your Favorites"
              description={`${favoriteCount} of 10 favorites`}
              icon={<Star className="size-5 fill-warning text-warning" />}
            />
            <Grid cols={2} gap={4}>
              {favorites?.map((fav) => {
                const link = fav.quick_link;
                if (!link) return null;
                return (
                  <Card
                    key={fav.id}
                    inverted
                    interactive
                    className="border-2 border-warning/30 p-4 transition-colors hover:border-warning"
                  >
                    <Stack gap={3} direction="horizontal" className="items-start justify-between">
                      <Stack gap={2} className="flex-1">
                        <Stack direction="horizontal" gap={2} className="items-center">
                          <span className="text-warning">{getIcon(link.icon)}</span>
                          <H3 className="text-white">{link.name}</H3>
                        </Stack>
                        {link.description && (
                          <Body size="sm" className="text-grey-300">{link.description}</Body>
                        )}
                        <Badge variant="outline">{categoryLabels[link.category]}</Badge>
                      </Stack>
                      <Stack direction="horizontal" gap={2}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleFavorite(link.id)}
                        >
                          <Star className="size-4 fill-warning text-warning" />
                        </Button>
                        <Button
                          variant="solid"
                          size="sm"
                          onClick={() => router.push(link.href)}
                        >
                          Open
                        </Button>
                      </Stack>
                    </Stack>
                  </Card>
                );
              })}
            </Grid>
          </Section>
        )}

        {/* All Forms by Category */}
        {Object.entries(linksByCategory).length === 0 ? (
          <EmptyState
            icon={<LinkIcon className="size-12" />}
            title="No Forms Found"
            description="No forms match your search criteria."
            inverted
          />
        ) : (
          Object.entries(linksByCategory).map(([category, links]) => (
            <Section key={category} border>
              <SectionHeader
                kicker={categoryLabels[category] || category}
                title={`${categoryLabels[category] || category} Forms`}
                description={`${links.length} forms available`}
              />
              <Grid cols={2} gap={4}>
                {links.map((link) => {
                  const isFavorited = favoritedIds.has(link.id);
                  return (
                    <Card
                      key={link.id}
                      inverted
                      interactive
                      className={`border-2 p-4 transition-colors ${
                        isFavorited 
                          ? 'border-warning/30 hover:border-warning' 
                          : 'border-grey-700 hover:border-grey-500'
                      }`}
                    >
                      <Stack gap={3} direction="horizontal" className="items-start justify-between">
                        <Stack gap={2} className="flex-1">
                          <Stack direction="horizontal" gap={2} className="items-center">
                            <span className={isFavorited ? "text-warning" : "text-grey-400"}>
                              {getIcon(link.icon)}
                            </span>
                            <H3 className="text-white">{link.name}</H3>
                          </Stack>
                          {link.description && (
                            <Body size="sm" className="text-grey-300">{link.description}</Body>
                          )}
                        </Stack>
                        <Stack direction="horizontal" gap={2}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleFavorite(link.id)}
                            title={isFavorited ? "Remove from favorites" : "Add to favorites"}
                          >
                            <Star className={`size-4 ${isFavorited ? 'fill-warning text-warning' : 'text-grey-500'}`} />
                          </Button>
                          <Button
                            variant="outlineWhite"
                            size="sm"
                            onClick={() => router.push(link.href)}
                          >
                            Open
                          </Button>
                        </Stack>
                      </Stack>
                    </Card>
                  );
                })}
              </Grid>
            </Section>
          ))
        )}
      </Stack>
    </AtlvsAppLayout>
  );
}
