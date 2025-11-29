'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { GvtewayAppLayout, GvtewayLoadingLayout } from '@/components/app-layout';
import {
  H2,
  H3,
  Body,
  Button,
  Card,
  Input,
  Grid,
  Stack,
  Badge,
  Alert,
  Box,
  Form,
  Kicker,
} from '@ghxstship/ui';
import Image from 'next/image';

interface ChatMessage {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  content: string;
  created_at: string;
  is_pinned?: boolean;
  is_moderator?: boolean;
}

interface EventChatRoom {
  id: string;
  event_id: string;
  event_title: string;
  event_date: string;
  status: 'active' | 'archived' | 'closed';
  participant_count: number;
  rules?: string[];
}

export default function EventChatPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [chatRoom, setChatRoom] = useState<EventChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showRules, setShowRules] = useState(false);

  const fetchChatRoom = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/events/${eventId}/chat`);
      if (response.ok) {
        const data = await response.json();
        setChatRoom(data.chat_room);
        setMessages(data.messages || []);
      } else {
        setError('Chat room not available');
      }
    } catch (err) {
      setError('Failed to load chat');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchChatRoom();
    // Poll for new messages every 5 seconds
    const interval = setInterval(fetchChatRoom, 5000);
    return () => clearInterval(interval);
  }, [fetchChatRoom]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !chatRoom) return;

    setSending(true);
    setError(null);

    try {
      const response = await fetch(`/api/events/${eventId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage }),
      });

      if (response.ok) {
        setNewMessage('');
        fetchChatRoom();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to send message');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return <GvtewayLoadingLayout text="Loading chat..." />;
  }

  if (!chatRoom) {
    return (
      <GvtewayAppLayout>
        <Card inverted className="p-12 text-center mt-12">
          <H2 className="mb-4 text-white">CHAT NOT AVAILABLE</H2>
          <Body className="text-on-dark-muted mb-6">
            The chat room for this event is not available yet.
          </Body>
          <Button variant="solid" inverted onClick={() => router.back()}>
            Go Back
          </Button>
        </Card>
      </GvtewayAppLayout>
    );
  }

  if (chatRoom.status === 'archived') {
    return (
      <GvtewayAppLayout>
            <Stack gap={8}>
              <Stack gap={2}>
                <Kicker colorScheme="on-dark">Events</Kicker>
                <Badge className="bg-ink-500 text-white mb-2 w-fit">Archived</Badge>
                <H2 size="lg" className="text-white">{chatRoom.event_title}</H2>
                <Body className="text-on-dark-muted">Event Chat Archive</Body>
              </Stack>

          <Card className="p-6">
            <Body className="text-ink-500 mb-4">
              This chat has been archived. Messages are read-only.
            </Body>
            <Stack gap={3} className="max-h-panel-md overflow-y-auto">
              {messages.map(message => (
                <Stack key={message.id} direction="horizontal" gap={3}>
                  <Stack className="w-8 h-8 bg-ink-200 rounded-full flex-shrink-0 flex items-center justify-center">
                    <Body className="text-mono-xs">{message.user_name.charAt(0)}</Body>
                  </Stack>
                  <Stack>
                    <Stack direction="horizontal" gap={2} className="items-center">
                      <Body className="font-medium text-body-sm">{message.user_name}</Body>
                      <Body className="text-mono-xs text-ink-600">{formatTime(message.created_at)}</Body>
                    </Stack>
                    <Body className="text-ink-600">{message.content}</Body>
                  </Stack>
                </Stack>
              ))}
            </Stack>
            </Card>
            </Stack>
      </GvtewayAppLayout>
    );
  }

  return (
    <GvtewayAppLayout>
          <Stack gap={10}>
            {/* Page Header */}
            <Stack direction="horizontal" className="flex-col items-start justify-between border-b-2 border-ink-800 pb-8 md:flex-row md:items-center">
              <Stack gap={2}>
                <Kicker colorScheme="on-dark">Events</Kicker>
                <Badge className="bg-success-500 text-white w-fit">Live</Badge>
                <H2 size="lg" className="text-white">{chatRoom.event_title}</H2>
                <Body className="text-on-dark-muted">
                  {chatRoom.participant_count} fans chatting
                </Body>
              </Stack>
            <Stack direction="horizontal" gap={2}>
              <Button variant="outline" onClick={() => setShowRules(!showRules)}>
                Rules
              </Button>
              <Button variant="outline" onClick={() => router.push(`/events/${eventId}`)}>
                Event Details
              </Button>
            </Stack>
        </Stack>

        {error && (
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}

        {showRules && chatRoom.rules && (
          <Card className="p-4 mb-6 bg-warning-50">
            <H3 className="mb-2">CHAT RULES</H3>
            <Stack gap={1}>
              {chatRoom.rules.map((rule, index) => (
                <Body key={index} className="text-body-sm">• {rule}</Body>
              ))}
            </Stack>
          </Card>
        )}

        <Grid cols={3} gap={6}>
          <Card className="col-span-2 flex flex-col h-panel-lg">
            <Stack className="flex-1 overflow-y-auto p-4" gap={3}>
              {messages.map(message => (
                <Stack
                  key={message.id}
                  className={`${message.is_pinned ? 'bg-warning-50 p-2 rounded' : ''}`}
                >
                  <Stack direction="horizontal" gap={3}>
                    <Stack className="relative w-10 h-10 bg-ink-200 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {message.user_avatar ? (
                        <Image
                          src={message.user_avatar}
                          alt={message.user_name}
                          fill
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <Body>{message.user_name.charAt(0)}</Body>
                      )}
                    </Stack>
                    <Stack className="flex-1">
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <Body className="font-medium">{message.user_name}</Body>
                        {message.is_moderator && (
                          <Badge className="bg-purple-500 text-white text-mono-xs">MOD</Badge>
                        )}
                        {message.is_pinned && (
                          <Badge className="bg-warning-500 text-white text-mono-xs">PINNED</Badge>
                        )}
                        <Body className="text-mono-xs text-ink-600">{formatTime(message.created_at)}</Body>
                      </Stack>
                      <Body>{message.content}</Body>
                    </Stack>
                  </Stack>
                </Stack>
              ))}
              <Box ref={messagesEndRef} />
            </Stack>

            <Stack className="p-4 border-t border-ink-200">
              <Form onSubmit={handleSendMessage}>
                <Stack direction="horizontal" gap={2}>
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1"
                    disabled={sending || chatRoom.status === 'closed'}
                    maxLength={500}
                  />
                  <Button
                    type="submit"
                    variant="solid"
                    disabled={sending || !newMessage.trim() || chatRoom.status === 'closed'}
                  >
                    {sending ? 'Sending...' : 'Send'}
                  </Button>
                </Stack>
              </Form>
            </Stack>
          </Card>

          <Stack gap={4}>
            <Card className="p-4">
              <H3 className="mb-4">EVENT INFO</H3>
              <Stack gap={2}>
                <Body className="text-body-sm text-ink-600">{chatRoom.event_date}</Body>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => router.push(`/events/${eventId}`)}
                >
                  View Event
                </Button>
              </Stack>
            </Card>

            <Card className="p-4">
              <H3 className="mb-4">QUICK REACTIONS</H3>
              <Stack direction="horizontal" gap={2} className="flex-wrap">
                {['🔥', '❤️', '🎉', '👏', '🙌', '😍'].map(emoji => (
                  <Button
                    key={emoji}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setNewMessage(prev => prev + emoji);
                    }}
                  >
                    {emoji}
                  </Button>
                ))}
              </Stack>
            </Card>

            <Card className="p-4 bg-ink-50">
              <H3 className="mb-2">CHAT TIPS</H3>
              <Stack gap={1}>
                <Body className="text-mono-xs text-ink-600">• Be respectful to other fans</Body>
                <Body className="text-mono-xs text-ink-600">• No spoilers for setlists</Body>
                <Body className="text-mono-xs text-ink-600">• Report inappropriate content</Body>
              </Stack>
            </Card>
          </Stack>
        </Grid>
          </Stack>
    </GvtewayAppLayout>
  );
}
