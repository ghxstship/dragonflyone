import { useState, useMemo } from 'react';

export interface Event {
  id: string;
  title: string;
  category: string;
  status: string;
  date: string;
  price: number;
  venue: string;
}

export interface EventFilters {
  category: string;
  status: string;
  minPrice: number;
  maxPrice: number;
  searchQuery: string;
  sortBy: 'date' | 'price' | 'title';
  sortOrder: 'asc' | 'desc';
}

const defaultFilters: EventFilters = {
  category: 'all',
  status: 'all',
  minPrice: 0,
  maxPrice: Infinity,
  searchQuery: '',
  sortBy: 'date',
  sortOrder: 'asc',
};

export function useEventFilters(events: Event[]) {
  const [filters, setFilters] = useState<EventFilters>(defaultFilters);

  const filteredEvents = useMemo(() => {
    const result = events.filter(event => {
      const matchesCategory = filters.category === 'all' || event.category === filters.category;
      const matchesStatus = filters.status === 'all' || event.status === filters.status;
      const matchesPrice = event.price >= filters.minPrice && event.price <= filters.maxPrice;
      const matchesSearch = 
        filters.searchQuery === '' ||
        event.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        event.venue.toLowerCase().includes(filters.searchQuery.toLowerCase());

      return matchesCategory && matchesStatus && matchesPrice && matchesSearch;
    });

    // Sort results
    result.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
      }

      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [events, filters]);

  const updateFilter = (key: keyof EventFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  return {
    filters,
    filteredEvents,
    updateFilter,
    resetFilters,
    totalResults: filteredEvents.length,
  };
}
