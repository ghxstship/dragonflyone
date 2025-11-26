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
        <div className="p-4 border-2 border-t-0 border-black">
          <h3 className="font-heading text-[1.5rem] uppercase tracking-wider mb-2">{title}</h3>
          {metadata && (
            <p className="font-code text-[0.75rem] uppercase tracking-widest text-grey-600 mb-3">
              {metadata}
            </p>
          )}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 border border-black font-code text-[0.6875rem] uppercase tracking-widest"
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
          className={clsx("block border-2 border-black group hover:shadow-hard-lg transition-all", className)}
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
          "border-2 border-black group",
          onClick && "cursor-pointer hover:shadow-hard-lg transition-all",
          className
        )}
        {...props}
      >
        {Content}
      </div>
    );
  }
);
