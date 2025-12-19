'use client';

import { useState } from 'react';
import { Search, DollarSign, TrendingUp, TrendingDown, BarChart3, PieChart, Filter } from 'lucide-react';
import { useProjectCosts } from '@/hooks/useProjectCosts';

export default function ProjectCostsPage() {
  const [selectedBookingId, setSelectedBookingId] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const { data, isLoading, error } = useProjectCosts(selectedBookingId || undefined);

  const costs = data?.costs || [];
  const summary = data?.summary || {
    total_budgeted: 0,
    total_actual: 0,
    total_variance: 0,
    variance_percent: 0,
    is_over_budget: false,
    projected_profit: 0,
    projected_margin: 0,
  };
  const categoryTotals = data?.by_category || [];

  const filteredCosts = costs.filter((cost) => {
    return categoryFilter === 'all' || cost.category === categoryFilter;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const categories = [...new Set(costs.map((c) => c.category || 'Uncategorized'))];

  if (isLoading && selectedBookingId) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading project costs...</div>
      </div>
    );
  }

  if (error && selectedBookingId) {
    return (
      <div className="p-6">
        <div className="text-center py-12 bg-destructive/10 border-2 border-destructive rounded-card">
          <p className="text-destructive">Failed to load project costs</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h2-md font-weight-bold text-foreground">Project Costs</h1>
          <p className="text-body-sm text-muted-foreground mt-1">
            Track budget vs actual costs for your projects
          </p>
        </div>
      </div>

      <div className="bg-background border-2 border-border rounded-card p-4">
        <label className="block text-body-sm font-weight-medium text-foreground mb-2">
          Select Project
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={selectedBookingId}
            onChange={(e) => setSelectedBookingId(e.target.value)}
            placeholder="Enter booking ID to view costs..."
            className="w-full pl-10 pr-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {selectedBookingId && data && (
        <>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-background border-2 border-border rounded-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <span className="text-body-sm text-muted-foreground">Budgeted</span>
              </div>
              <p className="text-h3-md font-weight-bold text-foreground">
                {formatCurrency(summary.total_budgeted)}
              </p>
            </div>
            <div className="bg-background border-2 border-border rounded-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-secondary" />
                <span className="text-body-sm text-muted-foreground">Actual</span>
              </div>
              <p className="text-h3-md font-weight-bold text-foreground">
                {formatCurrency(summary.total_actual)}
              </p>
            </div>
            <div className={`bg-background border-2 rounded-card p-4 ${
              summary.is_over_budget ? 'border-destructive/50' : 'border-success/50'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {summary.is_over_budget ? (
                  <TrendingDown className="h-5 w-5 text-destructive" />
                ) : (
                  <TrendingUp className="h-5 w-5 text-success" />
                )}
                <span className="text-body-sm text-muted-foreground">Variance</span>
              </div>
              <p className={`text-h3-md font-weight-bold ${
                summary.is_over_budget ? 'text-destructive' : 'text-success'
              }`}>
                {formatCurrency(Math.abs(summary.total_variance))}
                <span className="text-body-sm ml-1">
                  ({summary.is_over_budget ? '-' : '+'}{Math.abs(summary.variance_percent)}%)
                </span>
              </p>
            </div>
            <div className="bg-background border-2 border-border rounded-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-5 w-5 text-accent" />
                <span className="text-body-sm text-muted-foreground">Projected Margin</span>
              </div>
              <p className="text-h3-md font-weight-bold text-foreground">
                {summary.projected_margin.toFixed(1)}%
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-background border-2 border-border rounded-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-h4-md font-weight-semibold text-foreground">By Category</h2>
                <PieChart className="h-5 w-5 text-muted-foreground" />
              </div>
              {categoryTotals.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  No category data available
                </div>
              ) : (
                <div className="space-y-3">
                  {categoryTotals.map((cat, index) => {
                    const colors = ['bg-primary', 'bg-secondary', 'bg-accent', 'bg-success', 'bg-warning'];
                    const percentage = summary.total_actual > 0
                      ? (cat.actual / summary.total_actual) * 100
                      : 0;
                    return (
                      <div key={cat.category}>
                        <div className="flex items-center justify-between text-body-sm mb-1">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-avatar ${colors[index % colors.length]}`} />
                            <span className="text-foreground">{cat.category}</span>
                          </div>
                          <span className="font-weight-medium text-foreground">
                            {formatCurrency(cat.actual)}
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-avatar overflow-hidden">
                          <div
                            className={`h-full ${colors[index % colors.length]} rounded-avatar transition-all`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-background border-2 border-border rounded-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-h4-md font-weight-semibold text-foreground">Budget vs Actual</h2>
                <BarChart3 className="h-5 w-5 text-muted-foreground" />
              </div>
              {categoryTotals.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  No comparison data available
                </div>
              ) : (
                <div className="space-y-4">
                  {categoryTotals.map((cat) => (
                    <div key={cat.category}>
                      <div className="flex items-center justify-between text-body-sm mb-1">
                        <span className="text-foreground">{cat.category}</span>
                        <span className={`font-weight-medium ${
                          cat.variance < 0 ? 'text-destructive' : 'text-success'
                        }`}>
                          {cat.variance >= 0 ? '+' : ''}{formatCurrency(cat.variance)}
                        </span>
                      </div>
                      <div className="flex gap-2 text-body-xs text-muted-foreground">
                        <span>Budget: {formatCurrency(cat.budgeted)}</span>
                        <span>|</span>
                        <span>Actual: {formatCurrency(cat.actual)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-background border-2 border-border rounded-card">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="text-h4-md font-weight-semibold text-foreground">Cost Details</h2>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-1.5 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="px-4 py-3 text-left text-body-xs font-weight-semibold text-muted-foreground">Description</th>
                    <th className="px-4 py-3 text-left text-body-xs font-weight-semibold text-muted-foreground">Category</th>
                    <th className="px-4 py-3 text-left text-body-xs font-weight-semibold text-muted-foreground">Vendor</th>
                    <th className="px-4 py-3 text-right text-body-xs font-weight-semibold text-muted-foreground">Budgeted</th>
                    <th className="px-4 py-3 text-right text-body-xs font-weight-semibold text-muted-foreground">Actual</th>
                    <th className="px-4 py-3 text-right text-body-xs font-weight-semibold text-muted-foreground">Variance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredCosts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                        No costs found
                      </td>
                    </tr>
                  ) : (
                    filteredCosts.map((cost) => (
                      <tr key={cost.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3 text-body-sm text-foreground">{cost.description}</td>
                        <td className="px-4 py-3 text-body-sm text-muted-foreground">{cost.category}</td>
                        <td className="px-4 py-3 text-body-sm text-muted-foreground">
                          {cost.vendor_profile?.name || '-'}
                        </td>
                        <td className="px-4 py-3 text-body-sm text-foreground text-right">
                          {formatCurrency(cost.budgeted_amount || 0)}
                        </td>
                        <td className="px-4 py-3 text-body-sm text-foreground text-right">
                          {formatCurrency(cost.actual_amount || 0)}
                        </td>
                        <td className={`px-4 py-3 text-body-sm text-right font-weight-medium ${
                          (cost.variance || 0) < 0 ? 'text-destructive' : 'text-success'
                        }`}>
                          {(cost.variance || 0) >= 0 ? '+' : ''}{formatCurrency(cost.variance || 0)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!selectedBookingId && (
        <div className="bg-background border-2 border-border rounded-card p-12 text-center">
          <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-h4-md font-weight-semibold text-foreground mb-2">
            Select a Project
          </h3>
          <p className="text-body-sm text-muted-foreground">
            Enter a booking ID above to view project costs and budget analysis
          </p>
        </div>
      )}
    </div>
  );
}
