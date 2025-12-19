import { useState, useCallback } from 'react';

export interface TimelineItem {
  id: string;
  time: string;
  description: string;
  department?: string;
  notes?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  quantity: number;
  dietary_notes?: string;
  course?: string;
}

export interface AVItem {
  id: string;
  item: string;
  quantity: number;
  notes?: string;
}

export interface BEOBuilderState {
  event_name: string;
  event_date: string;
  start_time: string;
  end_time: string;
  guest_count: number;
  space_id?: string;
  contact_id?: string;
  booking_id?: string;
  setup_type: string;
  timeline: TimelineItem[];
  menu_items: MenuItem[];
  dietary_requirements: string[];
  av_requirements: AVItem[];
  room_setup_notes: string;
  general_notes: string;
  internal_notes: string;
  special_requests: string;
}

const initialState: BEOBuilderState = {
  event_name: '',
  event_date: '',
  start_time: '',
  end_time: '',
  guest_count: 0,
  setup_type: 'theater',
  timeline: [],
  menu_items: [],
  dietary_requirements: [],
  av_requirements: [],
  room_setup_notes: '',
  general_notes: '',
  internal_notes: '',
  special_requests: '',
};

export function useBEOBuilder(initial?: Partial<BEOBuilderState>) {
  const [state, setState] = useState<BEOBuilderState>({
    ...initialState,
    ...initial,
  });

  const updateField = useCallback(<K extends keyof BEOBuilderState>(
    field: K,
    value: BEOBuilderState[K]
  ) => {
    setState((prev) => ({ ...prev, [field]: value }));
  }, []);

  const addTimelineItem = useCallback((item: Omit<TimelineItem, 'id'>) => {
    const newItem: TimelineItem = {
      ...item,
      id: `timeline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    setState((prev) => ({
      ...prev,
      timeline: [...prev.timeline, newItem].sort((a, b) => a.time.localeCompare(b.time)),
    }));
    return newItem.id;
  }, []);

  const updateTimelineItem = useCallback((id: string, updates: Partial<TimelineItem>) => {
    setState((prev) => ({
      ...prev,
      timeline: prev.timeline
        .map((item) => (item.id === id ? { ...item, ...updates } : item))
        .sort((a, b) => a.time.localeCompare(b.time)),
    }));
  }, []);

  const removeTimelineItem = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      timeline: prev.timeline.filter((item) => item.id !== id),
    }));
  }, []);

  const addMenuItem = useCallback((item: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      ...item,
      id: `menu_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    setState((prev) => ({
      ...prev,
      menu_items: [...prev.menu_items, newItem],
    }));
    return newItem.id;
  }, []);

  const updateMenuItem = useCallback((id: string, updates: Partial<MenuItem>) => {
    setState((prev) => ({
      ...prev,
      menu_items: prev.menu_items.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    }));
  }, []);

  const removeMenuItem = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      menu_items: prev.menu_items.filter((item) => item.id !== id),
    }));
  }, []);

  const addAVItem = useCallback((item: Omit<AVItem, 'id'>) => {
    const newItem: AVItem = {
      ...item,
      id: `av_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    setState((prev) => ({
      ...prev,
      av_requirements: [...prev.av_requirements, newItem],
    }));
    return newItem.id;
  }, []);

  const updateAVItem = useCallback((id: string, updates: Partial<AVItem>) => {
    setState((prev) => ({
      ...prev,
      av_requirements: prev.av_requirements.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    }));
  }, []);

  const removeAVItem = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      av_requirements: prev.av_requirements.filter((item) => item.id !== id),
    }));
  }, []);

  const addDietaryRequirement = useCallback((requirement: string) => {
    if (!state.dietary_requirements.includes(requirement)) {
      setState((prev) => ({
        ...prev,
        dietary_requirements: [...prev.dietary_requirements, requirement],
      }));
    }
  }, [state.dietary_requirements]);

  const removeDietaryRequirement = useCallback((requirement: string) => {
    setState((prev) => ({
      ...prev,
      dietary_requirements: prev.dietary_requirements.filter((r) => r !== requirement),
    }));
  }, []);

  const loadFromBooking = useCallback((booking: {
    event_name: string;
    event_date: string;
    start_time: string;
    end_time: string;
    guest_count: number;
    space_id: string;
    contact_id: string;
    setup_type?: string;
  }) => {
    setState((prev) => ({
      ...prev,
      event_name: booking.event_name,
      event_date: booking.event_date,
      start_time: booking.start_time,
      end_time: booking.end_time,
      guest_count: booking.guest_count,
      space_id: booking.space_id,
      contact_id: booking.contact_id,
      booking_id: booking.space_id,
      setup_type: booking.setup_type || 'theater',
    }));
  }, []);

  const loadFromTemplate = useCallback((template: {
    timeline?: TimelineItem[];
    menu_items?: MenuItem[];
    av_requirements?: AVItem[];
    dietary_requirements?: string[];
    setup_type?: string;
    room_setup_notes?: string;
  }) => {
    setState((prev) => ({
      ...prev,
      timeline: template.timeline || prev.timeline,
      menu_items: template.menu_items || prev.menu_items,
      av_requirements: template.av_requirements || prev.av_requirements,
      dietary_requirements: template.dietary_requirements || prev.dietary_requirements,
      setup_type: template.setup_type || prev.setup_type,
      room_setup_notes: template.room_setup_notes || prev.room_setup_notes,
    }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  const isValid = useCallback(() => {
    if (!state.event_name.trim()) return false;
    if (!state.event_date) return false;
    if (!state.start_time) return false;
    if (!state.end_time) return false;
    if (state.guest_count <= 0) return false;
    return true;
  }, [state]);

  const toJSON = useCallback(() => {
    return {
      event_name: state.event_name,
      event_date: state.event_date,
      start_time: state.start_time,
      end_time: state.end_time,
      guest_count: state.guest_count,
      space_id: state.space_id,
      contact_id: state.contact_id,
      booking_id: state.booking_id,
      sections: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        timeline: state.timeline.map(({ id, ...item }) => item),
        room_setup: {
          layout: state.setup_type,
          notes: state.room_setup_notes,
        },
        catering: {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          menu_items: state.menu_items.map(({ id, ...item }) => item),
          dietary_requirements: state.dietary_requirements,
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        av_requirements: state.av_requirements.map(({ id, ...item }) => item),
        notes: state.general_notes,
      },
      internal_notes: state.internal_notes,
      special_requests: state.special_requests,
    };
  }, [state]);

  return {
    state,
    updateField,
    addTimelineItem,
    updateTimelineItem,
    removeTimelineItem,
    addMenuItem,
    updateMenuItem,
    removeMenuItem,
    addAVItem,
    updateAVItem,
    removeAVItem,
    addDietaryRequirement,
    removeDietaryRequirement,
    loadFromBooking,
    loadFromTemplate,
    reset,
    isValid,
    toJSON,
  };
}
