import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, Tooltip } from "recharts";
import { useSimulation } from "@/hooks/useSimulation";

const legends = [
  { key: "surface", label: "온열 구역 표면", color: "#2dd4a0" },
  { key: "hotAir", label: "온열 구역 공기", color: "#f59e0b" },
  { key: "coolAir", label: "냉각 구역 공기", color: "#f472b6" },
  { key: "gradient", label: "온도구배 G", color: "#a78bfa" },
];

export const TemperatureChart = () => {
  const { history } = useSimulation();
  const [active, setActive] = useState<Record<string, boolean>>({
    surface: true,
    hotAir: true,
    coolAir: true,
    gradient: true,
  });

  const toggle = (key: string) => setActive((p) => ({ ...p, [key]: !p[key] }));

  return (
    <div className="sensor-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">온도 추이 & 온도구배</h3>
          <p className="text-[10px] text-muted-foreground">구역별 실시간 온도 변화 및 G = T_hot_air − T_cool_air</p>
        </div>
        <div className="flex items-center gap-1">
          {legends.map((l) => (
            <button
              key={l.key}
              onClick={() => toggle(l.key)}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-all ${
                active[l.key] ? "bg-secondary text-foreground" : "text-muted-foreground"
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }} />
              {l.label}
            </button>
          ))}
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 18%)" />
            <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(215, 15%, 55%)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(215, 15%, 55%)" }} axisLine={false} tickLine={false} domain={[0, 50]} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(220, 25%, 13%)",
                border: "1px solid hsl(220, 20%, 20%)",
                borderRadius: "8px",
                fontSize: "11px",
                color: "hsl(210, 20%, 90%)",
              }}
            />
            <ReferenceLine y={43} stroke="#f59e0b" strokeDasharray="6 3" strokeOpacity={0.5} label={{ value: "T_warn 43°C", position: "right", fontSize: 9, fill: "#f59e0b" }} />
            <ReferenceLine y={48} stroke="#ef4444" strokeDasharray="6 3" strokeOpacity={0.5} label={{ value: "T_crit 48°C", position: "right", fontSize: 9, fill: "#ef4444" }} />
            <ReferenceLine y={8} stroke="#a78bfa" strokeDasharray="6 3" strokeOpacity={0.5} label={{ value: "G_warn 8°C", position: "right", fontSize: 9, fill: "#a78bfa" }} />
            <ReferenceLine y={5} stroke="#ef4444" strokeDasharray="4 2" strokeOpacity={0.4} label={{ value: "G_crit 5°C", position: "right", fontSize: 9, fill: "#ef4444" }} />
            {active.surface && <Line type="monotone" dataKey="surface" stroke="#2dd4a0" strokeWidth={2} dot={false} isAnimationActive={false} />}
            {active.hotAir && <Line type="monotone" dataKey="hotAir" stroke="#f59e0b" strokeWidth={2} dot={false} isAnimationActive={false} />}
            {active.coolAir && <Line type="monotone" dataKey="coolAir" stroke="#f472b6" strokeWidth={2} dot={false} isAnimationActive={false} />}
            {active.gradient && <Line type="monotone" dataKey="gradient" stroke="#a78bfa" strokeWidth={2} dot={false} isAnimationActive={false} />}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center gap-6 mt-2 justify-center text-[10px] text-muted-foreground">
        <span>── T_surface_warn (43°C) / T_surface_crit (48°C)</span>
        <span>── G_warn (8°C) / G_crit (5°C)</span>
      </div>
    </div>
  );
};
