import { useState, useMemo } from "react";
import { Shield, Egg, Check, ChevronsUpDown, Thermometer, Info } from "lucide-react";
import { useAnimalMode, AnimalMode, profiles } from "@/hooks/useAnimalMode";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ModeMeta {
  mode: AnimalMode;
  Icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  keywords: string[];
  description: string;
}

const modeMeta: ModeMeta[] = [
  {
    mode: "lizard",
    Icon: Shield,
    iconColor: "text-primary",
    iconBg: "bg-primary/20",
    keywords: ["lizard", "도마뱀", "비어디드래곤", "파충류", "reptile", "lizardguard"],
    description: "건조형 도마뱀 사육장 열환경 진단",
  },
  {
    mode: "chick",
    Icon: Egg,
    iconColor: "text-amber-500",
    iconBg: "bg-amber-500/20",
    keywords: ["chick", "병아리", "육추", "브루더", "brooder", "닭", "chickguard"],
    description: "병아리 육추장 열환경 진단",
  },
];

const exampleChips = ["병아리", "도마뱀", "파충류", "브루더", "lizard"];

export const AnimalModeModal = () => {
  const { animalMode, setAnimalMode, isModalOpen, closeModal } = useAnimalMode();
  const [pending, setPending] = useState<AnimalMode>(animalMode);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedMeta = useMemo(() => modeMeta.find((m) => m.mode === pending)!, [pending]);
  const selectedProfile = profiles[pending];

  const handleConfirm = () => {
    setAnimalMode(pending);
    closeModal();
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setPending(animalMode);
      closeModal();
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>사육장 모드 선택</DialogTitle>
          <DialogDescription>검색하거나 목록에서 모니터링할 모드를 선택하세요</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between h-auto py-2.5"
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <span className={cn("w-7 h-7 rounded-md flex items-center justify-center shrink-0", selectedMeta.iconBg)}>
                    <selectedMeta.Icon className={cn("w-4 h-4", selectedMeta.iconColor)} />
                  </span>
                  <span className="flex flex-col items-start min-w-0">
                    <span className="text-sm font-semibold truncate">
                      {selectedProfile.icon} {selectedProfile.name}
                    </span>
                    <span className="text-[11px] text-muted-foreground truncate">
                      {selectedMeta.description}
                    </span>
                  </span>
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
              <Command
                filter={(value, search) => {
                  if (!search) return 1;
                  return value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0;
                }}
              >
                <div className="flex flex-wrap gap-1.5 px-2 pt-2">
                  {exampleChips.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setSearch(chip)}
                      className={cn(
                        "text-[11px] px-2 py-0.5 rounded-full border transition-colors",
                        search === chip
                          ? "bg-primary/15 border-primary/40 text-primary"
                          : "bg-secondary/60 border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
                      )}
                    >
                      {chip}
                    </button>
                  ))}
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="text-[11px] px-2 py-0.5 rounded-full border border-dashed border-border text-muted-foreground hover:text-foreground"
                    >
                      초기화
                    </button>
                  )}
                </div>
                <CommandInput
                  placeholder="모드 검색 (예: 병아리, lizard)"
                  value={search}
                  onValueChange={setSearch}
                />
                <CommandList>
                  <CommandEmpty>일치하는 모드가 없습니다.</CommandEmpty>
                  <CommandGroup>
                    {modeMeta.map((m) => {
                      const profile = profiles[m.mode];
                      const value = [m.mode, profile.name, profile.subtitle, ...m.keywords].join(" ");
                      return (
                        <CommandItem
                          key={m.mode}
                          value={value}
                          onSelect={() => {
                            setPending(m.mode);
                            setOpen(false);
                          }}
                          className="flex items-center gap-2.5 py-2"
                        >
                          <span className={cn("w-7 h-7 rounded-md flex items-center justify-center shrink-0", m.iconBg)}>
                            <m.Icon className={cn("w-4 h-4", m.iconColor)} />
                          </span>
                          <span className="flex flex-col flex-1 min-w-0">
                            <span className="text-sm font-medium truncate">
                              {profile.icon} {profile.name}
                            </span>
                            <span className="text-[11px] text-muted-foreground truncate">
                              {m.description}
                            </span>
                          </span>
                          <Check
                            className={cn(
                              "ml-auto h-4 w-4 shrink-0",
                              pending === m.mode ? "opacity-100 text-primary" : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <div className="rounded-lg border border-border bg-secondary/30 p-3 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <Thermometer className="w-3.5 h-3.5 text-primary" />
              임계값 미리보기
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
              <span className="text-muted-foreground">표면 경고/위험</span>
              <span className="font-mono text-right text-foreground">
                {selectedProfile.surfaceWarn}°C / {selectedProfile.surfaceCrit}°C
              </span>
              <span className="text-muted-foreground">온열 공기 범위</span>
              <span className="font-mono text-right text-foreground">{selectedProfile.hotAirRange}</span>
              <span className="text-muted-foreground">냉각 공기 범위</span>
              <span className="font-mono text-right text-foreground">{selectedProfile.coolAirRange}</span>
            </div>
          </div>

          <div className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
            <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>모드 적용 시 임계값, 센서 레이블, 진단 기준이 자동으로 변경됩니다.</span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            취소
          </Button>
          <Button onClick={handleConfirm} disabled={pending === animalMode}>
            {pending === animalMode ? "현재 모드" : "적용"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
