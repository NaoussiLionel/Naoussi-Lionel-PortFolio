import type { Entry,Kind,SiteSettings } from './types';
import { defaults } from './defaults';
const kinds:Kind[]=['project','experience','education','skill','certification','service'];
const txt=(v:unknown,len=5000)=>typeof v==='string'?v.trim().slice(0,len):'';
export function validEntry(input:any):Entry {
 if(!input || !kinds.includes(input.kind))throw new Error('Invalid content category');
 const title=txt(input.title,180);if(!title)throw new Error('Title is required');
 const slug=txt(input.slug,120).toLowerCase().replace(/[^a-z0-9-]/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'');if(!slug)throw new Error('Invalid slug');
 // Media references must be HTTPS URLs or absent.
 const url=(v:any)=>{const s=txt(v,1500);return /^https:\/\//.test(s)?s:'';};
 return {id:txt(input.id,80),kind:input.kind,title,slug,subtitle:txt(input.subtitle,250),description:txt(input.description,15000),cover:url(input.cover),gallery:Array.isArray(input.gallery)?input.gallery.map(url).filter(Boolean).slice(0,60):[],tags:Array.isArray(input.tags)?input.tags.map((t:any)=>txt(t,60)).filter(Boolean).slice(0,30):[],metadata:input.metadata&&typeof input.metadata==='object'?Object.fromEntries(Object.entries(input.metadata).slice(0,40).map(([k,v])=>[txt(k,80),txt(v,300)])): {},featured:Boolean(input.featured),published:Boolean(input.published),sort_order:Number.isFinite(+input.sort_order)?Math.max(0,Math.min(99999,+input.sort_order)):0};
}
export function validSettings(v:any):SiteSettings {const r={...defaults};for(const [k,value] of Object.entries(defaults)){if(typeof value==='boolean')(r as any)[k]=Boolean(v?.[k]);else (r as any)[k]=txt(v?.[k]??value, k==='about'?12000:2000);}for(const k of ['heroImage','profileImage','cvUrl'] as const){if(r[k]&&!/^https:\/\//.test(r[k]))r[k]='';}for(const k of ['accent','accentAlt'] as const){if(!/^#[0-9a-fA-F]{6}$/.test(r[k]))r[k]=defaults[k];}const o=parseFloat(r.gridOpacity);r.gridOpacity=String(Number.isFinite(o)?Math.max(0,Math.min(0.8,o)):0.38);return r;}
