"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useEffect, useState } from "react";

import type { LeaderboardEntry } from "@/lib/leaderboard";
import { cn } from "@/lib/utils";

const POLL_INTERVAL_MS = 30_000; // 30 seconds
const PAGE_SIZE = 10;

export function LiveLeaderboard({
  initialEntries,
  currentUserId,
}: {
  initialEntries: LeaderboardEntry[];
  currentUserId: string | null;
}) {
  const [entries, setEntries] = useState(initialEntries);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    async function poll() {
      try {
        const response = await fetch("/api/leaderboard", { cache: "no-store" });
        if (!response.ok || cancelled) return;
        const body = (await response.json()) as { entries: LeaderboardEntry[] };
        if (!cancelled) setEntries(body.entries);
      } catch {}
    }

    function start() {
      if (!intervalId) intervalId = setInterval(poll, POLL_INTERVAL_MS);
    }

    function stop() {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    }

    function handleVisibility() {
      if (document.hidden) {
        stop();
      } else {
        poll();
        start();
      }
    }

    start();
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelled = true;
      stop();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  if (entries.length === 0) {
    return (
      <div className="mt-8 border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        No one's on the board yet. Complete a chapter quiz or an exercise to
        appear here.
      </div>
    );
  }

  const [first, second, third, ...rest] = entries;
  const podiumSlots: { entry: LeaderboardEntry | null; rank: 1 | 2 | 3 }[] = [
    { entry: second ?? null, rank: 2 },
    { entry: first ?? null, rank: 1 },
    { entry: third ?? null, rank: 3 },
  ];

  const totalPages = Math.max(1, Math.ceil(rest.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageEntries = rest.slice(pageStart, pageStart + PAGE_SIZE);

  return (
    <>
      <div className="mt-10 grid grid-cols-3 items-end gap-3">
        {podiumSlots.map((slot) => (
          <PodiumCard
            key={slot.rank}
            entry={slot.entry}
            rank={slot.rank}
            isCurrentUser={slot.entry?.userId === currentUserId}
          />
        ))}
      </div>

      {rest.length > 0 ? (
        <>
          <ul className="mt-8 flex flex-col gap-2">
            {pageEntries.map((entry, index) => (
              <li key={entry.userId}>
                <RankRow
                  rank={pageStart + index + 4}
                  entry={entry}
                  isCurrentUser={entry.userId === currentUserId}
                />
              </li>
            ))}
          </ul>

          {totalPages > 1 ? (
            <Pagination
              page={currentPage}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          ) : null}
        </>
      ) : null}
    </>
  );
}

function PodiumCard({
  entry,
  rank,
  isCurrentUser,
}: {
  entry: LeaderboardEntry | null;
  rank: 1 | 2 | 3;
  isCurrentUser: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center border bg-card px-3 pb-5 text-center",
        rank === 1 ? "min-h-[220px] pt-10" : "min-h-[176px] pt-6",
        rank === 1 ? "border-primary/50" : "border-border",
        !entry && "border-dashed opacity-60",
        isCurrentUser &&
          "ring-2 ring-primary/40 ring-offset-2 ring-offset-background",
      )}
    >
      <div
        className={cn(
          "flex shrink-0 items-center justify-center border font-heading font-semibold",
          rank === 1
            ? "size-10 border-primary text-lg text-primary"
            : "size-8 border-border text-sm text-muted-foreground",
        )}
      >
        {rank}
      </div>
      <p className="mt-3 w-full truncate text-sm font-medium">
        {entry ? entry.displayName : "--"}
      </p>
      <p className="mt-1 font-heading text-xl font-semibold text-primary">
        {entry ? entry.score : "--"}
      </p>
      <p className="text-[0.625rem] tracking-widest text-muted-foreground uppercase">
        points
      </p>
    </div>
  );
}

function RankRow({
  rank,
  entry,
  isCurrentUser,
}: {
  rank: number;
  entry: LeaderboardEntry;
  isCurrentUser: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 border border-border bg-card p-4 transition-colors",
        isCurrentUser && "border-primary/40 bg-primary/5",
      )}
    >
      <span className="font-mono text-xs text-primary">
        {String(rank).padStart(2, "0")}
      </span>
      <span className="truncate font-medium">{entry.displayName}</span>
      <span className="ms-auto font-heading text-sm font-semibold">
        {entry.score}
        <span className="ms-1 text-[0.625rem] font-normal tracking-widest text-muted-foreground uppercase">
          pts
        </span>
      </span>
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="mt-6 flex items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="flex size-7 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
      >
        <ChevronLeftIcon className="size-3.5" />
      </button>

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPageChange(p)}
          className={cn(
            "flex size-7 items-center justify-center text-xs font-semibold transition-colors",
            p === page
              ? "bg-primary text-primary-foreground"
              : "border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
          )}
        >
          {p}
        </button>
      ))}

      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="flex size-7 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
      >
        <ChevronRightIcon className="size-3.5" />
      </button>
    </div>
  );
}
