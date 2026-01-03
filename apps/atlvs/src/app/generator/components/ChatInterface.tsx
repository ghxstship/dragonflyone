"use client";

import { useState, useRef, useEffect } from "react";
import {
  Stack,
  Box,
  Text,
  Body,
  Button,
  Input,
  Card,
  Form,
} from "@ghxstship/ui";
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react";
import type { ChatMessage } from "../types";

// =============================================================================
// AI CHAT INTERFACE COMPONENT
// Conversational interface for the Experience Generator
// UI/UX Best Practices:
// - Messages aligned by role (user right, assistant left)
// - Typing indicators for AI responses
// - Auto-scroll to latest message
// - Persistent input at bottom
// - Clear visual hierarchy with avatars
// - Markdown-like formatting in messages
// =============================================================================

interface ChatInterfaceProps {
  messages: ChatMessage[];
  isTyping: boolean;
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

function formatMessageContent(content: string): React.ReactNode {
  // Simple markdown-like formatting
  const lines = content.split("\n");
  
  return lines.map((line, lineIndex) => {
    // Handle bullet points
    if (line.startsWith("• ")) {
      const bulletContent = line.substring(2);
      // Handle bold within bullets
      const parts = bulletContent.split(/\*\*(.*?)\*\*/g);
      return (
        <Box key={lineIndex} className="flex items-start gap-2 py-0.5">
          <Text className="text-primary">•</Text>
          <Text className="text-body-sm text-inherit">
            {parts.map((part, i) =>
              i % 2 === 1 ? (
                <Text key={i} as="span" className="font-weight-bold">
                  {part}
                </Text>
              ) : (
                part
              )
            )}
          </Text>
        </Box>
      );
    }
    
    // Handle numbered lists
    const numberedMatch = line.match(/^(\d+)\.\s\*\*(.*?)\*\*:?\s*(.*)/);
    if (numberedMatch) {
      return (
        <Box key={lineIndex} className="flex items-start gap-2 py-0.5">
          <Text className="font-mono text-mono-sm text-primary">{numberedMatch[1]}.</Text>
          <Text className="text-body-sm text-inherit">
            <Text as="span" className="font-weight-bold">{numberedMatch[2]}</Text>
            {numberedMatch[3] && `: ${numberedMatch[3]}`}
          </Text>
        </Box>
      );
    }
    
    // Handle bold text in regular lines
    const parts = line.split(/\*\*(.*?)\*\*/g);
    if (parts.length > 1) {
      return (
        <Text key={lineIndex} className="text-body-sm text-inherit py-0.5">
          {parts.map((part, i) =>
            i % 2 === 1 ? (
              <Text key={i} as="span" className="font-weight-bold">
                {part}
              </Text>
            ) : (
              part
            )
          )}
        </Text>
      );
    }
    
    // Empty lines become spacing
    if (!line.trim()) {
      return <Box key={lineIndex} className="h-2" />;
    }
    
    // Regular text
    return (
      <Text key={lineIndex} className="text-body-sm text-inherit py-0.5">
        {line}
      </Text>
    );
  });
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const isStreaming = message.metadata?.isStreaming;
  
  return (
    <Stack
      direction="horizontal"
      gap={3}
      className={`${isUser ? "flex-row-reverse" : ""} animate-slide-up`}
    >
      {/* Avatar */}
      <Box
        className={`flex size-10 shrink-0 items-center justify-center border-2 border-border ${
          isUser ? "bg-primary text-white" : "bg-accent text-text-primary"
        }`}
      >
        {isUser ? <User className="size-5" /> : <Bot className="size-5" />}
      </Box>
      
      {/* Message Content */}
      <Card
        className={`max-w-[80%] border-2 border-border p-4 shadow-sm ${
          isUser
            ? "bg-primary/10 text-text-primary"
            : "bg-white text-text-primary"
        }`}
      >
        {isStreaming && message.content === "..." ? (
          <Box className="flex items-center gap-2">
            <Loader2 className="size-4 animate-spin text-primary" />
            <Text className="text-body-sm text-text-muted">Thinking...</Text>
          </Box>
        ) : (
          <Stack gap={1}>
            {formatMessageContent(message.content)}
          </Stack>
        )}
        
        {/* Timestamp */}
        <Text className="mt-2 font-mono text-mono-xs text-text-disabled">
          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </Text>
      </Card>
    </Stack>
  );
}

function TypingIndicator() {
  return (
    <Box className="flex gap-3 animate-slide-up">
      <Box className="flex size-10 shrink-0 items-center justify-center border-2 border-border bg-accent text-text-primary">
        <Bot className="size-5" />
      </Box>
      <Card className="border-2 border-border bg-white p-4 shadow-sm">
        <Stack direction="horizontal" gap={2} className="items-center">
          <Stack direction="horizontal" gap={1}>
            <Box className="size-2 animate-bounce rounded-avatar bg-muted" />
            <Box className="size-2 animate-bounce rounded-avatar bg-muted delay-150" />
            <Box className="size-2 animate-bounce rounded-avatar bg-muted delay-300" />
          </Stack>
          <Text className="text-body-sm text-text-muted">AI is thinking...</Text>
        </Stack>
      </Card>
    </Box>
  );
}

export function ChatInterface({
  messages,
  isTyping,
  onSendMessage,
  disabled = false,
  placeholder = "Ask a follow-up question...",
}: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !disabled) {
      onSendMessage(inputValue.trim());
      setInputValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <Box className="flex h-full flex-col">
      {/* Messages Area */}
      <Box className="flex-1 overflow-y-auto p-4">
        <Stack gap={4}>
          {messages.length === 0 ? (
            <Box className="flex flex-col items-center justify-center py-12 text-center">
              <Box className="mb-4 flex size-16 items-center justify-center border-2 border-border bg-accent/20">
                <Sparkles className="size-8 text-accent" />
              </Box>
              <Text className="font-display text-h5-md uppercase text-text-primary">
                Experience Generator
              </Text>
              <Body className="mt-2 max-w-sm text-text-muted">
                Enter a creative concept above to generate a complete production blueprint. 
                Then ask follow-up questions to refine your experience.
              </Body>
            </Box>
          ) : (
            messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))
          )}
          
          {isTyping && <TypingIndicator />}
          
          <Box ref={messagesEndRef} />
        </Stack>
      </Box>

      {/* Input Area - Fixed at bottom */}
      <Box className="border-t-2 border-border bg-muted p-4">
        <Form onSubmit={handleSubmit}>
          <Stack direction="horizontal" gap={3}>
            <Input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled || messages.length === 0}
              className="flex-1 border-2 border-border bg-white px-4 py-3 text-body-md shadow-sm placeholder:text-text-disabled focus:shadow-md focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />
            <Button
              type="submit"
              disabled={disabled || !inputValue.trim() || messages.length === 0}
              className="flex items-center justify-center gap-2 border-2 border-border bg-primary px-6 py-3 text-white shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {disabled ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <Send className="size-5" />
              )}
            </Button>
          </Stack>
        </Form>
        
        {messages.length > 0 && (
          <Text className="mt-2 text-center font-mono text-mono-xs text-text-disabled">
            Ask about budget tiers, sensory design, zones, or guest journey
          </Text>
        )}
      </Box>
    </Box>
  );
}

export default ChatInterface;
