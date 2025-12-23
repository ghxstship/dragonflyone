"use client";

import { useState } from "react";
import { CompvssLoadingLayout } from "@/components/app-layout";
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
import { Bell, CheckCircle, Mail, Users, Calendar, Settings } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";

export default function NotificationsPage() {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();
  const [filterType, setFilterType] = useState("all");

  const handleMarkRead = async (notificationId: string, currentRead: boolean) => {
    if (!currentRead) {
      await markAsRead([notificationId]);
    }
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  const filteredNotifications = notifications.filter(n =>
    filterType === "all" || n.type?.toLowerCase() === filterType
  );

  const displayUnreadCount = unreadCount;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'crew_update': return <Users className="text-muted size-4" />;
      case 'schedule': return <Calendar className="text-muted size-4" />;
      case 'system': return <Settings className="text-muted size-4" />;
      default: return <Mail className="text-muted size-4" />;
    }
  };

  if (loading) {
    return <CompvssLoadingLayout />;
  }


  return (
    <>
          <Stack gap={10}>
            {/* Page Header */}
            <Stack gap={2}>
              <Kicker>Updates</Kicker>
              <Stack direction="horizontal" gap={4} className="items-center">
                <H2 size="lg">Notifications</H2>
                {displayUnreadCount > 0 && <Badge variant="solid">{displayUnreadCount} Unread</Badge>}
              </Stack>
              <Body className="text-muted">Stay updated on your crew and schedule</Body>
            </Stack>

            {/* Filters */}
            <Card className="p-4">
              <Stack gap={4} direction="horizontal" className="items-center justify-between">
                <Stack gap={2}>
                  <Label size="xs" className="text-muted">Filter by type</Label>
                  <Select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="all">All Types</option>
                    <option value="crew_update">Crew Updates</option>
                    <option value="schedule">Schedule</option>
                    <option value="system">System</option>
                  </Select>
                </Stack>
                <Button 
                  variant="outline" 
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
                icon={<Bell className="size-12" />}
                title="No Notifications"
                description="You're all caught up!"
              />
            ) : (
              <Stack gap={3}>
                {filteredNotifications.map((notification) => (
                  <Card
                    key={notification.id}
                    interactive
                    variant={notification.read ? "default" : "elevated"}
                  >
                    <Stack gap={4} direction="horizontal" className="items-start justify-between">
                      <Stack gap={2} className="flex-1">
                        <Stack gap={3} direction="horizontal" className="items-center">
                          {getNotificationIcon(notification.type)}
                          <Body className="font-display">{notification.title}</Body>
                          {!notification.read && <Badge variant="solid">New</Badge>}
                        </Stack>
                        <Body className="text-muted">{notification.message}</Body>
                        <Label size="xs" className="text-ink-400">
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
    </>
  );
}
