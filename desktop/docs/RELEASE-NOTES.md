# BitChord account login fix preview

Official Spotify browser Authorization Code + S256 PKCE flow now verifies the exact loopback callback and OAuth state, accepts it once, validates the authorized profile before saving, binds encrypted tokens to their Client ID, serializes refresh, and supports cancellation, reconnect, disconnect, timeout and sanitized diagnostic events.

All account UI entry points now open separate Liquid Glass account cards. Spotify shows real verified status/profile, setup instructions and clear errors. YouTube Music explains its browser-only account support instead of sending users through a Google redirect that never connects BitChord.

REQUIRED: Create a Spotify developer application and register http://127.0.0.1:8888/callback exactly, then enter its public Client ID. No Client Secret is used. The previous 43821 callback is not used by this build. Spotify development account eligibility and API restrictions apply.

Live Spotify authorization has not been verified because no registered app/test account is available. Google OAuth does not grant YouTube Music library/playback access; this remains unsupported in BitChord. Use the official website for account listening. No security bypass or cookie import is provided.

Unsigned Windows preview; manual Windows 10/11 acceptance is not complete. Full diagnosis and setup: docs/AUTHENTICATION.md.
