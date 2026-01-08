/**
 * Codemod: Transform size prop values
 *
 * Transforms:
 * <Button size="large" />
 * <Input size="small" />
 * <Badge size="xs" />
 *
 * To:
 * <Button size="lg" />
 * <Input size="sm" />
 * <Badge size="sm" />
 */

const SIZE_MAPPINGS = {
  'extra-small': 'sm',
  'xs': 'sm',
  'small': 'sm',
  'medium': 'md',
  'large': 'lg',
  'extra-large': 'lg',
  'xl': 'lg',
  '2xl': 'xl',
};

module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let hasModifications = false;

  // Find all JSX elements with size prop
  root.find(j.JSXElement).forEach(path => {
    const openingElement = path.node.openingElement;

    if (!openingElement.attributes) return;

    openingElement.attributes.forEach(attr => {
      if (
        attr.type === 'JSXAttribute' &&
        attr.name.name === 'size' &&
        attr.value &&
        attr.value.type === 'StringLiteral'
      ) {
        const oldValue = attr.value.value;
        const newValue = SIZE_MAPPINGS[oldValue];

        if (newValue && newValue !== oldValue) {
          attr.value.value = newValue;
          hasModifications = true;
        }
      }
    });
  });

  return hasModifications ? root.toSource({ quote: 'single' }) : null;
};
