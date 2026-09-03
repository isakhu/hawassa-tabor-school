const fs = require("fs");
const path = require("path");

const source = path.join(process.cwd(), "frontend", ".next");
const destination = path.join(process.cwd(), ".next");

if (!fs.existsSync(source)) {
  throw new Error(`Next.js build output not found at ${source}`);
}

fs.rmSync(destination, { recursive: true, force: true });
fs.cpSync(source, destination, { recursive: true });
console.log(`Prepared Vercel output: ${destination}`);
