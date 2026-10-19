import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const values = ['DATABASE_URL','BETTER_AUTH_SECRET'].map(name => process.env[name]).filter(Boolean);
if (values.length !== 2) throw new Error('Load the environment before checking client bundles.');
if(process.env.CLOUDINARY_URL){values.push(process.env.CLOUDINARY_URL);try{values.push(decodeURIComponent(new URL(process.env.CLOUDINARY_URL).password));}catch{throw new Error('Invalid Cloudinary configuration.');}}
function check(path) {
  for (const entry of readdirSync(path, { withFileTypes: true })) {
    const next = join(path, entry.name);
    if (entry.isDirectory()) check(next);
    else if (values.some(value => readFileSync(next).includes(Buffer.from(value)))) throw new Error(`Secret detected in client artifact: ${next}`);
  }
}
check('.next/static');
console.log('Client artifact secret scan passed.');
