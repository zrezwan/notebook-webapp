"use client";

import Link from "next/link";
import { Notebook } from "@/actions/notebooks";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type NotebookListProps = {
  notebooks: Notebook[];
};

const formatDate = (value: string) => {
  const date = new Date(value);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
};

export function NotebookList({ notebooks }: NotebookListProps) {
  if (!notebooks || notebooks.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No notebooks yet. Create one to get started.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {notebooks.map((nb) => (
        <Card key={nb.notebookId}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="truncate">{nb.title}</span>
              <span className="text-xs text-muted-foreground">{nb.visibility}</span>
            </CardTitle>
            <CardDescription className="truncate">
              {nb.courseName || "No course specified"}
            </CardDescription>
            <CardDescription className="text-xs">
              Owner: {nb.ownerName || nb.ownerId} • {nb.userRole || ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-between items-center">
            <div className="text-xs text-muted-foreground">
              Updated: {formatDate(nb.updatedAt)}
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href={`/notebooks/${nb.notebookId}`}>Open</Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

