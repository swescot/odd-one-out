# GAME MODES

The core design philosophy of *Odd One Out* relies on **Information Asymmetry**. Across all modes, the fundamental tension remains the same: *The majority knows the context and is trying to sound specific; the minority lacks the context and is trying to sound plausible.*

The game currently features two primary game modes, designed to exercise opposite sides of the players' social-deduction skills.

---

## MODE 1: CLASSIC ("ODD ONE OUT")

### 1. Concept & Vibe
A game of **absurdist justification**. The humor derives from watching a player accidentally submit a completely unhinged answer to a mundane question, and then being forced to look their friends in the eye and defend it using logic.

### 2. The Twist
All players are asked a subjective or bizarre question. One player—the Odd One Out (OOO)—is not shown the question, but is instead given a **Syntax Hint** dictating the *format* of the answer they must submit.

### 3. Step-by-Step Gameplay Loop

* **Step 1: The Input Phase (Max 60 Seconds)**
  * The server generates a Question.
  * Normal players see the Question and a text input field.
  * The OOO sees a specific constraint prompt (e.g., *"Enter a 2-digit number that feels slightly too high"*).
  * All players submit their text strings.

* **Step 2: The Discussion (30 seconds + 30 seconds per player)**
  * This single phase merges the reveal and the open floor. The UI displays the **original question** at the top — including to the OOO, who is seeing it for the first time (they answered knowing only their prompt) — followed by a consolidated list of all submitted answers, **each attributed to the player who wrote it** (e.g., `Sam: 4 · Alex: 12 · Jordan: 45`).
  * Players take turns verbally claiming their answers and motivating their logic.
  * The OOO now knows the real question, but their answer was made blind from a prompt. Their job is to **sell that answer as a genuine, deliberate response to the question** — convincing the table they were in on it all along — while **steering suspicion onto an innocent player**.
  * *UX Note:* Answers are shown with names attached. Knowing who wrote what up front lets the table start interrogating specific players immediately rather than reacting to anonymous data.

* **Step 3: The Vote (45 Seconds)**
  * Every player **except the OOO** casts a private vote on their personal device for the suspected imposter. The OOO does not vote — they sit out and hope they blended in.

* **Step 4: The Resolution**
  * The reveal screen shows the **identity of the OOO**, **everyone's answers** (the OOO's highlighted), and a **tally of votes received** per player (players with no votes are omitted).
  * The running **scoreboard** is then shown on a separate screen before the next round.

### 4. Data Architecture: Questions & OOO Prompts
Every question is authored with a matching **OOO prompt** — the specific instruction the odd one out sees in place of the question. The prompt is tailored to that question rather than a bare type label like "a number" or "a word", so the OOO lands in the right ballpark and can blend in:

| Question | OOO prompt |
| --- | --- |
| "How many 6-year-olds could you defeat in a fight?" | "Pick a number between 0 and 300" |
| "What's a good food to eat while walking?" | "Pick a food" |
| "What song or artist do you want to play at your funeral?" | "Pick a song or artist" |

To additionally prevent game-breaking format mismatches (e.g. a word where everyone else gave a number), each question is bound to an enforced **Syntax Type** that every answer must satisfy — so the OOO's answer can never stand out by its *shape*, only its *content*:

* **`integer { min, max }`** — a whole number within the range (hard-enforced).
* **`word`** — a single word (letters only).
* **`phrase { maxLen }`** — free short text up to a character limit.

### 5. Scoring Math
Designed to reward reading the room (not just guessing the obvious) and to punish drawing suspicion, so non-OOO play stays interesting. Base catch reward is **100 points**.

**Detectives (everyone except the OOO):**

* **Catch reward** — voting for the OOO pays `100 × streak × minority`:
  * **Streak multiplier** — ×1, ×1.5, ×2, … (`1 + 0.5 × consecutive_prior_catches`) for each round in a row you catch the OOO. The streak is *not* broken by being the OOO for a round; it only resets when you vote and miss. Resets each new game.
  * **Minority multiplier** — ×5 if the players who caught the OOO are a **strict minority** of the voters (i.e. most of the table was fooled). This rewards being right when everyone else is wrong.
* **Suspicion penalty** — you lose **100 points for every vote you receive**. If you receive a **majority** of the votes cast, your round score is **0** regardless of anything else. This stops players from farming the minority multiplier by giving deliberately weird answers.

**The Odd One Out:**

* Earns **100 per voter they fooled** (anyone who voted for someone else).
* **×2** if only a **minority** of voters caught them (they evaded the table).

**General:** the two multipliers **stack** (a lone correct catch on a 3-round streak = `100 × 2 × 5 = 1000`). A single round can be a net loss, but **cumulative scores never drop below 0**.

---

## MODE 2: IMPOSTER

### 1. Concept & Vibe
A game of **verbal tightrope walking**. While Classic Mode is *written-then-defended*, Imposter Mode bypasses the keyboard entirely and drops players straight into a live conversation. The humor derives from hyper-paranoia and "double-vague" statements.

### 2. The Twist
The game broadcasts a **Category** to the entire room. It then broadcasts a specific **Secret Word** belonging to that category to everyone *except* the Imposter. The Imposter only knows the umbrella category.

### 3. Step-by-Step Gameplay Loop

* **Step 1: The Briefing**
  * The shared screen displays: **CATEGORY: VEHICLES**.
  * Normal players look at their private screens and see: `[ The word is: SUBMARINE ]`.
  * The Imposter looks at their private screen and sees: `[ You are the Imposter. ]`.

* **Step 2: The Icebreaker (The "Designated Witness")**
  * To prevent the dead, awkward silence that plagues the start of open-floor deduction games, the server randomly flags *one* player's device with a green prompt:
  * `[ YOU SPEAK FIRST: Describe the physical environment where this is used. ]`
  * That player must deliver the opening sentence to kick off the timer.

* **Step 3: Free Interrogation (2–4 Minutes)**
  * Players openly talk. The Innocents are trying to say things specific enough to prove to each other they know the word *Submarine*, but vague enough that the Imposter can't deduce it.
  * The Imposter listens to the adjectives being used, attempts to narrow down the Venn diagram of the category, and offers safe, modular contributions.

* **Step 4: The Vote**
  * Identical to Classic Mode.

* **Step 5: The Resolution**
  * The secret word is broadcast to the main display alongside the Imposter's identity.

### 4. Category Sizing Guidelines (For Content Authors)
When writing databases for Imposter Mode, the scope of a category dictates the exact difficulty of the round. Content should adhere strictly to the **Goldilocks Rule (15–30 distinct entities)**:

* **Unplayable (Too Broad):** *Category: Nouns.* (The Imposter has infinite possibilities; any clue given instantly gives them away or leaves them totally blind).
* **Broken (Too Narrow):** *Category: The Ninja Turtles.* (There are only 4 options. The Imposter has a 25% chance of guessing it purely by accident, and will deduce it by the second word spoken).
* **The Sweet Spot:** *Categories like "Breakfast Foods", "Olympic Sports", "Household Appliances", or "Famous Capital Cities."*

---

## MODE COMPARISON AT A GLANCE

| Feature | Classic Mode | Imposter Mode |
| :--- | :--- | :--- |
| **Primary Skill** | Post-Hoc Improvisation | Active Listening & Probing |
| **Input Phase** | Text String | None (Straight to speech) |
| **The "Tell"** | An absurd data point | An improperly applied verb/adjective |
| **Imposter's Anchor** | A strict formatting rule | A broad topical category |
| **Pacing** | Staccato (Read -> React -> Argue) | Continuous Fluid Tension |
