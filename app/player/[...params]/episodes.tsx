import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Keyboard, Mousewheel } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import { useTvSeason } from "@/hooks/get-seasons";
import Link from "next/link";
import { EpisodesIcon } from "@/components/icons/episodes";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, VideoOff, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSearchParams } from "next/navigation";
import { SeasonsType } from "@/hooks/tmdb-types";

export default function Episodes({
  tmdbId,
  season,
  episode,
  lockTimer,
  resetTimer,
  seasons,
}: {
  tmdbId: string;
  season: number;
  episode: number;
  lockTimer: () => void;
  resetTimer: () => void;
  seasons: SeasonsType[];
}) {
  const [open, setOpen] = useState(false);
  const [activateSpoiler, setActivateSpoiler] = useState(true);
  const [selectSeason, setSeasonSelect] = useState(season);
  const searchParams = useSearchParams();
  const { data, isLoading } = useTvSeason({
    tmdbId,
    season_number: selectSeason,
    media_type: "tv",
  });

  const closeDrawer = () => {
    setOpen(false);
    resetTimer();
  };

  return (
    <div>
      <button
        onClick={() => {
          setOpen(true);
          lockTimer();
        }}
        onPointerMove={lockTimer}
        className="lg:translate-y-0.5 translate-y-1 text-white/80 hover:text-white cursor-pointer"
      >
        <EpisodesIcon className="lg:size-9.5 md:size-7 size-7.5 landscape:size-6" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40 "
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={closeDrawer}
            />

            {/* Right Panel */}
            <motion.div
              className={cn(
                "fixed top-0 bottom-0 right-0 z-50",
                "lg:px-4 px-2 py-4",
                "space-y-3",
                "flex flex-col justify-center bg-background lg:max-w-sm md:max-w-xs max-w-3xs",
              )}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 45, stiffness: 420 }}
            >
              <div className="flex justify-between items-center gap-1.5">
                <Select
                  value={String(selectSeason)}
                  onValueChange={(val) => setSeasonSelect(Number(val))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select season" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {seasons.map((s) => (
                        <SelectItem
                          key={s.season_number}
                          value={String(s.season_number)}
                        >
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <Button
                  onClick={closeDrawer}
                  variant="destructive"
                  className="cursor-pointer"
                >
                  <X />
                </Button>
              </div>
              <Swiper
                modules={[Mousewheel, Keyboard]}
                mousewheel={{
                  sensitivity: 1,
                  thresholdDelta: 10,
                  forceToAxis: true,
                  releaseOnEdges: true,
                }}
                keyboard={{ enabled: true, onlyInViewport: true }}
                slidesPerView="auto"
                spaceBetween={8}
                direction="vertical"
                className="h-full w-full pointer-events-auto"
                style={
                  {
                    "--swiper-wrapper-transition-timing-function":
                      "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                  } as React.CSSProperties
                }
              >
                {data?.episodes.length === 0 ? (
                  <NoEpisodesFound />
                ) : isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <SwiperSlide key={i} className="h-auto!">
                      <EpisodeSkeletonCard />
                    </SwiperSlide>
                  ))
                ) : (
                  data?.episodes.map((e) => {
                    const isActive =
                      episode === e.episode_number && season === selectSeason;

                    return (
                      <SwiperSlide key={e.id} className="h-auto!">
                        <Link
                          href={`/player/tv/${tmdbId}/${selectSeason}/${e.episode_number}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`}
                          onClick={closeDrawer}
                          className="group"
                        >
                          <div
                            className={cn(
                              "p-1 backdrop-blur-md",
                              "",
                              isActive ? "from-red-900" : "from-card",
                            )}
                          >
                            <div className="relative flex flex-col ">
                              <div className="relative w-full aspect-video overflow-hidden rounded-md">
                                {e.still_path ? (
                                  <img
                                    src={`https://image.tmdb.org/t/p/w500${e.still_path}`}
                                    alt={e.name}
                                    loading="lazy"
                                    className={cn(
                                      "w-full h-full object-cover",
                                      "transition-all duration-300 group-hover:brightness-75",
                                      !activateSpoiler && "blur-xl scale-110",
                                    )}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-neutral-900">
                                    <span className="text-5xl font-black text-neutral-800">
                                      {e.episode_number}
                                    </span>
                                  </div>
                                )}
                              </div>

                              <div className="mt-2 pr-2 pl-1 py-1">
                                <div className="flex items-baseline gap-2">
                                  <span className="text-gray-500 text-sm md:text-base  font-medium tabular-nums shrink-0">
                                    E{e.episode_number}
                                  </span>
                                  {activateSpoiler && (
                                    <p className="lg:text-base text-sm text-white/80 font-medium truncate leading-snug">
                                      {e.name}
                                    </p>
                                  )}
                                </div>

                                <div className="flex items-center gap-2 mt-0.5 text-gray-400 text-xs md:text-sm">
                                  {e.runtime && (
                                    <span className="">{e.runtime} min</span>
                                  )}
                                  {e.runtime && e.air_date && (
                                    <span className="">·</span>
                                  )}
                                  {e.air_date && (
                                    <span className="">
                                      {new Date(e.air_date).toLocaleDateString(
                                        "en-US",
                                        {
                                          month: "short",
                                          day: "numeric",
                                          year: "numeric",
                                        },
                                      )}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </SwiperSlide>
                    );
                  })
                )}
              </Swiper>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function NoEpisodesFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8 px-4 w-full min-h-[140px] text-center">
      <div className="flex items-center justify-center size-12 rounded-full bg-white/5">
        <VideoOff className="size-5 text-white/30" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-white/60">No episodes found</p>
        <p className="text-xs text-white/30">
          This season doesn't have any episodes yet.
        </p>
      </div>
    </div>
  );
}

function EpisodeSkeletonCard() {
  return (
    <div className="flex flex-col max-w-50 sm:max-w-85 w-[160px] sm:w-[320px]">
      <Skeleton className="w-full aspect-video rounded-md" />
      <div className="mt-3 pr-2 space-y-2">
        <div className="flex items-baseline gap-2">
          <Skeleton className="h-4 w-6 shrink-0" />
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  );
}
