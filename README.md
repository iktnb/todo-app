# IKTNB Todo

Simple Kanban-style board used as a foundation for incremental GTD evolution.

## Run locally

```bash
npm install
npm run dev
```

## Local storage snapshot

Board state is persisted in local storage under key:

- `iktnb.board.snapshot`

Snapshot format:

```json
{
  "version": 1,
  "columns": [{ "id": "inbox", "title": "Inbox" }],
  "tasks": [
    {
      "id": "uuid",
      "title": "Example",
      "columnId": "inbox",
      "status": "todo",
      "createdAt": "2026-03-01T00:00:00.000Z"
    }
  ]
}
```

Version policy:

- Increase `version` only for breaking snapshot shape or meaning changes.
- On invalid JSON or unsupported version, the app falls back to default state (`Inbox`, no tasks).
- Compatible snapshots can be loaded and sanitized (for example, tasks referencing missing columns are ignored).

## FLOW entity mapping (current app)

Current code is still a pre-GTD board. Mapping to `FLOW.md` is temporary and explicit:

| FLOW entity | Current app analog |
| --- | --- |
| `Item` (raw capture) | `Task` in Inbox (`columnId = "inbox"`) |
| `Capture` stage | Inbox input in board UI |
| Clarified outcomes (`NextAction`, `Project`, etc.) | Not implemented yet |
| `Context`, `Review`, `Engage` filters | Not implemented yet |
| State container | `useBoardState` hook (`columns`, `tasks`) |
