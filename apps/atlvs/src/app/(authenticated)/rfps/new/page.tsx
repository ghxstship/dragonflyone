'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, FileText, Plus, Trash2 } from 'lucide-react';
import { useCreateRFP } from '@/hooks/useRFPs';
import { getCategoryTree } from '@ghxstship/config';

export default function NewRFPPage() {
  const router = useRouter();
  const createMutation = useCreateRFP();
  
  // Get hierarchical category tree from unified catalog system
  const categoryTree = getCategoryTree();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    issuer: '',
    deadline: '',
    budget_range: '',
    category: '',
    status: 'draft' as const,
  });

  const [requirements, setRequirements] = useState<string[]>(['']);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.description) newErrors.description = 'Description is required';
    if (!formData.issuer) newErrors.issuer = 'Issuer is required';
    if (!formData.deadline) newErrors.deadline = 'Deadline is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await createMutation.mutateAsync({
        ...formData,
        requirements: requirements.filter(r => r.trim() !== ''),
      });
      router.push('/rfps');
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to create RFP',
      });
    }
  };

  const addRequirement = () => {
    setRequirements([...requirements, '']);
  };

  const updateRequirement = (index: number, value: string) => {
    const updated = [...requirements];
    updated[index] = value;
    setRequirements(updated);
  };

  const removeRequirement = (index: number) => {
    if (requirements.length > 1) {
      setRequirements(requirements.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <a
          href="/rfps"
          className="inline-flex items-center gap-2 text-body-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to RFPs
        </a>
      </div>

      <div className="bg-background border-2 border-border rounded-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-primary/10 rounded-card">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-h3-md font-weight-bold text-foreground">Create RFP</h1>
            <p className="text-body-sm text-muted-foreground">
              Send a request for proposal to multiple vendors
            </p>
          </div>
        </div>

        {errors.submit && (
          <div className="mb-6 p-4 bg-destructive/10 border-2 border-destructive rounded-card text-destructive text-body-sm">
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-body-sm font-weight-medium text-foreground mb-2">
              Title *
            </label>
            <input
              type="text"
              placeholder="e.g., A/V Services for Annual Gala"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
            {errors.title && (
              <p className="mt-1 text-body-xs text-destructive">{errors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-body-sm font-weight-medium text-foreground mb-2">
              Description *
            </label>
            <textarea
              rows={4}
              placeholder="Describe the services or products you need..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
            />
            {errors.description && (
              <p className="mt-1 text-body-xs text-destructive">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-body-sm font-weight-medium text-foreground mb-2">
                Issuer / Organization *
              </label>
              <input
                type="text"
                placeholder="Your organization name"
                value={formData.issuer}
                onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
              {errors.issuer && (
                <p className="mt-1 text-body-xs text-destructive">{errors.issuer}</p>
              )}
            </div>

            <div>
              <label className="block text-body-sm font-weight-medium text-foreground mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="">Select category</option>
                {categoryTree.map((parent) => (
                  <optgroup key={parent.code} label={parent.name}>
                    {parent.children.map((child) => (
                      <option key={child.code} value={child.code}>
                        {child.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-body-sm font-weight-medium text-foreground mb-2">
                Deadline *
              </label>
              <input
                type="datetime-local"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
              {errors.deadline && (
                <p className="mt-1 text-body-xs text-destructive">{errors.deadline}</p>
              )}
            </div>

            <div>
              <label className="block text-body-sm font-weight-medium text-foreground mb-2">
                Budget Range
              </label>
              <input
                type="text"
                placeholder="e.g., $5,000 - $10,000"
                value={formData.budget_range}
                onChange={(e) => setFormData({ ...formData, budget_range: e.target.value })}
                className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-body-sm font-weight-medium text-foreground">
                Requirements
              </label>
              <button
                type="button"
                onClick={addRequirement}
                className="inline-flex items-center gap-1 px-2 py-1 text-body-xs font-weight-medium text-primary hover:bg-primary/10 rounded-button transition-colors"
              >
                <Plus className="h-3 w-3" />
                Add
              </button>
            </div>
            <div className="space-y-2">
              {requirements.map((req, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={`Requirement ${index + 1}`}
                    value={req}
                    onChange={(e) => updateRequirement(index, e.target.value)}
                    className="flex-1 px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => removeRequirement(index)}
                    disabled={requirements.length === 1}
                    className="p-2 text-muted-foreground hover:text-destructive disabled:opacity-30 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <a
              href="/rfps"
              className="px-4 py-2 border-2 border-border rounded-button text-body-sm font-weight-medium hover:bg-muted transition-colors"
            >
              Cancel
            </a>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary font-weight-medium text-body-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {createMutation.isPending ? 'Creating...' : 'Create RFP'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
