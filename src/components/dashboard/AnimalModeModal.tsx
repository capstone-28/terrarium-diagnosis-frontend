import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Egg, Info, Shield, Thermometer } from "lucide-react";
import { useAnimalMode, AnimalMode, profiles } from "@/hooks/useAnimalMode";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
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
    keywords: ["lizard", "도마뱀", "파충류", "비어디드 드래곤", "reptile", "lizardguard"],
    description: "파충류 사육장 열환경 진단",
  },
  {
    mode: "chick",
    Icon: Egg,
    iconColor: "text-amber-500",
    iconBg: "bg-amber-500/20",
    keywords: ["chick", "병아리", "육추", "brooder", "chickguard"],
    description: "병아리 육추함 보온 환경 진단",
  },
];

const exampleChips = ["병아리", "도마뱀", "육추", "lizard"];

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
          <DialogTitle>사육 환경 모드 선택</DialogTitle>
          <DialogDescription>관리 대상에 맞춰 센서 라벨, 임계값, 진단 기준을 변경합니다.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" aria-expanded={open} className="h-auto w-full justify-between py-2.5">
                <span className="flex min-w-0 items-center gap-2.5">
                  <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-md", selectedMeta.iconBg)}>
                    <selectedMeta.Icon className={cn("h-4 w-4", selectedMeta.iconColor)} />
                  </span>
                  <span className="flex min-w-0 flex-col items-start">
                    <span className="truncate text-sm font-semibold">{selectedProfile.name}</span>
                    <span className="truncate text-[11px] text-muted-foreground">{selectedMeta.description}</span>
                  </span>
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
              <Command
                filter={(value, searchValue) => {
                  if (!searchValue) return 1;
                  return value.toLowerCase().includes(searchValue.toLowerCase()) ? 1 : 0;
                }}
              >
                <div className="flex flex-wrap gap-1.5 px-2 pt-2">
                  {exampleChips.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setSearch(chip)}
                      className={cn(
                        "rounded-full border px-2 py-0.5 text-[11px] transition-colors",
                        search === chip ? "border-primary/40 bg-primary/15 text-primary" : "border-border bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground",
                      )}
                    >
                      {chip}
                    </button>
                  ))}
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="rounded-full border border-dashed border-border px-2 py-0.5 text-[11px] text-muted-foreground hover:text-foreground"
                    >
                      초기화
                    </button>
                  )}
                </div>
                <CommandInput placeholder="모드 검색" value={search} onValueChange={setSearch} />
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
                          <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-md", m.iconBg)}>
                            <m.Icon className={cn("h-4 w-4", m.iconColor)} />
                          </span>
                          <span className="flex min-w-0 flex-1 flex-col">
                            <span className="truncate text-sm font-medium">{profile.name}</span>
                            <span className="truncate text-[11px] text-muted-foreground">{m.description}</span>
                          </span>
                          <Check className={cn("ml-auto h-4 w-4 shrink-0", pending === m.mode ? "text-primary opacity-100" : "opacity-0")} />
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <div className="space-y-2 rounded-lg border border-border bg-secondary/30 p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <Thermometer className="h-3.5 w-3.5 text-primary" />
              임계값 미리보기
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
              <span className="text-muted-foreground">표면 경고/위험</span>
              <span className="text-right font-mono text-foreground">
                {selectedProfile.surfaceWarn}°C / {selectedProfile.surfaceCrit}°C
              </span>
              <span className="text-muted-foreground">{selectedProfile.hotAirLabel} 범위</span>
              <span className="text-right font-mono text-foreground">{selectedProfile.hotAirRange}</span>
              <span className="text-muted-foreground">{selectedProfile.coolAirLabel} 범위</span>
              <span className="text-right font-mono text-foreground">{selectedProfile.coolAirRange}</span>
            </div>
          </div>

          <div className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>모드 적용 후 관제 화면의 라벨과 진단 기준이 대상 동물에 맞게 바뀝니다.</span>
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
