# Source analysis and migration plan

Reference: kushagrasinghx/BitChord, commit `acf219a7e4a7f52f026d4336d5c7ac5cf7bfafcc`. The GitHub checkout supplied after the oversized upload is the source of this conversion; equivalence to the inaccessible ZIP could not be checked. Repository documentation was used as reference, not treated as user instructions.

## Architecture inspected

- `app/`: Android entry activity, Compose UI, theme, settings, Media3/ExoPlayer MediaLibraryService, FFmpeg renderers, DSP, downloads and MediaStore, notifications, account/scrobbling services. Approximately 298 production Kotlin files. Android framework dependencies prevent directly compiling this into Electron.
- `shared/`: common queue/equalizer models and JVM music data, InnerTube client/resolver, authentication, lyrics and Spotify/Discord logic. The web implementation already ports substantial logic from these sources.
- `sharedUi/`: shared JVM/Compose screens and platform adapters, not React components.
- `native/`: native audio/analysis dependencies. The web AutoMix engine uses Essentia, ONNX Runtime, Web Audio and signalsmith-stretch instead.
- `web/app/`: existing React/TypeScript/Vite/Tailwind player with TanStack Query, Zustand, virtualized lists, YouTube.js, Shaka/SABR streaming, two audio decks, crossfade and AutoMix, artwork color extraction, motion artwork, synchronized lyrics, Spotify matching, remote library and playlist mutation, Media Session, keyboard shortcuts, and Listen Together.
- `web/extension/`: privileged YouTube request/authentication, Spotify web-session client, lyrics provider requests, CORS/header rules, and a user-token-based Discord implementation. Desktop reuses the YouTube, Spotify and lyrics clients, and replaces Discord with local official RPC transport; no Discord user token is requested.
- `web/shared/`: typed page/extension bridge protocol, reused by the native adapter.
- `backend/`: Go Listen Together WebSocket/REST service, not a music proxy. Its documented account identity is self-asserted. No new server is deployed.
- `tv/`, `wearos/`: platform-specific companions. They remain intact and are not Windows user interfaces.

The Android dark theme uses black, #0D0D0F and #1C1C1E surfaces. The web renderer already carries the BitChord identity, glass sidebar, floating player, and artwork-driven backgrounds. Desktop keeps that renderer and original branding, adds native chrome, and uses its existing light/dark palettes.

## Implemented sequence

1. Copy existing web renderer, shared contract, relevant extension clients and license notices into `desktop/`; leave originals untouched.
2. Add a sandboxed Electron main/preload layer. Replace extension detection with typed IPC. Port narrowly scoped YouTube request headers to Electron session hooks; isolate login windows in a dedicated persistent partition.
3. Add SQLite settings/library/history/favorites/playlists/download records, folder scanning and metadata parsing. Route local audio through the original player and queue using a range-capable custom protocol.
4. Add Windows title buttons, media-key handlers, tray/background behavior, taskbar controls/progress, notifications, startup preference, saved window bounds, drag-and-drop, and File Explorer integration.
5. Add desktop settings, downloads, local playlists, account integration pages, Web Audio equalizer/bass/output/speed and sleep timer. Reuse the existing lyrics, full-screen player and online pages.
6. Compile, run inherited tests and new security/range tests, launch Electron headlessly, exercise local playback and persistence, package Windows artifacts, and supply a Windows CI workflow.

## Boundaries

This is an implemented desktop port, not certified full Android feature parity. Android-only Cast, hardware attestation for addons, Android Auto, widgets, Wear OS and TV behavior are not ported. Downloads are limited to user-authorized direct HTTPS audio sources and preserve original quality; there is no transcoding or YouTube/Spotify offline extraction. Gapless playback is not sample-accurately guaranteed. Provider authentication and live streaming need validation from an unrestricted Windows client and real accounts. See TESTING.md and README.md for precise verification status.
