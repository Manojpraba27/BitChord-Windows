# Authentication fix verification

Production TypeScript/Vite/main/preload build passed locally. Existing 171 tests plus 14 authentication integration tests: 185 passed, zero failures/skips. Authentication tests use a real loopback listener and simulated Spotify HTTP responses, not a live account.

Local Electron smoke checks passed for startup, WAV/MP3/FLAC playback, byte-range requests, native IPC pause, playlist editing, appearance, restart persistence and account UI configuration/missing-ID/unsupported-Google behavior.

No Spotify Developer application or authorized account was supplied; live Spotify login is not verified. YouTube Music account-library/playback OAuth remains unsupported and is visibly disconnected. No Google cookie extraction occurs.

Windows packaging and tests: see the auth-fix-preview release and linked Windows Actions run. Native Windows 10/11 manual install/uninstall, media controls, real browser OAuth, DPAPI persistence and provider restrictions still require manual acceptance. See AUTHENTICATION.md and WINDOWS-ACCEPTANCE.md.

## Completed Windows run

https://github.com/Manojpraba27/BitChord-Windows/actions/runs/44366078178 succeeded on windows-latest. All 185 unit/regression/authentication tests passed there (26 Node tests and 159 Vitest tests). Setup and portable builds succeeded; both published files were downloaded completely and independently checked against the runner manifest. Both matched.

Portable SHA-256: db4db44b9acce9b2e2dd9c246034458d5b9e3415353c3a22ae25727e805bc89d
Setup SHA-256: 10906021c34a4d3ad6e664f97e6acfa9750d4118695c6fcbbdfb889a617c94eb

These are automated Windows tests with simulated Spotify HTTP responses, not native Windows installer/UI execution or live account authorization. Native Windows 10/11 manual acceptance and actual Spotify authorization remain outstanding. Both EXEs are unsigned previews.
