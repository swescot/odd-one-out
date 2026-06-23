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
    syntax: { kind: "phrase", maxLen: 120 },
  },
  {
    id: "fight-mammal",
    question: "If you had to fight a mammal, which one would you fight?",
    oooPrompt: "Name a mammal.",
    syntax: { kind: "phrase", maxLen: 120 },
  },
  {
    id: "litres-water",
    question: "How many liters of water could you drink in a day?",
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
    question:
      "What's a song or artist you'd like to be played at your funeral?",
    oooPrompt: "Pick a song or artist.",
    syntax: { kind: "phrase", maxLen: 180 },
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
    syntax: { kind: "phrase", maxLen: 100 },
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
    syntax: { kind: "phrase", maxLen: 120 },
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
    syntax: { kind: "phrase", maxLen: 180 },
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
    syntax: { kind: "phrase", maxLen: 120 },
  },
  {
    id: "cereal-liquid",
    question: "What liquid, other than milk, would you eat with your cereal?",
    oooPrompt: "Name a liquid.",
    syntax: { kind: "phrase", maxLen: 120 },
  },
  {
    id: "hide-usb",
    question:
      "If you had to hide a stolen USB drive in a standard kitchen, where is the most secure spot?",
    oooPrompt:
      "Name a specific spot, appliance, or container inside a kitchen.",
    syntax: { kind: "phrase", maxLen: 180 },
  },
  {
    id: "wedding-gift",
    question: "What is a reasonable budget for a wedding gift?",
    oooPrompt: "Write an amount of money.",
    syntax: { kind: "phrase", maxLen: 100 },
  },
  {
    id: "dislike-emoji",
    question: "What is an emoji you dislike?",
    oooPrompt: "What is an emoji you like?",
    syntax: { kind: "phrase", maxLen: 120 },
  },
  {
    id: "bedtime",
    question: "What is a reasonable time to go to bed?",
    oooPrompt: "Name a time of day.",
    syntax: { kind: "phrase", maxLen: 100 },
  },
  {
    id: "talk-animal",
    question:
      "If you could talk to any one animal species, which species would you pick?",
    oooPrompt: "Name an animal species.",
    syntax: { kind: "phrase", maxLen: 120 },
  },
  {
    id: "snooze-count",
    question: "How many times do you usually press snooze?",
    oooPrompt: "Pick a number between 0 and 20.",
    syntax: { kind: "integer", min: 0, max: 20 },
  },
  {
    id: "worst-smell-flight",
    question:
      "What would be the worst smell to be trapped with for a long flight?",
    oooPrompt: "Name a smell.",
    syntax: { kind: "phrase", maxLen: 120 },
  },
  {
    id: "useless-superpower",
    question: "What would be a useless superpower?",
    oooPrompt: "Name a superpower.",
    syntax: { kind: "phrase", maxLen: 120 },
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
    syntax: { kind: "phrase", maxLen: 120 },
  },
  {
    id: "birthday-theme",
    question:
      "What is the absolute worst possible theme to choose for a 5-year-old's birthday party?",
    oooPrompt: "Name a party theme.",
    syntax: { kind: "phrase", maxLen: 120 },
  },
  {
    id: "zombie-weapon",
    question: "In a zombie apocalypse, what is your weapon of choice?",
    oooPrompt: "Name an everyday item.",
    syntax: { kind: "phrase", maxLen: 120 },
  },
  {
    id: "say-what-count",
    question:
      "What is the socially correct number of times to say 'What?' before you just nod and laugh?",
    oooPrompt: "Pick a number between 1 and 100.",
    syntax: { kind: "integer", min: 1, max: 100 },
  },
  {
    id: "delete-vegetable",
    question:
      "If you could instantly delete one vegetable from existence, which one goes?",
    oooPrompt: "Name a vegetable.",
    syntax: { kind: "phrase", maxLen: 120 },
  },
  {
    id: "shave-eyebrows-money",
    question:
      "How much money would someone have to pay you to shave your eyebrows off right now?",
    oooPrompt: "Write an amount of money.",
    syntax: { kind: "phrase", maxLen: 100 },
  },
  {
    id: "dangerous-animal-defeat",
    question:
      "What is the most dangerous animal you could defeat in one on one combat?",
    oooPrompt: "Name an animal.",
    syntax: { kind: "phrase", maxLen: 120 },
  },
  {
    id: "pilot-phrase",
    question: "What is a 3-word phrase you don't want to hear your pilot say?",
    oooPrompt: "Write a short 3-word sentence.",
    syntax: { kind: "phrase", maxLen: 150 },
  },
  {
    id: "cereal-dinner-nights",
    question:
      "How many nights per week is it acceptable to eat cereal for dinner?",
    oooPrompt: "Pick a number between 0 and 7.",
    syntax: { kind: "integer", min: 0, max: 7 },
  },
  {
    id: "least-favourite-subject",
    question: "What was your least favorite subject at school?",
    oooPrompt: "Name a subject at school.",
    syntax: { kind: "phrase", maxLen: 120 },
  },
  {
    id: "hated-sound",
    question: "What is a sound you hate?",
    oooPrompt: "Name a common sound.",
    syntax: { kind: "phrase", maxLen: 120 },
  },
  {
    id: "age-old",
    question:
      "At what exact age do you officially cross the line into being old?",
    oooPrompt: "Pick an age between 0 and 100.",
    syntax: { kind: "integer", min: 0, max: 100 },
  },
  {
    id: "bad-dog-name",
    question: "What is a bad name for a dog?",
    oooPrompt: "Write a common first name.",
    syntax: { kind: "phrase", maxLen: 100 },
  },
  {
    id: "reservation-late",
    question:
      "How many minutes late is it acceptable to arrive for a dinner reservation?",
    oooPrompt: "Pick a number between 0 and 60.",
    syntax: { kind: "integer", min: 0, max: 60 },
  },
  {
    id: "unneeded-furniture",
    question: "What is a piece of furniture you don't really need?",
    oooPrompt: "Name a piece of furniture.",
    syntax: { kind: "phrase", maxLen: 120 },
  },
  {
    id: "coffee-tea-limit",
    question:
      "How many cups of tea or coffee can one drink in a day before it becomes weird?",
    oooPrompt: "Pick a number between 1 and 50.",
    syntax: { kind: "integer", min: 1, max: 50 },
  },
  {
    id: "bad-babyshower-gift",
    question: "What is a bad gift to give at a baby shower?",
    oooPrompt: "Name an item.",
    syntax: { kind: "phrase", maxLen: 120 },
  },
  {
    id: "least-favourite-month",
    question: "What is your least favorite month?",
    oooPrompt: "Name a month.",
    syntax: { kind: "phrase", maxLen: 80 },
  },
  {
    id: "miss-wedding-excuse",
    question: "What is a good reason for missing your best friend's wedding?",
    oooPrompt: "Name a minor inconvenience.",
    syntax: { kind: "phrase", maxLen: 180 },
  },
  {
    id: "kids-menu-weird-age",
    question: "At what age does it become weird to order off the kids' menu?",
    oooPrompt: "Pick an age between 0 and 100.",
    syntax: { kind: "integer", min: 0, max: 100 },
  },
  {
    id: "food-terrible-walking",
    question: "What is a food that is terrible to eat while walking?",
    oooPrompt: "Name a food.",
    syntax: { kind: "phrase", maxLen: 120 },
  },
  {
    id: "funeral-banned-song",
    question:
      "What is a song or artist you would not want to be played at your funeral?",
    oooPrompt: "Pick a song or artist.",
    syntax: { kind: "phrase", maxLen: 180 },
  },
  {
    id: "party-early",
    question:
      "How many minutes before the invite time is it acceptable to show up to a house party?",
    oooPrompt: "Pick a number of minutes between 0 and 180.",
    syntax: { kind: "integer", min: 0, max: 180 },
  },
  {
    id: "cheap-food-fivestar",
    question:
      "What is a cheap food that you think could be served at a 5-star restaurant?",
    oooPrompt: "Name a food.",
    syntax: { kind: "phrase", maxLen: 120 },
  },
  {
    id: "obvious-usb-spot",
    question:
      "If you wanted a guest to instantly find a USB drive in your kitchen, what is the most obvious place to leave it?",
    oooPrompt:
      "Name a specific spot, appliance, or container inside a kitchen.",
    syntax: { kind: "phrase", maxLen: 180 },
  },
  {
    id: "saturday-wakeup",
    question: "What is a reasonable time to wake up on a Saturday?",
    oooPrompt: "Name a time of day.",
    syntax: { kind: "phrase", maxLen: 100 },
  },
  {
    id: "liked-smell",
    question: "What is a smell you like?",
    oooPrompt: "Name a smell.",
    syntax: { kind: "phrase", maxLen: 120 },
  },
  {
    id: "chopsticks-easy-food",
    question: "Name a food that would be easy to eat with chopsticks.",
    oooPrompt: "Name a food.",
    syntax: { kind: "phrase", maxLen: 120 },
  },
  {
    id: "kids-birthday-best-theme",
    question:
      "What would be the absolute best theme for a kid's birthday party?",
    oooPrompt: "Name a party theme.",
    syntax: { kind: "phrase", maxLen: 120 },
  },
  {
    id: "keep-one-vegetable",
    question:
      "If you could only eat one vegetable for the rest of your life, which one stays?",
    oooPrompt: "Name a vegetable.",
    syntax: { kind: "phrase", maxLen: 120 },
  },
  {
    id: "favourite-subject",
    question: "What was your favorite subject at school?",
    oooPrompt: "Name a subject at school.",
    syntax: { kind: "phrase", maxLen: 120 },
  },
  {
    id: "loved-sound",
    question: "What is a sound you love?",
    oooPrompt: "Name a common sound.",
    syntax: { kind: "phrase", maxLen: 120 },
  },
  {
    id: "good-dog-name",
    question: "What is a good name for a dog?",
    oooPrompt: "Write a common first name.",
    syntax: { kind: "phrase", maxLen: 100 },
  },
  {
    id: "keep-one-furniture",
    question:
      "If you could only keep one piece of furniture in your house, which one stays?",
    oooPrompt: "Name a piece of furniture.",
    syntax: { kind: "phrase", maxLen: 120 },
  },
  {
    id: "favourite-month",
    question: "What is your favorite month?",
    oooPrompt: "Name a month.",
    syntax: { kind: "phrase", maxLen: 80 },
  },
  {
    id: "gaming-hours-max",
    question:
      "How many consecutive hours at most is it reasonable to play video games?",
    oooPrompt: "Pick a number between 0 and 300.",
    syntax: { kind: "integer", min: 0, max: 300 },
  },
  {
    id: "movietheater-food",
    question: "What is a food you'd bring into a movie theater?",
    oooPrompt: "Name a food.",
    syntax: { kind: "phrase", maxLen: 120 },
  },
  {
    id: "last-meal-food",
    question: "What would be your last meal?",
    oooPrompt: "Name a food.",
    syntax: { kind: "phrase", maxLen: 120 },
  },
  {
    id: "worst-pet-mammal",
    question: "What animal would make the worst pet?",
    oooPrompt: "Name a mammal.",
    syntax: { kind: "phrase", maxLen: 120 },
  },
  {
    id: "rate-driving-skills",
    question: "What would you rate your driving skills 0 to 100?",
    oooPrompt: "Pick a number between 0 and 100.",
    syntax: { kind: "integer", min: 0, max: 100 },
  },
  {
    id: "pushups-lifedepends",
    question:
      "How many pushups do you think you could do right now if your life depended on it?",
    oooPrompt: "Pick a number between 1 and 100.",
    syntax: { kind: "integer", min: 1, max: 100 },
  },
  {
    id: "dinner-guests-max",
    question:
      "What is the maximum number of people you would comfortably invite to dinner at your place?",
    oooPrompt: "Pick a number between 1 and 100.",
    syntax: { kind: "integer", min: 1, max: 100 },
  },
  {
    id: "fries-in-mouth",
    question: "How many french fries could you fit in your mouth?",
    oooPrompt: "Pick a number between 1 and 300.",
    syntax: { kind: "integer", min: 1, max: 300 },
  },
  {
    id: "enjoy-doing-verb",
    question: "What is something you enjoy doing?",
    oooPrompt: "Name a verb.",
    syntax: { kind: "phrase", maxLen: 100 },
  },
  {
    id: "hate-doing-verb",
    question: "What is something you hate doing?",
    oooPrompt: "Name a verb.",
    syntax: { kind: "phrase", maxLen: 100 },
  },
  {
    id: "socks-fiveday-trip",
    question: "How many pairs of socks would you bring on a five day trip?",
    oooPrompt: "Pick a number between 1 and 30.",
    syntax: { kind: "integer", min: 1, max: 30 },
  },
  {
    id: "battle-defender-animal",
    question: "What animal would you want to defend you in battle?",
    oooPrompt: "Name an animal.",
    syntax: { kind: "phrase", maxLen: 120 },
  },
  {
    id: "cafe-squat-limit",
    question:
      "How long is it acceptable to sit at a café after ordering a single cup of coffee?",
    oooPrompt: "Pick a number of minutes between 0 and 180.",
    syntax: { kind: "integer", min: 0, max: 180 },
  },
  {
    id: "shave-head-money",
    question:
      "How much would you need to be paid in cash to completely shave your head right now?",
    oooPrompt: "Write an amount of money.",
    syntax: { kind: "phrase", maxLen: 100 },
  },
  {
    id: "max-pay-average-burger",
    question: "What is the most you'd pay for an average hamburger?",
    oooPrompt: "Write an amount of money.",
    syntax: { kind: "phrase", maxLen: 100 },
  },
  {
    id: "leftover-pizza-time",
    question:
      "What is the best time of day to eat a cold slice of leftover pizza?",
    oooPrompt: "Name a time of day.",
    syntax: { kind: "phrase", maxLen: 100 },
  },
  {
    id: "nuggets-trying-best",
    question:
      "How many chicken nuggets could you eat in one sitting if you were genuinely trying your best?",
    oooPrompt: "Pick a number between 1 and 40.",
    syntax: { kind: "integer", min: 1, max: 40 },
  },
  {
    id: "unlimited-budget-theme",
    question:
      "If you had an unlimited budget to throw a party, what would the theme be?",
    oooPrompt: "Name a party theme.",
    syntax: { kind: "phrase", maxLen: 120 },
  },
  {
    id: "desert-island-item",
    question:
      "If you were stranded on a desert island, what item would you bring?",
    oooPrompt: "Name an everyday item.",
    syntax: { kind: "phrase", maxLen: 120 },
  },
  {
    id: "throwing-vegetable",
    question: "What is a good vegetable for throwing?",
    oooPrompt: "Name a vegetable.",
    syntax: { kind: "phrase", maxLen: 120 },
  },
  {
    id: "cook-dinner-nights",
    question: "How many nights a week do you make dinner yourself?",
    oooPrompt: "Pick a number between 0 and 7.",
    syntax: { kind: "integer", min: 0, max: 7 },
  },
  {
    id: "teach-hs-subject",
    question:
      "If you had to step in and teach a high school class tomorrow, what subject would you be most qualified for?",
    oooPrompt: "Name a subject at school.",
    syntax: { kind: "phrase", maxLen: 120 },
  },
  {
    id: "morning-prep-minutes",
    question: "How many minutes does it take you to get ready in the morning?",
    oooPrompt: "Pick a number between 0 and 60.",
    syntax: { kind: "integer", min: 0, max: 60 },
  },
  {
    id: "awkward-silence-limit",
    question:
      "How many seconds of awkward silence in a conversation until you say something?",
    oooPrompt: "Pick a number between 0 and 60.",
    syntax: { kind: "integer", min: 0, max: 60 },
  },
  {
    id: "wait-five-minutes",
    question:
      "If someone says they'll be five minutes, how many more minutes is it acceptable to wait?",
    oooPrompt: "Pick a number between 0 and 60.",
    syntax: { kind: "integer", min: 0, max: 60 },
  },
  {
    id: "time-travel-1800",
    question:
      "If you were transported back to the year 1800, what item would you bring with you?",
    oooPrompt: "Name an item.",
    syntax: { kind: "phrase", maxLen: 120 },
  },
];
