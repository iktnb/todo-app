# Cloud Sync Smoke Checklist

Run with `VITE_CLOUD_SYNC_ENABLED=true` and valid Firebase env vars.

## Auth

- Open app in a fresh browser profile.
- Click `Sign in with Google` and complete OAuth flow.
- Verify header shows signed-in account and `Sync status: synced`.
- Click `Sign out` and verify app returns to signed-out sync state.

## First Sync

- Sign in on device A with existing local data.
- If cloud is empty, verify data appears in Firestore document:
  - local dev (`npm run dev`): `users_dev/{uid}/boardState/current`
  - production build: `users/{uid}/boardState/current`
- Sign in on device B and verify cloud snapshot is applied locally.

## Merge/Replace Flow

- Create conflicting local and cloud states.
- Sign in and verify merge prompt appears.
- Choose replace path and verify local data matches cloud.
- Repeat and choose merge path; verify combined entities appear.

## Ongoing Sync

- Edit tasks/projects while signed in; verify cloud document updates after debounce.
- Open second browser/device and verify remote updates appear locally.
- Go offline, make local changes, return online, verify pending changes sync.

## Regression Checks

- Quick capture, clarify, project operations still work with sync enabled.
- Encrypted backup copy/import still works.
- Reset local data while signed in triggers cloud update with reset state.
