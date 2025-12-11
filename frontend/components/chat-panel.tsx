"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, Plus, Save, X, Send, MessageCircle } from "lucide-react";
import { getMessages, sendMessage, deleteMessage, ChatMessage } from "@/actions/chat";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";

type Props = {
  notebookId: number;
};

export function ChatPanel({ notebookId }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [stickyText, setStickyText] = useState("");
  const [chatText, setChatText] = useState("");
  const [composerOpen, setComposerOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [lastViewedTime, setLastViewedTime] = useState<number>(0);
  const rotationsRef = useRef<Map<number, number>>(new Map());
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load last viewed time from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(`chat-viewed-${notebookId}`);
    if (stored) {
      setLastViewedTime(parseInt(stored));
    }
  }, [notebookId]);

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

  useEffect(() => {
    if (chatOpen && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
      
      // Mark messages as viewed when chat is opened
      const now = Date.now();
      setLastViewedTime(now);
      localStorage.setItem(`chat-viewed-${notebookId}`, now.toString());
    }
  }, [messages, chatOpen, notebookId]);

  async function handleSendSticky() {
    setError(null);
    const body = stickyText.trim();
    if (!body) {
      setError("Message is required");
      return;
    }
    setIsSending(true);
    const result = await sendMessage(notebookId, body, "sticky");
    if (!result.success) {
      setError(result.error);
      setIsSending(false);
      return;
    }
    setStickyText("");
    setComposerOpen(false);
    await load();
    setIsSending(false);
  }

  async function handleSendChat() {
    setError(null);
    const body = chatText.trim();
    if (!body) return;
    
    setIsSending(true);
    const result = await sendMessage(notebookId, body, "chat");
    if (!result.success) {
      setError(result.error);
      setIsSending(false);
      return;
    }
    setChatText("");
    await load();
    setIsSending(false);
  }

  function handleChatKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendChat();
    }
  }

  async function handleDelete(id: number) {
    setMessages((prev) => prev.filter((m) => m.messageId !== id));
    const result = await deleteMessage(id);
    if (!result.success) {
      setError(result.error);
      await load();
    }
  }

  // Filter messages by type
  const stickyMessages = messages.filter(m => !m.type || m.type === "sticky");
  const chatMessages = messages.filter(m => m.type === "chat");
  
  // Count unread chat messages (messages after last viewed time)
  const unreadCount = chatMessages.filter(m => {
    const msgTime = new Date(m.timestamp).getTime();
    return msgTime > lastViewedTime;
  }).length;

  // Get current user from first message (you can improve this)
  const currentUserId = messages.find(m => m.userId)?.userId;

  return (
    <div className="relative">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Sticky Notes Section */}
      <Card className="border-none shadow-none bg-transparent p-0 mb-8">
        <CardHeader className="hidden" />
        <CardContent className="space-y-4 p-0">
          {/* Add sticky note pad */}
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
                  value={stickyText}
                  onChange={(e) => setStickyText(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setComposerOpen(false);
                      setStickyText("");
                    }}
                  >
                    <X className="mr-1 size-4" />
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSendSticky} disabled={isSending}>
                    <Save className="mr-1 size-4" />
                    Save
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Display sticky notes */}
          <div className="flex flex-wrap gap-3 ml-4">
            {stickyMessages.map((m) => (
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

      {/* Live Chat Bubble Button */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110 z-40"
        >
          <MessageCircle className="size-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-6 h-6 flex items-center justify-center rounded-full font-bold">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Live Chat Box */}
      {chatOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-lg shadow-2xl flex flex-col z-50">
          {/* Chat Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center gap-2">
              <MessageCircle className="size-5" />
              <h3 className="font-semibold">Live Chat</h3>
            </div>
            <button
              onClick={() => setChatOpen(false)}
              className="hover:bg-blue-700 p-1 rounded"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {chatMessages.length === 0 && (
              <div className="text-center text-gray-500 mt-8">
                No messages yet. Start the conversation!
              </div>
            )}
            {chatMessages.map((m) => {
              const isCurrentUser = m.userId === currentUserId;
              return (
                <div
                  key={m.messageId}
                  className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-lg p-3 ${
                      isCurrentUser
                        ? "bg-blue-600 text-white"
                        : "bg-white border border-gray-200"
                    }`}
                  >
                    {!isCurrentUser && (
                      <div className="font-semibold text-sm text-gray-700 mb-1">
                        {m.userName || `User ${m.userId}`}
                      </div>
                    )}
                    <div className="text-sm whitespace-pre-wrap">
                      {m.messageText}
                    </div>
                    <div
                      className={`text-xs mt-1 ${
                        isCurrentUser ? "text-blue-100" : "text-gray-500"
                      }`}
                    >
                      {formatTime(m.timestamp)}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
                onKeyDown={handleChatKeyDown}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button
                onClick={handleSendChat}
                disabled={!chatText.trim() || isSending}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
              >
                <Send className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}