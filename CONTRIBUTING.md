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

## Changelog workflow

`CHANGELOG.md` is the source of truth for release notes.

- Keep a `## [Unreleased]` section at the top of `CHANGELOG.md`.
- Add entries for user-facing features, fixes, regressions, and notable behavior changes.
- Skip trivial internal refactors unless they impact users or operators.
- If a release is withdrawn, mark it clearly (for example, `(withdrawn)`) and document the replacement release.

## Release checklist

1. Confirm `main` is up to date and tests/build checks pass.
2. Move release-ready entries from `## [Unreleased]` into a new version section (for example, `## [v1.0.4] - 2026-03-08`).
3. Commit release prep docs changes (for example, `docs: prepare v1.0.4 changelog`).
4. Create and push an annotated version tag: `git tag -a vX.Y.Z -m "Release vX.Y.Z"` then `git push origin vX.Y.Z`.
5. Verify the GitHub release workflow publishes images and creates the release.

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
