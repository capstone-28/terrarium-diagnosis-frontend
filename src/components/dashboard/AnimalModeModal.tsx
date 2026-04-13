import { X, Shield, Egg, Check, Thermometer, Info } from "lucide-react";
import { useAnimalMode, AnimalMode, profiles } from "@/hooks/useAnimalMode";

const modeCards: { mode: AnimalMode; Icon: React.ElementType; iconBg: string; iconColor: string; description: string; tempRange: string; features: string[] }[] = [
  {
    mode: "lizard",
    Icon: Shield,
    iconBg: "bg-primary/20",
    iconColor: "text-primary",
    description: "건조형 도마뱀(비어디드래곤 등) 사육장의 열환경을 진단합니다. 온열/냉각 구역 온도구배 및 표면 과열 여부를 실시간 모니터링합니다.",
    tempRange: `표면 ${profiles.lizard.surfaceWarn}~${profiles.lizard.surfaceCrit}°C / 공기 ${profiles.lizard.coolAirRange}`,
    features: ["온열 구역 표면 온도 모니터링", "온도구배 G값 진단", "표면 과열 안전 임계 감지", "L_match / L_grad / L_safety 지표"],
  },
  {
    mode: "chick",
    Icon: Egg,
    iconBg: "bg-amber-500/20",
    iconColor: "text-amber-500",
    description: "병아리 사육장(브루더)의 열환경을 진단합니다. 주령별 적정 온도 유지 및 과열/저온 위험을 실시간 감지합니다.",
    tempRange: `브루더 ${profiles.chick.surfaceWarn - 3}~${profiles.chick.surfaceWarn}°C / 공기 ${profiles.chick.hotAirRange}`,
    features: ["브루더 표면 온도 모니터링", "사육 공간 공기 온도 진단", "주령별 적정 온도 임계값 적용", "과열/저온 이중 안전 감지"],
  },
];

export const AnimalModeModal = () => {
  const { animalMode, setAnimalMode, isModalOpen, closeModal } = useAnimalMode();

  if (!isModalOpen) return null;

  const handleSelect = (mode: AnimalMode) => {
    setAnimalMode(mode);
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-[720px] max-w-[90vw] p-8 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-secondary transition-colors"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        <h2 className="text-xl font-bold text-foreground mb-1">사육장 모드 선택</h2>
        <p className="text-sm text-muted-foreground mb-6">모니터링할 사육장 종류를 선택하세요</p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {modeCards.map((card) => {
            const isActive = animalMode === card.mode;
            const profile = profiles[card.mode];
            return (
              <button
                key={card.mode}
                onClick={() => handleSelect(card.mode)}
                className={`relative text-left p-5 rounded-xl border-2 transition-all duration-200 ${
                  isActive
                    ? "border-primary/50 bg-primary/5"
                    : "border-border/50 bg-secondary/30 hover:border-muted-foreground/30 hover:bg-secondary/50"
                }`}
              >
                {isActive && (
                  <span className="absolute top-4 right-4 flex items-center gap-1.5 text-[11px] font-medium text-primary bg-primary/15 px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    현재 모드
                  </span>
                )}

                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                    <card.Icon className={`w-5 h-5 ${card.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">{profile.name}</h3>
                    <p className="text-[11px] text-muted-foreground">{profile.subtitle}</p>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed mb-4">{card.description}</p>

                <div className="inline-flex items-center gap-1.5 bg-success/10 text-success text-[11px] font-mono font-medium px-3 py-1.5 rounded-lg mb-4">
                  <Thermometer className="w-3 h-3" />
                  {card.tempRange}
                </div>

                <ul className="space-y-1.5">
                  {card.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
          <Info className="w-3.5 h-3.5" />
          모드 전환 시 임계값, 센서 레이블, 진단 기준이 해당 사육장에 맞게 자동 변경됩니다
        </div>
      </div>
    </div>
  );
};