# Contributing

This project uses a lightweight, solo-friendly workflow to keep `main` stable.

## Branch naming

Use short-lived branches from `main`:

- `feat/<short-description>` for features
- `fix/<short-description>` for bug fixes
- `chore/<short-description>` for maintenance/docs/tooling
- `refactor/<short-description>` for code restructuring without behavior changes

Examples:

- `feat/energy-score-trend`
- `fix/cors-origin-parse`
- `chore/update-readme`

## Pull request workflow

1. Create a branch from the latest `main`.
2. Make focused changes for one goal.
3. Open a PR into `main`.
4. Fill in the PR template fields.
5. Run validation checks locally before merge.
6. Merge PR when ready.

## Validation checklist

Run these before merging:

- `cargo check --manifest-path backend/Cargo.toml`
- `cargo clippy --manifest-path backend/Cargo.toml -- -D warnings`
- `npm run build --prefix frontend`

## Commit message style

Use concise Conventional Commit prefixes:

- `feat: ...`
- `fix: ...`
- `chore: ...`
- `refactor: ...`
- `docs: ...`

## Scope guidelines

- Keep PRs small and focused.
- Avoid mixing unrelated backend/frontend refactors in one PR.
- Prefer follow-up PRs over large, multi-purpose changes.
