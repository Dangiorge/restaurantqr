// Public projections intentionally exclude memberships, contacts, internal IDs,
// audit data and all authentication/provider configuration.
export async function publicRestaurant(db,slug) {
  if(typeof slug!=='string'||!slug||slug.length>80)return null;
  return db.restaurant.findFirst({where:{slug,status:'ACTIVE'},select:{
    name:true,slug:true,description:true,address:true,phone:true,logoUrl:true,primaryColor:true,
    settings:{select:{currency:true,taxRate:true,serviceChargeRate:true}},
    branches:{where:{active:true},select:{name:true,address:true,phone:true,timezone:true,openingHours:true},orderBy:{name:'asc'}},
    menus:{where:{active:true},select:{name:true,documentUrl:true,categories:{where:{active:true},orderBy:{displayOrder:'asc'},select:{id:true,name:true,items:{where:{active:true},orderBy:{displayOrder:'asc'},select:{id:true,name:true,description:true,photoUrl:true,basePrice:true,available:true,dietaryLabels:true,allergens:true}}}}}},
  }});
}
