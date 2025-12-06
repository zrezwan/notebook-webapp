"use client";

import { useState } from "react";
import { ArrowLeft, Save, Trash2, FileText, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function DemoPage() {
  const [content, setContent] = useState(
    "# Welcome to My Notes\n\nThis is a sample page content that can be edited.\n\n## Features\n- Edit page content\n- Delete pages with confirmation\n- View all pages in a notebook"
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const mockPages = [
    {
      noteId: 1,
      content: "Introduction to Algorithms - Chapter 1 notes...",
      updatedAt: "2024-01-15T10:30:00Z",
    },
    {
      noteId: 2,
      content: "Data Structures overview and examples...",
      updatedAt: "2024-01-14T14:20:00Z",
    },
    {
      noteId: 3,
      content: "Graph algorithms: BFS, DFS, and shortest paths...",
      updatedAt: "2024-01-13T09:15:00Z",
    },
  ];

  return (
    <div className="min-h-screen p-4 md:p-8 bg-background">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Page Edit/Delete Demo</h1>
          <p className="text-muted-foreground">
            This page demonstrates the UI components for editing and deleting
            pages.
          </p>
        </div>

        {/* Page Edit Section */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Edit Page</h2>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Edit Page</CardTitle>
                  <CardDescription>
                    Last updated: {new Date().toLocaleString()}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="mr-2 size-4" />
                    Back
                  </Button>
                  <AlertDialog
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                  >
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="mr-2 size-4" />
                        Delete Page
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete this page and all its content.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Content</label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter page content..."
                  className="min-h-[200px] resize-y"
                />
              </div>
              <div className="flex justify-end">
                <Button>
                  <Save className="mr-2 size-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Page List Section */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Pages in Notebook</h2>
          <div className="space-y-4">
            {mockPages.map((page) => (
              <Card key={page.noteId}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base flex items-center gap-2">
                        <FileText className="size-4" />
                        Page {page.noteId}
                      </CardTitle>
                      <CardDescription>
                        Updated:{" "}
                        {new Date(page.updatedAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                      <Pencil className="mr-2 size-3" />
                      Edit
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {page.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Empty State */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Empty State</h2>
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-8">
              <FileText className="size-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                No pages in this notebook yet.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
