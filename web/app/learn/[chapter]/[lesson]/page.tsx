import { notFound } from "next/navigation";
import { ViewTransition } from "react";

import { LessonNav } from "@/components/lesson/lesson-nav";
import {
  categories,
  getAdjacentTopics,
  getCategory,
  getTopic,
  readRepoFile,
} from "@/lib/content";
import { renderMarkdown } from "@/lib/markdown";

export function generateStaticParams() {
  return categories.flatMap((category) =>
    category.topics.map((topic) => ({
      chapter: category.id,
      lesson: topic.id,
    })),
  );
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ chapter: string; lesson: string }>;
}) {
  "use cache";
  return (
    //  fallback={<ViewTransition exit="fade-out"><SuspenseLoader /></ViewTransition>}
    // enter="fade-in" default="none"
    // <Suspense>
      <ViewTransition>
        <LessonContent params={params} />
      </ViewTransition>
    // </Suspense>
  );
}

async function LessonContent({
  params,
}: {
  params: Promise<{ chapter: string; lesson: string }>;
}) {
  const { chapter: categoryId, lesson: topicId } = await params;

  const category = getCategory(categoryId);
  const topic = getTopic(categoryId, topicId);

  if (!category || !topic) notFound();

  const markdown = await readRepoFile(topic.contentPath);
  if (markdown === null) notFound();

  const html = await renderMarkdown(markdown);

  const { previous, next } = getAdjacentTopics(categoryId, topicId);
  return (
    //  key={topicId} name="lessonContent" share="auto" default="none"
    <main className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <ViewTransition>
          <div>
            <p className="text-[0.625rem] font-semibold tracking-widest text-primary uppercase">
              Chapter {category.number} · {category.title}
            </p>
            <h1 className="font-heading mt-2 mb-8 text-3xl font-semibold">
              {topic.title}
            </h1>

            <article
              className="prose prose-invert max-w-none prose-pre:border prose-pre:border-border prose-pre:bg-card"
              // biome-ignore lint/security/noDangerouslySetInnerHtml: our own markdown
              dangerouslySetInnerHTML={{ __html: html }}
            />
            <LessonNav
              categoryId={categoryId}
              previous={previous}
              next={next}
            />
          </div>
        </ViewTransition>
      </div>
    </main>
  );
}
