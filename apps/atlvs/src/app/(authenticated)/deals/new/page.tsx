"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import {
  Button,
  Card,
  EnterprisePageHeader,
  Form,
  Grid,
  H3,
  Input,
  Label,
  Select,
  Stack,
  Textarea,
} from '@ghxstship/ui';

export default function NewDealPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    client: "",
    contact: "",
    value: "",
    stage: "lead",
    probability: "25",
    expected_close: "",
    source: "",
    description: "",
    notes: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/deals");
  };

  return (
    <Stack gap={8}>
      <EnterprisePageHeader
        title="New Deal"
        subtitle="Create a new sales opportunity"
        showFavorite
        showSettings
      />

      <Form onSubmit={handleSubmit}>
        <Stack gap={6}>
          <Card inverted className="border-2 border-ink-800 p-6">
            <Stack gap={4}>
              <H3 className="text-white">Deal Information</H3>
              <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                <div>
                  <Label htmlFor="title" className="text-grey-400 mb-2 block text-body-sm">Deal Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter deal title"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="client" className="text-grey-400 mb-2 block text-body-sm">Client/Company *</Label>
                  <Input
                    id="client"
                    name="client"
                    value={formData.client}
                    onChange={handleChange}
                    placeholder="Select or enter client"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contact" className="text-grey-400 mb-2 block text-body-sm">Primary Contact</Label>
                  <Input
                    id="contact"
                    name="contact"
                    value={formData.contact}
                    onChange={handleChange}
                    placeholder="Contact name"
                  />
                </div>
                <div>
                  <Label htmlFor="source" className="text-grey-400 mb-2 block text-body-sm">Lead Source</Label>
                  <Select
                    id="source"
                    name="source"
                    value={formData.source}
                    onChange={handleChange}
                    className="w-full h-10 px-3 rounded-button border-2 border-ink-700 bg-ink-900 text-white"
                  >
                    <option value="">Select source</option>
                    <option value="referral">Referral</option>
                    <option value="website">Website</option>
                    <option value="cold_outreach">Cold Outreach</option>
                    <option value="event">Event</option>
                    <option value="partner">Partner</option>
                  </Select>
                </div>
              </Grid>
            </Stack>
          </Card>

          <Card inverted className="border-2 border-ink-800 p-6">
            <Stack gap={4}>
              <H3 className="text-white">Deal Value & Stage</H3>
              <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                <div>
                  <Label htmlFor="value" className="text-grey-400 mb-2 block text-body-sm">Deal Value *</Label>
                  <Input
                    id="value"
                    name="value"
                    type="number"
                    value={formData.value}
                    onChange={handleChange}
                    placeholder="Enter deal value"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="stage" className="text-grey-400 mb-2 block text-body-sm">Pipeline Stage</Label>
                  <Select
                    id="stage"
                    name="stage"
                    value={formData.stage}
                    onChange={handleChange}
                    className="w-full h-10 px-3 rounded-button border-2 border-ink-700 bg-ink-900 text-white"
                  >
                    <option value="lead">Lead</option>
                    <option value="qualified">Qualified</option>
                    <option value="proposal">Proposal</option>
                    <option value="negotiation">Negotiation</option>
                    <option value="closed_won">Closed Won</option>
                    <option value="closed_lost">Closed Lost</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="probability" className="text-grey-400 mb-2 block text-body-sm">Win Probability (%)</Label>
                  <Input
                    id="probability"
                    name="probability"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.probability}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="expected_close" className="text-grey-400 mb-2 block text-body-sm">Expected Close Date</Label>
                  <Input
                    id="expected_close"
                    name="expected_close"
                    type="date"
                    value={formData.expected_close}
                    onChange={handleChange}
                  />
                </div>
              </Grid>
            </Stack>
          </Card>

          <Card inverted className="border-2 border-ink-800 p-6">
            <Stack gap={4}>
              <H3 className="text-white">Additional Details</H3>
              <div>
                <Label htmlFor="description" className="text-grey-400 mb-2 block text-body-sm">Deal Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the opportunity..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-card border-2 border-ink-700 bg-ink-900 text-white resize-none"
                />
              </div>
              <div>
                <Label htmlFor="notes" className="text-grey-400 mb-2 block text-body-sm">Internal Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Add any internal notes..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-card border-2 border-ink-700 bg-ink-900 text-white resize-none"
                />
              </div>
            </Stack>
          </Card>

          <div className="flex justify-between">
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="size-4 mr-2" /> Cancel
            </Button>
            <Button type="submit" variant="ghost">
              <Save className="size-4 mr-2" /> Create Deal
            </Button>
          </div>
        </Stack>
      </Form>
    </Stack>
  );
}
