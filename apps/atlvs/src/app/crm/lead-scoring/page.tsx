"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../../components/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, ProgressBar,
} from "@ghxstship/ui";

interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  source: string;
  score: number;
  grade: "A" | "B" | "C" | "D";
  status: "New" | "Contacted" | "Qualified" | "Proposal" | "Negotiation" | "Won" | "Lost";
  lastActivity: string;
  engagementScore: number;
  fitScore: number;
  behaviorScore: number;
  assignedTo?: string;
  estimatedValue?: number;
}

interface ScoringRule {
  id: string;
  name: string;
  category: "Engagement" | "Fit" | "Behavior";
  condition: string;
  points: number;
  active: boolean;
}

const mockLeads: Lead[] = [
  { id: "LEAD-001", name: "Sarah Mitchell", company: "TechCorp Events", email: "sarah@techcorp.com", source: "Website", score: 92, grade: "A", status: "Qualified", lastActivity: "2024-11-24", engagementScore: 85, fitScore: 95, behaviorScore: 90, assignedTo: "John Smith", estimatedValue: 125000 },
  { id: "LEAD-002", name: "Michael Chen", company: "Festival Productions", email: "mchen@festprod.com", source: "Referral", score: 78, grade: "B", status: "Proposal", lastActivity: "2024-11-23", engagementScore: 70, fitScore: 85, behaviorScore: 75, assignedTo: "Jane Doe", estimatedValue: 85000 },
  { id: "LEAD-003", name: "Emily Rodriguez", company: "Corporate Events Inc", email: "emily@corpevents.com", source: "Trade Show", score: 65, grade: "B", status: "Contacted", lastActivity: "2024-11-22", engagementScore: 60, fitScore: 70, behaviorScore: 65, estimatedValue: 45000 },
  { id: "LEAD-004", name: "David Park", company: "StartUp Ventures", email: "dpark@startup.io", source: "LinkedIn", score: 45, grade: "C", status: "New", lastActivity: "2024-11-24", engagementScore: 40, fitScore: 50, behaviorScore: 45, estimatedValue: 25000 },
  { id: "LEAD-005", name: "Lisa Thompson", company: "Local Business", email: "lisa@local.com", source: "Cold Outreach", score: 28, grade: "D", status: "Contacted", lastActivity: "2024-11-20", engagementScore: 25, fitScore: 30, behaviorScore: 30, estimatedValue: 10000 },
];

const mockScoringRules: ScoringRule[] = [
  { id: "SR-001", name: "Website Visit", category: "Engagement", condition: "Visited website in last 7 days", points: 5, active: true },
  { id: "SR-002", name: "Email Open", category: "Engagement", condition: "Opened marketing email", points: 3, active: true },
  { id: "SR-003", name: "Form Submission", category: "Engagement", condition: "Submitted contact form", points: 15, active: true },
  { id: "SR-004", name: "Company Size", category: "Fit", condition: "Company > 100 employees", points: 20, active: true },
  { id: "SR-005", name: "Industry Match", category: "Fit", condition: "Entertainment/Events industry", points: 25, active: true },
  { id: "SR-006", name: "Budget Range", category: "Fit", condition: "Budget > $50,000", points: 30, active: true },
  { id: "SR-007", name: "Pricing Page View", category: "Behavior", condition: "Viewed pricing page", points: 10, active: true },
  { id: "SR-008", name: "Case Study Download", category: "Behavior", condition: "Downloaded case study", points: 15, active: true },
];

export default function LeadScoringPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("leads");
  const [selectedGrade, setSelectedGrade] = useState("All");
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const filteredLeads = selectedGrade === "All" ? mockLeads : mockLeads.filter(l => l.grade === selectedGrade);
  const hotLeads = mockLeads.filter(l => l.score >= 80).length;
  const avgScore = Math.round(mockLeads.reduce((sum, l) => sum + l.score, 0) / mockLeads.length);
  const totalPipeline = mockLeads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0);

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A": return "text-green-400";
      case "B": return "text-blue-400";
      case "C": return "text-yellow-400";
      case "D": return "text-red-400";
      default: return "text-ink-400";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-blue-400";
    if (score >= 40) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <UISection className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>Lead Scoring & Qualification</H1>
            <Label className="text-ink-400">Automated lead scoring, grading, and qualification workflows</Label>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Hot Leads (80+)" value={hotLeads} trend="up" className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Avg Lead Score" value={avgScore} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Total Leads" value={mockLeads.length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Pipeline Value" value={`$${(totalPipeline / 1000).toFixed(0)}K`} className="bg-transparent border-2 border-ink-800" />
          </Grid>

          <Tabs>
            <TabsList>
              <Tab active={activeTab === "leads"} onClick={() => setActiveTab("leads")}>Scored Leads</Tab>
              <Tab active={activeTab === "rules"} onClick={() => setActiveTab("rules")}>Scoring Rules</Tab>
              <Tab active={activeTab === "analytics"} onClick={() => setActiveTab("analytics")}>Analytics</Tab>
            </TabsList>

            <TabPanel active={activeTab === "leads"}>
              <Stack gap={4}>
                <Grid cols={3} gap={4}>
                  <Select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)} className="border-ink-700 bg-black text-white">
                    <option value="All">All Grades</option>
                    <option value="A">Grade A (Hot)</option>
                    <option value="B">Grade B (Warm)</option>
                    <option value="C">Grade C (Cool)</option>
                    <option value="D">Grade D (Cold)</option>
                  </Select>
                  <Input type="search" placeholder="Search leads..." className="border-ink-700 bg-black text-white" />
                  <Button variant="outline" className="border-ink-700 text-ink-400">Export</Button>
                </Grid>

                <Table className="border-2 border-ink-800">
                  <TableHeader>
                    <TableRow className="bg-ink-900">
                      <TableHead>Lead</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Engagement</TableHead>
                      <TableHead>Fit</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Est. Value</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLeads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell>
                          <Stack gap={1}>
                            <Body className="font-display text-white">{lead.name}</Body>
                            <Label size="xs" className="text-ink-500">{lead.company}</Label>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack gap={1}>
                            <Label className={`font-mono text-lg ${getScoreColor(lead.score)}`}>{lead.score}</Label>
                            <ProgressBar value={lead.score} variant="inverse" size="sm" className="w-16" />
                          </Stack>
                        </TableCell>
                        <TableCell><Badge variant={lead.grade === "A" ? "solid" : "outline"}>{lead.grade}</Badge></TableCell>
                        <TableCell><Label className="text-ink-300">{lead.engagementScore}%</Label></TableCell>
                        <TableCell><Label className="text-ink-300">{lead.fitScore}%</Label></TableCell>
                        <TableCell><Badge variant="outline">{lead.status}</Badge></TableCell>
                        <TableCell className="font-mono text-white">${(lead.estimatedValue || 0).toLocaleString()}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedLead(lead)}>Details</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Stack>
            </TabPanel>

            <TabPanel active={activeTab === "rules"}>
              <Stack gap={4}>
                <Stack direction="horizontal" className="justify-between">
                  <H3>Scoring Rules</H3>
                  <Button variant="outline" size="sm" onClick={() => setShowRuleModal(true)}>Add Rule</Button>
                </Stack>
                <Grid cols={3} gap={4}>
                  {["Engagement", "Fit", "Behavior"].map((category) => (
                    <Card key={category} className="border-2 border-ink-800 bg-ink-900/50 p-4">
                      <Stack gap={4}>
                        <H3>{category}</H3>
                        <Stack gap={2}>
                          {mockScoringRules.filter(r => r.category === category).map((rule) => (
                            <Card key={rule.id} className="p-3 bg-ink-800 border border-ink-700">
                              <Stack direction="horizontal" className="justify-between items-center">
                                <Stack gap={1}>
                                  <Label className="text-white">{rule.name}</Label>
                                  <Label size="xs" className="text-ink-500">{rule.condition}</Label>
                                </Stack>
                                <Badge variant={rule.active ? "solid" : "outline"}>+{rule.points}</Badge>
                              </Stack>
                            </Card>
                          ))}
                        </Stack>
                      </Stack>
                    </Card>
                  ))}
                </Grid>
              </Stack>
            </TabPanel>

            <TabPanel active={activeTab === "analytics"}>
              <Grid cols={2} gap={6}>
                <Card className="border-2 border-ink-800 bg-ink-900/50 p-6">
                  <Stack gap={4}>
                    <H3>Score Distribution</H3>
                    <Stack gap={2}>
                      {[{ range: "80-100", label: "Hot", count: hotLeads, color: "bg-green-500" },
                        { range: "60-79", label: "Warm", count: mockLeads.filter(l => l.score >= 60 && l.score < 80).length, color: "bg-blue-500" },
                        { range: "40-59", label: "Cool", count: mockLeads.filter(l => l.score >= 40 && l.score < 60).length, color: "bg-yellow-500" },
                        { range: "0-39", label: "Cold", count: mockLeads.filter(l => l.score < 40).length, color: "bg-red-500" }
                      ].map((tier) => (
                        <Stack key={tier.range} gap={1}>
                          <Stack direction="horizontal" className="justify-between">
                            <Label className="text-white">{tier.label} ({tier.range})</Label>
                            <Label className="text-ink-400">{tier.count} leads</Label>
                          </Stack>
                          <Card className="h-2 bg-ink-800 rounded-full overflow-hidden">
                            <Card className={`h-full ${tier.color}`} style={{ width: `${(tier.count / mockLeads.length) * 100}%` }} />
                          </Card>
                        </Stack>
                      ))}
                    </Stack>
                  </Stack>
                </Card>
                <Card className="border-2 border-ink-800 bg-ink-900/50 p-6">
                  <Stack gap={4}>
                    <H3>Conversion by Grade</H3>
                    <Stack gap={3}>
                      {[{ grade: "A", rate: 45, deals: 12 }, { grade: "B", rate: 28, deals: 8 }, { grade: "C", rate: 12, deals: 3 }, { grade: "D", rate: 5, deals: 1 }].map((item) => (
                        <Card key={item.grade} className="p-3 bg-ink-800 border border-ink-700">
                          <Grid cols={3} gap={2}>
                            <Label className={getGradeColor(item.grade)}>Grade {item.grade}</Label>
                            <Label className="text-white">{item.rate}% conversion</Label>
                            <Label className="text-ink-400 text-right">{item.deals} deals</Label>
                          </Grid>
                        </Card>
                      ))}
                    </Stack>
                  </Stack>
                </Card>
              </Grid>
            </TabPanel>
          </Tabs>

          <Grid cols={3} gap={4}>
            <Button variant="outlineWhite" onClick={() => router.push("/crm")}>Back to CRM</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400">Recalculate Scores</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/deals")}>View Pipeline</Button>
          </Grid>
        </Stack>
      </Container>

      <Modal open={showRuleModal} onClose={() => setShowRuleModal(false)}>
        <ModalHeader><H3>Add Scoring Rule</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Input placeholder="Rule name" className="border-ink-700 bg-black text-white" />
            <Select className="border-ink-700 bg-black text-white">
              <option value="">Category...</option>
              <option value="Engagement">Engagement</option>
              <option value="Fit">Fit</option>
              <option value="Behavior">Behavior</option>
            </Select>
            <Input placeholder="Condition" className="border-ink-700 bg-black text-white" />
            <Input type="number" placeholder="Points" className="border-ink-700 bg-black text-white" />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowRuleModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => setShowRuleModal(false)}>Add Rule</Button>
        </ModalFooter>
      </Modal>

      <Modal open={!!selectedLead} onClose={() => setSelectedLead(null)}>
        <ModalHeader><H3>Lead Score Breakdown</H3></ModalHeader>
        <ModalBody>
          {selectedLead && (
            <Stack gap={4}>
              <Stack gap={1}><Body className="text-white font-display text-lg">{selectedLead.name}</Body><Label className="text-ink-400">{selectedLead.company}</Label></Stack>
              <Card className="p-4 bg-ink-800 border border-ink-700 text-center">
                <Label className={`font-mono text-4xl ${getScoreColor(selectedLead.score)}`}>{selectedLead.score}</Label>
                <Label className="text-ink-400">Overall Score</Label>
              </Card>
              <Grid cols={3} gap={4}>
                <Stack gap={1} className="text-center"><Label className="text-2xl text-white">{selectedLead.engagementScore}</Label><Label size="xs" className="text-ink-500">Engagement</Label></Stack>
                <Stack gap={1} className="text-center"><Label className="text-2xl text-white">{selectedLead.fitScore}</Label><Label size="xs" className="text-ink-500">Fit</Label></Stack>
                <Stack gap={1} className="text-center"><Label className="text-2xl text-white">{selectedLead.behaviorScore}</Label><Label size="xs" className="text-ink-500">Behavior</Label></Stack>
              </Grid>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedLead(null)}>Close</Button>
          <Button variant="solid">Convert to Deal</Button>
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
