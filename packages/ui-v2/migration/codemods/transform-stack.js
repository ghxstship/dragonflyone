/**
 * Codemod: Transform VStack/HStack to Stack
 *
 * Transforms:
 * <VStack spacing={4}>
 * <HStack spacing={2}>
 *
 * To:
 * <Stack direction="vertical" gap="4">
 * <Stack direction="horizontal" gap="2">
 */

module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let hasModifications = false;

  // Transform VStack/HStack imports
  root
    .find(j.ImportDeclaration)
    .filter(path => path.node.source.value === '@ghxstship/ui')
    .forEach(path => {
      let hasVStack = false;
      let hasHStack = false;

      path.node.specifiers = path.node.specifiers.filter(spec => {
        if (spec.type === 'ImportSpecifier') {
          if (spec.imported.name === 'VStack') {
            hasVStack = true;
            return false;
          }
          if (spec.imported.name === 'HStack') {
            hasHStack = true;
            return false;
          }
        }
        return true;
      });

      // Add Stack import if we removed VStack or HStack
      if (hasVStack || hasHStack) {
        path.node.specifiers.push(
          j.importSpecifier(j.identifier('Stack'))
        );
        hasModifications = true;
      }
    });

  // Transform VStack JSX elements
  root.find(j.JSXElement).forEach(path => {
    const openingElement = path.node.openingElement;
    const closingElement = path.node.closingElement;

    if (openingElement.name.name === 'VStack' || openingElement.name.name === 'HStack') {
      const isVStack = openingElement.name.name === 'VStack';

      // Change element name to Stack
      openingElement.name.name = 'Stack';
      if (closingElement) {
        closingElement.name.name = 'Stack';
      }

      // Add direction prop
      openingElement.attributes.unshift(
        j.jsxAttribute(
          j.jsxIdentifier('direction'),
          j.stringLiteral(isVStack ? 'vertical' : 'horizontal')
        )
      );

      // Transform spacing prop to gap
      openingElement.attributes.forEach(attr => {
        if (attr.type === 'JSXAttribute' && attr.name.name === 'spacing') {
          attr.name.name = 'gap';

          // Convert numeric value to string if needed
          if (attr.value && attr.value.type === 'JSXExpressionContainer') {
            const expression = attr.value.expression;
            if (expression.type === 'NumericLiteral') {
              attr.value = j.stringLiteral(String(expression.value));
            }
          }
        }
      });

      hasModifications = true;
    }
  });

  return hasModifications ? root.toSource({ quote: 'single' }) : null;
};
