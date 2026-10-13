import React from 'react';
import { ActivityContextData } from '@/services/healthService';
import { Footprints, BedDouble, Dumbbell, UserCheck, Flame, HelpCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ActivityBadgeProps {
  data?: ActivityContextData | null;
  compact?: boolean;
}

const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  Resting: <UserCheck className="w-3.5 h-3.5 text-blue-500" />,
  Walking: <Footprints className="w-3.5 h-3.5 text-emerald-500" />,
  Running: <Flame className="w-3.5 h-3.5 text-amber-500" />,
  Sleeping: <BedDouble className="w-3.5 h-3.5 text-indigo-500" />,
  Exercise: <Dumbbell className="w-3.5 h-3.5 text-purple-500" />
};

export const ActivityBadge: React.FC<ActivityBadgeProps> = ({
  data,
  compact = false
}) => {
  if (!data || !data.activity || data.activity === 'Unavailable' || data.activity.includes('unavailable')) {
    return (
      <div className="flex items-center gap-1.5 text-muted-foreground text-xs p-1.5 rounded border border-border/40 bg-muted/20">
        <HelpCircle className="w-3.5 h-3.5 opacity-60" />
        <span className="italic">Activity detection unavailable</span>
      </div>
    );
  }

  const icon = ACTIVITY_ICONS[data.activity] || <Footprints className="w-3.5 h-3.5 text-primary" />;
  const confidence = data.confidence != null ? `${data.confidence}%` : null;

  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-xs font-semibold">{data.activity}</span>
        {confidence && (
          <span className="text-[10px] text-muted-foreground">({confidence})</span>
        )}
      </div>
    );
  }

  return (
    <div className="p-3 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
          Activity Context Engine (Stage 5)
        </span>
        <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary">
          {data.source || 'MPU6050 / IMU'}
        </Badge>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-muted/60">
            {icon}
          </div>
          <div>
            <div className="text-sm font-bold">{data.activity}</div>
            <div className="text-[11px] text-muted-foreground">
              {data.activity === 'Running' || data.activity === 'Exercise'
                ? 'High cardiac exertion contextualized'
                : data.activity === 'Resting' || data.activity === 'Sleeping'
                ? 'Basal cardiac state monitoring'
                : 'Active ambulatory state'}
            </div>
          </div>
        </div>
        {confidence && (
          <div className="text-right">
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{confidence}</div>
            <div className="text-[10px] text-muted-foreground">Confidence</div>
          </div>
        )}
      </div>
    </div>
  );
};
