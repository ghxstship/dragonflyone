"use client";

/**
 * GVTEWAY Chat Page
 * Live event chat and messaging interface
 * Uses DetailPage template for consistent layout
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Grid,
  Body,
  Card,
  Button,
  Input,
  Badge,
  Spinner,
  StatCard,
  DetailPage,
  Section,
  SectionHeader,
} from "@ghxstship/ui";
import { MessageSquare, Send, Hash, Search } from "lucide-react";

interface ChatRoom {
  id: string;
  name: string;
  type: "event" | "general" | "support";
  memberCount: number;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
}

export default function ChatPage() {
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: rooms = [], isLoading: roomsLoading, refetch } = useQuery({
    queryKey: ["chat-rooms"],
    queryFn: async () => {
      const response = await fetch("/api/chat/rooms");
      if (!response.ok) {
        return [
          { id: "1", name: "Summer Festival 2024", type: "event", memberCount: 1247, lastMessage: "Can't wait for the headliner!", lastMessageTime: "2m ago", unreadCount: 5 },
          { id: "2", name: "General Discussion", type: "general", memberCount: 3421, lastMessage: "Anyone going to the after party?", lastMessageTime: "5m ago", unreadCount: 0 },
          { id: "3", name: "Support", type: "support", memberCount: 12, lastMessage: "Your ticket has been verified", lastMessageTime: "1h ago", unreadCount: 1 },
        ] as ChatRoom[];
      }
      return response.json() as Promise<ChatRoom[]>;
    },
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ["chat-messages", selectedRoom?.id],
    queryFn: async () => {
      if (!selectedRoom) return [];
      const response = await fetch(`/api/chat/rooms/${selectedRoom.id}/messages`);
      if (!response.ok) {
        return [
          { id: "1", sender: "Alex", content: "Hey everyone! Excited for the show tonight!", timestamp: "10:30 AM", isOwn: false },
          { id: "2", sender: "You", content: "Same here! What time are you arriving?", timestamp: "10:32 AM", isOwn: true },
          { id: "3", sender: "Jordan", content: "I'll be there around 6pm for the opener", timestamp: "10:35 AM", isOwn: false },
          { id: "4", sender: "Alex", content: "Perfect, let's meet at the main entrance", timestamp: "10:36 AM", isOwn: false },
        ] as ChatMessage[];
      }
      return response.json() as Promise<ChatMessage[]>;
    },
    enabled: !!selectedRoom,
  });

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom) return;

    try {
      await fetch(`/api/chat/rooms/${selectedRoom.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage }),
      });
      setNewMessage("");
    } catch {
      // Handle error silently for now
    }
  };

  const filteredRooms = rooms.filter((room) =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUnread = rooms.reduce((sum, room) => sum + room.unreadCount, 0);
  const totalMembers = rooms.reduce((sum, room) => sum + room.memberCount, 0);

  const getTypeBadge = (type: ChatRoom["type"]) => {
    switch (type) {
      case "event":
        return <Badge variant="info">Event</Badge>;
      case "support":
        return <Badge variant="warning">Support</Badge>;
      default:
        return <Badge variant="ghost">General</Badge>;
    }
  };

  const tabs = [
    {
      id: "chat",
      label: "Chat",
      icon: <MessageSquare className="size-4" />,
      content: (
        <>
          <Grid cols={4} gap={4} className="grid-cols-2 lg:grid-cols-4 mb-6">
            <StatCard label="Chat Rooms" value={rooms.length.toString()} />
            <StatCard label="Unread Messages" value={totalUnread.toString()} />
            <StatCard label="Total Members" value={totalMembers.toLocaleString()} />
            <StatCard label="Active Now" value="247" />
          </Grid>

          <Grid cols={3} gap={6} className="grid-cols-1 lg:grid-cols-3">
            {/* Room List */}
            <Section border>
              <div className="flex items-center gap-2 mb-4">
                <Search className="size-4 text-grey-400" />
                <Input
                  placeholder="Search rooms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
              </div>

              <div className="space-y-2">
                {filteredRooms.length === 0 ? (
                  <Body className="text-grey-400 text-center py-4">No rooms found</Body>
                ) : (
                  filteredRooms.map((room) => (
                    <Card
                      key={room.id}
                      className={`cursor-pointer p-3 transition-all ${selectedRoom?.id === room.id ? "ring-2 ring-primary" : "hover:bg-grey-800"}`}
                      onClick={() => setSelectedRoom(room)}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Body className="font-weight-medium text-white">{room.name}</Body>
                          {room.unreadCount > 0 && (
                            <Badge variant="solid">{room.unreadCount}</Badge>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          {getTypeBadge(room.type)}
                          <Body size="sm" className="text-grey-400">{room.memberCount} members</Body>
                        </div>
                        <Body size="sm" className="text-grey-400 truncate">{room.lastMessage}</Body>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </Section>

            {/* Chat Area */}
            <Section border className="lg:col-span-2">
              {selectedRoom ? (
                <div className="flex flex-col min-h-96">
                  <div className="flex items-center justify-between border-b border-grey-700 pb-4 mb-4">
                    <div>
                      <Body className="font-weight-medium text-white">{selectedRoom.name}</Body>
                      <Body size="sm" className="text-grey-400">{selectedRoom.memberCount} members</Body>
                    </div>
                    {getTypeBadge(selectedRoom.type)}
                  </div>

                  <div className="flex-1 space-y-3 overflow-y-auto mb-4">
                    {messagesLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Spinner variant="grey" size="sm" />
                      </div>
                    ) : messages.length === 0 ? (
                      <Body className="text-grey-400 text-center py-8">No messages yet. Start the conversation!</Body>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`max-w-[80%] ${message.isOwn ? "ml-auto" : ""}`}
                        >
                          <Card className={`p-3 ${message.isOwn ? "bg-primary" : "bg-grey-800"}`}>
                            <div className="space-y-1">
                              {!message.isOwn && (
                                <Body size="sm" className="font-weight-medium text-grey-400">{message.sender}</Body>
                              )}
                              <Body className="text-white">{message.content}</Body>
                              <Body size="sm" className="text-grey-500">{message.timestamp}</Body>
                            </div>
                          </Card>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="flex gap-2 border-t border-grey-700 pt-4">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button variant="solid" onClick={handleSendMessage} disabled={!newMessage.trim()} icon={<Send className="size-4" />} />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center min-h-96 text-center">
                  <MessageSquare className="size-12 text-grey-600 mb-4" />
                  <Body className="font-weight-medium text-white mb-2">Select a Chat Room</Body>
                  <Body className="text-grey-400">Choose a room from the list to start chatting</Body>
                </div>
              )}
            </Section>
          </Grid>
        </>
      ),
    },
    {
      id: "rooms",
      label: "All Rooms",
      icon: <Hash className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="All Chat Rooms" description="Browse and join chat rooms" />
          <Grid cols={3} gap={4} className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <Card key={room.id} className="p-4 cursor-pointer hover:ring-2 hover:ring-primary" onClick={() => setSelectedRoom(room)}>
                <div className="flex items-start justify-between mb-2">
                  <Body className="font-weight-medium text-white">{room.name}</Body>
                  {getTypeBadge(room.type)}
                </div>
                <Body size="sm" className="text-grey-400 mb-2">{room.memberCount} members</Body>
                <Body size="sm" className="text-grey-400 truncate">{room.lastMessage}</Body>
              </Card>
            ))}
          </Grid>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{
        kicker: "Community",
        title: "Chat",
        description: "Live event chat and messaging",
      }}
      loading={roomsLoading}
      error={null}
      onRetry={refetch}
      tabs={tabs}
    />
  );
}
