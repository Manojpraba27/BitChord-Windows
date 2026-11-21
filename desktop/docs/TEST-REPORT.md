# BitChord Desktop Updated Preview 1.1.0 — test report

## Build and executable verification

Windows build: https://github.com/Manojpraba27/BitChord-Windows/actions/runs/44928016751 — application source `49bd6ac3`. Both x64 NSIS installer and portable packaging completed. Downloaded files matched the Windows runner manifest and GitHub release asset digests:

- `BitChord-Desktop-Updated-Setup.exe`: `d55a7d72a83c73e7512eafdf4d367a34c7af9da07f5304cdf86c890de97163da`
- `BitChord-Desktop-Updated-Portable.exe`: `b99197139f934feb859a9fabadddcee744453219432c96471b9d5e7e9cd94ab9`

The NSIS outer stub is PE32; the packaged application target is x64. Binaries are unsigned. The previous installer is preserved.

## Automated results

- **207 tests passed**: 48 Node tests plus 159 Vitest tests, zero failures/skips, locally and on the Windows build runner.
- Local production build/TypeScript validation passed.
- Local Electron upgrade smoke passed: real playback-time recording, no growth while paused, Library rendering, sidebar collapse, appearance reload persistence, local radio disabled and menu favorite.
- Windows source-app audio/import/security/persistence/close/Quit suite: exit 0.
- Windows WebM and H.264/AAC MP4 playback/fullscreen/Escape/F11/double-click/track-change restoration: exit 0. Old video is stopped and released while new audio continues.
- Windows real public Spotify oEmbed → save linked playlist → official iframe mount: exit 0. This does **not** certify playback inside Spotify's iframe.
- Initial Windows upgrade smoke hit a harness race resizing a window before creation. Waiting for firstWindow fixed it; the corrected upgrade check passed in run 44928890933.
- That run installed and launched the actual packaged version 1.1.0 successfully, then its playback test stopped at an ambiguous Local Music selector (sidebar and Library tile). No application change was required; navigation is now scoped to the sidebar.

Final upgrade and packaged installation/playback/close/uninstall validation: https://github.com/Manojpraba27/BitChord-Windows/actions/runs/44929197829 — **passed** (application binaries checksum-verified first). The isolated runner installed the NSIS package, launched the real packaged version 1.1.0, navigated/imported a generated MP3, verified its advancing playback position, closed during playback and confirmed the executable was removed by uninstall. The corrected Library/sidebar/appearance/favorite smoke also passed. This checks the same verified application binaries; subsequent source commits only adjust tests, workflows and documentation.

New SQLite tests cover measured seconds, no duration-derived estimates, ranking/schema persistence, invalid credits and unknown tracks. Generated MP3/FLAC/WAV/MP4/WebM fixtures contain synthetic test tones/images, not provider music. Library/Appearance screenshots show generated test data and are not an authenticated personal catalog.

## Provider and manual limits

No live authorized Spotify API import/login test was possible without a registered Client ID and permitted account. Full Spotify player playback, live YouTube website playback, personalized catalog/account synchronization, external lyrics/translation, Discord and scrobbler end-to-end acceptance remain unverified. Google OAuth is unconfigured and does not provide YouTube Music access.

Five Android screenshots informed the adaptation. Library/Appearance screenshots were reviewed, but full five-screen pixel parity and Android shader equivalence are not claimed. The newly mentioned installer ZIP and sixth/Home screenshot were unavailable; existing editable source and previous workspace installer were inspected.

Hosted `windows-latest` automation is separate from consumer Windows 10/11 device acceptance. Manual installation/uninstallation, hardware audio/output/media keys, real tray interaction, multi-monitor/fullscreen/high-DPI, accessibility and live provider accounts remain open. See WINDOWS-ACCEPTANCE.md and FEATURE-PARITY.md. The portable wrapper was packaged/hash-verified; a separate live launch of the portable wrapper has not been certified.
