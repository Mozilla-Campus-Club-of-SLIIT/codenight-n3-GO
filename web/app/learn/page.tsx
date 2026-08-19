import { TrophyIcon } from "lucide-react";
import Link from "next/link";
import { Suspense, ViewTransition } from "react";

import { categories, courseTitle } from "@/lib/content";
import { getLeaderboard } from "@/lib/leaderboard";
import { getSession } from "@/lib/session";
import { cn } from "@/lib/utils";

export default function CurriculumPage() {
  return (
    <main className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <ViewTransition name="curriculumTitle" share="auto" default="none">
          <h1 className="font-heading text-2xl font-semibold">{courseTitle}</h1>
        </ViewTransition>

        {/* Dynamic Leaderboard Widget Streams Asynchronously */}
        <Suspense fallback={<ViewTransition exit="fade-out"><LeaderboardWidgetSkeleton /></ViewTransition>}>
          <ViewTransition enter="fade-in" default="none">
            <TopLeaderboard />
          </ViewTransition>
        </Suspense>

        {/* Static Category List Prerendered at Build Time */}
        <ul className="mt-8 flex flex-col gap-2">
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                href={`/learn/${category.id}/${category.topics[0]?.id}`}
                // prefetch={true}
                className="flex items-baseline gap-3 border border-border bg-card p-4 transition-colors hover:border-primary/40"
              >
                <span className="font-mono text-xs text-primary">
                  {String(category.number).padStart(2, "0")}
                </span>
                <span className="font-medium">{category.title}</span>
                <span className="ms-auto text-xs text-muted-foreground">
                  {category.topics.length} topics
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}

async function TopLeaderboard() {
  const [topEntries, session] = await Promise.all([
    getLeaderboard(5),
    getSession(),
  ]);
  const currentUserId = session?.userId ?? null;

  if (topEntries.length === 0) {
    return null;
  }

  return (
    <ViewTransition name="topLeaderboard" share="auto" default="none">
      <div className="mt-6 border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrophyIcon className="size-4 text-primary" />
            <p className="text-[0.625rem] font-semibold tracking-widest text-primary uppercase">
              Leaderboard
            </p>
          </div>
          <Link
            href="/leaderboard"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            View all →
          </Link>
        </div>

        <ul className="mt-4 flex flex-col gap-2">
          {topEntries.map((entry, index) => (
            <li
              key={entry.userId}
              className={cn(
                "flex items-center gap-3 text-sm",
                entry.userId === currentUserId && "text-primary",
              )}
            >
              <span className="font-mono text-xs text-primary">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="truncate font-medium">{entry.displayName}</span>
              <span className="ms-auto font-heading text-sm font-semibold">
                {entry.score}
                <span className="ms-1 text-[0.625rem] font-normal tracking-widest text-muted-foreground uppercase">
                  pts
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </ViewTransition>
  );
}

function LeaderboardWidgetSkeleton() {
  return (
    <div className="mt-6 border border-border bg-card p-5 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-4 rounded bg-muted" />
          <div className="h-3 w-20 rounded bg-muted" />
        </div>
        <div className="h-3 w-14 rounded bg-muted" />
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-4 w-full rounded bg-muted/60" />
        <div className="h-4 w-3/4 rounded bg-muted/60" />
        <div className="h-4 w-5/6 rounded bg-muted/60" />
      </div>
    </div>
  );
}
