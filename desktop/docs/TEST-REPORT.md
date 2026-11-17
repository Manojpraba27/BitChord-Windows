# Current verification

Production compilation passed. 167 automated tests passed (159 inherited and eight desktop tests), zero failures. Electron smoke checks passed for startup, WAV/MP3/FLAC playback, range requests, native IPC pause, playlists and restart persistence. Artwork tests cover encoding and rejection of active/oversized formats. Playlist editor compiles but has not had automated interaction coverage.

Native Windows tests: none. Installer and live integrations remain unverified. GH_TOKEN is rejected; expiry versus revocation is unknown.

The portable EXE is the earlier verified build and does NOT include this turn’s artwork/editor changes. The source ZIP includes those changes. A new Windows build is required.
