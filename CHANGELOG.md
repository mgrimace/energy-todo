# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

- No unreleased changes yet.

## [v1.0.3] - 2026-03-08

- Reverted frontend SSE initialization regression introduced in `4d306e1`.
- Restored the previous `useTodos` behavior where `fetchTodos()` runs in its own mount `useEffect`, with SSE subscription in a separate `useEffect`.
- Withdraws `v1.0.2`; `v1.0.3` is the replacement stable patch release.

## [v1.0.2] - 2026-03-08 (withdrawn)

- Released with a frontend SSE initialization regression.
- Commit `4d306e1` changed reconnect behavior and caused the regression.
- Reverted by `bf57147`; release/tag removed.
