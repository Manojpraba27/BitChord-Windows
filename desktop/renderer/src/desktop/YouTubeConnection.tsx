import { useState } from "react";
import { native } from "./api";
export function YouTubeConnection() {
  const [status, setStatus] = useState("");
  return (
    <div className="desktop-card">
      <h2>YouTube Music</h2>
      <strong>Browser only · not connected to BitChord</strong>
      <p>
        Google sign-in in your browser does not create a BitChord session. There
        is no official YouTube Music API here for account-library or
        music-streaming access. Google’s YouTube Data API OAuth is a different
        capability and does not grant those features.
      </p>
      <p>
        For signed-in listening, open the official YouTube Music website. Your
        Google password and cookies stay with the provider. Returning to this
        app will not change this connection status.
      </p>
      <button
        onClick={async () => {
          try {
            await native.call("openYouTubeMusic");
            setStatus(
              "Opened YouTube Music in your default browser. BitChord remains disconnected.",
            );
          } catch {
            setStatus(
              "Could not open your default browser. Check Windows browser settings and retry.",
            );
          }
        }}
      >
        Open YouTube Music in browser
      </button>
      <p role="status">{status}</p>
    </div>
  );
}
