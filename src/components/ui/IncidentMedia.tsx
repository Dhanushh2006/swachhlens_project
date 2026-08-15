import { cn } from '../../lib/utils'

export function IncidentMedia({url,type='image',className,alt='Incident evidence',controls=false}:{url:string;type?:'image'|'video';className?:string;alt?:string;controls?:boolean}){
  if(type==='video')return <video src={url} className={cn('bg-slate-900 object-cover',className)} controls={controls} muted={!controls} playsInline preload="metadata" aria-label={alt}/>
  return <img src={url} className={cn('object-cover',className)} alt={alt}/>
}
