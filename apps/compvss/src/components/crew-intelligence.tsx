"use client";

import { useMemo, useState } from "react";
import { Badge, Stack, Grid, Input, Button, H3, H4, Body, Label, Article, Link } from "@ghxstship/ui";
import {
  compvssCrewCallSchedule,
  compvssCrewDirectory,
  compvssCrewSkills,
} from "../data/compvss";

const normalize = (value: string) => value.toLowerCase();

export function CrewIntelligence() {
  const [search, setSearch] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());

  const filteredCrew = useMemo(() => {
    const query = normalize(search);
    return compvssCrewDirectory.filter((crew) => {
      const matchesSearch = query
        ? normalize(`${crew.name} ${crew.role} ${crew.location} ${crew.skills.join(" ")}`).includes(query)
        : true;
      const matchesSkills = selectedSkills.size
        ? crew.skills.some((skill) => selectedSkills.has(skill))
        : true;
      return matchesSearch && matchesSkills;
    });
  }, [search, selectedSkills]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) => {
      const next = new Set(prev);
      if (next.has(skill)) {
        next.delete(skill);
      } else {
        next.add(skill);
      }
      return next;
    });
  };

  return (
    <Stack gap={8} id="crew-directory">
      <Grid cols={2} gap={4} className="md:grid-cols-[2fr_1fr]">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search crew, roles, locations"
          className="w-full"
        />
        <Stack direction="horizontal" gap={2} className="flex-wrap text-mono-xs uppercase tracking-kicker text-ink-400">
          {compvssCrewSkills.map((skill) => (
            <Button
              key={skill}
              type="button"
              variant={selectedSkills.has(skill) ? "solid" : "outline"}
              size="sm"
              onClick={() => toggleSkill(skill)}
            >
              {skill}
            </Button>
          ))}
        </Stack>
      </Grid>

      <Grid cols={2} gap={4}>
        {filteredCrew.map((crew) => (
          <Article key={crew.name} variant="bordered" className="p-4">
            <Stack direction="horizontal" className="items-start justify-between gap-3">
              <Stack>
                <Label className="text-body-sm uppercase tracking-kicker text-ink-500">{crew.role}</Label>
                <H4 className="text-h5-md">{crew.name}</H4>
              </Stack>
              <Label className="text-mono-xs uppercase tracking-kicker text-ink-400">{crew.availability}</Label>
            </Stack>
            <Body className="mt-2 text-body-sm text-ink-300">{crew.location}</Body>
            <Link href={`mailto:${crew.contact}`} className="mt-2 inline-flex text-mono-xs uppercase tracking-kicker text-ink-200">
              {crew.contact}
            </Link>
            <Stack direction="horizontal" gap={2} className="mt-3 flex-wrap text-mono-xs uppercase tracking-kicker text-ink-400">
              {crew.skills.map((skill) => (
                <Badge key={`${crew.name}-${skill}`} variant="outline">
                  {skill}
                </Badge>
              ))}
            </Stack>
          </Article>
        ))}
      </Grid>

      <Stack gap={4}>
        <H3 className="text-h6-md uppercase">Upcoming calls</H3>
        <Grid cols={2} gap={4}>
          {compvssCrewCallSchedule.map((call) => (
            <Article key={call.id} variant="bordered" className="p-4">
              <Label className="text-mono-xs uppercase tracking-kicker text-ink-500">{call.department}</Label>
              <H4 className="text-h5-md">{call.location}</H4>
              <Stack direction="horizontal" gap={6} className="mt-2 text-body-sm text-ink-300">
                <Stack>
                  <Label className="text-mono-xs uppercase tracking-kicker text-ink-500">Date</Label>
                  <Body>{call.date}</Body>
                </Stack>
                <Stack>
                  <Label className="text-mono-xs uppercase tracking-kicker text-ink-500">Call</Label>
                  <Body>{call.callTime}</Body>
                </Stack>
              </Stack>
              <Stack gap={1} className="mt-3 text-body-sm text-ink-200">
                {call.crew.map((member) => (
                  <Body key={`${call.id}-${member}`}>• {member}</Body>
                ))}
              </Stack>
            </Article>
          ))}
        </Grid>
      </Stack>
    </Stack>
  );
}
