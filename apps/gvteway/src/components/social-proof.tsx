/* eslint-disable react/forbid-component-props -- dynamic width percentage requires inline style */
"use client";

import { useState, useEffect } from "react";
import { Card, Label, Stack, Badge } from "@ghxstship/ui";
import { Flame, Users, Ticket, Hand, AlertTriangle, User } from "lucide-react";

interface SocialProofProps {
  eventId?: string;
  variant?: "compact" | "full";
}

interface SocialProofData {
  attendeeCount: number;
  recentPurchases: number;
  viewingNow: number;
  trending: boolean;
  soldPercentage: number;
  friendsAttending: number;
}

export function SocialProofWidget({ eventId, variant = "compact" }: SocialProofProps) {
  const [data, setData] = useState<SocialProofData>({
    attendeeCount: 2847,
    recentPurchases: 23,
    viewingNow: 156,
    trending: true,
    soldPercentage: 78,
    friendsAttending: 5,
  });

  useEffect(() => {
    // Fetch event-specific social proof data if eventId is provided
    if (eventId) {
      fetch(`/api/events/${eventId}/social-proof`)
        .then(res => res.ok ? res.json() : null)
        .then(eventData => {
          if (eventData) {
            setData(prev => ({ ...prev, ...eventData }));
          }
        })
        .catch(() => {
          // Use default data on error
        });
    }
  }, [eventId]);

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => ({
        ...prev,
        viewingNow: prev.viewingNow + Math.floor(Math.random() * 5) - 2,
        recentPurchases: Math.floor(Math.random() * 30) + 10,
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  if (variant === "compact") {
    return (
      <Stack direction="horizontal" gap={4} className="flex-wrap">
        {data.trending && (
          <Badge variant="solid" className="bg-error-500"><Flame className="h-3 w-3 inline mr-1" />Trending</Badge>
        )}
        <Label size="xs" className="text-text-muted">
          <Users className="h-3 w-3 inline mr-1" />{data.viewingNow} viewing now
        </Label>
        <Label size="xs" className="text-text-muted">
          <Ticket className="h-3 w-3 inline mr-1" />{data.recentPurchases} bought in last hour
        </Label>
        {data.friendsAttending > 0 && (
          <Label size="xs" className="text-info-600">
            <Hand className="h-3 w-3 inline mr-1" />{data.friendsAttending} friends going
          </Label>
        )}
      </Stack>
    );
  }

  return (
    <Card className="border-2 border-border p-4">
      <Stack gap={4}>
        <Stack direction="horizontal" className="justify-between items-center">
          <Label className="font-weight-bold">Live Activity</Label>
          {data.trending && <Badge variant="solid" className="bg-error-500"><Flame className="h-3 w-3 inline mr-1" />Trending</Badge>}
        </Stack>
        
        <Stack gap={3}>
          <Stack direction="horizontal" className="justify-between">
            <Label className="text-text-secondary"><Users className="h-3 w-3 inline mr-1" />People viewing</Label>
            <Label className="font-mono">{data.viewingNow}</Label>
          </Stack>
          
          <Stack direction="horizontal" className="justify-between">
            <Label className="text-text-secondary"><Ticket className="h-3 w-3 inline mr-1" />Bought in last hour</Label>
            <Label className="font-mono">{data.recentPurchases}</Label>
          </Stack>
          
          <Stack direction="horizontal" className="justify-between">
            <Label className="text-text-secondary"><Users className="h-3 w-3 inline mr-1" />Total attending</Label>
            <Label className="font-mono">{data.attendeeCount.toLocaleString()}</Label>
          </Stack>
          
          {data.friendsAttending > 0 && (
            <Stack direction="horizontal" className="justify-between">
              <Label className="text-info-600"><Hand className="h-3 w-3 inline mr-1" />Friends going</Label>
              <Label className="font-mono text-info-600">{data.friendsAttending}</Label>
            </Stack>
          )}
        </Stack>

        <Stack gap={2}>
          <Stack direction="horizontal" className="justify-between">
            <Label size="xs" className="text-text-muted">Tickets sold</Label>
            <Label size="xs" className="text-text-muted">{data.soldPercentage}%</Label>
          </Stack>
          <Card className="h-2 bg-muted overflow-hidden">
            <Card className={`h-full ${data.soldPercentage > 80 ? "bg-error-500" : data.soldPercentage > 50 ? "bg-warning-500" : "bg-success-500"}`} style={{ width: `${data.soldPercentage}%` }} />
          </Card>
          {data.soldPercentage > 75 && (
            <Label size="xs" className="text-error-600"><AlertTriangle className="h-3 w-3 inline mr-1" />Selling fast - only {100 - data.soldPercentage}% remaining!</Label>
          )}
        </Stack>
      </Stack>
    </Card>
  );
}

export function RecentPurchaseToast() {
  const [visible, setVisible] = useState(false);
  const [purchase, setPurchase] = useState({ name: "Sarah M.", location: "Los Angeles", tickets: 2 });

  useEffect(() => {
    const showToast = () => {
      const names = ["John D.", "Sarah M.", "Mike T.", "Emily C.", "Alex R."];
      const locations = ["Los Angeles", "New York", "Chicago", "Miami", "Austin"];
      setPurchase({
        name: names[Math.floor(Math.random() * names.length)],
        location: locations[Math.floor(Math.random() * locations.length)],
        tickets: Math.floor(Math.random() * 4) + 1,
      });
      setVisible(true);
      setTimeout(() => setVisible(false), 4000);
    };

    const interval = setInterval(showToast, 15000);
    setTimeout(showToast, 3000);
    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;

  return (
    <Card className="fixed bottom-4 left-4 p-4 bg-surface-primary border-2 border-border shadow-lg animate-slide-up z-50">
      <Stack direction="horizontal" gap={3}>
        <Card className="w-10 h-10 bg-success-100 flex items-center justify-center rounded-avatar">
          <Ticket className="h-5 w-5 text-success-600" />
        </Card>
        <Stack gap={1}>
          <Label className="font-weight-bold">{purchase.name} from {purchase.location}</Label>
          <Label size="xs" className="text-text-muted">
            Just purchased {purchase.tickets} ticket{purchase.tickets > 1 ? "s" : ""}
          </Label>
        </Stack>
      </Stack>
    </Card>
  );
}

export function AttendeeAvatars({ count = 5 }: { count?: number }) {
  const avatarCount = count;
  
  return (
    <Stack direction="horizontal" gap={0}>
      {Array.from({ length: avatarCount }).map((_, idx) => (
        <Card key={idx} className="w-8 h-8 bg-muted border-2 border-surface-primary rounded-avatar flex items-center justify-center -ml-2 first:ml-0">
          <User className="h-4 w-4 text-text-muted" />
        </Card>
      ))}
      <Label size="xs" className="ml-2 text-text-muted">+2,842 attending</Label>
    </Stack>
  );
}
