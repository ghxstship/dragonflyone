import { forwardRef } from "react";
import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

export type ServiceCardProps = HTMLAttributes<HTMLDivElement> & {
  icon: ReactNode;
  title: string;
  description: string;
  background?: "default" | "inverted" | "muted";
};

export const ServiceCard = forwardRef<HTMLDivElement, ServiceCardProps>(
  function ServiceCard({ icon, title, description, background = "default", className, ...props }, ref) {
    const bgClasses = {
      default: "bg-surface-primary text-on-light-primary border-border-primary",
      inverted: "bg-surface-inverse text-on-dark-primary border-border-inverse",
      muted: "bg-muted text-on-light-primary border-border-primary",
    };

    return (
      <div
        ref={ref}
        className={clsx(
          "p-spacing-6 border-2 rounded-[var(--radius-card)] shadow-md hover:shadow-lg hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-100 ease-[var(--ease-bounce)] group",
          bgClasses[background],
          className
        )}
        {...props}
      >
        <div className="mb-spacing-4 text-h2-lg">{icon}</div>
        <h3 className="font-heading text-h3-sm uppercase tracking-wider mb-spacing-3">{title}</h3>
        <p className="font-body text-body-sm leading-body">{description}</p>
      </div>
    );
  }
);
