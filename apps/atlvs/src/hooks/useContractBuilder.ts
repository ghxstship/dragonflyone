import { useState, useCallback } from 'react';

export interface ContractSection {
  id: string;
  type: 'clause' | 'custom' | 'signature' | 'header' | 'footer';
  clause_id?: string;
  content: string;
  order: number;
  variables: Record<string, string>;
  required: boolean;
}

export interface ContractBuilderState {
  title: string;
  sections: ContractSection[];
  signers: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    order: number;
  }>;
  variables: Record<string, string>;
  settings: {
    require_initials: boolean;
    allow_decline: boolean;
    expiration_days?: number;
    reminder_days?: number;
  };
}

const initialState: ContractBuilderState = {
  title: '',
  sections: [],
  signers: [],
  variables: {},
  settings: {
    require_initials: false,
    allow_decline: true,
    expiration_days: 30,
    reminder_days: 7,
  },
};

export function useContractBuilder(initial?: Partial<ContractBuilderState>) {
  const [state, setState] = useState<ContractBuilderState>({
    ...initialState,
    ...initial,
  });

  const setTitle = useCallback((title: string) => {
    setState((prev) => ({ ...prev, title }));
  }, []);

  const addSection = useCallback((section: Omit<ContractSection, 'id' | 'order'>) => {
    const newSection: ContractSection = {
      ...section,
      id: `section_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      order: state.sections.length,
    };
    setState((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }));
    return newSection.id;
  }, [state.sections.length]);

  const updateSection = useCallback((id: string, updates: Partial<ContractSection>) => {
    setState((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      ),
    }));
  }, []);

  const removeSection = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      sections: prev.sections
        .filter((s) => s.id !== id)
        .map((s, i) => ({ ...s, order: i })),
    }));
  }, []);

  const reorderSections = useCallback((fromIndex: number, toIndex: number) => {
    setState((prev) => {
      const sections = [...prev.sections];
      const [moved] = sections.splice(fromIndex, 1);
      sections.splice(toIndex, 0, moved);
      return {
        ...prev,
        sections: sections.map((s, i) => ({ ...s, order: i })),
      };
    });
  }, []);

  const addClause = useCallback((clauseId: string, content: string, required = true) => {
    return addSection({
      type: 'clause',
      clause_id: clauseId,
      content,
      variables: {},
      required,
    });
  }, [addSection]);

  const addCustomSection = useCallback((content: string, required = false) => {
    return addSection({
      type: 'custom',
      content,
      variables: {},
      required,
    });
  }, [addSection]);

  const addSigner = useCallback((signer: Omit<ContractBuilderState['signers'][0], 'id' | 'order'>) => {
    const newSigner = {
      ...signer,
      id: `signer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      order: state.signers.length,
    };
    setState((prev) => ({
      ...prev,
      signers: [...prev.signers, newSigner],
    }));
    return newSigner.id;
  }, [state.signers.length]);

  const updateSigner = useCallback((id: string, updates: Partial<ContractBuilderState['signers'][0]>) => {
    setState((prev) => ({
      ...prev,
      signers: prev.signers.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      ),
    }));
  }, []);

  const removeSigner = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      signers: prev.signers
        .filter((s) => s.id !== id)
        .map((s, i) => ({ ...s, order: i })),
    }));
  }, []);

  const reorderSigners = useCallback((fromIndex: number, toIndex: number) => {
    setState((prev) => {
      const signers = [...prev.signers];
      const [moved] = signers.splice(fromIndex, 1);
      signers.splice(toIndex, 0, moved);
      return {
        ...prev,
        signers: signers.map((s, i) => ({ ...s, order: i })),
      };
    });
  }, []);

  const setVariable = useCallback((key: string, value: string) => {
    setState((prev) => ({
      ...prev,
      variables: { ...prev.variables, [key]: value },
    }));
  }, []);

  const setVariables = useCallback((variables: Record<string, string>) => {
    setState((prev) => ({
      ...prev,
      variables: { ...prev.variables, ...variables },
    }));
  }, []);

  const updateSettings = useCallback((settings: Partial<ContractBuilderState['settings']>) => {
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...settings },
    }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  const loadFromTemplate = useCallback((template: {
    title: string;
    sections: ContractSection[];
    variables?: Record<string, string>;
    settings?: Partial<ContractBuilderState['settings']>;
  }) => {
    setState((prev) => ({
      ...prev,
      title: template.title,
      sections: template.sections.map((s, i) => ({
        ...s,
        id: `section_${Date.now()}_${i}`,
        order: i,
      })),
      variables: template.variables || {},
      settings: { ...prev.settings, ...template.settings },
    }));
  }, []);

  const getPreview = useCallback(() => {
    let preview = '';
    for (const section of state.sections.sort((a, b) => a.order - b.order)) {
      let content = section.content;
      for (const [key, value] of Object.entries({ ...state.variables, ...section.variables })) {
        content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
      }
      preview += content + '\n\n';
    }
    return preview.trim();
  }, [state.sections, state.variables]);

  const isValid = useCallback(() => {
    if (!state.title.trim()) return false;
    if (state.sections.length === 0) return false;
    if (state.signers.length === 0) return false;
    const missingVariables = Object.entries(state.variables).filter(([_, v]) => !v);
    if (missingVariables.length > 0) return false;
    return true;
  }, [state]);

  return {
    state,
    setTitle,
    addSection,
    updateSection,
    removeSection,
    reorderSections,
    addClause,
    addCustomSection,
    addSigner,
    updateSigner,
    removeSigner,
    reorderSigners,
    setVariable,
    setVariables,
    updateSettings,
    reset,
    loadFromTemplate,
    getPreview,
    isValid,
  };
}
