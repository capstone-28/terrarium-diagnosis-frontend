import { ArrowUpRight, Minus } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { useSimulation } from "@/hooks/useSimulation";
import { useAnimalMode } from "@/hooks/useAnimalMode";

interface TempCardProps {
  icon: string;
  iconColor: string;
  title: string;
  subtitle: string;
  value: number;
  rangeLabel: string;
  rangeValue: string;
  rangeBg: string;
  rangeText: string;
  sparkColor: string;
  sparkData: number[];
  warnThreshold?: string;
  critThreshold?: string;
}

const TempCard = ({ icon, iconColor, title, subtitle, value, rangeLabel, rangeValue, rangeBg, rangeText, sparkColor, sparkData, warnThreshold, critThreshold }: TempCardProps) => {
  const trend = sparkData.length >= 2 && sparkData[sparkData.length - 1] > sparkData[sparkData.length - 2] ? "up" : "flat";
  const chartData = sparkData.map((v) => ({ v }));

  return (
    <div className="sensor-card flex-1 relative overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`text-lg ${iconColor}`}>{icon}</span>
          <div>
            <p className="text-sm font-semibold text-foreground">{title}</p>
            <p className="text-[10px] text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        {trend === "up" ? (
          <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
        ) : (
          <Minus className="w-4 h-4 text-muted-foreground" />
        )}
      </div>
      <div className="mb-3">
        <span className="text-4xl font-mono font-bold text-foreground">{value.toFixed(1)}</span>
        <span className="text-lg text-muted-foreground ml-0.5">°C</span>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <span className={`status-badge ${rangeBg} ${rangeText}`}>{rangeLabel}</span>
        <span className="text-xs text-muted-foreground">기준 {rangeValue}</span>
      </div>
      {(warnThreshold || critThreshold) && (
        <div className="flex items-center gap-3 mb-2 text-[10px]">
          {warnThreshold && <span className="text-warning">⚠ warn: {warnThreshold}</span>}
          {critThreshold && <span className="text-danger">✕ crit: {critThreshold}</span>}
        </div>
      )}
      <div className="h-12">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={sparkColor} stopOpacity={0.3} />
                <stop offset="100%" stopColor={sparkColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="v" stroke={sparkColor} strokeWidth={2} fill={`url(#grad-${title})`} dot={false} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[10px] text-muted-foreground mt-1">실시간 추이</p>
    </div>
  );
};

export const TemperatureCards = () => {
  const { current, sparkSurface, sparkHotAir, sparkCoolAir } = useSimulation();
  const { profile } = useAnimalMode();

  const surfaceStatus = current.lSafety === 0 ? { label: "정상 범위", bg: "bg-success/15", text: "text-success" } :
                        current.lSafety === 1 ? { label: "경고 범위", bg: "bg-warning/15", text: "text-warning" } :
                        { label: "위험 범위", bg: "bg-danger/15", text: "text-danger" };

  return (
    <div className="grid grid-cols-3 gap-4">
      <TempCard
        icon={profile.mode === "lizard" ? "🔥" : "🐥"}
        iconColor={profile.mode === "lizard" ? "text-orange" : "text-amber-500"}
        title={profile.surfaceLabel}
        subtitle={profile.mode === "lizard" ? "열원 접촉 표면 온도" : "바닥 보온 온도"}
        value={current.hotSurface}
        rangeLabel={surfaceStatus.label}
        rangeValue={profile.surfaceRange}
        rangeBg={surfaceStatus.bg}
        rangeText={surfaceStatus.text}
        sparkColor="#2dd4a0"
        sparkData={sparkSurface}
        warnThreshold={`${profile.surfaceWarn}°C`}
        critThreshold={`${profile.surfaceCrit}°C`}
      />
      <TempCard
        icon="🌡"
        iconColor="text-warning"
        title={profile.hotAirLabel}
        subtitle={profile.mode === "lizard" ? "온열 구역 대표 높이 공기" : "육추 구역 대표 높이 공기"}
        value={current.hotAir}
        rangeLabel="정상 범위"
        rangeValue={profile.hotAirRange}
        rangeBg="bg-warning/15"
        rangeText="text-warning"
        sparkColor="#f59e0b"
        sparkData={sparkHotAir}
      />
      <TempCard
        icon="❄"
        iconColor="text-cyan"
        title={profile.coolAirLabel}
        subtitle={profile.mode === "lizard" ? "냉각 구역 대표 높이 공기" : "외곽 구역 대표 높이 공기"}
        value={current.coolAir}
        rangeLabel="정상 범위"
        rangeValue={profile.coolAirRange}
        rangeBg="bg-success/15"
        rangeText="text-success"
        sparkColor="#22d3ee"
        sparkData={sparkCoolAir}
      />
    </div>
  );
};