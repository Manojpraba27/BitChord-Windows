import { useEffect, useState } from "react";
import { native } from "./api";
import { queryClient } from "@/lib/queryClient";
export function SpotifyConnection() {
  const [id, setId] = useState(""),
    [status, setStatus] = useState(""),
    [busy, setBusy] = useState(false),
    [auth, setAuth] = useState<any>(null),
    [config, setConfig] = useState<any>(null),
    [logs, setLogs] = useState<any[]>([]);
  async function refresh() {
    try {
      const c = await native.call("spotifyConfiguration");
      setConfig(c);
      setId((old) => old || c.clientId);
      setAuth(await native.call("spotifyStatus"));
      await queryClient.invalidateQueries({ queryKey: ["spotify"] });
    } catch (e) {
      setStatus(String(e));
    }
  }
  useEffect(() => {
    void refresh();
    return native.on("bridge-event", (e) => {
      if (e.event === "spotify.authState") setAuth(e.data);
    });
  }, []);
  async function connect() {
    setBusy(true);
    setStatus("Approve Spotify in your system browser, then return here.");
    try {
      const a = await native.call("spotifyConnect", { clientId: id });
      setAuth(a);
      setStatus(
        a.signedIn
          ? "Spotify Connected"
          : a.problem || "Profile could not be verified.",
      );
      await refresh();
    } catch (e) {
      setStatus(String(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="desktop-card">
      <h2>Spotify</h2>
      <p role="status">
        {auth?.signedIn
          ? "Spotify Connected"
          : auth?.problem
            ? "Connection needs attention"
            : "Not connected"}
      </p>
      {auth?.user && (
        <p>
          {auth.user.avatarUrl && (
            <img src={auth.user.avatarUrl} width="36" height="36" alt="" />
          )}
          {auth.user.name}
        </p>
      )}
      <p>
        Connect through Spotify’s official browser login. Library access depends
        on your developer application and account permissions. Playback and
        offline downloads are not granted by this login.
      </p>
      <ol>
        <li>
          Create an app at{" "}
          <a
            href="https://developer.spotify.com/dashboard"
            target="_blank"
            rel="noreferrer"
          >
            Spotify Developer Dashboard
          </a>
          .
        </li>
        <li>
          Register the exact redirect:{" "}
          <code>{config?.redirectUri || "http://127.0.0.1:8888/callback"}</code>
          .
        </li>
        <li>
          If your app is in development mode, allow your Spotify account in its
          user settings. Follow Spotify’s current eligibility rules.
        </li>
        <li>Copy the public Client ID here. Do not enter a client secret.</li>
      </ol>
      <label>
        Spotify Client ID
        <input
          aria-label="Spotify client ID"
          value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder="32-character Client ID"
          autoComplete="off"
        />
      </label>
      <button disabled={busy || !id.trim()} onClick={() => void connect()}>
        {busy
          ? "Connecting…"
          : auth?.signedIn
            ? "Reconnect Spotify"
            : "Connect Spotify"}
      </button>
      {busy && (
        <button onClick={() => void native.call("spotifyCancel")}>
          Cancel login
        </button>
      )}
      <button disabled={busy} onClick={() => void refresh()}>
        Refresh status
      </button>
      <button
        disabled={busy}
        onClick={async () => {
          try {
            setAuth(await native.call("spotifyDisconnect"));
            setStatus("Disconnected");
            await refresh();
          } catch (e) {
            setStatus(String(e));
          }
        }}
      >
        Disconnect
      </button>
      <p role="status">{status || auth?.problem}</p>
      <details>
        <summary>Sanitized authentication diagnostics</summary>
        <button
          onClick={async () => setLogs(await native.call("spotifyDiagnostics"))}
        >
          Refresh diagnostics
        </button>
        <pre style={{ whiteSpace: "pre-wrap" }}>
          {logs.map((l) => `${l.time} · ${l.event} ${l.detail}`).join("\n") ||
            "No diagnostic events loaded. Tokens, authorization codes and callback URLs are never shown."}
        </pre>
      </details>
    </div>
  );
}
