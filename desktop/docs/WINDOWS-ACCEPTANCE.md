# Remaining manual checks — run separately on Windows 10 and Windows 11

Automated hosted Windows playback/import/close/video suites passed. The following human/device checks are still open:

- [ ] Install as a standard user; verify icon/name, Start Menu/desktop shortcuts and no unexpected administrator requirement.
- [ ] Play music, click Close with default Exit behavior, verify sound stops and BitChord exits fully.
- [ ] Explicitly enable tray playback; close and verify continued audio, tray Show/Pause/Quit, and complete stop on Quit.
- [ ] Play representative MP3/FLAC/WAV files through physical speakers/headphones; verify real hardware media keys and audio-output selection.
- [ ] Play local MP4/WebM; use Fullscreen, double-click, F11 and Escape on each monitor. Verify aspect ratio, no lost position and restored normal window bounds.
- [ ] Check 100%, 125%, 150% and 200% scaling; test Tamil/Hindi/Malayalam/English lyrics over bright artwork, light/dark/solid backgrounds and reduced motion/transparency.
- [ ] Import actual Spotify CSV/Playlists.json and supported Title CSV or M3U exports; check preview, optional local matching, unmatched labels, duplicates, Undo and persistence after restart.
- [ ] Confirm no developer ID is needed for file imports. Confirm Google profile connection remains visibly unconfigured until a registered OAuth app is implemented/configured. Official Spotify OAuth still needs a registered app and permitted account.
- [ ] Verify corrupt/missing media failures are clear and do not freeze the UI.
- [ ] Uninstall; verify application files are removed without deleting personal music or unexpectedly removing user data.

Record OS build, app SHA-256, hardware/display setup, result and evidence. Real provider authorization is not covered by fixture-based tests.
