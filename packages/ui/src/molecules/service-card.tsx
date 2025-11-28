import { forwardRef } from "react";
import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

export type ServiceCardProps = HTMLAttributes<HTMLDivElement> & {
  icon: ReactNode;
  title: string;
  description: string;
  background?: "white" | "black" | "grey";
};

export const ServiceCard = forwardRef<HTMLDivElement, ServiceCardProps>(
  function ServiceCard({ icon, title, description, background = "white", className, ...props }, ref) {
    const bgClasses = {
      white: "bg-white text-black border-black",
      black: "bg-black text-white border-white",
      grey: "bg-grey-100 text-black border-black",
    };

    return (
      <div
        ref={ref}
        className={clsx(
          "p-spacing-6 border-2 rounded-[var(--radius-card)] shadow-[4px_4px_0_rgba(0,0,0,0.1)] hover:shadow-[6px_6px_0_rgba(0,0,0,0.15)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-100 ease-[var(--ease-bounce)] group",
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
