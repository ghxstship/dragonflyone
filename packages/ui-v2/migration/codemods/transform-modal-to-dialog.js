/**
 * Codemod: Transform Modal to Dialog
 *
 * Transforms:
 * import { Modal } from '@ghxstship/ui';
 * <Modal isOpen={open} onClose={onClose} />
 *
 * To:
 * import { Dialog } from '@ghxstship/ui-v2/components';
 * <Dialog open={open} onClose={onClose} />
 */

module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let hasModifications = false;

  // Transform Modal imports to Dialog
  root
    .find(j.ImportDeclaration)
    .filter(path =>
      path.node.source.value === '@ghxstship/ui' ||
      path.node.source.value === '@ghxstship/ui-v2/components'
    )
    .forEach(path => {
      path.node.specifiers.forEach(spec => {
        if (
          spec.type === 'ImportSpecifier' &&
          spec.imported.name === 'Modal'
        ) {
          spec.imported.name = 'Dialog';
          if (spec.local.name === 'Modal') {
            spec.local.name = 'Dialog';
          }
          hasModifications = true;
        }
      });
    });

  // Transform Modal JSX elements to Dialog
  root.find(j.JSXElement).forEach(path => {
    const openingElement = path.node.openingElement;
    const closingElement = path.node.closingElement;

    if (openingElement.name.name === 'Modal') {
      openingElement.name.name = 'Dialog';
      if (closingElement) {
        closingElement.name.name = 'Dialog';
      }
      hasModifications = true;
    }
  });

  // Transform Modal references in JSX expressions
  root.find(j.JSXIdentifier).forEach(path => {
    if (path.node.name === 'Modal') {
      path.node.name = 'Dialog';
      hasModifications = true;
    }
  });

  return hasModifications ? root.toSource({ quote: 'single' }) : null;
};
