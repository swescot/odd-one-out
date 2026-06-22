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

* **Step 2: The List Reveal (30 Seconds)**
  * The UI displays a consolidated list of all submitted answers, **each attributed to the player who wrote it** (e.g., `Sam: 4 · Alex: 12 · Jordan: 45`).
  * The original **question is revealed at the top of this screen** — including to the OOO, who is seeing it for the first time (they answered knowing only their prompt).
  * *UX Note:* Answers are shown with names attached. Knowing who wrote what up front lets the table start interrogating specific players immediately rather than reacting to anonymous data.

* **Step 3: The Open Floor (2–4 Minutes)**
  * The round timer begins. Players must verbally claim their answers and motivate their logic.
  * The OOO now knows the real question, but their answer was made blind from a prompt. Their job is to **sell that answer as a genuine, deliberate response to the question** — convincing the table they were in on it all along — while **steering suspicion onto an innocent player**.

* **Step 4: The Vote**
  * The timer expires. All players (including the OOO) cast a private vote on their personal device for the suspected imposter.
  * *The Framing Vote:* The OOO's vote carries standard mathematical weight. If the OOO successfully shifts the room's paranoia onto an innocent player, their own vote can act as the final nail in that innocent player's coffin.

* **Step 5: The Resolution**
  * The UI reveals the true question, the identity of the OOO, and the vote breakdown.
  * Points are distributed.

### 4. Data Architecture: The "Syntax Hint"
To prevent game-breaking logic mismatches (e.g., answering "Banana" to a question about a year), every question in the Classic database must be bound to a strictly enforced **Syntax Type**:

    [Database Entry #104]
    Question:    "How many 6-year-olds could you beat in a fight?"
    Syntax_Type: "Integer (0-100)"
    OOO_Prompt:  "Pick a number between 10 and 40."

    [Database Entry #212]
    Question:    "What is the absolute worst item to bring to a neighborhood potluck?"
    Syntax_Type: "Singular Noun (Inanimate)"
    OOO_Prompt:  "Name an object you would find in a standard office desk."

### 5. Scoring Math (The "Jackpot" Model)
* **The Innocents:** Earn **+100 points** for successfully voting for the OOO.
* **The Odd One Out:** Earns **+100 points** for *every single player* that votes for someone else.

*Design Intent:* This creates a high-variance, non-linear scoring curve. If an OOO successfully causes total room fragmentation in an 8-player game, they net +700 points in a single turn, creating massive, celebratory "catch-up" moments.

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
