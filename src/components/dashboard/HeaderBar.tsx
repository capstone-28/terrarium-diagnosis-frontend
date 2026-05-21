import { Maximize2, Power, Radio, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSimulation } from "@/hooks/useSimulation";
import { useAnimalMode } from "@/hooks/useAnimalMode";

const stateMeta = {
  normal: { label: "정상 운영", className: "bg-success/15 text-success", dot: "bg-success" },
  warning: { label: "주의 필요", className: "bg-warning/15 text-warning", dot: "bg-warning" },
  critical: { label: "즉시 조치", className: "bg-danger/15 text-danger", dot: "bg-danger" },
  device_fault: { label: "장치 이상", className: "bg-purple/15 text-purple", dot: "bg-purple" },
};

export const HeaderBar = () => {
  const [now, setNow] = useState(new Date());
  const navigate = useNavigate();
  const { current, toggleHeater } = useSimulation();
  const { profile } = useAnimalMode();

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const meta = stateMeta[current.state];
  const date = new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).format(now);
  const time = new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(now);

  return (
    <header className="flex min-h-16 items-center justify-between gap-4 border-b border-border bg-card px-5">
      <div className="flex min-w-0 flex-wrap items-center gap-x-5 gap-y-2">
        <div>
          <p className="text-[11px] text-muted-foreground">{date}</p>
          <p className="font-mono text-xl font-bold text-foreground">{time}</p>
        </div>

        <div className={`status-badge ${meta.className}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${meta.dot} animate-pulse-glow`} />
          {meta.label}
        </div>

        <div className="status-badge bg-primary/15 text-primary">
          <Radio className="h-3.5 w-3.5" />
          {current.mode} 모드
          <span className="text-[10px] text-muted-foreground">수집 {current.samplingPeriod}s</span>
        </div>

        <div className="hidden items-center gap-3 text-xs text-muted-foreground md:flex">
          <span>
            온도 구배{" "}
            <span className="font-mono font-semibold text-foreground">{current.gradient.toFixed(1)}°C</span>
          </span>
          <span
            className={
              current.gradient >= profile.gradientWarn
                ? "text-success"
                : current.gradient >= profile.gradientCrit
                  ? "text-warning"
                  : "text-danger"
            }
          >
            {current.gradient >= profile.gradientWarn ? "안정" : current.gradient >= profile.gradientCrit ? "관찰" : "위험"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Power className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{profile.heaterLabel}</span>
          <button
            onClick={toggleHeater}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
              current.heaterOn ? "bg-success" : "bg-muted"
            }`}
            aria-label="히터 전원 전환"
          >
            <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${current.heaterOn ? "translate-x-4" : "translate-x-0.5"}`} />
          </button>
          <span className={`font-mono text-xs font-semibold ${current.heaterOn ? "text-success" : "text-danger"}`}>
            {current.heaterOn ? "ON" : "OFF"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            if (document.fullscreenElement) document.exitFullscreen();
            else document.documentElement.requestFullscreen();
          }}
          className="rounded-md p-2 transition-colors hover:bg-secondary"
          title="전체 화면"
        >
          <Maximize2 className="h-4 w-4 text-muted-foreground" />
        </button>
        <button onClick={() => navigate("/settings")} className="rounded-md p-2 transition-colors hover:bg-secondary" title="설정">
          <Settings className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    </header>
  );
};
