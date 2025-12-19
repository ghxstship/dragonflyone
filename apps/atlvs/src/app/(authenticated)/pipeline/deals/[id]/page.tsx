'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit2, Trash2, User, Mail, Phone, MoreVertical, CheckCircle, XCircle, Clock } from 'lucide-react';
import { usePipelineDeal, useDeleteDeal, useMoveDeals } from '@/hooks/usePipeline';

const STAGES = [
  { id: 'lead', name: 'Lead', color: 'bg-ink-100 text-ink-800' },
  { id: 'qualified', name: 'Qualified', color: 'bg-info-100 text-info-800' },
  { id: 'proposal', name: 'Proposal', color: 'bg-warning-100 text-warning-800' },
  { id: 'negotiation', name: 'Negotiation', color: 'bg-violet-100 text-violet-800' },
  { id: 'closed_won', name: 'Closed Won', color: 'bg-success-100 text-success-800' },
  { id: 'closed_lost', name: 'Closed Lost', color: 'bg-error-100 text-error-800' },
];

export default function DealDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dealId = params.id as string;

  const { data, isLoading, error } = usePipelineDeal(dealId);
  const deleteDeal = useDeleteDeal();
  const moveDeal = useMoveDeals();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showStageMenu, setShowStageMenu] = useState(false);

  const deal = data?.deal;
  const activities = data?.activities || [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStageInfo = (stageId: string) => {
    return STAGES.find(s => s.id === stageId) || STAGES[0];
  };

  const handleStageChange = async (newStage: string) => {
    setShowStageMenu(false);
    await moveDeal.mutateAsync({ dealId, stage: newStage });
  };

  const handleDelete = async () => {
    await deleteDeal.mutateAsync(dealId);
    router.push('/pipeline');
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading deal...</div>
      </div>
    );
  }

  if (error || !deal) {
    return (
      <div className="p-6">
        <div className="text-center py-12 bg-destructive/10 border-2 border-destructive rounded-card">
          <p className="text-destructive">Deal not found</p>
          <Link href="/pipeline" className="text-primary hover:underline mt-2 inline-block">
            Back to Pipeline
          </Link>
        </div>
      </div>
    );
  }

  const stageInfo = getStageInfo(deal.stage);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/pipeline"
            className="p-2 hover:bg-muted rounded-button transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-h2-md font-weight-bold text-foreground">{deal.name}</h1>
              <span className={`px-3 py-1 rounded-avatar text-body-xs font-weight-medium ${stageInfo.color}`}>
                {stageInfo.name}
              </span>
            </div>
            <p className="text-body-sm text-muted-foreground mt-1">
              {deal.deal_number} • Created {formatDate(deal.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setShowStageMenu(!showStageMenu)}
              className="flex items-center gap-2 px-4 py-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
            >
              Move Stage
              <MoreVertical className="h-4 w-4" />
            </button>
            {showStageMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-background border-2 border-border rounded-card shadow-lg z-10">
                {STAGES.map((stage) => (
                  <button
                    key={stage.id}
                    onClick={() => handleStageChange(stage.id)}
                    disabled={stage.id === deal.stage}
                    className={`w-full text-left px-4 py-2 text-body-sm hover:bg-muted transition-colors ${
                      stage.id === deal.stage ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {stage.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Link
            href={`/pipeline/deals/${dealId}/edit`}
            className="flex items-center gap-2 px-4 py-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
          >
            <Edit2 className="h-4 w-4" />
            Edit
          </Link>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 border-2 border-destructive text-destructive rounded-button hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-background border-2 border-border rounded-card p-6">
            <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">Deal Value</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-body-xs text-muted-foreground mb-1">Value</p>
                <p className="text-h3-md font-weight-bold text-foreground">
                  {formatCurrency(deal.value || 0)}
                </p>
              </div>
              <div>
                <p className="text-body-xs text-muted-foreground mb-1">Probability</p>
                <p className="text-h3-md font-weight-bold text-foreground">
                  {deal.probability || 0}%
                </p>
              </div>
              <div>
                <p className="text-body-xs text-muted-foreground mb-1">Weighted Value</p>
                <p className="text-h3-md font-weight-bold text-primary">
                  {formatCurrency((deal.value || 0) * (deal.probability || 0) / 100)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-background border-2 border-border rounded-card p-6">
            <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">Contact Information</h2>
            <div className="space-y-3">
              {deal.contact_name && (
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <span className="text-body-md text-foreground">{deal.contact_name}</span>
                </div>
              )}
              {deal.contact_email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <a href={`mailto:${deal.contact_email}`} className="text-body-md text-primary hover:underline">
                    {deal.contact_email}
                  </a>
                </div>
              )}
              {deal.contact_phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <a href={`tel:${deal.contact_phone}`} className="text-body-md text-primary hover:underline">
                    {deal.contact_phone}
                  </a>
                </div>
              )}
              {!deal.contact_name && !deal.contact_email && !deal.contact_phone && (
                <p className="text-body-sm text-muted-foreground">No contact information</p>
              )}
            </div>
          </div>

          {deal.notes && (
            <div className="bg-background border-2 border-border rounded-card p-6">
              <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">Notes</h2>
              <p className="text-body-md text-foreground whitespace-pre-wrap">{deal.notes}</p>
            </div>
          )}

          <div className="bg-background border-2 border-border rounded-card p-6">
            <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">Activity History</h2>
            {activities.length === 0 ? (
              <p className="text-body-sm text-muted-foreground">No activity yet</p>
            ) : (
              <div className="space-y-4">
                {activities.map((activity: { id: string; activity_type: string; description: string; created_at: string }) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="p-2 bg-muted rounded-avatar">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-body-sm text-foreground">{activity.description}</p>
                      <p className="text-body-xs text-muted-foreground">
                        {formatDate(activity.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-background border-2 border-border rounded-card p-6">
            <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">Details</h2>
            <div className="space-y-4">
              {deal.expected_close_date && (
                <div className="flex items-center justify-between">
                  <span className="text-body-sm text-muted-foreground">Expected Close</span>
                  <span className="text-body-sm font-weight-medium text-foreground">
                    {formatDate(deal.expected_close_date)}
                  </span>
                </div>
              )}
              {deal.source && (
                <div className="flex items-center justify-between">
                  <span className="text-body-sm text-muted-foreground">Source</span>
                  <span className="text-body-sm font-weight-medium text-foreground capitalize">
                    {deal.source.replace('_', ' ')}
                  </span>
                </div>
              )}
              {deal.assignee && (
                <div className="flex items-center justify-between">
                  <span className="text-body-sm text-muted-foreground">Assigned To</span>
                  <span className="text-body-sm font-weight-medium text-foreground">
                    {deal.assignee.full_name}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-body-sm text-muted-foreground">Last Updated</span>
                <span className="text-body-sm font-weight-medium text-foreground">
                  {formatDate(deal.updated_at)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-background border-2 border-border rounded-card p-6">
            <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button
                onClick={() => handleStageChange('closed_won')}
                disabled={deal.stage === 'closed_won'}
                className="w-full flex items-center gap-2 px-4 py-2 bg-success text-white rounded-button hover:bg-success/90 transition-colors disabled:opacity-50"
              >
                <CheckCircle className="h-4 w-4" />
                Mark as Won
              </button>
              <button
                onClick={() => handleStageChange('closed_lost')}
                disabled={deal.stage === 'closed_lost'}
                className="w-full flex items-center gap-2 px-4 py-2 bg-destructive text-white rounded-button hover:bg-destructive/90 transition-colors disabled:opacity-50"
              >
                <XCircle className="h-4 w-4" />
                Mark as Lost
              </button>
            </div>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border-2 border-border rounded-card p-6 max-w-md w-full mx-4">
            <h3 className="text-h4-md font-weight-semibold text-foreground mb-2">Delete Deal</h3>
            <p className="text-body-sm text-muted-foreground mb-4">
              Are you sure you want to delete &quot;{deal.name}&quot;? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteDeal.isPending}
                className="px-4 py-2 bg-destructive text-white rounded-button hover:bg-destructive/90 transition-colors disabled:opacity-50"
              >
                {deleteDeal.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
