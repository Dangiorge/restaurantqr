import {database} from '@/lib/db.mjs';
import {body,currentUser,respond,sameOrigin} from '@/lib/http.mjs';
import {operations,updateOperation,operationInput} from '@/modules/ordering/service.mjs';
export function GET(request,{params}){return respond(async()=>operations(database(),await currentUser(request),(await params).restaurantId));}
export function PATCH(request,{params}){return respond(async()=>{sameOrigin(request);return updateOperation(database(),await currentUser(request),(await params).restaurantId,await body(request,operationInput));});}
