"use client";

import { useState, useEffect, useCallback } from "react";
import { GvtewayAppLayout, GvtewayLoadingLayout } from "@/components/app-layout";
import {
  H2,
  Body,
  Button,
  Badge,
  Select,
  EmptyState,
  Stack,
  Card,
  Kicker,
  Label,
} from "@ghxstship/ui";
import { Bell, CheckCircle, Mail, Ticket, Megaphone, Settings } from "lucide-react";

// Demo data for unauthenticated users
const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: "demo-1",
    type: "event_update",
    title: "Event Reminder",
    message: "Summer Festival 2024 is tomorrow! Don't forget to bring your tickets.",
    read: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-2",
    type: "ticket",
    title: "Ticket Confirmed",
    message: "Your VIP tickets for Concert Series have been confirmed. Check your email for details.",
    read: false,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "demo-3",
    type: "promotion",
    title: "Early Bird Special",
    message: "Get 20% off tickets to upcoming events. Use code EARLY20 at checkout.",
    read: true,
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
];

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
      if (response.status === 401) {
        // Use demo data for unauthenticated users
        setNotifications(DEMO_NOTIFICATIONS);
        setError(null);
        return;
      }
      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }
      const data = await response.json();
      setNotifications(data.notifications || []);
      setError(null);
    } catch (err) {
      // Fallback to demo data on error
      setNotifications(DEMO_NOTIFICATIONS);
      setError(null);
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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'event_update': return <Bell className="size-4 text-on-dark-muted" />;
      case 'ticket': return <Ticket className="size-4 text-on-dark-muted" />;
      case 'promotion': return <Megaphone className="size-4 text-on-dark-muted" />;
      case 'system': return <Settings className="size-4 text-on-dark-muted" />;
      default: return <Mail className="size-4 text-on-dark-muted" />;
    }
  };

  if (loading) {
    return <GvtewayLoadingLayout />;
  }

  if (error) {
    return (
      <GvtewayAppLayout>
            <EmptyState
              title="Error Loading Notifications"
              description={error}
              action={{ label: "Retry", onClick: fetchNotifications }}
              inverted
            />
      </GvtewayAppLayout>
    );
  }

  return (
    <GvtewayAppLayout>
          <Stack gap={10}>
            {/* Page Header */}
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Updates</Kicker>
              <Stack direction="horizontal" gap={4} className="items-center">
                <H2 size="lg" className="text-white">Notifications</H2>
                {unreadCount > 0 && <Badge variant="solid">{unreadCount} Unread</Badge>}
              </Stack>
              <Body className="text-on-dark-muted">Stay updated on your events and orders</Body>
            </Stack>

            {/* Filters */}
            <Card inverted className="p-4">
              <Stack gap={4} direction="horizontal" className="items-center justify-between">
                <Stack gap={2}>
                  <Label size="xs" className="text-on-dark-muted">Filter by type</Label>
                  <Select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    inverted
                  >
                    <option value="all">All Types</option>
                    <option value="event_update">Event Updates</option>
                    <option value="ticket">Tickets</option>
                    <option value="promotion">Promotions</option>
                    <option value="system">System</option>
                  </Select>
                </Stack>
                <Button 
                  variant="outlineInk" 
                  size="sm"
                  onClick={handleMarkAllRead}
                  icon={<CheckCircle className="size-4" />}
                  iconPosition="left"
                >
                  Mark All Read
                </Button>
              </Stack>
            </Card>

            {/* Notifications List */}
            {filteredNotifications.length === 0 ? (
              <EmptyState
                title="No Notifications"
                description="You're all caught up!"
                inverted
              />
            ) : (
              <Stack gap={3}>
                {filteredNotifications.map((notification) => (
                  <Card
                    key={notification.id}
                    inverted
                    interactive
                    variant={notification.read ? "default" : "elevated"}
                  >
                    <Stack gap={4} direction="horizontal" className="items-start justify-between">
                      <Stack gap={2} className="flex-1">
                        <Stack gap={3} direction="horizontal" className="items-center">
                          {getNotificationIcon(notification.type)}
                          <Body className="font-display text-white">{notification.title}</Body>
                          {!notification.read && <Badge variant="solid">New</Badge>}
                        </Stack>
                        <Body className="text-on-dark-muted">{notification.message}</Body>
                        <Label size="xs" className="text-on-dark-disabled">
                          {notification.type} • {new Date(notification.created_at).toLocaleDateString()}
                        </Label>
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
    </GvtewayAppLayout>
  );
}
