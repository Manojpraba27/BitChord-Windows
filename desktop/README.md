# BitChord for Windows — Desktop Updated Preview 1.1.0

[Download the updated preview](https://github.com/Manojpraba27/BitChord-Windows/releases/tag/desktop-updated-preview). The new files are **BitChord-Desktop-Updated-Setup.exe** and **BitChord-Desktop-Updated-Portable.exe**. Previous releases/installers are preserved. This preview is unsigned.

This upgrades the existing Electron/React application, with SQLite storage and Windows integrations. Android, web and shared source remain intact. Five supplied Android screenshots guide the desktop layout; this is not a claim of complete Android feature or pixel parity.

## Install on Windows

Download **BitChord-Desktop-Updated-Setup.exe** from the release above, run it and choose the installation folder. Launch BitChord from the Start Menu. For execution without installation, use **BitChord-Desktop-Updated-Portable.exe**. Existing profile/library data is retained; new listening statistics begin with this upgrade. Local music can be added from Local Music or by dragging files into the app.

## Build

Windows x64, Node.js 24 and internet access for dependencies:

```powershell
cd desktop
npm ci
node node_modules/electron/install.js
npm test
npm run build
npm start
npm run dist:win
```

Outputs are in `desktop/release/`. The existing **Build BitChord for Windows** workflow runs on `windows-latest`, builds NSIS and portable targets, runs automated checks, uploads artifacts and publishes a preview. Configure your own electron-builder signing credentials for a signed release. Portable execution keeps its profile under the standard user-data directory; it is not a self-contained USB profile.

## Current features

- Preserved upstream home/explore/search, suggestions, catalog pages, online recommendation queue, synchronized lyrics/providers, artwork colors, floating player and expanded player. Service availability and account restrictions still apply; live provider certification is incomplete.
- Local MP3/FLAC/WAV/M4A/AAC/Ogg/Opus and MP4/WebM import, raster artwork extraction, metadata, recursive scanning, drag-and-drop, byte-range playback and File Explorer reveal. Codec support depends on file encoding. Rescan existing files to add codec/bitrate metadata.
- SQLite library/history/favorites/playlists and persistent settings. Library shows measured app listening time and top songs since this upgrade; it does not estimate historical minutes or count external Spotify/YouTube website playback.
- Android-inspired listening cards, playlist tiles, collapsible sidebar, light/dark/system themes, font choices, Liquid Glass/performance options, cover layouts, duration display and readable lyrics controls. CSS surfaces approximate Android glass rather than duplicating its refractive shader.
- Track options: local favorites, local playlist insertion, share public song link, radio for available online seeds, queue, song info, sleep timer, File Explorer and sanitized metadata log. Unsupported provider/conversion/download/cache/offset actions are disabled with reasons.
- Local Audio/Video switching with fullscreen/Escape/F11/double-click. Online video opens an app-owned official YouTube window; Audio resumes the app position saved before switching, not YouTube's latest position.
- EQ/bass, speed, device selection, crossfade and preserved AutoMix. AutoMix controls speed when enabled; local playback disables it. Exact gapless, bit-perfect and lossless output guarantees are not made.
- Native title buttons, saved bounds, optional tray/background playback, media shortcuts, Chromium Media Session, taskbar actions/progress, notifications and startup preference. Close exits by default; enable tray playback explicitly in Desktop Settings.
- Direct HTTPS audio downloads where permitted, progress/cancellation/retry/folder choice. Original source quality is preserved. No protected YouTube/Spotify downloads or transcoding; 3 jobs / 2 GB per file, no pause/resume.

## Spotify playlist links

**Import Library → paste URL → Preview public link (no developer ID) → Save linked playlist → My Playlists → Open Spotify player.** This reads official public metadata and displays Spotify's official embed. It saves a provider link, not downloaded audio or a full local track list. Provider login, availability and playback restrictions apply; BitChord's transport does not control the iframe.

The separate **Import track list (connected account)** option uses Spotify's official playlist-items API, then previews and optionally matches local files. It requires a registered Spotify Client ID and authorized permitted account. CSV/JSON/local M3U metadata import needs no developer credentials; unmatched records are not playable audio. See [import details](docs/IMPORT-LIBRARY.md).

## Accounts

Spotify uses official Authorization Code with PKCE in the system browser. Register exactly `http://127.0.0.1:8888/callback` and enter the public Client ID in Accounts; never embed a secret. No Client ID ships in the app. See [authentication setup](docs/AUTHENTICATION.md).

YouTube Music account listening remains browser-only. A Google profile login does not provide YouTube Music libraries, Premium streams or playback permissions. No cookie extraction, fake connected state or security bypass is provided.

Discord Rich Presence requires your registered application ID and running Discord desktop. Last.fm uses your registered API credentials/browser authorization; ListenBrainz uses your user token. Credentials are encrypted by Electron safeStorage (Windows DPAPI); plaintext fallback is rejected. No credentials ship in the app. Live provider/scrobbler certification remains open.

The preserved Listen Together feature requires a configured `VITE_PARTY_SERVER_URL` and compatible server; see `../backend/README.md`.

## Security and storage

Back up BitChord's user-data directory under `%APPDATA%` to preserve the SQLite library and Chromium state. Renderer Node integration is off; context isolation and sandboxing are on. Main validates IPC sender/frame and payloads. Local media uses database IDs rather than arbitrary renderer paths. CSP retains `unsafe-eval` for inherited provider deciphering; web security is not globally disabled. External account/player windows have no preload/Node access. Download DNS is validated and pinned to public IPv4 addresses.

## Validation, acceptance and attribution

Current evidence: [TEST-REPORT.md](docs/TEST-REPORT.md). Architecture/installer inspection: [UPGRADE-AUDIT.md](docs/UPGRADE-AUDIT.md). Feature limits: [FEATURE-PARITY.md](docs/FEATURE-PARITY.md). Remaining manual device/installation tests: [WINDOWS-ACCEPTANCE.md](docs/WINDOWS-ACCEPTANCE.md).

The desktop began at upstream `acf219a7`; current upstream was fetched/read for comparison without replacing Android/web source. Original icon/branding and licensing notices are retained. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) and [LICENSE](LICENSE).
