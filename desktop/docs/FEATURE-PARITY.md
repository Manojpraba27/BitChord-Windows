# Current feature parity

Implemented: exit-by-default close; explicit tray option; shutdown of owned renderer/media resources; local video fullscreen controls and mode-position handoff; premium Now Playing controls; lyrics contrast panel; existing appearance settings; import center with CSV/JSON/local M3U metadata, preview, optional matching, duplicate detection, atomic save and undo.

Spotify metadata import does not need developer credentials and does not download audio. Only uniquely matched local files are played from imported playlists. Spotify online OAuth requires a registered Client ID. Playlist URLs are not scraped. Broad Takeout formats beyond supported Title CSV and named JSON shapes are not implemented. M3U paths are not automatically opened.

Google profile OAuth is not configured because registered credentials are unavailable. The UI explains app-owner setup; no fake sign-in flow is provided. Google profile sign-in would not unlock YouTube Music library/playback. YouTube Music signed-in listening remains browser-only.

Requires native Windows verification: actual tray icon menu behavior, multi-monitor/fullscreen and high-DPI transitions, Windows 10/11 installation/uninstallation and live account authorization. Automated Windows desktop smoke attempts are reported separately from unit tests.

Existing Android-only Auto/widgets/Wear OS/attestation features, exact gapless guarantees, download pause/resume, and service-protected offline downloads remain outside this preview.

## Native automation completed

Hosted Windows validation passed for WAV/MP3/FLAC decoding/playhead, seeking, media-command handling, imports/undo, restart persistence, close/Quit during playback, and local WebM fullscreen/Escape/F11/double-click behavior. Native tray-icon interaction, physical media keys/audio output, multiple monitors/high DPI and manual Windows 10/11 installation/uninstallation remain unverified. Google OAuth remains unconfigured, with explicit setup guidance and no fake login.

## Video/link update

Public Spotify links can be saved as linked playlists using official oEmbed metadata, without a developer ID; their tracks are displayed by the official Spotify iframe. This is not a local track-list import or audio download. Full authorized track-record import is a separate API option using `/playlists/{id}/items`. Private/restricted links may be unavailable.

Local Audio/Video handoff restores fullscreen/navigation when changing tracks; unsupported codecs have a Windows-player fallback. Online YouTube video uses an app-owned official website/player window. Returning to Audio resumes the previous app position, not the provider's latest position. Live YouTube playback and full Spotify embed playback are not certified.


## Desktop updated preview (1.1.0)

Implemented: collapsible persistent sidebar; Library dashboard with measured playback seconds, starts and top songs since this upgrade (no inferred historical minutes); local favorite/new playlist/import tiles; Radio page reusing existing online autoplay recommendations (local seeds disabled); Windows/system, rounded and serif fonts; independent Liquid Glass toggle and lower-blur performance mode; progressive title blur; artwork blend toggle; expanded player/detail-cover layouts; duration display toggle.

Track menus now offer local favorites, local playlist insertion, public-link sharing, queue actions, song information including available scanned codec/bitrate, 30-minute sleep timer/cancel, File Explorer and sanitized metadata logs. Dislike/account mutations, quality upgrades, conversion, protected downloads/cache removal and per-song lyrics offset remain disabled with reasons. Local artwork extraction remains bounded raster-only; rescan existing files to add new audio format metadata.

Five Android reference screenshots inform the adaptation. No exact pixel-parity claim is made; native Android refraction is approximated with desktop CSS surfaces. Radio's live recommendations, provider playback/account tests, physical devices and Windows 10/11 manual acceptance remain separate from automated coverage.

## Release acceptance matrix

| Requested area | Current state / verification limit |
| --- | --- |
| Home, Explore, search, suggestions, online albums/artists | Existing upstream implementation retained; live backend availability and personalized accounts are not certified |
| Library statistics and local favorites/playlists | New real SQLite statistics and local workflows; automated validation recorded in TEST-REPORT |
| Library artists/albums | Preserved catalog/account pages; a separate grouped local-album/artist browser has not been added |
| Radio | Existing song/autoplay recommendation engine exposed; local seed disabled, live recommendation availability unverified |
| Expanded player and mini-player | Existing player retained with cover/font/blur controls; optional separate native mini-window not implemented |
| Lyrics | Existing synchronized providers retained; external provider/translation availability unverified; per-song offset not implemented |
| Audio controls | Existing queue/shuffle/repeat/speed/EQ/bass/output/crossfade retained; no exact gapless/bit-perfect guarantee |
| Downloads | Permitted direct audio files only; no protected offline service downloads or pause/resume |
| Spotify | Public playlist links + optional official PKCE API connection; no bundled developer app or live authorized account certification |
| Google / YouTube Music | Official site listening only; no app account-library synchronization, Premium-stream entitlement or profile selection |
| Discord / Last.fm / ListenBrainz | Existing native RPC/authorized scrobblers preserved; user configuration and live service acceptance required |
| Window controls/tray/media/taskbar/startup | Existing native integration retained; physical keys, real tray interaction and hardware/manual display acceptance remain open |
| Installer / portable | Both x64 packages built and SHA-256 verified; hosted Windows installer installation, packaged MP3 playback, close and uninstall passed. Portable wrapper live launch and manual Windows 10/11 acceptance remain open |
| Android visual parity | Five references used; desktop adaptation, no claim of exact refraction/pixel parity. Home reference and newly mentioned installer ZIP were unavailable |


## Player controls fix (1.1.1)

Expanded-player X and native fullscreen controls are repaired; Audio/Video controls are available in the expanded artwork/lyrics view as well as Now Playing. Local video is in-app; online video uses the official provider window with its existing limitations. The real installed 1.1.1 app passed X, native fullscreen/F11/Escape, local video/audio switching and closing during video with resumed audio. Details and remaining physical/device/provider checks are in TEST-REPORT.md.
