"use client";

/**
 * Notifications Page
 * Uses DetailPage template for consistent layout
 */

import { useState } from "react";
import { Bell, Check, CheckCheck, AlertTriangle, List } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Body, Button, Card, DetailPage, Section, Box, Stack} from "@ghxstship/ui";

interface Notification {
  id: string;
  type: "info" | "warning" | "success" | "error";
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

const DEMO_NOTIFICATIONS: Notification[] = [
  { id: "1", type: "info", title: "New crew member added", message: "John Smith has been added to Summer Festival crew", read: false, created_at: "2024-12-15T10:30:00Z" },
  { id: "2", type: "warning", title: "Schedule conflict", message: "Overlapping shifts detected for Dec 20", read: false, created_at: "2024-12-14T15:00:00Z" },
  { id: "3", type: "success", title: "Timesheet approved", message: "Your timesheet for week 50 has been approved", read: true, created_at: "2024-12-13T09:00:00Z" },
];

const TYPE_CONFIG = {
  info: { icon: <Bell className="size-5" />, variant: "info" as const },
  warning: { icon: <AlertTriangle className="size-5" />, variant: "warning" as const },
  success: { icon: <Check className="size-5" />, variant: "success" as const },
  error: { icon: <AlertTriangle className="size-5" />, variant: "error" as const },
};

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const { data: notifications = [], isLoading, error, refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const response = await fetch("/api/notifications");
      if (!response.ok) return DEMO_NOTIFICATIONS;
      const data = await response.json();
      return data.notifications?.length ? data.notifications : DEMO_NOTIFICATIONS;
    },
  });

  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/notifications/${id}/read`, { method: "POST" });
      if (!response.ok) throw new Error("Failed to mark as read");
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/notifications/read-all", { method: "POST" });
      if (!response.ok) throw new Error("Failed to mark all as read");
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const filteredNotifications = filter === "unread" ? notifications.filter((n: Notification) => !n.read) : notifications;
  const unreadCount = notifications.filter((n: Notification) => !n.read).length;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const tabs = [
    {
      id: "notifications",
      label: "Notifications",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <Box className="flex gap-2 mb-6">
            <Button variant={filter === "all" ? "solid" : "outline"} size="sm" onClick={() => setFilter("all")}>All</Button>
            <Button variant={filter === "unread" ? "solid" : "outline"} size="sm" onClick={() => setFilter("unread")}>Unread ({unreadCount})</Button>
          </Box>

          {filteredNotifications.length === 0 ? (
            <Card className="p-8 text-center">
              <Bell className="size-12 text-on-dark-disabled mx-auto mb-4" />
              <Body className="font-weight-medium mb-2">No notifications</Body>
              <Body className="text-on-dark-muted">You are all caught up!</Body>
            </Card>
          ) : (
            <Stack gap={2}>
              {filteredNotifications.map((notification: Notification) => {
                const config = TYPE_CONFIG[notification.type];
                return (
                  <Card key={notification.id} className={`p-4 ${!notification.read ? "border-primary" : ""}`}>
                    <Box className="flex items-start gap-4">
                      <Box className={`p-2 rounded-card ${notification.type === "warning" ? "bg-warning/20" : notification.type === "success" ? "bg-success/20" : notification.type === "error" ? "bg-error/20" : "bg-grey-800"}`}>
                        {config.icon}
                      </Box>
                      <Box className="flex-1">
                        <Box className="flex items-start justify-between">
                          <Box>
                            <Body className={`font-weight-medium ${!notification.read ? "" : "text-on-dark-muted"}`}>{notification.title}</Body>
                            <Body size="sm" className="text-on-dark-muted">{notification.message}</Body>
                          </Box>
                          <Body size="sm" className="text-on-dark-disabled">{formatDate(notification.created_at)}</Body>
                        </Box>
                      </Box>
                      {!notification.read && (
                        <Button variant="ghost" size="sm" onClick={() => markAsRead.mutate(notification.id)}>
                          <Check className="size-4" />
                        </Button>
                      )}
                    </Box>
                  </Card>
                );
              })}
            </Stack>
          )}
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{ kicker: "Inbox", title: "Notifications", description: "Stay updated on your crew and events" }}
      loading={isLoading}
      error={error instanceof Error ? error : null}
      onRetry={refetch}
      tabs={tabs}
      actions={unreadCount > 0 ? <Button variant="outline" icon={<CheckCheck className="size-4" />} iconPosition="left" onClick={() => markAllAsRead.mutate()}>Mark All Read</Button> : undefined}
    />
  );
}
