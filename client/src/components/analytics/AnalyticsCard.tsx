import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    direction: "up" | "down" | "neutral";
    label?: string;
  };
  className?: string;
}

export function AnalyticsCard({
  title,
  value,
  description,
  icon,
  trend,
  className = "",
}: AnalyticsCardProps) {
  return (
    <Card className={cn("shadow-md overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          {icon && <div className="text-primary">{icon}</div>}
        </div>
        {description && (
          <CardDescription className="text-xs">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-1">
          <div className="text-2xl font-bold">{value}</div>
          {trend && (
            <div className="flex items-center text-xs">
              {trend.direction === "up" ? (
                <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
              ) : trend.direction === "down" ? (
                <ArrowDown className="h-3 w-3 text-red-500 mr-1" />
              ) : (
                <Minus className="h-3 w-3 text-muted-foreground mr-1" />
              )}
              <span
                className={cn(
                  trend.direction === "up"
                    ? "text-green-500"
                    : trend.direction === "down"
                    ? "text-red-500"
                    : "text-muted-foreground"
                )}
              >
                {trend.value}% {trend.label || (trend.direction === "up" ? "increase" : trend.direction === "down" ? "decrease" : "change")}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}