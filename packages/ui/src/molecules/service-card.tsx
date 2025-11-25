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
          "p-6 border-2 hover:shadow-[8px_8px_0_0_#000] hover:-translate-y-1 transition-all group",
          bgClasses[background],
          className
        )}
        {...props}
      >
        <div className="mb-4 text-4xl">{icon}</div>
        <h3 className="font-heading text-[1.5rem] uppercase tracking-wider mb-3">{title}</h3>
        <p className="font-body text-[1rem] leading-body">{description}</p>
      </div>
    );
  }
);
