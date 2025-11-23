"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/utils/supabase";
import { Send } from "lucide-react";

export default function ChatPage({ params }: any) {
  const chat_id = params.chat_id;
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  async function loadMessages() {
    const res = await fetch("/api/messages/get", {
      method: "POST",
      body: JSON.stringify({ chat_id }),
    });
    const data = await res.json();
    setMessages(data.data || []);
  }

  async function sendMessage() {
    if (!text.trim()) return;

    const payload = {
      chat_id,
      sender_id: "TEMP_USER", // replace with session user_id
      receiver_id: "SELLER_ID",
      message_text: text,
    };

    await fetch("/api/messages/send", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    setText("");
  }

  // On first load
  useEffect(() => {
    loadMessages();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("chat-" + chat_id)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: "chat_id=eq." + chat_id },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen pt-14">

      {/* Fraud Warning */}
      <div className="bg-yellow-200 text-yellow-900 p-3 text-sm font-medium text-center">
        ⚠️ Never send money in advance. Meet in person & verify before payment.
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
        {messages.map((msg, i) => {
          const isMine = msg.sender_id === "TEMP_USER";
          return (
            <div
              key={i}
              className={`max-w-xs p-3 rounded-xl text-sm ${
                isMine
                  ? "ml-auto bg-indigo-600 text-white"
                  : "mr-auto bg-white border"
              }`}
            >
              {msg.message_text}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="p-3 bg-white border-t flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 p-2 border rounded-lg"
          placeholder="Type a message"
        />
        <button
          onClick={sendMessage}
          className="bg-black text-white rounded-lg px-4 flex items-center"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
