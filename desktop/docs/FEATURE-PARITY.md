# Current feature parity

Implemented: exit-by-default close; explicit tray option; shutdown of owned renderer/media resources; local video fullscreen controls and mode-position handoff; premium Now Playing controls; lyrics contrast panel; existing appearance settings; import center with CSV/JSON/local M3U metadata, preview, optional matching, duplicate detection, atomic save and undo.

Spotify metadata import does not need developer credentials and does not download audio. Only uniquely matched local files are played from imported playlists. Spotify online OAuth requires a registered Client ID. Playlist URLs are not scraped. Broad Takeout formats beyond supported Title CSV and named JSON shapes are not implemented. M3U paths are not automatically opened.

Google profile OAuth is not configured because registered credentials are unavailable. The UI explains app-owner setup; no fake sign-in flow is provided. Google profile sign-in would not unlock YouTube Music library/playback. YouTube Music signed-in listening remains browser-only.

Requires native Windows verification: actual tray icon menu behavior, multi-monitor/fullscreen and high-DPI transitions, Windows 10/11 installation/uninstallation and live account authorization. Automated Windows desktop smoke attempts are reported separately from unit tests.

Existing Android-only Auto/widgets/Wear OS/attestation features, exact gapless guarantees, download pause/resume, and service-protected offline downloads remain outside this preview.

## Native automation completed

Hosted Windows validation passed for WAV/MP3/FLAC decoding/playhead, seeking, media-command handling, imports/undo, restart persistence, close/Quit during playback, and local WebM fullscreen/Escape/F11/double-click behavior. Native tray-icon interaction, physical media keys/audio output, multiple monitors/high DPI and manual Windows 10/11 installation/uninstallation remain unverified. Google OAuth remains unconfigured, with explicit setup guidance and no fake login.
