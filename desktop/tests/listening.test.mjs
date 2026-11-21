import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {initListening,startListening,creditListening,listeningStats} from '../electron/listening.ts';
const a={videoId:'local:a',title:'Real track',artists:[{name:'Artist',id:null}]};
test('listening starts empty and never estimates minutes from duration',()=>{const d=new DatabaseSync(':memory:');initListening(d);startListening(d,{...a,durationSec:600});let s=listeningStats(d);assert.equal(s.plays,1);assert.equal(s.seconds,0);creditListening(d,a.videoId,1.25);s=listeningStats(d);assert.equal(s.seconds,1.25);assert.equal(s.top[0].track.title,a.title);d.close();});
test('top songs use measured listening time and survive schema initialization',()=>{const d=new DatabaseSync(':memory:');initListening(d);startListening(d,a);startListening(d,{...a,videoId:'b',title:'Second'});creditListening(d,'b',2);creditListening(d,a.videoId,1);const since=listeningStats(d).since;initListening(d);const s=listeningStats(d);assert.equal(s.plays,2);assert.equal(s.seconds,3);assert.equal(s.top[0].track.videoId,'b');assert.equal(s.since,since);d.close();});
test('invalid credits and unknown tracks cannot inflate statistics',()=>{const d=new DatabaseSync(':memory:');initListening(d);startListening(d,a);for(const n of [NaN,Infinity,-1,0,100])assert.throws(()=>creditListening(d,a.videoId,n));creditListening(d,'unknown',1);assert.equal(listeningStats(d).seconds,0);d.close();});
