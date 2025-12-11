"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { ArrowLeft, ArrowRight, Plus } from "lucide-react";
import { createPage, updatePage } from "@/actions/pages";
import { ShareNotebookDialog } from "@/components/share-notebook-dialog";
import { Button } from "@/components/ui/button";

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
  onSaved?: () => void;
};

export type NotebookReaderHandle = {
  saveNotebook: () => Promise<void>;
};

export const NotebookReader = forwardRef<NotebookReaderHandle, Props>(
  ({ notebook, initialPages, onSaved }, ref) => {
  const [pages, setPages] = useState<Page[]>(() => {
    const existing = initialPages?.length ? initialPages : [];
    if (existing.length === 0) {
      return [{ content: "" }];
    }
    return existing;
  });
  const [activeIndex, setActiveIndex] = useState<number>(-1); // -1 = cover
  const [isSaving, setIsSaving] = useState(false);

  const currentPage = activeIndex >= 0 ? pages[activeIndex] : null;

  function goNext() {
    if (activeIndex < pages.length - 1) {
      setActiveIndex((i) => i + 1);
    }
  }
  function goPrev() {
    if (activeIndex > -1) {
      setActiveIndex((i) => i - 1);
    }
  }

  function addNewPage() {
    setPages((prev) => [...prev, { content: "" }]);
    setActiveIndex(pages.length); // Navigate to the new page
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        goNext();
      }
      if (e.key === "ArrowLeft") {
        goPrev();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeIndex, pages.length]);

  async function handleSaveNotebook() {
    setIsSaving(true);
    try {
      for (const p of pages) {
        if (p.noteId) {
          await updatePage(p.noteId, p.content);
        } else if (p.content.trim()) {
          const created = await createPage(notebook.notebookId, p.content);
          if (created.success && created.data) {
            p.noteId = created.data.noteId;
          }
        }
      }
      onSaved?.();
    } finally {
      setIsSaving(false);
    }
  }

  useImperativeHandle(ref, () => ({
    saveNotebook: handleSaveNotebook,
  }));

  const pageNumberLabel = useMemo(() => {
    if (activeIndex < 0) return "Cover";
    return `Page ${activeIndex + 1} of ${pages.length}`;
  }, [activeIndex, pages.length]);

  const canGoNext = activeIndex < pages.length - 1;
  const canGoPrev = activeIndex > -1;

  return (
    <div className="space-y-4">
      <div
        className="relative overflow-hidden rounded-xl border border-black/5"
        style={{ boxShadow: "18px 20px 30px -14px rgba(0,0,0,0.45)" }}
      >
        {activeIndex < 0 ? (
          <div
            className="relative aspect-[667/884] w-full"
            style={{
              backgroundImage: "url('/backgrounds/notebook.png')",
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-white/10" />
            <div className="relative h-full w-full flex flex-col justify-center items-center text-center px-8 translate-x-6 md:translate-x-10">
              <div className="space-y-2 max-w-xl">
                <h1 className="text-3xl font-bold">{notebook.title}</h1>
                <p className="text-muted-foreground">
                  {notebook.courseName || "No course specified"} • {notebook.visibility || "Private"}
                </p>
              </div>
              <div className="mt-6 w-full max-w-xl">
                <ShareNotebookDialog notebookId={notebook.notebookId} />
              </div>
            </div>
            <button
              aria-label="Next page"
              className="absolute top-1/2 -translate-y-1/2 right-3 h-12 w-12 rounded-full bg-white/60 hover:bg-white/80 flex items-center justify-center shadow-sm focus:outline-none"
              onClick={goNext}
            >
              <ArrowRight className="size-5 text-muted-foreground" />
            </button>
          </div>
        ) : (
          <div
            className="relative aspect-[667/884] w-full"
            style={{
              backgroundImage: "url('/backgrounds/paper.png')",
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              boxShadow: "18px 20px 30px -14px rgba(0,0,0,0.45)",
            }}
          >
            <div className="absolute inset-0 flex flex-col">
              <div className="flex-1 p-6">
                <textarea
                  className="h-full w-full bg-transparent resize-none border-0 focus-visible:outline-none focus-visible:ring-0 text-base leading-relaxed"
                  placeholder="Write your notes..."
                  value={currentPage?.content ?? ""}
                  onChange={(e) => {
                    const next = [...pages];
                    next[activeIndex] = {
                      ...next[activeIndex],
                      content: e.target.value,
                    };
                    setPages(next);
                  }}
                />
              </div>
              <div className="absolute bottom-3 right-4 text-sm text-muted-foreground bg-white/80 rounded px-2 py-1">
                {pageNumberLabel}
              </div>
              {canGoPrev && (
                <button
                  aria-label="Previous page"
                  className="absolute top-1/2 -translate-y-1/2 left-3 h-12 w-12 rounded-full bg-white/70 hover:bg-white/90 flex items-center justify-center shadow-sm focus:outline-none"
                  onClick={goPrev}
                >
                  <ArrowLeft className="size-5 text-muted-foreground" />
                </button>
              )}
              {canGoNext ? (
                <button
                  aria-label="Next page"
                  className="absolute top-1/2 -translate-y-1/2 right-3 h-12 w-12 rounded-full bg-white/70 hover:bg-white/90 flex items-center justify-center shadow-sm focus:outline-none"
                  onClick={goNext}
                >
                  <ArrowRight className="size-5 text-muted-foreground" />
                </button>
              ) : (
                <button
                  aria-label="Add new page"
                  className="absolute top-1/2 -translate-y-1/2 right-3 h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md focus:outline-none"
                  onClick={addNewPage}
                >
                  <Plus className="size-5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Page Controls */}
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={goPrev}
          disabled={!canGoPrev}
        >
          <ArrowLeft className="size-4 mr-2" />
          Previous
        </Button>
        <span className="text-sm text-muted-foreground px-4">
          {activeIndex < 0 ? "Cover" : `Page ${activeIndex + 1} of ${pages.length}`}
        </span>
        {canGoNext ? (
          <Button
            variant="outline"
            size="sm"
            onClick={goNext}
          >
            Next
            <ArrowRight className="size-4 ml-2" />
          </Button>
        ) : (
          <Button
            variant="default"
            size="sm"
            onClick={addNewPage}
          >
            <Plus className="size-4 mr-2" />
            Add Page
          </Button>
        )}
      </div>
    </div>
  );
});

NotebookReader.displayName = "NotebookReader";