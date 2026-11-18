# BitChord for Windows

A native Electron desktop port of the existing BitChord React player, with SQLite storage and Windows integration. Original Android, web and shared modules are preserved outside this directory. This is a functional port with remaining live-service and Windows validation work, not a claim of complete Android parity.

## Build and run

Windows 10/11 x64, Node.js 24 LTS, npm and Internet access for dependencies:

```powershell
cd desktop
npm ci
node node_modules/electron/install.js
npm run build
npm start
```

Electron 45's binary installer is an explicit step; its npm package may not automatically download the runtime. `npm run build` checks the renderer with TypeScript, bundles the original React app with Vite, and bundles the Electron main/preload processes with esbuild.

```powershell
npm test
npm run dist:win
```

Outputs: `release/BitChord-Setup.exe` and `release/BitChord-Portable.exe`. The repository includes `.github/workflows/desktop-windows.yml`; run **Build BitChord for Windows** in GitHub Actions to reproduce the Windows build. This workflow was added locally, not pushed or executed on GitHub.

For a signed public release, configure your own electron-builder signing credentials in CI. The supplied cross-built portable binary is unsigned. The setup installer and portable build now complete successfully on the Windows GitHub Actions runner. The portable executable runs without installation but keeps its database/settings in the standard user-data directory; it is not a self-contained USB profile.

## What is implemented

- Original online home, search/suggestions, explore, albums, artists, playlists, signed-in library and favorites, recommendations, shuffle/repeat, queue editing and crossfade.
- Original artwork color extraction/animations, light/dark themes, floating player, full-screen player, synchronized line/word lyrics and inherited providers/translation where available.
- Local MP3/FLAC/WAV/M4A/AAC/Ogg/Opus import, metadata, recursive folder scanning, drag-and-drop, byte-range playback, queue integration and File Explorer reveal. Actual decoder support depends on the file codec, not just its extension.
- SQLite local library, history, favorites, local playlists, settings and download records. Save a current queue on **My Playlists**, including local and online tracks.
- Download manager for direct HTTPS audio files whose source permits saving; progress, cancellation, error reporting and destination selection. Files retain original source quality. Redirects and private-network sources are rejected; at most three jobs, 2 GB per file. Restarting an interrupted job requires starting it again.
- Native window buttons, saved bounds, tray menu, close to tray, background playback, media keys, Chromium Media Session metadata, Windows taskbar actions/progress, notifications and startup setting.
- Six-band EQ, bass shelf, playback speed, output device selection, sleep timer. EQ shares the original AutoMix audio graph; AutoMix controls speed while enabled. Local playback disables AutoMix; normal crossfade remains available. Exact gapless handoff is not guaranteed.
- Official Spotify browser OAuth with a registered Client ID; YouTube Music account listening is browser-only. Spotify supplies catalog/playlist matching, not unrestricted Spotify audio streaming.
- Discord desktop IPC Rich Presence using a user-supplied registered application ID, without user-token collection.
- Last.fm browser authorization using your own registered API key/secret; ListenBrainz token validation and submissions. Scrobbling counts time spent playing and triggers after half a track or four minutes for tracks longer than 30 seconds. OS-encrypted credential storage is required. Failed submissions are reported but not queued for retry offline.

## Accounts and configuration

Use **Accounts** for sign-in, Discord application ID, Last.fm credentials, and ListenBrainz token. Finish provider sign-in and return to the app; Google may reject embedded sign-in in some environments. Cookies remain in the dedicated Electron account partition, never in renderer IPC responses. Last.fm/ListenBrainz credentials use Electron safeStorage (Windows DPAPI). No credentials are shipped.

The original Listen Together page is retained. To enable it, set `VITE_PARTY_SERVER_URL=https://your-server` in `desktop/.env.local` before building and configure that server to accept the desktop origin. See `../backend/README.md`. An unconfigured server is shown as unavailable, not replaced with fake parties.

## Keyboard controls

Space: play/pause. Ctrl+Left/Right: previous/next. Ctrl+Up/Down: volume. Ctrl+F or `/`: search. Escape: close full-screen/side panel. Hardware media keys work through Electron when registration succeeds. Windows native tray/taskbar/media behavior still needs testing on Windows.

## Storage and security

Data lives in Electron's per-user BitChord directory (`%APPDATA%` on Windows); `bitchord.sqlite` contains the desktop library/settings. Existing web state/cache uses the Chromium profile. Images use Chromium's disk cache; lyrics and analysis retain upstream caches. Back up the user-data directory to preserve your library.

The renderer has no Node integration, uses context isolation and sandboxing, and receives a fixed preload API. Main validates the calling window/frame/origin and command payloads. Files are streamed only by database ID; path traversal and invalid ranges are rejected. The custom app protocol has CSP; `unsafe-eval` is retained because the inherited YouTube player deciphering/BotGuard code requires it. Web security is not globally disabled. External account windows have no preload or Node access. Provider request hosts are restricted by the inherited clients. Download DNS is validated and pinned to a public IPv4 address.

## Validation and remaining work

See [docs/TESTING.md](docs/TESTING.md) for actual results and Windows acceptance checks. Live YouTube streaming, authenticated libraries/Spotify, external lyric providers, scrobblers, permitted remote downloads and native Windows controls have not been end-to-end certified in this Linux environment. No fake music catalog or fallback demo data is shipped. Network failures remain visible in the existing error states.

The desktop is based on repository commit `acf219a7e4a7f52f026d4336d5c7ac5cf7bfafcc`; the original ZIP could not be accessed due to its size. Architecture/migration notes: [docs/ANALYSIS.md](docs/ANALYSIS.md). Licenses and inherited asset caveats: [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Liquid Glass update

Open **Appearance** for glass/classic light/dark/system themes, opacity, blur, accent, dynamic colors, reduced-motion/transparency, and lyrics typography/background controls. Default is Liquid Glass Dark. **Accounts → Spotify · official OAuth** requires a registered Spotify client ID and the redirect `http://127.0.0.1:8888/callback`; tokens remain in OS-encrypted storage. Google embedded sign-in is unavailable and returns an explanatory message. Consult docs/RELEASE-NOTES.md for current provider limitations.

Download the current unsigned preview installer and portable at https://github.com/Manojpraba27/BitChord-Windows/releases/tag/liquid-glass-preview . Consult docs/TEST-REPORT.md for verified results and remaining manual checks.

## Account login fix

The current auth-fix-preview uses **http://127.0.0.1:8888/callback** (replacing the earlier 8888 URI). Create a Spotify developer application, register that exact URI, and enter its public Client ID in Accounts. No Client Secret is required. Connection succeeds only after token exchange and profile verification. Setup, sanitized diagnostics and provider limitations: [docs/AUTHENTICATION.md](docs/AUTHENTICATION.md). YouTube Music remains browser-only; signing in on its website does not connect BitChord.

Current account-fix downloads: https://github.com/Manojpraba27/BitChord-Windows/releases/tag/auth-fix-preview . The public Client ID is required; no valid client ID ships in the installer. See docs/AUTHENTICATION.md.
