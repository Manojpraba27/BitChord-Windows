# Current parity and limitations

Implemented source: Liquid Glass appearance settings and persistence; contrast-protected lyrics panel; original synchronized lyrics; multilingual OS-font fallbacks; official Spotify PKCE and API library access; explicit Google sign-in limitation; local Audio/Video controls; local artwork extraction and playlist editing; permitted direct-file downloads with progress, cancel, retry, duplicate checks and SHA-256.

Not implemented: supported YouTube Music account OAuth, DRM/offline service downloads, download pause/resume, per-song remote download URLs absent from upstream catalog, local video fullscreen custom controls beyond browser controls, precise gapless guarantees, offline scrobble retry.

Unverified: actual Spotify account OAuth/API restrictions, local video codec behavior and switching in native Windows, live lyrics/streaming, installed Tamil/Hindi/Malayalam font coverage, Windows 10/11 visual scaling, native tray/media/taskbar behavior and install/uninstall acceptance.

Existing Android-only Auto/widgets/Wear OS/attestation features remain outside this desktop port.

## Authentication fix preview

Spotify callback/session/state/profile UI fixes are implemented and tested with simulated provider responses. The exact registered redirect is http://127.0.0.1:8888/callback. A real Spotify developer app/client ID and permitted account remain necessary. No live login is certified. YouTube Music account access is intentionally browser-only and never marks BitChord connected.
