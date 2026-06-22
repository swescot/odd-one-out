import type { QuestionCard } from "./types";

// Each card binds a Question (seen by normal players) to an OOO prompt (seen by
// the odd one out) and a strictly-enforced Syntax Type. The OOO prompt always
// produces an answer of the same syntax as the real question, so the odd one
// out blends in by format and only the *content* can give them away.
export const QUESTIONS: QuestionCard[] = [
  {
    id: "fight-6yos",
    question: "How many 6-year-olds could you beat in a fight?",
    oooPrompt: "Pick a whole number between 10 and 40.",
    syntax: { kind: "integer", min: 0, max: 100 },
  },
  {
    id: "potluck",
    question: "What's the absolute worst item to bring to a neighbourhood potluck?",
    oooPrompt: "Name an object you'd find in a standard office desk.",
    syntax: { kind: "phrase", maxLen: 40 },
  },
  {
    id: "milkshake",
    question: "What would make a surprisingly good milkshake flavour?",
    oooPrompt: "Name a food item.",
    syntax: { kind: "phrase", maxLen: 40 },
  },
  {
    id: "superpower",
    question: "What's the most overrated superpower?",
    oooPrompt: "Name an ability a person could have.",
    syntax: { kind: "phrase", maxLen: 40 },
  },
  {
    id: "age-trust",
    question: "What's the oldest age at which it's still acceptable to have a bunk bed?",
    oooPrompt: "Pick a whole number between 8 and 30.",
    syntax: { kind: "integer", min: 0, max: 100 },
  },
  {
    id: "pet",
    question: "What unusual animal would make a surprisingly good pet?",
    oooPrompt: "Name an animal.",
    syntax: { kind: "word" },
  },
  {
    id: "pizza",
    question: "What's a pizza topping that should be illegal?",
    oooPrompt: "Name a food ingredient.",
    syntax: { kind: "phrase", maxLen: 40 },
  },
  {
    id: "holiday",
    question: "Where would you least want to be stuck for a week?",
    oooPrompt: "Name a country or city.",
    syntax: { kind: "phrase", maxLen: 40 },
  },
  {
    id: "minutes-late",
    question: "How many minutes late can a friend be before it's genuinely rude?",
    oooPrompt: "Pick a whole number between 5 and 45.",
    syntax: { kind: "integer", min: 0, max: 120 },
  },
  {
    id: "talent",
    question: "What pointless talent are you secretly proud of?",
    oooPrompt: "Name something a person can do.",
    syntax: { kind: "phrase", maxLen: 40 },
  },
];
