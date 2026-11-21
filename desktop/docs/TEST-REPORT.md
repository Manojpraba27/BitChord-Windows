# Desktop updated preview validation

Local production build passed. Automated suite: **207 passed** (48 Node plus 159 Vitest), zero failures/skips. New SQLite tests check measured seconds, no duration-based estimates, top-song ordering, persistent schema initialization, invalid credits and unknown tracks.

The new Electron upgrade smoke passed for measured active playback, no listening-time growth while paused, Library rendering, sidebar collapse, appearance reload persistence, local radio unavailable state and menu favorite action. Screenshots were inspected against the supplied Library/Appearance visual direction; this is not complete five-screen pixel parity certification.

Existing local audio/import/persistence/security/shutdown smoke and MP4/WebM fullscreen/mode/track-change smoke passed. Windows execution of this new revision is pending; the prior video/link revision passed hosted Windows automation and a real public oEmbed save/iframe-mount check. Neither check certifies playback inside Spotify's iframe or live YouTube playback.

Windows 10/11 manual installation/uninstallation, physical audio/media keys, real tray interaction, high DPI/multiple displays and provider authentication remain open. No live authorized Spotify API import/account test was possible without a configured registered Client ID and permitted account.

## Previous video/link validation

# Video/link validation

Local production build passed. Automated suite: 204 tests passed (45 Node tests plus 159 Vitest tests), zero failures/skips. New tests validate playlist links/URIs/locale paths, hostile hosts, authorized paging, unavailable items, public oEmbed metadata without credentials, exclusion of provider HTML, link deduplication and preservation of renamed linked playlists. Provider responses in unit tests are simulated.

Local Electron smoke checks passed for playback, imported playlists, restart persistence, shutdown and the paste-link field's explicit missing-authorization behavior. WebM and H.264/AAC MP4 smoke checks passed for local Audio/Video switching, fullscreen/Escape/F11/double-click and changing tracks while fullscreen restoring Audio mode/navigation.

A real public Spotify oEmbed request succeeded through curl and returned actual playlist metadata. The local Electron public-link live-network check failed in this environment. The Windows workflow attempts the same check and reports it separately; mounting the official iframe is not certification of Spotify playback within it. No live authorized full-track import is certified, because no registered Client ID/account was supplied.

Online YouTube website playback is not certified here. It uses an app-owned official provider window rather than a new protected-stream extraction implementation. Native Windows 10/11 manual multi-monitor/high-DPI, physical audio/media-key, provider login/playback and installation acceptance remain outstanding.
