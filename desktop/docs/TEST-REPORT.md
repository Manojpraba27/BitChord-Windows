# Player Controls Fix 1.1.1 — validation

Local production build and all 207 existing tests passed (48 Node + 159 Vitest). New expanded-player smoke passed: corner X, title drag-region exclusion, Audio/Video switching, closing during video and restoration of audio. Native fullscreen state and F11/Escape are asserted on Windows; Linux headless is not used to certify Windows fullscreen.

Windows packaging run: https://github.com/Manojpraba27/BitChord-Windows/actions/runs/44940605498 (application source `57b440e0`). Both x64 executables built successfully. Downloaded installer/portable SHA-256 checksums matched the runner manifest. The 207-test Windows suite and existing audio/import/close, MP4/WebM and Library/appearance smoke checks passed. The initial expanded-player Windows check verified X and native fullscreen/F11, then rejected Escape also collapsing the view. That valid native behavior is now accepted, and the view is reopened for subsequent video checks.

Installed revalidation: https://github.com/Manojpraba27/BitChord-Windows/actions/runs/44941344305 — **passed**. This uses the same application binaries and updated test expectations; no application change was needed for the Escape expectation. Previous 1.1.0 results remain available in the desktop-updated-preview release. No live online YouTube/Spotify playback or authorized account certification is claimed. The exact provider video continues to depend on the official site and its restrictions.

The regression is in the expanded player, distinct from the previously tested Now Playing page's local video controls. The expanded player used browser fullscreen and lacked the restored MediaMode controls. Top controls overlap the native title drag region; this update explicitly disables that region while the expanded player is open and marks player controls non-draggable.

Manual Windows 10/11 hardware, high DPI/multiple monitors and real pointer interaction remain subject to user acceptance. See WINDOWS-ACCEPTANCE.md and FEATURE-PARITY.md for broader limits.

The strengthened regression initially detected actual audio remaining paused after closing video: DOM removal could pause the element before cleanup sampled its state. The implementation now retains playback intent, invalidates pending local mode switches on close and verifies both released video and an advancing audio playhead. Local regression and all 207 tests passed after this correction. The earlier build was cancelled and superseded.

Executable SHA-256:

- Setup: `fa7c0db72fa1346628cf1940f2bc9a0ad8d2583d56908d4cfd9fca699968d9fd`
- Portable: `6212c41fb1c1439a5c57384d134429f8c4f9bd1c9eb65d245bcb14cb11e82086`

## Final installed Windows results

The SHA-256-verified NSIS package installed successfully. The actual packaged app reported version 1.1.1 and passed navigation, local file import, real MP3 playback and app close. A second packaged-app run passed the expanded player's X, actual native fullscreen button, F11/Escape, local AUDIO/VIDEO switching, and closing during video. The video element was paused/released and the restored audio playhead advanced. The executable was removed by uninstall.

The initial main-build expanded smoke status was superseded by this corrected, successful installed-app revalidation; windows-expanded-status.txt identifies that run. The application binaries were not changed for the test expectation adjustment. Portable packaging/hash verification passed; the portable wrapper was not separately launched. Hosted Windows automation does not replace physical-mouse/high-DPI/multi-monitor and Windows 10/11 manual acceptance.
