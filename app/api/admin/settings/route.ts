import { isAdmin } from '@/lib/auth';
import { getSettings,saveSettings } from '@/lib/db';
import { validSettings } from '@/lib/validate';
export async function GET(){if(!await isAdmin())return Response.json({error:'Unauthorized'},{status:401});try{return Response.json({settings:await getSettings()})}catch{return Response.json({error:'Database not initialized'},{status:503})}}
export async function PUT(req:Request){if(!await isAdmin())return Response.json({error:'Unauthorized'},{status:401});try{const settings=validSettings(await req.json());await saveSettings(settings);return Response.json({settings});}catch(error){return Response.json({error:(error as Error).message},{status:400})}}
