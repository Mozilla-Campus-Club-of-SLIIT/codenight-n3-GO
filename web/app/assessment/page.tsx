import { eq } from "drizzle-orm";
import { CheckIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { SuspenseLoader } from "@/components/common/suspense-loader";
import { Badge } from "@/components/ui/badge";
import { db } from "@/db/drizzle";
import { assessmentProgress } from "@/db/schema";
import { assessmentExercises } from "@/lib/assessment";
import { getSession } from "@/lib/session";
import { cn } from "@/lib/utils";

const levelColor = {
  beginner: "text-emerald-400",
  intermediate: "text-amber-400",
  advanced: "text-red-400",
} as const;

export default function AssessmentPage() {
  return (
    <Suspense fallback={<SuspenseLoader />}>
      <AssessmentPageContent />
    </Suspense>
  );
}

async function AssessmentPageContent() {
  const session = await getSession();

  const progress = session
    ? await db
        .select({
          exerciseId: assessmentProgress.exerciseId,
          passed: assessmentProgress.passed,
        })
        .from(assessmentProgress)
        .where(eq(assessmentProgress.userId, session.userId))
    : [];

  const passedIds = new Set(
    progress.filter((row) => row.passed).map((row) => row.exerciseId),
  );
  const attemptedIds = new Set(progress.map((row) => row.exerciseId));

  return (
    <main className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="font-heading text-2xl font-semibold">
          Final Assessment
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {passedIds.size} / {assessmentExercises.length} exercises passed. Each
          one is graded by running its real test file against your code.
        </p>

        <ul className="mt-8 flex flex-col gap-2">
          {assessmentExercises.map((exercise) => {
            const passed = passedIds.has(exercise.id);
            const attempted = attemptedIds.has(exercise.id);

            return (
              <li key={exercise.id}>
                <Link
                  href={`/assessment/${exercise.id}`}
                  prefetch={true}
                  className="flex items-center gap-3 border border-border bg-card p-4 transition-colors hover:border-primary/40"
                >
                  <span className="font-mono text-xs text-primary">
                    {String(exercise.number).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-medium">
                    {exercise.title}
                  </span>
                  <Badge
                    variant="outline"
                    className={cn(levelColor[exercise.level])}
                  >
                    {exercise.level}
                  </Badge>
                  <span
                    className={cn(
                      "flex w-28 shrink-0 items-center justify-end gap-1 text-xs",
                      passed
                        ? "text-primary"
                        : attempted
                          ? "text-destructive"
                          : "text-muted-foreground",
                    )}
                  >
                    {passed ? (
                      <>
                        <CheckIcon className="size-3.5" />
                        Passed
                      </>
                    ) : attempted ? (
                      "Failed"
                    ) : (
                      "Not attempted"
                    )}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}
