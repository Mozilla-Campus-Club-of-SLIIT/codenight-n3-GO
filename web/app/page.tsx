import { Link } from "lucide-react";

export const instant = false;

export default async function Home() {
  // const session = await getSession();

  // redirect(session ? "/learn" : "/login");
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <Link className="size-6 text-muted-foreground" href="/login">
        Login to continue
      </Link>
      <Link className="size-6 text-muted-foreground" href="/learn">
        Go to learn page
      </Link>
    </div>
  );
}
