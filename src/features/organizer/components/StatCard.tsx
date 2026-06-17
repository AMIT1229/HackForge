import type { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/States';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  trend?: number;
  loading?: boolean;
}

export function StatCard({ label, value, icon, trend, loading }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-muted">{label}</p>
          {loading ? (
            <Skeleton className="mt-1 h-8 w-16" />
          ) : (
            <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
          )}
          {trend !== undefined && !loading && (
            <p
              className={cn(
                'mt-1 flex items-center gap-1 text-xs font-medium',
                trend >= 0 ? 'text-success' : 'text-danger',
              )}
            >
              {trend >= 0 ? (
                <TrendingUp className="h-3.5 w-3.5" aria-hidden />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" aria-hidden />
              )}
              {Math.abs(trend)}% vs last hour
            </p>
          )}
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-subtle text-brand">
          {icon}
        </span>
      </CardContent>
    </Card>
  );
}
