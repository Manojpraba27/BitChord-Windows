import { randomBytes } from "node:crypto";
import { createServer } from "node:http";
import { challenge, validState } from "./pkce.ts";
export const SPOTIFY_REDIRECT = "http://127.0.0.1:8888/callback";
type Session = {
  access_token: string;
  refresh_token: string;
  expiresAt: number;
  clientId: string;
};
type Dependencies = {
  read: () => Session | null;
  write: (s: Session) => void;
  clear: () => void;
  open: (url: string) => Promise<unknown>;
  fetch: typeof fetch;
  now?: () => number;
  redirect?: string;
  timeout?: number;
  configuredId?: string;
};
export function createSpotifyAuth(d: Dependencies) {
  const now = d.now || Date.now,
    redirect = d.redirect || SPOTIFY_REDIRECT;
  let pending: { cancel: () => void } | null = null,
    revision = 0,
    refreshing: Promise<Session> | null = null;
  const logs: { time: string; event: string; detail: string }[] = [];
  const log = (event: string, detail = "") => {
    logs.push({ time: new Date(now()).toISOString(), event, detail });
    if (logs.length > 30) logs.shift();
  };
  const fail = (message: string) => new Error(message);
  async function request(url: string, init: RequestInit = {}) {
    try {
      return await d.fetch(url, {
        ...init,
        signal: init.signal || AbortSignal.timeout(20000),
      });
    } catch {
      log("network_error");
      throw fail(
        "Network request failed or timed out. Check your connection and retry.",
      );
    }
  }
  async function exchange(body: Record<string, string>, signal?: AbortSignal) {
    const r = await request("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(body),
      signal,
    });
    if (!r.ok) {
      let code = "";
      try {
        const j: any = await r.json();
        if (
          ["invalid_client", "invalid_grant", "invalid_request"].includes(
            j.error,
          )
        )
          code = j.error;
      } catch {}
      log("token_rejected", `HTTP ${r.status}${code ? " " + code : ""}`);
      throw fail(
        `Spotify token exchange rejected (HTTP ${r.status}${code ? " " + code : ""}). Verify the Client ID and exact redirect URI ${redirect}; reconnect if authorization expired.`,
      );
    }
    let t:any;try{t=await r.json();}catch{throw fail("Spotify returned an unreadable token response. Retry.");}
    if (
      typeof t.access_token !== "string" ||
      !Number.isFinite(t.expires_in) ||
      t.expires_in <= 0
    )
      throw fail(
        "Spotify returned an invalid token response. Retry connection.",
      );
    return t;
  }
  async function profile(s: Session, signal?: AbortSignal) {
    const r = await request("https://api.spotify.com/v1/me", {
      headers: { Authorization: "Bearer " + s.access_token },
      signal,
    });
    if (!r.ok) {
      log("profile_rejected", `HTTP ${r.status}`);
      throw fail(
        `Spotify profile access failed (HTTP ${r.status}). Check developer-app account access and granted permissions.`,
      );
    }
    let p:any;try{p=await r.json();}catch{throw fail("Spotify returned an unreadable profile response.");}
    if (typeof p.id !== "string")
      throw fail("Spotify returned an invalid profile.");
    return {
      name: p.display_name || p.id,
      avatarUrl: p.images?.[0]?.url || null,
    };
  }
  async function active(force = false): Promise<Session> {
    const saved = d.read();
    if (!saved)
      throw fail(
        "Spotify is disconnected. Enter your registered Client ID and connect.",
      );
    if (!force && saved.expiresAt > now() + 30000) return saved;
    if (!saved.refresh_token)
      throw fail("Spotify session expired. Reconnect your account.");
    refreshing ??= (async () => {
      const version = revision;
      log("refresh_started");
      const t = await exchange({
        grant_type: "refresh_token",
        refresh_token: saved.refresh_token,
        client_id: saved.clientId,
      });
      const next = {
        access_token: t.access_token,
        refresh_token: t.refresh_token || saved.refresh_token,
        expiresAt: now() + t.expires_in * 1000,
        clientId: saved.clientId,
      };
      if (version !== revision)
        throw fail("Spotify connection changed. Retry.");
      d.write(next);
      log("refresh_completed");
      return next;
    })().finally(() => (refreshing = null));
    return refreshing;
  }
  async function api(route: string) {
    let s = await active();
    let r = await request("https://api.spotify.com/v1/" + route, {
      headers: { Authorization: "Bearer " + s.access_token },
    });
    if (r.status === 401) {
      s = await active(true);
      r = await request("https://api.spotify.com/v1/" + route, {
        headers: { Authorization: "Bearer " + s.access_token },
      });
    }
    if (!r.ok) {
      log("api_rejected", `HTTP ${r.status}`);
      throw fail(
        `Spotify API HTTP ${r.status}. Reconnect or check account/app permissions.`,
      );
    }
    try{return await r.json();}catch{throw fail("Spotify returned an unreadable API response. Retry.");}
  }
  function cancel() {
    pending?.cancel();
  }
  async function connect(clientId: string) {
    clientId = clientId.trim();
    if (!/^[a-fA-F0-9]{32}$/.test(clientId))
      throw fail(
        "A valid Spotify application Client ID is required (32 hexadecimal characters). Register " +
          redirect +
          " exactly in Spotify Developer Dashboard.",
      );
    if (pending)
      throw fail(
        "A Spotify login is already waiting. Cancel it before reconnecting.",
      );
    const state = randomBytes(32).toString("base64url"),
      verifier = randomBytes(48).toString("base64url"),
      abort = new AbortController();
    const version = ++revision;
    log("login_started");
    try {
      await new Promise<void>((resolve, reject) => {
        let finished = false,
          consumed = false;
        const server = createServer((req, res) => {
          res.setHeader("Content-Type", "text/plain; charset=utf-8");
          res.setHeader("Cache-Control", "no-store");
          res.setHeader("Referrer-Policy", "no-referrer");
          let u: URL;
          try {
            u = new URL(req.url || "/", redirect);
          } catch {
            res.writeHead(400).end("Invalid request");
            return;
          }
          if (
            req.method !== "GET" ||
            u.pathname !== new URL(redirect).pathname ||
            req.headers.host !== new URL(redirect).host
          ) {
            res
              .writeHead(404)
              .end(
                "Unknown callback. Use the exact redirect shown in BitChord.",
              );
            log("callback_wrong_route");
            return;
          }
          if (!validState(u.searchParams.get("state"), state)) {
            res
              .writeHead(400)
              .end(
                "Invalid authorization state. Return to BitChord and retry.",
              );
            log("callback_invalid_state");
            return;
          }
          if (consumed) {
            res.writeHead(409).end("Callback already received");
            return;
          }
          consumed = true;
          if (u.searchParams.has("error")) {
            res.end("Spotify authorization denied. Return to BitChord.");
            log("authorization_denied");
            finish(
              fail("Spotify permission was denied. Connect again when ready."),
            );
            return;
          }
          const code = u.searchParams.get("code");
          if (!code) {
            res.writeHead(400).end("Missing authorization code");
            finish(
              fail(
                "Spotify callback was missing its authorization code. Retry.",
              ),
            );
            return;
          }
          res.end(
            "Authorization received. Return to BitChord to see the result.",
          );
          log("callback_received");
          void (async () => {
            try {
              const t = await exchange(
                {
                  grant_type: "authorization_code",
                  code,
                  client_id: clientId,
                  redirect_uri: redirect,
                  code_verifier: verifier,
                },
                abort.signal,
              );
              const session = {
                access_token: t.access_token,
                refresh_token: t.refresh_token || "",
                expiresAt: now() + t.expires_in * 1000,
                clientId,
              };
              await profile(session, abort.signal);
              if (abort.signal.aborted || version !== revision)
                throw fail("Spotify login cancelled.");
              d.write(session);
              log("connected");
              finish();
            } catch (e) {
              finish(e);
            }
          })();
        });
        const timer = setTimeout(() => {
          log("login_timeout");
          finish(
            fail(
              "Spotify login timed out. Confirm the exact redirect URI, allow this account in your developer app, then retry.",
            ),
          );
        }, d.timeout || 180000);
        function finish(error?: unknown) {
          if (finished) return;
          finished = true;
          clearTimeout(timer);
          abort.abort();
          server.close();
          server.closeAllConnections();
          pending = null;
          error ? reject(error) : resolve();
        }
        pending = {
          cancel: () => {
            revision++;
            log("login_cancelled");
            finish(fail("Spotify login cancelled."));
          },
        };
        server.on("error", (e: any) => {
          log(
            "listener_error",
            e.code === "EADDRINUSE" ? "port_in_use" : "listener_failed",
          );
          finish(
            fail(
              e.code === "EADDRINUSE"
                ? `Spotify callback port is busy. Close the other app using port ${new URL(redirect).port} and retry.`
                : "Could not start the Spotify callback listener.",
            ),
          );
        });
        const u = new URL(redirect);
        server.listen(Number(u.port), "127.0.0.1", () => {
          log("listener_ready");
          const auth = new URL("https://accounts.spotify.com/authorize");
          auth.search = new URLSearchParams({
            client_id: clientId,
            response_type: "code",
            redirect_uri: redirect,
            code_challenge_method: "S256",
            code_challenge: challenge(verifier),
            state,
            scope:
              "user-read-private playlist-read-private playlist-read-collaborative user-library-read",
          }).toString();
          void d
            .open(auth.href)
            .catch(() =>
              finish(
                fail(
                  "Could not open your default browser. Check Windows default-browser settings and retry.",
                ),
              ),
            );
        });
      });
      return await authState();
    } catch (e) {
      log("login_failed");
      throw e;
    }
  }
  async function authState() {
    const saved = d.read();
    if (!saved)
      return {
        browserSignedIn: false,
        connected: false,
        signedIn: false,
        user: null,
        problem: null,
      };
    try {
      const p = await api("me");
      return {
        browserSignedIn: true,
        connected: true,
        signedIn: true,
        user: {
          name: p.display_name || p.id,
          avatarUrl: p.images?.[0]?.url || null,
        },
        problem: null,
      };
    } catch (e) {
      return {
        browserSignedIn: false,
        connected: true,
        signedIn: false,
        user: null,
        problem: (e as Error).message,
      };
    }
  }
  function disconnect() {
    cancel();
    revision++;
    d.clear();
    log("disconnected");
    return authState();
  }
  return {
    connect,
    cancel,
    disconnect,
    authState,
    api,
    diagnostics: () => [...logs],
    configuration: () => ({
      clientId: d.read()?.clientId || d.configuredId || "",
      redirectUri: redirect,
      pending: !!pending,
    }),
  };
}
