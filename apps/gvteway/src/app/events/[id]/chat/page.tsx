'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ConsumerNavigationPublic } from '../../../../components/navigation';
import {
  Container,
  Section,
  H1,
  H2,
  H3,
  Body,
  Label,
  Button,
  Card,
  Input,
  Grid,
  Stack,
  Badge,
  Alert,
  LoadingSpinner,
  Figure,
  Box,
  Form,
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
    return (
      <Section className="min-h-screen bg-white">
        <ConsumerNavigationPublic />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading chat..." />
        </Container>
      </Section>
    );
  }

  if (!chatRoom) {
    return (
      <Section className="min-h-screen bg-white">
        <ConsumerNavigationPublic />
        <Container className="py-16">
          <Card className="p-12 text-center mt-12">
            <H2 className="mb-4">CHAT NOT AVAILABLE</H2>
            <Body className="text-grey-600 mb-6">
              The chat room for this event is not available yet.
            </Body>
            <Button variant="solid" onClick={() => router.back()}>
              Go Back
            </Button>
          </Card>
        </Container>
      </Section>
    );
  }

  if (chatRoom.status === 'archived') {
    return (
      <Section className="min-h-screen bg-white">
        <ConsumerNavigationPublic />
        <Container className="py-16">
          <Stack gap={8}>
          <Stack gap={2} className="border-b-2 border-black pb-8">
            <Badge className="bg-grey-500 text-white mb-2">Archived</Badge>
            <H1>{chatRoom.event_title}</H1>
            <Body className="text-grey-600">Event Chat Archive</Body>
          </Stack>

          <Card className="p-6">
            <Body className="text-grey-500 mb-4">
              This chat has been archived. Messages are read-only.
            </Body>
            <Stack gap={3} className="max-h-[500px] overflow-y-auto">
              {messages.map(message => (
                <Stack key={message.id} direction="horizontal" gap={3}>
                  <Stack className="w-8 h-8 bg-grey-200 rounded-full flex-shrink-0 flex items-center justify-center">
                    <Body className="text-mono-xs">{message.user_name.charAt(0)}</Body>
                  </Stack>
                  <Stack>
                    <Stack direction="horizontal" gap={2} className="items-center">
                      <Body className="font-medium text-body-sm">{message.user_name}</Body>
                      <Body className="text-mono-xs text-grey-600">{formatTime(message.created_at)}</Body>
                    </Stack>
                    <Body className="text-grey-600">{message.content}</Body>
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </Card>
          </Stack>
        </Container>
      </Section>
    );
  }

  return (
    <Section className="min-h-screen bg-white">
      <ConsumerNavigationPublic />
      <Container className="py-16">
        <Stack gap={8}>
        <Stack direction="horizontal" className="flex-col md:flex-row md:items-center md:justify-between border-b-2 border-black pb-8">
          <Stack gap={2}>
            <Badge className="bg-success-500 text-white w-fit">Live</Badge>
            <H1>{chatRoom.event_title}</H1>
            <Body className="text-grey-600">
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
          <Card className="col-span-2 flex flex-col h-[600px]">
            <Stack className="flex-1 overflow-y-auto p-4" gap={3}>
              {messages.map(message => (
                <Stack
                  key={message.id}
                  className={`${message.is_pinned ? 'bg-warning-50 p-2 rounded' : ''}`}
                >
                  <Stack direction="horizontal" gap={3}>
                    <Stack className="relative w-10 h-10 bg-grey-200 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden">
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
                        <Body className="text-mono-xs text-grey-600">{formatTime(message.created_at)}</Body>
                      </Stack>
                      <Body>{message.content}</Body>
                    </Stack>
                  </Stack>
                </Stack>
              ))}
              <Box ref={messagesEndRef} />
            </Stack>

            <Stack className="p-4 border-t border-grey-200">
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
                <Body className="text-body-sm text-grey-600">{chatRoom.event_date}</Body>
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

            <Card className="p-4 bg-grey-50">
              <H3 className="mb-2">CHAT TIPS</H3>
              <Stack gap={1}>
                <Body className="text-mono-xs text-grey-600">• Be respectful to other fans</Body>
                <Body className="text-mono-xs text-grey-600">• No spoilers for setlists</Body>
                <Body className="text-mono-xs text-grey-600">• Report inappropriate content</Body>
              </Stack>
            </Card>
          </Stack>
        </Grid>
        </Stack>
      </Container>
    </Section>
  );
}
