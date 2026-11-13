import { Card, CardHeader } from "@/components/ui/Card";
import { formatINR } from "@/lib/format";

export interface SalesSeriesPoint {
  label: string;
  value: number;
}

export interface CategoryShare {
  label: string;
  share: number;
}

export function SalesOverview({
  series,
  categories,
}: {
  series: SalesSeriesPoint[];
  categories: CategoryShare[];
}) {
  const max = series.length > 0 ? Math.max(...series.map((d) => d.value)) : 0;

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <Card className="xl:col-span-2">
        <CardHeader
          title="Sales Overview"
          subtitle="Revenue the last 7 days, in ₹"
        />
        <div className="px-5 pb-6 pt-4">
          <div
            className="flex h-44 items-end gap-3 sm:gap-5"
            role="img"
            aria-label="Bar chart of daily revenue for the last seven days"
          >
            {series.map((day) => (
              <div
                key={day.label}
                className="group flex h-full flex-1 flex-col items-center justify-end gap-2"
              >
                <span className="hidden text-xs text-ash-200 transition-opacity opacity-0 group-hover:opacity-100">
                  {formatINR(day.value)}
                </span>
                <div
                  className="w-full rounded-t-sm bg-ash-500 transition-colors group-hover:bg-burnt-500"
                  style={{
                    height: `${max > 0 ? Math.round((day.value / max) * 100) : 0}%`,
                  }}
                  title={`${day.label}: ${formatINR(day.value)}`}
                />
                <span className="ap-eyebrow text-ash-300">{day.label}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
      <Card>
        <CardHeader title="Top Categories" subtitle="Share of revenue" />
        {categories.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-5 pb-12 pt-12 text-center">
            <p className="font-display text-xl">No sales yet</p>
            <p className="text-sm text-ash-200">
              Revenue by category will appear here once orders come in.
            </p>
          </div>
        ) : (
          <div className="flex h-full flex-col justify-center gap-6 px-5 pb-8 pt-6">
            {categories.map((cat) => (
              <div key={cat.label}>
                <div className="flex items-baseline justify-between text-sm">
                  <span className="font-medium">{cat.label}</span>
                  <span className="text-ash-200">{cat.share}%</span>
                </div>
                <div
                  className="h-2 w-full rounded-sm bg-line"
                  role="meter"
                  aria-valuenow={cat.share}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${cat.label}: ${cat.share}%`}
                >
                  <div
                    className="h-full rounded-sm bg-burnt-600"
                    style={{ width: `${cat.share}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
