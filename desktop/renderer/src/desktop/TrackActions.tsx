import {useEffect,useState} from 'react';
import {MenuItem,MenuSeparator,MenuHeader} from '@/components/Menu';
import type {Track} from '@/data/music/types';
import {usePlayer} from '@/state/player';
import {native} from './api';
import {sleep} from './audio';
export function TrackActions({track,onClose}:{track:Track;onClose:()=>void}){
 const [message,setMessage]=useState(''),[lists,setLists]=useState<any[]|null>(null);
 const local=track.videoId.startsWith('local:'),share=/^[A-Za-z0-9_-]{11}$/.test(track.videoId)?'https://www.youtube.com/watch?v='+track.videoId:null;
 const [liked,setLiked]=useState(false);
 useEffect(()=>{let active=true;void native.call('favorites').then((rows:Track[])=>{if(active)setLiked(rows.some(t=>t.videoId===track.videoId));}).catch(()=>{});return()=>{active=false;};},[track.videoId]);
 async function run(fn:()=>Promise<unknown>,success:string){try{await fn();if(success)setMessage(success);}catch(e){setMessage(String(e));}}
 return <>
 <MenuItem checked={liked} onSelect={()=>void run(async()=>{const rows=await native.call('favorite',{track});setLiked(rows.some((t:Track)=>t.videoId===track.videoId));window.dispatchEvent(new Event('library-changed'));},'Favorites updated')}>Like on this PC</MenuItem>
 <MenuItem disabled onSelect={()=>{}}>Dislike · provider account action unavailable</MenuItem>
 <MenuItem disabled={!share} onSelect={()=>void run(()=>navigator.clipboard.writeText(share!),'Song link copied')}>Share · copy public link</MenuItem>
 <MenuSeparator/>
 <MenuItem onSelect={()=>void run(async()=>setLists((await native.call('playlists')).filter((p:any)=>!p.sourceUrl)),'Choose a playlist below')}>Add to playlist</MenuItem>
 {lists&&<><MenuHeader>Local playlists</MenuHeader>{lists.length?lists.map(p=><MenuItem key={p.id} onSelect={()=>void run(async()=>{if(!p.tracks.some((t:Track)=>t.videoId===track.videoId))await native.call('savePlaylist',{id:p.id,title:p.title,tracks:[...p.tracks,track]});window.dispatchEvent(new Event('library-changed'));},'Added to '+p.title)}>{p.title}</MenuItem>):<MenuHeader>Create a playlist in My Playlists first</MenuHeader>}</>}
 <MenuItem disabled={local} onSelect={()=>{const s=usePlayer.getState();s.setAutoplay(true);s.playTracks([track],0,{type:'library',title:'Song radio'});onClose();}}>Start radio{local?' · unavailable for local files':''}</MenuItem>
 <MenuItem onSelect={()=>{usePlayer.getState().playNext([track]);onClose();}}>Play next</MenuItem>
 <MenuItem onSelect={()=>{usePlayer.getState().addToQueue([track]);onClose();}}>Add to queue</MenuItem>
 <MenuSeparator/>
 <MenuItem disabled onSelect={()=>{}}>Upgrade quality · controlled by source</MenuItem>
 <MenuItem disabled onSelect={()=>{}}>Convert to audio · conversion not implemented</MenuItem>
 <MenuItem disabled onSelect={()=>{}}>Download · use permitted direct files in Downloads</MenuItem>
 <MenuItem disabled onSelect={()=>{}}>Remove from cache · no downloaded track cache</MenuItem>
 <MenuSeparator/>
 <MenuItem onSelect={()=>void run(async()=>{const info=local?(await native.call('track',{id:track.videoId})).track:null;setMessage([track.title,track.artists.map(a=>a.name).join(', '),info?.audioInfo||'Codec/bitrate unavailable',track.durationSec?Math.round(track.durationSec)+' seconds':'Duration unavailable'].join(' · '));},'')}>Song information</MenuItem>
 <MenuItem onSelect={()=>{sleep(30);setMessage('Sleep timer set for 30 minutes');}}>Sleep timer · 30 minutes</MenuItem>
 <MenuItem onSelect={()=>{sleep(0);setMessage('Sleep timer cancelled');}}>Cancel sleep timer</MenuItem>
 <MenuItem disabled onSelect={()=>{}}>Lyrics offset · per-song adjustment unavailable</MenuItem>
 <MenuItem onSelect={()=>void run(()=>navigator.clipboard.writeText(JSON.stringify({app:'BitChord',title:track.title,source:local?'local':'online',status:usePlayer.getState().status,duration:track.durationSec},null,2)),'Sanitized playback log copied')}>Copy log</MenuItem>
 {local&&<MenuItem onSelect={()=>void run(()=>native.call('reveal',{id:track.videoId}),'Opened in File Explorer')}>Show in File Explorer</MenuItem>}
 {message&&<p className="track-action-status" role="status">{message}</p>}
 </>;
}
