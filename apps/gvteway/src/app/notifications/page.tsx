"use client";

import { useState } from "react";
import { Bell, Check, CheckCheck, AlertTriangle, List } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Body, Button, Card, DetailPage, Section } from "@ghxstship/ui";

interface Notification { id: string; type: "info" | "warning" | "success"; title: string; message: string; read: boolean; created_at: string; }
const DEMO: Notification[] = [
  { id: "1", type: "info", title: "Ticket confirmed", message: "Your tickets for Summer Festival are confirmed", read: false, created_at: "2024-12-15T10:30:00Z" },
  { id: "2", type: "success", title: "Order shipped", message: "Your merch order is on its way", read: true, created_at: "2024-12-14T15:00:00Z" },
];

const TYPE_CONFIG = { info: { icon: <Bell className="size-5" />, bg: "bg-grey-800" }, warning: { icon: <AlertTriangle className="size-5" />, bg: "bg-warning/20" }, success: { icon: <Check className="size-5" />, bg: "bg-success/20" } };

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const { data: notifications = [], isLoading, error, refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => { const r = await fetch("/api/notifications"); if (!r.ok) return DEMO; return (await r.json()).notifications?.length ? (await r.json()).notifications : DEMO; },
  });

  const markAsRead = useMutation({ mutationFn: async (id: string) => { await fetch(`/api/notifications/${id}/read`, { method: "POST" }); }, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }) });
  const markAllAsRead = useMutation({ mutationFn: async () => { await fetch("/api/notifications/read-all", { method: "POST" }); }, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }) });

  const filtered = filter === "unread" ? notifications.filter((n: Notification) => !n.read) : notifications;
  const unreadCount = notifications.filter((n: Notification) => !n.read).length;
  const formatDate = (d: string) => { const h = Math.floor((Date.now() - new Date(d).getTime()) / 3600000); return h < 24 ? `${h}h ago` : `${Math.floor(h / 24)}d ago`; };

  const tabs = [{
    id: "notifications", label: "Notifications", icon: <List className="size-4" />,
    content: (
      <Section>
        <div className="flex gap-2 mb-6">
          <Button variant={filter === "all" ? "solid" : "outline"} size="sm" onClick={() => setFilter("all")}>All</Button>
          <Button variant={filter === "unread" ? "solid" : "outline"} size="sm" onClick={() => setFilter("unread")}>Unread ({unreadCount})</Button>
        </div>
        {filtered.length === 0 ? (
          <Card className="p-8 text-center"><Bell className="size-12 text-grey-600 mx-auto mb-4" /><Body className="font-weight-medium mb-2">No notifications</Body><Body className="text-grey-400">You are all caught up!</Body></Card>
        ) : (
          <div className="space-y-2">
            {filtered.map((n: Notification) => (
              <Card key={n.id} className={`p-4 ${!n.read ? "border-primary" : ""}`}>
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${TYPE_CONFIG[n.type].bg}`}>{TYPE_CONFIG[n.type].icon}</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div><Body className={`font-weight-medium ${n.read ? "text-grey-400" : ""}`}>{n.title}</Body><Body size="sm" className="text-grey-400">{n.message}</Body></div>
                      <Body size="sm" className="text-grey-500">{formatDate(n.created_at)}</Body>
                    </div>
                  </div>
                  {!n.read && <Button variant="ghost" size="sm" onClick={() => markAsRead.mutate(n.id)}><Check className="size-4" /></Button>}
                </div>
              </Card>
            ))}
          </div>
        )}
      </Section>
    ),
  }];

  return <DetailPage header={{ kicker: "Inbox", title: "Notifications", description: "Stay updated" }} loading={isLoading} error={error instanceof Error ? error : null} onRetry={refetch} tabs={tabs} actions={unreadCount > 0 ? <Button variant="outline" icon={<CheckCheck className="size-4" />} iconPosition="left" onClick={() => markAllAsRead.mutate()}>Mark All Read</Button> : undefined} />;
}
