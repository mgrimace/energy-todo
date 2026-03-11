# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

- No unreleased changes yet.

## [v1.1.0] - 2026-03-11

- Added preliminary multi-theme support with `Default`, `Nord`, `Everforest`, and `Catppuccin` theme options.
- Updated theme selection UI previews and selection indicators for clearer visual feedback.
- Included supporting design and README refinements as part of the theme rollout groundwork.

## [v1.0.4] - 2026-03-09

- Replaced the task energy dropdown CSS data-URI arrow with a Phosphor `CaretDownIcon` for consistent rendering across Safari and Firefox.
- Kept normalized form control sizing while preserving a visible custom select indicator after native appearance removal.

## [v1.0.3] - 2026-03-08

- Reverted frontend SSE initialization regression introduced in `4d306e1`.
- Restored the previous `useTodos` behavior where `fetchTodos()` runs in its own mount `useEffect`, with SSE subscription in a separate `useEffect`.
- Withdraws `v1.0.2`; `v1.0.3` is the replacement stable patch release.

## [v1.0.2] - 2026-03-08 (withdrawn)

- Released with a frontend SSE initialization regression.
- Commit `4d306e1` changed reconnect behavior and caused the regression.
- Reverted by `bf57147`; release/tag removed.
