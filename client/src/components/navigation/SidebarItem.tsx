import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { ColorIcon } from "@/components/ui/ColorIcon";

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  count?: number;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

export function SidebarItem({
  icon,
  label,
  count,
  isActive = false,
  onClick,
  className,
  color = "amber",
}: SidebarItemProps & { color?: Parameters<typeof ColorIcon>[0]["gradient"] }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center w-full px-3 py-2.5 rounded-lg transition-all duration-200 group",
        "hover:bg-white/5 focus-visible:ring-2 ring-cyan-400/50 ring-offset-2 ring-offset-slate-900 outline-none",
        isActive ? "bg-white/6 text-white" : "text-slate-300",
        className
      )}
    >
      <ColorIcon icon={icon} gradient={color} active={isActive} className="mr-3" />
      <span className="flex-1 text-left font-medium">{label}</span>

      {count ? (
        <span className="ml-2 min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold bg-white/10 text-white/90">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </button>
  );
}