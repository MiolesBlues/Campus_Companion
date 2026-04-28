# Campus Companion Project Plan

## Project Summary
Build a **Campus Companion** web app for first-year students using **Next.js + TypeScript**, deploy it on **Netlify** with **Git-based CI/CD**, include a **small classical ML feature**, and provide the required **accessibility testing, user testing, documentation, and group presentation**.

**Hard deadline:** 1/5/26 at 17:00  
**Team size:** 5 people  
**Critical risk:** **Do not use generative AI for Component 1 (Design Report).** If you do, the whole group can get **0 for that section**.

---

## 1. Main Strategy

The safest way to complete this well is:

1. **Split work by component and ownership early**
2. **Lock the feature scope today** so nobody wastes time
3. **Keep the design report fully human-written**
4. **Use AI only for Components 2 and 4** and save all prompt logs
5. **Deploy early**, not at the end
6. **Use fictional data only** everywhere
7. **Collect evidence while building**, not after

---

## 2. Recommended App Scope

Choose a scope that is realistic, marks well, and is not too big.

### Recommended feature set
Build these **5 core features**:

1. **Events / timetable page**
2. **Campus locations directory**
3. **Society events page**
4. **Helpdesk ticket form**
5. **Accessibility settings**

### Optional extra if time allows
6. **Lost & found** or **canteen menu**

This is a good choice because:
- it clearly satisfies the minimum feature requirement
- it gives enough data for the ML part
- it is easy to demo in the presentation
- it creates natural user-testing tasks
- it is manageable in a short timeline

---

## 3. Recommended Technical Stack

### Frontend
- **Next.js**
- **TypeScript**
- **App Router**
- **Tailwind CSS** for fast styling

### Backend / data
Use **Supabase** if your team is comfortable with it, because it gives:
- hosted Postgres
- easy table setup
- optional auth
- simple API access

If your group wants something lighter, use:
- local JSON / seed data for most pages
- simple **Netlify Functions** for forms / ML endpoint

### Best recommendation
For speed and fewer moving parts:
- **Next.js + TypeScript + Tailwind**
- **fictional JSON seed data stored in repo**
- **Netlify deployment**
- **Netlify Functions** for the ML feature if needed

This avoids too much setup risk.

---

## 4. Recommended ML Feature

### Best option: Event recommender
Build a small **event recommender** using fictional event data and fictional user interests.

### Why this is the best choice
- easy to explain
- easy to generate fictional data for
- easy to integrate into UI
- clearly more than simple if/else
- easier than forecasting or text clustering under time pressure

### How it can work
Each event gets features such as:
- category
- day of week
- time of day
- indoor/outdoor
- free/paid
- study/social/sports/careers/music/tech tags

Each fictional user profile gets preference values such as:
- likes tech events
- likes sports
- prefers morning events
- prefers free events
- prefers academic events

Then use a simple method like:
- **k-nearest neighbours**, or
- **cosine similarity on feature vectors**

### Output in app
On the events page:
- “Recommended for you”
- “Similar events”

### Evaluation
Show:
- sample train/test logic, or
- similarity quality with a short explanation, or
- basic accuracy for whether a fictional user would click/interact

Keep the explanation simple and human-readable.

---

## 5. Team Roles for 5 People

Each person should have a **primary role** and a **secondary responsibility** so everybody contributes visibly.

## Person 1 — Project Lead / Repo Manager
**Primary responsibilities:**
- create Git repo
- define folder structure
- manage branch naming and merge flow
- keep checklist of deliverables
- ensure commit quality and deadlines
- coordinate final submission package

**Secondary responsibilities:**
- help with README
- collect screenshots and submission evidence
- keep prompt logs organised

**Deliverables owned:**
- repo setup
- branch strategy
- final README
- commit history quality
- final packaging check

---

## Person 2 — UI/UX + Design Report Lead
**Primary responsibilities:**
- lead the **human-only** design report process
- create wireframes/sketches
- define colour palette and layout rules
- coordinate personas, IPO, navigation, and usability decisions

**Secondary responsibilities:**
- support accessibility design choices in app
- gather appendix visuals

**Important rule:**
This person must be very careful that **no generative AI is used for the design report**.

**Deliverables owned:**
- wireframes
- visual consistency plan
- appendix design assets
- design report coordination

---

## Person 3 — Frontend Developer
**Primary responsibilities:**
- build core pages and components in Next.js
- implement navigation, layout, cards, filtering, forms
- connect fictional data to UI

**Secondary responsibilities:**
- help with responsive design
- support accessibility fixes

**Deliverables owned:**
- homepage/dashboard
- events page
- locations page
- societies page

---

## Person 4 — Data + ML Developer
**Primary responsibilities:**
- create fictional datasets
- structure seed files
- build ML recommender logic
- document model features, inputs, outputs, and evaluation

**Secondary responsibilities:**
- help with helpdesk/lost-and-found data models
- help prepare prompt log entries for ML work

**Deliverables owned:**
- fictional data files
- ML feature
- explanation of model
- evaluation evidence

---

## Person 5 — Testing + Deployment Lead
**Primary responsibilities:**
- connect Git repo to Netlify
- verify push-to-deploy works
- manage accessibility testing checklist
- run user testing sessions with at least 3 users
- record findings and fixes

**Secondary responsibilities:**
- gather screenshots for evidence
- support final presentation/demo rehearsal

**Deliverables owned:**
- Netlify deployment
- deployment evidence screenshot
- WCAG checklist
- user testing notes
- before/after fix evidence

---

## 6. Shared Responsibilities for Everyone

Every member must also do the following:
- make commits to the repo
- speak in the Teams presentation
- contribute to planning discussions
- review the app before submission
- avoid real data
- understand the AI rules

---

## 7. Rules You Must Follow

## Rule A — Design Report is human-only
For **Component 1**, do **not** use ChatGPT, Claude, Copilot, Gemini, or any generative AI for:
- writing
- paraphrasing
- structuring
- summarising
- rewording

Allowed:
- formatting tools
- Word styles
- normal spellcheck if it is non-generative

### Safe process for Component 1
- write in Word or Google Docs manually
- turn on tracked changes or version history
- assign sections to people
- keep drafts over time
- attach signed AI declarations

---

## Rule B — AI is allowed for build and ML, but logs are required
For **Components 2 and 4**:
- keep every useful prompt
- keep dates and tool names
- keep short summaries of output
- note what you changed after each prompt

If you use AI and do not log it properly, you weaken your submission evidence.

---

## Rule C — Fictional data only
Do not use:
- real student names
- real private messages
- real ticket submissions
- real attendance records
- real personal details

Use fictional examples only.

---

## 8. Suggested Feature Breakdown

## Core pages
### 1. Home / Dashboard
Show:
- welcome section
- upcoming events
- featured societies
- quick links
- recommended events block

### 2. Events Page
Show:
- fictional event list
- filters by category/date/location
- event detail cards
- recommendation section

### 3. Campus Locations Directory
Show:
- building names
- room info
- services available
- accessibility info per location

### 4. Society Events Page
Show:
- societies
- their upcoming events
- category tags

### 5. Helpdesk Ticket Form
Show:
- issue category
- urgency
- description
- success message

### 6. Accessibility Settings
Include:
- text size toggle
- high contrast mode
- reduced motion toggle
- visible focus states

### Optional 7. Lost & Found or Canteen Menu
Only add if the main features are already stable.

---

## 9. Suggested Data Structure

Use fictional seed data files like:
- `events.json`
- `locations.json`
- `societies.json`
- `helpdesk-categories.json`
- `users-fictional.json`
- `interactions-fictional.json`

### Example entities
#### Events
- id
- title
- description
- category
- date
- time
- location
- cost
- tags
- accessibility_notes

#### Locations
- id
- building_name
- room
- description
- opening_hours
- wheelchair_access
- quiet_space

#### Societies
- id
- name
- theme
- contact_email_fictional
- next_event_id

#### Helpdesk tickets
- id
- category
- urgency
- status
- created_at
- description_fictional

#### Fictional users for ML
- id
- preferred_categories
- preferred_time
- budget_preference
- interaction_history

---

## 10. Work Plan by Day

Because the deadline is very close, your team needs a strict order.

## Day 1 — Today: Planning + setup
**Goal:** lock scope and start immediately.

### Tasks
- agree final feature list
- assign 5 roles
- create Git repo
- create project board/checklist
- create branch naming rules
- choose stack
- create design report document manually
- begin wireframes manually
- start Next.js project scaffold
- create initial fictional data plan

### End-of-day checkpoint
By the end of today you should have:
- agreed scope
- repo created
- initial project running locally
- design report started manually
- people assigned to sections

---

## Day 2 — Build core app
**Goal:** app structure works and core pages exist.

### Tasks
- create layout and navigation
- build home page
- build events page
- build locations page
- build societies page
- add styling system
- commit regularly

### End-of-day checkpoint
You should have:
- a navigable working app
- fictional data rendering on pages
- at least 3–4 meaningful commits

---

## Day 3 — Forms + ML + accessibility base
**Goal:** app becomes assignment-ready.

### Tasks
- build helpdesk form
- add accessibility settings
- implement ML recommender
- document ML features and logic
- improve keyboard navigation
- add labels, headings, focus states, contrast fixes

### End-of-day checkpoint
You should have:
- working ML feature
- at least 4 required features complete
- accessibility basics in place

---

## Day 4 — Deploy + test
**Goal:** submission evidence collection.

### Tasks
- deploy to Netlify
- connect Git to Netlify
- verify push-to-deploy works
- take deployment screenshot
- run accessibility checklist
- run user tests with 3 users on 3 tasks
- log problems and fixes

### End-of-day checkpoint
You should have:
- live URL
- test notes
- screenshots/evidence
- fix list

---

## Day 5 — Final polish + presentation + submission
**Goal:** package everything cleanly.

### Tasks
- fix final UI issues
- clean README
- gather prompt logs into one file
- collect AI declarations for design report
- verify report version history evidence
- rehearse Teams presentation
- record presentation
- final submission review

### End-of-day checkpoint
You should have everything ready before the deadline.

---

## 11. Git Workflow

Use a simple workflow.

### Branches
- `main` = stable version
- feature branches like:
  - `feature/events-page`
  - `feature/locations-page`
  - `feature/ml-recommender`
  - `feature/accessibility-settings`
  - `docs/readme`

### Commit style
Use meaningful commits like:
- `init nextjs app with tailwind and base layout`
- `add fictional events data and events page cards`
- `build campus locations directory with filters`
- `implement helpdesk form validation`
- `add event recommendation logic`
- `improve keyboard focus states and contrast`
- `configure netlify deployment`

Do not do one giant final commit.

---

## 12. Design Report Plan (Human-Only)

The design report should be split across the group, but written manually.

### Suggested section ownership
**Person 2 (lead):**
- overall editing coordination
- wireframes and appendix visuals
- sections 6 and 7

**Person 1:**
- sections 1 and 9

**Person 3:**
- sections 3 and 4

**Person 4:**
- sections 5 and 8

**Person 5:**
- section 2 and contribution to appendix/testing-related notes

### Mandatory headings checklist
1. Project overview and problem statement
2. Target users and user needs (personas)
3. System design: Inputs, Processes, Outputs (IPO)
4. Architecture overview
5. Data design (conceptual)
6. Usability and UI design decisions
7. Accessibility plan
8. Privacy, security, and compliance
9. Deployment plan
10. Appendix

### Important note
You can use this Markdown plan to organise the project, but **do not copy AI-written wording into the design report**.

---

## 13. Prompt Log Process

Create one shared document called something like:
- `prompt-log.docx`
- or `prompt-log.md` then convert later

For every important AI-assisted build step, log:
- date/time
- tool used
- goal
- prompt
- summary of output
- what changed next

### Best practice
Assign one person to check prompt logging every evening.

---

## 14. Accessibility Testing Plan

Use a simple checklist based on WCAG AA.

### Test these areas
- page headings in correct order
- labels for all form inputs
- keyboard navigation works
- visible focus states
- sufficient colour contrast
- buttons and links are clear
- text resizing does not break layout
- reduced motion option works
- error messages are understandable

### Evidence to collect
- checklist file
- issues found
- screenshots before/after
- notes on fixes made

---

## 15. User Testing Plan

You need at least:
- **3 users**
- **3 tasks**

### Recommended tasks
1. Find a society event happening this week
2. Submit a helpdesk ticket for a fictional Wi-Fi issue
3. Find a campus support/service location

### What to record
- user identifier (anonymous is fine)
- task success/failure
- time taken
- confusion points
- quotes or comments
- improvements made afterwards

### Tip
Use classmates/friends quickly, but document properly.

---

## 16. Teams Presentation Plan

All 5 members must speak.

### Suggested speaking order
**Person 1:**
- introduction
- project goal
- overall workflow

**Person 2:**
- target users
- design decisions
- accessibility thinking

**Person 3:**
- app demo of pages and UI

**Person 4:**
- ML feature explanation
- fictional data
- evaluation

**Person 5:**
- deployment
- testing evidence
- conclusion/reflection

### Recommended presentation structure
1. Problem and users
2. Design highlights
3. Live app demo
4. Deployment and CI/CD
5. ML feature
6. Accessibility and user testing
7. Reflection and what you learned

---

## 17. Risk Register

## Risk 1 — AI accidentally used in design report
**Impact:** very high  
**Mitigation:** keep report manual only; assign one person to enforce the rule.

## Risk 2 — Scope too big
**Impact:** high  
**Mitigation:** stick to 5 features max unless everything core is finished.

## Risk 3 — Deployment breaks late
**Impact:** high  
**Mitigation:** deploy early and test every push.

## Risk 4 — Weak evidence for testing
**Impact:** medium/high  
**Mitigation:** collect screenshots, notes, checklist, and changes as you go.

## Risk 5 — Poor commit history
**Impact:** medium  
**Mitigation:** commit small changes frequently; all members commit.

## Risk 6 — ML feature too complex
**Impact:** medium  
**Mitigation:** use a simple recommender with explainable features.

---

## 18. Final Submission Checklist

## Component 1 — Design report
- [ ] DOCX report
- [ ] 1500 words approx
- [ ] all mandatory headings included
- [ ] appendix included
- [ ] signed AI declaration from each student
- [ ] version history evidence included
- [ ] no generative AI used

## Component 2 — AI-assisted app build
- [ ] Git repo URL
- [ ] working Next.js app
- [ ] fictional data files
- [ ] prompt transcripts/logs
- [ ] README with setup instructions

## Component 3 — Deployment
- [ ] live Netlify URL
- [ ] screenshot of Netlify connected to Git repo
- [ ] push-to-deploy confirmed
- [ ] at least 5 meaningful commits

## Component 4 — ML feature
- [ ] classical ML implemented
- [ ] features defined
- [ ] model explained simply
- [ ] evaluation included
- [ ] fictional data documented

## Component 5 — Accessibility and user testing
- [ ] WCAG checklist completed
- [ ] issues + fixes documented
- [ ] before/after screenshots if possible
- [ ] 3 users tested
- [ ] 3 tasks tested
- [ ] improvements recorded

## Component 6 — Teams presentation
- [ ] recorded Teams meeting
- [ ] all 5 members present
- [ ] all 5 members speak
- [ ] demo included
- [ ] testing + ML + deployment discussed

---

## 19. Immediate Next Actions

Do these now in this order:

1. Create a group chat / shared doc just for coordination
2. Assign the 5 roles from this plan
3. Freeze the feature list to 5 core features
4. Create the Git repo
5. Start the design report manually in Word/Google Docs
6. Start the Next.js app scaffold
7. Create fictional seed data files
8. Decide who logs AI prompts
9. Set a deadline tonight for first commits
10. Set a rehearsal time for the Teams presentation

---

## 20. Best Practical Recommendation

If your team wants the highest chance of finishing cleanly, do this:

- build **Events + Locations + Societies + Helpdesk + Accessibility Settings**
- use **fictional JSON data**
- implement a **simple event recommender**
- deploy to **Netlify** by tomorrow, not the last day
- keep the design report fully manual
- collect screenshots and evidence as you go

That gives you a realistic, presentable, mark-friendly project without frying your brains the night before submission.
