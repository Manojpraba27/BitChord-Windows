const {importFixture}=require('./smokeFiles.cjs');
const { _electron: electron } = require("@playwright/test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const {execFileSync}=require("node:child_process");
const os = require("node:os");
const path = require("node:path");
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "bitchord-smoke-"));
// Generated test tone is a test fixture only, never part of the music catalog.
const rate = 44100,
  seconds = 12,
  bytes = rate * seconds * 2,
  b = Buffer.alloc(44 + bytes);
b.write("RIFF");
b.writeUInt32LE(36 + bytes, 4);
b.write("WAVEfmt ", 8);
b.writeUInt32LE(16, 16);
b.writeUInt16LE(1, 20);
b.writeUInt16LE(1, 22);
b.writeUInt32LE(rate, 24);
b.writeUInt32LE(rate * 2, 28);
b.writeUInt16LE(2, 32);
b.writeUInt16LE(16, 34);
b.write("data", 36);
b.writeUInt32LE(bytes, 40);
for (let i = 0; i < rate * seconds; i++)
  b.writeInt16LE(
    Math.round(2000 * Math.sin((i * 2 * Math.PI * 220) / rate)),
    44 + i * 2,
  );
const wav = path.join(temporary, "Playback verification.wav");
fs.writeFileSync(wav, b);
const extra=[];
try{if(process.env.BITCHORD_USE_FIXTURES)throw Error('Use fixtures');execFileSync('ffmpeg',['-version'],{stdio:'ignore'});for(const ext of ['mp3','flac']){const file=path.join(temporary,'Codec verification.'+ext);execFileSync('ffmpeg',['-v','error','-i',wav,file],{stdio:'ignore'});extra.push(file);}}catch{for(const ext of ['mp3','flac']){const file=path.join(temporary,'Codec verification.'+ext);fs.copyFileSync(path.join(__dirname,'../tests/fixtures/audio.'+ext),file);if(!extra.includes(file))extra.push(file);}console.log('TEST FIXTURES: MP3/FLAC generated tones; no provider media');}
let app;
async function launch() {
  app = await electron.launch({
    args: [
      ".",
      "--smoke-test",
      ...(process.platform==='linux'?['--no-sandbox','--ozone-platform=headless','--disable-gpu']:[]),
      `--user-data-dir=${path.join(temporary, "profile")}`,
    ],
    env: {
      ...process.env,
      XDG_CACHE_HOME: path.join(temporary, "cache"),
      XDG_CONFIG_HOME: path.join(temporary, "config"),
    },
  });
  const page = await app.firstWindow();
  page.on("pageerror", (e) => console.error("PAGE ERROR", e));
  await page.waitForSelector(".desktop-title", { timeout: 30000 });
  return page;
}
(async () => {
  const page = await launch();
 assert.equal((await page.evaluate(()=>window.desktop.call('settings'))).minimizeToTray,false);console.log('CLOSE DEFAULT: exit selected without changing preferences');
  assert.equal(
    (await page.evaluate(() => window.desktop.bridge("ping", {}))).protocol,
    1,
  );
  await page.evaluate(() =>
    window.desktop.call("setting", { key: "minimizeToTray", value: false }),
  );
  const result = await importFixture(page,wav);
  assert.equal(result.tracks.length, 1);
  assert.equal(result.errors.length, 0);
  const id = result.tracks[0].videoId;
  await page.getByRole("link", { name: "Local Music", exact: true }).click();
  await page
    .getByRole("button", { name: "Play Playback verification", exact: true })
    .click();
  await page.waitForFunction(
    () => navigator.mediaSession.playbackState === "playing",
    {},
    { timeout: 30000 },
  );
  await page.waitForTimeout(2200);
  console.log("LOCAL PLAYBACK: playing, WAV metadata loaded");
  await page.getByTitle("Toggle favorite").click();
  assert.equal(
    (await page.evaluate(() => window.desktop.call("favorites"))).length,
    1,
  );
  const response = await page.evaluate(async (id) => {
    const r = await fetch("bitchord://app/media/" + encodeURIComponent(id), {
      headers: { Range: "bytes=44-87" },
    });
    return { status: r.status, size: (await r.arrayBuffer()).byteLength };
  }, id);
  assert.equal(response.status, 206);
  assert.equal(response.size, 44);
  console.log("LOCAL SEEK: byte-range request passed");
  await app.evaluate(({ BrowserWindow }) =>
    BrowserWindow.getAllWindows()[0].webContents.send("media", "toggle"),
  );
  await page.waitForFunction(
    () => navigator.mediaSession.playbackState === "paused",
  );
  console.log("MEDIA COMMAND: paused");
  for(const file of extra){
    const imported=await importFixture(page,file);
    assert.equal(imported.errors.length,0);
    const expected='local:'+require('node:crypto').createHash('sha256').update(fs.realpathSync(file)).digest('hex');const track=imported.tracks.find(t=>t.videoId===expected);
    const detail=await page.evaluate(id=>window.desktop.call('track',{id}),track.videoId);
    const decoded=await page.evaluate(async url=>{const audio=new Audio(url);await audio.play();await new Promise(r=>setTimeout(r,500));const result={time:audio.currentTime,duration:audio.duration};audio.pause();return result;},detail.url);
    assert.ok(decoded.time>0);assert.ok(decoded.duration>10);console.log('CODEC: '+path.extname(file)+' playback advances');
  }
  const saved=await page.evaluate(track=>window.desktop.call('savePlaylist',{title:'Verification playlist',tracks:[track]}),result.tracks[0]);assert.equal(saved.length,1);
  console.log('PLAYLIST: saved real imported track');
  await page.getByRole('link',{name:'My Playlists',exact:true}).click();
  await page.getByRole('button',{name:'Edit playlist',exact:true}).click();
  await page.getByLabel('Edit playlist name',{exact:true}).fill('Edited verification playlist');
  await page.getByRole('button',{name:'Save changes',exact:true}).click();
  await page.getByRole('heading',{name:'Edited verification playlist',exact:true}).waitFor();
  console.log('PLAYLIST EDITOR: renamed and saved through UI');
  await page.getByRole('link',{name:'Appearance',exact:true}).click();
  await page.getByRole('heading',{name:'Appearance',exact:true}).waitFor();
  await page.getByLabel('Reduce motion',{exact:true}).check();
  assert.equal(await page.evaluate(()=>document.documentElement.dataset.reduceMotion),'true');
  console.log('APPEARANCE: reduced-motion preference applied through UI');
  await page.getByRole('link',{name:'Accounts',exact:true}).first().click();
  await page.getByRole('heading',{name:'Spotify',exact:true}).waitFor();
  assert.equal(await page.getByRole('button',{name:'Connect Spotify',exact:true}).isDisabled(),true);
  await page.getByText('Browser only · not connected to BitChord',{exact:true}).waitFor();
  const config=await page.evaluate(()=>window.desktop.call('spotifyConfiguration'));assert.equal(config.redirectUri,'http://127.0.0.1:8888/callback');
  const invalid=await page.evaluate(()=>window.desktop.call('spotifyConnect',{clientId:''}).then(()=>false,()=>true));assert.equal(invalid,true);
  const unsupported=await page.evaluate(()=>window.desktop.call('signIn',{service:'youtube'}).then(()=>false,()=>true));assert.equal(unsupported,true);
  console.log('ACCOUNT UI: configuration required, no fake YouTube session, sanitized missing-client rejection');
  const exportFile=path.join(temporary,'Spotify playlist.csv');fs.writeFileSync(exportFile,'Track Name,Artist Name(s),Album Name\nPlayback verification,Unknown artist,\nUnmatched song,Artist,Album');
  await page.getByRole('link',{name:'Import Library',exact:true}).click();
  await page.getByRole('heading',{name:'Import Library',exact:true}).waitFor();
  const preview=await importFixture(page,exportFile,true);assert.equal(preview.lists[0].matched,1);
  const batch=await page.evaluate(token=>window.desktop.call('importApply',{token}),preview.token);assert.equal(batch.added,1);
  const againPreview=await importFixture(page,exportFile,true);
  const duplicate=await page.evaluate(token=>window.desktop.call('importApply',{token}),againPreview.token);assert.equal(duplicate.duplicates,1);
  await page.evaluate(id=>window.desktop.call('importUndo',{id}),batch.undoId);
  console.log('IMPORT: native preview, local match, duplicate skip and undo passed');
 const unsafe=await page.evaluate(()=>window.desktop.call('importPreviewDropped',{paths:['/arbitrary/file.json']}).then(()=>false,()=>true));assert.equal(unsafe,true);console.log('SECURITY: renderer cannot supply arbitrary import file paths');



  const rejected = await page.evaluate(() =>
    window.desktop.call("setting", { key: "unexpected", value: true }).then(
      () => false,
      () => true,
    ),
  );
  assert.equal(rejected, true);
  await page
    .getByRole("link", { name: "Desktop Settings", exact: true })
    .click();
  await page.getByLabel("Theme", { exact: true }).selectOption("dark");
  const screenshot = process.env.BITCHORD_SCREENSHOT;
  if (screenshot) await page.screenshot({ path: screenshot });
  await app.evaluate(({ app }) => app.exit(0));
  const again = await launch();
  assert.equal(
    (await again.evaluate(() => window.desktop.call("library"))).length,
    1+extra.length,
  );
  assert.equal(
    (await again.evaluate(() => window.desktop.call("favorites"))).length,
    1,
  );
  assert.equal(
    (await again.evaluate(() => window.desktop.call("settings")))
      .minimizeToTray,
    false,
  );
  assert.equal(
    await again.evaluate(() => localStorage.getItem("bitchord:theme")),
    "dark",
  );
  assert.equal((await again.evaluate(()=>window.desktop.call("playlists"))).length,1);
  console.log(
    "PERSISTENCE: library, favorites, window setting and theme survived restart",
  );
  await again.getByRole('link',{name:'Local Music',exact:true}).click();await again.getByRole('button',{name:'Play Playback verification',exact:true}).click();await again.waitForFunction(()=>navigator.mediaSession.playbackState==='playing');
  const exited=new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('App did not exit after close')),6000);app.process().once('exit',()=>{clearTimeout(timer);resolve();});});
  await again.evaluate(()=>window.desktop.call('window',{action:'close'})).catch(()=>{});await exited;console.log('SHUTDOWN: default close terminates owned Electron process');
  const third=await launch();await third.evaluate(()=>window.desktop.call('setting',{key:'minimizeToTray',value:true}));await third.getByRole('link',{name:'Local Music',exact:true}).click();await third.getByRole('button',{name:'Play Playback verification',exact:true}).click();await third.waitForFunction(()=>navigator.mediaSession.playbackState==='playing');const quitExit=new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Quit did not exit')),6000);app.process().once('exit',()=>{clearTimeout(timer);resolve();});});await third.evaluate(()=>window.desktop.call('quit')).catch(()=>{});await quitExit;console.log('QUIT COMMAND: exits during playback with tray preference enabled');
  fs.rmSync(temporary, { recursive: true, force: true });
})().catch(async (e) => {
  console.error(e);
  if (app) await app.evaluate(({ app }) => app.exit(1)).catch(() => {});
  process.exit(1);
});
