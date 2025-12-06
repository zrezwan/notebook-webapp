"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";

import { getPage } from "@/actions/pages";
import { PageEditForm } from "@/components/page-edit-form";
import { DeletePageButton } from "@/components/delete-page-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

type Page = {
  noteId: number;
  notebookId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export default function PageEditPage({
  params,
}: {
  params: Promise<{ notebookId: string; pageId: string }>;
}) {
  const router = useRouter();
  const [page, setPage] = useState<Page | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notebookId, setNotebookId] = useState<string>("");
  const [pageId, setPageId] = useState<string>("");

  useEffect(() => {
    async function loadParams() {
      const resolvedParams = await params;
      setNotebookId(resolvedParams.notebookId);
      setPageId(resolvedParams.pageId);
    }
    loadParams();
  }, [params]);

  useEffect(() => {
    async function loadPage() {
      if (!pageId) return;

      setIsLoading(true);
      const result = await getPage(parseInt(pageId));

      if (!result.success) {
        setError(result.error);
        setIsLoading(false);
        return;
      }

      setPage(result.data);
      setIsLoading(false);
    }

    loadPage();
  }, [pageId]);

  function handleDeleteSuccess() {
    router.push(`/notebooks/${notebookId}`);
  }

  function handleEditSuccess() {
    router.refresh();
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading page...</p>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 gap-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="size-4" />
          <AlertDescription>{error || "Page not found"}</AlertDescription>
        </Alert>
        <Link href={`/notebooks/${notebookId}`}>
          <Button variant="outline">
            <ArrowLeft className="mr-2 size-4" />
            Back to Notebook
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link href={`/notebooks/${notebookId}`}>
            <Button variant="ghost">
              <ArrowLeft className="mr-2 size-4" />
              Back to Notebook
            </Button>
          </Link>
          <DeletePageButton
            pageId={page.noteId}
            onSuccess={handleDeleteSuccess}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Edit Page</CardTitle>
            <CardDescription>
              Last updated: {new Date(page.updatedAt).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PageEditForm
              pageId={page.noteId}
              initialContent={page.content}
              onSuccess={handleEditSuccess}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
