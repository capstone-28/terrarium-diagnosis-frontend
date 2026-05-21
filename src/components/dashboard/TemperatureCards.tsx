import { ArrowDownRight, ArrowUpRight, Flame, Snowflake, Thermometer } from "lucide-react";
import { useSimulation } from "@/hooks/useSimulation";
import { useAnimalMode } from "@/hooks/useAnimalMode";

interface TempCardProps {
  Icon: React.ElementType;
  title: string;
  subtitle: string;
  value: number;
  statusLabel: string;
  statusClass: string;
  rangeValue: string;
  sparkData: number[];
  warnThreshold?: string;
  critThreshold?: string;
}

const TempCard = ({ Icon, title, subtitle, value, statusLabel, statusClass, rangeValue, sparkData, warnThreshold, critThreshold }: TempCardProps) => {
  const trendUp = sparkData.length >= 2 && sparkData[sparkData.length - 1] > sparkData[sparkData.length - 2];

  return (
    <div className="sensor-card min-w-0">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
            <Icon className="h-5 w-5 text-primary" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{title}</p>
            <p className="truncate text-[11px] text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        {trendUp ? <ArrowUpRight className="h-4 w-4 text-warning" /> : <ArrowDownRight className="h-4 w-4 text-success" />}
      </div>

      <div className="mb-4 flex items-end gap-1">
        <span className="font-mono text-4xl font-bold text-foreground">{value.toFixed(1)}</span>
        <span className="pb-1 text-sm text-muted-foreground">°C</span>
      </div>

      <div className="mb-3 flex items-center gap-2">
        <span className={`status-badge whitespace-nowrap ${statusClass}`}>{statusLabel}</span>
        <span className="min-w-0 truncate text-xs text-muted-foreground">권장 {rangeValue}</span>
      </div>

      <div className="flex h-8 items-end gap-1">
        {sparkData.map((point, index) => {
          const min = Math.min(...sparkData);
          const max = Math.max(...sparkData);
          const height = max === min ? 50 : 28 + ((point - min) / (max - min)) * 72;
          return <span key={index} className="flex-1 rounded-t bg-primary/50" style={{ height: `${height}%` }} />;
        })}
      </div>

      {(warnThreshold || critThreshold) && (
        <div className="mt-3 flex items-center gap-3 text-[10px]">
          {warnThreshold && <span className="text-warning">warn {warnThreshold}</span>}
          {critThreshold && <span className="text-danger">crit {critThreshold}</span>}
        </div>
      )}
    </div>
  );
};

export const TemperatureCards = () => {
  const { current, sparkSurface, sparkHotAir, sparkCoolAir } = useSimulation();
  const { profile } = useAnimalMode();

  const surfaceStatus =
    current.lSafety === 0
      ? { label: "정상 범위", className: "bg-success/15 text-success" }
      : current.lSafety === 1
        ? { label: "경고 범위", className: "bg-warning/15 text-warning" }
        : { label: "위험 범위", className: "bg-danger/15 text-danger" };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <TempCard
        Icon={Thermometer}
        title={profile.surfaceLabel}
        subtitle={profile.mode === "lizard" ? "열원 접촉 표면 온도" : "바닥 보온 온도"}
        value={current.hotSurface}
        statusLabel={surfaceStatus.label}
        statusClass={surfaceStatus.className}
        rangeValue={profile.surfaceRange}
        sparkData={sparkSurface}
        warnThreshold={`${profile.surfaceWarn}°C`}
        critThreshold={`${profile.surfaceCrit}°C`}
      />
      <TempCard
        Icon={Flame}
        title={profile.hotAirLabel}
        subtitle={profile.mode === "lizard" ? "온열 구역 대표 높이 공기" : "육추 구역 대표 높이 공기"}
        value={current.hotAir}
        statusLabel="권장 범위"
        statusClass="bg-warning/15 text-warning"
        rangeValue={profile.hotAirRange}
        sparkData={sparkHotAir}
      />
      <TempCard
        Icon={Snowflake}
        title={profile.coolAirLabel}
        subtitle={profile.mode === "lizard" ? "냉각 구역 대표 높이 공기" : "외곽 구역 대표 높이 공기"}
        value={current.coolAir}
        statusLabel="권장 범위"
        statusClass="bg-info/15 text-info"
        rangeValue={profile.coolAirRange}
        sparkData={sparkCoolAir}
      />
    </div>
  );
};
