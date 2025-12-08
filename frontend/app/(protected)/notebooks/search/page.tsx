import Link from "next/link";
import { searchNotebooks } from "@/actions/notebooks";
import { NotebookList } from "@/components/notebook-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function NotebookSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const resolved = await searchParams;
  const query = resolved?.q ?? "";
  const results = query ? await searchNotebooks(query) : [];

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Search Notebooks</h1>
            <p className="text-muted-foreground">
              Find public notebooks or ones you can access.
            </p>
          </div>
          <Link href="/notebooks">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        <form className="flex gap-2" method="get">
          <Input
            name="q"
            placeholder="Search by title or course name"
            defaultValue={query}
          />
          <Button type="submit">Search</Button>
        </form>

        {query ? (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Results</h2>
            <NotebookList notebooks={results} />
          </div>
        ) : (
          <p className="text-muted-foreground">Enter a query to search.</p>
        )}
      </div>
    </div>
  );
}

