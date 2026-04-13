import { createContext, useContext, useState, ReactNode } from "react";

export type AnimalMode = "lizard" | "chick";

export interface AnimalProfile {
  mode: AnimalMode;
  name: string;
  subtitle: string;
  icon: string;
  nodeLabel: string;
  enclosureLabel: string;
  surfaceLabel: string;
  hotAirLabel: string;
  coolAirLabel: string;
  heaterLabel: string;
  surfaceWarn: number;
  surfaceCrit: number;
  gradientWarn: number;
  gradientCrit: number;
  hotAirRange: string;
  coolAirRange: string;
  surfaceRange: string;
}

export const profiles: Record<AnimalMode, AnimalProfile> = {
  lizard: {
    mode: "lizard",
    name: "LizardGuard",
    subtitle: "열환경 불일치 조기 진단 시스템",
    icon: "🦎",
    nodeLabel: "비어디드래곤 사육장 #1",
    enclosureLabel: "사육장",
    surfaceLabel: "온열 구역 표면",
    hotAirLabel: "온열 구역 공기",
    coolAirLabel: "냉각 구역 공기",
    heaterLabel: "열원 (조도)",
    surfaceWarn: 43,
    surfaceCrit: 48,
    gradientWarn: 8,
    gradientCrit: 5,
    hotAirRange: "35°C / 40°C",
    coolAirRange: "24°C / 32°C",
    surfaceRange: "T_surface_warn 43°C",
  },
  chick: {
    mode: "chick",
    name: "ChickGuard",
    subtitle: "병아리 육추 열환경 관리 시스템",
    icon: "🐣",
    nodeLabel: "병아리 육추장 #1",
    enclosureLabel: "육추장",
    surfaceLabel: "바닥 온도",
    hotAirLabel: "육추 구역 공기",
    coolAirLabel: "외곽 구역 공기",
    heaterLabel: "보온 램프",
    surfaceWarn: 38,
    surfaceCrit: 42,
    gradientWarn: 5,
    gradientCrit: 3,
    hotAirRange: "33°C / 37°C",
    coolAirRange: "24°C / 30°C",
    surfaceRange: "T_floor_warn 38°C",
  },
};

interface AnimalModeContextType {
  animalMode: AnimalMode;
  profile: AnimalProfile;
  setAnimalMode: (mode: AnimalMode) => void;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const AnimalModeContext = createContext<AnimalModeContextType | null>(null);

export const AnimalModeProvider = ({ children }: { children: ReactNode }) => {
  const [animalMode, setAnimalMode] = useState<AnimalMode>("lizard");
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <AnimalModeContext.Provider value={{
      animalMode,
      profile: profiles[animalMode],
      setAnimalMode,
      isModalOpen,
      openModal: () => setIsModalOpen(true),
      closeModal: () => setIsModalOpen(false),
    }}>
      {children}
    </AnimalModeContext.Provider>
  );
};

export const useAnimalMode = () => {
  const ctx = useContext(AnimalModeContext);
  if (!ctx) throw new Error("useAnimalMode must be used within AnimalModeProvider");
  return ctx;
};
