import React, { useState } from "react";
import { format, startOfDay, endOfDay, subDays } from "date-fns";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { DayPicker, DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import "react-day-picker/dist/style.css";

interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  className?: string;
  placeholder?: string;
}

export function DateRangePicker({
  value,
  onChange,
  className,
  placeholder = "Pick a date range"
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const presetRanges = [
    {
      label: "Last 7 days",
      range: {
        from: startOfDay(subDays(new Date(), 6)),
        to: endOfDay(new Date())
      }
    },
    {
      label: "Last 30 days", 
      range: {
        from: startOfDay(subDays(new Date(), 29)),
        to: endOfDay(new Date())
      }
    },
    {
      label: "Last 90 days",
      range: {
        from: startOfDay(subDays(new Date(), 89)), 
        to: endOfDay(new Date())
      }
    }
  ];

  const formatRange = (range?: DateRange): string => {
    if (!range?.from) return placeholder;
    if (!range.to) return format(range.from, "MMM d, yyyy");
    return `${format(range.from, "MMM d")} - ${format(range.to, "MMM d, yyyy")}`;
  };

  return (
    <div className={className}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[240px] justify-start text-left font-normal",
              !value?.from && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatRange(value)}
            <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex">
            {/* Preset ranges sidebar */}
            <div className="flex flex-col gap-1 p-3 border-r">
              <div className="text-sm font-medium mb-2">Quick ranges</div>
              {presetRanges.map((preset, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className="justify-start text-sm"
                  onClick={() => {
                    onChange?.(preset.range);
                    setIsOpen(false);
                  }}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            
            {/* Calendar */}
            <div className="p-3">
              <DayPicker
                mode="range"
                selected={value}
                onSelect={onChange}
                numberOfMonths={2}
                disabled={{ after: new Date() }}
                className="rdp-custom"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}