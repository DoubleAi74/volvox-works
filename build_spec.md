# Build Spec Generator Protocol (Rebuild-Oriented)

## Goal

When an AI agent is prompted with "read `build_spec.md` and execute", it must inspect the repository and produce three standalone, production-ready specification documents that can be used to rebuild the application in an empty directory:

1. `PRD.md` (product requirements)
2. `DESIGN.md` (behavior and interface design)
3. `ARCHITECTURE.md` (code-level technical architecture)

These documents are expected to become the editable source of truth for later rebuild work.

## Execution Principles

- Model-agnostic: do not rely on provider-specific hidden tools.
- Analyze first, write second. Do not generate output files until repository review is complete.
- Continue when details are missing by making explicit assumptions.
- Prefer precise, testable statements over narrative summaries.
- Write specs as forward-looking build instructions, not reverse-engineering notes.

## Repository Review Scope

Review all readable files recursively from project root, excluding at minimum:

- `.git/`
- `node_modules/`
- `.next/`
- `dist/`
- `build/`
- `coverage/`
- `.cache/`
- `.turbo/`
- `out/`
- `vendor/`

Exclude lock/bundle artifacts unless they contain uniquely relevant information:

- `package-lock.json`
- `yarn.lock`
- `pnpm-lock.yaml`
- `bun.lockb`
- `Cargo.lock`

Also exclude additional generated/cache directories discovered during analysis.

## Required Workflow

Follow this sequence:

1. **System Census**
   - Identify product domains, user-facing capabilities, core modules, and all major execution pathways.
   - Detect frameworks/languages and runtime patterns.

2. **Completeness Inventory**
   - Build an internal inventory of:
     - User journeys
     - UI routes/views
     - APIs/interfaces
     - Data entities and validation rules
     - External integrations
     - Auth boundaries and role/permission behavior
     - Error/failure states

3. **User Clarification**

   After completing the Completeness Inventory, pause and ask the user questions before writing any spec content. The agent now has enough codebase context to ask precise, useful questions rather than generic ones.

   Ask questions in batches of 3–5. Wait for answers before asking the next batch. Do not proceed to step 4 until all critical topics are resolved.

   **Required topics to cover across batches:**
   - **Product intent and goals** — Does the agent's understanding of what the product does and who it is for match the user's intent? Ask the user to confirm, correct, or expand on the inferred purpose and target users.
   - **Scope decisions** — Are there features currently in the codebase that should be excluded from the specs (e.g. deprecated flows, abandoned experiments)? Are there planned features not yet in the code that should be included?
   - **Tech stack continuity** — Should the specs reflect the current tech stack exactly, or are there changes the user wants to capture (new framework, different database, removed dependency)?
   - **Non-functional requirements** — What are the measurable targets for performance, availability, security, and accessibility? Do not leave these as vague statements — get specific numbers or thresholds where possible.
   - **Known issues and pain points** — Are there known bugs, design problems, or architectural decisions the user wants the specs to explicitly flag or avoid repeating?
   - **Open questions from code analysis** — Raise any specific ambiguities discovered during the Completeness Inventory that cannot be reliably inferred from the codebase alone (e.g. unclear auth rules, undocumented business logic, missing error handling intent).

   Only ask about topics where the answer materially affects spec content. Do not ask about details that can be reliably inferred from the code with high confidence.

   Once all critical topics are resolved, confirm the finalized scope and intent with the user before continuing.

4. **Canonical Requirement Set**
   - Create a normalized requirement list with stable IDs:
     - `REQ-F-###` functional requirements
     - `REQ-NF-###` non-functional requirements
   - Every significant capability must map to at least one requirement ID.
   - Requirement scope must reflect both the codebase analysis and the answers given during User Clarification.

5. **Spec Synthesis**
   - Generate `PRD`, `DESIGN`, and `ARCHITECTURE` from the canonical requirements.
   - Preserve stable IDs across all three files for traceability.

6. **Quality Gate**
   - Validate completeness and cross-document consistency before finalizing files.

## Next.js Coverage Rules (When Next.js Is Detected)

If the project uses Next.js, the generated specs must explicitly cover:

- Routing model (`app/` or `pages/`, dynamic segments, nested routes)
- Layout/loading/error/not-found behaviors
- Server vs client component boundaries
- Rendering/data strategies (SSR/SSG/ISR/static/dynamic/caching/revalidation)
- Route handlers or API routes and request/response behavior
- Server actions (if present)
- Middleware behavior and route protection rules
- Authentication/session flow and authorization checks
- Form handling and validation flows
- State management boundaries (server state/client state/global state)

## Output File Rules

- If `PRD.md`, `DESIGN.md`, or `ARCHITECTURE.md` do not exist, create them with exactly those names.
- If any target exists, do not overwrite. Create versioned files:
  - `PRD_v2.md`, `PRD_v3.md`, ...
  - `DESIGN_v2.md`, `DESIGN_v3.md`, ...
  - `ARCHITECTURE_v2.md`, `ARCHITECTURE_v3.md`, ...
- Version counters are independent per document type.

## Non-Negotiable Content Constraints

For all generated docs:

- No direct code citations (no repository file paths, line numbers, or code snippets copied from source).
- Must be understandable without access to the original repository.
- Must include assumptions and open questions sections.
- Must avoid vague placeholders such as "etc." in requirement statements.
- Must use normative language (`must`, `should`, `may`) for requirements.

## Required Template: PRD

`PRD*.md` must include these top-level sections:

1. Product Overview
2. Problem Statement
3. Target Users and Personas
4. Goals and Non-Goals
5. Feature Catalog (with feature IDs and priorities)
6. Functional Requirements (`REQ-F-###`)
7. Non-Functional Requirements (`REQ-NF-###`, each measurable)
8. User Journey Definitions
9. Acceptance Criteria (testable, scenario-based)
10. Assumptions
11. Open Questions

## Required Template: DESIGN

`DESIGN*.md` must include these top-level sections:

1. System Behavior Overview
2. UI/UX Flow Definitions (or interface flows for non-UI systems)
3. Screen/Route State Matrix (states, triggers, outcomes)
4. Data Model and Validation Rules
5. API/Interface Contracts (inputs, outputs, errors, auth expectations)
6. Business Rules and Domain Logic
7. Error Handling and Recovery Paths
8. Security and Privacy Behaviors
9. Requirement Traceability (`REQ-*` -> design elements)
10. Assumptions
11. Open Questions

## Required Template: ARCHITECTURE

`ARCHITECTURE*.md` must include these top-level sections:

1. Technical Stack Summary
2. Application Structure and Module Boundaries
3. Runtime Architecture and Execution Model
4. Data and Persistence Architecture
5. Authentication and Authorization Architecture (if applicable)
6. External Service Integration Architecture
7. Build and Runtime Dependencies
8. Environment Configuration Contract (required variables and purpose)
9. Testing and Quality Strategy
10. Requirement Traceability (`REQ-*` -> architecture decisions)
11. Assumptions
12. Open Questions

## Assumption Policy

- If a required detail is unknown, infer a plausible default and label it as an assumption.
- Add assumption confidence levels (`High`, `Medium`, `Low`).
- Keep assumptions implementation-usable and specific.

## Rebuild-Readiness Rules

Generated specs must be editable and reusable for rebuilding. To support this:

- Maintain stable requirement IDs across all documents.
- Separate "what" (PRD) from "how it behaves" (DESIGN) and "how it is built" (ARCHITECTURE).
- Ensure a future build agent can implement without inspecting original code.
- Explicitly document unresolved decisions in open questions rather than hiding ambiguity.

## Production-Readiness Quality Gate (Must Pass Before Finish)

Before returning results, verify all checks:

1. Repository review completed with required exclusions.
2. Three new output files were created (base or versioned names).
3. No existing spec file was overwritten.
4. Every major capability maps to at least one `REQ-F-*`.
5. Every `REQ-*` appears in both `DESIGN` and `ARCHITECTURE` traceability sections.
6. Non-functional requirements are measurable and testable.
7. No direct repository citations are present.
8. Assumptions and open questions are present in all three documents.

## Final Agent Response Format

After writing files, return a concise summary containing:

- Files created (and whether versioned names were used)
- Number of functional and non-functional requirements captured
- Confirmation that traceability and quality gate checks passed
- Highest-risk assumptions or uncertainty areas

1. It is aimed at creative academics to self publish their pdfs, images, html files, and other works generally.

2. Acsess will be via a signup page adjasent to login.

3. exclude all of those from spec. And actually simplify the spec if it seems apparently a good idea.

4. Yes, non-logged in users can see non-private pages on any account.

5. I want to make a few crucial changes to the tech stack. As follows. Completely remove firebase. For the database, I want mongoDB and mongoose. For Auth, I want Auth.js and JWT tokens. With Resend for login link and password reset. Keep Cloudflare but leave aside the complex transforms for now, just vanilla cloudflare hosting (compress images before upload to a reasonable size).

I want Next.js: App router, no src folder, Tailwind, and vanila js and jsx (no typescript).

6 (extra). I want you to remove the complex scrolling behaviour where the page loads not at the top to hide a info banner begind the meain header bar. Scrap that. Just make the page load to the top as normal with no complex scroll resetting.

7. Header bar at the top should be fixed there. There should be the option to change both the header bar colour and the background colour as there is now (saves to db).

Ask me more questions before writing specs
