import bcrypt from 'bcryptjs';
const p=process.argv[2];if(!p||p.length<12){console.error('Usage: npm run auth:hash -- "unique-password-12-chars-minimum"');process.exit(1)}
console.log(await bcrypt.hash(p,12));
