"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  PageLayout,
  Navigation,
  Footer,
  Display,
  H2,
  Body,
  Button,
  Badge,
  Select,
  SectionLayout,
  LoadingSpinner,
  EmptyState,
  Container,
  Stack,
  Card,
  Link,
} from "@ghxstship/ui";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  user_id?: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState("all");

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterType !== "all") {
        params.append("type", filterType);
      }

      const response = await fetch(`/api/notifications?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }
      const data = await response.json();
      setNotifications(data.notifications || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [filterType]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkRead = async (notificationId: string, currentRead: boolean) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: !currentRead }),
      });
      if (response.ok) {
        fetchNotifications();
      }
    } catch (err) {
      console.error("Failed to update notification:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const response = await fetch("/api/notifications/mark-all-read", {
        method: "POST",
      });
      if (response.ok) {
        fetchNotifications();
      }
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const filteredNotifications = notifications.filter(n =>
    filterType === "all" || n.type?.toLowerCase() === filterType
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <PageLayout
        background="black"
        header={
          <Navigation
            logo={<Display size="md" className="text-display-md">GVTEWAY</Display>}
            cta={<Button variant="outlineWhite" size="sm" onClick={() => router.push('/profile')}>PROFILE</Button>}
          >
            <Link href="/" className="font-heading text-body-sm uppercase tracking-widest hover:text-grey-400">Home</Link>
            <Link href="/events" className="font-heading text-body-sm uppercase tracking-widest hover:text-grey-400">Events</Link>
          </Navigation>
        }
        footer={
          <Footer
            logo={<Display size="md" className="text-white text-display-md">GVTEWAY</Display>}
            copyright="© 2024 GHXSTSHIP INDUSTRIES."
          />
        }
      >
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading notifications..." />
        </Container>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout
        background="black"
        header={
          <Navigation
            logo={<Display size="md" className="text-display-md">GVTEWAY</Display>}
            cta={<Button variant="outlineWhite" size="sm" onClick={() => router.push('/profile')}>PROFILE</Button>}
          >
            <Link href="/" className="font-heading text-body-sm uppercase tracking-widest hover:text-grey-400">Home</Link>
            <Link href="/events" className="font-heading text-body-sm uppercase tracking-widest hover:text-grey-400">Events</Link>
          </Navigation>
        }
        footer={
          <Footer
            logo={<Display size="md" className="text-white text-display-md">GVTEWAY</Display>}
            copyright="© 2024 GHXSTSHIP INDUSTRIES."
          />
        }
      >
        <Container className="py-16">
          <EmptyState
            title="Error Loading Notifications"
            description={error}
            action={{ label: "Retry", onClick: fetchNotifications }}
          />
        </Container>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      background="black"
      header={
        <Navigation
          logo={<Display size="md" className="text-display-md">GVTEWAY</Display>}
          cta={<Button variant="outlineWhite" size="sm" onClick={() => router.push('/profile')}>PROFILE</Button>}
        >
          <Link href="/" className="font-heading text-body-sm uppercase tracking-widest hover:text-grey-400">Home</Link>
          <Link href="/events" className="font-heading text-body-sm uppercase tracking-widest hover:text-grey-400">Events</Link>
        </Navigation>
      }
      footer={
        <Footer
          logo={<Display size="md" className="text-white text-display-md">GVTEWAY</Display>}
          copyright="© 2024 GHXSTSHIP INDUSTRIES."
        />
      }
    >
      <SectionLayout background="black">
        <Container>
          <Stack gap={8} className="max-w-4xl mx-auto">
            <Stack gap={4} direction="horizontal" className="justify-between items-center">
              <H2 className="text-white">Notifications</H2>
              <Badge>{unreadCount} Unread</Badge>
            </Stack>

            <Stack gap={4} direction="horizontal">
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-black text-white border-grey-700"
              >
                <option value="all">All Types</option>
                <option value="event_update">Event Updates</option>
                <option value="ticket">Tickets</option>
                <option value="promotion">Promotions</option>
                <option value="system">System</option>
              </Select>
              <Button variant="ghost" onClick={handleMarkAllRead}>
                Mark All Read
              </Button>
            </Stack>

            {filteredNotifications.length === 0 ? (
              <EmptyState
                title="No Notifications"
                description="You're all caught up!"
              />
            ) : (
              <Stack gap={3}>
                {filteredNotifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={`border-2 p-6 ${notification.read ? 'border-grey-800 bg-transparent' : 'border-white bg-grey-900'}`}
                  >
                    <Stack gap={4} direction="horizontal" className="justify-between items-start">
                      <Stack gap={2} className="flex-1">
                        <Stack gap={3} direction="horizontal" className="items-center">
                          <Body className="font-display text-body-md text-white">{notification.title}</Body>
                          {!notification.read && <Badge variant="solid">New</Badge>}
                        </Stack>
                        <Body className="text-grey-300">{notification.message}</Body>
                        <Body className="text-body-sm text-grey-500">
                          {notification.type} • {new Date(notification.created_at).toLocaleDateString()}
                        </Body>
                      </Stack>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkRead(notification.id, notification.read)}
                      >
                        {notification.read ? 'Mark Unread' : 'Mark Read'}
                      </Button>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            )}
          </Stack>
        </Container>
      </SectionLayout>
    </PageLayout>
  );
}
