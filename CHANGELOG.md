# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

- Refactor: migrate backend storage from JSON to SQLite to remove sync complexity, improve robustness, and simplify data migrations.
- Fix: `seed_if_empty` now migrates existing `todos.json` data on first boot instead of overwriting it with sample todos, ensuring a safe upgrade path for existing users.
- Refactor: remove dead `storage.rs` file (superseded by `db.rs`).
- Refactor: simplify `useTodos.js` — replace local state reconstruction helpers (`insertCreatedTodo`, `moveTodoByCompletionTransition`, `reorderActiveInState`) with `fetchTodos()` on every SSE event; server is the single source of truth for ordering.
- Refactor: remove `normalizeTodo` from `useTodos.js` — backend guarantees typed data from SQLite.
- Fix: SSE-triggered refetch no longer flashes the loading spinner; only the initial page load shows it.
- Refactor: remove `fetchTodos` from `useTodos` public API — not used by any consumer.
- Refactor: remove unused `removeTagAtIndex` and `commitPendingInput` from `useTagInputController` return object.
- Refactor: simplify `is_static_asset` check in `main.rs` from 10 extension conditions to `path.starts_with("/assets/")`.
- Refactor: remove `tagKeyHandlerRef` sync effect in `TodoCard.jsx`; call `onTagEditorKeyDown` directly.
- Fix: filter pill now expands to fill full available width; buttons distribute evenly for a continuous joined appearance.
- Refactor: remove `--line-height-tight` token (unused); align filter pill chip font style with search chip.

## [v1.1.8] - 2026-04-01

- Refactor: single icon theme toggle; tidy themes.
- Fix: rename default theme to `default` to improve mobile fit.

## [v1.1.7] - 2026-04-01
 - Simplified filter tabs to `Low/Medium/High` for improved mobile usability. (#42)
 - Fixed theme preview colors and ensured the selected theme preview displays correctly. (#43)

## [v1.1.6] - 2026-04-01

- Collapse internal semantic token passthrough layer to simplify theming. (#41)

## [v1.1.5] - 2026-03-31

- Simplify README/docker-compose quick-start for local setup. (#38)
- Deduplicate theme token values to reduce duplication. (#39)
- Rely on CSS theme tokens to simplify theme application and fix token passthrough. (#40)

## [v1.1.4] - 2026-03-23

- Keep tag affordance visible so the “+ add tag” indicator is easier to tap on mobile. (#35)
- Restore tertiary tag affordance. (#36)
- Simplify Docker Compose quick-start in README. (#37)

## [v1.1.3] - 2026-03-12

- Fixed inline tag editor input sizing by explicitly setting its height to the inline input token for consistent chip-row alignment.
- Added new `Gruvbox` and `Solarized` theme options to expand the available presets.

## [v1.1.2] - 2026-03-12

- Added a new original Science inspired theme 
- Tuned the Nord theme surface layering cards and backgrounds 
- Tuned Science theme medium-energy colors for stronger visibility in both light and dark modes.
- Reduced task-entry tag input vertical footprint for a more compact card layout.

## [v1.1.1] - 2026-03-11

- Added a `Clear all` action in the completed section header to quickly remove all completed tasks.
- Fixed the internal Catppuccin theme identifier typo by renaming `catpuccin` references to `catppuccin`.
- Updated README to explicitly note current theme support and that more themes are planned.

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

## [v1.0.1] - 2026-03-04

- Improved mobile task entry layout and usability.
- Added Safari/macOS PWA icon support so Apple users see the proper app icon.
- Added a README troubleshooting step for data directory permissions.

## [v1.0.0] - 2026-03-04

- Initial public release of Energy Todo.
- Delivered the core energy-based task workflow with quick add/edit interactions.
- Included self-hosted Docker deployment support and PWA/mobile install capability.
- Bundled early UI and design polish across app styles, icons, labels, and README/docs.
