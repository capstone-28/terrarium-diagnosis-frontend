import { useState } from "react";
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useSimulation } from "@/hooks/useSimulation";
import { useAnimalMode } from "@/hooks/useAnimalMode";

export const TemperatureChart = () => {
  const { history } = useSimulation();
  const { profile } = useAnimalMode();
  const [active, setActive] = useState<Record<string, boolean>>({
    surface: true,
    hotAir: true,
    coolAir: true,
    gradient: true,
  });

  const legends = [
    { key: "surface", label: profile.surfaceLabel, color: "#2dd4bf" },
    { key: "hotAir", label: profile.hotAirLabel, color: "#f59e0b" },
    { key: "coolAir", label: profile.coolAirLabel, color: "#60a5fa" },
    { key: "gradient", label: "온도구배 G", color: "#a78bfa" },
  ];

  const toggle = (key: string) => setActive((p) => ({ ...p, [key]: !p[key] }));

  return (
    <div className="sensor-card">
      <div className="mb-4 flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
        <div>
          <h3 className="text-sm font-semibold text-foreground">실시간 온도 추이</h3>
          <p className="mt-1 text-[11px] text-muted-foreground">
            최근 60개 샘플 기준. G = {profile.hotAirLabel} - {profile.coolAirLabel}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          {legends.map((l) => (
            <button
              key={l.key}
              onClick={() => toggle(l.key)}
              className={`flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium transition-all ${
                active[l.key] ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: l.color }} />
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history} margin={{ top: 8, right: 16, left: -12, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} domain={[0, 55]} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
                color: "hsl(var(--foreground))",
              }}
              formatter={(value, name) => [`${Number(value).toFixed(1)}°C`, name]}
            />
            <ReferenceLine y={profile.surfaceWarn} stroke="#f59e0b" strokeDasharray="6 3" strokeOpacity={0.55} label={{ value: `T_warn ${profile.surfaceWarn}°C`, position: "right", fontSize: 10, fill: "#f59e0b" }} />
            <ReferenceLine y={profile.surfaceCrit} stroke="#ef4444" strokeDasharray="6 3" strokeOpacity={0.55} label={{ value: `T_crit ${profile.surfaceCrit}°C`, position: "right", fontSize: 10, fill: "#ef4444" }} />
            <ReferenceLine y={profile.gradientWarn} stroke="#a78bfa" strokeDasharray="6 3" strokeOpacity={0.45} label={{ value: `G_warn ${profile.gradientWarn}°C`, position: "right", fontSize: 10, fill: "#a78bfa" }} />
            <ReferenceLine y={profile.gradientCrit} stroke="#ef4444" strokeDasharray="4 2" strokeOpacity={0.35} label={{ value: `G_crit ${profile.gradientCrit}°C`, position: "right", fontSize: 10, fill: "#ef4444" }} />
            {active.surface && <Line name={profile.surfaceLabel} type="monotone" dataKey="surface" stroke="#2dd4bf" strokeWidth={2} dot={false} isAnimationActive={false} />}
            {active.hotAir && <Line name={profile.hotAirLabel} type="monotone" dataKey="hotAir" stroke="#f59e0b" strokeWidth={2} dot={false} isAnimationActive={false} />}
            {active.coolAir && <Line name={profile.coolAirLabel} type="monotone" dataKey="coolAir" stroke="#60a5fa" strokeWidth={2} dot={false} isAnimationActive={false} />}
            {active.gradient && <Line name="온도구배 G" type="monotone" dataKey="gradient" stroke="#a78bfa" strokeWidth={2} dot={false} isAnimationActive={false} />}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-4 border-t border-border pt-3 text-[11px] text-muted-foreground">
        <span>표면 경고/위험: {profile.surfaceWarn}°C / {profile.surfaceCrit}°C</span>
        <span>구배 경고/위험: {profile.gradientWarn}°C / {profile.gradientCrit}°C</span>
      </div>
    </div>
  );
};
