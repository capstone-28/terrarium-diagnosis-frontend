import { Shield, Thermometer, Wind, Droplets, Sun } from "lucide-react";
import { useSimulation } from "@/hooks/useSimulation";

const SensorItem = ({
  icon: Icon,
  label,
  value,
  unit,
  statusLevel,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  unit: string;
  statusLevel: number;
}) => {
  const statusColor = statusLevel === 0 ? "text-success" : statusLevel === 1 ? "text-warning" : "text-danger";
  const statusLabel = statusLevel === 0 ? "정상" : statusLevel === 1 ? "경고" : "위험";
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
      <div className="flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-xs text-foreground">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono font-semibold text-foreground">{value}<span className="text-muted-foreground">{unit}</span></span>
        <span className={`text-[10px] font-medium ${statusColor}`}>●{statusLabel}</span>
      </div>
    </div>
  );
};

export const Sidebar = () => {
  const { current } = useSimulation();

  const stateColor = current.state === "normal" ? "text-success" : current.state === "warning" ? "text-warning" : current.state === "device_fault" ? "text-purple-400" : "text-danger";
  const stateLabel = current.state === "normal" ? "Normal (정상)" : current.state === "warning" ? "Warning (경고)" : current.state === "device_fault" ? "Device Fault (장치이상)" : "Critical (위험)";
  const dotColor = current.state === "normal" ? "bg-success" : current.state === "warning" ? "bg-warning" : current.state === "device_fault" ? "bg-purple-400" : "bg-danger";

  return (
    <aside className="w-60 min-h-screen bg-sidebar border-r border-sidebar-border flex flex-col p-3 gap-3 overflow-y-auto">
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
          <Shield className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-foreground">LizardGuard</h1>
          <p className="text-[9px] text-muted-foreground">열환경 불일치 조기 진단 시스템</p>
        </div>
      </div>

      <div className="sensor-card !p-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-mono font-semibold text-foreground">ESP32-NODE-001</span>
          <span className="text-[10px] text-primary">● 연결됨</span>
        </div>
        <p className="text-[9px] text-muted-foreground">비어디드래곤 사육장 #1 · 가동 3일 14시간</p>
        <p className="text-[9px] text-muted-foreground">heartbeat: {current.timestamp.getHours() >= 12 ? "오후" : "오전"} {current.timestamp.getHours().toString().padStart(2,"0")}:{current.timestamp.getMinutes().toString().padStart(2,"0")}:{current.timestamp.getSeconds().toString().padStart(2,"0")}</p>
      </div>

      <div className="sensor-card !p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className={`w-2 h-2 rounded-full ${dotColor} animate-pulse-glow`} />
          <span className={`text-sm font-bold ${stateColor}`}>{stateLabel}</span>
        </div>
        <div className="flex justify-around text-center mb-2">
          <div><span className="text-[9px] text-muted-foreground">L_match</span><br/><span className={`text-xs font-mono font-semibold ${current.lMatch > 0 ? "text-warning" : "text-foreground"}`}>{current.lMatch}</span></div>
          <div><span className="text-[9px] text-muted-foreground">L_grad</span><br/><span className={`text-xs font-mono font-semibold ${current.lGrad > 0 ? "text-warning" : "text-foreground"}`}>{current.lGrad}</span></div>
          <div><span className="text-[9px] text-muted-foreground">L_safety</span><br/><span className={`text-xs font-mono font-semibold ${current.lSafety > 0 ? "text-danger" : "text-foreground"}`}>{current.lSafety}</span></div>
        </div>
        <p className="text-[9px] text-muted-foreground">S_final = max(L_match, L_grad, L_safety) = <span className={`font-mono font-semibold ${stateColor}`}>{current.sFinal}</span></p>
      </div>

      <div>
        <p className="text-[10px] text-muted-foreground mb-1">센서 상태 (4채널)</p>
        <SensorItem icon={Thermometer} label="표면 온도" value={current.hotSurface.toFixed(1)} unit="°C" statusLevel={current.sensorHealth.surface !== "normal" ? 2 : current.lSafety} />
        <SensorItem icon={Wind} label="온열 공기" value={current.hotAir.toFixed(1)} unit="°C" statusLevel={current.sensorHealth.hotAir !== "normal" ? 2 : 0} />
        <SensorItem icon={Droplets} label="냉각 공기" value={current.coolAir.toFixed(1)} unit="°C" statusLevel={current.sensorHealth.coolAir !== "normal" ? 2 : 0} />
        <SensorItem icon={Sun} label="열원 (조도)" value={current.heaterOn ? "ON" : "OFF"} unit="" statusLevel={current.sensorHealth.heater !== "normal" ? 2 : 0} />
      </div>

      <div className="sensor-card !p-3">
        <p className="text-[10px] text-muted-foreground mb-1.5">진단 기준값</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[10px]">
          <span className="text-muted-foreground">T_surface_warn</span>
          <span className="font-mono text-warning text-right">43°C</span>
          <span className="text-muted-foreground">T_surface_crit</span>
          <span className="font-mono text-danger text-right">48°C</span>
          <span className="text-muted-foreground">G_warn</span>
          <span className="font-mono text-warning text-right">8°C</span>
          <span className="text-muted-foreground">G_crit</span>
          <span className="font-mono text-danger text-right">5°C</span>
          <span className="text-muted-foreground">전이 기준</span>
          <span className="font-mono text-foreground text-right">2회 연속</span>
          <span className="text-muted-foreground">복귀 기준</span>
          <span className="font-mono text-foreground text-right">3회 연속</span>
        </div>
      </div>
    </aside>
  );
};
