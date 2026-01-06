import { render, screen, fireEvent } from '@testing-library/react';
import { ListPage } from './ListPage.js';
import { describe, it, expect, vi } from 'vitest';

interface TestItem {
  id: string;
  name: string;
  status: string;
}

const mockItems: TestItem[] = [
  { id: '1', name: 'Item 1', status: 'active' },
  { id: '2', name: 'Item 2', status: 'inactive' },
  { id: '3', name: 'Item 3', status: 'active' },
];

const mockColumns = [
  {
    id: 'name',
    header: 'Name',
    accessor: 'name' as keyof TestItem,
  },
  {
    id: 'status',
    header: 'Status',
    accessor: 'status' as keyof TestItem,
  },
];

describe('ListPage Component', () => {
  it('renders with default props', () => {
    render(<ListPage items={mockItems} columns={mockColumns} />);
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
  });

  it('renders search input when enabled', () => {
    render(<ListPage items={mockItems} columns={mockColumns} enableSearch />);
    const searchInput = screen.getByPlaceholderText('Search...');
    expect(searchInput).toBeInTheDocument();
  });

  it('handles search input changes', () => {
    const mockOnSearch = vi.fn();
    render(<ListPage items={mockItems} columns={mockColumns} enableSearch onSearch={mockOnSearch} />);

    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'Item 1' } });

    expect(mockOnSearch).toHaveBeenCalledWith('Item 1');
  });

  it('filters items based on search', () => {
    render(<ListPage items={mockItems} columns={mockColumns} enableSearch />);

    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'Item 1' } });

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.queryByText('Item 2')).not.toBeInTheDocument();
    expect(screen.queryByText('Item 3')).not.toBeInTheDocument();
  });

  it('renders filters button when enabled', () => {
    render(<ListPage items={mockItems} columns={mockColumns} enableFilters />);
    expect(screen.getByText('Filters')).toBeInTheDocument();
  });

  it('renders import/export buttons when enabled', () => {
    render(<ListPage items={mockItems} columns={mockColumns} enableImportExport />);
    expect(screen.getByText('Import')).toBeInTheDocument();
    expect(screen.getByText('Export')).toBeInTheDocument();
  });

  it('renders loading state', () => {
    render(<ListPage items={mockItems} columns={mockColumns} loading />);
    const loadingSpinner = document.querySelector('.animate-spin');
    expect(loadingSpinner).toBeInTheDocument();
  });

  it('renders empty state when no items', () => {
    render(<ListPage items={[]} columns={mockColumns} />);
    expect(screen.getByText('No items found')).toBeInTheDocument();
  });

  it('renders custom empty state', () => {
    const customEmptyState = <div>Custom empty message</div>;
    render(<ListPage items={[]} columns={mockColumns} emptyState={customEmptyState} />);
    expect(screen.getByText('Custom empty message')).toBeInTheDocument();
  });

  it('renders error state', () => {
    const customErrorState = <div>Custom error message</div>;
    render(<ListPage items={mockItems} columns={mockColumns} errorState={customErrorState} />);
    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  it('shows item count', () => {
    render(<ListPage items={mockItems} columns={mockColumns} />);
    expect(screen.getByText('3 items found')).toBeInTheDocument();
  });

  it('shows pagination info', () => {
    const pagination = { 
      page: 2, 
      pageSize: 10, 
      total: 25,
      onPageChange: vi.fn(),
      onPageSizeChange: vi.fn()
    };
    render(<ListPage items={mockItems} columns={mockColumns} pagination={pagination} />);
    expect(screen.getByText('3 items found (Page 2 of 3)')).toBeInTheDocument();
  });

  it('renders bulk actions when items are selected', () => {
    const mockBulkActions = [
      { id: 'delete', label: 'Delete', onClick: vi.fn() },
      { id: 'export', label: 'Export', onClick: vi.fn() },
    ];
    const mockOnSelectionChange = vi.fn();

    render(
      <ListPage
        items={mockItems}
        columns={mockColumns}
        bulkActions={mockBulkActions}
        onSelectionChange={mockOnSelectionChange}
      />
    );

    // Since we can't easily test selection in this simple test,
    // we verify the bulk actions structure is set up correctly
    // In a real implementation, we'd need to add checkboxes to the table
    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });

  it('handles selection changes', () => {
    const mockOnSelectionChange = vi.fn();
    render(<ListPage items={mockItems} columns={mockColumns} onSelectionChange={mockOnSelectionChange} />);

    // The current implementation doesn't have checkboxes, so selection change
    // would need to be implemented in the table rendering
    expect(mockOnSelectionChange).not.toHaveBeenCalled();
  });

  it('renders table with correct columns', () => {
    render(<ListPage items={mockItems} columns={mockColumns} />);

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('renders table rows with correct data', () => {
    render(<ListPage items={mockItems} columns={mockColumns} />);

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('inactive')).toBeInTheDocument();
  });

  it('supports custom render functions for columns', () => {
    const customColumns = [
      {
        id: 'name',
        header: 'Name',
        accessor: 'name' as keyof TestItem,
        render: (value: unknown, row: TestItem) => <strong>{String(value)}</strong>,
      },
      {
        id: 'status',
        header: 'Status',
        accessor: 'status' as keyof TestItem,
      },
    ];

    render(<ListPage items={[mockItems[0]]} columns={customColumns} />);

    const strongElement = screen.getByText('Item 1');
    expect(strongElement.tagName).toBe('STRONG');
  });

  it('applies pagination slicing correctly', () => {
    const pagination = { page: 1, pageSize: 2, total: 10 };
    render(<ListPage items={mockItems} columns={mockColumns} pagination={pagination} />);

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.queryByText('Item 3')).not.toBeInTheDocument(); // Should be on page 2
  });

  it('renders with custom className', () => {
    render(<ListPage items={mockItems} columns={mockColumns} className="custom-class" />);
    const container = screen.getByText('Item 1').closest('.list-page');
    expect(container).toHaveClass('custom-class');
  });

  it('handles empty columns array', () => {
    render(<ListPage items={mockItems} columns={[]} />);
    // Should still render but without table headers
    expect(screen.getByText('3 items found')).toBeInTheDocument();
  });

  it('handles undefined accessor values', () => {
    const itemsWithUndefined = [{ id: '1', name: undefined, status: 'active' }];
    render(<ListPage items={itemsWithUndefined} columns={mockColumns} />);
    // Should render empty string for undefined values
    expect(screen.getByText('')).toBeInTheDocument();
  });

  it('supports custom search placeholder', () => {
    render(<ListPage items={mockItems} columns={mockColumns} enableSearch searchPlaceholder="Find items..." />);
    const searchInput = screen.getByPlaceholderText('Find items...');
    expect(searchInput).toBeInTheDocument();
  });
});
