import { addMessage,hasDatabase } from '@/lib/db';
export async function POST(req:Request){
 try{const data=await req.json();if(data.website)return Response.json({ok:true});
 const name=String(data.name||'').trim().slice(0,100),email=String(data.email||'').trim().slice(0,200),subject=String(data.subject||'Portfolio enquiry').trim().slice(0,140),message=String(data.message||'').trim().slice(0,5000);
 if(name.length<2||!/^\S+@\S+\.\S+$/.test(email)||message.length<10)return Response.json({error:'Please enter a name, valid email and message (at least 10 characters).'}, {status:400});
 if(!hasDatabase())return Response.json({error:'Contact form is not yet connected to a database.'},{status:503});
 await addMessage(name,email,subject,message);return Response.json({ok:true});
 }catch{return Response.json({error:'Could not send your enquiry'},{status:400})}
}
