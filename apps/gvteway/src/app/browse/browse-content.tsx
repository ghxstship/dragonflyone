'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Container,
  Section,
  Display,
  H2,
  H3,
  Body,
  Label,
  Button,
  Card,
  Field,
  Input,
  Select,
  Grid,
  Stack,
  Badge,
  ProjectCard,
  LoadingSpinner,
  Pagination,
} from '@ghxstship/ui';
import { useEvents } from '@/hooks/useEvents';

const ITEMS_PER_PAGE = 12;

export default function BrowseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Filter states initialized from URL params
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'date');
  const [dateFrom, setDateFrom] = useState(searchParams.get('dateFrom') || '');
  const [dateTo, setDateTo] = useState(searchParams.get('dateTo') || '');
  const [priceMin, setPriceMin] = useState(searchParams.get('priceMin') || '');
  const [priceMax, setPriceMax] = useState(searchParams.get('priceMax') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [venueType, setVenueType] = useState(searchParams.get('venueType') || 'all');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const { data: events, isLoading } = useEvents({ status: 'published' });

  const filteredEvents = useMemo(() => {
    const displayEvents = events || [];
    return displayEvents
      .filter((e: any) => {
        const matchesSearch = !searchTerm || 
          (e.title || e.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (e.venue && e.venue.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = category === 'all' || e.category === category;
        const matchesDateFrom = !dateFrom || new Date(e.date) >= new Date(dateFrom);
        const matchesDateTo = !dateTo || new Date(e.date) <= new Date(dateTo);
        const matchesPriceMin = !priceMin || e.price >= parseFloat(priceMin);
        const matchesPriceMax = !priceMax || e.price <= parseFloat(priceMax);
        const matchesLocation = !location || 
          (e.city && e.city.toLowerCase().includes(location.toLowerCase())) ||
          (e.state && e.state.toLowerCase().includes(location.toLowerCase()));
        const matchesVenueType = venueType === 'all' || e.venue_type === venueType;
        
        return matchesSearch && matchesCategory && matchesDateFrom && matchesDateTo && 
               matchesPriceMin && matchesPriceMax && matchesLocation && matchesVenueType;
      })
      .sort((a: any, b: any) => {
        switch (sortBy) {
          case 'price-asc': return (a.price || 0) - (b.price || 0);
          case 'price-desc': return (b.price || 0) - (a.price || 0);
          case 'name': return (a.title || a.name || '').localeCompare(b.title || b.name || '');
          case 'popularity': return (b.tickets_sold || 0) - (a.tickets_sold || 0);
          default: return new Date(a.date || a.start_date).getTime() - new Date(b.date || b.start_date).getTime();
        }
      });
  }, [events, searchTerm, category, dateFrom, dateTo, priceMin, priceMax, location, venueType, sortBy]);

  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE);
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setCategory('all');
    setSortBy('date');
    setDateFrom('');
    setDateTo('');
    setPriceMin('');
    setPriceMax('');
    setLocation('');
    setVenueType('all');
    setCurrentPage(1);
  }, []);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchTerm) count++;
    if (category !== 'all') count++;
    if (dateFrom) count++;
    if (dateTo) count++;
    if (priceMin) count++;
    if (priceMax) count++;
    if (location) count++;
    if (venueType !== 'all') count++;
    return count;
  }, [searchTerm, category, dateFrom, dateTo, priceMin, priceMax, location, venueType]);

  const handleEventClick = (eventId: string) => {
    router.push(`/events/${eventId}`);
  };

  if (isLoading) {
    return (
      <Section className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </Section>
    );
  }

  return (
    <Section className="min-h-screen bg-white">
      <Container>
        <Section className="border-b-2 border-black py-8 mb-8">
          <Stack direction="horizontal" className="justify-between items-center">
            <Stack>
              <Display>BROWSE EVENTS</Display>
              <Body className="text-gray-600 mt-2">
                {filteredEvents.length} events found
              </Body>
            </Stack>
            {activeFilterCount > 0 && (
              <Button variant="outline" onClick={handleClearFilters}>
                Clear Filters ({activeFilterCount})
              </Button>
            )}
          </Stack>
        </Section>

        <Card className="p-6 mb-8">
          <Grid cols={4} gap={4} className="mb-4">
            <Field label="Search">
              <Input
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                placeholder="Search events, venues..."
              />
            </Field>

            <Field label="Category">
              <Select value={category} onChange={(e) => { setCategory(e.target.value); setCurrentPage(1); }}>
                <option value="all">All Categories</option>
                <option value="concert">Concerts</option>
                <option value="festival">Festivals</option>
                <option value="conference">Conferences</option>
                <option value="theater">Theater</option>
                <option value="sports">Sports</option>
                <option value="comedy">Comedy</option>
                <option value="nightlife">Nightlife</option>
              </Select>
            </Field>

            <Field label="Location">
              <Input
                value={location}
                onChange={(e) => { setLocation(e.target.value); setCurrentPage(1); }}
                placeholder="City or state..."
              />
            </Field>

            <Field label="Sort By">
              <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="date">Date (Soonest)</option>
                <option value="price-asc">Price (Low to High)</option>
                <option value="price-desc">Price (High to Low)</option>
                <option value="name">Name (A-Z)</option>
                <option value="popularity">Popularity</option>
              </Select>
            </Field>
          </Grid>

          <Stack direction="horizontal" className="justify-between items-center">
            <Button 
              variant="ghost" 
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
            </Button>
          </Stack>

          {showAdvanced && (
            <Grid cols={4} gap={4} className="mt-4 pt-4 border-t border-gray-200">
              <Field label="Date From">
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }}
                />
              </Field>

              <Field label="Date To">
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1); }}
                />
              </Field>

              <Field label="Min Price ($)">
                <Input
                  type="number"
                  value={priceMin}
                  onChange={(e) => { setPriceMin(e.target.value); setCurrentPage(1); }}
                  placeholder="0"
                />
              </Field>

              <Field label="Max Price ($)">
                <Input
                  type="number"
                  value={priceMax}
                  onChange={(e) => { setPriceMax(e.target.value); setCurrentPage(1); }}
                  placeholder="500"
                />
              </Field>

              <Field label="Venue Type">
                <Select value={venueType} onChange={(e) => { setVenueType(e.target.value); setCurrentPage(1); }}>
                  <option value="all">All Venues</option>
                  <option value="arena">Arena</option>
                  <option value="stadium">Stadium</option>
                  <option value="theater">Theater</option>
                  <option value="club">Club</option>
                  <option value="outdoor">Outdoor</option>
                  <option value="convention">Convention Center</option>
                </Select>
              </Field>
            </Grid>
          )}
        </Card>

        {activeFilterCount > 0 && (
          <Stack direction="horizontal" gap={2} className="mb-6 flex-wrap">
            {searchTerm && (
              <Badge>Search: {searchTerm}</Badge>
            )}
            {category !== 'all' && (
              <Badge>Category: {category}</Badge>
            )}
            {location && (
              <Badge>Location: {location}</Badge>
            )}
            {dateFrom && (
              <Badge>From: {dateFrom}</Badge>
            )}
            {dateTo && (
              <Badge>To: {dateTo}</Badge>
            )}
            {priceMin && (
              <Badge>Min: ${priceMin}</Badge>
            )}
            {priceMax && (
              <Badge>Max: ${priceMax}</Badge>
            )}
            {venueType !== 'all' && (
              <Badge>Venue: {venueType}</Badge>
            )}
          </Stack>
        )}

        {paginatedEvents.length > 0 ? (
          <Stack gap={8}>
            <Grid cols={3} gap={6}>
              {paginatedEvents.map((event: any) => (
                <ProjectCard
                  key={event.id}
                  title={event.title || event.name}
                  image={event.image || event.image_url || ''}
                  metadata={`${event.date || event.start_date} • ${event.venue || event.venue_name} • From $${event.price || 0}`}
                  tags={event.category ? [event.category] : undefined}
                  onClick={() => handleEventClick(event.id)}
                />
              ))}
            </Grid>

            {totalPages > 1 && (
              <Stack className="items-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </Stack>
            )}
          </Stack>
        ) : (
          <Card className="p-12 text-center">
            <H3 className="mb-4">NO EVENTS FOUND</H3>
            <Body className="text-gray-600 mb-6">
              Try adjusting your filters or search terms to find more events.
            </Body>
            <Button variant="outline" onClick={handleClearFilters}>
              Clear All Filters
            </Button>
          </Card>
        )}
      </Container>
    </Section>
  );
}
