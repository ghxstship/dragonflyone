/**
 * @deprecated Use `Spinner` with the `text` prop instead.
 * LoadingSpinner is now an alias for Spinner for backward compatibility.
 */
import { Spinner, type SpinnerProps } from "../atoms/spinner.js";

export type LoadingSpinnerProps = Pick<SpinnerProps, "size" | "text">;

export function LoadingSpinner({ size = "md", text }: LoadingSpinnerProps) {
  return <Spinner size={size} text={text} variant="grey" />;
}
