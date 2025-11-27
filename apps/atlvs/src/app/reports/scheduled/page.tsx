"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreatorNavigationAuthenticated } from "../../../components/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, Textarea, Alert,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@ghxstship/ui";

interface ScheduledReport {
  id: string;
  name: string;
  type: "Financial" | "Operations" | "Sales" | "Analytics" | "Custom";
  frequency: "Daily" | "Weekly" | "Monthly" | "Quarterly";
  nextRun: string;
  lastRun?: string;
  recipients: string[];
  format: "PDF" | "Excel" | "CSV";
  status: "Active" | "Paused" | "Failed";
  description?: string;
}

const mockReports: ScheduledReport[] = [
  { id: "RPT-001", name: "Weekly Revenue Summary", type: "Financial", frequency: "Weekly", nextRun: "2024-12-02 08:00", lastRun: "2024-11-25 08:00", recipients: ["cfo@company.com", "finance@company.com"], format: "PDF", status: "Active", description: "Weekly revenue breakdown by project and client" },
  { id: "RPT-002", name: "Daily Operations Dashboard", type: "Operations", frequency: "Daily", nextRun: "2024-11-26 06:00", lastRun: "2024-11-25 06:00", recipients: ["ops@company.com"], format: "PDF", status: "Active", description: "Daily operational metrics and KPIs" },
  { id: "RPT-003", name: "Monthly Sales Pipeline", type: "Sales", frequency: "Monthly", nextRun: "2024-12-01 09:00", lastRun: "2024-11-01 09:00", recipients: ["sales@company.com", "vp-sales@company.com"], format: "Excel", status: "Active", description: "Monthly sales pipeline and forecast" },
  { id: "RPT-004", name: "Quarterly Client Retention", type: "Analytics", frequency: "Quarterly", nextRun: "2025-01-01 10:00", lastRun: "2024-10-01 10:00", recipients: ["exec@company.com"], format: "PDF", status: "Active", description: "Quarterly client retention and churn analysis" },
  { id: "RPT-005", name: "Weekly Project Status", type: "Operations", frequency: "Weekly", nextRun: "2024-12-02 07:00", lastRun: "2024-11-25 07:00", recipients: ["pm@company.com", "ops@company.com"], format: "PDF", status: "Paused", description: "Weekly project status and milestones" },
  { id: "RPT-006", name: "Daily Cash Position", type: "Financial", frequency: "Daily", nextRun: "2024-11-26 07:30", lastRun: "2024-11-25 07:30", recipients: ["cfo@company.com"], format: "Excel", status: "Failed", description: "Daily cash position and bank balances" },
];

const reportTypes = ["Financial", "Operations", "Sales", "Analytics", "Custom"];
const frequencies = ["Daily", "Weekly", "Monthly", "Quarterly"];

export default function ScheduledReportsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("active");
  const [selectedReport, setSelectedReport] = useState<ScheduledReport | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const activeReports = mockReports.filter(r => r.status === "Active").length;
  const failedReports = mockReports.filter(r => r.status === "Failed").length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "text-success-400";
      case "Paused": return "text-warning-400";
      case "Failed": return "text-error-400";
      default: return "text-ink-400";
    }
  };

  const filteredReports = activeTab === "all" ? mockReports :
    activeTab === "active" ? mockReports.filter(r => r.status === "Active") :
    mockReports.filter(r => r.status === "Paused" || r.status === "Failed");

  return (
    <UISection className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <CreatorNavigationAuthenticated />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>Scheduled Reports</H1>
            <Label className="text-ink-400">Automated report generation and distribution</Label>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Total Schedules" value={mockReports.length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Active" value={activeReports} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Failed" value={failedReports} trend={failedReports > 0 ? "down" : "neutral"} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Recipients" value={new Set(mockReports.flatMap(r => r.recipients)).size} className="bg-transparent border-2 border-ink-800" />
          </Grid>

          {failedReports > 0 && (
            <Alert variant="warning">{failedReports} report(s) failed to generate. Check configuration.</Alert>
          )}

          <Stack direction="horizontal" className="justify-between">
            <Tabs>
              <TabsList>
                <Tab active={activeTab === "active"} onClick={() => setActiveTab("active")}>Active ({activeReports})</Tab>
                <Tab active={activeTab === "issues"} onClick={() => setActiveTab("issues")}>Issues</Tab>
                <Tab active={activeTab === "all"} onClick={() => setActiveTab("all")}>All</Tab>
              </TabsList>
            </Tabs>
            <Button variant="outlineWhite" onClick={() => setShowCreateModal(true)}>Create Schedule</Button>
          </Stack>

          <Table className="border-2 border-ink-800">
            <TableHeader>
              <TableRow className="bg-ink-900">
                <TableHead className="text-ink-400">Report</TableHead>
                <TableHead className="text-ink-400">Type</TableHead>
                <TableHead className="text-ink-400">Frequency</TableHead>
                <TableHead className="text-ink-400">Next Run</TableHead>
                <TableHead className="text-ink-400">Recipients</TableHead>
                <TableHead className="text-ink-400">Status</TableHead>
                <TableHead className="text-ink-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report) => (
                <TableRow key={report.id} className="border-ink-800">
                  <TableCell>
                    <Stack gap={1}>
                      <Label className="text-white">{report.name}</Label>
                      <Label size="xs" className="text-ink-500">{report.id}</Label>
                    </Stack>
                  </TableCell>
                  <TableCell><Badge variant="outline">{report.type}</Badge></TableCell>
                  <TableCell><Label className="text-ink-300">{report.frequency}</Label></TableCell>
                  <TableCell><Label className="font-mono text-ink-300">{report.nextRun}</Label></TableCell>
                  <TableCell><Label className="text-ink-300">{report.recipients.length}</Label></TableCell>
                  <TableCell><Label className={getStatusColor(report.status)}>{report.status}</Label></TableCell>
                  <TableCell>
                    <Stack direction="horizontal" gap={2}>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedReport(report)}>Edit</Button>
                      <Button variant="ghost" size="sm">Run Now</Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Grid cols={3} gap={4}>
            <Button variant="outline" className="border-ink-700 text-ink-400">Report History</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400">Delivery Log</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/analytics")}>Analytics</Button>
          </Grid>
        </Stack>
      </Container>

      <Modal open={!!selectedReport} onClose={() => setSelectedReport(null)}>
        <ModalHeader><H3>Edit Schedule</H3></ModalHeader>
        <ModalBody>
          {selectedReport && (
            <Stack gap={4}>
              <Input defaultValue={selectedReport.name} className="border-ink-700 bg-black text-white" />
              <Grid cols={2} gap={4}>
                <Select defaultValue={selectedReport.type} className="border-ink-700 bg-black text-white">
                  {reportTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </Select>
                <Select defaultValue={selectedReport.frequency} className="border-ink-700 bg-black text-white">
                  {frequencies.map(f => <option key={f} value={f}>{f}</option>)}
                </Select>
              </Grid>
              <Textarea defaultValue={selectedReport.description} placeholder="Description..." className="border-ink-700 bg-black text-white" rows={2} />
              <Input defaultValue={selectedReport.recipients.join(", ")} placeholder="Recipients (comma separated)" className="border-ink-700 bg-black text-white" />
              <Select defaultValue={selectedReport.format} className="border-ink-700 bg-black text-white">
                <option value="PDF">PDF</option>
                <option value="Excel">Excel</option>
                <option value="CSV">CSV</option>
              </Select>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedReport(null)}>Cancel</Button>
          <Button variant="solid" onClick={() => setSelectedReport(null)}>Save</Button>
        </ModalFooter>
      </Modal>

      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <ModalHeader><H3>Create Schedule</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Input placeholder="Report Name" className="border-ink-700 bg-black text-white" />
            <Grid cols={2} gap={4}>
              <Select className="border-ink-700 bg-black text-white">
                <option value="">Type...</option>
                {reportTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </Select>
              <Select className="border-ink-700 bg-black text-white">
                <option value="">Frequency...</option>
                {frequencies.map(f => <option key={f} value={f}>{f}</option>)}
              </Select>
            </Grid>
            <Textarea placeholder="Description..." className="border-ink-700 bg-black text-white" rows={2} />
            <Input placeholder="Recipients (comma separated)" className="border-ink-700 bg-black text-white" />
            <Select className="border-ink-700 bg-black text-white">
              <option value="PDF">PDF</option>
              <option value="Excel">Excel</option>
              <option value="CSV">CSV</option>
            </Select>
            <Input type="time" className="border-ink-700 bg-black text-white" />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => setShowCreateModal(false)}>Create</Button>
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
