"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, Plus, Save, X } from "lucide-react";
import { getMessages, sendMessage, ChatMessage } from "@/actions/chat";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Props = {
  notebookId: number;
};

export function ChatPanel({ notebookId }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [composerOpen, setComposerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const rotationsRef = useRef<Map<number, number>>(new Map());

  const formatTime = (value: string) => {
    const date = new Date(value);
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  async function load() {
    const list = await getMessages(notebookId);
    setMessages(Array.isArray(list) ? list : []);
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 2500);
    return () => clearInterval(id);
  }, [notebookId]);

  async function handleSend(payload?: string) {
    setError(null);
    const body = (payload ?? text).trim();
    if (!body) {
      setError("Message is required");
      return;
    }
    setIsSending(true);
    const result = await sendMessage(notebookId, body);
    if (!result.success) {
      setError(result.error);
      setIsSending(false);
      return;
    }
    setText("");
    setComposerOpen(false);
    await load();
    setIsSending(false);
  }

  function handleDelete(id: number) {
    setMessages((prev) => prev.filter((m) => m.messageId !== id));
  }

  return (
    <div className="sticky top-6">
      <Card id="chat" className="border-none shadow-none bg-transparent p-0">
        <CardHeader className="hidden" />
        <CardContent className="space-y-4 p-0">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Pad for add/composer only */}
          <div
            className="p-4 space-y-3"
            style={{
              backgroundImage: "url('/backgrounds/pad.png')",
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              width: "220px",
              height: "220px",
              boxShadow: "14px 16px 26px -14px rgba(0,0,0,0.35)",
            }}
          >
            {!composerOpen && (
              <Button
                variant="ghost"
                className="w-full h-full bg-transparent border-none shadow-none hover:bg-transparent focus-visible:ring-0"
                onClick={() => setComposerOpen(true)}
              >
                <Plus className="mr-2 size-4" />
                Click to add a sticky note
              </Button>
            )}

            {composerOpen && (
              <div
                className="relative p-3"
                style={{
                  backgroundImage: "url('/backgrounds/stickynote.png')",
                  backgroundSize: "cover",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  color: "#3b1d1f",
                  width: "220px",
                  height: "220px",
                  boxShadow: "14px 16px 26px -14px rgba(0,0,0,0.35)",
                }}
              >
                <textarea
                  className="w-full h-full bg-transparent resize-none text-sm placeholder:text-amber-700 focus:outline-none"
                  placeholder="Write your note..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setComposerOpen(false);
                      setText("");
                    }}
                  >
                    <X className="mr-1 size-4" />
                    Cancel
                  </Button>
                  <Button size="sm" onClick={() => handleSend()} disabled={isSending}>
                    <Save className="mr-1 size-4" />
                    Save
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Notes below the pad */}
          <div className="flex flex-wrap gap-3 ml-4">
            {messages.map((m) => (
              <div
                key={m.messageId}
                className="relative px-4 py-3 text-sm group"
                style={{
                  width: "220px",
                  height: "220px",
                  backgroundImage: "url('/backgrounds/stickynote.png')",
                  backgroundSize: "cover",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  color: "#3b1d1f",
                  boxShadow: "14px 16px 26px -14px rgba(0,0,0,0.35)",
                  transform: `rotate(${(() => {
                    const existing = rotationsRef.current.get(m.messageId);
                    if (existing !== undefined) return existing;
                    const r = (Math.random() * 30 - 15).toFixed(2);
                    const val = Number(r);
                    rotationsRef.current.set(m.messageId, val);
                    return val;
                  })()}deg)`,
                }}
              >
                <button
                  type="button"
                  onClick={() => handleDelete(m.messageId)}
                  className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition text-amber-900 hover:text-red-600"
                  aria-label="Delete sticky note"
                >
                  ×
                </button>
                <div className="font-semibold text-amber-900 drop-shadow-sm">
                  {m.userName || m.userId}
                </div>
                <div className="text-amber-950 whitespace-pre-wrap drop-shadow-sm">
                  {m.messageText}
                </div>
                <div className="text-xs text-amber-800 mt-1 drop-shadow-sm">
                  {formatTime(m.timestamp)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

