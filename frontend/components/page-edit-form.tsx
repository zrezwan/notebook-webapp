"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, Save } from "lucide-react";

import { updatePage } from "@/actions/pages";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const pageEditSchema = z.object({
  content: z.string().min(1, "Content is required"),
});

type PageEditFormValues = z.infer<typeof pageEditSchema>;

type PageEditFormProps = {
  pageId: number;
  initialContent: string;
  onSuccess?: () => void;
};

export function PageEditForm({
  pageId,
  initialContent,
  onSuccess,
}: PageEditFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<PageEditFormValues>({
    resolver: zodResolver(pageEditSchema),
    defaultValues: {
      content: initialContent,
    },
  });

  async function onSubmit(values: PageEditFormValues) {
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    const result = await updatePage(pageId, values.content);

    if (!result.success) {
      setError(result.error);
      setIsLoading(false);
      return;
    }

    setSuccess("Page updated successfully");
    setIsLoading(false);
    onSuccess?.();
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter page content..."
                    className="min-h-[300px] resize-y"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              <Save className="mr-2 size-4" />
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
