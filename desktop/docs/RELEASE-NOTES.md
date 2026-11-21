# BitChord Player Controls Fix — 1.1.1

Fixes the expanded artwork/lyrics player shown in the reported screenshot.

- X returns to the main app; expanded controls explicitly opt out of Electron title dragging and hide the underlying drag region.
- Fullscreen uses Electron's native Windows fullscreen API, with synchronized state, F11 and Escape. Closing the expanded player restores the normal window.
- AUDIO / VIDEO buttons are restored inside the expanded player. Local MP4/WebM use the existing in-app player; online YouTube video uses the app-owned official YouTube window. Returning to Audio resumes the saved app position; provider position is not seamlessly synchronized.
- Closing while local video plays preserves its intended playback state before DOM removal, releases the element and resumes an advancing audio playhead. Pending local mode switches are invalidated on close. Closing an owned online video session resumes the saved audio position where available.

Version 1.1.0 installers are preserved. New filenames: BitChord-Player-Fix-Setup.exe and BitChord-Player-Fix-Portable.exe. Binaries remain unsigned. Native/manual test evidence is recorded in TEST-REPORT.md; provider playback restrictions and broader parity limits remain unchanged.

## Verified release

207 tests passed locally and on Windows. The real installed version 1.1.1 passed native fullscreen/F11/Escape, expanded X, local video/audio handoff with released video and advancing resumed audio, MP3 playback, close and uninstall. Both executable SHA-256 hashes matched the runner manifest. Physical Windows 10/11 pointer/display acceptance and live online provider playback remain unverified.

Build: https://github.com/Manojpraba27/BitChord-Windows/actions/runs/44940605498

Installed checks: https://github.com/Manojpraba27/BitChord-Windows/actions/runs/44941344305
