import { useEffect, useRef } from "react";
import { AlertTriangle, ShieldAlert, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useSimulation, DiagnosticState } from "@/hooks/useSimulation";

const labels: Record<DiagnosticState, string> = {
  normal: "정상",
  warning: "경고",
  critical: "위험",
  device_fault: "장치 이상",
};

export const AlertNotification = () => {
  const { current } = useSimulation();
  const prevState = useRef<DiagnosticState>(current.state);

  useEffect(() => {
    if (current.state === prevState.current) return;

    const from = prevState.current;
    const to = current.state;
    prevState.current = to;

    if (to === "warning" || to === "critical" || to === "device_fault") {
      try {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = to === "warning" ? 660 : 880;
        gain.gain.value = to === "warning" ? 0.2 : 0.3;
        osc.start();
        gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
        gain.gain.setValueAtTime(0, ctx.currentTime + 0.25);
        osc.stop(ctx.currentTime + 0.35);
      } catch {
        // Browser audio permissions can block notification sounds.
      }
    }

    const description = `surface ${current.hotSurface.toFixed(1)}°C | G ${current.gradient.toFixed(1)}°C | S_final ${current.sFinal}`;

    if (to === "critical" || to === "device_fault") {
      toast.error(`위험 상태 전환: ${labels[from]} -> ${labels[to]}`, {
        description,
        duration: 8000,
        icon: <ShieldAlert className="h-5 w-5 text-destructive" />,
      });
    } else if (to === "warning") {
      toast.warning(`경고 상태 전환: ${labels[from]} -> ${labels[to]}`, {
        description,
        duration: 5000,
        icon: <AlertTriangle className="h-5 w-5" />,
      });
    } else if (to === "normal" && (from === "warning" || from === "critical")) {
      toast.success(`정상 복귀: ${labels[from]} -> 정상`, {
        description: "시스템이 정상 상태로 복귀했습니다.",
        duration: 4000,
        icon: <ShieldCheck className="h-5 w-5" />,
      });
    }
  }, [current.state, current.hotSurface, current.gradient, current.sFinal]);

  return null;
};
