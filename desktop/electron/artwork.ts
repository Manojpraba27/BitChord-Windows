// Only bounded raster covers become renderer data URLs; SVG/HTML are never accepted.
export function artwork(pictures?:{format:string;data:Uint8Array}[]):string|null{
 const p=pictures?.find(p=>p.data.length<=2*1024*1024&&['image/jpeg','image/png','image/webp'].includes(p.format));
 return p?`data:${p.format};base64,${Buffer.from(p.data).toString('base64')}`:null;
}
