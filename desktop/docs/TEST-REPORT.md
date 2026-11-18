# Library/player verification

Local production build passed. 196 automated tests passed (37 Node security/auth/import/database/policy tests plus 159 Vitest regression tests), zero failures/skips.

New tests cover CSV/JSON/M3U metadata, Spotify exports without credentials, ordering/Unicode/quoting, duplicate rows/playlists, unique and ambiguous local matching, Google Title CSV metadata, malformed/oversized inputs, SQLite transaction rollback/undo and close-policy choices.

Local Electron smoke checks passed for playback/seek, playlist editing, account limitations, native file-authorized import preview/matching/duplicate skip/undo, rejection of arbitrary renderer file paths, restart persistence and closing during playback terminating the process. Local video smoke passed for WebM playback, fullscreen surface layout, Escape, double-click/F11 and position preservation. Headless Linux cannot verify native Windows window-manager fullscreen transitions.

Windows workflow will run the 196 tests, build both EXEs and attempt the desktop/audio/import/close and video/fullscreen smoke scripts. Smoke steps report their own outcome and do not hide failures; they are non-gating because audio/display/FFmpeg availability can vary on hosted runners. Native tray icon interaction, multi-monitor/high-DPI, Windows 10/11 manual install/uninstall and provider account tests remain outstanding.

No Google OAuth callback tests are claimed: no registered Google application is available and no Google OAuth connection is activated. Existing Spotify callback tests use simulated responses; no live account authorization is certified.

## Verified Windows results

Build run: https://github.com/Manojpraba27/BitChord-Windows/actions/runs/44373804804 . Both Windows x64 EXEs were generated, published, downloaded completely and SHA-256 verified.

Portable SHA-256: 6209ae4176053a439cf21340bef2d4b5adfdfede56bf67a19b092b27ec497e11
Setup SHA-256: 0f9c316a821bcd56577afe3eb7d2484c6f339ec31ec9dcf85563735503fe7c46

Native validation run: https://github.com/Manojpraba27/BitChord-Windows/actions/runs/44376320061 . It passed all 196 tests and both desktop suites on the hosted Windows runner. Audio/import/close suite exit code 0; video/fullscreen suite exit code 0. Windows logs confirm WAV/MP3/FLAC playhead advancement, seeks, media-command pause, playlist editing, import matching/duplicate skip/undo, arbitrary-path rejection, persistence, close during playback and Quit while tray preference is enabled. Video logs confirm local WebM playback, fullscreen layout/window state, Escape, double-click/F11 and position preservation.

An earlier attempt lacked FFmpeg; generated test fixtures removed that dependency. Follow-up harness issues with Windows path canonicalization and temporary-file cleanup were fixed and the entire native validation rerun passed. Fixtures contain generated tones/blue frames only and are excluded from installed resources. No application-media implementation changes were made after build commit 34c1d422; subsequent commits updated test tooling/documentation.

These native automated results do not certify physical audio output, hardware media keys, actual tray-icon interactions, multi-monitor/high-DPI transitions, manual Windows 10/11 installation/uninstallation, or real Spotify/Google accounts. See WINDOWS-ACCEPTANCE.md for remaining checks. Both builds are unsigned previews.
