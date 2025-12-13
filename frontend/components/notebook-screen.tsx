"use client";

import Link from "next/link";
import { useRef } from "react";
import { Save } from "lucide-react";
import { logout } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import {
  NotebookReader,
  NotebookReaderHandle,
} from "@/components/notebook-reader";

type Notebook = {
  notebookId: number;
  title: string;
  courseName?: string | null;
  visibility?: string | null;
};

type Page = {
  noteId?: number;
  content: string;
};

type Props = {
  notebook: Notebook;
  initialPages: Page[];
};

export function NotebookScreen({ notebook, initialPages }: Props) {
  const readerRef = useRef<NotebookReaderHandle>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/notebooks">
            <Button variant="outline">Back to Notebooks</Button>
          </Link>
          <form action={logout}>
            <Button variant="outline">Log out</Button>
          </form>
        </div>
        <Button
          size="sm"
          onClick={() => readerRef.current?.saveNotebook()}
          disabled={false}
        >
          <Save className="mr-2 size-4" />
          Save Notebook
        </Button>
      </div>

      <NotebookReader
        ref={readerRef}
        notebook={notebook}
        initialPages={initialPages}
      />
    </div>
  );
}

