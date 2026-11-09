import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { adminCookie,makeSession } from '@/lib/auth';
export async function POST(req:Request){
 try{const {email,password}=await req.json();const expectedEmail=process.env.ADMIN_EMAIL;const hash=process.env.ADMIN_PASSWORD_HASH;
 if(!expectedEmail||!hash||!process.env.SESSION_SECRET)return NextResponse.json({error:'Admin credentials are not configured. See README.'},{status:503});
 const emailMatches=typeof email==='string'&&email.toLowerCase()===expectedEmail.toLowerCase();
 const match=typeof password==='string'&&password.length<200&&await bcrypt.compare(password,hash);
 if(!emailMatches||!match)return NextResponse.json({error:'Invalid email or password'},{status:401});
 const res=NextResponse.json({ok:true});res.cookies.set(adminCookie,await makeSession(),{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/',maxAge:60*60*24*7});return res;
 }catch{return NextResponse.json({error:'Unable to sign in'},{status:400})}
}
