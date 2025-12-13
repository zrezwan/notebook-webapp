"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, Save } from "lucide-react";

import { createPage } from "@/actions/pages";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";

const schema = z.object({
  content: z.string().min(1, "Content is required"),
});

type CreatePageFormValues = z.infer<typeof schema>;

type Props = {
  notebookId: number;
  onCreated?: () => void;
  formId?: string;
};

export function CreatePageForm({ notebookId, onCreated, formId }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CreatePageFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { content: "" },
  });

  async function onSubmit(values: CreatePageFormValues) {
    setError(null);
    setIsLoading(true);

    const result = await createPage(notebookId, values.content);
    if (!result.success) {
      setError(result.error);
      setIsLoading(false);
      return;
    }

    setSaved("Saved");
    setIsLoading(false);
    onCreated?.();
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form
          id={formId}
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex h-full flex-col space-y-3"
        >
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder="Write your notes..."
                    className="min-h-[520px] h-full w-full bg-transparent resize-none border-0 focus-visible:ring-0 focus-visible:outline-none p-0"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div>{saved || "\u00A0"}</div>
            <Button type="submit" disabled={isLoading}>
              <Save className="mr-2 size-4" />
              {isLoading ? "Saving..." : "Save Page"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

