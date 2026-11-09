import { isAdmin } from '@/lib/auth';
import { updateEntry,deleteEntry } from '@/lib/db';
import { validEntry } from '@/lib/validate';
export async function PUT(req:Request,context:{params:Promise<{id:string}>}){if(!await isAdmin())return Response.json({error:'Unauthorized'},{status:401});try{const {id}=await context.params;const entry=await updateEntry(id,validEntry(await req.json()));return entry?Response.json({entry}):Response.json({error:'Not found'},{status:404});}catch(error){return Response.json({error:(error as Error).message},{status:400})}}
export async function DELETE(_req:Request,context:{params:Promise<{id:string}>}){if(!await isAdmin())return Response.json({error:'Unauthorized'},{status:401});try{await deleteEntry((await context.params).id);return Response.json({ok:true});}catch{return Response.json({error:'Could not delete entry'},{status:400})}}
