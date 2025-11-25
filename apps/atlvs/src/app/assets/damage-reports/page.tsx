"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../../components/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, Textarea, Alert,
} from "@ghxstship/ui";

interface DamageReport {
  id: string;
  assetId: string;
  assetName: string;
  category: string;
  reportedBy: string;
  reportedDate: string;
  severity: "Minor" | "Moderate" | "Major" | "Critical";
  status: "Reported" | "Under Review" | "Repair Scheduled" | "In Repair" | "Resolved" | "Write-Off";
  description: string;
  location: string;
  projectId?: string;
  estimatedCost?: number;
  actualCost?: number;
  insuranceClaim?: boolean;
  photos?: string[];
  repairVendor?: string;
  resolvedDate?: string;
}

const mockDamageReports: DamageReport[] = [
  { id: "DMG-001", assetId: "AST-003", assetName: "disguise gx 2c Media Server", category: "Video", reportedBy: "Mike Thompson", reportedDate: "2024-11-20", severity: "Moderate", status: "In Repair", description: "Fan failure causing overheating. Unit shut down during show.", location: "Tampa Convention Center", projectId: "PROJ-089", estimatedCost: 1200, repairVendor: "PRG Technical Services", insuranceClaim: false },
  { id: "DMG-002", assetId: "AST-002", assetName: "Robe MegaPointe #7", category: "Lighting", reportedBy: "Sarah Chen", reportedDate: "2024-11-18", severity: "Major", status: "Repair Scheduled", description: "Gobo wheel motor seized. Complete motor assembly replacement needed.", location: "Warehouse A", estimatedCost: 850, repairVendor: "Robe Service Center", insuranceClaim: false },
  { id: "DMG-003", assetId: "AST-004", assetName: "Staging Deck Module #23", category: "Staging", reportedBy: "Tom Wilson", reportedDate: "2024-11-15", severity: "Minor", status: "Resolved", description: "Surface scratches from load-in. Cosmetic only.", location: "Amalie Arena", projectId: "PROJ-088", estimatedCost: 150, actualCost: 120, resolvedDate: "2024-11-17" },
  { id: "DMG-004", assetId: "AST-005", assetName: "Chain Motor Hoist #12", category: "Rigging", reportedBy: "John Martinez", reportedDate: "2024-11-22", severity: "Critical", status: "Under Review", description: "Chain slippage detected during load test. Removed from service pending inspection.", location: "Warehouse A", insuranceClaim: true },
];

export default function DamageReportsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("active");
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<DamageReport | null>(null);

  const activeReports = mockDamageReports.filter(r => !["Resolved", "Write-Off"].includes(r.status));
  const criticalCount = mockDamageReports.filter(r => r.severity === "Critical" && r.status !== "Resolved").length;
  const totalEstimatedCost = mockDamageReports.filter(r => r.status !== "Resolved").reduce((sum, r) => sum + (r.estimatedCost || 0), 0);
  const insuranceClaims = mockDamageReports.filter(r => r.insuranceClaim).length;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical": return "text-red-400";
      case "Major": return "text-orange-400";
      case "Moderate": return "text-yellow-400";
      case "Minor": return "text-green-400";
      default: return "text-ink-400";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Resolved": return "text-green-400";
      case "In Repair": return "text-blue-400";
      case "Repair Scheduled": return "text-yellow-400";
      case "Under Review": return "text-orange-400";
      case "Reported": return "text-ink-400";
      case "Write-Off": return "text-red-400";
      default: return "text-ink-400";
    }
  };

  return (
    <UISection className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>Damage Reports & Repairs</H1>
            <Label className="text-ink-400">Track equipment damage, repairs, and insurance claims</Label>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Active Reports" value={activeReports.length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Critical Issues" value={criticalCount} trend={criticalCount > 0 ? "down" : "neutral"} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Est. Repair Cost" value={`$${totalEstimatedCost.toLocaleString()}`} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Insurance Claims" value={insuranceClaims} className="bg-transparent border-2 border-ink-800" />
          </Grid>

          {criticalCount > 0 && (
            <Alert variant="error">{criticalCount} critical damage report(s) require immediate attention</Alert>
          )}

          <Tabs>
            <TabsList>
              <Tab active={activeTab === "active"} onClick={() => setActiveTab("active")}>Active Reports</Tab>
              <Tab active={activeTab === "resolved"} onClick={() => setActiveTab("resolved")}>Resolved</Tab>
              <Tab active={activeTab === "insurance"} onClick={() => setActiveTab("insurance")}>Insurance Claims</Tab>
            </TabsList>

            <TabPanel active={activeTab === "active"}>
              <Table className="border-2 border-ink-800">
                <TableHeader>
                  <TableRow className="bg-ink-900">
                    <TableHead>Asset</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Est. Cost</TableHead>
                    <TableHead>Reported</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockDamageReports.filter(r => !["Resolved", "Write-Off"].includes(r.status)).map((report) => (
                    <TableRow key={report.id} className={report.severity === "Critical" ? "bg-red-900/10" : ""}>
                      <TableCell>
                        <Stack gap={1}>
                          <Body className="font-display text-white">{report.assetName}</Body>
                          <Label size="xs" className="text-ink-500">{report.assetId} • {report.category}</Label>
                        </Stack>
                      </TableCell>
                      <TableCell><Label className="text-ink-300">{report.description.substring(0, 50)}...</Label></TableCell>
                      <TableCell><Label className={getSeverityColor(report.severity)}>{report.severity}</Label></TableCell>
                      <TableCell><Label className={getStatusColor(report.status)}>{report.status}</Label></TableCell>
                      <TableCell className="font-mono text-white">{report.estimatedCost ? `$${report.estimatedCost}` : "-"}</TableCell>
                      <TableCell className="font-mono text-ink-400">{report.reportedDate}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedReport(report)}>Details</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabPanel>

            <TabPanel active={activeTab === "resolved"}>
              <Table className="border-2 border-ink-800">
                <TableHeader>
                  <TableRow className="bg-ink-900">
                    <TableHead>Asset</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Final Cost</TableHead>
                    <TableHead>Resolved</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockDamageReports.filter(r => r.status === "Resolved").map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <Stack gap={1}>
                          <Body className="font-display text-white">{report.assetName}</Body>
                          <Label size="xs" className="text-ink-500">{report.assetId}</Label>
                        </Stack>
                      </TableCell>
                      <TableCell><Label className="text-ink-300">{report.description}</Label></TableCell>
                      <TableCell><Label className={getSeverityColor(report.severity)}>{report.severity}</Label></TableCell>
                      <TableCell className="font-mono text-white">${report.actualCost || report.estimatedCost}</TableCell>
                      <TableCell className="font-mono text-ink-400">{report.resolvedDate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabPanel>

            <TabPanel active={activeTab === "insurance"}>
              <Stack gap={4}>
                {mockDamageReports.filter(r => r.insuranceClaim).map((report) => (
                  <Card key={report.id} className="border-2 border-ink-800 bg-ink-900/50 p-6">
                    <Grid cols={4} gap={4}>
                      <Stack gap={1}>
                        <Label size="xs" className="text-ink-500">Asset</Label>
                        <Body className="text-white">{report.assetName}</Body>
                      </Stack>
                      <Stack gap={1}>
                        <Label size="xs" className="text-ink-500">Claim Status</Label>
                        <Badge variant="outline">Pending</Badge>
                      </Stack>
                      <Stack gap={1}>
                        <Label size="xs" className="text-ink-500">Estimated Value</Label>
                        <Label className="font-mono text-white">${report.estimatedCost}</Label>
                      </Stack>
                      <Button variant="outline" size="sm">View Claim</Button>
                    </Grid>
                  </Card>
                ))}
              </Stack>
            </TabPanel>
          </Tabs>

          <Grid cols={3} gap={4}>
            <Button variant="outlineWhite" onClick={() => setShowReportModal(true)}>Report Damage</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400">Export Reports</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/assets")}>Back to Assets</Button>
          </Grid>
        </Stack>
      </Container>

      <Modal open={showReportModal} onClose={() => setShowReportModal(false)}>
        <ModalHeader><H3>Report Damage</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Select className="border-ink-700 bg-black text-white"><option>Select asset...</option></Select>
            <Select className="border-ink-700 bg-black text-white">
              <option value="">Severity...</option>
              <option value="Minor">Minor</option>
              <option value="Moderate">Moderate</option>
              <option value="Major">Major</option>
              <option value="Critical">Critical</option>
            </Select>
            <Textarea placeholder="Describe the damage..." className="border-ink-700 bg-black text-white" rows={3} />
            <Input placeholder="Location where damage occurred" className="border-ink-700 bg-black text-white" />
            <Input type="number" placeholder="Estimated repair cost" className="border-ink-700 bg-black text-white" />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowReportModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => setShowReportModal(false)}>Submit Report</Button>
        </ModalFooter>
      </Modal>

      <Modal open={!!selectedReport} onClose={() => setSelectedReport(null)}>
        <ModalHeader><H3>Damage Report Details</H3></ModalHeader>
        <ModalBody>
          {selectedReport && (
            <Stack gap={4}>
              <Stack gap={1}><Label size="xs" className="text-ink-500">Asset</Label><Body className="text-white">{selectedReport.assetName}</Body></Stack>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Severity</Label><Label className={getSeverityColor(selectedReport.severity)}>{selectedReport.severity}</Label></Stack>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Status</Label><Label className={getStatusColor(selectedReport.status)}>{selectedReport.status}</Label></Stack>
              </Grid>
              <Stack gap={1}><Label size="xs" className="text-ink-500">Description</Label><Body className="text-ink-300">{selectedReport.description}</Body></Stack>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Location</Label><Label className="text-white">{selectedReport.location}</Label></Stack>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Reported By</Label><Label className="text-white">{selectedReport.reportedBy}</Label></Stack>
              </Grid>
              {selectedReport.repairVendor && <Stack gap={1}><Label size="xs" className="text-ink-500">Repair Vendor</Label><Label className="text-white">{selectedReport.repairVendor}</Label></Stack>}
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedReport(null)}>Close</Button>
          <Button variant="solid">Update Status</Button>
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
