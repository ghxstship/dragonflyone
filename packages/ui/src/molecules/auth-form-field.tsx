"use client";

import { forwardRef, useState, useId, ReactNode } from "react";
import clsx from "clsx";
import type { InputHTMLAttributes } from "react";
import { Eye, EyeOff, Check, X, AlertCircle } from "lucide-react";
import { Body } from "../atoms/typography.js";
import { Stack } from "../foundations/layout.js";

// =============================================================================
// AUTH FORM FIELD COMPONENTS
// Specialized form inputs for authentication flows
// Bold Contemporary Pop Art Adventure Design System
// =============================================================================

// -----------------------------------------------------------------------------
// AUTH INPUT - Enhanced input with icon support and error states
// -----------------------------------------------------------------------------

export interface AuthInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Left icon */
  icon?: ReactNode;
  /** Right icon/action */
  rightElement?: ReactNode;
  /** Error state */
  error?: boolean;
  /** Size variant */
  size?: "sm" | "md" | "lg";
}

const inputSizeClasses = {
  sm: "h-10 text-sm px-3",
  md: "h-12 text-base px-4",
  lg: "h-14 text-lg px-5",
};

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  function AuthInput({ icon, rightElement, error, size = "md", className, ...props }, ref) {
    const iconPadding = icon ? "pl-11" : "";
    const rightPadding = rightElement ? "pr-11" : "";

    return (
      <div className="relative w-full">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-dark-muted pointer-events-none">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={clsx(
            "w-full font-body rounded-lg border-2 transition-all duration-150",
            "bg-ink-900/50 text-white placeholder:text-on-dark-disabled",
            "focus:outline-none focus:ring-0",
            inputSizeClasses[size],
            iconPadding,
            rightPadding,
            error
              ? "border-error-500 focus:border-error-400 shadow-[0_0_0_3px_rgba(239,68,68,0.1)]"
              : "border-grey-700 hover:border-grey-600 focus:border-primary-500 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)]",
            className
          )}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
    );
  }
);

// -----------------------------------------------------------------------------
// AUTH FORM FIELD - Complete field with label, input, and error message
// -----------------------------------------------------------------------------

export interface AuthFormFieldProps extends Omit<AuthInputProps, "error"> {
  /** Field label */
  label: string;
  /** Error message */
  errorMessage?: string;
  /** Hint text */
  hint?: string;
  /** Required indicator */
  required?: boolean;
}

export const AuthFormField = forwardRef<HTMLInputElement, AuthFormFieldProps>(
  function AuthFormField({ label, errorMessage, hint, required, id, ...props }, ref) {
    const generatedId = useId();
    const fieldId = id || generatedId;
    const errorId = `${fieldId}-error`;
    const hintId = `${fieldId}-hint`;

    return (
      <Stack gap={2} className="w-full">
        <label
          htmlFor={fieldId}
          className="font-code text-mono-sm uppercase tracking-widest text-on-dark-secondary font-medium"
        >
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
        <AuthInput
          ref={ref}
          id={fieldId}
          error={!!errorMessage}
          aria-invalid={!!errorMessage}
          aria-describedby={errorMessage ? errorId : hint ? hintId : undefined}
          {...props}
        />
        {errorMessage && (
          <div id={errorId} className="flex items-center gap-2 text-error-500" role="alert">
            <AlertCircle className="size-4 flex-shrink-0" />
            <Body size="sm">{errorMessage}</Body>
          </div>
        )}
        {hint && !errorMessage && (
          <Body id={hintId} size="sm" className="text-on-dark-disabled">
            {hint}
          </Body>
        )}
      </Stack>
    );
  }
);

// -----------------------------------------------------------------------------
// PASSWORD INPUT - Input with show/hide toggle and strength indicator
// -----------------------------------------------------------------------------

export interface PasswordInputProps extends Omit<AuthFormFieldProps, "type" | "rightElement"> {
  /** Show password strength indicator */
  showStrength?: boolean;
  /** Password value for strength calculation */
  value?: string;
}

const calculatePasswordStrength = (password: string): { score: number; label: string; color: string } => {
  if (!password) return { score: 0, label: "", color: "" };
  
  let score = 0;
  
  // Length checks
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  
  // Character variety checks
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  
  // Normalize to 0-4 scale
  const normalizedScore = Math.min(4, Math.floor(score / 2));
  
  const labels = ["Very Weak", "Weak", "Fair", "Strong", "Very Strong"];
  const colors = ["bg-error-500", "bg-warning-500", "bg-warning-400", "bg-success-500", "bg-success-400"];
  
  return {
    score: normalizedScore,
    label: labels[normalizedScore],
    color: colors[normalizedScore],
  };
};

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput({ showStrength = false, value = "", label = "Password", ...props }, ref) {
    const [showPassword, setShowPassword] = useState(false);
    const strength = showStrength ? calculatePasswordStrength(value) : null;

    return (
      <Stack gap={2} className="w-full">
        <AuthFormField
          ref={ref}
          type={showPassword ? "text" : "password"}
          label={label}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="p-1.5 text-on-dark-muted hover:text-white transition-colors rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </button>
          }
          {...props}
        />
        
        {showStrength && value && (
          <Stack gap={2}>
            {/* Strength bar */}
            <div className="flex gap-1">
              {[0, 1, 2, 3].map((index) => (
                <div
                  key={index}
                  className={clsx(
                    "h-1.5 flex-1 rounded-full transition-all duration-300",
                    index <= strength!.score ? strength!.color : "bg-grey-700"
                  )}
                />
              ))}
            </div>
            {/* Strength label */}
            <Body size="xs" className={clsx(
              "transition-colors",
              strength!.score <= 1 ? "text-error-400" : 
              strength!.score === 2 ? "text-warning-400" : 
              "text-success-400"
            )}>
              {strength!.label}
            </Body>
          </Stack>
        )}
      </Stack>
    );
  }
);

// -----------------------------------------------------------------------------
// PASSWORD REQUIREMENTS - Visual checklist for password requirements
// -----------------------------------------------------------------------------

export interface PasswordRequirement {
  label: string;
  met: boolean;
}

export interface PasswordRequirementsProps {
  requirements: PasswordRequirement[];
  className?: string;
}

export const PasswordRequirements = ({ requirements, className }: PasswordRequirementsProps) => {
  return (
    <Stack gap={2} className={className}>
      {requirements.map((req, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className={clsx(
              "size-4 rounded-full flex items-center justify-center transition-all duration-200",
              req.met
                ? "bg-success-500 text-white"
                : "bg-grey-700 text-grey-500"
            )}
          >
            {req.met ? <Check className="size-3" /> : <X className="size-3" />}
          </div>
          <Body
            size="xs"
            className={clsx(
              "transition-colors",
              req.met ? "text-on-dark-secondary" : "text-on-dark-disabled"
            )}
          >
            {req.label}
          </Body>
        </div>
      ))}
    </Stack>
  );
};

// -----------------------------------------------------------------------------
// AUTH CHECKBOX - Styled checkbox for remember me / terms
// -----------------------------------------------------------------------------

export interface AuthCheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** Checkbox label */
  label: ReactNode;
}

export const AuthCheckbox = forwardRef<HTMLInputElement, AuthCheckboxProps>(
  function AuthCheckbox({ label, className, id, ...props }, ref) {
    const generatedId = useId();
    const checkboxId = id || generatedId;

    return (
      <label
        htmlFor={checkboxId}
        className={clsx(
          "flex items-start gap-3 cursor-pointer group",
          className
        )}
      >
        <div className="relative flex-shrink-0 mt-0.5">
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            className="peer sr-only"
            {...props}
          />
          <div
            className={clsx(
              "size-5 rounded border-2 transition-all duration-150",
              "border-grey-600 bg-ink-900/50",
              "peer-hover:border-grey-500",
              "peer-focus:ring-2 peer-focus:ring-primary-500 peer-focus:ring-offset-2 peer-focus:ring-offset-ink-950",
              "peer-checked:bg-primary-500 peer-checked:border-primary-500"
            )}
          />
          <Check
            className={clsx(
              "absolute top-0.5 left-0.5 size-4 text-white transition-all duration-150",
              "opacity-0 scale-50 peer-checked:opacity-100 peer-checked:scale-100"
            )}
          />
        </div>
        <Body size="sm" className="text-on-dark-secondary group-hover:text-on-dark-primary transition-colors">
          {label}
        </Body>
      </label>
    );
  }
);

// -----------------------------------------------------------------------------
// AUTH DIVIDER - "Or continue with" separator
// -----------------------------------------------------------------------------

export interface AuthDividerProps {
  /** Divider text */
  text?: string;
  className?: string;
}

export const AuthDivider = ({ text = "Or continue with", className }: AuthDividerProps) => {
  return (
    <div className={clsx("relative flex items-center py-4", className)}>
      <div className="flex-1 border-t-2 border-grey-800" />
      <Body size="sm" className="px-4 text-on-dark-disabled uppercase tracking-wider">
        {text}
      </Body>
      <div className="flex-1 border-t-2 border-grey-800" />
    </div>
  );
};

// -----------------------------------------------------------------------------
// SOCIAL AUTH BUTTONS - Branded OAuth provider buttons
// -----------------------------------------------------------------------------

export interface SocialAuthButtonProps {
  /** OAuth provider */
  provider: "google" | "microsoft" | "apple" | "github";
  /** Click handler */
  onClick?: () => void;
  /** Loading state */
  loading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Full width */
  fullWidth?: boolean;
  /** Button text override */
  text?: string;
  className?: string;
}

const providerConfig = {
  google: {
    name: "Google",
    icon: (
      <svg className="size-5" viewBox="0 0 24 24" fill="none">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
    ),
    bgClass: "bg-white hover:bg-grey-100 text-grey-900 border-grey-300",
  },
  microsoft: {
    name: "Microsoft",
    icon: (
      <svg className="size-5" viewBox="0 0 24 24" fill="none">
        <path d="M11.4 11.4H2V2h9.4v9.4z" fill="#F25022"/>
        <path d="M22 11.4h-9.4V2H22v9.4z" fill="#7FBA00"/>
        <path d="M11.4 22H2v-9.4h9.4V22z" fill="#00A4EF"/>
        <path d="M22 22h-9.4v-9.4H22V22z" fill="#FFB900"/>
      </svg>
    ),
    bgClass: "bg-white hover:bg-grey-100 text-grey-900 border-grey-300",
  },
  apple: {
    name: "Apple",
    icon: (
      <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
      </svg>
    ),
    bgClass: "bg-black hover:bg-grey-900 text-white border-grey-800",
  },
  github: {
    name: "GitHub",
    icon: (
      <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
      </svg>
    ),
    bgClass: "bg-grey-900 hover:bg-grey-800 text-white border-grey-700",
  },
};

export const SocialAuthButton = ({
  provider,
  onClick,
  loading = false,
  disabled = false,
  fullWidth = true,
  text,
  className,
}: SocialAuthButtonProps) => {
  const config = providerConfig[provider];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={clsx(
        "inline-flex items-center justify-center gap-3 px-4 py-3 rounded-lg border-2 font-medium transition-all duration-150",
        "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-ink-950",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        config.bgClass,
        fullWidth && "w-full",
        className
      )}
    >
      {loading ? (
        <div className="size-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        config.icon
      )}
      <span>{text || `Continue with ${config.name}`}</span>
    </button>
  );
};

// -----------------------------------------------------------------------------
// SOCIAL AUTH BUTTON GROUP - Grid of social auth buttons
// -----------------------------------------------------------------------------

export interface SocialAuthButtonGroupProps {
  /** Providers to show */
  providers: Array<"google" | "microsoft" | "apple" | "github">;
  /** Click handler - receives provider name */
  onProviderClick?: (provider: string) => void;
  /** Loading provider */
  loadingProvider?: string;
  /** Layout direction */
  direction?: "horizontal" | "vertical";
  /** Show provider name text */
  showText?: boolean;
  className?: string;
}

export const SocialAuthButtonGroup = ({
  providers,
  onProviderClick,
  loadingProvider,
  direction = "horizontal",
  showText = true,
  className,
}: SocialAuthButtonGroupProps) => {
  return (
    <div
      className={clsx(
        "flex gap-3",
        direction === "vertical" ? "flex-col" : "flex-row",
        className
      )}
    >
      {providers.map((provider) => (
        <SocialAuthButton
          key={provider}
          provider={provider}
          onClick={() => onProviderClick?.(provider)}
          loading={loadingProvider === provider}
          disabled={!!loadingProvider && loadingProvider !== provider}
          fullWidth={direction === "vertical"}
          text={showText ? undefined : ""}
          className={!showText ? "!px-3" : undefined}
        />
      ))}
    </div>
  );
};
