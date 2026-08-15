import { ArrowLeftIcon, ArrowRightIcon, ListChecksIcon } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import type { AdjacentTopic } from "@/lib/content";
import { cn } from "@/lib/utils";

export function LessonNav({
  categoryId,
  previous,
  next,
}: {
  categoryId: string;
  previous: AdjacentTopic | null;
  next: AdjacentTopic | null;
}) {
  return (
    <nav className="mt-12 grid grid-cols-1 items-center gap-3 border-t border-border pt-6 sm:grid-cols-[1fr_auto_1fr]">
      {previous ? (
        <Link
          href={`/learn/${previous.categoryId}/${previous.topicId}`}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-auto flex-col items-start gap-1 px-4 py-3 normal-case sm:justify-self-start",
          )}
          prefetch={true}
        >
          <span className="flex items-center gap-1.5 text-[0.625rem] font-semibold tracking-widest text-muted-foreground uppercase">
            <ArrowLeftIcon className="size-3" />
            Previous
          </span>
          <span className="text-xs font-medium">{previous.title}</span>
        </Link>
      ) : (
        <span className="hidden sm:block" />
      )}

      {next ? (
        <Link
          href={`/learn/${categoryId}/quiz`}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "shrink-0 gap-1.5 normal-case sm:justify-self-center",
          )}
          prefetch={true}
        >
          <ListChecksIcon className="size-3.5" />
          Chapter Quiz
        </Link>
      ) : (
        <span className="hidden sm:block" />
      )}

      {next ? (
        <Link
          href={`/learn/${next.categoryId}/${next.topicId}`}
          prefetch={true}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-auto flex-col items-end gap-1 px-4 py-3 text-end normal-case sm:justify-self-end",
          )}
        >
          <span className="flex items-center gap-1.5 text-[0.625rem] font-semibold tracking-widest text-muted-foreground uppercase">
            Next
            <ArrowRightIcon className="size-3" />
          </span>
          <span className="text-xs font-medium">{next.title}</span>
        </Link>
      ) : (
        <Link
          href={`/learn/${categoryId}/quiz`}
          prefetch={true}
          className={cn(
            buttonVariants({ variant: "default" }),
            "h-auto flex-col items-end gap-1 px-4 py-3 text-end normal-case sm:justify-self-end",
          )}
        >
          <span className="flex items-center gap-1.5 text-[0.625rem] font-semibold tracking-widest uppercase">
            Next
            <ArrowRightIcon className="size-3" />
          </span>
          <span className="text-xs font-medium">Take the Chapter Quiz</span>
        </Link>
      )}
    </nav>
  );
}
