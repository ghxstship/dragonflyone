import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface ContractSignature {
  id: string;
  contract_id: string;
  signer_name: string;
  signer_email: string;
  signer_role: string;
  sign_order: number;
  status: 'pending' | 'sent' | 'viewed' | 'signed' | 'declined';
  signature_data?: string;
  signed_at?: string;
  ip_address?: string;
  user_agent?: string;
  reminder_sent_at?: string;
  created_at: string;
}

export interface SendSignatureRequestInput {
  contract_id: string;
  signer_id: string;
  message?: string;
}

async function fetchContractSignatures(contractId: string): Promise<{ signatures: ContractSignature[]; total: number }> {
  const response = await fetch(`/api/contracts/${contractId}/signatures`);
  if (!response.ok) {
    throw new Error('Failed to fetch signatures');
  }
  return response.json();
}

async function sendSignatureRequest(input: SendSignatureRequestInput): Promise<ContractSignature> {
  const response = await fetch(`/api/contracts/${input.contract_id}/signatures/${input.signer_id}/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: input.message }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to send signature request');
  }
  return response.json();
}

async function sendSignatureReminder(input: { contractId: string; signerId: string }): Promise<ContractSignature> {
  const response = await fetch(`/api/contracts/${input.contractId}/signatures/${input.signerId}/remind`, {
    method: 'POST',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to send reminder');
  }
  return response.json();
}

async function resendSignatureRequest(input: { contractId: string; signerId: string }): Promise<ContractSignature> {
  const response = await fetch(`/api/contracts/${input.contractId}/signatures/${input.signerId}/resend`, {
    method: 'POST',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to resend request');
  }
  return response.json();
}

async function voidSignatureRequest(input: { contractId: string; signerId: string; reason?: string }): Promise<void> {
  const response = await fetch(`/api/contracts/${input.contractId}/signatures/${input.signerId}/void`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason: input.reason }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to void signature request');
  }
}

export function useContractSignatures(contractId: string) {
  return useQuery({
    queryKey: ['contract-signatures', contractId],
    queryFn: () => fetchContractSignatures(contractId),
    enabled: !!contractId,
  });
}

export function useSendSignatureRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendSignatureRequest,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['contract-signatures', data.contract_id] });
      queryClient.invalidateQueries({ queryKey: ['contract', data.contract_id] });
    },
  });
}

export function useSendSignatureReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendSignatureReminder,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contract-signatures', variables.contractId] });
    },
  });
}

export function useResendSignatureRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resendSignatureRequest,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contract-signatures', variables.contractId] });
    },
  });
}

export function useVoidSignatureRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: voidSignatureRequest,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contract-signatures', variables.contractId] });
      queryClient.invalidateQueries({ queryKey: ['contract', variables.contractId] });
    },
  });
}
