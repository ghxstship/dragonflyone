'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navigation } from '../../../components/navigation';
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
  Textarea,
  Select,
  Grid,
  Stack,
  Badge,
  LoadingSpinner,
  Box,
  Modal,
} from '@ghxstship/ui';

interface Message {
  id: string;
  sender: 'user' | 'agent' | 'system';
  content: string;
  timestamp: string;
  agent_name?: string;
}

interface Conversation {
  id: string;
  subject: string;
  status: 'open' | 'waiting' | 'resolved';
  event_id?: string;
  event_title?: string;
  created_at: string;
  messages: Message[];
}

function SupportChatContent() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get('event');
  const orderId = searchParams.get('order');
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newCategory, setNewCategory] = useState('general');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/support/conversations');
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
        
        // Auto-select first open conversation or create new if event/order specified
        if (data.conversations?.length > 0 && !activeConversation) {
          const open = data.conversations.find((c: Conversation) => c.status === 'open');
          if (open) setActiveConversation(open);
        }
      }
    } catch (err) {
      console.error('Failed to fetch conversations');
    } finally {
      setLoading(false);
    }
  }, [activeConversation]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeConversation?.messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    setSending(true);
    try {
      const response = await fetch(`/api/support/conversations/${activeConversation.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage }),
      });

      if (response.ok) {
        setNewMessage('');
        fetchConversations();
      }
    } catch (err) {
      console.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleStartNewChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim()) return;

    setSending(true);
    try {
      const response = await fetch('/api/support/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: newSubject,
          category: newCategory,
          event_id: eventId,
          order_id: orderId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setShowNewChat(false);
        setNewSubject('');
        setNewCategory('general');
        fetchConversations();
        setActiveConversation(data.conversation);
      }
    } catch (err) {
      console.error('Failed to create conversation');
    } finally {
      setSending(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-green-500 text-white">Open</Badge>;
      case 'waiting':
        return <Badge className="bg-yellow-500 text-white">Waiting</Badge>;
      case 'resolved':
        return <Badge className="bg-gray-500 text-white">Resolved</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Section className="min-h-screen bg-white">
        <Navigation />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading..." />
        </Container>
      </Section>
    );
  }

  return (
    <Section className="min-h-screen bg-white">
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
        <Stack direction="horizontal" className="flex-col md:flex-row md:items-center md:justify-between border-b-2 border-black pb-8">
          <Stack gap={2}>
            <H1>Guest Services</H1>
            <Body className="text-grey-600">
              Chat with our support team
            </Body>
          </Stack>
          <Button variant="solid" onClick={() => setShowNewChat(true)}>
            New Conversation
          </Button>
        </Stack>

        <Grid cols={3} gap={6} className="min-h-[600px]">
          <Card className="p-4 overflow-y-auto max-h-[600px]">
            <H3 className="mb-4">CONVERSATIONS</H3>
            {conversations.length > 0 ? (
              <Stack gap={2}>
                {conversations.map(conv => (
                  <Card
                    key={conv.id}
                    className={`p-3 cursor-pointer transition-colors ${
                      activeConversation?.id === conv.id
                        ? 'bg-black text-white'
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => setActiveConversation(conv)}
                  >
                    <Stack direction="horizontal" className="justify-between items-start mb-2">
                      <Body className={`font-medium ${
                        activeConversation?.id === conv.id ? 'text-white' : ''
                      }`}>
                        {conv.subject}
                      </Body>
                      {getStatusBadge(conv.status)}
                    </Stack>
                    {conv.event_title && (
                      <Body className={`text-sm ${
                        activeConversation?.id === conv.id ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        {conv.event_title}
                      </Body>
                    )}
                    <Body className={`text-xs mt-1 ${
                      activeConversation?.id === conv.id ? 'text-gray-400' : 'text-gray-400'
                    }`}>
                      {new Date(conv.created_at).toLocaleDateString()}
                    </Body>
                  </Card>
                ))}
              </Stack>
            ) : (
              <Body className="text-gray-500 text-center py-8">
                No conversations yet
              </Body>
            )}
          </Card>

          <Card className="col-span-2 flex flex-col">
            {activeConversation ? (
              <>
                <Stack className="p-4 border-b border-gray-200">
                  <Stack direction="horizontal" className="justify-between items-center">
                    <Stack>
                      <H3>{activeConversation.subject}</H3>
                      {activeConversation.event_title && (
                        <Body className="text-sm text-gray-500">
                          Re: {activeConversation.event_title}
                        </Body>
                      )}
                    </Stack>
                    {getStatusBadge(activeConversation.status)}
                  </Stack>
                </Stack>

                <Stack className="flex-1 overflow-y-auto p-4 max-h-[400px]" gap={4}>
                  {activeConversation.messages.map(message => (
                    <Stack
                      key={message.id}
                      className={`max-w-[80%] ${
                        message.sender === 'user' ? 'ml-auto' : ''
                      }`}
                    >
                      {message.sender === 'system' ? (
                        <Body className="text-center text-gray-500 text-sm py-2">
                          {message.content}
                        </Body>
                      ) : (
                        <Card
                          className={`p-3 ${
                            message.sender === 'user'
                              ? 'bg-black text-white'
                              : 'bg-gray-100'
                          }`}
                        >
                          {message.sender === 'agent' && message.agent_name && (
                            <Body className="text-xs text-gray-500 mb-1">
                              {message.agent_name}
                            </Body>
                          )}
                          <Body className={message.sender === 'user' ? 'text-white' : ''}>
                            {message.content}
                          </Body>
                          <Body className={`text-xs mt-2 ${
                            message.sender === 'user' ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </Body>
                        </Card>
                      )}
                    </Stack>
                  ))}
                  <Box ref={messagesEndRef} />
                </Stack>

                {activeConversation.status !== 'resolved' && (
                  <Stack className="p-4 border-t border-gray-200">
                    <form onSubmit={handleSendMessage}>
                      <Stack direction="horizontal" gap={2}>
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type your message..."
                          className="flex-1"
                          disabled={sending}
                        />
                        <Button type="submit" variant="solid" disabled={sending || !newMessage.trim()}>
                          {sending ? 'Sending...' : 'Send'}
                        </Button>
                      </Stack>
                    </form>
                  </Stack>
                )}
              </>
            ) : (
              <Stack className="flex-1 items-center justify-center p-8">
                <H3 className="mb-4">SELECT A CONVERSATION</H3>
                <Body className="text-gray-600 text-center mb-6">
                  Choose a conversation from the list or start a new one.
                </Body>
                <Button variant="solid" onClick={() => setShowNewChat(true)}>
                  Start New Conversation
                </Button>
              </Stack>
            )}
          </Card>
        </Grid>

        <Modal open={showNewChat} onClose={() => setShowNewChat(false)} title="NEW CONVERSATION">
          <form onSubmit={handleStartNewChat}>
            <Stack gap={4}>
              <Field label="Subject" required>
                <Input
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="What do you need help with?"
                  required
                />
              </Field>

              <Field label="Category">
                <Select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                >
                  <option value="general">General Inquiry</option>
                  <option value="tickets">Tickets & Orders</option>
                  <option value="refunds">Refunds & Exchanges</option>
                  <option value="accessibility">Accessibility</option>
                  <option value="venue">Venue Information</option>
                  <option value="technical">Technical Support</option>
                </Select>
              </Field>

              <Stack direction="horizontal" gap={4}>
                <Button type="submit" variant="solid" disabled={sending}>
                  {sending ? 'Creating...' : 'Start Chat'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewChat(false)}
                >
                  Cancel
                </Button>
              </Stack>
            </Stack>
          </form>
        </Modal>
        </Stack>
      </Container>
    </Section>
  );
}

export default function SupportChatPage() {
  return (
    <Suspense fallback={
      <Section className="min-h-screen bg-white">
        <Navigation />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading..." />
        </Container>
      </Section>
    }>
      <SupportChatContent />
    </Suspense>
  );
}
