import { corsHeaders, json } from '../_shared/cors.ts'
import { score } from '../_shared/decision.ts'
Deno.serve(async req=>{if(req.method==='OPTIONS')return new Response('ok',{headers:corsHeaders});try{return json(score(await req.json()))}catch(e){return json({error:e instanceof Error?e.message:'Invalid score input'},400)}})
