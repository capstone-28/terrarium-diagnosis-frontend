import { useNavigate } from "react-router-dom";
import { Shield, Egg, ArrowRight, Thermometer, Activity, Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAnimalMode, AnimalMode, profiles } from "@/hooks/useAnimalMode";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

const modeCards = [
  {
    mode: "lizard" as AnimalMode,
    Icon: Shield,
    iconBg: "bg-primary/15",
    iconColor: "text-primary",
    accent: "border-primary/30 hover:border-primary/60",
    description: "건조형 도마뱀(비어디드래곤 등) 사육장의 열환경 불일치를 실시간으로 진단합니다.",
    highlights: [
      "온열 구역 표면 과열 감지",
      "온도구배 G값 실시간 모니터링",
      "L_match / L_grad / L_safety 통합 지표",
    ],
  },
  {
    mode: "chick" as AnimalMode,
    Icon: Egg,
    iconBg: "bg-amber-500/15",
    iconColor: "text-amber-500",
    accent: "border-amber-500/30 hover:border-amber-500/60",
    description: "병아리 육추장(브루더)의 적정 온도 유지와 과열/저온 위험을 실시간으로 감지합니다.",
    highlights: [
      "주령별 적정 바닥 온도 관리",
      "보온 램프 가동 상태 추적",
      "과열·저온 이중 안전 진단",
    ],
  },
];

const Landing = () => {
  const navigate = useNavigate();
  const { setAnimalMode } = useAnimalMode();
  const { user, loading } = useAuth();

  // 이미 로그인한 사용자는 바로 대시보드로
  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, loading, navigate]);

  const handleSelect = (mode: AnimalMode) => {
    setAnimalMode(mode);
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Thermometer className="w-4 h-4 text-primary" />
            </div>
            <span className="font-bold text-foreground">ThermoGuard</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
            로그인
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-xs text-muted-foreground mb-6">
          <Activity className="w-3 h-3 text-primary" />
          IoT 기반 열환경 진단 시스템
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 leading-tight">
          사육장의 열환경을<br />
          <span className="text-primary">실시간으로 진단</span>합니다
        </h1>
        <p className="text-base text-muted-foreground max-w-xl mx-auto mb-8">
          관리할 사육 대상을 선택하고, 맞춤형 온도 모니터링 대시보드를 시작하세요.
        </p>

        <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground mb-12">
          <span className="inline-flex items-center gap-1"><Check className="w-3 h-3 text-success" /> ESP32 노드 연동</span>
          <span className="inline-flex items-center gap-1"><Check className="w-3 h-3 text-success" /> MQTT 적응형 전송</span>
          <span className="inline-flex items-center gap-1"><Check className="w-3 h-3 text-success" /> 이상 감지 알림</span>
        </div>
      </section>

      {/* Mode selection */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-foreground mb-2">관리할 사육장을 선택하세요</h2>
          <p className="text-sm text-muted-foreground">선택한 모드에 맞춰 임계값과 진단 기준이 자동 설정됩니다</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {modeCards.map((card) => {
            const profile = profiles[card.mode];
            return (
              <button
                key={card.mode}
                onClick={() => handleSelect(card.mode)}
                className={`group text-left p-6 rounded-2xl border-2 bg-card transition-all duration-200 ${card.accent} hover:shadow-lg hover:-translate-y-0.5`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                    <card.Icon className={`w-6 h-6 ${card.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-1.5">
                      {profile.icon} {profile.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">{profile.subtitle}</p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {card.description}
                </p>

                <ul className="space-y-1.5 mb-5">
                  {card.highlights.map((h, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Check className={`w-3.5 h-3.5 shrink-0 ${card.iconColor}`} />
                      {h}
                    </li>
                  ))}
                </ul>

                <div className="flex items-center justify-between pt-4 border-t border-border/60">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground">
                    <Thermometer className="w-3 h-3" />
                    표면 {profile.surfaceWarn}~{profile.surfaceCrit}°C
                  </span>
                  <span className={`inline-flex items-center gap-1 text-xs font-medium ${card.iconColor} group-hover:gap-2 transition-all`}>
                    선택하기
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-2 mt-8 text-xs text-muted-foreground">
          <Bell className="w-3.5 h-3.5" />
          이미 계정이 있으신가요?{" "}
          <button onClick={() => navigate("/auth")} className="text-primary hover:underline font-medium">
            로그인하기
          </button>
        </div>
      </section>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © 2026 ThermoGuard · IoT 기반 사육장 열환경 진단 시스템
      </footer>
    </div>
  );
};

export default Landing;
