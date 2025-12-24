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

export default function NewProjectPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    client: "",
    type: "production",
    start_date: "",
    end_date: "",
    budget: "",
    description: "",
    venue: "",
    capacity: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/projects");
  };

  return (
    <Stack gap={8}>
      <EnterprisePageHeader
        title="New Project"
        subtitle="Create a new production project"
        showFavorite
        showSettings
      />

      <Form onSubmit={handleSubmit}>
        <Stack gap={6}>
          <Card inverted className="border-2 border-ink-800 p-6">
            <Stack gap={4}>
              <H3 className="text-white">Project Details</H3>
              <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                <div>
                  <Label htmlFor="name" className="text-grey-400 mb-2 block text-body-sm">Project Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter project name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="client" className="text-grey-400 mb-2 block text-body-sm">Client *</Label>
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
                  <Label htmlFor="type" className="text-grey-400 mb-2 block text-body-sm">Project Type</Label>
                  <Select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full h-10 px-3 rounded-button border-2 border-ink-700 bg-ink-900 text-white"
                  >
                    <option value="production">Production</option>
                    <option value="event">Event</option>
                    <option value="tour">Tour</option>
                    <option value="festival">Festival</option>
                    <option value="corporate">Corporate</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="budget" className="text-grey-400 mb-2 block text-body-sm">Budget</Label>
                  <Input
                    id="budget"
                    name="budget"
                    type="number"
                    value={formData.budget}
                    onChange={handleChange}
                    placeholder="Enter budget"
                  />
                </div>
                <div>
                  <Label htmlFor="start_date" className="text-grey-400 mb-2 block text-body-sm">Start Date *</Label>
                  <Input
                    id="start_date"
                    name="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="end_date" className="text-grey-400 mb-2 block text-body-sm">End Date</Label>
                  <Input
                    id="end_date"
                    name="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={handleChange}
                  />
                </div>
              </Grid>
            </Stack>
          </Card>

          <Card inverted className="border-2 border-ink-800 p-6">
            <Stack gap={4}>
              <H3 className="text-white">Venue Information</H3>
              <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                <div>
                  <Label htmlFor="venue" className="text-grey-400 mb-2 block text-body-sm">Venue</Label>
                  <Input
                    id="venue"
                    name="venue"
                    value={formData.venue}
                    onChange={handleChange}
                    placeholder="Select or enter venue"
                  />
                </div>
                <div>
                  <Label htmlFor="capacity" className="text-grey-400 mb-2 block text-body-sm">Expected Capacity</Label>
                  <Input
                    id="capacity"
                    name="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={handleChange}
                    placeholder="Enter expected attendance"
                  />
                </div>
              </Grid>
            </Stack>
          </Card>

          <Card inverted className="border-2 border-ink-800 p-6">
            <Stack gap={4}>
              <H3 className="text-white">Description</H3>
              <div>
                <Label htmlFor="description" className="text-grey-400 mb-2 block text-body-sm">Project Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter project description..."
                  rows={4}
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
              <Save className="size-4 mr-2" /> Create Project
            </Button>
          </div>
        </Stack>
      </Form>
    </Stack>
  );
}
