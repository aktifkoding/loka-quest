import { cn } from "@/lib/utils";

/**
 * Loading placeholder that mirrors the geometry of the content it replaces.
 * Always size and shape skeletons to match the final layout — never
 * arbitrary gray boxes.
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-shimmer rounded-md", className)}
      {...props}
    />
  );
}

export { Skeleton };
