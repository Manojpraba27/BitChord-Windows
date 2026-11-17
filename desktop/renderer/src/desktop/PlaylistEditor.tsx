import {useState} from 'react';
import type {Track} from '@/data/music/types';
import {native} from './api';
export function PlaylistEditor({playlist,onSaved}:{playlist:{id:string;title:string;tracks:Track[]};onSaved:()=>void}){
 const[open,setOpen]=useState(false),[title,setTitle]=useState(playlist.title),[tracks,setTracks]=useState(playlist.tracks),[error,setError]=useState('');
 async function save(){try{if(!title.trim())throw Error('Enter a playlist name');await native.call('savePlaylist',{id:playlist.id,title:title.trim(),tracks});setOpen(false);onSaved();}catch(e){setError(String(e));}}
 return <><button onClick={()=>{setTitle(playlist.title);setTracks(playlist.tracks);setOpen(!open);}}>Edit playlist</button>{open&&<div><label>Name<input aria-label="Edit playlist name" value={title} onChange={e=>setTitle(e.target.value)}/></label>{tracks.map((t,i)=><div key={i}>{i+1}. {t.title}<button disabled={i===0} aria-label={'Move up '+t.title} onClick={()=>{const next=[...tracks];[next[i-1],next[i]]=[next[i]!,next[i-1]!];setTracks(next);}}>Move up</button><button onClick={()=>setTracks(tracks.filter((_,n)=>n!==i))}>Remove</button></div>)}<button onClick={()=>void save()}>Save changes</button><button onClick={()=>setOpen(false)}>Cancel</button>{error&&<p role="alert">{error}</p>}</div>}</>;
}
