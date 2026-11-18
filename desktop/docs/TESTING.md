> Historical baseline report. Current Windows build/native validation results are in [TEST-REPORT.md](TEST-REPORT.md).

# Verification report

Tested in Linux, 17 November 2026, using Node 24 and Electron 45.3.3.

- Renderer TypeScript and Vite production build: passed.
- Main/preload esbuild bundles: passed.
- 159 inherited web regression tests across 16 suites: passed.
- Six new IPC-origin, download validation and media range tests: passed.
- Electron headless launch and native bridge ping: passed.
- Local WAV import and playback: passed.
- MP3 and FLAC decode/playhead advancement using generated test audio: passed.
- Local protocol partial-byte response: passed (206, expected byte count).
- Playback pause through the native media-command IPC path: passed.
- Local playlist creation: passed.
- SQLite library/favorites/playlists and settings persistence across restart: passed.
- Dark-theme persistence and rendering: passed.
- Production dependency audit: no reported vulnerabilities at test time.
- Windows x64 portable packaging: completed; unsigned executable produced.
- Standard NSIS installer: blocked by missing Wine during uninstaller generation. The incomplete setup stub was removed. Build on Windows using the included workflow or README commands.

The smoke harness disables the Linux process sandbox and skips tray creation solely for headless testing. The normal application retains sandboxing and creates the tray. No mock catalog ships in the application. Generated test tones exist only in temporary smoke-test directories.

## Not verified end to end

Live search/streaming and lyrics requests encountered environment TLS/certificate restrictions. Real provider accounts were not supplied. YouTube authentication, Spotify playlists, Last.fm, ListenBrainz, Discord presence, authorized remote downloads, and Listen Together need real-service validation. No claim is made that the Android feature set has complete parity.

Native Windows media keys/SMTC, tray, taskbar, notifications, startup, installer install/uninstall and Windows audio outputs require a Windows 10/11 acceptance run. The portable binary has been packaged and inspected as a Windows executable, not launched on Windows.

## Windows acceptance sequence

1. Build with Node 24: npm ci; node node_modules/electron/install.js; npm run build; npm test; npm run dist:win.
2. Install and launch; check window controls, bounds restoration, tray close/reopen, notifications and startup option.
3. Import MP3, FLAC and WAV; play, pause, seek, change volume/speed/output, queue tracks, shuffle/repeat and crossfade. Verify EQ/bass and sleep timer.
4. Search anonymously and play an available track; verify recommendations, album/artist/playlist navigation and timed lyrics.
5. Sign in to YouTube/Spotify and verify account switching, library reads and playlist mutations. Test logout.
6. Configure your own Discord app ID and scrobbling credentials. Verify presence and a qualifying listen at each provider.
7. Download a small explicitly permitted HTTPS audio file; verify progress, cancellation, failure handling and offline replay.
8. Restart and verify persistence; test the portable build separately. Uninstall while preserving user music.
