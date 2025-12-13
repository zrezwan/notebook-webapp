import Link from "next/link";
import { getDashboardNotebooks } from "@/actions/notebooks";
import { logout } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { NotebookList } from "@/components/notebook-list";

export default async function NotebooksPage() {
  const notebooks = await getDashboardNotebooks();

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Your Notebooks</h1>
            <p className="text-muted-foreground">
              View, create, and manage notebooks.
            </p>
          </div>
          <div className="flex gap-2">
            <form action={logout}>
              <Button variant="outline">Log out</Button>
            </form>
            <Link href="/notebooks/search">
              <Button variant="outline">Search</Button>
            </Link>
            <Link href="/notebooks/new">
              <Button>Create Notebook</Button>
            </Link>
          </div>
        </div>

        <NotebookList notebooks={notebooks} />
      </div>
    </div>
  );
}

