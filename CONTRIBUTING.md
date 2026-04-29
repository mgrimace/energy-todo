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

1. Start from a clean, up-to-date `main`:
   ```bash
   git checkout main && git pull && git checkout -b <branch-name>
   ```
2. Make focused changes for one goal.
3. Update `CHANGELOG.md` (`## [Unreleased]`) in the same commit as your changes.
4. Run all validation checks (see below) and confirm they pass before opening a PR.
5. Open a PR into `main`. Use this exact body format (fill in the bracketed sections):
   ```bash
   gh pr create --title "<commit message>" --base main --body "## Summary
   - [one-line description of what this PR does]

   ## Changes
   - [list each file or behavior changed]

   ## Validation
   - [x] \`cargo check --manifest-path backend/Cargo.toml\`
   - [x] \`cargo clippy --manifest-path backend/Cargo.toml -- -D warnings\`
   - [x] \`npm run build --prefix frontend\`

   ## Notes
   - [x] No breaking changes"
   ```
6. Merge via PR only — never push directly to `main`:
   ```bash
   gh pr merge <number> --merge --delete-branch
   ```

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
- **Keep entries succinct.** One line per change. Lead with `Feat:`, `Fix:`, or `Refactor:`. Describe the user-visible outcome, not implementation details. Use the existing entries as the style reference.

## Release checklist

1. Confirm `main` is up to date and tests/build checks pass.
2. Move release-ready entries from `## [Unreleased]` into a new version section (for example, `## [v1.0.4] - 2026-03-08`). Consolidate verbose PR-level notes into succinct user-facing lines.
3. Commit the changelog update directly on `main` (for example, `docs: prepare v1.0.4 changelog`) and push:
   ```bash
   git add CHANGELOG.md && git commit -m "docs: prepare vX.Y.Z changelog" && git push origin main
   ```
4. Create and push an annotated version tag:
   ```bash
   git tag -a vX.Y.Z -m "Release vX.Y.Z" && git push origin vX.Y.Z
   ```
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
