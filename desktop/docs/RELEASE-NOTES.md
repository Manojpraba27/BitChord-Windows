# Video and playlist-link preview

Audio/Video switching now restores fullscreen/navigation state when changing tracks or leaving local Video mode. Local codec errors include retry and Windows-player fallback actions. Both H.264/AAC MP4 and VP8/Vorbis WebM fixtures are tested. Online YouTube video opens in an app-owned official YouTube website/player window; returning to Audio resumes the BitChord position saved before switching. YouTube's current position is not read or seamlessly synchronized, and provider restrictions may block playback.

## Paste Spotify links in the app

Import Library has two explicit options:

1. **Preview public link (no developer ID)** → **Save linked playlist** → **My Playlists** → **Open Spotify player**. The app reads Spotify's official public oEmbed metadata and displays Spotify's official embed. This saves a provider link, not downloaded songs or an imported local track list. Spotify controls previews, sign-in, availability and playback restrictions. Main BitChord transport does not control the embed.
2. **Import track list (connected account)** reads the full authorized list through Spotify's current official `/playlists/{id}/items` API and reuses preview/local matching/save/undo. It requires a configured, authorized Spotify API connection. Private or restricted playlists may still be inaccessible. No live authorized account test is claimed.

CSV/JSON metadata importing remains available without developer credentials. No scraping, cookie import or DRM workaround is implemented.

Unsigned Windows preview. Native Windows test/build status and remaining provider/manual limitations are recorded in TEST-REPORT.md.
