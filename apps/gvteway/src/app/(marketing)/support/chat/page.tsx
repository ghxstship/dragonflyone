"use client";

/**
 * Support Chat Page - GVTEWAY - 2026 Landing Page Best Practices
 * Live chat with support team
 * Full-width marketing layout with hero and content sections
 * Bold Contemporary Pop Art Adventure Design System
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, MessageSquare, Phone, Mail, Clock } from "lucide-react";
import {
  MarketingPage, HeroSection, CTABanner, Container,
  Body, Button, Card, Grid, Input, Stack, Box,
  type FeatureItem
} from "@ghxstship/ui";

const SUPPORT_FEATURES: FeatureItem[] = [
  { id: "chat", icon: <MessageSquare className="size-8" />, title: "Live Chat", description: "Get instant help from our support team." },
  { id: "phone", icon: <Phone className="size-8" />, title: "Phone Support", description: "Call us at 1-800-GVTEWAY." },
  { id: "email", icon: <Mail className="size-8" />, title: "Email Support", description: "Send us a message anytime." },
  { id: "hours", icon: <Clock className="size-8" />, title: "24/7 Available", description: "We are here around the clock." },
];

export default function SupportChatPage() {
  const router = useRouter();
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

  return (
    <MarketingPage
      sections={[
        {
          id: "hero",
          background: "gradient",
          pattern: "halftone",
          patternOpacity: 0.05,
          content: (
            <HeroSection
              kicker="Support"
              title="Live Chat"
              description="Chat with our support team in real-time. We are here to help you with any questions."
              primaryCta={{
                label: "Browse FAQ",
                onClick: () => router.push("/help/faq"),
              }}
              secondaryCta={{
                label: "Help Center",
                onClick: () => router.push("/help"),
              }}
              background="gradient"
              pattern="none"
              fullHeight={false}
              align="center"
            />
          ),
        },
        {
          id: "chat",
          background: "ink",
          content: (
            <Container size="2xl" className="py-16">
              <Card className="border-2 border-border rounded-card overflow-hidden">
                <Box className="p-4 border-b border-border bg-surface-elevated">
                  <Stack direction="horizontal" gap={3} className="items-center">
                    <Box className="size-3 rounded-full bg-success animate-pulse" />
                    <Body className="text-white font-weight-bold">Support Agent Online</Body>
                  </Stack>
                </Box>
                <Box className="p-4 h-96 overflow-y-auto">
                  <Stack gap={4}>
                    {messages.map((msg) => (
                      <Box key={msg.id} className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}>
                        <Box className={`max-w-xs p-4 rounded-card ${msg.isUser ? "bg-primary text-white" : "bg-surface-elevated"}`}>
                          <Body size="sm" className={msg.isUser ? "text-white" : "text-on-dark-secondary"}>{msg.text}</Body>
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                </Box>
                <Box className="p-4 border-t border-border bg-surface-elevated">
                  <Box className="flex gap-3">
                    <Input 
                      placeholder="Type your message..." 
                      value={message} 
                      onChange={(e) => setMessage(e.target.value)} 
                      onKeyDown={(e) => e.key === "Enter" && sendMessage()} 
                      className="flex-1" 
                    />
                    <Button variant="solid" icon={<Send className="size-4" />} onClick={sendMessage} disabled={!message.trim()}>Send</Button>
                  </Box>
                </Box>
              </Card>
            </Container>
          ),
        },
        {
          id: "options",
          background: "black",
          content: (
            <Container size="2xl" className="py-20">
              <Stack gap={8}>
                <Stack gap={4} className="text-center items-center">
                  <Body className="text-primary uppercase tracking-kicker font-weight-semibold">Support Options</Body>
                  <Body className="text-white font-weight-bold text-h3-md">Other Ways to Reach Us</Body>
                  <Body className="text-on-dark-muted">Choose the support channel that works best for you</Body>
                </Stack>

                <Grid cols={4} gap={6} className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                  {SUPPORT_FEATURES.map((feature) => (
                    <Card key={feature.id} className="p-6 border-2 border-border rounded-card pop-card text-center">
                      <Box className="p-3 bg-primary/20 rounded-card text-primary w-fit mx-auto mb-4">
                        {feature.icon}
                      </Box>
                      <Body className="text-white font-weight-bold mb-2">{feature.title}</Body>
                      <Body size="sm" className="text-on-dark-muted">{feature.description}</Body>
                    </Card>
                  ))}
                </Grid>
              </Stack>
            </Container>
          ),
        },
        {
          id: "cta",
          background: "primary",
          pattern: "halftone",
          content: (
            <CTABanner
              title="Need More Help?"
              description="Browse our FAQ or help center for more information."
              primaryCta={{
                label: "Browse FAQ",
                onClick: () => router.push("/help/faq"),
              }}
              secondaryCta={{
                label: "Help Center",
                onClick: () => router.push("/help"),
              }}
              background="primary"
            />
          ),
        },
      ]}
    />
  );
}
