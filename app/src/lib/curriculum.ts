// Static question bank — all curriculum questions bundled with the app.
// No DB seeding needed. To update questions, edit the JSON files and redeploy.
import type { SubjectId } from "./subjects";

import prekKMath from "../../data/questions/curriculum/prek-k/math.json";
import prekKSingapore from "../../data/questions/curriculum/prek-k/singapore_trivia.json";
import grade13Math from "../../data/questions/curriculum/grade-1-3/math.json";
import grade13Singapore from "../../data/questions/curriculum/grade-1-3/singapore_trivia.json";
import grade45Math from "../../data/questions/curriculum/grade-4-5/math.json";
import grade45Singapore from "../../data/questions/curriculum/grade-4-5/singapore_trivia.json";
import adultMath from "../../data/questions/curriculum/adult/math.json";
import adultSingapore from "../../data/questions/curriculum/adult/singapore_trivia.json";

type RawQuestion = { id: string; prompt: string; answer: string; choices: string[] };

type BundledQuestion = {
  id: string;
  subject: SubjectId;
  tier: 1 | 2 | 3 | 4;
  skill: string;
  prompt: string;
  answer: string;
  format: "multiple_choice";
  choices: string[];
};

function bundle(raw: RawQuestion[], subject: SubjectId): BundledQuestion[] {
  return raw.map((q) => ({
    id: q.id,
    subject,
    tier: 1,
    skill: "general",
    prompt: q.prompt,
    answer: q.answer,
    format: "multiple_choice",
    choices: q.choices,
  }));
}

const CURRICULUM: Record<string, BundledQuestion[]> = {
  "preK\u2013K": [
    ...bundle(prekKMath as RawQuestion[], "math"),
    ...bundle(prekKSingapore as RawQuestion[], "singapore_trivia"),
  ],
  "1st\u20133rd Grade": [
    ...bundle(grade13Math as RawQuestion[], "math"),
    ...bundle(grade13Singapore as RawQuestion[], "singapore_trivia"),
  ],
  "4th\u20135th Grade": [
    ...bundle(grade45Math as RawQuestion[], "math"),
    ...bundle(grade45Singapore as RawQuestion[], "singapore_trivia"),
  ],
  "Adult": [
    ...bundle(adultMath as RawQuestion[], "math"),
    ...bundle(adultSingapore as RawQuestion[], "singapore_trivia"),
  ],
};

export function questionsForBank(bankName: string): BundledQuestion[] {
  return CURRICULUM[bankName] ?? [];
}
