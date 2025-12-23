"use client";

import { useState } from "react";
import { AtlvsLoadingLayout } from "@/components/app-layout";
import {
  Body,
  Button,
  Badge,
  Select,
  EmptyState,
  Stack,
  Card,
  Label,
  EnterprisePageHeader,
  MainContent,
  Container,
} from "@ghxstship/ui";
import { Bell, CheckCircle, Mail, Briefcase, DollarSign, Settings } from "lucide-react";
import { useNotificationsData } from "@/hooks/useNotifications";

export default function NotificationsPage() {
  const [filterType, setFilterType] = useState("all");
  
  const {
    notifications,
    isLoading: loading,
    error,
    markRead,
    markAllRead,
  } = useNotificationsData(filterType);

  const handleMarkRead = async (notificationId: string, currentRead: boolean) => {
    try {
      await markRead({ notificationId, read: !currentRead });
    } catch (err) {
      // Error handled in hook
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
    } catch (err) {
      // Error handled in hook
    }
  };

  const filteredNotifications = notifications.filter(n =>
    filterType === "all" || n.type?.toLowerCase() === filterType
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'project_update': return <Briefcase className="size-4 text-on-dark-muted" />;
      case 'finance': return <DollarSign className="size-4 text-on-dark-muted" />;
      case 'system': return <Settings className="size-4 text-on-dark-muted" />;
      default: return <Mail className="size-4 text-on-dark-muted" />;
    }
  };

  if (loading) {
    return <AtlvsLoadingLayout />;
  }

  if (error) {
    return (
      <>
            <EmptyState
              title="Error Loading Notifications"
              description={error instanceof Error ? error.message : 'An error occurred'}
              inverted
            />
      </>
    );
  }

  return (
    <>
      <EnterprisePageHeader
        title="Notifications"
        subtitle="Stay updated on your projects and finances"
        rightContent={unreadCount > 0 ? <Badge variant="solid">{unreadCount} Unread</Badge> : undefined}
        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>
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
                    <option value="project_update">Project Updates</option>
                    <option value="finance">Finance</option>
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
                icon={<Bell className="size-12" />}
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
        </Container>
      </MainContent>
    </>
  );
}
