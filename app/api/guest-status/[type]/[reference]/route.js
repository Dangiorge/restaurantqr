import {database} from '@/lib/db.mjs';
import {HttpError,respond} from '@/lib/http.mjs';
import {guestStatus} from '@/modules/ordering/service.mjs';
export function GET(request,{params}){
  return respond(async()=>{
    const {type,reference}=await params;
    if(!['order','service'].includes(type))throw new HttpError(404,'Unknown reference type.');
    return guestStatus(database(),reference,type);
  });
}
