# Video/link validation

Local production build passed. Automated suite: 204 tests passed (45 Node tests plus 159 Vitest tests), zero failures/skips. New tests validate playlist links/URIs/locale paths, hostile hosts, authorized paging, unavailable items, public oEmbed metadata without credentials, exclusion of provider HTML, link deduplication and preservation of renamed linked playlists. Provider responses in unit tests are simulated.

Local Electron smoke checks passed for playback, imported playlists, restart persistence, shutdown and the paste-link field's explicit missing-authorization behavior. WebM and H.264/AAC MP4 smoke checks passed for local Audio/Video switching, fullscreen/Escape/F11/double-click and changing tracks while fullscreen restoring Audio mode/navigation.

A real public Spotify oEmbed request succeeded through curl and returned actual playlist metadata. The local Electron public-link live-network check failed in this environment. The Windows workflow attempts the same check and reports it separately; mounting the official iframe is not certification of Spotify playback within it. No live authorized full-track import is certified, because no registered Client ID/account was supplied.

Online YouTube website playback is not certified here. It uses an app-owned official provider window rather than a new protected-stream extraction implementation. Native Windows 10/11 manual multi-monitor/high-DPI, physical audio/media-key, provider login/playback and installation acceptance remain outstanding.
