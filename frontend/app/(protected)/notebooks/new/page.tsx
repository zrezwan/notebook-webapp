import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateNotebookForm } from "@/components/create-notebook-form";

export default function NewNotebookPage() {
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Create Notebook</h1>
            <p className="text-muted-foreground">
              Title, course, and visibility.
            </p>
          </div>
          <Link href="/notebooks">
            <Button variant="outline">Cancel</Button>
          </Link>
        </div>

        <Card className="relative overflow-hidden">
          <div
            className="absolute inset-0 -z-10 opacity-40"
            style={{
              backgroundImage: "url('/backgrounds/notebook.png')",
              backgroundSize: "100% 100%",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
            }}
          />
          <CardHeader className="relative">
            <CardTitle>Notebook Details</CardTitle>
            <CardDescription>Set a title, course, and visibility.</CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <CreateNotebookForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

