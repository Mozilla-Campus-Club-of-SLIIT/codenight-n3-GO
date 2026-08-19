"use client";

import {
  BookOpenIcon,
  CodeIcon,
  ListChecksIcon,
  LogOutIcon,
  TrophyIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { logout } from "@/actions/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AssessmentExercise } from "@/lib/assessment";
import type { Category } from "@/lib/content";
import { cn } from "@/lib/utils";

const navItemClass =
  "flex w-full items-center gap-2.5 px-3 py-2 text-xs font-semibold tracking-widest uppercase transition-colors";

const comingSoon = [{ label: "Community", icon: UsersIcon }];

export function ChapterSidebar({
  categories,
  assessmentExercises,
}: {
  categories: Category[];
  assessmentExercises: AssessmentExercise[];
}) {
  const pathname = usePathname();
  const activeCategory = pathname.split("/")[2];
  const editorOpen = pathname.startsWith("/assessment");

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-e border-border bg-sidebar md:flex">
      <nav className="flex flex-col gap-0.5 p-2">
        <Link
          href="/learn"
          className={cn(
            navItemClass,
            pathname.startsWith("/learn")
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          )}
        >
          <BookOpenIcon className="size-3.5" />
          Lessons
        </Link>

        <Link
          href="/assessment"
          className={cn(
            navItemClass,
            editorOpen
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          )}
        >
          <CodeIcon className="size-3.5" />
          Final Assessment
        </Link>

        <Link
          href="/leaderboard"
          className={cn(
            navItemClass,
            pathname.startsWith("/leaderboard")
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          )}
        >
          <TrophyIcon className="size-3.5" />
          Leaderboard
        </Link>

        {comingSoon.map((item) => (
          <div
            key={item.label}
            className={cn(
              navItemClass,
              "text-muted-foreground/60 cursor-not-allowed justify-between",
            )}
          >
            <span className="flex items-center gap-2.5">
              <item.icon className="size-3.5" />
              {item.label}
            </span>
            <Badge
              variant="outline"
              className="text-[0.55rem] lowercase opacity-60"
            >
              soon
            </Badge>
          </div>
        ))}
      </nav>

      <div className="min-h-0 flex-1 overflow-y-auto border-t border-border p-2">
        {editorOpen ? (
          <>
            <p className="px-3 py-2 text-[0.625rem] font-semibold tracking-widest text-muted-foreground uppercase">
              Final Assessment
            </p>

            {assessmentExercises.map((exercise) => {
              const href = `/assessment/${exercise.id}`;

              return (
                <Link
                  key={exercise.id}
                  href={href}
                  className={cn(
                    "flex items-baseline gap-2 px-3 py-1.5 text-xs transition-colors",
                    pathname === href
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <span className="font-mono text-[0.625rem] text-primary">
                    {String(exercise.number).padStart(2, "0")}
                  </span>
                  <span className="truncate font-medium">{exercise.title}</span>
                </Link>
              );
            })}
          </>
        ) : (
          <>
            <p className="px-3 py-2 text-[0.625rem] font-semibold tracking-widest text-muted-foreground uppercase">
              Chapters
            </p>

            {categories.map((category) => {
              const open = activeCategory === category.id;

              return (
                <div key={category.id} className="mb-1">
                  <Link
                    href={`/learn/${category.id}/${category.topics[0]?.id}`}
                    prefetch={true}
                    className={cn(
                      "flex items-baseline gap-2 px-3 py-1.5 text-xs transition-colors",
                      open
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <span className="font-mono text-[0.625rem] text-primary">
                      {String(category.number).padStart(2, "0")}
                    </span>
                    <span className="truncate font-medium">
                      {category.title}
                    </span>
                  </Link>

                  {open ? (
                    <ul className="ms-5.5 border-s border-border">
                      {category.topics.map((topic) => {
                        const href = `/learn/${category.id}/${topic.id}`;

                        return (
                          <li key={topic.id}>
                            <Link
                              href={href}
                              prefetch={true}
                              className={cn(
                                "-ms-px flex border-s-2 py-1.5 ps-3 pe-2 text-xs transition-colors",
                                pathname === href
                                  ? "border-primary text-foreground"
                                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
                              )}
                            >
                              <span className="truncate">{topic.title}</span>
                            </Link>
                          </li>
                        );
                      })}

                      <li>
                        <Link
                          href={`/learn/${category.id}/quiz`}
                          prefetch={true}
                          className={cn(
                            "-ms-px flex items-center gap-1.5 border-s-2 py-1.5 ps-3 pe-2 text-xs transition-colors",
                            pathname === `/learn/${category.id}/quiz`
                              ? "border-primary text-foreground"
                              : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
                          )}
                        >
                          <ListChecksIcon className="size-3" />
                          <span className="truncate">Chapter Quiz</span>
                        </Link>
                      </li>
                    </ul>
                  ) : null}
                </div>
              );
            })}
          </>
        )}
      </div>

      <div className="border-t border-border p-2">
        <form action={logout}>
          <Button
            type="submit"
            variant="destructive"
            className="w-full justify-center gap-2 font-mono text-xs font-semibold tracking-wider uppercase"
          >
            <LogOutIcon className="size-3.5" />
            Logout
          </Button>
        </form>
      </div>
    </aside>
  );
}
