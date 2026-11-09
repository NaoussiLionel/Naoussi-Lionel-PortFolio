import { neon } from '@neondatabase/serverless';
import { defaults,demoEntries } from './defaults';
import type { Entry,Kind,Message,SiteSettings } from './types';

export const hasDatabase = () =>
  Boolean(process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('USER:PASSWORD'));

function sql(){
  if(!hasDatabase()) throw new Error('DATABASE_URL is not configured. See README.md');
  return neon(process.env.DATABASE_URL!);
}

function transform(row:any):Entry{
  return {
    ...row,
    gallery:Array.isArray(row.gallery)?row.gallery:[],
    tags:Array.isArray(row.tags)?row.tags:[],
    metadata:row.metadata||{},
    featured:Boolean(row.featured),
    published:Boolean(row.published)
  };
}

function logDatabaseError(operation:string,error:unknown){
  console.error(`[portfolio-db] ${operation} failed:`,error);
}

/**
 * Public pages must remain renderable even when the optional database is
 * unavailable, uninitialised, or temporarily unreachable. A database failure
 * should not turn into a Server Components render error (#441).
 */
export async function getEntries(kind?:Kind,includeDrafts=false):Promise<Entry[]> {
  if(!hasDatabase()){
    return demoEntries.filter(e=>(!kind||e.kind===kind)&&(includeDrafts||e.published));
  }

  try {
    const db=sql();
    let rows;
    if(kind&&includeDrafts) rows=await db`SELECT * FROM entries WHERE kind=${kind} ORDER BY sort_order ASC, updated_at DESC`;
    else if(kind) rows=await db`SELECT * FROM entries WHERE kind=${kind} AND published=true ORDER BY sort_order ASC, updated_at DESC`;
    else if(includeDrafts) rows=await db`SELECT * FROM entries ORDER BY kind,sort_order ASC,updated_at DESC`;
    else rows=await db`SELECT * FROM entries WHERE published=true ORDER BY kind,sort_order ASC,updated_at DESC`;
    return rows.map(transform);
  } catch(error) {
    logDatabaseError('getEntries',error);
    return demoEntries.filter(e=>(!kind||e.kind===kind)&&(includeDrafts||e.published));
  }
}

export async function getEntry(slug:string){
  if(!hasDatabase()) return demoEntries.find(e=>e.slug===slug&&e.published)||null;

  try {
    const rows=await sql()`SELECT * FROM entries WHERE slug=${slug} AND kind='project' AND published=true LIMIT 1`;
    return rows.length?transform(rows[0]):null;
  } catch(error) {
    logDatabaseError('getEntry',error);
    return demoEntries.find(e=>e.slug===slug&&e.published)||null;
  }
}

export async function getSettings():Promise<SiteSettings>{
  if(!hasDatabase()) return defaults;

  try {
    const rows=await sql()`SELECT value FROM site_settings WHERE key='site' LIMIT 1`;
    return {...defaults,...(rows[0]?.value||{})};
  } catch(error) {
    logDatabaseError('getSettings',error);
    return defaults;
  }
}

export async function saveSettings(settings:SiteSettings){
  await sql()`INSERT INTO site_settings(key,value) VALUES ('site',${JSON.stringify(settings)}::jsonb) ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value`
}

export async function createEntry(e:Entry){
  const rows=await sql()`INSERT INTO entries (kind,slug,title,subtitle,description,cover,gallery,tags,metadata,featured,published,sort_order) VALUES (${e.kind},${e.slug},${e.title},${e.subtitle},${e.description},${e.cover},${JSON.stringify(e.gallery)}::jsonb,${JSON.stringify(e.tags)}::jsonb,${e.metadata?JSON.stringify(e.metadata):'{}'}::jsonb,${e.featured},${e.published},${e.sort_order}) RETURNING *`;
  return transform(rows[0]);
}

export async function updateEntry(id:string,e:Entry){
  const rows=await sql()`UPDATE entries SET kind=${e.kind},slug=${e.slug},title=${e.title},subtitle=${e.subtitle},description=${e.description},cover=${e.cover},gallery=${JSON.stringify(e.gallery)}::jsonb,tags=${JSON.stringify(e.tags)}::jsonb,metadata=${JSON.stringify(e.metadata)}::jsonb,featured=${e.featured},published=${e.published},sort_order=${e.sort_order},updated_at=NOW() WHERE id=${id}::uuid RETURNING *`;
  return rows.length?transform(rows[0]):null;
}

export async function deleteEntry(id:string){await sql()`DELETE FROM entries WHERE id=${id}::uuid`;}

export async function addMessage(name:string,email:string,subject:string,message:string){
  await sql()`INSERT INTO messages(name,email,subject,message) VALUES (${name},${email},${subject},${message})`;
}

export async function getMessages():Promise<Message[]>{
  const rows=await sql()`SELECT id,name,email,subject,message,is_read,created_at FROM messages ORDER BY created_at DESC LIMIT 200`;
  return rows.map((row:any)=>({...row,is_read:Boolean(row.is_read)}));
}

export async function setMessageRead(id:string,read:boolean){
  await sql()`UPDATE messages SET is_read=${read} WHERE id=${id}::uuid`;
}

export async function markAllMessagesRead(read=true){
  await sql()`UPDATE messages SET is_read=${read} WHERE is_read=${!read}`;
}

export async function deleteMessage(id:string){
  return sql()`DELETE FROM messages WHERE id=${id}::uuid`;
}
