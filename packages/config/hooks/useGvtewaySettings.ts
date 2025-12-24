import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface LanguageSetting {
  id: string;
  code: string;
  name: string;
  nativeName: string;
  enabled: boolean;
  isDefault: boolean;
  completeness: number;
  created_at?: string;
  updated_at?: string;
}

export interface OfflineWalletSetting {
  id: string;
  eventId: string;
  eventName: string;
  enabled: boolean;
  syncInterval: number;
  lastSync?: string;
  offlineTransactions: number;
  created_at?: string;
  updated_at?: string;
}

const API_BASE = '/api/settings';

// Language Settings hooks
async function fetchLanguageSettings(): Promise<LanguageSetting[]> {
  const response = await fetch(`${API_BASE}/languages`);
  if (!response.ok) return [];
  const { data } = await response.json();
  return data || [];
}

async function updateLanguageSetting(id: string, data: Partial<LanguageSetting>): Promise<LanguageSetting> {
  const response = await fetch(`${API_BASE}/languages/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update language setting');
  }
  return response.json();
}

export function useLanguageSettingsQuery() {
  return useQuery({
    queryKey: ['language-settings'],
    queryFn: fetchLanguageSettings,
    staleTime: 60000,
  });
}

export function useUpdateLanguageSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<LanguageSetting> }) => updateLanguageSetting(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['language-settings'] });
    },
  });
}

export function useLanguageSettings() {
  const query = useLanguageSettingsQuery();
  const updateMutation = useUpdateLanguageSetting();
  const languages = query.data || [];
  const enabledLanguages = languages.filter(l => l.enabled).length;
  const defaultLanguage = languages.find(l => l.isDefault);

  return {
    languages,
    summary: { enabledLanguages, defaultLanguage: defaultLanguage?.name || 'English', totalLanguages: languages.length },
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    update: updateMutation.mutateAsync,
  };
}

// Offline Wallet Settings hooks
async function fetchOfflineWalletSettings(): Promise<OfflineWalletSetting[]> {
  const response = await fetch(`${API_BASE}/wallet/offline`);
  if (!response.ok) return [];
  const { data } = await response.json();
  return data || [];
}

export function useOfflineWalletSettingsQuery() {
  return useQuery({
    queryKey: ['offline-wallet-settings'],
    queryFn: fetchOfflineWalletSettings,
    staleTime: 60000,
  });
}

export function useOfflineWalletSettings() {
  const query = useOfflineWalletSettingsQuery();
  const settings = query.data || [];
  const enabledEvents = settings.filter(s => s.enabled).length;
  const totalOfflineTransactions = settings.reduce((s, e) => s + e.offlineTransactions, 0);

  return {
    settings,
    summary: { enabledEvents, totalOfflineTransactions, totalEvents: settings.length },
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
