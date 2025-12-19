'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, Calendar, FileText, DollarSign, MessageSquare, Clock } from 'lucide-react';
import { useContact } from '@/hooks/useContacts';
import { useQuery } from '@tanstack/react-query';

interface Activity {
  id: string;
  type: 'email' | 'call' | 'meeting' | 'note' | 'deal' | 'booking';
  title: string;
  description?: string;
  created_at: string;
  created_by?: string;
  metadata?: Record<string, unknown>;
}

export default function ContactTimelinePage() {
  const params = useParams();
  const contactId = params.id as string;

  const { data: contact } = useContact(contactId);

  const { data: activities, isLoading } = useQuery({
    queryKey: ['contact-activities', contactId],
    queryFn: async () => {
      const response = await fetch(`/api/contacts/${contactId}/activities`);
      if (!response.ok) {
        // Return empty array on error
        return [];
      }
      const data = await response.json();
      return data.activities as Activity[];
    },
    enabled: !!contactId,
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'call':
        return <Phone className="h-4 w-4" />;
      case 'meeting':
        return <Calendar className="h-4 w-4" />;
      case 'note':
        return <MessageSquare className="h-4 w-4" />;
      case 'deal':
        return <DollarSign className="h-4 w-4" />;
      case 'booking':
        return <FileText className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'email':
        return 'bg-info-100 text-info-600';
      case 'call':
        return 'bg-success-100 text-success-600';
      case 'meeting':
        return 'bg-violet-100 text-violet-600';
      case 'note':
        return 'bg-warning-100 text-warning-600';
      case 'deal':
        return 'bg-success-100 text-success-600';
      case 'booking':
        return 'bg-violet-100 text-violet-600';
      default:
        return 'bg-ink-100 text-ink-600';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading timeline...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/contacts/${contactId}`}
            className="p-2 hover:bg-muted rounded-button transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div>
            <h1 className="text-h2-md font-weight-bold text-foreground">Activity Timeline</h1>
            <p className="text-body-sm text-muted-foreground mt-1">
              {contact?.first_name} {contact?.last_name}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl">
        {!activities || activities.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 border-2 border-dashed border-border rounded-card">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-body-md text-muted-foreground">No activity recorded yet</p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
            <div className="space-y-6">
              {activities.map((activity) => (
                <div key={activity.id} className="relative flex items-start gap-4 pl-14">
                  <div className={`absolute left-4 w-5 h-5 rounded-avatar flex items-center justify-center ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 bg-background border-2 border-border rounded-card p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-body-md font-weight-medium text-foreground">
                          {activity.title}
                        </h3>
                        <p className="text-body-xs text-muted-foreground capitalize">
                          {activity.type}
                        </p>
                      </div>
                      <span className="text-body-xs text-muted-foreground">
                        {formatDate(activity.created_at)}
                      </span>
                    </div>
                    {activity.description && (
                      <p className="text-body-sm text-muted-foreground">
                        {activity.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
