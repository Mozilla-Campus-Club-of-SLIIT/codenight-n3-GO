import { and, eq } from "drizzle-orm";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, ViewTransition } from "react";

import { SuspenseLoader } from "@/components/common/suspense-loader";
import {
  ChapterQuiz,
  type RenderedQuiz,
} from "@/components/lesson/chapter-quiz";
import { buttonVariants } from "@/components/ui/button";
import { db } from "@/db/drizzle";
import { quizProgress } from "@/db/schema";
import {
  categories,
  getCategory,
  getChapterQuiz,
  getNextChapterFirstTopic,
  type PublicQuiz,
  toPublicQuiz,
} from "@/lib/content";
import { renderMarkdown } from "@/lib/markdown";
import { getSession } from "@/lib/session";

async function renderQuizCode(quiz: PublicQuiz): Promise<RenderedQuiz> {
  return {
    questions: await Promise.all(
      quiz.questions.map(async (question) => ({
        ...question,
        codeHtml: question.code
          ? await renderMarkdown(`\`\`\`go\n${question.code}\n\`\`\``)
          : null,
      })),
    ),
  };
}

export function generateStaticParams() {
  return categories.map((category) => ({ chapter: category.id }));
}

export default function ChapterQuizPage({
  params,
}: {
  params: Promise<{ chapter: string }>;
}) {
  return (
    <Suspense fallback={<ViewTransition exit="fade-out"><SuspenseLoader /></ViewTransition>}>
      <ViewTransition enter="fade-in" default="none">
        <ChapterQuizContent params={params} />
      </ViewTransition>
    </Suspense>
  );
}

async function ChapterQuizContent({
  params,
}: {
  params: Promise<{ chapter: string }>;
}) {
  const { chapter: categoryId } = await params;

  const category = getCategory(categoryId);
  if (!category) notFound();

  const quiz = await getChapterQuiz(categoryId);
  if (!quiz) notFound();

  const firstTopic = category.topics[0];
  const nextChapterTopic = getNextChapterFirstTopic(categoryId);
  const renderedQuiz = await renderQuizCode(toPublicQuiz(quiz));

  return (
    <ViewTransition key={categoryId} name="chapterQuiz" share="auto" default="none">
      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-6 py-10">
          {firstTopic ? (
            <Link
              href={`/learn/${category.id}/${firstTopic.id}`}
              className="mb-8 flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeftIcon className="size-3.5" />
              Back to lessons
            </Link>
          ) : null}

          <p className="text-[0.625rem] font-semibold tracking-widest text-primary uppercase">
            Chapter {category.number} · {category.title}
          </p>
          <h1 className="font-heading mt-2 mb-2 text-3xl font-semibold">
            Chapter Quiz
          </h1>
          <p className="mb-8 text-sm text-muted-foreground">
            {quiz.questions.length} questions covering every lesson in this
            chapter.
          </p>

{/* <Suspense fallback={<ViewTransition exit="fade-out"><SuspenseLoader /></ViewTransition>}> */}
          <QuizContainer categoryId={categoryId} renderedQuiz={renderedQuiz} />
{/* </Suspense> */}
          <div className="mt-8 flex items-center justify-between gap-3">
            {firstTopic ? (
              <Link
                href={`/learn/${category.id}/${firstTopic.id}`}
                className={buttonVariants({ variant: "outline" })}
              >
                Back to lessons
              </Link>
            ) : (
              <span />
            )}

            {nextChapterTopic ? (
              <Link
                href={`/learn/${nextChapterTopic.categoryId}/${nextChapterTopic.topicId}`}
                className={buttonVariants({ variant: "default" })}
              >
                Next chapter
                <ArrowRightIcon className="size-4" />
              </Link>
            ) : null}
          </div>
        </div>
      </main>
    </ViewTransition>
  );
}

async function QuizContainer({
  categoryId,
  renderedQuiz,
}: {
  categoryId: string;
  renderedQuiz: RenderedQuiz;
}) {
  const session = await getSession();
  const [completed] = session
    ? await db
        .select({
          passed: quizProgress.passed,
          score: quizProgress.score,
          total: quizProgress.total,
        })
        .from(quizProgress)
        .where(
          and(
            eq(quizProgress.userId, session.userId),
            eq(quizProgress.categoryId, categoryId),
          ),
        )
        .limit(1)
    : [];

  return (
    <ChapterQuiz
      categoryId={categoryId}
      quiz={renderedQuiz}
      completedResult={completed ?? null}
    />
  );
}
