import React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface MapFrameProps {
  title?: string;
  subtitle?: string;
  headerControls?: React.ReactNode;
  children: React.ReactNode;
  legend?: React.ReactNode;
  drawer?: React.ReactNode;
  className?: string;
  height?: string;
}

export function MapFrame({
  title,
  subtitle,
  headerControls,
  children,
  legend,
  drawer,
  className,
  height = "h-[480px]",
}: MapFrameProps) {
  return (
    <Card
      className={cn(
        "relative rounded-xl border border-border bg-surface dark:bg-surface overflow-hidden shadow-sm flex flex-col",
        className
      )}
    >
      {/* Optional Map Title Bar */}
      {(title || headerControls) && (
        <div className="p-3 sm:p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 z-10 bg-surface dark:bg-surface">
          <div>
            {title && (
              <h3 className="text-sm sm:text-base font-bold text-foreground tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {headerControls && (
            <div className="flex items-center gap-2">{headerControls}</div>
          )}
        </div>
      )}

      {/* Main Map Canvas Area */}
      <div className={cn("relative w-full z-0", height)}>
        {children}

        {/* Floating Map Legend (Bottom Left) */}
        {legend && (
          <div className="absolute bottom-3 left-3 z-[400] p-2.5 rounded-lg border border-border bg-surface/90 dark:bg-surface/90 backdrop-blur-md shadow-md text-xs">
            {legend}
          </div>
        )}

        {/* Slide-over Drawer Slot */}
        {drawer && (
          <div className="absolute inset-y-0 right-0 z-[500] max-w-full sm:max-w-md w-full shadow-2xl transition-transform">
            {drawer}
          </div>
        )}
      </div>
    </Card>
  );
}

