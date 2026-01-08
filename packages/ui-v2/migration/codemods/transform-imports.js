/**
 * Codemod: Transform v1 imports to v2 modular imports
 *
 * Transforms:
 * import { Button, Card } from '@ghxstship/ui';
 *
 * To:
 * import { Button } from '@ghxstship/ui-v2/primitives';
 * import { Card } from '@ghxstship/ui-v2/components';
 */

const COMPONENT_MAPPING = {
  // Primitives
  Button: 'primitives',
  Input: 'primitives',
  Textarea: 'primitives',
  Checkbox: 'primitives',
  Radio: 'primitives',
  Switch: 'primitives',
  Select: 'primitives',
  Text: 'primitives',
  Heading: 'primitives',
  Label: 'primitives',
  Code: 'primitives',
  Box: 'primitives',
  Stack: 'primitives',
  Grid: 'primitives',
  Flex: 'primitives',
  Container: 'primitives',
  Separator: 'primitives',
  Spinner: 'primitives',
  Progress: 'primitives',
  Skeleton: 'primitives',
  Avatar: 'primitives',

  // Compositions
  Card: 'components',
  Badge: 'components',
  List: 'components',
  Chip: 'components',
  Table: 'components',
  Alert: 'components',
  EmptyState: 'components',
  Banner: 'components',
  Toast: 'components',
  ErrorBoundary: 'components',
  Breadcrumb: 'components',
  Tabs: 'components',
  Pagination: 'components',
  Nav: 'components',
  Sidebar: 'components',
  Field: 'components',
  ButtonGroup: 'components',
  FormGroup: 'components',
  Fieldset: 'components',
  Menu: 'components',
  Dialog: 'components',
  Tooltip: 'components',
  Dropdown: 'components',
  Popover: 'components',
  Sheet: 'components',

  // Renames
  Modal: 'components', // Will be renamed to Dialog
  Divider: 'primitives', // Will be renamed to Separator
};

module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let hasModifications = false;

  // Find all imports from @ghxstship/ui
  root
    .find(j.ImportDeclaration)
    .filter(path => path.node.source.value === '@ghxstship/ui')
    .forEach(path => {
      const importedComponents = path.node.specifiers
        .filter(spec => spec.type === 'ImportSpecifier')
        .map(spec => ({
          imported: spec.imported.name,
          local: spec.local.name,
        }));

      if (importedComponents.length === 0) return;

      // Group components by their new import path
      const componentsByPath = {};

      importedComponents.forEach(({ imported, local }) => {
        const targetPath = COMPONENT_MAPPING[imported];

        if (targetPath) {
          if (!componentsByPath[targetPath]) {
            componentsByPath[targetPath] = [];
          }

          // Handle renames
          let finalImported = imported;
          if (imported === 'Modal') finalImported = 'Dialog';
          if (imported === 'Divider') finalImported = 'Separator';

          componentsByPath[targetPath].push({
            imported: finalImported,
            local: finalImported === imported ? local : imported, // Keep local name for now
          });
        }
      });

      // Create new import declarations
      const newImports = Object.entries(componentsByPath).map(([path, components]) => {
        const specifiers = components.map(({ imported, local }) => {
          return j.importSpecifier(
            j.identifier(imported),
            local !== imported ? j.identifier(local) : null
          );
        });

        return j.importDeclaration(
          specifiers,
          j.literal(`@ghxstship/ui-v2/${path}`)
        );
      });

      // Replace the old import with new imports
      if (newImports.length > 0) {
        j(path).replaceWith(newImports);
        hasModifications = true;
      }
    });

  return hasModifications ? root.toSource({ quote: 'single' }) : null;
};
