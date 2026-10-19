export function appOrigin(value=process.env.BETTER_AUTH_URL){
  const message='Configure BETTER_AUTH_URL as an HTTP(S) origin, for example https://your-app.vercel.app.';
  if(typeof value!=='string'||!value.trim())throw new Error(message);
  let input=value.trim();
  // Vercel hostnames are sometimes pasted without their HTTPS scheme.
  if(/^[a-z\d](?:[a-z\d.-]*[a-z\d])?(?::\d{1,5})?\/?$/i.test(input))input=`https://${input}`;
  let url;
  try{url=new URL(input);}catch{throw new Error(message);}
  if(!['https:','http:'].includes(url.protocol)||!url.hostname||url.username||url.password||url.pathname!=='/'||url.search||url.hash)throw new Error(message);
  return url.origin;
}
