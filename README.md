# FlowAnchor Todo

Calm, offline-first GTD workspace for inbox capture, projects, and weekly review.

## Run locally

```bash
npm install
npm run dev
```

## Mobile (Tauri Android / iOS)

The app is already prepared for Tauri mobile entrypoint in Rust (`src-tauri/src/lib.rs`), so you can build native mobile binaries after one-time platform setup.

### 1) Install mobile prerequisites

For Android (Linux):

- Install Android Studio (SDK + NDK)
- Set `JAVA_HOME` (Android Studio JBR)
- Set `ANDROID_HOME` and `NDK_HOME`
- Ensure Rust Android targets are installed
- iOS builds require macOS + Xcode (cannot build iOS from Linux)

Example environment variables:

```bash
export JAVA_HOME=/opt/android-studio/jbr
export ANDROID_HOME="$HOME/Android/Sdk"
export NDK_HOME="$ANDROID_HOME/ndk/$(ls -1 "$ANDROID_HOME/ndk" | tail -n 1)"
rustup target add aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android
```

### 2) Initialize mobile projects (one time)

```bash
npm run tauri:android:init
npm run tauri:ios:init
```

### 3) Run on device/emulator

```bash
npm run tauri:android:dev
npm run tauri:ios:dev
```

### 4) Build release artifacts

```bash
npm run tauri:android:build
npm run tauri:ios:build
```

## Deploy to GitHub Pages

Deployment is configured via GitHub Actions using shared action:

- `iktnb/github-utils/.github/actions/prepare-and-build-for-gh-pages@v1`

Trigger:

- push to `main`
- manual run via `workflow_dispatch`

## Local storage snapshot

Board state is persisted in local storage under key:

- `flowanchor.board.snapshot`

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

| FLOW entity                                        | Current app analog                        |
| -------------------------------------------------- | ----------------------------------------- |
| `Item` (raw capture)                               | `Task` in Inbox (`columnId = "inbox"`)    |
| `Capture` stage                                    | Inbox input in board UI                   |
| Clarified outcomes (`NextAction`, `Project`, etc.) | Not implemented yet                       |
| `Context`, `Review`, `Engage` filters              | Not implemented yet                       |
| State container                                    | `useBoardState` hook (`columns`, `tasks`) |
