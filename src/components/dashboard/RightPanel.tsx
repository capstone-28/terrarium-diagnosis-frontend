import { useState } from "react";
import { Activity, ArrowRight, Cpu, Power, ShieldAlert, TrendingUp } from "lucide-react";
import { useSimulation } from "@/hooks/useSimulation";
import { useAnimalMode } from "@/hooks/useAnimalMode";

const stateLabels: Record<string, string> = {
  normal: "정상",
  warning: "경고",
  critical: "위험",
  device_fault: "장치 이상",
};

const stateColors: Record<string, string> = {
  normal: "bg-success text-primary-foreground",
  warning: "bg-warning text-primary-foreground",
  critical: "bg-danger text-primary-foreground",
  device_fault: "bg-purple text-primary-foreground",
};

const GradientBar = () => {
  const { current } = useSimulation();
  const { profile } = useAnimalMode();
  const pct = Math.min(100, Math.max(0, (current.gradient / 15) * 100));

  return (
    <div className="sensor-card">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">온도 구배</h3>
          <p className="text-[11px] text-muted-foreground">G = {profile.hotAirLabel} - {profile.coolAirLabel}</p>
        </div>
        <span
          className={`font-mono text-2xl font-bold ${
            current.gradient >= profile.gradientWarn ? "text-success" : current.gradient >= profile.gradientCrit ? "text-warning" : "text-danger"
          }`}
        >
          {current.gradient.toFixed(1)}°C
        </span>
      </div>

      <div className="relative h-3 overflow-hidden rounded-full bg-secondary">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg, hsl(var(--danger)), hsl(var(--warning)), hsl(var(--success)), hsl(var(--primary)))",
          }}
        />
        <div className="absolute bottom-0 top-0 w-0.5 bg-danger" style={{ left: `${(profile.gradientCrit / 15) * 100}%` }} />
        <div className="absolute bottom-0 top-0 w-0.5 bg-warning" style={{ left: `${(profile.gradientWarn / 15) * 100}%` }} />
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
        <span>0°C</span>
        <span className="text-danger">crit {profile.gradientCrit}°C</span>
        <span className="text-warning">warn {profile.gradientWarn}°C</span>
        <span>15°C+</span>
      </div>
    </div>
  );
};

const HeaterControl = () => {
  const { current, toggleHeater } = useSimulation();
  const { profile } = useAnimalMode();

  return (
    <div className={`sensor-card border transition-colors ${current.heaterOn ? "border-success/40" : "border-border"}`}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${current.heaterOn ? "bg-success/15" : "bg-secondary"}`}>
            <Power className={`h-5 w-5 ${current.heaterOn ? "text-success" : "text-muted-foreground"}`} />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">{profile.heaterLabel}</p>
            <p className="text-[11px] text-muted-foreground">원격 제어 채널</p>
          </div>
        </div>
        <span className={`rounded-md px-2.5 py-1 font-mono text-sm font-bold ${current.heaterOn ? "bg-success/15 text-success" : "bg-danger/15 text-danger"}`}>
          {current.heaterOn ? "ON" : "OFF"}
        </span>
      </div>

      <button
        onClick={toggleHeater}
        className={`w-full rounded-lg border py-3 text-sm font-semibold transition-all active:scale-95 ${
          current.heaterOn
            ? "border-danger/30 bg-danger/15 text-danger hover:bg-danger/25"
            : "border-success/30 bg-success/15 text-success hover:bg-success/25"
        }`}
      >
        {current.heaterOn ? "전원 끄기" : "전원 켜기"}
      </button>
    </div>
  );
};

const DiagnosticsPanel = () => {
  const { current } = useSimulation();
  const { profile } = useAnimalMode();

  const diagnostics = [
    {
      icon: Activity,
      label: "L_match",
      desc: "열원 상태와 표면 온도 반응 일치 여부",
      detail: current.lMatch === 0 ? "열원 응답 정상" : current.lMatch === 1 ? "초기 반응 지연" : "반응 미달",
      value: current.lMatch,
      color: "text-cyan",
      bg: "bg-cyan/10",
    },
    {
      icon: TrendingUp,
      label: "L_grad",
      desc: `온도 구배 G=${current.gradient.toFixed(1)}°C`,
      detail: current.lGrad === 0 ? "권장 구배 확보" : current.lGrad === 1 ? "구배 저하 관찰" : "구배 부족 위험",
      value: current.lGrad,
      color: "text-purple",
      bg: "bg-purple/10",
    },
    {
      icon: ShieldAlert,
      label: "L_safety",
      desc: `${profile.surfaceLabel} ${current.hotSurface.toFixed(1)}°C`,
      detail: current.lSafety === 0 ? "표면 온도 정상" : current.lSafety === 1 ? "경고 기준 접근" : "위험 기준 초과",
      value: current.lSafety,
      color: "text-orange",
      bg: "bg-orange/10",
    },
    {
      icon: Cpu,
      label: "L_device",
      desc: "센서 응답, 고정값, 비정상 범위 점검",
      detail: current.lDevice > 0 ? `센서 이상: ${current.sensorHealth.surface}` : "전체 채널 정상 수신",
      value: current.lDevice,
      color: "text-info",
      bg: "bg-info/10",
    },
  ];

  return (
    <div className="sensor-card">
      <div className="space-y-2.5">
        {diagnostics.map((d) => {
          const statusColor = d.value === 0 ? "text-success" : d.value === 1 ? "text-warning" : "text-danger";
          const statusLabel = d.value === 0 ? "정상" : d.value === 1 ? "경고" : "위험";
          return (
            <div key={d.label} className="flex items-center gap-3 rounded-lg bg-secondary/50 p-2.5">
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${d.bg}`}>
                <d.icon className={`h-4 w-4 ${d.color}`} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-foreground">{d.label}</p>
                <p className="truncate text-[10px] text-muted-foreground">{d.desc}</p>
                <p className="truncate text-[9px] text-muted-foreground/70">{d.detail}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <span className={`h-2 w-2 rounded-full ${d.value === 0 ? "bg-success" : d.value === 1 ? "bg-warning" : "bg-danger"}`} />
                <span className={`text-[10px] font-medium ${statusColor}`}>{statusLabel}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const TransitionsPanel = () => {
  const { transitions } = useSimulation();

  return (
    <div className="sensor-card">
      <p className="mb-2 text-[11px] text-muted-foreground">경고 전환: 2회 연속 | 정상 복귀: 3회 연속</p>
      {transitions.length === 0 && <p className="py-4 text-center text-xs text-muted-foreground">아직 상태 전환이 없습니다.</p>}
      <div className="space-y-2">
        {transitions.map((t, i) => (
          <div key={i} className="flex items-center gap-2 text-[10px]">
            <span className="w-10 shrink-0 font-mono text-muted-foreground">{t.time}</span>
            <span className={`${stateColors[t.from]} rounded px-1.5 py-0.5 text-[10px]`}>{stateLabels[t.from]}</span>
            <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground" />
            <span className={`${stateColors[t.to]} rounded px-1.5 py-0.5 text-[10px]`}>{stateLabels[t.to]}</span>
            <span className="truncate text-muted-foreground">{t.reason}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

type RightTab = "diagnostics" | "history";

export const RightPanel = () => {
  const [activeTab, setActiveTab] = useState<RightTab>("diagnostics");

  return (
    <div className="flex w-80 flex-col gap-4 overflow-y-auto">
      <GradientBar />
      <HeaterControl />

      <div className="flex items-center gap-1 border-b border-border">
        {[
          { key: "diagnostics" as RightTab, label: "진단 지표" },
          { key: "history" as RightTab, label: "전환 이력" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-t px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === tab.key ? "border border-b-0 border-border bg-card text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "diagnostics" && <DiagnosticsPanel />}
      {activeTab === "history" && <TransitionsPanel />}
    </div>
  );
};
