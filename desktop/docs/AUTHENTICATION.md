# Account authentication diagnosis and configuration

## Root causes

- The inherited sidebar still linked directly to Google ServiceLogin. Electron opened that website in the system browser; there was no OAuth callback or supported YouTube Music account API to turn that browser session into a BitChord session. Browser redirects cannot transfer Google cookies into this app.
- The app did not ship a registered Spotify Client ID. The previous UI showed duplicate connection buttons and a blank Client ID after restart, gave no connection/profile status, and did not invalidate the Spotify data queries when login completed.
- Previous Spotify token storage was not bound to its Client ID; trying another app could break refresh of the previous session. Refresh had no concurrency guard. The previous callback had no explicit cancellation, accepted repeated callbacks, and error handling did not distinguish a rejected token/profile or listener conflict. The legacy bridge's normal 30-second request deadline was shorter than the 3-minute login window.

## Spotify setup required

The owner reported that no Spotify developer application exists yet. No live authorized account test has been performed.

1. Open https://developer.spotify.com/dashboard and create an application, subject to Spotify's current eligibility rules.
2. Register exactly `http://127.0.0.1:8888/callback` as a redirect URI. The old `43821` URI is no longer used by this build.
3. In development mode, add the Spotify account you will authorize to the app's permitted users where Spotify requires it. Follow current account/subscription and API-access restrictions.
4. Copy the public 32-character Client ID into BitChord → Accounts → Spotify. Never enter a Client Secret.
5. Choose Connect Spotify, approve in the default browser, then return to BitChord. Keep BitChord running. If you cancel, deny permission, or wait more than three minutes, use Retry/Connect again.

The loopback listener binds IPv4 localhost before opening the browser, verifies the exact Host/path/method and random state, accepts a callback once, exchanges using S256 PKCE, verifies the account profile, and encrypts tokens with the OS credential service. Tokens are bound to the Client ID. Refresh requests are serialized. Disconnect cancels pending login and clears encrypted tokens. Rejected/new authorizations preserve the previous valid session. Browser token storage and Google passwords are never collected.

An expired/revoked refresh grant requires reconnecting. A network failure is not automatically a logout. Diagnostic events show only static event names and sanitized HTTP codes; they exclude URLs, authorization codes, states, tokens and provider response bodies.

## YouTube Music

There is no implemented official YouTube Music account-library/playback OAuth API. YouTube Data API OAuth alone does not provide these features. Embedded Google authentication can also be restricted. BitChord does not attempt cookie extraction, browser-session import or a security bypass.

All desktop account entry points now lead to Accounts. The YouTube Music card explicitly says browser only, remains disconnected, and opens the official website for signed-in listening. Opening that website never claims to log BitChord in. It reports browser-launch errors with a retryable button. No redirect listener or loop is created for Google.

## Testing boundaries

OAuth tests use a real local HTTP listener and simulated provider responses. They verify callback success, missing ID, wrong route/state, denial, cancellation/reconnect, timeout, network failure, token/profile rejection, expired-token refresh, concurrent refresh, restart persistence, sanitized diagnostics, port conflict and preservation of an existing session on denial. They are not a successful live Spotify authorization. OS encrypted storage uses the existing Electron safeStorage implementation; simulated persistence tests do not certify DPAPI manually.
