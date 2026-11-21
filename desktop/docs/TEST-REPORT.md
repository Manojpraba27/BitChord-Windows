# Player Controls Fix 1.1.1 — validation

Local production build and all 207 existing tests passed (48 Node + 159 Vitest). New expanded-player smoke passed: corner X, title drag-region exclusion, Audio/Video switching, closing during video and restoration of audio. Native fullscreen state and F11/Escape are asserted on Windows; Linux headless is not used to certify Windows fullscreen.

Windows packaging run: https://github.com/Manojpraba27/BitChord-Windows/actions/runs/44939959756 (application source `73191f4e`). Packaging and installed-application validation are pending. Previous 1.1.0 results remain available in the desktop-updated-preview release. No live online YouTube/Spotify playback or authorized account certification is claimed. The exact provider video continues to depend on the official site and its restrictions.

The regression is in the expanded player, distinct from the previously tested Now Playing page's local video controls. The expanded player used browser fullscreen and lacked the restored MediaMode controls. Top controls overlap the native title drag region; this update explicitly disables that region while the expanded player is open and marks player controls non-draggable.

Manual Windows 10/11 hardware, high DPI/multiple monitors and real pointer interaction remain subject to user acceptance. See WINDOWS-ACCEPTANCE.md and FEATURE-PARITY.md for broader limits.
