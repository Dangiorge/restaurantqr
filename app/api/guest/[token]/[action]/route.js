import {database} from '@/lib/db.mjs';
import {body,HttpError,respond,sameOrigin} from '@/lib/http.mjs';
import {cartInput,orderInput,serviceInput,quoteOrder,placeOrder,requestService} from '@/modules/ordering/service.mjs';

export function POST(request,{params}){
  return respond(async()=>{
    sameOrigin(request);
    const {token,action}=await params;
    if(action==='quote')return quoteOrder(database(),token,await body(request,cartInput));
    if(action==='order')return placeOrder(database(),token,await body(request,orderInput));
    if(action==='service')return requestService(database(),token,await body(request,serviceInput));
    throw new HttpError(404,'Unknown action.');
  });
}
