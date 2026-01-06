import { useState, useCallback } from 'react';

export interface BookingWizardState {
  step: number;
  event_type: string;
  event_name: string;
  event_date: string;
  start_time: string;
  end_time: string;
  guest_count: number;
  space_id?: string;
  contact_id?: string;
  package_id?: string;
  add_ons: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  notes: string;
  special_requests: string;
  pricing: {
    base_price: number;
    add_ons_total: number;
    discount: number;
    tax: number;
    total: number;
  };
  create_proposal: boolean;
  create_contract: boolean;
  send_confirmation: boolean;
}

const initialState: BookingWizardState = {
  step: 1,
  event_type: '',
  event_name: '',
  event_date: '',
  start_time: '',
  end_time: '',
  guest_count: 0,
  add_ons: [],
  notes: '',
  special_requests: '',
  pricing: {
    base_price: 0,
    add_ons_total: 0,
    discount: 0,
    tax: 0,
    total: 0,
  },
  create_proposal: false,
  create_contract: false,
  send_confirmation: true,
};

export function useBookingWizard(initial?: Partial<BookingWizardState>) {
  const [state, setState] = useState<BookingWizardState>({
    ...initialState,
    ...initial,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = useCallback(<K extends keyof BookingWizardState>(
    field: K,
    value: BookingWizardState[K]
  ) => {
    setState((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field as string];
      return newErrors;
    });
  }, []);

  const nextStep = useCallback(() => {
    const validationErrors = validateCurrentStep(state);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return false;
    }
    setState((prev) => ({ ...prev, step: Math.min(prev.step + 1, 5) }));
    return true;
  }, [state]);

  const prevStep = useCallback(() => {
    setState((prev) => ({ ...prev, step: Math.max(prev.step - 1, 1) }));
  }, []);

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= 5) {
      setState((prev) => ({ ...prev, step }));
    }
  }, []);

  const addAddOn = useCallback((addOn: Omit<BookingWizardState['add_ons'][0], 'id'>) => {
    const newAddOn = {
      ...addOn,
      id: `addon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    setState((prev) => {
      const newAddOns = [...prev.add_ons, newAddOn];
      const addOnsTotal = newAddOns.reduce((sum, a) => sum + a.price * a.quantity, 0);
      return {
        ...prev,
        add_ons: newAddOns,
        pricing: {
          ...prev.pricing,
          add_ons_total: addOnsTotal,
          total: prev.pricing.base_price + addOnsTotal - prev.pricing.discount + prev.pricing.tax,
        },
      };
    });
    return newAddOn.id;
  }, []);

  const updateAddOn = useCallback((id: string, updates: Partial<BookingWizardState['add_ons'][0]>) => {
    setState((prev) => {
      const newAddOns = prev.add_ons.map((a) =>
        a.id === id ? { ...a, ...updates } : a
      );
      const addOnsTotal = newAddOns.reduce((sum, a) => sum + a.price * a.quantity, 0);
      return {
        ...prev,
        add_ons: newAddOns,
        pricing: {
          ...prev.pricing,
          add_ons_total: addOnsTotal,
          total: prev.pricing.base_price + addOnsTotal - prev.pricing.discount + prev.pricing.tax,
        },
      };
    });
  }, []);

  const removeAddOn = useCallback((id: string) => {
    setState((prev) => {
      const newAddOns = prev.add_ons.filter((a) => a.id !== id);
      const addOnsTotal = newAddOns.reduce((sum, a) => sum + a.price * a.quantity, 0);
      return {
        ...prev,
        add_ons: newAddOns,
        pricing: {
          ...prev.pricing,
          add_ons_total: addOnsTotal,
          total: prev.pricing.base_price + addOnsTotal - prev.pricing.discount + prev.pricing.tax,
        },
      };
    });
  }, []);

  const setBasePrice = useCallback((basePrice: number) => {
    setState((prev) => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        base_price: basePrice,
        total: basePrice + prev.pricing.add_ons_total - prev.pricing.discount + prev.pricing.tax,
      },
    }));
  }, []);

  const setDiscount = useCallback((discount: number) => {
    setState((prev) => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        discount,
        total: prev.pricing.base_price + prev.pricing.add_ons_total - discount + prev.pricing.tax,
      },
    }));
  }, []);

  const setTax = useCallback((tax: number) => {
    setState((prev) => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        tax,
        total: prev.pricing.base_price + prev.pricing.add_ons_total - prev.pricing.discount + tax,
      },
    }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
    setErrors({});
  }, []);

  const isValid = useCallback(() => {
    return (
      state.event_type !== '' &&
      state.event_name !== '' &&
      state.event_date !== '' &&
      state.start_time !== '' &&
      state.end_time !== '' &&
      state.guest_count > 0 &&
      state.space_id !== undefined &&
      state.contact_id !== undefined
    );
  }, [state]);

  const toJSON = useCallback(() => {
    return {
      event_type: state.event_type,
      event_name: state.event_name,
      event_date: state.event_date,
      start_time: state.start_time,
      end_time: state.end_time,
      guest_count: state.guest_count,
      space_id: state.space_id,
      contact_id: state.contact_id,
      package_id: state.package_id,
      add_ons: state.add_ons.map((addOn) => {
        const { id: addOnId, ...rest } = addOn;
        void addOnId;
        return rest;
      }),
      notes: state.notes,
      special_requests: state.special_requests,
      pricing: state.pricing,
      create_proposal: state.create_proposal,
      create_contract: state.create_contract,
      send_confirmation: state.send_confirmation,
    };
  }, [state]);

  return {
    state,
    errors,
    updateField,
    nextStep,
    prevStep,
    goToStep,
    addAddOn,
    updateAddOn,
    removeAddOn,
    setBasePrice,
    setDiscount,
    setTax,
    reset,
    isValid,
    toJSON,
  };
}

function validateCurrentStep(state: BookingWizardState): Record<string, string> {
  const errors: Record<string, string> = {};

  switch (state.step) {
    case 1:
      if (!state.event_type) errors.event_type = 'Event type is required';
      if (!state.event_name) errors.event_name = 'Event name is required';
      break;
    case 2:
      if (!state.event_date) errors.event_date = 'Event date is required';
      if (!state.start_time) errors.start_time = 'Start time is required';
      if (!state.end_time) errors.end_time = 'End time is required';
      if (state.guest_count <= 0) errors.guest_count = 'Guest count must be greater than 0';
      break;
    case 3:
      if (!state.space_id) errors.space_id = 'Please select a space';
      break;
    case 4:
      if (!state.contact_id) errors.contact_id = 'Please select or create a contact';
      break;
  }

  return errors;
}
