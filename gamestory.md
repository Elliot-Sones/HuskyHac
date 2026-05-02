# Backstory
You are a traveler preparing for your first trip abroad. 
Instead of learning through textbooks, you play a game: **Working Title**

A virtual training system inspired by historical cultural interpreters who guided outsiders through unfamiliar lands.

Inside the simulation: 
- You are still a tourist
- But you are training to become a Modern Dragoman
- Every interaction teaches:
  - Language
  - Social Norms

---

# Player Identity

- Role: Tourist
- HIdden Role: Apprentice Dragoman
- Goal: Navigate a foreign country
- Progression:
  - Apprentice Interpreater -> Field Navigator -> Cultural Mediator -> Grand Dragoman

---

# Game Structure (Locations)
1. Airport (Arrival)
2. Taxi/Transit
3. Tourist Attraction
4. Cafe

---

# Core game loop
## pseudocode
```bash
FOR each location: 
   Present scenario
   Introduce NPC
   Give Player intent (goal)
   Offer dialouge choices (player translates them to talk with NPC)
   NPC responds (translated + original)
   Player interprets meaning
   Reward XP based on: 
    - Accuracy
    - Confidence
END
```

--- 

# Full Story Script (Detailed)
## Stage 1: Airport - "Arrival into the Unknown"
### Scene Setup
- You land in a foreign country
- Signs are unfamiliar
- Announcements are in another lanugae

### Objective
**Find**: 
- Immigration
- Baggage claim

### NPC #1: Airport Staff: 
**Trigger**: You approach a help desk
**Game Prompt**: 
“You need to ask where immigration is.”

**Player Options**:

- “Where is immigration?”
- “Passport control?”
- Gesture + broken phrase
- Stay silent (fail path)

**NPC Response (Dual Layer)**
- Original lanuage audio/text
- Translated subtitle

Example: 
NPC: (foreign language)
Translation:  “Go straight, then left after the signs.”

**Learning Mechanic**
- Player must interpret direction correctly
- Mini-task: Follow signs based on instructions

**XP Outcome**
- +Accuracy: correct understanding
- +Confidence: no hesitation

---

## Stage 2: TAXI - "Negotiation & Trust"
### Scene setup 
- You exit airport
- Taxi drivers approach you

### Objective 
Get to hotel 

### NPC 2: Taxi Driver

## Interaction
**Game Prompt:**
"Tell the driver where you want to go"

## Mechanics
- Player Must:
  - Show address
  - Say destination
  - Confirm price

## Branching Paths
**Good path:**
- Confirm fare
- Uses polite tone

**Bad path:**
- Gets overcharged
- Misunderstands location

## Cultural layer
- Some countries expect negotiation
- Others use meters

## XP Rewards
- +Negotiation Skill
- +Listening comprehension

---

## Stage 3: Hotel - "Social Politness"
### Scene setup: 
- You enter hotel lobby

### Objective
Check in + ask questions

### NPC #3: Concierge/Receptionist

### Interaction Flow
**Tasks:**
1. Confirm reservation
2. Ask for Wi-Fi
3. Ask about local spots

### Hidden Mechanic
**Tone matters:**
- Too direct -> rude
- Too vague -> confusing

### Twist
Receptionist asks YOU a question: 
"Do you prefer a room with a view"
Now You understand and respond

### XP
- +Conversation flow
- +Confidence in back-and-forth dialouge

---

## Stage 4: Tourist Spot - "Real World Chaos"
### Scene Setup
- Busy attraction
- Crowds, noise, distractions

### Objective
- Buy ticket
- Ask for directions inside
- Understand rules

### NPC #4: 
- Ticket seller
- Security guard
- Another tourist

### Interaction Types
- Fast-paced speech
- Partial understanding
- Multiple speakers

### Twist
**This area is closed**
Player must decide :
- ignore
- confirm
- change plan

### XP
- +Situation awareness
- +Listening under pressure

---

## Stage 5: Cafe - ""Fluenct Test
### Scene Setup
- relaxed environment
- Non prompts (final test)

### Objective
Order food + handle unexpected conversation 

### NPC #5: Barista
### Interaction
You must: 
- Order correctly
- Respond to follow-up:
    - “For here or takeaway?”
    - “Anything else?”
 
### Final Twist
Barista makes small talk
“Where are you visiting from?”

Now it's not survival–it's connection

### Final XP 
- +Fluency
- +Confidence
- +Cultural comfort
  
---

## Leveling System (Dragoman Path)
Level 1: Apprentice Interpreter
    - Can ask basic questions

Level 2: Path Navigator
    - Can understand directions

Level 3: Cultural Mediator
    - Handles conversations

Level 4: Social Adapter
    - Understands tone + nuance

Level 5: Grand Dragoman
    - Fully independent traveler

---

## Flowchart (Core Gameloop)
```bash
[Start Simulation]
        ↓
[Airport Arrival]
        ↓
[Talk to Airport Staff]
        ↓
[Interpret Directions]
        ↓
[Success?] → No → Retry / Hint
        ↓ Yes
[Exit Airport]
        ↓
[Taxi Interaction]
        ↓
[Negotiate / Confirm Route]
        ↓
[Arrive at Hotel]
        ↓
[Hotel Conversation]
        ↓
[Understand Questions?]
        ↓
[Visit Tourist Spot]
        ↓
[Multi-NPC Interactions]
        ↓
[Handle Unexpected Info]
        ↓
[Go to Café]
        ↓
[Free-form Conversation]
        ↓
[Final Evaluation]
        ↓
[XP + Rank Up]
        ↓
[End Simulation]
```

