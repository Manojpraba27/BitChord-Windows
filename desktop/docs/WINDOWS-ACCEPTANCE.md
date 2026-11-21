# Remaining manual checks — run separately on Windows 10 and Windows 11

The prior video/link preview passed hosted Windows playback/import/close/video suites. Consult TEST-REPORT.md for this updated revision. The following human/device checks are still open:

- [ ] Check Library statistics grow only during real playback; pause/buffer/restart and confirm persisted values. Check collapsed sidebar at desktop and narrow widths, and all new appearance settings.
- [ ] Compare Accounts, Library, expanded player, Appearance and song menu against the five Android reference images; verify light/dark/system and large text. Android shader effects are approximated.
- [ ] Install as a standard user; verify icon/name, Start Menu/desktop shortcuts and no unexpected administrator requirement.
- [ ] Play music, click Close with default Exit behavior, verify sound stops and BitChord exits fully.
- [ ] Explicitly enable tray playback; close and verify continued audio, tray Show/Pause/Quit, and complete stop on Quit.
- [ ] Play representative MP3/FLAC/WAV files through physical speakers/headphones; verify real hardware media keys and audio-output selection.
- [ ] Play local MP4/WebM; use Fullscreen, double-click, F11 and Escape on each monitor. Verify aspect ratio, no lost position and restored normal window bounds.
- [ ] Check 100%, 125%, 150% and 200% scaling; test Tamil/Hindi/Malayalam/English lyrics over bright artwork, light/dark/solid backgrounds and reduced motion/transparency.
- [ ] Import actual Spotify CSV/Playlists.json and supported Title CSV or M3U exports; check preview, optional local matching, unmatched labels, duplicates, Undo and persistence after restart.
- [ ] Confirm no developer ID is needed for file imports. Confirm Google profile connection remains visibly unconfigured until a registered OAuth app is implemented/configured. Official Spotify OAuth still needs a registered app and permitted account.
- [ ] Paste a real public Spotify playlist URL in Import Library, preview and save the linked playlist, reopen it after restart and test the official Spotify player. Check restricted/private link errors. Full track-list import requires a configured authorized account.
- [ ] Switch local Audio → Video → Audio, change tracks while fullscreen and navigate away; verify only one source plays and navigation/window bounds return. Test online YouTube window close/Audio return separately; provider restrictions may apply.
- [ ] Verify corrupt/missing media failures are clear and do not freeze the UI.
- [ ] Uninstall; verify application files are removed without deleting personal music or unexpectedly removing user data.

Record OS build, app SHA-256, hardware/display setup, result and evidence. Real provider authorization is not covered by fixture-based tests.

## Expanded-player regression (1.1.1)

- [ ] In the artwork/lyrics player, click the top-left X using a physical mouse; verify return to the main app and continued audio.
- [ ] Reopen; top-right fullscreen must hide the taskbar and cover the display. Test F11, Escape and closing while fullscreen; normal/maximized bounds must return.
- [ ] Verify AUDIO/VIDEO buttons appear in this expanded view. Test local MP4/WebM switching and close during video. Test an available online YouTube song separately in its official player window; provider restrictions apply.
