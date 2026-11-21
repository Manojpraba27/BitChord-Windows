# BitChord Player Controls Fix — 1.1.1

Fixes the expanded artwork/lyrics player shown in the reported screenshot.

- X returns to the main app; expanded controls explicitly opt out of Electron title dragging and hide the underlying drag region.
- Fullscreen uses Electron's native Windows fullscreen API, with synchronized state, F11 and Escape. Closing the expanded player restores the normal window.
- AUDIO / VIDEO buttons are restored inside the expanded player. Local MP4/WebM use the existing in-app player; online YouTube video uses the app-owned official YouTube window. Returning to Audio resumes the saved app position; provider position is not seamlessly synchronized.
- Closing while local video plays preserves its intended playback state before DOM removal, releases the element and resumes an advancing audio playhead. Pending local mode switches are invalidated on close. Closing an owned online video session resumes the saved audio position where available.

Version 1.1.0 installers are preserved. New filenames: BitChord-Player-Fix-Setup.exe and BitChord-Player-Fix-Portable.exe. Binaries remain unsigned. Native/manual test evidence is recorded in TEST-REPORT.md; provider playback restrictions and broader parity limits remain unchanged.
