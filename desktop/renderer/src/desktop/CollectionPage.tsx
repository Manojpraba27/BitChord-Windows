import {useEffect,useState} from 'react';
import {Link} from 'react-router';
import {Download,Folder,Heart,Plus,Music2,ArrowUpRight} from 'lucide-react';
import {native} from './api';
import {usePlayer} from '@/state/player';
import type {Track} from '@/data/music/types';
type Stats={plays:number;seconds:number;since:number;top:{track:Track;plays:number;seconds:number}[]};
export default function CollectionPage(){
 const [stats,setStats]=useState<Stats|null>(null),[error,setError]=useState('');
 useEffect(()=>{let alive=true;const refresh=()=>native.call('statistics').then(s=>{if(alive){setStats(s);setError('');}}).catch(e=>{if(alive)setError(String(e));});void refresh();const timer=setInterval(refresh,10000);return()=>{alive=false;clearInterval(timer);};},[]);
 return <section className="desktop-page collection-page"><div className="desktop-eyebrow">YOUR MUSIC. YOUR SPACE.</div><h1>Library</h1>
 {error&&<p role="alert">{error}</p>}
 <div className="listening-cards"><article className="listening-card"><div className="desktop-eyebrow">YOUR LISTENING EXPERIENCE</div><strong>{stats?Math.floor(stats.seconds/60).toLocaleString():'—'}</strong><span>MINUTES LISTENED</span><footer>{stats?.plays??'—'} playback starts · on this PC<br/><small>{stats?'Tracked since '+new Date(stats.since).toLocaleDateString():'Loading recorded listening…'}</small></footer></article>
 <article className="listening-card"><div className="desktop-eyebrow">YOUR LISTENING EXPERIENCE</div><h2>{stats?.top[0]?.track.title||'Make it your own'}</h2><span>TOP SONG</span><footer>{stats?.top[0]?.track.artists.map(a=>a.name).join(', ')||'Play music to start your listening story.'}</footer></article></div>
 <p className="desktop-subtitle">Listening time counts active app playback, excluding pauses and stalled playback. Spotify and YouTube website players are separate.</p>
 <div className="library-destinations">{[[Download,'Downloads','/downloads'],[Folder,'Local Music','/local'],[Music2,'Spotify playlists','/spotify']].map(([Icon,label,path]:any)=><Link key={path} to={path}><Icon size={24}/><span>{label}</span><ArrowUpRight size={18}/></Link>)}</div>
 <h2>Playlists</h2><div className="library-tiles">{[[Heart,'Liked Music','Your favorites','/favorites'],[Plus,'New playlist','Saved on this PC','/playlists'],[Music2,'Import Spotify','From a playlist link','/import']].map(([Icon,title,detail,path]:any)=><Link to={path} key={path}><div className={path==='/favorites'?'liked-tile':''}><Icon size={56}/></div><strong>{title}</strong><span>{detail}</span></Link>)}</div>
 <h2>Top songs</h2>{stats?.top.length?<div className="desktop-card">{stats.top.map(({track,plays,seconds})=><div className="import-preview-row" key={track.videoId}><span><strong>{track.title}</strong><br/>{track.artists.map(a=>a.name).join(', ')} · {plays} starts · {Math.floor(seconds/60)} min</span><button onClick={()=>usePlayer.getState().playTracks(stats.top.map(t=>t.track),stats.top.findIndex(t=>t.track.videoId===track.videoId),{type:'library',title:'Top songs'})}>Play {track.title}</button></div>)}</div>:<p>Your listening will appear here as you play music.</p>}
 <Link to="/history">See playback history</Link>
 </section>;
}
