# BitChord library and player preview

- Close now defaults to exiting BitChord and stopping owned audio/video resources. **Close Button Behavior** offers explicit tray playback. Tray Show, Pause and Quit actions remain available. Quit follows the same shutdown path and cancels pending OAuth.
- Import Library supports Spotify CSV/JSON playlist metadata, generic JSON, local M3U/M3U8 metadata and Title-column Google/YouTube CSV. Preview, optional unique local matching, duplicate detection, transaction rollback and persistent undo are included. Unmatched metadata is not advertised as playable audio.
- Local video has a visible fullscreen action, double-click/F11, Escape restoration, preserved position and auto-hiding overlay. Electron window fullscreen is used for local video; native Windows multi-monitor/high-DPI behavior still needs manual acceptance.
- Now Playing adds large artwork, playback/queue/favorite/volume/progress controls and links to the existing lyrics/full-screen experience. Lyrics backgrounds protect contrast, including bright canvas art. Existing appearance settings are retained.
- Spotify file import needs no developer ID. Official Spotify account OAuth remains optional and requires a registered application. No valid app-owner Client ID is available.
- Google profile OAuth is not configured. The account card explains the required registered desktop OAuth app and its limited profile-only purpose. No broken Google sign-in button or fake connected state is shown. YouTube Music account access remains browser-only.

Unsigned Windows preview. Live Spotify/Google authorization and manual Windows 10/11 acceptance are not certified. Native automated smoke results, including any runner limitations, are recorded in TEST-REPORT.md and the release's Windows smoke logs.
