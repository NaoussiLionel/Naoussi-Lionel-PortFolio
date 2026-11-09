import { isAdmin } from '@/lib/auth';
import { getEntries,createEntry,hasDatabase } from '@/lib/db';
import { validEntry } from '@/lib/validate';
export async function GET(){if(!await isAdmin())return Response.json({error:'Unauthorized'},{status:401});try{return Response.json({entries:await getEntries(undefined,true),database:hasDatabase()})}catch{return Response.json({error:'Database unavailable. Run the initialization script.'},{status:503})}}
export async function POST(req:Request){if(!await isAdmin())return Response.json({error:'Unauthorized'},{status:401});try{const e=validEntry(await req.json());return Response.json({entry:await createEntry(e)},{status:201});}catch(error){return Response.json({error:(error as Error).message},{status:400})}}
