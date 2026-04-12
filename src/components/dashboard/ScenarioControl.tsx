import { Play, Flame, ThermometerSun, TrendingDown, Zap, Power, AlertOctagon } from "lucide-react";
import { useSimulation, ScenarioType } from "@/hooks/useSimulation";

const scenarios: { key: ScenarioType; label: string; desc: string; icon: React.ElementType; color: string }[] = [
  { key: "free", label: "자유 시뮬레이션", desc: "랜덤 워크 기반", icon: Play, color: "text-primary" },
  { key: "normal_heating", label: "정상 가열", desc: "안정적 온도구배 유지", icon: Flame, color: "text-success" },
  { key: "surface_delay", label: "표면 응답 지연", desc: "열원 ON, 표면 미상승", icon: Zap, color: "text-warning" },
  { key: "surface_overheat", label: "표면 과열", desc: "T_surface > 48°C", icon: ThermometerSun, color: "text-danger" },
  { key: "gradient_collapse", label: "온도구배 붕괴", desc: "G < 5°C 지속", icon: TrendingDown, color: "text-purple-400" },
];

const faultTypes = [
  { key: "none" as const, label: "정상" },
  { key: "no_response" as const, label: "무응답" },
  { key: "fixed_value" as const, label: "고정값 반복" },
  { key: "out_of_range" as const, label: "범위 이탈" },
];

export const ScenarioControl = () => {
  const { scenario, setScenario, current, toggleHeater, triggerDeviceFault, deviceFaultType } = useSimulation();

  return (
    <div className="sensor-card">
      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        🎮 시나리오 제어
      </h3>

      <div className="grid grid-cols-5 gap-1.5 mb-3">
        {scenarios.map((s) => (
          <button
            key={s.key}
            onClick={() => setScenario(s.key)}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg text-center transition-all ${
              scenario === s.key
                ? "bg-primary/15 border border-primary/30"
                : "bg-secondary/50 border border-transparent hover:bg-secondary"
            }`}
          >
            <s.icon className={`w-4 h-4 ${scenario === s.key ? s.color : "text-muted-foreground"}`} />
            <span className="text-[10px] font-medium text-foreground leading-tight">{s.label}</span>
            <span className="text-[8px] text-muted-foreground leading-tight">{s.desc}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Power className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">열원</span>
          <button
            onClick={toggleHeater}
            className={`px-2.5 py-1 rounded text-[10px] font-medium transition-all ${
              current.heaterOn
                ? "bg-success/20 text-success border border-success/30"
                : "bg-danger/20 text-danger border border-danger/30"
            }`}
          >
            {current.heaterOn ? "ON" : "OFF"}
          </button>
        </div>

        <div className="h-4 w-px bg-border" />

        <div className="flex items-center gap-2">
          <AlertOctagon className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">센서 장애</span>
          <div className="flex gap-1">
            {faultTypes.map((f) => (
              <button
                key={f.key}
                onClick={() => triggerDeviceFault(f.key)}
                className={`px-2 py-0.5 rounded text-[9px] font-medium transition-all ${
                  deviceFaultType === f.key
                    ? f.key === "none"
                      ? "bg-success/20 text-success border border-success/30"
                      : "bg-danger/20 text-danger border border-danger/30"
                    : "bg-secondary text-muted-foreground hover:bg-muted"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
