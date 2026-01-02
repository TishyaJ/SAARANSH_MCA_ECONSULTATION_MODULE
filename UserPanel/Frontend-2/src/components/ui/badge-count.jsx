import { cn } from "@/lib/utils";

export const BadgeCount = ({ count, className }) => {
  return (
    <span className={cn(
      "inline-flex items-center justify-center w-6 h-6 text-xs font-medium text-white bg-blue-500 rounded-full",
      className
    )}>
      {count}
    </span>
  );
};