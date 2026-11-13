import { TrendDownIcon, TrendUpIcon } from "@/components/icons";

export interface DashboardStat {
  label: string;
  value: string;
  delta?: string;
  up?: boolean;
  note?: string;
}

export function SummaryCards({ stats }: { stats: DashboardStat[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Trend = stat.up ? TrendUpIcon : TrendDownIcon;
        return (
          <article
            key={stat.label}
            className="rounded-sm border border-line bg-floral-700 px-5 py-4"
          >
            <p className="ap-eyebrow text-ash-300">{stat.label}</p>
            <p className="mt-2 font-display text-3xl">{stat.value}</p>
            <p className="mt-2 flex flex-wrap items-center gap-1.5 text-sm text-ash-200">
              {stat.delta ? (
                <>
                  <Trend
                    className={`h-4 w-4 ${stat.up ? "text-ash-300" : "text-powder-400"}`}
                  />
                  <span className="font-medium">{stat.delta}</span>
                </>
              ) : null}
              {stat.note ? <span className="hidden sm:inline">{stat.note}</span> : null}
            </p>
          </article>
        );
      })}
    </div>
  );
}
