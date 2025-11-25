"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../../components/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, Textarea,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@ghxstship/ui";

interface Task {
  id: string;
  title: string;
  type: "Follow-up" | "Call" | "Email" | "Meeting" | "Task";
  priority: "High" | "Medium" | "Low";
  dueDate: string;
  dueTime?: string;
  assignedTo: string;
  linkedContact?: string;
  linkedDeal?: string;
  status: "Pending" | "Completed" | "Overdue";
  reminder?: string;
}

const mockTasks: Task[] = [
  { id: "TSK-001", title: "Follow up on proposal", type: "Follow-up", priority: "High", dueDate: "2024-11-25", dueTime: "10:00 AM", assignedTo: "John Smith", linkedContact: "Festival Productions", linkedDeal: "Summer Fest 2025", status: "Pending", reminder: "1 hour before" },
  { id: "TSK-002", title: "Send contract revision", type: "Email", priority: "High", dueDate: "2024-11-25", assignedTo: "John Smith", linkedContact: "Tech Corp", linkedDeal: "Corporate Gala", status: "Pending" },
  { id: "TSK-003", title: "Schedule site visit", type: "Call", priority: "Medium", dueDate: "2024-11-26", assignedTo: "Sarah Johnson", linkedContact: "Grand Arena", status: "Pending", reminder: "1 day before" },
  { id: "TSK-004", title: "Review vendor quotes", type: "Task", priority: "Medium", dueDate: "2024-11-24", assignedTo: "John Smith", status: "Overdue" },
  { id: "TSK-005", title: "Client check-in call", type: "Call", priority: "Low", dueDate: "2024-11-23", assignedTo: "Mike Davis", linkedContact: "Music Festival Inc", status: "Completed" },
];

export default function TasksPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const pendingCount = mockTasks.filter(t => t.status === "Pending").length;
  const overdueCount = mockTasks.filter(t => t.status === "Overdue").length;
  const todayCount = mockTasks.filter(t => t.dueDate === "2024-11-25" && t.status === "Pending").length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "text-green-400";
      case "Pending": return "text-yellow-400";
      case "Overdue": return "text-red-400";
      default: return "text-ink-400";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "text-red-400";
      case "Medium": return "text-yellow-400";
      case "Low": return "text-green-400";
      default: return "text-ink-400";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Follow-up": return "🔄";
      case "Call": return "📞";
      case "Email": return "📧";
      case "Meeting": return "👥";
      case "Task": return "✅";
      default: return "📋";
    }
  };

  const filteredTasks = activeTab === "all" ? mockTasks :
    activeTab === "today" ? mockTasks.filter(t => t.dueDate === "2024-11-25") :
    mockTasks.filter(t => t.status.toLowerCase() === activeTab);

  return (
    <UISection className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>Tasks & Follow-ups</H1>
            <Label className="text-ink-400">Manage tasks and automated reminders</Label>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Due Today" value={todayCount} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Pending" value={pendingCount} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Overdue" value={overdueCount} trend={overdueCount > 0 ? "down" : "neutral"} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Completed" value={mockTasks.filter(t => t.status === "Completed").length} className="bg-transparent border-2 border-ink-800" />
          </Grid>

          <Stack direction="horizontal" className="justify-between">
            <Tabs>
              <TabsList>
                <Tab active={activeTab === "today"} onClick={() => setActiveTab("today")}>Today</Tab>
                <Tab active={activeTab === "pending"} onClick={() => setActiveTab("pending")}>Pending</Tab>
                <Tab active={activeTab === "overdue"} onClick={() => setActiveTab("overdue")}>Overdue</Tab>
                <Tab active={activeTab === "completed"} onClick={() => setActiveTab("completed")}>Completed</Tab>
              </TabsList>
            </Tabs>
            <Button variant="outlineWhite" onClick={() => setShowCreateModal(true)}>Create Task</Button>
          </Stack>

          <Stack gap={4}>
            {filteredTasks.map((task) => (
              <Card key={task.id} className={`border-2 ${task.status === "Overdue" ? "border-red-800" : "border-ink-800"} bg-ink-900/50 p-4`}>
                <Grid cols={6} gap={4} className="items-center">
                  <Stack direction="horizontal" gap={3}>
                    <Label className="text-xl">{getTypeIcon(task.type)}</Label>
                    <Stack gap={1}>
                      <Label className="text-white">{task.title}</Label>
                      <Badge variant="outline">{task.type}</Badge>
                    </Stack>
                  </Stack>
                  <Stack gap={1}>
                    <Label size="xs" className="text-ink-500">Due</Label>
                    <Label className={task.status === "Overdue" ? "text-red-400" : "text-white"}>{task.dueDate}</Label>
                    {task.dueTime && <Label size="xs" className="text-ink-400">{task.dueTime}</Label>}
                  </Stack>
                  <Label className={getPriorityColor(task.priority)}>{task.priority}</Label>
                  <Stack direction="horizontal" gap={2}>
                    {task.linkedContact && <Badge variant="outline">{task.linkedContact}</Badge>}
                  </Stack>
                  <Label className={getStatusColor(task.status)}>{task.status}</Label>
                  <Stack direction="horizontal" gap={2}>
                    {task.status !== "Completed" && <Button variant="solid" size="sm">Complete</Button>}
                    <Button variant="ghost" size="sm" onClick={() => setSelectedTask(task)}>Edit</Button>
                  </Stack>
                </Grid>
              </Card>
            ))}
          </Stack>

          <Grid cols={3} gap={4}>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/contacts")}>Contacts</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/deals")}>Deals</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/")}>Dashboard</Button>
          </Grid>
        </Stack>
      </Container>

      <Modal open={!!selectedTask} onClose={() => setSelectedTask(null)}>
        <ModalHeader><H3>Edit Task</H3></ModalHeader>
        <ModalBody>
          {selectedTask && (
            <Stack gap={4}>
              <Input defaultValue={selectedTask.title} className="border-ink-700 bg-black text-white" />
              <Grid cols={2} gap={4}>
                <Select defaultValue={selectedTask.type} className="border-ink-700 bg-black text-white">
                  <option value="Follow-up">Follow-up</option>
                  <option value="Call">Call</option>
                  <option value="Email">Email</option>
                  <option value="Meeting">Meeting</option>
                  <option value="Task">Task</option>
                </Select>
                <Select defaultValue={selectedTask.priority} className="border-ink-700 bg-black text-white">
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </Select>
              </Grid>
              <Grid cols={2} gap={4}>
                <Input type="date" defaultValue={selectedTask.dueDate} className="border-ink-700 bg-black text-white" />
                <Input type="time" className="border-ink-700 bg-black text-white" />
              </Grid>
              <Select className="border-ink-700 bg-black text-white">
                <option value="">Reminder...</option>
                <option value="15min">15 minutes before</option>
                <option value="1hour">1 hour before</option>
                <option value="1day">1 day before</option>
              </Select>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedTask(null)}>Cancel</Button>
          <Button variant="solid" onClick={() => setSelectedTask(null)}>Save</Button>
        </ModalFooter>
      </Modal>

      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <ModalHeader><H3>Create Task</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Input placeholder="Task title" className="border-ink-700 bg-black text-white" />
            <Grid cols={2} gap={4}>
              <Select className="border-ink-700 bg-black text-white">
                <option value="">Type...</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Call">Call</option>
                <option value="Email">Email</option>
                <option value="Meeting">Meeting</option>
                <option value="Task">Task</option>
              </Select>
              <Select className="border-ink-700 bg-black text-white">
                <option value="">Priority...</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </Select>
            </Grid>
            <Grid cols={2} gap={4}>
              <Input type="date" className="border-ink-700 bg-black text-white" />
              <Input type="time" className="border-ink-700 bg-black text-white" />
            </Grid>
            <Select className="border-ink-700 bg-black text-white">
              <option value="">Link to Contact...</option>
              <option value="c1">Festival Productions</option>
              <option value="c2">Tech Corp</option>
            </Select>
            <Select className="border-ink-700 bg-black text-white">
              <option value="">Reminder...</option>
              <option value="15min">15 minutes before</option>
              <option value="1hour">1 hour before</option>
              <option value="1day">1 day before</option>
            </Select>
            <Textarea placeholder="Notes..." rows={2} className="border-ink-700 bg-black text-white" />
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
