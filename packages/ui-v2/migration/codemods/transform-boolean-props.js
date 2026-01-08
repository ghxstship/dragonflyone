/**
 * Codemod: Transform boolean props by removing 'is' prefix
 *
 * Transforms:
 * <Modal isOpen={true} />
 * <Button isLoading={loading} isDisabled={disabled} />
 *
 * To:
 * <Modal open />
 * <Button loading={loading} disabled={disabled} />
 */

const BOOLEAN_PROP_MAPPINGS = {
  isOpen: 'open',
  isLoading: 'loading',
  isDisabled: 'disabled',
  isReadOnly: 'readOnly',
  isInvalid: 'error', // Special case: becomes error prop
  isChecked: 'checked',
  isIndeterminate: 'indeterminate',
  isRequired: 'required',
  isActive: 'active',
  isSelected: 'selected',
  isFocused: 'focused',
  isHovered: 'hovered',
  isExpanded: 'expanded',
  isCollapsed: 'collapsed',
};

module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let hasModifications = false;

  // Find all JSX elements with boolean props
  root.find(j.JSXElement).forEach(path => {
    const openingElement = path.node.openingElement;

    if (!openingElement.attributes) return;

    openingElement.attributes = openingElement.attributes.map(attr => {
      if (attr.type !== 'JSXAttribute') return attr;

      const propName = attr.name.name;
      const newPropName = BOOLEAN_PROP_MAPPINGS[propName];

      if (newPropName) {
        hasModifications = true;

        // Create new attribute with new name
        const newAttr = j.jsxAttribute(
          j.jsxIdentifier(newPropName),
          attr.value
        );

        return newAttr;
      }

      return attr;
    });
  });

  return hasModifications ? root.toSource({ quote: 'single' }) : null;
};
