import { sql } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

import { db } from "@/db/drizzle";
import { assessmentProgress } from "@/db/schema";
import { getAssessmentExercise, getFixtureFiles } from "@/lib/assessment";
import { runGoTest } from "@/lib/assessment-runner";
import { readRepoFile } from "@/lib/content";
import { getSession } from "@/lib/session";

const MAX_CODE_LENGTH = 20_000;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ exerciseId: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { exerciseId } = await params;
  const exercise = getAssessmentExercise(exerciseId);
  if (!exercise) {
    return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
  }

  const body = (await request.json().catch(() => null)) as {
    code?: unknown;
  } | null;
  const code = body?.code;
  if (
    typeof code !== "string" ||
    code.length === 0 ||
    code.length > MAX_CODE_LENGTH
  ) {
    return NextResponse.json(
      { error: "Invalid code submission" },
      { status: 400 },
    );
  }

  const testCode = await readRepoFile(exercise.testPath);
  if (testCode === null) {
    return NextResponse.json({ error: "Test file missing" }, { status: 500 });
  }

  const fixtures = getFixtureFiles(exercise);
  const { passed, output } = await runGoTest(code, testCode, fixtures);

  await db
    .insert(assessmentProgress)
    .values({
      id: crypto.randomUUID(),
      userId: session.userId,
      exerciseId,
      code,
      passed,
      output,
      attempts: 1,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [assessmentProgress.userId, assessmentProgress.exerciseId],
      set: {
        code,
        passed,
        output,
        attempts: sql`${assessmentProgress.attempts} + 1`,
        updatedAt: new Date(),
      },
    });

  revalidateTag("leaderboard", "max");

  return NextResponse.json({ passed, output });
}
