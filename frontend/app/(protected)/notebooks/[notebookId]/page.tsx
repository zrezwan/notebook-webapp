import Link from "next/link";
import { redirect } from "next/navigation";
import { getNotebook } from "@/actions/notebooks";
import { getPagesByNotebook } from "@/actions/pages";
import { ChatPanel } from "@/components/chat-panel";
import { NotebookScreen } from "@/components/notebook-screen";

export default async function NotebookDetailPage({
  params,
}: {
  params: Promise<{ notebookId: string }>;
}) {
  const resolvedParams = await params;
  const notebookId = Number(resolvedParams.notebookId);
  if (Number.isNaN(notebookId)) {
    redirect("/notebooks");
  }

  const result = await getNotebook(notebookId);
  if (!result.success || !result.data) {
    redirect("/notebooks");
  }

  const nb = result.data;
  const pagesRes = await getPagesByNotebook(notebookId);
  const initialPages = pagesRes.success && pagesRes.data ? pagesRes.data : [];

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr] items-start">
          <NotebookScreen
            notebook={{
              notebookId,
              title: nb.title,
              courseName: nb.courseName,
              visibility: nb.visibility,
            }}
            initialPages={initialPages}
          />

          <div className="space-y-4 lg:pt-0">
        <ChatPanel notebookId={notebookId} />
          </div>
        </div>
      </div>
    </div>
  );
}

