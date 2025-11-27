"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, Textarea, Alert,
} from "@ghxstship/ui";

interface MembershipTier {
  id: string;
  name: string;
  price: number;
  billingCycle: "Monthly" | "Annual";
  memberCount: number;
  benefits: MemberBenefit[];
  color: string;
}

interface MemberBenefit {
  id: string;
  name: string;
  description: string;
  type: "Discount" | "Access" | "Content" | "Experience" | "Merchandise";
  value?: string;
  enabled: boolean;
}

const mockTiers: MembershipTier[] = [
  {
    id: "TIER-001", name: "Fan Club", price: 9.99, billingCycle: "Monthly", memberCount: 2450, color: "#3B82F6",
    benefits: [
      { id: "B-001", name: "Presale Access", description: "48-hour early access to tickets", type: "Access", enabled: true },
      { id: "B-002", name: "Member Discount", description: "10% off all ticket purchases", type: "Discount", value: "10%", enabled: true },
      { id: "B-003", name: "Exclusive Content", description: "Behind-the-scenes videos and photos", type: "Content", enabled: true },
    ]
  },
  {
    id: "TIER-002", name: "VIP Member", price: 29.99, billingCycle: "Monthly", memberCount: 890, color: "#F59E0B",
    benefits: [
      { id: "B-004", name: "Priority Presale", description: "72-hour early access to tickets", type: "Access", enabled: true },
      { id: "B-005", name: "VIP Discount", description: "20% off all ticket purchases", type: "Discount", value: "20%", enabled: true },
      { id: "B-006", name: "Free Shipping", description: "Free shipping on all merchandise", type: "Merchandise", enabled: true },
      { id: "B-007", name: "Meet & Greet Entry", description: "Monthly raffle for meet & greet", type: "Experience", enabled: true },
      { id: "B-008", name: "Exclusive Merch", description: "Access to member-only merchandise", type: "Merchandise", enabled: true },
    ]
  },
  {
    id: "TIER-003", name: "Platinum", price: 199.99, billingCycle: "Annual", memberCount: 156, color: "#8B5CF6",
    benefits: [
      { id: "B-009", name: "First Access", description: "First access to all tickets before public", type: "Access", enabled: true },
      { id: "B-010", name: "Platinum Discount", description: "30% off all purchases", type: "Discount", value: "30%", enabled: true },
      { id: "B-011", name: "Guaranteed Meet & Greet", description: "One guaranteed meet & greet per year", type: "Experience", enabled: true },
      { id: "B-012", name: "VIP Lounge Access", description: "Complimentary VIP lounge at all events", type: "Access", enabled: true },
      { id: "B-013", name: "Annual Gift Box", description: "Exclusive annual merchandise gift box", type: "Merchandise", enabled: true },
      { id: "B-014", name: "Concierge Service", description: "Dedicated member concierge", type: "Experience", enabled: true },
    ]
  },
];

const availableBenefits = [
  { type: "Discount", options: ["5% off", "10% off", "15% off", "20% off", "25% off", "30% off"] },
  { type: "Access", options: ["24hr Presale", "48hr Presale", "72hr Presale", "VIP Entrance", "Backstage Access", "Soundcheck Access"] },
  { type: "Content", options: ["Exclusive Videos", "Behind the Scenes", "Live Streams", "Digital Downloads", "Early Releases"] },
  { type: "Experience", options: ["Meet & Greet Raffle", "Guaranteed Meet & Greet", "VIP Lounge", "Photo Opportunities", "Concierge Service"] },
  { type: "Merchandise", options: ["Free Shipping", "Member-Only Items", "Annual Gift Box", "Birthday Gift", "Welcome Kit"] },
];

export default function MemberBenefitsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("tiers");
  const [selectedTier, setSelectedTier] = useState<MembershipTier | null>(null);
  const [showAddBenefitModal, setShowAddBenefitModal] = useState(false);

  const totalMembers = mockTiers.reduce((sum, t) => sum + t.memberCount, 0);
  const monthlyRevenue = mockTiers.reduce((sum, t) => {
    const monthly = t.billingCycle === "Monthly" ? t.price : t.price / 12;
    return sum + (monthly * t.memberCount);
  }, 0);

  const getBenefitTypeColor = (type: string) => {
    switch (type) {
      case "Discount": return "bg-success-100 text-success-800";
      case "Access": return "bg-info-100 text-info-800";
      case "Content": return "bg-purple-100 text-purple-800";
      case "Experience": return "bg-warning-100 text-warning-800";
      case "Merchandise": return "bg-pink-100 text-pink-800";
      default: return "bg-grey-100 text-grey-800";
    }
  };

  return (
    <UISection className="min-h-screen bg-white">
      <Container className="py-8">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>MEMBER BENEFITS</H1>
            <Body className="text-grey-600">Configure membership tiers and benefits</Body>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Total Members" value={totalMembers.toLocaleString()} className="border-2 border-black" />
            <StatCard label="Monthly Revenue" value={`$${(monthlyRevenue / 1000).toFixed(1)}K`} className="border-2 border-black" />
            <StatCard label="Membership Tiers" value={mockTiers.length} className="border-2 border-black" />
            <StatCard label="Active Benefits" value={mockTiers.reduce((sum, t) => sum + t.benefits.filter(b => b.enabled).length, 0)} className="border-2 border-black" />
          </Grid>

          <Tabs>
            <TabsList>
              <Tab active={activeTab === "tiers"} onClick={() => setActiveTab("tiers")}>Membership Tiers</Tab>
              <Tab active={activeTab === "benefits"} onClick={() => setActiveTab("benefits")}>Benefit Library</Tab>
              <Tab active={activeTab === "analytics"} onClick={() => setActiveTab("analytics")}>Analytics</Tab>
            </TabsList>

            <TabPanel active={activeTab === "tiers"}>
              <Grid cols={3} gap={6}>
                {mockTiers.map((tier) => (
                  <Card key={tier.id} className="border-2 border-black overflow-hidden">
                    <Card className="p-4" style={{ '--tier-color': tier.color, backgroundColor: 'var(--tier-color)' } as React.CSSProperties}>
                      <Stack gap={1}>
                        <Body className="font-bold text-white text-body-md">{tier.name}</Body>
                        <Label className="text-white/80">{tier.memberCount.toLocaleString()} members</Label>
                      </Stack>
                    </Card>
                    <Stack className="p-4" gap={4}>
                      <Stack direction="horizontal" className="justify-between items-baseline">
                        <Label className="text-h4-md font-bold">${tier.price}</Label>
                        <Label className="text-grey-500">/{tier.billingCycle === "Monthly" ? "mo" : "yr"}</Label>
                      </Stack>
                      <Stack gap={2}>
                        <Label className="text-grey-500 text-body-sm">BENEFITS</Label>
                        {tier.benefits.slice(0, 4).map((benefit) => (
                          <Stack key={benefit.id} direction="horizontal" gap={2}>
                            <Label className="text-success-600">✓</Label>
                            <Label className="text-body-sm">{benefit.name}</Label>
                          </Stack>
                        ))}
                        {tier.benefits.length > 4 && (
                          <Label className="text-grey-500 text-body-sm">+{tier.benefits.length - 4} more benefits</Label>
                        )}
                      </Stack>
                      <Button variant="outline" onClick={() => setSelectedTier(tier)}>Edit Tier</Button>
                    </Stack>
                  </Card>
                ))}
                <Card className="border-2 border-dashed border-grey-300 p-6 flex items-center justify-center cursor-pointer hover:border-black">
                  <Stack gap={2} className="text-center">
                    <Label className="text-grey-500 text-h5-md">+</Label>
                    <Label className="text-grey-500">Add New Tier</Label>
                  </Stack>
                </Card>
              </Grid>
            </TabPanel>

            <TabPanel active={activeTab === "benefits"}>
              <Stack gap={6}>
                {availableBenefits.map((category) => (
                  <Card key={category.type} className="border border-grey-200 p-4">
                    <Stack gap={3}>
                      <Stack direction="horizontal" className="justify-between items-center">
                        <Badge className={getBenefitTypeColor(category.type)}>{category.type}</Badge>
                        <Button variant="ghost" size="sm" onClick={() => setShowAddBenefitModal(true)}>+ Add Custom</Button>
                      </Stack>
                      <Grid cols={4} gap={2}>
                        {category.options.map((option) => (
                          <Card key={option} className="p-2 border border-grey-200 text-center cursor-pointer hover:border-black">
                            <Label className="text-body-sm">{option}</Label>
                          </Card>
                        ))}
                      </Grid>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            </TabPanel>

            <TabPanel active={activeTab === "analytics"}>
              <Grid cols={2} gap={6}>
                <Card className="border-2 border-black p-6">
                  <Stack gap={4}>
                    <H3>Members by Tier</H3>
                    {mockTiers.map((tier) => (
                      <Stack key={tier.id} gap={2}>
                        <Stack direction="horizontal" className="justify-between">
                          <Label>{tier.name}</Label>
                          <Label className="font-mono">{tier.memberCount.toLocaleString()}</Label>
                        </Stack>
                        <Card className="h-3 bg-grey-200 rounded-full overflow-hidden">
                          <Card className="h-full rounded-full" style={{ '--progress-width': `${(tier.memberCount / totalMembers) * 100}%`, '--tier-color': tier.color, width: 'var(--progress-width)', backgroundColor: 'var(--tier-color)' } as React.CSSProperties} />
                        </Card>
                      </Stack>
                    ))}
                  </Stack>
                </Card>
                <Card className="border-2 border-black p-6">
                  <Stack gap={4}>
                    <H3>Popular Benefits</H3>
                    {[
                      { name: "Presale Access", usage: 95 },
                      { name: "Member Discount", usage: 88 },
                      { name: "Exclusive Content", usage: 72 },
                      { name: "Free Shipping", usage: 65 },
                      { name: "VIP Lounge", usage: 45 },
                    ].map((benefit) => (
                      <Stack key={benefit.name} direction="horizontal" className="justify-between items-center">
                        <Label>{benefit.name}</Label>
                        <Stack direction="horizontal" gap={2} className="items-center">
                          <Card className="h-2 w-24 bg-grey-200 rounded-full overflow-hidden">
                            <Card className="h-full bg-black rounded-full" style={{ '--progress-width': `${benefit.usage}%`, width: 'var(--progress-width)' } as React.CSSProperties} />
                          </Card>
                          <Label className="font-mono text-body-sm w-12 text-right">{benefit.usage}%</Label>
                        </Stack>
                      </Stack>
                    ))}
                  </Stack>
                </Card>
              </Grid>
            </TabPanel>
          </Tabs>

          <Button variant="outline" onClick={() => router.push("/membership")}>Back to Membership</Button>
        </Stack>
      </Container>

      <Modal open={!!selectedTier} onClose={() => setSelectedTier(null)}>
        <ModalHeader><H3>Edit {selectedTier?.name}</H3></ModalHeader>
        <ModalBody>
          {selectedTier && (
            <Stack gap={4}>
              <Input defaultValue={selectedTier.name} />
              <Grid cols={2} gap={4}>
                <Input type="number" defaultValue={selectedTier.price} />
                <Select defaultValue={selectedTier.billingCycle}>
                  <option value="Monthly">Monthly</option>
                  <option value="Annual">Annual</option>
                </Select>
              </Grid>
              <Stack gap={2}>
                <Label>Benefits</Label>
                {selectedTier.benefits.map((benefit) => (
                  <Card key={benefit.id} className="p-3 border border-grey-200">
                    <Stack direction="horizontal" className="justify-between items-center">
                      <Stack gap={0}>
                        <Label className="font-bold">{benefit.name}</Label>
                        <Label size="xs" className="text-grey-500">{benefit.description}</Label>
                      </Stack>
                      <Badge className={getBenefitTypeColor(benefit.type)}>{benefit.type}</Badge>
                    </Stack>
                  </Card>
                ))}
                <Button variant="outline" size="sm">+ Add Benefit</Button>
              </Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedTier(null)}>Cancel</Button>
          <Button variant="solid" onClick={() => setSelectedTier(null)}>Save Changes</Button>
        </ModalFooter>
      </Modal>

      <Modal open={showAddBenefitModal} onClose={() => setShowAddBenefitModal(false)}>
        <ModalHeader><H3>Add Custom Benefit</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Input placeholder="Benefit Name" />
            <Textarea placeholder="Description" rows={2} />
            <Select>
              <option value="">Benefit Type...</option>
              <option value="Discount">Discount</option>
              <option value="Access">Access</option>
              <option value="Content">Content</option>
              <option value="Experience">Experience</option>
              <option value="Merchandise">Merchandise</option>
            </Select>
            <Input placeholder="Value (e.g., 20%, $50, etc.)" />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowAddBenefitModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => setShowAddBenefitModal(false)}>Add Benefit</Button>
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
