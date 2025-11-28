"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConsumerNavigationPublic } from "@/components/navigation";
import {
  Container, H2, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Section, Card, Tabs, TabsList, Tab, TabPanel, Badge, Alert,
  Modal, ModalHeader, ModalBody, ModalFooter, Textarea,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  PageLayout, Footer, FooterColumn, FooterLink, Display, Kicker,
} from "@ghxstship/ui";

interface CrisisIncident {
  id: string;
  title: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  status: "Active" | "Monitoring" | "Resolved";
  category: string;
  startTime: string;
  platform: string;
  mentions: number;
  assignedTo: string;
}

interface ResponseTemplate {
  id: string;
  name: string;
  category: string;
  content: string;
  usageCount: number;
}

const mockIncidents: CrisisIncident[] = [
  { id: "CRI-001", title: "Ticket Purchase Issues", severity: "High", status: "Active", category: "Technical", startTime: "2024-11-25 14:30", platform: "Twitter", mentions: 156, assignedTo: "Support Team" },
  { id: "CRI-002", title: "Event Postponement Rumors", severity: "Medium", status: "Monitoring", category: "Misinformation", startTime: "2024-11-25 12:00", platform: "Instagram", mentions: 89, assignedTo: "PR Team" },
  { id: "CRI-003", title: "Refund Request Surge", severity: "Critical", status: "Active", category: "Customer Service", startTime: "2024-11-25 15:00", platform: "Multiple", mentions: 234, assignedTo: "CS Lead" },
];

const mockTemplates: ResponseTemplate[] = [
  { id: "RT-001", name: "Technical Issue Acknowledgment", category: "Technical", content: "We are aware of the technical issues affecting [ISSUE]. Our team is working to resolve this as quickly as possible. We apologize for any inconvenience.", usageCount: 45 },
  { id: "RT-002", name: "Event Status Update", category: "General", content: "Thank you for your patience. [EVENT] is proceeding as scheduled. Please check our official channels for the latest updates.", usageCount: 32 },
  { id: "RT-003", name: "Refund Policy Response", category: "Customer Service", content: "We understand your concerns. Our refund policy allows [POLICY]. Please contact support@example.com for assistance with your specific situation.", usageCount: 67 },
  { id: "RT-004", name: "Safety Incident Response", category: "Safety", content: "The safety of our guests is our top priority. We are working with local authorities to address [INCIDENT]. Updates will be provided as information becomes available.", usageCount: 12 },
];

export default function CrisisManagementPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("incidents");
  const [selectedIncident, setSelectedIncident] = useState<CrisisIncident | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ResponseTemplate | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const activeIncidents = mockIncidents.filter(i => i.status === "Active").length;
  const criticalCount = mockIncidents.filter(i => i.severity === "Critical").length;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical": return "text-error-600 bg-error-100";
      case "High": return "text-warning-600 bg-warning-100";
      case "Medium": return "text-warning-600 bg-warning-100";
      case "Low": return "text-success-600 bg-success-100";
      default: return "text-ink-600";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "text-error-600";
      case "Monitoring": return "text-warning-600";
      case "Resolved": return "text-success-600";
      default: return "text-ink-600";
    }
  };

  return (
    <PageLayout
      background="black"
      header={<ConsumerNavigationPublic />}
      footer={
        <Footer
          logo={<Display size="md">GVTEWAY</Display>}
          copyright="© 2024 GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED."
        >
          <FooterColumn title="Social">
            <FooterLink href="/social">Social Hub</FooterLink>
            <FooterLink href="/social/crisis-management">Crisis Management</FooterLink>
          </FooterColumn>
          <FooterColumn title="Legal">
            <FooterLink href="/legal/privacy">Privacy</FooterLink>
            <FooterLink href="/legal/terms">Terms</FooterLink>
          </FooterColumn>
        </Footer>
      }
    >
      <Section background="black" className="relative min-h-screen overflow-hidden py-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
        <Container className="relative z-10">
          <Stack gap={10}>
            {/* Page Header */}
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Social</Kicker>
              <H2 size="lg" className="text-white">Crisis Management</H2>
              <Body className="text-on-dark-muted">Response tools and templates for social media crises</Body>
            </Stack>

          {criticalCount > 0 && (
            <Alert variant="error">
              🚨 {criticalCount} critical incident(s) require immediate attention
            </Alert>
          )}

          <Grid cols={4} gap={6}>
            <StatCard label="Active Incidents" value={activeIncidents} trend={activeIncidents > 0 ? "down" : "neutral"} className="border-2 border-black" />
            <StatCard label="Critical" value={criticalCount} className="border-2 border-black" />
            <StatCard label="Templates" value={mockTemplates.length} className="border-2 border-black" />
            <StatCard label="Avg Response" value="< 15 min" className="border-2 border-black" />
          </Grid>

          <Tabs>
            <TabsList>
              <Tab active={activeTab === "incidents"} onClick={() => setActiveTab("incidents")}>Active Incidents</Tab>
              <Tab active={activeTab === "templates"} onClick={() => setActiveTab("templates")}>Response Templates</Tab>
              <Tab active={activeTab === "playbook"} onClick={() => setActiveTab("playbook")}>Crisis Playbook</Tab>
            </TabsList>

            <TabPanel active={activeTab === "incidents"}>
              <Table className="border-2 border-black">
                <TableHeader>
                  <TableRow className="bg-black text-white">
                    <TableHead>Incident</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Mentions</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockIncidents.map((incident) => (
                    <TableRow key={incident.id}>
                      <TableCell>
                        <Stack gap={1}>
                          <Label className="font-bold">{incident.title}</Label>
                          <Label size="xs" className="text-ink-500">{incident.startTime}</Label>
                        </Stack>
                      </TableCell>
                      <TableCell><Badge variant="outline" className={getSeverityColor(incident.severity)}>{incident.severity}</Badge></TableCell>
                      <TableCell><Label>{incident.category}</Label></TableCell>
                      <TableCell><Label>{incident.platform}</Label></TableCell>
                      <TableCell><Label className="font-mono">{incident.mentions}</Label></TableCell>
                      <TableCell><Label className={getStatusColor(incident.status)}>{incident.status}</Label></TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => setSelectedIncident(incident)}>Manage</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabPanel>

            <TabPanel active={activeTab === "templates"}>
              <Stack gap={4}>
                <Stack direction="horizontal" className="justify-end">
                  <Button variant="solid" onClick={() => setShowCreateModal(true)}>Create Template</Button>
                </Stack>
                <Grid cols={2} gap={4}>
                  {mockTemplates.map((template) => (
                    <Card key={template.id} className="border-2 border-black p-4">
                      <Stack gap={3}>
                        <Stack direction="horizontal" className="justify-between">
                          <Body className="font-bold">{template.name}</Body>
                          <Badge variant="outline">{template.category}</Badge>
                        </Stack>
                        <Label className="text-ink-500 line-clamp-2">{template.content}</Label>
                        <Stack direction="horizontal" className="justify-between">
                          <Label size="xs" className="text-ink-600">Used {template.usageCount} times</Label>
                          <Button variant="outline" size="sm" onClick={() => setSelectedTemplate(template)}>Use</Button>
                        </Stack>
                      </Stack>
                    </Card>
                  ))}
                </Grid>
              </Stack>
            </TabPanel>

            <TabPanel active={activeTab === "playbook"}>
              <Grid cols={2} gap={6}>
                <Card className="border-2 border-black p-6">
                  <Stack gap={4}>
                    <H3>Crisis Response Steps</H3>
                    <Stack gap={3}>
                      {[
                        { step: "1. Assess", desc: "Evaluate severity and scope" },
                        { step: "2. Assemble", desc: "Notify crisis response team" },
                        { step: "3. Acknowledge", desc: "Public acknowledgment within 15 min" },
                        { step: "4. Investigate", desc: "Gather facts and root cause" },
                        { step: "5. Respond", desc: "Official statement and actions" },
                        { step: "6. Monitor", desc: "Track sentiment and mentions" },
                        { step: "7. Review", desc: "Post-crisis analysis" },
                      ].map((item, idx) => (
                        <Card key={idx} className="p-3 border border-ink-200">
                          <Stack direction="horizontal" gap={3}>
                            <Label className="font-bold">{item.step}</Label>
                            <Label className="text-ink-500">{item.desc}</Label>
                          </Stack>
                        </Card>
                      ))}
                    </Stack>
                  </Stack>
                </Card>
                <Card className="border-2 border-black p-6">
                  <Stack gap={4}>
                    <H3>Emergency Contacts</H3>
                    <Stack gap={3}>
                      {[
                        { role: "PR Director", name: "Jane Smith", phone: "555-0101" },
                        { role: "Legal Counsel", name: "John Doe", phone: "555-0102" },
                        { role: "Social Media Lead", name: "Sarah Johnson", phone: "555-0103" },
                        { role: "Customer Service", name: "Mike Davis", phone: "555-0104" },
                      ].map((contact, idx) => (
                        <Card key={idx} className="p-3 border border-ink-200">
                          <Stack direction="horizontal" className="justify-between">
                            <Stack gap={0}>
                              <Label className="font-bold">{contact.role}</Label>
                              <Label className="text-ink-500">{contact.name}</Label>
                            </Stack>
                            <Label className="font-mono">{contact.phone}</Label>
                          </Stack>
                        </Card>
                      ))}
                    </Stack>
                  </Stack>
                </Card>
              </Grid>
            </TabPanel>
          </Tabs>

          <Button variant="outlineInk" onClick={() => router.push("/social")}>Back to Social</Button>
          </Stack>
        </Container>
      </Section>

      <Modal open={!!selectedIncident} onClose={() => setSelectedIncident(null)}>
        <ModalHeader><H3>Manage Incident</H3></ModalHeader>
        <ModalBody>
          {selectedIncident && (
            <Stack gap={4}>
              <Body className="font-bold">{selectedIncident.title}</Body>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label className="text-ink-500">Severity</Label><Badge variant="outline" className={getSeverityColor(selectedIncident.severity)}>{selectedIncident.severity}</Badge></Stack>
                <Stack gap={1}><Label className="text-ink-500">Status</Label><Label className={getStatusColor(selectedIncident.status)}>{selectedIncident.status}</Label></Stack>
              </Grid>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label className="text-ink-500">Platform</Label><Label>{selectedIncident.platform}</Label></Stack>
                <Stack gap={1}><Label className="text-ink-500">Mentions</Label><Label className="font-mono">{selectedIncident.mentions}</Label></Stack>
              </Grid>
              <Stack gap={1}><Label className="text-ink-500">Assigned To</Label><Label>{selectedIncident.assignedTo}</Label></Stack>
              <Textarea placeholder="Add response or notes..." rows={3} className="border-2 border-black" />
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedIncident(null)}>Close</Button>
          <Button variant="outline">Escalate</Button>
          <Button variant="solid">Post Response</Button>
        </ModalFooter>
      </Modal>

      <Modal open={!!selectedTemplate} onClose={() => setSelectedTemplate(null)}>
        <ModalHeader><H3>Use Template</H3></ModalHeader>
        <ModalBody>
          {selectedTemplate && (
            <Stack gap={4}>
              <Body className="font-bold">{selectedTemplate.name}</Body>
              <Textarea defaultValue={selectedTemplate.content} rows={4} className="border-2 border-black" />
              <Select className="border-2 border-black">
                <option value="">Select Platform...</option>
                <option value="twitter">Twitter</option>
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
                <option value="all">All Platforms</option>
              </Select>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedTemplate(null)}>Cancel</Button>
          <Button variant="solid">Post Response</Button>
        </ModalFooter>
      </Modal>

      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <ModalHeader><H3>Create Template</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Input placeholder="Template Name" className="border-2 border-black" />
            <Select className="border-2 border-black">
              <option value="">Category...</option>
              <option value="Technical">Technical</option>
              <option value="Customer Service">Customer Service</option>
              <option value="Safety">Safety</option>
              <option value="General">General</option>
            </Select>
            <Textarea placeholder="Response template content..." rows={4} className="border-2 border-black" />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => setShowCreateModal(false)}>Save Template</Button>
        </ModalFooter>
      </Modal>
    </PageLayout>
  );
}
