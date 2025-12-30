"use client";

/**
 * Proposal Detail Page
 * Shows detailed information about a specific proposal
 * Uses DetailPage template for consistent layout
 */

import { useRouter, useParams } from "next/navigation";
import {
  Pencil, FileText, Send, Calendar, DollarSign, User, Building2, Eye, CheckCircle, XCircle, Clock} from "lucide-react";
import { useAuthContext, ATLVS_ADMIN_ROLES } from "@ghxstship/config";
import {
  Badge, Body, Button, Card, Grid, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, StatCard, useNotifications, DetailPage, Section, SectionHeader, Box, Stack} from "@ghxstship/ui";
import { useProposal, useSendProposal, type ProposalStatus } from "@/hooks/useProposals";

const STATUS_COLORS: Record<ProposalStatus, "success" | "warning" | "error" | "info" | "outline"> = {
  draft: "outline",
  sent: "info",
  viewed: "warning",
  accepted: "success",
  declined: "error",
  expired: "outline",
};

export default function ProposalDetailPage() {
  const router = useRouter();
  const params = useParams();
  const proposalId = params?.id as string;

  const { hasRole } = useAuthContext();
  const { addNotification } = useNotifications();
  const canEdit = ATLVS_ADMIN_ROLES.some((role) => hasRole(role));

  const { data: proposal, isLoading, error, refetch } = useProposal(proposalId);
  const sendMutation = useSendProposal();

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return "$0.00";
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  const handleSend = async () => {
    try {
      await sendMutation.mutateAsync(proposalId);
      addNotification({ type: "success", title: "Proposal Sent", message: "The proposal has been sent to the client." });
    } catch (err) {
      addNotification({ type: "error", title: "Failed to Send", message: err instanceof Error ? err.message : "An error occurred" });
    }
  };

  const headerActions = canEdit ? (
    <Box className="flex items-center gap-2">
      {proposal?.status === "draft" && (
        <Button variant="outline" onClick={handleSend} disabled={sendMutation.isPending} icon={<Send className="size-4" />} iconPosition="left">
          {sendMutation.isPending ? "Sending..." : "Send"}
        </Button>
      )}
      <Button variant="solid" onClick={() => router.push(`/finance/proposals/${proposalId}/edit`)} icon={<Pencil className="size-4" />} iconPosition="left">
        Edit
      </Button>
    </Box>
  ) : null;

  const tabs = proposal ? [
    {
      id: "details",
      label: "Details",
      icon: <FileText className="size-4" />,
      content: (
        <Section>
          <Grid cols={4} gap={4} className="grid-cols-2 lg:grid-cols-4 mb-6">
            <StatCard label="Total Amount" value={formatCurrency(proposal.total)} icon={<DollarSign className="size-5" />} />
            <StatCard label="Valid Until" value={formatDate(proposal.valid_until)} icon={<Calendar className="size-5" />} />
            <StatCard label="Views" value={proposal.view_count.toString()} icon={<Eye className="size-5" />} />
            <StatCard label="Version" value={`v${proposal.version}`} icon={<FileText className="size-5" />} />
          </Grid>

          <SectionHeader title="Client Information" />
          <Card className="p-6 mb-6">
            <Grid cols={2} gap={4} className="grid-cols-1 lg:grid-cols-2">
              <Box className="flex items-center gap-3">
                <User className="size-5 text-on-dark-muted" />
                <Box>
                  <Body size="sm" className="text-on-dark-muted">Contact</Body>
                  <Body>{proposal.contact?.first_name} {proposal.contact?.last_name}</Body>
                </Box>
              </Box>
              <Box className="flex items-center gap-3">
                <Building2 className="size-5 text-on-dark-muted" />
                <Box>
                  <Body size="sm" className="text-on-dark-muted">Company</Body>
                  <Body>{proposal.contact?.company || "N/A"}</Body>
                </Box>
              </Box>
            </Grid>
          </Card>

          <SectionHeader title="Line Items" />
          {proposal.pricing_items && proposal.pricing_items.length > 0 ? (
            <Card className="overflow-hidden mb-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {proposal.pricing_items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Body>{item.description}</Body>
                        {item.category && <Body size="sm" className="text-on-dark-muted">{item.category}</Body>}
                      </TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                      <TableCell className="text-right font-weight-medium">{formatCurrency(item.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Box className="p-6 border-t border-grey-700">
                <Box className="space-y-2">
                  <Box className="flex justify-between">
                    <Body>Subtotal</Body>
                    <Body>{formatCurrency(proposal.subtotal)}</Body>
                  </Box>
                  <Box className="flex justify-between">
                    <Body>Tax</Body>
                    <Body>{formatCurrency(proposal.tax_amount)}</Body>
                  </Box>
                  <Box className="flex justify-between font-weight-bold">
                    <Body>Total</Body>
                    <Body>{formatCurrency(proposal.total)}</Body>
                  </Box>
                </Box>
              </Box>
            </Card>
          ) : (
            <Card className="p-6 mb-6">
              <Body className="text-on-dark-muted">No line items added yet.</Body>
            </Card>
          )}

          {proposal.terms && (
            <>
              <SectionHeader title="Terms & Conditions" />
              <Card className="p-6">
                <Body className="whitespace-pre-wrap">{proposal.terms}</Body>
              </Card>
            </>
          )}
        </Section>
      ),
    },
    {
      id: "activity",
      label: "Activity",
      icon: <Clock className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Activity Timeline" description="Track proposal status changes" />
          <Card className="p-6">
            <Box className="space-y-4">
              <Box className="flex items-center gap-3">
                <FileText className="size-4 text-on-dark-muted" />
                <Body size="sm">Created on {formatDate(proposal.created_at)}</Body>
              </Box>
              {proposal.sent_at && (
                <Box className="flex items-center gap-3">
                  <Send className="size-4 text-info" />
                  <Body size="sm">Sent on {formatDate(proposal.sent_at)}</Body>
                </Box>
              )}
              {proposal.viewed_at && (
                <Box className="flex items-center gap-3">
                  <Eye className="size-4 text-warning" />
                  <Body size="sm">First viewed on {formatDate(proposal.viewed_at)}</Body>
                </Box>
              )}
              {proposal.responded_at && (
                <Box className="flex items-center gap-3">
                  {proposal.status === "accepted" ? (
                    <CheckCircle className="size-4 text-success" />
                  ) : (
                    <XCircle className="size-4 text-error" />
                  )}
                  <Body size="sm">
                    {proposal.status === "accepted" ? "Accepted" : "Declined"} on {formatDate(proposal.responded_at)}
                  </Body>
                </Box>
              )}
            </Box>
          </Card>
        </Section>
      ),
    },
  ] : [];

  return (
    <DetailPage
      header={{
        kicker: "Finance",
        title: proposal?.name || "Proposal",
        description: proposal?.proposal_number || "",
        badge: proposal ? <Badge variant={STATUS_COLORS[proposal.status]}>{proposal.status}</Badge> : undefined,
      }}
      loading={isLoading}
      error={error instanceof Error ? error : null}
      onRetry={refetch}
      notFound={!isLoading && !error && !proposal}
      notFoundMessage="The proposal you're looking for doesn't exist or has been removed."
      notFoundAction={{ label: "Back to Proposals", onClick: () => router.push("/finance/proposals") }}
      tabs={tabs}
      actions={headerActions}
      backButton={{ label: "Proposals", href: "/finance/proposals" }}
    />
  );
}
