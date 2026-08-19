import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";

const repoRoot = path.join(process.cwd(), ".data");

export type Level = "beginner" | "intermediate" | "advanced";

export type Exercise = {
  id: string;
  title: string;
  level: Level;
  filePath: string;
  testPath: string;
  docPath: string;
};

export type Topic = {
  id: string;
  title: string;
  contentPath: string;
  exercises: Exercise[];
};

export type Category = {
  id: string;
  number: number;
  title: string;
  quizPath: string;
  topics: Topic[];
};

export type QuizChoice = {
  id: string;
  text: string;
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  code?: string;
  choices: QuizChoice[];
  correct: string;
};

export type Quiz = {
  questions: QuizQuestion[];
};

export type PublicQuizQuestion = Omit<QuizQuestion, "correct">;
export type PublicQuiz = { questions: PublicQuizQuestion[] };

export function toPublicQuiz(quiz: Quiz): PublicQuiz {
  return {
    questions: quiz.questions.map(
      ({ correct: _correct, ...question }) => question,
    ),
  };
}

export type AdjacentTopic = {
  categoryId: string;
  topicId: string;
  title: string;
};

type Manifest = {
  title: string;
  categories: {
    id: string;
    title: string;
    quiz_path: string;
    topics: {
      id: string;
      title: string;
      content_path: string;
      exercises: {
        id: string;
        title: string;
        level: Level;
        file_path: string;
        test_path: string;
        doc_path: string;
      }[];
    }[];
  }[];
};

const manifest: Manifest = JSON.parse(
  readFileSync(path.join(repoRoot, "content", "manifest.json"), "utf-8"),
);

export const courseTitle = manifest.title;

export const categories: Category[] = manifest.categories.map(
  (category, index) => ({
    id: category.id,
    number: index + 1,
    title: category.title,
    quizPath: category.quiz_path,
    topics: category.topics.map((topic) => ({
      id: topic.id,
      title: topic.title,
      contentPath: topic.content_path,
      exercises: topic.exercises.map((exercise) => ({
        id: exercise.id,
        title: exercise.title,
        level: exercise.level,
        filePath: exercise.file_path,
        testPath: exercise.test_path,
        docPath: exercise.doc_path,
      })),
    })),
  }),
);

export function getCategory(categoryId: string): Category | undefined {
  return categories.find((category) => category.id === categoryId);
}

export function getTopic(
  categoryId: string,
  topicId: string,
): Topic | undefined {
  return getCategory(categoryId)?.topics.find((topic) => topic.id === topicId);
}

export async function readRepoFile(
  relativePath: string,
): Promise<string | null> {
  "use cache";
  try {
    return await readFile(path.join(repoRoot, relativePath), "utf-8");
  } catch {
    return null;
  }
}

async function readQuiz(relativePath: string): Promise<Quiz | null> {
  const raw = await readRepoFile(relativePath);
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as Quiz;
  } catch {
    return null;
  }
}

export async function getChapterQuiz(categoryId: string): Promise<Quiz | null> {
  const category = getCategory(categoryId);
  if (!category) return null;
  return readQuiz(category.quizPath);
}

const flatTopics: AdjacentTopic[] = categories.flatMap((category) =>
  category.topics.map((topic) => ({
    categoryId: category.id,
    topicId: topic.id,
    title: topic.title,
  })),
);

export function getAdjacentTopics(
  categoryId: string,
  topicId: string,
): { previous: AdjacentTopic | null; next: AdjacentTopic | null } {
  const category = getCategory(categoryId);
  const index = flatTopics.findIndex(
    (entry) => entry.categoryId === categoryId && entry.topicId === topicId,
  );
  if (index === -1 || !category) return { previous: null, next: null };

  const isLastInChapter =
    category.topics[category.topics.length - 1]?.id === topicId;

  return {
    previous: index > 0 ? flatTopics[index - 1] : null,
    next: isLastInChapter ? null : flatTopics[index + 1],
  };
}

export function getNextChapterFirstTopic(
  categoryId: string,
): AdjacentTopic | null {
  const index = categories.findIndex((category) => category.id === categoryId);
  if (index === -1) return null;

  const nextCategory = categories[index + 1];
  const firstTopic = nextCategory?.topics[0];
  if (!nextCategory || !firstTopic) return null;

  return {
    categoryId: nextCategory.id,
    topicId: firstTopic.id,
    title: firstTopic.title,
  };
}
