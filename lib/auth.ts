import { SignJWT,jwtVerify } from 'jose';
import { cookies } from 'next/headers';
const cookieName='blueprint_admin_session';
function secret(){if(!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length<32)throw new Error('Set a SESSION_SECRET of at least 32 characters');return new TextEncoder().encode(process.env.SESSION_SECRET);}
export async function makeSession(){return new SignJWT({role:'admin'}).setProtectedHeader({alg:'HS256'}).setIssuedAt().setExpirationTime('7d').sign(secret());}
export async function isAdmin(){try{const c=(await cookies()).get(cookieName)?.value;if(!c)return false;const {payload}=await jwtVerify(c,secret());return payload.role==='admin';}catch{return false;}}
export const adminCookie=cookieName;
