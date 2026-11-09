import { handleUpload,type HandleUploadBody } from '@vercel/blob/client';
import { isAdmin } from '@/lib/auth';
export async function POST(req:Request){
 // Token generation requires an authenticated session; completion callbacks are verified by the Blob SDK.
 try{
  const body=(await req.json()) as HandleUploadBody;
  const result=await handleUpload({body,request:req,onBeforeGenerateToken:async(pathname)=>{
   if(!await isAdmin())throw new Error('Unauthorized');
   if(!pathname.startsWith('portfolio/'))throw new Error('Invalid file path');
   return {allowedContentTypes:['image/jpeg','image/png','image/webp','image/gif','application/pdf'],maximumSizeInBytes:25*1024*1024,addRandomSuffix:true};
  },onUploadCompleted:async()=>{}});
  return Response.json(result);
 }catch(error){return Response.json({error:(error as Error).message},{status:400})}
}
