'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ConsumerNavigationPublic } from '../../components/navigation';
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
  Field,
  Input,
  Grid,
  Stack,
  Badge,
  Alert,
  LoadingSpinner,
  Box,
} from '@ghxstship/ui';
import Image from 'next/image';

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
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/messages/conversations');
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);

        // Auto-select conversation from URL or first one
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
    setError(null);

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
    return (
      <Section className="min-h-screen bg-white">
        <ConsumerNavigationPublic />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading messages..." />
        </Container>
      </Section>
    );
  }

  return (
    <Section className="min-h-screen bg-white">
      <ConsumerNavigationPublic />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2} className="border-b-2 border-black pb-8">
            <H1>Messages</H1>
            <Body className="text-grey-600">
              Connect with other fans
            </Body>
          </Stack>

        {error && (
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}

        <Grid cols={3} gap={6} className="min-h-[600px]">
          <Card className="p-4 overflow-y-auto max-h-[600px]">
            <Stack direction="horizontal" className="justify-between items-center mb-4">
              <H3>CONVERSATIONS</H3>
              <Button variant="ghost" size="sm" onClick={() => router.push('/community')}>
                Find Fans
              </Button>
            </Stack>

            {conversations.length > 0 ? (
              <Stack gap={2}>
                {conversations.map(conv => (
                  <Card
                    key={conv.id}
                    className={`p-3 cursor-pointer transition-colors ${
                      activeConversation?.id === conv.id
                        ? 'bg-black text-white'
                        : 'hover:bg-grey-100'
                    }`}
                    onClick={() => setActiveConversation(conv)}
                  >
                    <Stack direction="horizontal" gap={3}>
                      <Stack className="w-10 h-10 bg-grey-200 rounded-full flex-shrink-0 flex items-center justify-center">
                        {conv.participant_avatar ? (
                          <Image
                            src={conv.participant_avatar}
                            alt={conv.participant_name}
                            width={40}
                            height={40}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <Body className={activeConversation?.id === conv.id ? 'text-white' : ''}>
                            {conv.participant_name.charAt(0)}
                          </Body>
                        )}
                      </Stack>
                      <Stack className="flex-1 min-w-0">
                        <Stack direction="horizontal" className="justify-between items-center">
                          <Body className={`font-medium truncate ${
                            activeConversation?.id === conv.id ? 'text-white' : ''
                          }`}>
                            {conv.participant_name}
                            {conv.participant_verified && (
                              <Badge className="ml-1 text-mono-xs bg-info-500 text-white">✓</Badge>
                            )}
                          </Body>
                          {conv.unread_count > 0 && (
                            <Badge className="bg-error-500 text-white text-mono-xs">
                              {conv.unread_count}
                            </Badge>
                          )}
                        </Stack>
                        {conv.last_message && (
                          <Body className={`text-body-sm truncate ${
                            activeConversation?.id === conv.id ? 'text-grey-600' : 'text-grey-500'
                          }`}>
                            {conv.last_message}
                          </Body>
                        )}
                        {conv.last_message_at && (
                          <Body className={`text-mono-xs ${
                            activeConversation?.id === conv.id ? 'text-grey-600' : 'text-grey-600'
                          }`}>
                            {formatTime(conv.last_message_at)}
                          </Body>
                        )}
                      </Stack>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            ) : (
              <Stack className="items-center py-8">
                <Body className="text-grey-500 text-center">
                  No conversations yet
                </Body>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => router.push('/community')}
                >
                  Find Fans to Connect
                </Button>
              </Stack>
            )}
          </Card>

          <Card className="col-span-2 flex flex-col">
            {activeConversation ? (
              <>
                <Stack className="p-4 border-b border-grey-200">
                  <Stack direction="horizontal" gap={3} className="items-center">
                    <Stack className="w-10 h-10 bg-grey-200 rounded-full flex items-center justify-center">
                      {activeConversation.participant_avatar ? (
                        <Image
                          src={activeConversation.participant_avatar}
                          alt={activeConversation.participant_name}
                          width={40}
                          height={40}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <Body>{activeConversation.participant_name.charAt(0)}</Body>
                      )}
                    </Stack>
                    <Stack>
                      <Body className="font-medium">
                        {activeConversation.participant_name}
                        {activeConversation.participant_verified && (
                          <Badge className="ml-2 text-mono-xs bg-info-500 text-white">Verified</Badge>
                        )}
                      </Body>
                    </Stack>
                  </Stack>
                </Stack>

                <Stack className="flex-1 overflow-y-auto p-4 max-h-[400px]" gap={3}>
                  {messages.map(message => (
                    <Stack
                      key={message.id}
                      className={`max-w-[70%] ${
                        message.sender_id !== activeConversation.participant_id ? 'ml-auto' : ''
                      }`}
                    >
                      <Card
                        className={`p-3 ${
                          message.sender_id !== activeConversation.participant_id
                            ? 'bg-black text-white'
                            : 'bg-grey-100'
                        }`}
                      >
                        <Body className={
                          message.sender_id !== activeConversation.participant_id ? 'text-white' : ''
                        }>
                          {message.content}
                        </Body>
                      </Card>
                      <Body className={`text-mono-xs mt-1 ${
                        message.sender_id !== activeConversation.participant_id ? 'text-right' : ''
                      } text-grey-600`}>
                        {formatTime(message.created_at)}
                      </Body>
                    </Stack>
                  ))}
                  <Box ref={messagesEndRef} />
                </Stack>

                <Stack className="p-4 border-t border-grey-200">
                  <Stack direction="horizontal" gap={2}>
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
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
                      disabled={sending || !newMessage.trim()}
                      onClick={handleSendMessage}
                    >
                      {sending ? 'Sending...' : 'Send'}
                    </Button>
                  </Stack>
                </Stack>
              </>
            ) : (
              <Stack className="flex-1 items-center justify-center p-8">
                <H3 className="mb-4">SELECT A CONVERSATION</H3>
                <Body className="text-grey-600 text-center">
                  Choose a conversation from the list or find new fans to connect with.
                </Body>
              </Stack>
            )}
          </Card>
        </Grid>
        </Stack>
      </Container>
    </Section>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <Section className="min-h-screen bg-white">
        <ConsumerNavigationPublic />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading messages..." />
        </Container>
      </Section>
    }>
      <MessagesContent />
    </Suspense>
  );
}
