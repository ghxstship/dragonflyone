'use client';

import {
  Body,
  Button,
  H1,
  H2,
  Input,
  Label,
  Text,
  Textarea,
} from '@ghxstship/ui';

import { useState } from 'react';
import { Search, MessageSquare, Send, User, Calendar, Clock, Mail, Phone, CheckCircle } from 'lucide-react';
import { useVendorCommunications, useSendVendorMessage } from '@/hooks/useVendorSchedules';

interface Communication {
  id: string;
  vendor_name: string;
  vendor_email: string;
  booking_number?: string;
  event_name?: string;
  message_type: 'email' | 'sms' | 'portal';
  subject: string;
  message: string;
  sent_at: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
}

export default function VendorCommunicationsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [newMessage, setNewMessage] = useState({ vendor_id: '', subject: '', message: '' });

  const { data, isLoading, error } = useVendorCommunications();
  const sendMessage = useSendVendorMessage();

  const communications: Communication[] = data?.communications || [];

  const filteredCommunications = communications.filter((comm) =>
    comm.vendor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    comm.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    comm.event_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'read':
        return { label: status === 'read' ? 'Read' : 'Delivered', color: 'bg-success/20 text-success' };
      case 'sent':
        return { label: 'Sent', color: 'bg-primary/20 text-primary' };
      case 'failed':
        return { label: 'Failed', color: 'bg-destructive/20 text-destructive' };
      default:
        return { label: status, color: 'bg-muted text-muted-foreground' };
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'sms':
        return <Phone className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.vendor_id || !newMessage.subject || !newMessage.message) return;
    try {
      await sendMessage.mutateAsync(newMessage);
      setShowComposeModal(false);
      setNewMessage({ vendor_id: '', subject: '', message: '' });
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const sentToday = communications.filter((c) => {
    const today = new Date();
    const sentDate = new Date(c.sent_at);
    return sentDate.toDateString() === today.toDateString();
  }).length;

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading communications...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12 bg-destructive/10 border-2 border-destructive rounded-card">
          <Body className="text-destructive">Failed to load communications</Body>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <H1 className="text-h2-md font-weight-bold text-foreground">Vendor Communications</H1>
          <Body className="text-body-sm text-muted-foreground mt-1">
            Message history and vendor correspondence
          </Body>
        </div>
        <Button
          onClick={() => setShowComposeModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary font-weight-medium text-body-sm hover:bg-primary/90 transition-colors"
        >
          <Send className="h-4 w-4" />
          New Message
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <Text className="text-body-sm text-muted-foreground">Total Messages</Text>
          </div>
          <Body className="text-h3-md font-weight-bold text-foreground">{communications.length}</Body>
        </div>
        <div className="bg-background border-2 border-success/50 rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5 text-success" />
            <Text className="text-body-sm text-muted-foreground">Delivered</Text>
          </div>
          <Body className="text-h3-md font-weight-bold text-success">
            {communications.filter((c) => c.status === 'delivered' || c.status === 'read').length}
          </Body>
        </div>
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-foreground" />
            <Text className="text-body-sm text-muted-foreground">Sent Today</Text>
          </div>
          <Body className="text-h3-md font-weight-bold text-foreground">{sentToday}</Body>
        </div>
      </div>

      <div className="bg-background border-2 border-border rounded-card">
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by vendor, subject, or event..."
              className="w-full pl-10 pr-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
          {filteredCommunications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No communications found
            </div>
          ) : (
            filteredCommunications.map((comm) => {
              const statusConfig = getStatusConfig(comm.status);
              return (
                <div key={comm.id} className="p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-avatar flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Body className="text-body-sm font-weight-medium text-foreground">{comm.vendor_name}</Body>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            {getTypeIcon(comm.message_type)}
                          </div>
                        </div>
                        <Body className="text-body-sm text-foreground mt-1">{comm.subject}</Body>
                        <Body className="text-body-xs text-muted-foreground mt-1 line-clamp-2">
                          {comm.message}
                        </Body>
                        {comm.event_name && (
                          <Body className="text-body-xs text-muted-foreground mt-1">
                            Event: {comm.event_name}
                          </Body>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Text className={`px-2 py-1 rounded-badge text-body-xs font-weight-medium ${statusConfig.color}`}>
                        {statusConfig.label}
                      </Text>
                      <Text className="text-body-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(comm.sent_at)}
                      </Text>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {showComposeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border-2 border-border rounded-card p-6 w-full max-w-lg">
            <H2 className="text-h4-md font-weight-semibold text-foreground mb-4">
              New Message
            </H2>
            <div className="space-y-4 mb-6">
              <div>
                <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  Vendor ID
                </Label>
                <Input
                  type="text"
                  value={newMessage.vendor_id}
                  onChange={(e) => setNewMessage({ ...newMessage, vendor_id: e.target.value })}
                  placeholder="Enter vendor ID"
                  className="w-full px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  Subject
                </Label>
                <Input
                  type="text"
                  value={newMessage.subject}
                  onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                  placeholder="Message subject"
                  className="w-full px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  Message
                </Label>
                <Textarea
                  value={newMessage.message}
                  onChange={(e) => setNewMessage({ ...newMessage, message: e.target.value })}
                  placeholder="Type your message..."
                  rows={4}
                  className="w-full px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3">
              <Button
                onClick={() => setShowComposeModal(false)}
                className="px-4 py-2 border-2 border-border rounded-button text-body-sm font-weight-medium hover:bg-muted transition-colors"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendMessage}
                disabled={sendMessage.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary text-body-sm font-weight-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                {sendMessage.isPending ? 'Sending...' : 'Send'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
