# GTD Task Manager — Flow Specification

## 1. Core Philosophy

This is **not a task list**.
This system manages **commitments and decisions** using the GTD methodology.

The system lifecycle:

```
Capture → Clarify → Organize → Engage → Review
```

Every item must move through this pipeline.

---

## 2. Core Entity: `Item`

We intentionally avoid calling this a "Task".

Everything enters the system as a neutral **Item**.

### Item Fields (Raw Capture)

| Field      | Type     | Required | Description                          |
| ---------- | -------- | -------- | ------------------------------------ |
| id         | UUID     | ✅       | Unique identifier                    |
| title      | string   | ✅       | Raw thought ("Call John", "Fix bug") |
| notes      | text     | ❌       | Optional brain dump                  |
| created_at | datetime | ✅       | Capture timestamp                    |
| source     | enum     | ❌       | manual / email / import / etc        |
| clarified  | boolean  | ✅       | Has user processed this?             |

At capture time — **NO OTHER FIELDS EXIST**.

---

## 3. Clarification Stage

User processes Inbox and converts an `Item` into a **meaningful object**.

### Clarify Decision Tree

```
Is it actionable?
    NO →
        Trash OR Someday
    YES →
        Is it one step?
            YES → Next Action
            NO  → Project
```

---

## 4. Derived Types (After Clarification)

An Item transforms into one of the following:

```
NextAction
Project
WaitingFor
Someday
Reference
```

---

## 5. Entity: `NextAction`

A **physical, visible step** that can be executed.

Example:
✔ "Write API handler"
❌ "Work on backend"

### Fields

| Field         | Type          | Required | Description            |
| ------------- | ------------- | -------- | ---------------------- |
| id            | UUID          | ✅       | Same as Item ID        |
| title         | string        | ✅       | Concrete action        |
| notes         | text          | ❌       | Supporting info        |
| context_id    | UUID          | ✅       | Where it can be done   |
| energy        | enum          | ❌       | low / medium / high    |
| time_estimate | int (minutes) | ❌       | Helps filtering        |
| due_at        | datetime      | ❌       | Only if truly required |
| project_id    | UUID          | ❌       | Linked project         |
| status        | enum          | ✅       | active / done          |
| created_at    | datetime      | ✅       |                        |

---

## 6. Entity: `Project`

A Project = **desired outcome requiring multiple actions**.

Example:
"Launch portfolio site"

### Fields

| Field      | Type     | Required | Description             |
| ---------- | -------- | -------- | ----------------------- |
| id         | UUID     | ✅       |                         |
| title      | string   | ✅       | Outcome-based name      |
| notes      | text     | ❌       | Vision / scope          |
| status     | enum     | ✅       | active / on_hold / done |
| review_at  | datetime | ✅       | Used in Weekly Review   |
| created_at | datetime | ✅       |                         |

Projects MUST always have ≥1 NextAction.

---

## 7. Entity: `Context`

Defines **where / how** work can be performed.

This replaces traditional "priority".

Examples:

- `@computer`
- `@phone`
- `@home`
- `@deep-work`
- `@5min`

### Fields

| Field       | Type   |
| ----------- | ------ |
| id          | UUID   |
| name        | string |
| description | text   |

---

## 8. Entity: `WaitingFor`

Tracks delegated or blocked items.

Example:
"Waiting for designer to send assets"

| Field        | Type     |
| ------------ | -------- |
| id           | UUID     |
| title        | string   |
| person       | string   |
| follow_up_at | datetime |
| notes        | text     |

---

## 9. Entity: `Someday`

Ideas intentionally not committed to.

| Field     | Type     |
| --------- | -------- |
| id        | UUID     |
| title     | string   |
| notes     | text     |
| review_at | datetime |

---

## 10. Engage Phase (Execution Engine)

User never sees "all tasks".

They filter by **real-world constraints**:

```
Available Context
Available Time
Available Energy
```

Query Example:

```
Give me actions where:
context = @computer
time_estimate <= 30min
energy != high
status = active
```

---

## 11. Weekly Review Flow

System guides user through mandatory reset.

### Review Steps

```
1. Empty Inbox
2. Check all Projects
3. Ensure every Project has NextAction
4. Review WaitingFor
5. Clean Someday list
6. Close completed loops
7. Set intention for next week
```

---

## 12. State Transitions

```
Captured Item
    ↓ clarify
NextAction → Done
Project → Completed
WaitingFor → Converted to NextAction
Someday → Activated → NextAction
```

No item is allowed to stagnate outside these states.

---

## 13. Minimal API Surface (Conceptual)

```
POST /capture
POST /clarify/{id}
GET  /engage
POST /complete/{id}
GET  /review
```

---

## 14. Key Design Rules (Must Not Be Violated)

❌ No priority field
❌ No giant Today list
❌ No mandatory deadlines
❌ No nested subtasks chaos

✅ Everything must be actionable
✅ System must reduce thinking friction
✅ UI must encourage finishing, not organizing

---

## 15. MVP Scope

To launch v1 you only need:

- Capture Inbox
- Clarify Wizard
- NextAction Lists by Context
- Project View
- Weekly Review

That is the complete GTD loop.
