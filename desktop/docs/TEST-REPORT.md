# Library/player verification

Local production build passed. 196 automated tests passed (37 Node security/auth/import/database/policy tests plus 159 Vitest regression tests), zero failures/skips.

New tests cover CSV/JSON/M3U metadata, Spotify exports without credentials, ordering/Unicode/quoting, duplicate rows/playlists, unique and ambiguous local matching, Google Title CSV metadata, malformed/oversized inputs, SQLite transaction rollback/undo and close-policy choices.

Local Electron smoke checks passed for playback/seek, playlist editing, account limitations, native file-authorized import preview/matching/duplicate skip/undo, rejection of arbitrary renderer file paths, restart persistence and closing during playback terminating the process. Local video smoke passed for WebM playback, fullscreen surface layout, Escape, double-click/F11 and position preservation. Headless Linux cannot verify native Windows window-manager fullscreen transitions.

Windows workflow will run the 196 tests, build both EXEs and attempt the desktop/audio/import/close and video/fullscreen smoke scripts. Smoke steps report their own outcome and do not hide failures; they are non-gating because audio/display/FFmpeg availability can vary on hosted runners. Native tray icon interaction, multi-monitor/high-DPI, Windows 10/11 manual install/uninstall and provider account tests remain outstanding.

No Google OAuth callback tests are claimed: no registered Google application is available and no Google OAuth connection is activated. Existing Spotify callback tests use simulated responses; no live account authorization is certified.
