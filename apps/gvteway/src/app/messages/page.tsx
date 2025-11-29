'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GvtewayAppLayout, GvtewayLoadingLayout } from '@/components/app-layout';
import {
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
  Kicker,
  Box,
} from '@ghxstship/ui';
import Image from 'next/image';
import { MessageCircle, Send, Users, CheckCircle } from 'lucide-react';

interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  content: string;
  created_at: string;
  read: boolean;
}

interface Conversation {
  id: string;
  participant_id: string;
  participant_name: string;
  participant_avatar?: string;
  participant_verified: boolean;
  last_message?: string;
  last_message_at?: string;
  unread_count: number;
}

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationId = searchParams.get('conversation');

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/messages/conversations');
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);

        if (conversationId) {
          const conv = data.conversations?.find((c: Conversation) => c.id === conversationId);
          if (conv) setActiveConversation(conv);
        } else if (data.conversations?.length > 0 && !activeConversation) {
          setActiveConversation(data.conversations[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch conversations');
    } finally {
      setLoading(false);
    }
  }, [conversationId, activeConversation]);

  const fetchMessages = useCallback(async () => {
    if (!activeConversation) return;

    try {
      const response = await fetch(`/api/messages/conversations/${activeConversation.id}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error('Failed to fetch messages');
    }
  }, [activeConversation]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages();
    }
  }, [activeConversation, fetchMessages]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    setSending(true);

    try {
      const response = await fetch(`/api/messages/conversations/${activeConversation.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage }),
      });

      if (response.ok) {
        setNewMessage('');
        fetchMessages();
        fetchConversations();
      }
    } catch (err) {
      console.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (loading) {
    return <GvtewayLoadingLayout text="Loading messages..." />;
  }

  return (
    <GvtewayAppLayout>
          <Stack gap={8}>
            {/* Page Header */}
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Community</Kicker>
              <H2 size="lg" className="text-white">Messages</H2>
              <Body className="text-on-dark-muted">Connect with other fans</Body>
            </Stack>

            {/* Messages Grid */}
            <Grid cols={3} gap={6} className="min-h-[600px]">
              {/* Conversations List */}
              <Card inverted className="overflow-hidden p-0">
                <Stack className="border-b border-ink-800 p-4">
                  <Stack direction="horizontal" className="items-center justify-between">
                    <Stack direction="horizontal" gap={2} className="items-center">
                      <MessageCircle className="size-5 text-on-dark-muted" />
                      <H3 className="text-white">Conversations</H3>
                    </Stack>
                    <Button variant="ghost" size="sm" onClick={() => router.push('/community')}>
                      <Users className="size-4" />
                    </Button>
                  </Stack>
                </Stack>

                <Stack className="max-h-[500px] overflow-y-auto p-2">
                  {conversations.length > 0 ? (
                    <Stack gap={1}>
                      {conversations.map(conv => (
                        <Card
                          key={conv.id}
                          inverted
                          interactive
                          variant={activeConversation?.id === conv.id ? "elevated" : "default"}
                          className="cursor-pointer p-3"
                          onClick={() => setActiveConversation(conv)}
                        >
                          <Stack direction="horizontal" gap={3}>
                            <Stack className="flex size-10 shrink-0 items-center justify-center rounded-avatar bg-ink-700">
                              {conv.participant_avatar ? (
                                <Image
                                  src={conv.participant_avatar}
                                  alt={conv.participant_name}
                                  width={40}
                                  height={40}
                                  className="size-full rounded-avatar object-cover"
                                />
                              ) : (
                                <Body className="text-white">
                                  {conv.participant_name.charAt(0)}
                                </Body>
                              )}
                            </Stack>
                            <Stack className="min-w-0 flex-1">
                              <Stack direction="horizontal" className="items-center justify-between">
                                <Body className="truncate font-display text-white">
                                  {conv.participant_name}
                                  {conv.participant_verified && (
                                    <CheckCircle className="ml-1 inline size-3 text-primary" />
                                  )}
                                </Body>
                                {conv.unread_count > 0 && (
                                  <Badge variant="solid">{conv.unread_count}</Badge>
                                )}
                              </Stack>
                              {conv.last_message && (
                                <Body size="sm" className="truncate text-on-dark-muted">
                                  {conv.last_message}
                                </Body>
                              )}
                              {conv.last_message_at && (
                                <Label size="xs" className="text-on-dark-disabled">
                                  {formatTime(conv.last_message_at)}
                                </Label>
                              )}
                            </Stack>
                          </Stack>
                        </Card>
                      ))}
                    </Stack>
                  ) : (
                    <Stack className="items-center py-8">
                      <Body className="text-center text-on-dark-muted">No conversations yet</Body>
                      <Button
                        variant="outlineInk"
                        size="sm"
                        className="mt-4"
                        onClick={() => router.push('/community')}
                      >
                        Find Fans to Connect
                      </Button>
                    </Stack>
                  )}
                </Stack>
              </Card>

              {/* Chat Area */}
              <Card inverted className="col-span-2 flex flex-col overflow-hidden p-0">
                {activeConversation ? (
                  <>
                    {/* Chat Header */}
                    <Stack className="border-b border-ink-800 p-4">
                      <Stack direction="horizontal" gap={3} className="items-center">
                        <Stack className="flex size-10 items-center justify-center rounded-avatar bg-ink-700">
                          {activeConversation.participant_avatar ? (
                            <Image
                              src={activeConversation.participant_avatar}
                              alt={activeConversation.participant_name}
                              width={40}
                              height={40}
                              className="size-full rounded-avatar object-cover"
                            />
                          ) : (
                            <Body className="text-white">{activeConversation.participant_name.charAt(0)}</Body>
                          )}
                        </Stack>
                        <Stack>
                          <Body className="font-display text-white">
                            {activeConversation.participant_name}
                            {activeConversation.participant_verified && (
                              <Badge variant="solid" className="ml-2">Verified</Badge>
                            )}
                          </Body>
                        </Stack>
                      </Stack>
                    </Stack>

                    {/* Messages */}
                    <Stack className="max-h-[400px] flex-1 overflow-y-auto p-4" gap={3}>
                      {messages.map(message => (
                        <Stack
                          key={message.id}
                          className={`max-w-[70%] ${
                            message.sender_id !== activeConversation.participant_id ? 'ml-auto' : ''
                          }`}
                        >
                          <Card
                            inverted={message.sender_id === activeConversation.participant_id}
                            className={`p-3 ${
                              message.sender_id !== activeConversation.participant_id
                                ? 'bg-primary text-white'
                                : ''
                            }`}
                          >
                            <Body className={
                              message.sender_id !== activeConversation.participant_id ? 'text-white' : 'text-white'
                            }>
                              {message.content}
                            </Body>
                          </Card>
                          <Label size="xs" className={`mt-1 text-on-dark-disabled ${
                            message.sender_id !== activeConversation.participant_id ? 'text-right' : ''
                          }`}>
                            {formatTime(message.created_at)}
                          </Label>
                        </Stack>
                      ))}
                      <Box ref={messagesEndRef} />
                    </Stack>

                    {/* Message Input */}
                    <Stack className="border-t border-ink-800 p-4">
                      <Stack direction="horizontal" gap={2}>
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type a message..."
                          inverted
                          className="flex-1"
                          disabled={sending}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage(e as unknown as React.FormEvent);
                            }
                          }}
                        />
                        <Button 
                          variant="solid" 
                          inverted
                          disabled={sending || !newMessage.trim()}
                          onClick={handleSendMessage}
                          icon={<Send className="size-4" />}
                          iconPosition="left"
                        >
                          {sending ? 'Sending...' : 'Send'}
                        </Button>
                      </Stack>
                    </Stack>
                  </>
                ) : (
                  <Stack className="flex-1 items-center justify-center p-8">
                    <MessageCircle className="mb-4 size-12 text-on-dark-disabled" />
                    <H3 className="mb-2 text-white">Select a Conversation</H3>
                    <Body className="text-center text-on-dark-muted">
                      Choose a conversation from the list or find new fans to connect with.
                    </Body>
                  </Stack>
                )}
              </Card>
            </Grid>
          </Stack>
    </GvtewayAppLayout>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<GvtewayLoadingLayout text="Loading messages..." />}>
      <MessagesContent />
    </Suspense>
  );
}
