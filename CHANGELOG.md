# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

## [v1.4.9] - 2026-04-22

- Fix: task input card gains a subtle energy-tinted background and softened border on focus, using existing energy tokens via `color-mix`.
- Fix: task input Add button simplified to icon-only (`+`).

## [v1.4.8] - 2026-04-20

- Feat: replace energy `<select>` in task input with a cycling EnergyBadge pill; directional click (left = back, right = forward) matches the todo card interaction.
- Feat: task input card border, Add button, and all focus states adopt the currently selected energy colour.
- Feat: task input restructured into a title row (input + Add button) and a meta row (energy badge + tag entry).
- Feat: energy badge labels split by context — Low / Medium / High in the input, Quick win / Well balanced / Deep focus on todo cards.
- Fix: inline title edit height no longer expands to full control height; search chip focus ring no longer doubles at the corners; tag input placeholder respects the design system opacity.
- Refactor: removed dead select CSS and unused dimension tokens; hardcoded px values replaced with spacing tokens.

## [v1.4.7] - 2026-04-16

- Fix: SSE connection now reconnects silently when the app resumes after more than 10 seconds in the background, preventing missed live updates across devices after backgrounding a PWA or switching tabs.
- Fix: data refetch on resume is now gated on 10 s inactivity (not every focus event), eliminating redundant fetches on quick tab switches; hard reload triggers if inactive for over 60 s as a last-resort cache-bust.
- Refactor: resume timer and SSE reconnect logic consolidated into `useTodos`; `App.jsx` is now responsible only for rendering with no lifecycle side-effects.

## [v1.4.6] - 2026-04-14

- Feat: theme selector preview now shows three energy palette dots (low / medium / high) instead of a single accent dot, giving an accurate preview of each theme's energy color scheme.
- Feat: theme selector list is now sorted alphabetically.
- Fix: add `pageshow` listener so the app refetches immediately when returning to a Firefox pinned tab, where `focus` and `visibilitychange` are not reliably fired.

## [v1.4.5] - 2026-04-14

- Feat: add Kanagawa theme (Lotus light / Dragon dark).
- Feat: add Kanagawa Wave theme (Lotus light / Wave dark).
- Feat: add Dracula theme.

## [v1.4.4] - 2026-04-10

- Fix: todos re-fetch silently when the app regains focus or becomes visible, preventing stale state across devices.
- Fix: `focus` and `visibilitychange` listeners are debounced (1 s guard) to prevent duplicate back-to-back fetches.
- Fix: service worker uses `NetworkFirst` with a 3 s timeout for `/api/todos` so cached data is only served when the network is unavailable.

## [v1.4.3] - 2026-04-08

- Fix: replace inline transform-based drag with `DragOverlay` so the dragged card floats above the list and never stretches or shrinks items of different heights.
- Fix: original sortable item is hidden (`opacity: 0`) while dragging to prevent duplicate visuals; layout space is preserved so the list does not reflow.
- Fix: drag handle is always rendered in both the real card and the overlay card; overlay handle is inert (`aria-hidden`, no pointer events) so layout is identical and text never reflows into the handle column.
- Fix: `.drag-handle` locked to `--size-icon-sm` width with `flex-shrink: 0` to prevent text expansion into the handle column during overlay render.

## [v1.4.2] - 2026-04-08

- Fix: dragged item no longer renders beneath siblings when dragging downward; correct stacking context via explicit `z-index` on `.sortable-item`.
- Fix: drop animation no longer bounces on downward reorder; defer to dnd-kit's native transition instead of a static custom easing.
- Fix: `will-change: transform` moved to `.sortable-item` to align GPU promotion with the element dnd-kit transforms.
- Fix: swipe animation timings unified to 200ms across reset, complete, and delete actions.
- Chore: add `@dnd-kit/modifiers`; apply `restrictToVerticalAxis` to prevent horizontal drift during drag.

## [v1.4.1] - 2026-04-06

- Fix: filter pills no longer overflow horizontally on narrow mobile screens; chip padding and track gap tightened on small viewports, restored at 640px+.
- Fix: rename "Completed" filter label to "Done" to reduce pill width on mobile.
- Docs: refresh `docs/screenshot-dark.png` and `docs/screenshot-light.png` to reflect v1.4.0 UI changes.

## [v1.4.0] - 2026-04-06

- Refactor: remove `tracing`, `tracing-subscriber`, and `tracing-actix-web` dependencies; replace `info!`/`error!` macro calls with `eprintln!`.
- Refactor: move filter icons inside pill chips; each pill renders icon + label as a single inline unit with energy-toned active color.
- Refactor: replace external filter status icon with `CirclesFourIcon` for "All"; remove `FILTER_ICON_MAP` from `App.jsx`.
- Refactor: move search icon inside `.search-chip`; search field now has a left-aligned muted icon as part of the input field.
- Style: filter pills now feel like lightweight toggles — no border, transparent background at rest, `--color-surface-muted` fill when active.
- Style: remove segmented-control border merging from filter pills; pills are independent with `gap` spacing.
- Style: inactive pills at `opacity: 0.7`; hover restores full opacity.
- Style: `.search-chip` uses `--color-field-bg` background to distinguish it visually from filter pills.
- Feat: replace whole-card drag with a dedicated grab handle (ArrowsOutLineVertical icon, right side of card); drag and swipe zones are now physically separated with no gesture conflict.
- Feat: simplify swipe gesture — left-to-right completes/uncompletes, right-to-left deletes; remove diagonal detection, axis-bias logic, and pointercancel dispatch.
- Feat: progressive swipe feedback — opacity and scale animate with swipe distance via `--swipe-progress` CSS custom property.
- Feat: swipe-complete icon (`CheckIcon`/`SquareIcon`) wrapped in `.swipe-icon` and aligned to match the checkbox column.
- Fix: completed cards now use `--color-bg` (fully opaque) so swipe-behind colors are revealed cleanly without bleed-through.
- Fix: swipe panels use `visibility: hidden` instead of `display: none` to preserve 50/50 flex layout, preventing the active panel from expanding to full width.
- Fix: `.todo-swipe-wrapper .card` background override split into `:not(.is-complete)` and `.is-complete` selectors so completed card styling is no longer clobbered.
- Fix: swipe is blocked when a drag starts from the grab handle via `e.target.closest('.drag-handle')` check.
- Fix: default theme dark palette `danger` color corrected from amber (`#b35900`) to red (`#e07070`) to match light palette intent.
- Fix: grab handle cursor now shows `grab` consistently on hover — `pointer-events: none` on the SVG child prevents the icon from intercepting cursor events from the parent button; `touch-action: none` ensures dnd-kit claims pointer events immediately.
- Style: delete swipe background uses `--color-danger-text` (solid red) with `--color-bg` foreground for legibility.
- Style: drag handle sized to `--size-checkbox` with `padding: 0` and `--text-dim` color to match checkbox hit area and visual weight.
- Refactor: extract `SWIPE_THRESHOLD` as a module-level constant in `TodoCard.jsx` (was duplicated inline); remove `data-completed` attribute (unused); remove dead `.card.is-draggable` cursor rules; remove dead `--opacity-tag-affordance-rest` token; remove dead `.completed-divider::before/::after` block; remove redundant `touch-action: pan-y` from `.card` (inherited from wrapper).

## [v1.2.0] - 2026-04-03

- Feat: add dynamic status icon to filter bar reflecting the active filter with energy-toned color; add matching search icon for visual symmetry.
- Refactor: migrate backend storage from JSON to SQLite; `seed_if_empty` now migrates existing `todos.json` data on first boot.
- Refactor: simplify `useTodos.js` — fetch from server on every SSE event; server is the single source of truth for ordering.
- Refactor: remove tracing dependencies; replace with `eprintln!`.
- Fix: SSE-triggered refetch no longer flashes the loading spinner.
- Fix: filter pill expands to fill full available width with evenly distributed buttons.

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
