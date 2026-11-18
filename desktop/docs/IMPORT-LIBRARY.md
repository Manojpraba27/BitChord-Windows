# Library import without developer credentials

Open **Import Library**. Choose or drag one CSV/JSON/M3U/M3U8 file (maximum 10 MB, 10,000 entries, 200 playlists) into the center. Review the preview, matching counts and duplicate rows before confirming. Existing playlists with the same normalized name and source contents are skipped. New playlists are committed in a SQLite transaction; a failed commit rolls back. Undo removes only the playlists created by that import, including edits made to those imported playlists after the import.

Supported formats:

- CSV columns `Track Name`, `Artist Name(s)` (or `Artist Name`/`Artist Names`), `Album Name`; optional `Playlist Name`. Quoted commas, quoted newlines and Unicode text are supported.
- Spotify account-data JSON: `{ "playlists": [{ "name": "Favorites", "items": [{ "track": { "trackName": "Song", "artistName": "Artist", "albumName": "Album" } }] }] }`.
- Generic JSON `{ "name": "Playlist", "tracks": [{ "title": "Song", "artist": "Artist", "album": "Album" }] }` or an array of these tracks.
- Local M3U/M3U8: EXTINF title/artist and entry ordering are imported as metadata. Paths are not automatically followed. Add the actual music files through Local Music first; exact unique metadata matches become playable. Remote M3U stream URLs are rejected.
- Google/YouTube CSV exports containing a `Title` column are imported as metadata; video IDs are not used as playback/download authorization. Other Takeout schemas, ZIP archives and arbitrary Google JSON formats are not automatically supported.

Optional local matching requires a unique normalized title and artist; a missing artist allows only a unique title match. Ambiguous entries stay unmatched. Imported metadata is labeled **Unmatched** until a local file was matched during preview. Re-importing the same file skips the existing playlist; remove that imported playlist first if you want to rematch it after adding more audio files.

This does not download Spotify or YouTube songs, authorize online playback or scrape playlist URLs. Official Spotify OAuth still requires a registered developer application if you choose online API access. Basic file import requires no Client ID.

## Paste a Spotify playlist link

Open Import Library, paste a full `https://open.spotify.com/playlist/...` URL and choose Preview playlist link. Localized `intl-xx` URLs and `spotify:playlist:...` URIs are accepted. Short links and non-playlist URLs are rejected.

The full track list is read through Spotify's official API using your authorized account. If the account/app is not configured, the app explains the requirement; it does not scrape Spotify or pretend to import tracks. Use CSV/JSON export import if you cannot configure OAuth. Private or restricted playlists may still be unavailable to the authorized account. Imported entries are metadata unless uniquely matched to your local files.

## Public linked playlists — no developer ID

Paste a public Spotify playlist URL, choose **Preview public link (no developer ID)**, then **Save linked playlist**. Open **My Playlists → Open Spotify player** to display the official Spotify embed. The public metadata comes from Spotify's documented oEmbed endpoint; returned HTML is never injected. Only a fixed, validated Spotify iframe URL is used.

This linked-playlist option saves the URL/name and zero local tracks. It does not download music, match each song locally or bypass Spotify playback restrictions. Use **Import track list (connected account)** for an authorized track-record import, or use CSV/JSON files for credential-free track metadata. Private/restricted links may not have public metadata.
