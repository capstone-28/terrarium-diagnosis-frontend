import { Activity, TrendingUp, ShieldAlert, ArrowRight, Cpu } from "lucide-react";
import { useSimulation, DiagnosticState } from "@/hooks/useSimulation";

const GradientBar = () => {
  const { current } = useSimulation();
  const pct = Math.min(100, Math.max(0, (current.gradient / 15) * 100));

  return (
    <div className="sensor-card">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">온도구배 G</h3>
          <p className="text-[10px] text-muted-foreground">G = T_hot_air − T_cool_air</p>
        </div>
        <span className={`text-2xl font-mono font-bold ${current.gradient >= 8 ? "text-primary" : current.gradient >= 5 ? "text-warning" : "text-danger"}`}>
          {current.gradient.toFixed(1)}°C
        </span>
      </div>
      <div className="relative h-3 rounded-full overflow-hidden bg-secondary">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg, hsl(var(--danger)), hsl(var(--warning)), hsl(var(--success)), hsl(var(--primary)))",
          }}
        />
        <div className="absolute top-0 bottom-0 w-0.5 bg-danger" style={{ left: "33%" }} />
        <div className="absolute top-0 bottom-0 w-0.5 bg-warning" style={{ left: "53%" }} />
      </div>
      <div className="flex justify-between mt-1.5 text-[10px] text-muted-foreground">
        <span>0°C (구배 붕괴)</span>
        <span className="text-danger">G_crit 5°C</span>
        <span className="text-warning">G_warn 8°C</span>
        <span>15°C+</span>
      </div>
    </div>
  );
};

const stateLabels: Record<string, string> = {
  normal: "정상",
  warning: "경고",
  critical: "위험",
  device_fault: "장치이상",
};

const stateColors: Record<string, string> = {
  normal: "bg-success",
  warning: "bg-warning",
  critical: "bg-danger",
  device_fault: "bg-purple",
};

export const RightPanel = () => {
  const { current, transitions } = useSimulation();

  const diagnostics = [
    {
      icon: Activity,
      label: "L_match — 열원·표면 반응 불일치",
      desc: `열원 ON 후 ΔT_surface 상승 지연 여부`,
      detail: current.lMatch === 0 ? "정상" : current.lMatch === 1 ? "초기 반응 지연" : "장시간 미도달",
      value: current.lMatch,
      color: "text-cyan",
      bg: "bg-cyan/10",
    },
    {
      icon: TrendingUp,
      label: "L_grad — 온도구배 붕괴",
      desc: `G=${current.gradient.toFixed(1)}°C (warn: 8°C)`,
      detail: current.lGrad === 0 ? "정상 범위" : current.lGrad === 1 ? "경고 범위" : "위험 범위",
      value: current.lGrad,
      color: "text-purple",
      bg: "bg-purple/10",
    },
    {
      icon: ShieldAlert,
      label: "L_safety — 표면 과열 임계",
      desc: `T_surface=${current.hotSurface.toFixed(1)}°C (warn: 43°C)`,
      detail: current.lSafety === 0 ? "정상" : current.lSafety === 1 ? "경고 범위" : "위험!",
      value: current.lSafety,
      color: "text-orange",
      bg: "bg-orange/10",
    },
    {
      icon: Cpu,
      label: "L_device — 장치 이상",
      desc: "센서 응답 상태 · 고정값 반복 · 비정상 범위",
      detail: current.lDevice > 0
        ? `이상 감지: ${current.sensorHealth.surface}`
        : "전 채널 응답 정상",
      value: current.lDevice,
      color: "text-info",
      bg: "bg-info/10",
    },
  ];

  return (
    <div className="w-80 flex flex-col gap-4 overflow-y-auto">
      <GradientBar />

      <div className="sensor-card">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          🔬 독립 진단 지표 (4종)
        </h3>
        <div className="space-y-2.5">
          {diagnostics.map((d, i) => {
            const statusColor = d.value === 0 ? "text-success" : d.value === 1 ? "text-warning" : "text-danger";
            const statusLabel = d.value === 0 ? "정상" : d.value === 1 ? "경고" : "위험";
            return (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/50">
                <div className={`w-8 h-8 rounded-lg ${d.bg} flex items-center justify-center shrink-0`}>
                  <d.icon className={`w-4 h-4 ${d.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{d.label}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{d.desc}</p>
                  <p className="text-[9px] text-muted-foreground/70 truncate">{d.detail}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className={`w-2 h-2 rounded-full ${d.value === 0 ? "bg-success" : d.value === 1 ? "bg-warning" : "bg-danger"}`} />
                  <span className={`text-[10px] font-medium ${statusColor}`}>{statusLabel}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="sensor-card">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          ⏱ 상태 전이 이력
        </h3>
        <p className="text-[10px] text-muted-foreground mb-2">
          전이: 2회 연속 | 복귀: 3회 연속 정상
        </p>
        {transitions.length === 0 && (
          <p className="text-xs text-muted-foreground py-2 text-center">아직 상태 전이 없음</p>
        )}
        <div className="space-y-2">
          {transitions.map((t, i) => (
            <div key={i} className="flex items-center gap-2 text-[10px]">
              <span className="font-mono text-muted-foreground w-10 shrink-0">{t.time}</span>
              <span className={`${stateColors[t.from]} text-foreground px-1.5 py-0.5 rounded text-[10px]`}>
                {stateLabels[t.from]}
              </span>
              <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />
              <span className={`${stateColors[t.to]} text-foreground px-1.5 py-0.5 rounded text-[10px]`}>
                {stateLabels[t.to]}
              </span>
              <span className="text-muted-foreground truncate">{t.reason}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
