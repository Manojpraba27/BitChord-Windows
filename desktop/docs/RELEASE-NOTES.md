# BitChord Desktop Updated Preview — 1.1.0

This is an incremental upgrade of the existing Electron application. Previous installers and Android/web source are preserved. New artifacts are named `BitChord-Desktop-Updated-Setup.exe` and `BitChord-Desktop-Updated-Portable.exe`.

- Android-reference Library dashboard with real measured listening data, top songs and playlist tiles.
- Collapsible persistent sidebar and Radio page using the existing online autoplay engine.
- Expanded appearance settings, reduced-motion canvas behavior and a lower-cost Glass fallback.
- Desktop track menu: local favorites/playlists, sharing, queue, sleep timer, actual scanned audio format details, File Explorer and sanitized logs. Unsupported actions explain their limits.
- Proper square Windows/tray icon reused from the original Android branding; original wordmark remains intact.
- Existing local Audio/Video switching, fullscreen restoration, public Spotify links and official provider windows retained.

Five supplied Android screenshots informed the layout. Desktop blur approximates Android glass; exact shader/pixel parity is not claimed. See UPGRADE-AUDIT.md and FEATURE-PARITY.md for preserved architecture and limits. Live account authorization/provider playback and manual Windows 10/11 acceptance remain unverified.

## Previous video/link changes

# Video and playlist-link preview

Audio/Video switching now restores fullscreen/navigation state when changing tracks or leaving local Video mode. Local codec errors include retry and Windows-player fallback actions. Both H.264/AAC MP4 and VP8/Vorbis WebM fixtures are tested. Online YouTube video opens in an app-owned official YouTube website/player window; returning to Audio resumes the BitChord position saved before switching. YouTube's current position is not read or seamlessly synchronized, and provider restrictions may block playback.

## Paste Spotify links in the app

Import Library has two explicit options:

1. **Preview public link (no developer ID)** → **Save linked playlist** → **My Playlists** → **Open Spotify player**. The app reads Spotify's official public oEmbed metadata and displays Spotify's official embed. This saves a provider link, not downloaded songs or an imported local track list. Spotify controls previews, sign-in, availability and playback restrictions. Main BitChord transport does not control the embed.
2. **Import track list (connected account)** reads the full authorized list through Spotify's current official `/playlists/{id}/items` API and reuses preview/local matching/save/undo. It requires a configured, authorized Spotify API connection. Private or restricted playlists may still be inaccessible. No live authorized account test is claimed.

CSV/JSON metadata importing remains available without developer credentials. No scraping, cookie import or DRM workaround is implemented.

Unsigned Windows preview. Native Windows test/build status and remaining provider/manual limitations are recorded in TEST-REPORT.md.
