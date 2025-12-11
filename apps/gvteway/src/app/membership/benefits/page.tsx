"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useTabState } from "@ghxstship/config/hooks";
import { GvtewayAppLayout } from "@/components/app-layout";
import {
  H2, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, Textarea, Kicker,
} from "@ghxstship/ui";

import {
  DEMO_MEMBERSHIP_TIERS,
  DEMO_AVAILABLE_BENEFITS,
  type DemoMembershipTier as MembershipTier,
} from "@/lib/demo-data";

const mockTiers = DEMO_MEMBERSHIP_TIERS;
const availableBenefits = DEMO_AVAILABLE_BENEFITS;

function MemberBenefitsPageContent() {
  const router = useRouter();
  
  // URL-synced tab state for deep-linking support
  const { setActiveTab, isActive } = useTabState({
    defaultTab: 'tiers',
    validTabs: ['tiers', 'benefits', 'analytics'],
  });
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
      default: return "bg-ink-100 text-ink-800";
    }
  };

  return (
    <GvtewayAppLayout>
          <Stack gap={10}>
            {/* Page Header */}
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Membership</Kicker>
              <H2 size="lg" className="text-white">Member Benefits</H2>
              <Body className="text-on-dark-muted">Configure membership tiers and benefits</Body>
            </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Total Members" value={totalMembers.toLocaleString()} className="border-2 border-black" />
            <StatCard label="Monthly Revenue" value={`$${(monthlyRevenue / 1000).toFixed(1)}K`} className="border-2 border-black" />
            <StatCard label="Membership Tiers" value={mockTiers.length} className="border-2 border-black" />
            <StatCard label="Active Benefits" value={mockTiers.reduce((sum, t) => sum + t.benefits.filter(b => b.enabled).length, 0)} className="border-2 border-black" />
          </Grid>

          <Tabs>
            <TabsList>
              <Tab active={isActive('tiers')} onClick={() => setActiveTab('tiers')}>Membership Tiers</Tab>
              <Tab active={isActive('benefits')} onClick={() => setActiveTab('benefits')}>Benefit Library</Tab>
              <Tab active={isActive('analytics')} onClick={() => setActiveTab('analytics')}>Analytics</Tab>
            </TabsList>

            <TabPanel active={isActive('tiers')}>
              <Grid cols={3} gap={6}>
                {mockTiers.map((tier) => (
                  <Card key={tier.id} className="border-2 border-black overflow-hidden">
                    <Card className="p-4" style={{ '--tier-color': tier.color, backgroundColor: 'var(--tier-color)' } as React.CSSProperties}>
                      <Stack gap={1}>
                        <Body className="font-weight-bold text-white text-body-md">{tier.name}</Body>
                        <Label className="text-white/80">{tier.memberCount.toLocaleString()} members</Label>
                      </Stack>
                    </Card>
                    <Stack className="p-4" gap={4}>
                      <Stack direction="horizontal" className="justify-between items-baseline">
                        <Label className="text-h4-md font-weight-bold">${tier.price}</Label>
                        <Label className="text-ink-500">/{tier.billingCycle === "Monthly" ? "mo" : "yr"}</Label>
                      </Stack>
                      <Stack gap={2}>
                        <Label className="text-ink-500 text-body-sm">BENEFITS</Label>
                        {tier.benefits.slice(0, 4).map((benefit) => (
                          <Stack key={benefit.id} direction="horizontal" gap={2}>
                            <Label className="text-success-600">✓</Label>
                            <Label className="text-body-sm">{benefit.name}</Label>
                          </Stack>
                        ))}
                        {tier.benefits.length > 4 && (
                          <Label className="text-ink-500 text-body-sm">+{tier.benefits.length - 4} more benefits</Label>
                        )}
                      </Stack>
                      <Button variant="outline" onClick={() => setSelectedTier(tier)}>Edit Tier</Button>
                    </Stack>
                  </Card>
                ))}
                <Card className="border-2 border-dashed border-ink-300 p-6 flex items-center justify-center cursor-pointer hover:border-black">
                  <Stack gap={2} className="text-center">
                    <Label className="text-ink-500 text-h5-md">+</Label>
                    <Label className="text-ink-500">Add New Tier</Label>
                  </Stack>
                </Card>
              </Grid>
            </TabPanel>

            <TabPanel active={isActive('benefits')}>
              <Stack gap={6}>
                {availableBenefits.map((category) => (
                  <Card key={category.type} className="border-2 border-ink-200 p-4">
                    <Stack gap={3}>
                      <Stack direction="horizontal" className="justify-between items-center">
                        <Badge className={getBenefitTypeColor(category.type)}>{category.type}</Badge>
                        <Button variant="ghost" size="sm" onClick={() => setShowAddBenefitModal(true)}>+ Add Custom</Button>
                      </Stack>
                      <Grid cols={4} gap={2}>
                        {category.options.map((option) => (
                          <Card key={option} className="p-2 border-2 border-ink-200 text-center cursor-pointer hover:border-black">
                            <Label className="text-body-sm">{option}</Label>
                          </Card>
                        ))}
                      </Grid>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            </TabPanel>

            <TabPanel active={isActive('analytics')}>
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
                        <Card className="h-3 bg-ink-200 rounded-avatar overflow-hidden">
                          <Card className="h-full rounded-avatar" style={{ '--progress-width': `${(tier.memberCount / totalMembers) * 100}%`, '--tier-color': tier.color, width: 'var(--progress-width)', backgroundColor: 'var(--tier-color)' } as React.CSSProperties} />
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
                          <Card className="h-2 w-24 bg-ink-200 rounded-avatar overflow-hidden">
                            <Card className="h-full bg-black rounded-avatar" style={{ '--progress-width': `${benefit.usage}%`, width: 'var(--progress-width)' } as React.CSSProperties} />
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

          <Button variant="outlineInk" onClick={() => router.push("/membership")}>Back to Membership</Button>
          </Stack>

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
                  <Card key={benefit.id} className="p-3 border-2 border-ink-200">
                    <Stack direction="horizontal" className="justify-between items-center">
                      <Stack gap={0}>
                        <Label className="font-weight-bold">{benefit.name}</Label>
                        <Label size="xs" className="text-ink-500">{benefit.description}</Label>
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
    </GvtewayAppLayout>
  );
}

export default function MemberBenefitsPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-ink-950"><div className="text-white">Loading...</div></div>}>
      <MemberBenefitsPageContent />
    </Suspense>
  );
}
