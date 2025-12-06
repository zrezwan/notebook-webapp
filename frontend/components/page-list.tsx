"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, Pencil, AlertCircle } from "lucide-react";

import { getPagesByNotebook } from "@/actions/pages";
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

type PageListProps = {
  notebookId: number;
};

export function PageList({ notebookId }: PageListProps) {
  const [pages, setPages] = useState<Page[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPages() {
      setIsLoading(true);
      const result = await getPagesByNotebook(notebookId);

      if (!result.success) {
        setError(result.error);
        setIsLoading(false);
        return;
      }

      setPages(result.data);
      setIsLoading(false);
    }

    loadPages();
  }, [notebookId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Loading pages...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="size-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (pages.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-8">
          <FileText className="size-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            No pages in this notebook yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {pages.map((page) => (
        <Card key={page.noteId}>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base truncate">
                  Page {page.noteId}
                </CardTitle>
                <CardDescription>
                  Updated: {new Date(page.updatedAt).toLocaleDateString()}
                </CardDescription>
              </div>
              <Link href={`/notebooks/${notebookId}/pages/${page.noteId}`}>
                <Button variant="outline" size="sm">
                  <Pencil className="mr-2 size-3" />
                  Edit
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {page.content}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
