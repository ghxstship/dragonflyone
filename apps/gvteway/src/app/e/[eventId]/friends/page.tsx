"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Button, Body, Box, Badge } from "@ghxstship/ui";
import { Users, UserPlus, MessageCircle } from "lucide-react";
import { gvtewayDemoEvents } from "../../../../data/gvteway";

export default function EventFriendsPage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const event = gvtewayDemoEvents.find((e) => e.id === eventId);

  const friends = [
    { id: "1", name: "Alex Johnson", status: "going", mutualFriends: 5 },
    { id: "2", name: "Sam Williams", status: "going", mutualFriends: 3 },
    { id: "3", name: "Jordan Lee", status: "interested", mutualFriends: 8 },
    { id: "4", name: "Taylor Brown", status: "going", mutualFriends: 2 },
  ];

  const statusColors: Record<string, "success" | "warning" | "error" | "info" | "solid"> = {
    going: "success", interested: "info", invited: "warning",
  };

  return (
    <Stack gap={8}>
      <Stack gap={4}>
        <SectionHeader
          kicker={event?.name || "Event"}
          title="Friends"
          description="See who is attending this event"
          colorScheme="on-dark"
        />
        <Button variant="solid" size="sm">
          <UserPlus size={16} className="mr-2" />
          Invite Friends
        </Button>
      </Stack>

      <Card variant="elevated" inverted>
        <CardBody>
          <Stack gap={0}>
            {friends.map((friend, index) => (
              <div key={friend.id} className={`flex items-center justify-between border-ink-700 p-4 ${index < friends.length - 1 ? "border-b" : ""}`}>
                <Stack direction="horizontal" gap={3} className="items-center">
                  <Box className="flex size-10 items-center justify-center rounded-avatar bg-ink-800">
                    <Users size={20} className="text-primary" />
                  </Box>
                  <Stack gap={1}>
                    <Body className="font-weight-medium text-white">{friend.name}</Body>
                    <Body className="text-body-sm text-on-dark-muted">{friend.mutualFriends} mutual friends</Body>
                  </Stack>
                </Stack>
                <Stack direction="horizontal" gap={2} className="items-center">
                  <Badge variant={statusColors[friend.status]}>{friend.status.toUpperCase()}</Badge>
                  <Button variant="ghost" size="sm">
                    <MessageCircle size={16} />
                  </Button>
                </Stack>
              </div>
            ))}
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}
