"use client";

import { useState, useEffect } from "react";
import { Card, Label, Stack, Badge } from "@ghxstship/ui";

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
          <Badge variant="solid" className="bg-error-500">🔥 Trending</Badge>
        )}
        <Label size="xs" className="text-ink-500">
          👥 {data.viewingNow} viewing now
        </Label>
        <Label size="xs" className="text-ink-500">
          🎟️ {data.recentPurchases} bought in last hour
        </Label>
        {data.friendsAttending > 0 && (
          <Label size="xs" className="text-info-600">
            👋 {data.friendsAttending} friends going
          </Label>
        )}
      </Stack>
    );
  }

  return (
    <Card className="border-2 border-black p-4">
      <Stack gap={4}>
        <Stack direction="horizontal" className="justify-between items-center">
          <Label className="font-bold">Live Activity</Label>
          {data.trending && <Badge variant="solid" className="bg-error-500">🔥 Trending</Badge>}
        </Stack>
        
        <Stack gap={3}>
          <Stack direction="horizontal" className="justify-between">
            <Label className="text-ink-600">👥 People viewing</Label>
            <Label className="font-mono">{data.viewingNow}</Label>
          </Stack>
          
          <Stack direction="horizontal" className="justify-between">
            <Label className="text-ink-600">🎟️ Bought in last hour</Label>
            <Label className="font-mono">{data.recentPurchases}</Label>
          </Stack>
          
          <Stack direction="horizontal" className="justify-between">
            <Label className="text-ink-600">✅ Total attending</Label>
            <Label className="font-mono">{data.attendeeCount.toLocaleString()}</Label>
          </Stack>
          
          {data.friendsAttending > 0 && (
            <Stack direction="horizontal" className="justify-between">
              <Label className="text-info-600">👋 Friends going</Label>
              <Label className="font-mono text-info-600">{data.friendsAttending}</Label>
            </Stack>
          )}
        </Stack>

        <Stack gap={2}>
          <Stack direction="horizontal" className="justify-between">
            <Label size="xs" className="text-ink-500">Tickets sold</Label>
            <Label size="xs" className="text-ink-500">{data.soldPercentage}%</Label>
          </Stack>
          <Card className="h-2 bg-ink-200 overflow-hidden">
            <Card className={`h-full ${data.soldPercentage > 80 ? "bg-error-500" : data.soldPercentage > 50 ? "bg-warning-500" : "bg-success-500"}`} style={{ '--progress-width': `${data.soldPercentage}%`, width: 'var(--progress-width)' } as React.CSSProperties} />
          </Card>
          {data.soldPercentage > 75 && (
            <Label size="xs" className="text-error-600">⚠️ Selling fast - only {100 - data.soldPercentage}% remaining!</Label>
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
    <Card className="fixed bottom-4 left-4 p-4 bg-white border-2 border-black shadow-lg animate-slide-up z-50">
      <Stack direction="horizontal" gap={3}>
        <Card className="w-10 h-10 bg-success-100 flex items-center justify-center rounded-full">
          <Label>🎟️</Label>
        </Card>
        <Stack gap={1}>
          <Label className="font-bold">{purchase.name} from {purchase.location}</Label>
          <Label size="xs" className="text-ink-500">
            Just purchased {purchase.tickets} ticket{purchase.tickets > 1 ? "s" : ""}
          </Label>
        </Stack>
      </Stack>
    </Card>
  );
}

export function AttendeeAvatars({ count = 5 }: { count?: number }) {
  const avatars = ["👤", "👩", "👨", "🧑", "👱"];
  
  return (
    <Stack direction="horizontal" gap={0}>
      {avatars.slice(0, count).map((avatar, idx) => (
        <Card key={idx} className="w-8 h-8 bg-ink-100 border-2 border-white rounded-full flex items-center justify-center -ml-2 first:ml-0">
          <Label size="xs">{avatar}</Label>
        </Card>
      ))}
      <Label size="xs" className="ml-2 text-ink-500">+2,842 attending</Label>
    </Stack>
  );
}
