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
3. Run all validation checks (see below) and confirm they pass before opening a PR.
4. Open a PR into `main`. Use this exact body format (fill in the bracketed sections):
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
5. Merge via PR only — never push directly to `main`:
   ```bash
   gh pr merge <number> --merge --delete-branch
   ```

## Validation checklist

Run these before merging:

- `cargo check --manifest-path backend/Cargo.toml`
- `cargo clippy --manifest-path backend/Cargo.toml -- -D warnings`
- `npm run build --prefix frontend`

## Release checklist

1. Confirm `main` is up to date and tests/build checks pass.
2. Create and push an annotated version tag:
   ```bash
   git tag -a vX.Y.Z -m "Release vX.Y.Z" && git push origin vX.Y.Z
   ```
3. Verify the GitHub release workflow publishes images and creates the release.

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
