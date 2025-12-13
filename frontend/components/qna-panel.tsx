"use client";

import { useEffect, useState } from "react";
import { AlertCircle, MessageSquarePlus, Reply } from "lucide-react";
import { getQuestions, postAnswer, postQuestion, Question } from "@/actions/qna";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Props = {
  pageId: number;
};

export function QnAPanel({ pageId }: Props) {
  const [threads, setThreads] = useState<Question[]>([]);
  const [questionText, setQuestionText] = useState("");
  const [answerText, setAnswerText] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function load() {
    const data = await getQuestions(pageId);
    setThreads(data);
  }

  useEffect(() => {
    load();
  }, [pageId]);

  async function handleAsk() {
    setError(null);
    if (!questionText.trim()) {
      setError("Question text is required");
      return;
    }
    setIsSubmitting(true);
    const result = await postQuestion(pageId, questionText.trim());
    if (!result.success) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }
    setQuestionText("");
    await load();
    setIsSubmitting(false);
  }

  async function handleAnswer(questionId: number) {
    setError(null);
    const text = answerText[questionId]?.trim() || "";
    if (!text) {
      setError("Answer text is required");
      return;
    }
    setIsSubmitting(true);
    const result = await postAnswer(questionId, text);
    if (!result.success) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }
    setAnswerText((prev) => ({ ...prev, [questionId]: "" }));
    await load();
    setIsSubmitting(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Questions & Answers</CardTitle>
        <CardDescription>Ask questions and post answers for this page.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Textarea
            placeholder="Ask a question..."
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
          />
          <Button onClick={handleAsk} disabled={isSubmitting}>
            <MessageSquarePlus className="mr-2 size-4" />
            Ask
          </Button>
        </div>

        <div className="space-y-3 max-h-80 overflow-y-auto">
          {threads.length === 0 ? (
            <p className="text-sm text-muted-foreground">No questions yet.</p>
          ) : (
            threads.map((q) => (
              <div key={q.questionId} className="rounded-md border p-3 space-y-2">
                <div>
                  <p className="font-medium">{q.questionText}</p>
                  <p className="text-xs text-muted-foreground">
                    Asked by {q.userName || q.userId} •{" "}
                    {new Date(q.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="space-y-2 pl-2 border-l">
                  {q.answers && q.answers.length > 0 ? (
                    q.answers.map((a) => (
                      <div key={a.answerId} className="text-sm">
                        <span className="font-medium">{a.userName || a.userId}</span>:{" "}
                        <span>{a.answerText}</span>
                        <div className="text-xs text-muted-foreground">
                          {new Date(a.timestamp).toLocaleString()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">No answers yet.</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Your answer"
                    value={answerText[q.questionId] || ""}
                    onChange={(e) =>
                      setAnswerText((prev) => ({
                        ...prev,
                        [q.questionId]: e.target.value,
                      }))
                    }
                  />
                  <Button
                    variant="outline"
                    onClick={() => handleAnswer(q.questionId)}
                    disabled={isSubmitting}
                  >
                    <Reply className="mr-1 size-4" />
                    Answer
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

