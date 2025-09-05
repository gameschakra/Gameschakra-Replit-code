import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { GradientIcon } from "@/components/ui/gradient-icon";
import { LucideIcon, ArrowRight } from "lucide-react";

interface PanelProps {
  title: string;
  icon: LucideIcon;
  tone: "amber" | "cyan" | "violet" | "emerald" | "rose" | "sky" | string;
  children: ReactNode;
  viewAllHref?: string;
  onViewAll?: () => void;
  className?: string;
}

export default function Panel({
  title,
  icon,
  tone,
  children,
  viewAllHref,
  onViewAll,
  className
}: PanelProps) {
  
  const handleViewAll = (e: React.MouseEvent) => {
    if (onViewAll) {
      e.preventDefault();
      onViewAll();
    }
  };

  return (
    <section className={cn(
      "rounded-2xl border border-[var(--gc-border)] bg-[var(--gc-bg-2)]",
      "px-3 py-2.5 shadow-sm",
      className
    )}>
      {/* Header */}
      <header className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <GradientIcon 
            icon={icon} 
            tone={tone as any} 
            size="sm"
          />
          <h2 className="text-[15px] font-semibold text-[var(--gc-text-1)]">
            {title}
          </h2>
        </div>
        
        {(viewAllHref || onViewAll) && (
          <a
            href={viewAllHref}
            onClick={handleViewAll}
            className={cn(
              "flex items-center gap-1 text-[13px] font-medium transition-colors duration-200",
              "text-[var(--gc-accent)] hover:text-cyan-200",
              "focus-visible:ring-2 focus-visible:ring-[var(--gc-accent)]/50 focus-visible:outline-none focus-visible:rounded",
              "touch-manipulation active:scale-95"
            )}
          >
            View All
            <ArrowRight className="w-3 h-3" />
          </a>
        )}
      </header>
      
      {/* Content */}
      <div className="w-full">
        {children}
      </div>
    </section>
  );
}