'use client';

import { useState } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Input,
  Select,
  Field,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Badge,
  H3,
  H4,
  Body,
  Alert,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ButtonGroup,
  Minus,
  Plus,
} from '@ghxstship/ui';
import { useCreateAdvance } from '@ghxstship/config';
import { CatalogBrowser } from './CatalogBrowser';
import type { ProductionCatalogItem, CreateAdvancePayload } from '@ghxstship/config/types/advancing';

interface AdvanceItem {
  catalog_item_id?: string;
  catalog_item?: ProductionCatalogItem;
  item_name: string;
  description?: string;
  quantity: number;
  unit: string;
  unit_cost?: number;
  notes?: string;
}

interface AdvanceRequestFormProps {
  projectId?: string;
  onSuccess?: (requestId: string) => void;
  onCancel?: () => void;
}

export function AdvanceRequestForm({
  projectId,
  onSuccess,
  onCancel,
}: AdvanceRequestFormProps) {
  const [teamWorkspace, setTeamWorkspace] = useState('');
  const [activationName, setActivationName] = useState('');
  const [items, setItems] = useState<AdvanceItem[]>([]);
  const [showCatalog, setShowCatalog] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { mutate: createAdvance, isPending } = useCreateAdvance();

  const handleAddFromCatalog = (catalogItem: ProductionCatalogItem) => {
    const newItem: AdvanceItem = {
      catalog_item_id: catalogItem.id,
      catalog_item: catalogItem,
      item_name: catalogItem.item_name,
      quantity: 1,
      unit: catalogItem.standard_unit,
    };
    setItems([...items, newItem]);
    setShowCatalog(false);
  };

  const handleAddCustomItem = () => {
    const newItem: AdvanceItem = {
      item_name: '',
      quantity: 1,
      unit: 'Per Unit',
    };
    setItems([...items, newItem]);
  };

  const handleUpdateItem = (index: number, updates: Partial<AdvanceItem>) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], ...updates };
    setItems(updatedItems);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateEstimatedCost = () => {
    return items.reduce((total, item) => {
      if (item.unit_cost && item.quantity) {
        return total + item.unit_cost * item.quantity;
      }
      return total;
    }, 0);
  };

  const handleSubmit = () => {
    setError(null);

    // Validation
    if (items.length === 0) {
      setError('Please add at least one item to the request');
      return;
    }

    if (!teamWorkspace && !activationName) {
      setError('Please provide either a team/workspace or activation name');
      return;
    }

    const hasInvalidItems = items.some((item) => !item.item_name || item.quantity <= 0);
    if (hasInvalidItems) {
      setError('All items must have a name and positive quantity');
      return;
    }

    const payload: CreateAdvancePayload = {
      project_id: projectId,
      team_workspace: teamWorkspace || undefined,
      activation_name: activationName || undefined,
      items: items.map((item) => ({
        catalog_item_id: item.catalog_item_id,
        item_name: item.item_name,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unit_cost: item.unit_cost,
        notes: item.notes,
      })),
      estimated_cost: calculateEstimatedCost(),
    };

    createAdvance(payload, {
      onSuccess: (data) => {
        if (onSuccess && data.id) {
          onSuccess(data.id);
        }
      },
      onError: (err: any) => {
        setError(err.message || 'Failed to create advance request');
      },
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <H3>New Advance Request</H3>
          <Body>Request production items and services for your event</Body>
        </CardHeader>

        <CardBody>
          {error && (
            <Alert variant="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Request Details */}
          <Field label="Team/Workspace">
            <Input
              type="text"
              placeholder="e.g., Production Team A"
              value={teamWorkspace}
              onChange={(e) => setTeamWorkspace(e.target.value)}
            />
          </Field>

          <Field label="Activation Name">
            <Input
              type="text"
              placeholder="e.g., Summer Festival 2025"
              value={activationName}
              onChange={(e) => setActivationName(e.target.value)}
            />
          </Field>

          {/* Items Section */}
          <H4>Requested Items</H4>

          {items.length === 0 ? (
            <Alert variant="info">
              No items added yet. Add items from the catalog or create custom items.
            </Alert>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Unit Cost</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {item.catalog_item ? (
                        <>
                          <Body>{item.item_name}</Body>
                          <Badge variant="outline">{item.catalog_item.item_id}</Badge>
                        </>
                      ) : (
                        <Input
                          type="text"
                          value={item.item_name}
                          onChange={(e) =>
                            handleUpdateItem(index, { item_name: e.target.value })
                          }
                          placeholder="Item name"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          handleUpdateItem(index, {
                            quantity: parseFloat(e.target.value) || 0,
                          })
                        }
                        min="0"
                        step="0.1"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="text"
                        value={item.unit}
                        onChange={(e) => handleUpdateItem(index, { unit: e.target.value })}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.unit_cost || ''}
                        onChange={(e) =>
                          handleUpdateItem(index, {
                            unit_cost: parseFloat(e.target.value) || undefined,
                          })
                        }
                        placeholder="Cost"
                        min="0"
                        step="0.01"
                      />
                    </TableCell>
                    <TableCell>
                      {item.unit_cost && item.quantity
                        ? `$${(item.unit_cost * item.quantity).toFixed(2)}`
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveItem(index)}
                      >
                        <Minus />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <ButtonGroup>
            <Button variant="outline" onClick={() => setShowCatalog(true)}>
              Add from Catalog
            </Button>
            <Button variant="outline" onClick={handleAddCustomItem}>
              Add Custom Item
            </Button>
          </ButtonGroup>

          {/* Cost Summary */}
          {items.length > 0 && calculateEstimatedCost() > 0 && (
            <Alert variant="info">
              <Body>
                <strong>Estimated Total Cost:</strong> ${calculateEstimatedCost().toFixed(2)}
              </Body>
            </Alert>
          )}
        </CardBody>

        <CardFooter>
          <ButtonGroup>
            {onCancel && (
              <Button variant="outline" onClick={onCancel} disabled={isPending}>
                Cancel
              </Button>
            )}
            <Button
              variant="solid"
              onClick={handleSubmit}
              disabled={isPending || items.length === 0}
            >
              {isPending ? 'Submitting...' : 'Submit Request'}
            </Button>
          </ButtonGroup>
        </CardFooter>
      </Card>

      {/* Catalog Browser Modal */}
      {showCatalog && (
        <Modal open={showCatalog} onClose={() => setShowCatalog(false)} size="lg">
          <ModalHeader>
            <H3>Browse Catalog</H3>
          </ModalHeader>
          <ModalBody>
            <CatalogBrowser
              onSelectItem={handleAddFromCatalog}
              selectedItems={items
                .filter((i) => i.catalog_item)
                .map((i) => i.catalog_item!)}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={() => setShowCatalog(false)}>
              Close
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </>
  );
}
