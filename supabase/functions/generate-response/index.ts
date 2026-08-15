import { corsHeaders, json } from '../_shared/cors.ts'
import { response } from '../_shared/decision.ts'
Deno.serve(async req=>{if(req.method==='OPTIONS')return new Response('ok',{headers:corsHeaders});try{const b=await req.json();return json(response(b.category,b.volume,b.hazards??[],b.sensitivity??'MEDIUM'))}catch(e){return json({error:e instanceof Error?e.message:'Invalid recommendation input'},400)}})
