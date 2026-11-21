import {useEffect,useState} from 'react';
import {Link} from 'react-router';
import {native} from './api';
import {usePlayer} from '@/state/player';
import type {Track} from '@/data/music/types';
export default function RadioPage(){
 const current=usePlayer(s=>s.queue[s.index]?.track),[recent,setRecent]=useState<Track[]>([]),[message,setMessage]=useState('');
 useEffect(()=>{let alive=true;void native.call('history').then((rows:Track[])=>{if(alive)setRecent([...new Map(rows.filter(t=>/^[A-Za-z0-9_-]{11}$/.test(t.videoId)).map(t=>[t.videoId,t])).values()].slice(0,12));}).catch(e=>{if(alive)setMessage(String(e));});return()=>{alive=false;};},[]);
 const seed=current&&/^[A-Za-z0-9_-]{11}$/.test(current.videoId)?current:null;
 function start(t:Track){const p=usePlayer.getState();p.setAutoplay(true);p.playTracks([t],0,{type:'library',title:'Radio · '+t.title});setMessage('Started '+t.title+'. Similar tracks are requested by the existing autoplay engine when the queue needs them. Availability depends on the source.');}
 return <section className="desktop-page"><div className="desktop-eyebrow">KEEP THE MUSIC FLOWING</div><h1>Radio</h1><div className="desktop-card"><h2>{seed?'Start with '+seed.title:'Find your starting song'}</h2><p>Song radio reuses BitChord’s existing online recommendation queue. It requires an available online track and network access. Local files cannot seed provider radio.</p><button disabled={!seed} onClick={()=>seed&&start(seed)}>Start current song radio</button> <Link to="/search">Search for a song</Link></div>{recent.length>0&&<div className="desktop-card"><h2>Recently played seeds</h2>{recent.map(t=><div className="import-preview-row" key={t.videoId}><span>{t.title}<br/>{t.artists.map(a=>a.name).join(', ')}</span><button onClick={()=>start(t)}>Start radio for {t.title}</button></div>)}</div>}<p role="status">{message}</p></section>;
}
