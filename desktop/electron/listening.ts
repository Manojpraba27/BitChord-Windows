import type { DatabaseSync } from 'node:sqlite';
export function initListening(db: DatabaseSync) {
  db.exec(`CREATE TABLE IF NOT EXISTS listening(id TEXT PRIMARY KEY,data TEXT NOT NULL,plays INTEGER NOT NULL DEFAULT 0,seconds REAL NOT NULL DEFAULT 0);
    CREATE TABLE IF NOT EXISTS listening_meta(id INTEGER PRIMARY KEY CHECK(id=1),since INTEGER NOT NULL);`);
  db.prepare('INSERT OR IGNORE INTO listening_meta VALUES(1,?)').run(Date.now());
}
export function startListening(db: DatabaseSync, track: any) {
  db.prepare(`INSERT INTO listening(id,data,plays) VALUES(?,?,1) ON CONFLICT(id) DO UPDATE SET data=excluded.data,plays=plays+1`).run(track.videoId,JSON.stringify(track));
}
export function creditListening(db: DatabaseSync, id: string, seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0 || seconds > 2.5) throw Error('Invalid listening interval');
  db.prepare('UPDATE listening SET seconds=seconds+? WHERE id=?').run(seconds,id);
}
export function listeningStats(db: DatabaseSync) {
  const total=db.prepare('SELECT COALESCE(SUM(plays),0) plays,COALESCE(SUM(seconds),0) seconds FROM listening').get()!;
  return {...total,since:db.prepare('SELECT since FROM listening_meta WHERE id=1').get()!.since,
    top:db.prepare('SELECT data,plays,seconds FROM listening ORDER BY seconds DESC,plays DESC LIMIT 8').all().map(r=>({track:JSON.parse(String(r.data)),plays:r.plays,seconds:r.seconds}))};
}
