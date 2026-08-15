import "server-only";

import { eq, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

import { db } from "@/db/drizzle";
import { assessmentProgress, quizProgress, sessions } from "@/db/schema";

const POINTS_PER_QUIZ_QUESTION = 10;
const POINTS_PER_PASSED_EXERCISE = 50;

export type LeaderboardEntry = {
  userId: string;
  displayName: string;
  score: number;
};

function fallbackName(userId: string): string {
  return `Learner #${userId.slice(0, 6)}`;
}

export async function getLeaderboard(limit = 100): Promise<LeaderboardEntry[]> {
  "use cache";
  cacheTag("leaderboard");
  cacheLife("minutes");

  const rows = await db
    .select({
      userId: sessions.userId,
      displayName: sessions.displayName,
      quizScore: sql<number>`coalesce((select sum(${quizProgress.score}) from ${quizProgress} where ${quizProgress.userId} = ${sessions.userId}), 0)`,
      passedCount: sql<number>`coalesce((select count(*) from ${assessmentProgress} where ${assessmentProgress.userId} = ${sessions.userId} and ${assessmentProgress.passed} = true), 0)`,
    })
    .from(sessions);

  return rows
    .map((row) => {
      const score =
        Number(row.quizScore) * POINTS_PER_QUIZ_QUESTION +
        Number(row.passedCount) * POINTS_PER_PASSED_EXERCISE;
      return {
        userId: row.userId,
        displayName: row.displayName || fallbackName(row.userId),
        score,
      };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
