"use client";

import { useState } from "react";
import { Send, List } from "lucide-react";
import { Body, Button, Card, Input, DetailPage, Section } from "@ghxstship/ui";

export default function SupportChatPage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<{ id: string; text: string; isUser: boolean }[]>([
    { id: "1", text: "Hi! How can I help you today?", isUser: false },
  ]);

  const sendMessage = () => {
    if (!message.trim()) return;
    setMessages((prev) => [...prev, { id: Date.now().toString(), text: message, isUser: true }]);
    setMessage("");
    setTimeout(() => {
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), text: "Thanks for your message! A support agent will respond shortly.", isUser: false }]);
    }, 1000);
  };

  const tabs = [{
    id: "chat", label: "Chat", icon: <List className="size-4" />,
    content: (
      <Section>
        <Card className="p-4 h-96 overflow-y-auto mb-4">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-xs p-3 rounded-lg ${msg.isUser ? "bg-primary text-white" : "bg-grey-800"}`}>
                  <Body size="sm">{msg.text}</Body>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <div className="flex gap-2">
          <Input placeholder="Type your message..." value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} className="flex-1" />
          <Button variant="solid" icon={<Send className="size-4" />} onClick={sendMessage} disabled={!message.trim()}>Send</Button>
        </div>
      </Section>
    ),
  }];

  return <DetailPage header={{ kicker: "Support", title: "Live Chat", description: "Chat with our support team" }} backButton={{ label: "Help", href: "/help" }} tabs={tabs} />;
}
