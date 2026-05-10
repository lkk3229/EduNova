# Copilot Repository Instructions

---

## RULE 0 — Documentation Sync Is MANDATORY and NON-DEFERRABLE

**Every task that touches any project file MUST update `frd.html` and `prd.html` before the task is considered complete.**

This rule has no exceptions. Do NOT finish a task and say "update docs later". Do NOT ask the user if they want docs updated. Just do it.

- FRD file: `frd.html`
- PRD file: `prd.html`

---

## Triggers — When to Update FRD and PRD

Update both documents whenever ANY of the following happens:

### Code / Feature Changes
- A new `.html`, `.js`, or `.css` file is created or deleted.
- A new feature, module, or UI section is added.
- An existing feature is modified, renamed, or removed.
- A new function, API, or global object (e.g. `window.EduXxx`) is introduced or changed.
- A new `localStorage` or `sessionStorage` key is read or written.
- An existing storage key is renamed, removed, or its schema changes.
- An auth/access flow changes (login redirect, session check, role guard, password reset, ticket logic).
- A new user role or permission level is introduced or modified.
- A page is added, removed, or its required scripts change.
- A CSS file or visual module is added that affects a documented component.

### Workflow / Business Logic Changes
- Enrollment, payment, certificate, or progress logic changes.
- Teacher/student/admin approval or rejection workflow changes.
- Course lifecycle (upload → pending → approve → publish) changes.
- Meeting/live class behavior changes (timer, duration limits, controls).
- Chatbot knowledge base, confidentiality rules, or scope changes.
- Currency/localization rules or supported currencies change.
- Library catalog, board/class structure, or AI assistant behavior changes.
- Speaking trainer scoring, voice, LLM, or session logic changes.
- Report/export format or data columns change.
- Platform reset or data-clear categories change.

---

## What to Update in Each Document

### In FRD (`frd.html`)
- Version number in the metadata block and footer (`v3.x → v3.x+1`).
- **Technical Architecture** table: add/update/remove rows for new/changed files.
- **Pages Inventory** table: add/update/remove page rows and their script lists.
- **Data Model** table: add/update/remove localStorage/sessionStorage keys.
- **Feature section**: add or update the relevant functional section with behavior details, APIs, flows, and edge cases.
- **Security** section: update if new input is handled or new auth path is added.
- **Reports** section: update if exported data columns change.
- **Admin Dashboard** section: update if new admin tab, action, or function is added.

### In PRD (`prd.html`)
- Version number in the metadata block and footer.
- **Feature Matrix** table: add/update/remove feature rows (F-xx).
- **User Stories**: add new story (US-Sxx) for any new user-facing capability.
- **Feature Details** section (6.2.x): add or update subsection for the changed module.
- **Non-Functional Requirements**: update if performance, security, or compatibility changes.
- **Risks & Dependencies** table: add a row if the change introduces a new technical or business risk.
- **Dependencies** table: add a row if a new browser API, library, or client-side service is used.
- **KPI / Metrics**: add or update a KPI if the change introduces a new measurable outcome.
- **Glossary**: add new terms introduced by the change.

---

## Version Numbering Rule

- Minor content changes (text, description, behavior clarification): increment patch → `v3.2 → v3.3`.
- New feature or new module: increment minor → `v3.x → v4.0`.
- Both FRD and PRD must always have the **same version number**.

---

## Mandatory Completion Checklist

Before marking any task done, verify:
- [ ] FRD version number updated.
- [ ] PRD version number updated.
- [ ] Technical Architecture row added/updated in FRD for any new file.
- [ ] Pages Inventory row added/updated in FRD for any new/changed page.
- [ ] Data Model row added/updated in FRD for any new/changed storage key.
- [ ] Feature Matrix row added/updated in PRD (F-xx).
- [ ] User Story added in PRD (US-Sxx) for any new user-facing feature.
- [ ] Risk added in PRD if the change introduces a new dependency or technical limitation.
- [ ] Glossary updated in PRD if new terminology is introduced.
- [ ] FRD footer and PRD footer both show the updated version.

---

## If Full Detail Is Unknown

- Add a `<!-- TBD: [description] -->` comment in the relevant FRD/PRD section.
- Add a `<span class="frd-badge">TBD</span>` badge in table rows that are incomplete.
- Never leave docs completely stale — a partial entry with a TBD marker is always better than nothing.
