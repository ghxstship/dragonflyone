'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, BarChart3, Settings, DollarSign, Users, TrendingUp, MoreVertical } from 'lucide-react';
import { usePipelineDeals, useMoveDeals } from '@/hooks/usePipeline';
import { Button } from '@ghxstship/ui';

const STAGES = [
  { id: 'lead', name: 'Lead', color: 'bg-ink-100 border-ink-300' },
  { id: 'qualified', name: 'Qualified', color: 'bg-info-50 border-info-300' },
  { id: 'proposal', name: 'Proposal', color: 'bg-warning-50 border-warning-300' },
  { id: 'negotiation', name: 'Negotiation', color: 'bg-violet-50 border-violet-300' },
  { id: 'closed_won', name: 'Closed Won', color: 'bg-success-50 border-success-300' },
  { id: 'closed_lost', name: 'Closed Lost', color: 'bg-error-50 border-error-300' },
];

export default function PipelinePage() {
  const [showClosedStages, setShowClosedStages] = useState(false);
  const { data, isLoading, error } = usePipelineDeals();
  const moveDeal = useMoveDeals();

  const deals = data?.deals || [];
  const summary = data?.summary || { total_deals: 0, total_value: 0, weighted_value: 0 };

  const visibleStages = showClosedStages 
    ? STAGES 
    : STAGES.filter(s => !s.id.startsWith('closed_'));

  const getDealsByStage = (stageId: string) => {
    return deals.filter(deal => deal.stage === stageId);
  };

  const getStageValue = (stageId: string) => {
    return getDealsByStage(stageId).reduce((sum, deal) => sum + (deal.value || 0), 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    e.dataTransfer.setData('dealId', dealId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData('dealId');
    if (dealId) {
      moveDeal.mutate({ dealId, stage: stageId });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading pipeline...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12 bg-destructive/10 border-2 border-destructive rounded-card">
          <p className="text-destructive">Failed to load pipeline data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-h2-md font-weight-bold text-foreground">Sales Pipeline</h1>
            <p className="text-body-sm text-muted-foreground mt-1">
              Manage and track your deals through the sales process
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/pipeline/analytics"
              className="flex items-center gap-2 px-4 py-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="text-body-sm">Analytics</span>
            </Link>
            <Link
              href="/pipeline/settings"
              className="flex items-center gap-2 px-4 py-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
            >
              <Settings className="h-4 w-4" />
              <span className="text-body-sm">Settings</span>
            </Link>
            <Link
              href="/pipeline/deals/new"
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span className="text-body-sm font-weight-medium">New Deal</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="bg-background border-2 border-border rounded-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-body-sm text-muted-foreground">Total Deals</span>
            </div>
            <p className="text-h3-md font-weight-bold text-foreground">{summary.total_deals}</p>
          </div>
          <div className="bg-background border-2 border-border rounded-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-success" />
              <span className="text-body-sm text-muted-foreground">Pipeline Value</span>
            </div>
            <p className="text-h3-md font-weight-bold text-foreground">
              {formatCurrency(summary.total_value)}
            </p>
          </div>
          <div className="bg-background border-2 border-border rounded-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-warning" />
              <span className="text-body-sm text-muted-foreground">Weighted Value</span>
            </div>
            <p className="text-h3-md font-weight-bold text-foreground">
              {formatCurrency(summary.weighted_value)}
            </p>
          </div>
          <div className="bg-background border-2 border-border rounded-card p-4 flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showClosedStages}
                onChange={(e) => setShowClosedStages(e.target.checked)}
                className="rounded border-border"
              />
              <span className="text-body-sm text-muted-foreground">Show closed stages</span>
            </label>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto p-6">
        <div className="flex gap-4 h-full min-w-max">
          {visibleStages.map((stage) => {
            const stageDeals = getDealsByStage(stage.id);
            const stageValue = getStageValue(stage.id);

            return (
              <div
                key={stage.id}
                className={`w-80 flex-shrink-0 rounded-card border-2 ${stage.color} flex flex-col`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.id)}
              >
                <div className="p-4 border-b border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-body-md font-weight-semibold text-foreground">
                      {stage.name}
                    </h3>
                    <span className="text-body-xs bg-background px-2 py-1 rounded-avatar">
                      {stageDeals.length}
                    </span>
                  </div>
                  <p className="text-body-sm text-muted-foreground">
                    {formatCurrency(stageValue)}
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {stageDeals.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-body-sm">
                      No deals in this stage
                    </div>
                  ) : (
                    stageDeals.map((deal) => (
                      <div
                        key={deal.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, deal.id)}
                        className="bg-background border-2 border-border rounded-card p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <Link
                            href={`/pipeline/deals/${deal.id}`}
                            className="text-body-sm font-weight-medium text-foreground hover:text-primary"
                          >
                            {deal.name}
                          </Link>
                          <Button variant="ghost" size="icon" className="p-1">
                            <MoreVertical className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                        {deal.client && (
                          <p className="text-body-xs text-muted-foreground mb-2">
                            {(deal.client as { name?: string }).name}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-body-sm font-weight-semibold text-foreground">
                            {formatCurrency(deal.value || 0)}
                          </span>
                          <span className="text-body-xs text-muted-foreground">
                            {deal.probability}%
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-3 border-t border-border/50">
                  <Link
                    href={`/pipeline/deals/new?stage=${stage.id}`}
                    className="flex items-center justify-center gap-2 w-full py-2 text-body-sm text-muted-foreground hover:text-foreground hover:bg-background/50 rounded-button transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Add Deal
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
