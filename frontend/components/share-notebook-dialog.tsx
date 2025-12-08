"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Share2, Trash } from "lucide-react";
import {
  addCollaborator,
  Collaborator,
  getCollaborators,
  removeCollaborator,
} from "@/actions/notebooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Props = {
  notebookId: number;
};

export function ShareNotebookDialog({ notebookId }: Props) {
  const [collabs, setCollabs] = useState<Collaborator[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"Viewer" | "Editor" | "Owner">("Viewer");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function load() {
    const list = await getCollaborators(notebookId);
    setCollabs(list);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd() {
    setError(null);
    if (!email) {
      setError("Email is required");
      return;
    }
    setIsLoading(true);
    const result = await addCollaborator(notebookId, email, role);
    if (!result.success) {
      setError(result.error);
      setIsLoading(false);
      return;
    }
    setEmail("");
    setRole("Viewer");
    await load();
    setIsLoading(false);
  }

  async function handleRemove(userId: number) {
    setError(null);
    setIsLoading(true);
    const result = await removeCollaborator(notebookId, userId);
    if (!result.success) {
      setError(result.error);
      setIsLoading(false);
      return;
    }
    await load();
    setIsLoading(false);
  }

  return (
    <Card className="bg-transparent shadow-none border-none p-0">
      <CardHeader className="px-0 pb-1 pt-0">
        <div className="space-y-0.5">
          <CardTitle className="text-sm font-semibold sr-only">Share Notebook</CardTitle>
          <CardDescription className="text-sm sr-only">
            Add collaborators and set roles.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 px-0 max-w-[22rem] mx-auto text-center">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col gap-2 md:flex-row md:items-center justify-center">
          <Input
            placeholder="Collaborator email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-[18rem]"
          />
          <div className="flex gap-2 justify-center items-center">
            <select
              className="w-24 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={role}
              onChange={(e) => setRole(e.target.value as typeof role)}
            >
              <option value="Viewer">Viewer</option>
              <option value="Editor">Editor</option>
            </select>
            <Button onClick={handleAdd} disabled={isLoading}>
              Add
            </Button>
            <Share2 className="size-5 text-muted-foreground" />
          </div>
        </div>

        <div className="space-y-2">
          {collabs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No collaborators yet.</p>
          ) : (
            collabs.map((c) => (
              <div
                key={c.userId}
                className="flex items-center justify-between rounded-md border p-3"
              >
                <div>
                  <p className="font-medium">{c.name || c.email}</p>
                  <p className="text-sm text-muted-foreground">
                    {c.email} • {c.role}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={isLoading}
                  onClick={() => handleRemove(c.userId)}
                >
                  <Trash className="mr-1 size-4" /> Remove
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

