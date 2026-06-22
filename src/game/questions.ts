import type { QuestionCard } from "./types";

// Each card binds a Question (seen by normal players) to an OOO prompt (seen by
// the odd one out) and a strictly-enforced Syntax Type. The OOO prompt always
// produces an answer of the same syntax as the real question, so the odd one
// out blends in by format and only the *content* can give them away.
export const QUESTIONS: QuestionCard[] = [
  {
    id: "defeat-6yos",
    question: "How many 6 year olds could you defeat in combat?",
    oooPrompt: "Pick a number between 0 and 300.",
    syntax: { kind: "integer", min: 0, max: 300 },
  },
  {
    id: "food-walking",
    question: "What is a food that's good to eat while walking?",
    oooPrompt: "Name a food.",
    syntax: { kind: "phrase", maxLen: 40 },
  },
  {
    id: "fight-mammal",
    question: "If you had to fight a mammal, which one would you fight?",
    oooPrompt: "Name a mammal.",
    syntax: { kind: "phrase", maxLen: 40 },
  },
  {
    id: "litres-water",
    question: "How many litres of water could you drink in a day?",
    oooPrompt: "Pick a number between 0 and 100.",
    syntax: { kind: "integer", min: 0, max: 100 },
  },
  {
    id: "eat-chair",
    question: "How many days would it take you to eat a wooden chair?",
    oooPrompt: "Pick a number between 1 and 100.",
    syntax: { kind: "integer", min: 1, max: 100 },
  },
  {
    id: "funeral-song",
    question: "What's a song or artist you'd like to be played at your funeral?",
    oooPrompt: "Pick a song or artist.",
    syntax: { kind: "phrase", maxLen: 60 },
  },
  {
    id: "ikea-days",
    question:
      "How many consecutive days could you survive trapped inside an IKEA before losing your mind?",
    oooPrompt: "Pick a number between 1 and 300.",
    syntax: { kind: "integer", min: 1, max: 300 },
  },
  {
    id: "name-verb",
    question:
      "If you had to legally change your first name to an English verb, what are you picking?",
    oooPrompt: "Name a verb.",
    syntax: { kind: "phrase", maxLen: 30 },
  },
  {
    id: "bed-pillows",
    question:
      "How many standard bed pillows is it normal for one single adult to sleep with?",
    oooPrompt: "Pick a number between 1 and 30.",
    syntax: { kind: "integer", min: 1, max: 30 },
  },
  {
    id: "scaled-animal",
    question:
      "What animal would be the most terrifying if it were scaled to the size of a human?",
    oooPrompt: "Name an animal.",
    syntax: { kind: "phrase", maxLen: 40 },
  },
  {
    id: "same-jeans",
    question:
      "How many days in a row is it hygienic to wear the exact same pair of jeans without washing them?",
    oooPrompt: "Pick a number between 1 and 100.",
    syntax: { kind: "integer", min: 1, max: 100 },
  },
  {
    id: "ring-walk-song",
    question: "If you were a boxer, what would be your ring walk song?",
    oooPrompt: "Pick a famous song.",
    syntax: { kind: "phrase", maxLen: 60 },
  },
  {
    id: "land-balloon",
    question:
      "On a scale of 1 to 100, how confident are you that you could safely land a hot air balloon?",
    oooPrompt: "Pick a number between 1 and 100.",
    syntax: { kind: "integer", min: 1, max: 100 },
  },
  {
    id: "party-late",
    question:
      "How many minutes past the invite time is the most polite moment to show up to a house party?",
    oooPrompt: "Pick a number of minutes between 0 and 180.",
    syntax: { kind: "integer", min: 0, max: 180 },
  },
  {
    id: "sophisticated-food",
    question:
      "What is a food that nobody actually likes, but everyone pretends to enjoy to look sophisticated?",
    oooPrompt: "Name a food.",
    syntax: { kind: "phrase", maxLen: 40 },
  },
  {
    id: "cereal-liquid",
    question: "What liquid, other than milk, would you eat with your cereal?",
    oooPrompt: "Name a liquid.",
    syntax: { kind: "phrase", maxLen: 40 },
  },
  {
    id: "hide-usb",
    question:
      "If you had to hide a stolen USB drive in a standard kitchen, where is the most secure spot?",
    oooPrompt: "Name a specific spot, appliance, or container inside a kitchen.",
    syntax: { kind: "phrase", maxLen: 60 },
  },
  {
    id: "wedding-gift",
    question: "What is a reasonable budget for a wedding gift?",
    oooPrompt: "Write an amount of money.",
    syntax: { kind: "phrase", maxLen: 30 },
  },
  {
    id: "dislike-emoji",
    question: "What is an emoji you dislike?",
    oooPrompt: "What is an emoji you like?",
    syntax: { kind: "phrase", maxLen: 40 },
  },
  {
    id: "bedtime",
    question: "What is a reasonable time to go to bed?",
    oooPrompt: "Name a time of day.",
    syntax: { kind: "phrase", maxLen: 30 },
  },
  {
    id: "talk-animal",
    question:
      "If you could talk to any one animal species, which species would you pick?",
    oooPrompt: "Name an animal species.",
    syntax: { kind: "phrase", maxLen: 40 },
  },
  {
    id: "snooze-count",
    question: "How many times do you usually press snooze?",
    oooPrompt: "Pick a number between 0 and 20.",
    syntax: { kind: "integer", min: 0, max: 20 },
  },
  {
    id: "worst-smell-flight",
    question: "What would be the worst smell to be trapped with for a long flight?",
    oooPrompt: "Name a smell.",
    syntax: { kind: "phrase", maxLen: 40 },
  },
  {
    id: "useless-superpower",
    question: "What would be a useless superpower?",
    oooPrompt: "Name a superpower.",
    syntax: { kind: "phrase", maxLen: 40 },
  },
  {
    id: "michelin-confident",
    question:
      "On a scale between 0 and 100, how confident are you that you'd be able to cook a 5-star Michelin dinner?",
    oooPrompt: "Pick a number between 0 and 100.",
    syntax: { kind: "integer", min: 0, max: 100 },
  },
  {
    id: "eat-paper",
    question:
      "How many sheets of standard A4 printer paper do you think you could eat before needing an ambulance?",
    oooPrompt: "Pick a number between 1 and 40.",
    syntax: { kind: "integer", min: 1, max: 40 },
  },
  {
    id: "chopsticks-food",
    question: "Name a food that would be difficult to eat with chopsticks.",
    oooPrompt: "Name a food.",
    syntax: { kind: "phrase", maxLen: 40 },
  },
  {
    id: "birthday-theme",
    question:
      "What is the absolute worst possible theme to choose for a 5-year-old's birthday party?",
    oooPrompt: "Name a party theme.",
    syntax: { kind: "phrase", maxLen: 40 },
  },
  {
    id: "zombie-weapon",
    question: "In a zombie apocalypse, what is your weapon of choice?",
    oooPrompt: "Name an everyday item.",
    syntax: { kind: "phrase", maxLen: 40 },
  },
];
