---
name: missing-guidance-analysis
description: Checklist of the knowledge project-context.md should capture so developers (and AI agents) catch system conflicts early
metadata:
  type: project
---

# What `project-context.md` Must Capture As The Product Grows

A context file that only documents **what exists** is not enough. Developers need to know:
**"If I implement X, what will break?"** and **"What do I check BEFORE I write code?"**

Use the sections below as a backlog. Tick them off in `project-context.md` as your domain modules appear.

## 🚨 Critical Sections

### 1. "Before You Implement Any Feature" Pre-Flight Checklist

A step-0 list, for example:
- Does it touch **money / credits / quotas**? → Check the transactional boundaries and every consumer of the balance.
- Does it modify a **persisted status or enum**? → Check reports, admin tools, mobile clients, and all listeners.
- Does it touch **user data shared with another system**? → Check every system in the System Inventory.
- Does it **create or change an order-like entity**? → Check the events it emits and who listens.
- Does it **upload files**? → Check storage path conventions and public URL handling.
- Does it touch **auth**? → Check token payload consumers and public routes.

**Why it matters:** a feature that works in isolation silently breaks reports, clients, or background jobs.

---

### 2. "Silent Failure Modes" — Explicit List

Document every way the system can fail without an error, in this shape:
```
🔴 SILENT FAILURE: <what the user/business sees>
   └─ Cause: <root cause>
   └─ Consequence: <impact>
   └─ How to prevent: <guardrail / test / log>
```
Common candidates: an event emitted but no listener registered, a fire-and-forget write that fails, a downstream step failing after a payment succeeded, a background job exhausting its retries.

---

### 3. "Module Dependency Matrix" — Visual Impact Map

```
| Module | Depends On | Affects (Downstream) | Circular Deps | Silent Risks |
|--------|------------|----------------------|---------------|--------------|
| auth   | users      | every protected route | None         | Token payload changes |
| users  | core       | auth                 | None          | Status changes lock users out |
```

---

### 4. "Enum Values Are Magic Numbers" — Impact List

For every persisted enum, record where its raw values are hardcoded (reports, admin filters, mobile apps, other services) and the action required before changing it. Rule of thumb: **never change an existing value; only add new ones.**

---

### 5. "If You Want to Add New [Feature]" Decision Trees

Write a checklist per recurring task, e.g.:

#### "If You Want to Add a New Status"
- [ ] Add to the enum (pick an unused value) + migration if it is a DB enum
- [ ] Define which transitions allow it
- [ ] Emit/handle the related event
- [ ] Update reports, admin filters, and clients that display it
- [ ] Test: notifications, listeners, and UI all handle the new value

#### "If You Want to Add a New Module"
- [ ] Follow `src/modules/users` layout (controllers/dto/entities/repositories/services/__tests__)
- [ ] Repository extends `BaseRepository`; queries only there
- [ ] DTOs for every input; Swagger decorators; `API_DOCUMENTATION.md` updated
- [ ] Migration with `up()` / `down()`
- [ ] Entry added to Module Inventory in `project-context.md`

---

### 6. "Cross-Cutting Constraints" — Things That Affect EVERYTHING

```
🔐 SHARED DATABASE        ├─ Which other systems read/write the same tables?
⏱️ TIME-BASED LOGIC       ├─ Timezone assumptions, expiry windows, polling intervals
🔔 FIRE-AND-FORGET EVENTS ├─ Listeners can fail silently; no transaction boundary
💾 FILE PATHS             ├─ Path formats that existing files depend on
🔗 CIRCULAR DEPENDENCIES  ├─ forwardRef() pairs that break startup if refactored
📊 DIRECT DB CONSUMERS    ├─ Dashboards hardcoding columns/enum values
```

---

### 7. "Testing Checklist Before Merge" — Red Flags

```
🚨 STATUS/ENUM CHANGES   - [ ] Existing values untouched? Listeners + reports updated?
🚨 EVENT/LISTENER CHANGES - [ ] Emitted after commit? Idempotent? Error handling?
🚨 FILE UPLOAD CHANGES   - [ ] Path format unchanged? Upload + retrieval tested?
🚨 AUTH CHANGES          - [ ] Public routes intentional? Token payload consumers updated?
🚨 SCHEMA CHANGES        - [ ] Migration up() and down() both tested?
```

---

### 8. "Blast Radius by Module" — What Changes Where

```
CHANGING <file or concept>
  Direct impact: <modules, tables>
  Indirect impact: <clients, reports, jobs>
```

---

### 9. "Common Mistakes" — War Stories

```
❌ MISTAKE: "<what someone did>"
  Result: <what broke>
  Why: <root cause>
  Fix: <the rule that prevents it>
```

---

## 📋 Implementation Priority

**HIGH PRIORITY:** Pre-flight checklist, silent failure modes, decision trees, testing checklist
**MEDIUM PRIORITY:** Module dependency matrix, enum impact list, cross-cutting constraints
**NICE-TO-HAVE:** Common mistakes, blast radius by module

## 🎯 Goal

Transform the context file from:
> "Here's what exists. Don't break it."

Into:
> "Here's the system. Before you code ANYTHING, answer these questions. If you miss one, here's what breaks and how to prevent it."
