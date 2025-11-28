import { forwardRef } from "react";
import clsx from "clsx";
import type { HTMLAttributes } from "react";

export type ProjectCardProps = HTMLAttributes<HTMLDivElement> & {
  title: string;
  image: string;
  imageAlt?: string;
  metadata?: string;
  tags?: string[];
  href?: string;
  onClick?: () => void;
};

export const ProjectCard = forwardRef<HTMLDivElement, ProjectCardProps>(
  function ProjectCard({ title, image, imageAlt, metadata, tags, href, onClick, className, ...props }, ref) {
    const Content = (
      <>
        <div className="relative overflow-hidden bg-grey-900 aspect-[4/3] group-hover:scale-105 transition-transform duration-300">
          <img
            src={image}
            alt={imageAlt || title}
            className="w-full h-full object-cover grayscale contrast-125"
          />
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity" />
        </div>
        <div className="p-spacing-4 border-2 border-t-0 border-black">
          <h3 className="font-heading text-h4-sm uppercase tracking-wider mb-spacing-2">{title}</h3>
          {metadata && (
            <p className="font-code text-mono-xs uppercase tracking-widest text-grey-600 mb-spacing-3">
              {metadata}
            </p>
          )}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-gap-xs">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-spacing-2 py-spacing-1 border border-black font-code text-mono-xxs uppercase tracking-widest"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </>
    );

    if (href) {
      return (
        <a
          href={href}
          className={clsx("block border-2 border-black rounded-[var(--radius-card)] shadow-[4px_4px_0_rgba(0,0,0,0.1)] group hover:shadow-[6px_6px_0_rgba(0,0,0,0.15)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-100 ease-[var(--ease-bounce)] overflow-hidden", className)}
        >
          {Content}
        </a>
      );
    }

    return (
      <div
        ref={ref}
        onClick={onClick}
        className={clsx(
          "border-2 border-black rounded-[var(--radius-card)] shadow-[4px_4px_0_rgba(0,0,0,0.1)] group overflow-hidden",
          onClick && "cursor-pointer hover:shadow-[6px_6px_0_rgba(0,0,0,0.15)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-100 ease-[var(--ease-bounce)]",
          className
        )}
        {...props}
      >
        {Content}
      </div>
    );
  }
);
