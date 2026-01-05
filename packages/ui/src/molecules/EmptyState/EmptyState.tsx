import { H3, Body } from "../../atoms/Typography/index.js";
import { Button } from "../../atoms/Button/index.js";
import { 
  emptyStateVariants, 
  emptyStateIconVariants,
  emptyStateTitleVariants,
  emptyStateDescriptionVariants,
  emptyStateSuggestionsVariants 
} from "./EmptyState.variants.js";
import type { EmptyStateProps } from "./EmptyState.types.js";

/**
 * EmptyState component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Bold 2px dashed border (comic panel style)
 * - Generous padding
 * - Clear visual hierarchy
 * - CVA-based variants for consistent theming
 * - Support for actions and suggestions
 * 
 * @example
 * ```tsx
 * <EmptyState
 *   icon={<SomeIcon />}
 *   title="No Data Found"
 *   description="Try adjusting your search criteria"
 *   action={{
 *     label: "Clear Filters",
 *     onClick: () => console.log('Clear filters')
 *   }}
 *   suggestions={["Try searching for different terms", "Check your spelling"]}
 * />
 * ```
 */
export function EmptyState({ 
  icon, 
  title, 
  description, 
  action, 
  secondaryAction, 
  suggestions, 
  inverted = false,
  className 
}: EmptyStateProps) {
  return (
    <div className={emptyStateVariants({ inverted, className })}>
      {/* Icon */}
      {icon && (
        <div className={emptyStateIconVariants({ inverted })}>
          {icon}
        </div>
      )}

      {/* Title */}
      <H3 className={emptyStateTitleVariants({ inverted })}>
        {title}
      </H3>

      {/* Description */}
      {description && (
        <Body className={emptyStateDescriptionVariants({ inverted })}>
          {description}
        </Body>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="mt-6 flex flex-col sm:flex-row gap-3 items-center justify-center">
          {action && (
            <Button
              onClick={action.onClick}
              variant={action.variant === "secondary" ? "outline" : "solid"}
              className="animate-pop-in"
            >
              {action.label}
            </Button>
          )}
          
          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              variant="outline"
              className="animate-pop-in"
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}

      {/* Suggestions */}
      {suggestions && suggestions.length > 0 && (
        <div className={emptyStateSuggestionsVariants({ inverted })}>
          <div className="font-medium mb-2">Suggestions:</div>
          <ul className="space-y-1">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-text-tertiary mt-1">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
