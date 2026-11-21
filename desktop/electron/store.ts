import {initListening,startListening,creditListening,listeningStats} from "./listening";
import {commitImported,undoImported,saveLinkedPlaylist} from './importDatabase';
import { DatabaseSync } from "node:sqlite";
import { app, safeStorage } from "electron";
import path from "node:path";
let db: DatabaseSync;
export function initStore() {
  db = new DatabaseSync(path.join(app.getPath("userData"), "bitchord.sqlite"));
  db.exec(`PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY,value TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS tracks(id TEXT PRIMARY KEY,path TEXT UNIQUE NOT NULL,data TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS history(id INTEGER PRIMARY KEY,played INTEGER NOT NULL,data TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS favorites(id TEXT PRIMARY KEY,data TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS playlist_links(id TEXT PRIMARY KEY,url TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS playlists(id TEXT PRIMARY KEY,title TEXT NOT NULL,data TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS downloads(id TEXT PRIMARY KEY,data TEXT NOT NULL);`);
  initListening(db);
}
export function get(key: string, fallback: any = null): any {
  const row = db.prepare("SELECT value FROM settings WHERE key=?").get(key);
  return row ? JSON.parse(String(row.value)) : fallback;
}
export function set(key: string, value: any) {
  db.prepare("INSERT OR REPLACE INTO settings VALUES(?,?)").run(
    key,
    JSON.stringify(value),
  );
}
export function secret(key: string, value?: string) {
  if (value !== undefined) {
    if (
      !safeStorage.isEncryptionAvailable() ||
      (process.platform === "linux" &&
        safeStorage.getSelectedStorageBackend() === "basic_text")
    )
      throw Error("OS credential encryption is unavailable.");
    set("secret:" + key, safeStorage.encryptString(value).toString("base64"));
    return;
  }
  const encrypted = get("secret:" + key);
  return encrypted
    ? safeStorage.decryptString(Buffer.from(encrypted, "base64"))
    : null;
}
export function saveTrack(id: string, file: string, data: any) {
  db.prepare("INSERT OR REPLACE INTO tracks VALUES(?,?,?)").run(
    id,
    file,
    JSON.stringify(data),
  );
}
export function track(id: string): any {
  const r = db.prepare("SELECT path,data FROM tracks WHERE id=?").get(id);
  return r ? { path: r.path, ...JSON.parse(String(r.data)) } : null;
}
export function tracks(): any[] {
  return db
    .prepare(
      "SELECT data FROM tracks ORDER BY json_extract(data,'$.title') COLLATE NOCASE",
    )
    .all()
    .map((r) => JSON.parse(String(r.data)));
}
export function record(data: any) {
  startListening(db,data);
  db.prepare("INSERT INTO history(played,data) VALUES(?,?)").run(
    Date.now(),
    JSON.stringify(data),
  );
  db.exec(
    "DELETE FROM history WHERE id NOT IN (SELECT id FROM history ORDER BY id DESC LIMIT 2000)",
  );
}
export function history() {
  return db
    .prepare("SELECT played,data FROM history ORDER BY id DESC LIMIT 200")
    .all()
    .map((r) => ({ ...JSON.parse(String(r.data)), played: r.played }));
}
export function favorite(data: any) {
  const exists = db
    .prepare("SELECT id FROM favorites WHERE id=?")
    .get(data.videoId);
  if (exists) db.prepare("DELETE FROM favorites WHERE id=?").run(data.videoId);
  else
    db.prepare("INSERT INTO favorites VALUES(?,?)").run(
      data.videoId,
      JSON.stringify(data),
    );
}
export function favorites() {
  return db
    .prepare("SELECT data FROM favorites")
    .all()
    .map((r) => JSON.parse(String(r.data)));
}
export function download(data: any) {
  db.prepare("INSERT OR REPLACE INTO downloads VALUES(?,?)").run(
    data.id,
    JSON.stringify(data),
  );
}
export function downloads(): any[] {
  return db
    .prepare("SELECT data FROM downloads")
    .all()
    .map((r) => JSON.parse(String(r.data)));
}

export function playlists() {
  return db
    .prepare("SELECT p.id,p.title,p.data,l.url FROM playlists p LEFT JOIN playlist_links l ON l.id=p.id ORDER BY p.title")
    .all()
    .map((r) => ({
      id: r.id,
      title: r.title,
      sourceUrl:r.url||null,
      tracks: JSON.parse(String(r.data)),
    }));
}
export function savePlaylist(id: string, title: string, tracks: any[]) {
  db.prepare("INSERT OR REPLACE INTO playlists VALUES(?,?,?)").run(
    id,
    title,
    JSON.stringify(tracks),
  );
}
export function deletePlaylist(id: string) {
  db.prepare("DELETE FROM playlist_links WHERE id=?").run(id);
  db.prepare("DELETE FROM playlists WHERE id=?").run(id);
}
export function removeSecret(key: string) {
  db.prepare("DELETE FROM settings WHERE key=?").run("secret:" + key);
}

export function commitImport(lists:{id:string;title:string;tracks:any[]}[]){return commitImported(db,lists);}
export function undoImport(id:string){return undoImported(db,id);}

export function saveSpotifyLink(item:{id:string;title:string;sourceUrl:string}){return saveLinkedPlaylist(db,item);}

export function statistics(){return listeningStats(db);}
export function listeningTick(id:string,seconds:number){creditListening(db,id,seconds);}
