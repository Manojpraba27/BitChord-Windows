export function GoogleConnection() {
  return (
    <div className="desktop-card">
      <h2>Google account · optional profile connection</h2>
      <strong>Not configured</strong>
      <p>
        A registered Google OAuth desktop application is required before this
        feature can be enabled. No Google OAuth Client ID is bundled. No sign-in
        window or redirect is started while configuration is missing.
      </p>
      <p>
        App-owner setup: create an OAuth application in Google Cloud Console,
        configure its consent screen and test-user eligibility, register a
        Desktop app client with a supported loopback callback, and enable only
        OpenID profile permissions needed for name and picture. A production
        integration needs verified callback, ID-token and secure-session
        handling before activation.
      </p>
      <p>
        A Google profile connection would identify your account only. It would
        not unlock YouTube Music playlists, playback, downloads or
        subscriptions. For signed-in music listening, use the official YouTube
        Music browser option below.
      </p>
    </div>
  );
}
