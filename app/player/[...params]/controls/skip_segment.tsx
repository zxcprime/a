import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface Segment {
  start_sec: number;
  end_sec: number;
}

interface Props {
  currentTime: number;
  intro: Segment | null | undefined;
  outro: Segment | null | undefined;
  onSkip: (time: number) => void;
}

export function SkipSegment({ currentTime, intro, outro, onSkip }: Props) {
  const active =
    intro && currentTime >= intro.start_sec && currentTime < intro.end_sec
      ? { label: "Skip Intro", end: intro.end_sec }
      : outro && currentTime >= outro.start_sec && currentTime < outro.end_sec
        ? { label: "Skip Outro", end: outro.end_sec }
        : null;

  if (!active) return null;

  return (
    <Button
      variant="secondary"
      onClick={() => onSkip(active.end)}
      className="border-none  pointer-events-auto cursor-pointer"
      size="lg"
    >
      {active.label} <ArrowRight />
    </Button>
  );
}
