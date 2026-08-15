import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Suspense, ViewTransition } from "react";

import { ExerciseWorkbench } from "@/components/assessment/exercise-workbench";
import { SuspenseLoader } from "@/components/common/suspense-loader";
import { db } from "@/db/drizzle";
import { assessmentProgress } from "@/db/schema";
import { assessmentExercises, getAssessmentExercise } from "@/lib/assessment";
import { readRepoFile } from "@/lib/content";
import { renderMarkdown } from "@/lib/markdown";
import { getSession } from "@/lib/session";

export function generateStaticParams() {
  return assessmentExercises.map((exercise) => ({ exerciseId: exercise.id }));
}

export default function AssessmentExercisePage({
  params,
}: {
  params: Promise<{ exerciseId: string }>;
}) {
  return (
    <Suspense fallback={<SuspenseLoader />}>
      <AssessmentExerciseContent params={params} />
    </Suspense>
  );
}

async function AssessmentExerciseContent({
  params,
}: {
  params: Promise<{ exerciseId: string }>;
}) {
  const { exerciseId } = await params;

  const exercise = getAssessmentExercise(exerciseId);
  if (!exercise) notFound();

  const taskMarkdown = await readRepoFile(exercise.taskPath);
  const starterCode = await readRepoFile(exercise.starterPath);
  if (taskMarkdown === null || starterCode === null) notFound();

  const taskHtml = await renderMarkdown(taskMarkdown);

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:overflow-hidden">
      <div className="flex min-h-0 flex-1 flex-col px-6 py-6">
        <ViewTransition name="exercise" share="auto">
          <p className="text-[0.625rem] font-semibold tracking-widest text-primary uppercase">
            Final Assessment · {exercise.level}
          </p>
          <h1 className="font-heading mt-1 mb-6 text-2xl font-semibold">
            {String(exercise.number).padStart(2, "0")} · {exercise.title}
          </h1>

          <Suspense fallback={<SuspenseLoader />}>
            <Editor
              exerciseId={exercise.id}
              taskHtml={taskHtml}
              starterCode={starterCode}
            />
          </Suspense>
        </ViewTransition>
      </div>
    </main>
  );
}

async function Editor({
  exerciseId,
  taskHtml,
  starterCode,
}: {
  exerciseId: string;
  taskHtml: string;
  starterCode: string;
}) {
  const session = await getSession();
  const [saved] = session
    ? await db
        .select({
          code: assessmentProgress.code,
          passed: assessmentProgress.passed,
          output: assessmentProgress.output,
        })
        .from(assessmentProgress)
        .where(
          and(
            eq(assessmentProgress.userId, session.userId),
            eq(assessmentProgress.exerciseId, exerciseId),
          ),
        )
        .limit(1)
    : [];

  return (
    <ExerciseWorkbench
      exerciseId={exerciseId}
      taskHtml={taskHtml}
      starterCode={starterCode}
      savedCode={saved?.code ?? null}
      initialResult={
        saved ? { passed: saved.passed, output: saved.output } : null
      }
    />
  );
}
