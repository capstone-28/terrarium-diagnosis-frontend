import { Droplets, Egg, LogOut, Shield, Sun, Thermometer, Wind } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useSimulation } from "@/hooks/useSimulation";
import { useAnimalMode } from "@/hooks/useAnimalMode";
import { useAuth } from "@/hooks/useAuth";

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
    <div className="flex items-center justify-between border-b border-border/50 py-1.5 last:border-0">
      <div className="flex min-w-0 items-center gap-2">
        <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <span className="truncate text-xs text-foreground">{label}</span>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="font-mono text-xs font-semibold text-foreground">
          {value}
          <span className="text-muted-foreground">{unit}</span>
        </span>
        <span className={`text-[10px] font-medium ${statusColor}`}>{statusLabel}</span>
      </div>
    </div>
  );
};

export const Sidebar = () => {
  const { current } = useSimulation();
  const { profile, openModal, animalMode } = useAnimalMode();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success("로그아웃되었습니다.");
    navigate("/", { replace: true });
  };

  const stateColor =
    current.state === "normal"
      ? "text-success"
      : current.state === "warning"
        ? "text-warning"
        : current.state === "device_fault"
          ? "text-purple"
          : "text-danger";
  const stateLabel =
    current.state === "normal"
      ? "Normal"
      : current.state === "warning"
        ? "Warning"
        : current.state === "device_fault"
          ? "Device Fault"
          : "Critical";
  const dotColor =
    current.state === "normal"
      ? "bg-success"
      : current.state === "warning"
        ? "bg-warning"
        : current.state === "device_fault"
          ? "bg-purple"
          : "bg-danger";

  const BrandIcon = animalMode === "lizard" ? Shield : Egg;
  const lastSeen = new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(current.timestamp);

  return (
    <aside className="flex min-h-screen w-60 flex-col gap-3 overflow-y-auto border-r border-sidebar-border bg-sidebar p-3">
      <button
        onClick={openModal}
        className="-m-1 flex items-center gap-2 rounded-md border-b border-border p-1 pb-3 text-left transition-colors hover:bg-secondary/50"
        title="모드 전환"
      >
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${animalMode === "lizard" ? "bg-primary/20" : "bg-amber-500/20"}`}>
          <BrandIcon className={`h-4 w-4 ${animalMode === "lizard" ? "text-primary" : "text-amber-500"}`} />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-bold text-foreground">{profile.name}</span>
          <span className="block truncate text-[9px] text-muted-foreground">{profile.subtitle}</span>
        </span>
      </button>

      <div className="sensor-card !p-3">
        <div className="mb-1 flex items-center justify-between">
          <span className="font-mono text-[10px] font-semibold text-foreground">ESP32-NODE-001</span>
          <span className="text-[10px] text-primary">연결됨</span>
        </div>
        <p className="text-[9px] text-muted-foreground">{profile.nodeLabel} · 가동 3일 14시간</p>
        <p className="text-[9px] text-muted-foreground">heartbeat: {lastSeen}</p>
      </div>

      <div className="sensor-card !p-3">
        <div className="mb-2 flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${dotColor} animate-pulse-glow`} />
          <span className={`text-sm font-bold ${stateColor}`}>{stateLabel}</span>
        </div>
        <div className="mb-2 flex justify-around text-center">
          <div>
            <span className="text-[9px] text-muted-foreground">L_match</span>
            <br />
            <span className={`font-mono text-xs font-semibold ${current.lMatch > 0 ? "text-warning" : "text-foreground"}`}>{current.lMatch}</span>
          </div>
          <div>
            <span className="text-[9px] text-muted-foreground">L_grad</span>
            <br />
            <span className={`font-mono text-xs font-semibold ${current.lGrad > 0 ? "text-warning" : "text-foreground"}`}>{current.lGrad}</span>
          </div>
          <div>
            <span className="text-[9px] text-muted-foreground">L_safety</span>
            <br />
            <span className={`font-mono text-xs font-semibold ${current.lSafety > 0 ? "text-danger" : "text-foreground"}`}>{current.lSafety}</span>
          </div>
        </div>
        <p className="text-[9px] text-muted-foreground">
          S_final = <span className={`font-mono font-semibold ${stateColor}`}>{current.sFinal}</span>
        </p>
      </div>

      <div>
        <p className="mb-1 text-[10px] text-muted-foreground">센서 상태 (4채널)</p>
        <SensorItem icon={Thermometer} label={profile.surfaceLabel} value={current.hotSurface.toFixed(1)} unit="°C" statusLevel={current.sensorHealth.surface !== "normal" ? 2 : current.lSafety} />
        <SensorItem icon={Wind} label={profile.hotAirLabel} value={current.hotAir.toFixed(1)} unit="°C" statusLevel={current.sensorHealth.hotAir !== "normal" ? 2 : 0} />
        <SensorItem icon={Droplets} label={profile.coolAirLabel} value={current.coolAir.toFixed(1)} unit="°C" statusLevel={current.sensorHealth.coolAir !== "normal" ? 2 : 0} />
        <SensorItem icon={Sun} label={profile.heaterLabel} value={current.heaterOn ? "ON" : "OFF"} unit="" statusLevel={current.sensorHealth.heater !== "normal" ? 2 : 0} />
      </div>

      <div className="sensor-card !p-3">
        <p className="mb-1.5 text-[10px] text-muted-foreground">진단 기준값</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[10px]">
          <span className="text-muted-foreground">표면 경고</span>
          <span className="text-right font-mono text-warning">{profile.surfaceWarn}°C</span>
          <span className="text-muted-foreground">표면 위험</span>
          <span className="text-right font-mono text-danger">{profile.surfaceCrit}°C</span>
          <span className="text-muted-foreground">G 경고</span>
          <span className="text-right font-mono text-warning">{profile.gradientWarn}°C</span>
          <span className="text-muted-foreground">G 위험</span>
          <span className="text-right font-mono text-danger">{profile.gradientCrit}°C</span>
          <span className="text-muted-foreground">전환 기준</span>
          <span className="text-right font-mono text-foreground">2회 연속</span>
          <span className="text-muted-foreground">복귀 기준</span>
          <span className="text-right font-mono text-foreground">3회 연속</span>
        </div>
      </div>

      <div className="mt-auto border-t border-border pt-3">
        {user && (
          <p className="mb-2 truncate text-[10px] text-muted-foreground" title={user.email ?? ""}>
            {user.email}
          </p>
        )}
        <button
          onClick={handleSignOut}
          className="flex w-full items-center justify-center gap-1.5 rounded-md py-2 text-[11px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <LogOut className="h-3.5 w-3.5" />
          로그아웃
        </button>
      </div>
    </aside>
  );
};
