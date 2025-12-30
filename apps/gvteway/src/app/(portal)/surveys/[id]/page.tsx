"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle, List } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Body, Button, Card, Textarea, DetailPage, Section } from "@ghxstship/ui";

interface Question { id: string; text: string; type: "rating" | "text"; }
interface Survey { id: string; title: string; description: string; questions: Question[]; }
const DEMO: Survey = { id: "1", title: "Event Feedback", description: "Help us improve", questions: [{ id: "1", text: "How would you rate the event?", type: "rating" }, { id: "2", text: "Any suggestions?", type: "text" }] };

export default function SurveyPage() {
  const params = useParams();
  const router = useRouter();
  const surveyId = params.id as string;
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [submitted, setSubmitted] = useState(false);

  const { data: survey = DEMO, isLoading, error, refetch } = useQuery({
    queryKey: ["survey", surveyId],
    queryFn: async () => { const r = await fetch(`/api/surveys/${surveyId}`); if (!r.ok) return DEMO; return (await r.json()).survey || DEMO; },
  });

  const submitSurvey = useMutation({
    mutationFn: async (data: Record<string, string | number>) => {
      const r = await fetch(`/api/surveys/${surveyId}/submit`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ answers: data }) });
      if (!r.ok) throw new Error("Failed to submit");
      return r.json();
    },
    onSuccess: () => setSubmitted(true),
  });

  const tabs = [{
    id: "survey", label: "Survey", icon: <List className="size-4" />,
    content: (
      <Section>
        {submitted ? (
          <Card className="p-8 text-center">
            <CheckCircle className="size-16 text-success mx-auto mb-4" />
            <Body className="font-weight-bold mb-2">Thank You!</Body>
            <Body className="text-on-dark-muted mb-4">Your feedback has been submitted</Body>
            <Button variant="solid" onClick={() => router.push("/")}>Back to Home</Button>
          </Card>
        ) : (
          <>
            <Card className="p-6 mb-6"><Body className="text-on-dark-secondary">{survey.description}</Body></Card>
            <div className="space-y-6">
              {survey.questions.map((q: Question, idx: number) => (
                <Card key={q.id} className="p-6">
                  <Body className="font-weight-bold mb-4">{idx + 1}. {q.text}</Body>
                  {q.type === "rating" ? (
                    <div className="flex gap-2">{[1, 2, 3, 4, 5].map((n) => <Button key={n} variant={answers[q.id] === n ? "solid" : "outline"} onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: n }))}>{n}</Button>)}</div>
                  ) : (
                    <Textarea rows={3} placeholder="Your answer..." value={(answers[q.id] as string) || ""} onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))} />
                  )}
                </Card>
              ))}
            </div>
            <Button variant="solid" className="w-full mt-6" onClick={() => submitSurvey.mutate(answers)} disabled={submitSurvey.isPending}>{submitSurvey.isPending ? "Submitting..." : "Submit Survey"}</Button>
          </>
        )}
      </Section>
    ),
  }];

  return <DetailPage header={{ kicker: "Feedback", title: survey.title, description: survey.description }} loading={isLoading} error={error instanceof Error ? error : null} onRetry={refetch} tabs={tabs} />;
}
