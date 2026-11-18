import { randomUUID } from "node:crypto";
export function commitImported(
  db: any,
  lists: { id: string; title: string; tracks: any[] }[],
) {
  db.exec(
    "CREATE TABLE IF NOT EXISTS import_batches(id TEXT PRIMARY KEY,data TEXT NOT NULL)",
  );
  const added: string[] = [];
  let duplicates = 0;
  const undoId = randomUUID();
  db.exec("BEGIN IMMEDIATE");
  try {
    for (const p of lists) {
      if (db.prepare("SELECT id FROM playlists WHERE id=?").get(p.id)) {
        duplicates++;
        continue;
      }
      db.prepare("INSERT INTO playlists VALUES(?,?,?)").run(
        p.id,
        p.title,
        JSON.stringify(p.tracks),
      );
      added.push(p.id);
    }
    db.prepare("INSERT INTO import_batches VALUES(?,?)").run(
      undoId,
      JSON.stringify(added),
    );
    db.exec("COMMIT");
    return { added: added.length, duplicates, undoId };
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
}
export function undoImported(db: any, id: string) {
  db.exec(
    "CREATE TABLE IF NOT EXISTS import_batches(id TEXT PRIMARY KEY,data TEXT NOT NULL)",
  );
  const r = db.prepare("SELECT data FROM import_batches WHERE id=?").get(id);
  if (!r) throw Error("This import cannot be undone");
  db.exec("BEGIN IMMEDIATE");
  try {
    for (const key of JSON.parse(String(r.data)))
      db.prepare("DELETE FROM playlists WHERE id=?").run(key);
    db.prepare("DELETE FROM import_batches WHERE id=?").run(id);
    db.exec("COMMIT");
    return true;
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
}
