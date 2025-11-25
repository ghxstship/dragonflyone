# UI Normalization Guide

This document describes the normalized UI components and patterns introduced to standardize CRUD operations, data management, and user interactions across all GHXSTSHIP applications.

## Overview

The normalization effort introduces reusable components that encapsulate common UI patterns:

- **ListPage** - Complete list/table page template
- **DataGrid** - Advanced data table with all features
- **RecordFormModal** - Create/edit forms in modals
- **DetailDrawer** - Side panel for record details
- **ConfirmDialog** - Confirmation dialogs for destructive actions
- **BulkActionBar** - Contextual actions for selected items
- **RowActions** - Dropdown menu for row-level actions

## Quick Start

### Basic List Page

```tsx
import {
  ListPage,
  RecordFormModal,
  ConfirmDialog,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type FormFieldConfig,
} from '@ghxstship/ui';

interface Item {
  id: string;
  name: string;
  status: string;
}

const columns: ListPageColumn<Item>[] = [
  { key: 'name', label: 'Name', accessor: 'name', sortable: true },
  { key: 'status', label: 'Status', accessor: 'status', sortable: true },
];

const filters: ListPageFilter[] = [
  { key: 'status', label: 'Status', options: [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ]},
];

const formFields: FormFieldConfig[] = [
  { name: 'name', label: 'Name', type: 'text', required: true },
  { name: 'status', label: 'Status', type: 'select', options: [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ]},
];

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  return (
    <>
      <ListPage<Item>
        title="Items"
        data={items}
        columns={columns}
        rowKey="id"
        filters={filters}
        createLabel="New Item"
        onCreate={() => setCreateModalOpen(true)}
      />
      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mode="create"
        title="Create Item"
        fields={formFields}
        onSubmit={handleCreate}
      />
    </>
  );
}
```

## Components Reference

### ListPage

A complete page template for list/table views with search, filters, sorting, selection, and actions.

```tsx
<ListPage<T>
  // Required
  title="Page Title"
  data={items}
  columns={columns}
  rowKey="id"
  
  // Optional - Loading/Error
  loading={isLoading}
  error={error}
  onRetry={refetch}
  
  // Optional - Search & Filters
  searchPlaceholder="Search..."
  filters={filters}
  
  // Optional - Actions
  rowActions={rowActions}
  bulkActions={bulkActions}
  onBulkAction={handleBulkAction}
  onRowClick={handleRowClick}
  
  // Optional - Create
  createLabel="Create New"
  onCreate={handleCreate}
  
  // Optional - Import/Export
  onImport={handleImport}
  onExport={handleExport}
  
  // Optional - Stats
  stats={[
    { label: 'Total', value: items.length },
    { label: 'Active', value: activeCount },
  ]}
  
  // Optional - Empty State
  emptyMessage="No items found"
  emptyAction={{ label: 'Create Item', onClick: handleCreate }}
  
  // Optional - Header
  header={<Navigation />}
/>
```

### RecordFormModal

A modal for creating or editing records with form validation.

```tsx
<RecordFormModal
  open={isOpen}
  onClose={handleClose}
  mode="create" | "edit"
  title="Create Item"
  fields={formFields}
  initialData={editingItem}
  onSubmit={handleSubmit}
  size="sm" | "md" | "lg"
  
  // Multi-step forms
  steps={[
    { id: 'basic', title: 'Basic Info', fields: basicFields },
    { id: 'details', title: 'Details', fields: detailFields },
  ]}
/>
```

### DetailDrawer

A side panel for viewing record details with sections and actions.

```tsx
<DetailDrawer<T>
  open={isOpen}
  onClose={handleClose}
  record={selectedItem}
  title={(item) => item.name}
  subtitle={(item) => item.code}
  sections={[
    { id: 'overview', title: 'Overview', content: <OverviewContent /> },
    { id: 'history', title: 'History', content: <HistoryContent /> },
  ]}
  onEdit={handleEdit}
  onDelete={handleDelete}
  actions={[
    { id: 'archive', label: 'Archive', icon: '📦' },
  ]}
  onAction={handleAction}
/>
```

### ConfirmDialog

A confirmation dialog for destructive actions.

```tsx
<ConfirmDialog
  open={isOpen}
  title="Delete Item"
  message="Are you sure you want to delete this item?"
  variant="danger" | "warning" | "info"
  confirmLabel="Delete"
  cancelLabel="Cancel"
  onConfirm={handleConfirm}
  onCancel={handleCancel}
/>
```

### DataGrid

A standalone data grid component with all features.

```tsx
<DataGrid<T>
  data={items}
  columns={columns}
  rowKey="id"
  
  // Search & Filter
  searchable
  searchPlaceholder="Search..."
  filters={filters}
  
  // Sorting
  sortable
  defaultSortColumn="name"
  defaultSortDirection="asc"
  
  // Selection
  selectable
  selectedKeys={selectedIds}
  onSelectionChange={setSelectedIds}
  
  // Actions
  rowActions={rowActions}
  bulkActions={bulkActions}
  
  // Pagination
  pageSize={25}
  pageSizeOptions={[10, 25, 50, 100]}
/>
```

## Hooks Reference

### useDataGrid

Manages data grid state including search, sort, filter, selection, and pagination.

```tsx
const {
  processedData,
  totalCount,
  searchValue,
  setSearchValue,
  sortColumn,
  sortDirection,
  handleSort,
  selectedKeys,
  setSelectedKeys,
  selectAll,
  clearSelection,
  currentPage,
  setCurrentPage,
  pageSize,
  setPageSize,
  totalPages,
} = useDataGrid({
  data: items,
  searchableFields: ['name', 'description'],
  defaultSortColumn: 'name',
  defaultSortDirection: 'asc',
  defaultPageSize: 25,
});
```

### useFormState

Manages form state with validation.

```tsx
const {
  values,
  setValue,
  errors,
  touched,
  validate,
  isValid,
  isDirty,
  handleSubmit,
  reset,
} = useFormState({
  initialValues: { name: '', email: '' },
  validationRules: {
    name: [{ validator: (v) => !!v, message: 'Required' }],
    email: [{ validator: (v) => /\S+@\S+/.test(v), message: 'Invalid email' }],
  },
  onSubmit: async (values) => { /* ... */ },
});
```

### useBulkActions

Manages selection and bulk action execution.

```tsx
const {
  selectedIds,
  selectedCount,
  isSelected,
  toggleSelection,
  selectAll,
  clearSelection,
  executeAction,
  isExecuting,
} = useBulkActions({
  onAction: async (actionId, ids) => { /* ... */ },
});
```

## Type Definitions

### ListPageColumn

```tsx
interface ListPageColumn<T> {
  key: string;
  label: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  sortable?: boolean;
  width?: string;
  render?: (value: unknown, row: T) => React.ReactNode;
}
```

### ListPageFilter

```tsx
interface ListPageFilter {
  key: string;
  label: string;
  options: { value: string; label: string }[];
  multiple?: boolean;
}
```

### ListPageAction

```tsx
interface ListPageAction<T> {
  id: string;
  label: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'danger';
  onClick: (row: T) => void;
}
```

### FormFieldConfig

```tsx
interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  colSpan?: 1 | 2;
  validation?: ValidationRule[];
}
```

## Migration Guide

### Before (Old Pattern)

```tsx
// Lots of boilerplate with individual components
<Section>
  <Container>
    <Stack>
      <Display>Title</Display>
      <Grid>
        <StatCard value={count} label="Total" />
      </Grid>
      <Stack direction="horizontal">
        <Input value={search} onChange={...} />
        <Select value={filter} onChange={...} />
      </Stack>
      <Table>
        <TableHeader>...</TableHeader>
        <TableBody>
          {items.map(item => (
            <TableRow key={item.id}>
              <TableCell>{item.name}</TableCell>
              <TableCell>
                <Button onClick={() => handleEdit(item)}>Edit</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Stack>
  </Container>
</Section>
```

### After (Normalized Pattern)

```tsx
// Clean, declarative configuration
<ListPage<Item>
  title="Title"
  data={items}
  columns={columns}
  rowKey="id"
  filters={filters}
  rowActions={rowActions}
  stats={stats}
/>
```

## Best Practices

1. **Define columns, filters, and form fields outside the component** to prevent unnecessary re-renders
2. **Use the `rowKey` prop** with a unique identifier field
3. **Provide meaningful empty states** with action buttons
4. **Use ConfirmDialog for destructive actions** like delete
5. **Leverage stats** to show key metrics at a glance
6. **Use DetailDrawer** for viewing details without leaving the page
7. **Implement bulk actions** for common operations on multiple items

## Examples

See the following pages for real-world implementations:

### ATLVS (Enterprise Management)
- `apps/atlvs/src/app/projects/page.tsx` - Projects management
- `apps/atlvs/src/app/contacts/page.tsx` - Contact management
- `apps/atlvs/src/app/vendors/page.tsx` - Vendor management
- `apps/atlvs/src/app/invoices/page.tsx` - Invoice management
- `apps/atlvs/src/app/employees/page.tsx` - Employee/workforce management
- `apps/atlvs/src/app/contracts/page.tsx` - Contract management

### COMPVSS (Production Operations)
- `apps/compvss/src/app/crew/page.tsx` - Crew directory
- `apps/compvss/src/app/equipment/page.tsx` - Equipment inventory
- `apps/compvss/src/app/certifications/page.tsx` - Certifications & licenses
- `apps/compvss/src/app/deliveries/page.tsx` - Delivery tracking

### GVTEWAY (Event Ticketing)
- `apps/gvteway/src/app/admin/promo-codes/page.tsx` - Promo codes management

## Migration Checklist

When normalizing a page, follow this checklist:

1. [ ] Replace imports with normalized components from `@ghxstship/ui`
2. [ ] Define `columns` array with `ListPageColumn<T>[]` type
3. [ ] Define `filters` array with `ListPageFilter[]` type
4. [ ] Define `formFields` array with `FormFieldConfig[]` type
5. [ ] Create state for modals/drawers: `createModalOpen`, `selectedItem`, `drawerOpen`, `deleteConfirmOpen`
6. [ ] Define `rowActions` with view, edit, delete actions
7. [ ] Define `bulkActions` for multi-select operations
8. [ ] Implement `handleCreate`, `handleDelete`, `handleBulkAction` handlers
9. [ ] Define `stats` array for key metrics
10. [ ] Define `detailSections` for the DetailDrawer
11. [ ] Replace JSX with `<ListPage>`, `<RecordFormModal>`, `<DetailDrawer>`, `<ConfirmDialog>`
12. [ ] Test build and verify functionality
