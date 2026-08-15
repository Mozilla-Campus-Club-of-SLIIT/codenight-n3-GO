import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  username: text("username"),
  displayName: text("display_name"),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastLoginAt: timestamp("last_login_at").defaultNow().notNull(),
  loggedOutAt: timestamp("logged_out_at"),
});

export const assessmentProgress = pgTable(
  "assessment_progress",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    exerciseId: text("exercise_id").notNull(),
    code: text("code").notNull(),
    passed: boolean("passed").notNull(),
    output: text("output").notNull(),
    attempts: integer("attempts").default(1).notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("assessment_progress_user_exercise_unique").on(
      table.userId,
      table.exerciseId,
    ),
  ],
);

export const quizProgress = pgTable(
  "quiz_progress",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    categoryId: text("category_id").notNull(),
    passed: boolean("passed").notNull(),
    score: integer("score").notNull(),
    total: integer("total").notNull(),
    submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  },
  (table) => [
    index("quiz_progress_user_category_index").on(
      table.userId,
      table.categoryId,
    ),
  ],
);
