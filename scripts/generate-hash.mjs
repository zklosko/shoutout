import { randomBytes, scrypt } from "node:crypto";

const password = process.argv[2];
if (!password) {
  console.error("Usage: node generate-hash.js <password>");
  process.exit(1);
}

const salt = randomBytes(16).toString("hex");
scrypt(password, salt, 64, (err, derivedKey) => {
  if (err) throw err;
  console.log(`${salt}:${derivedKey.toString("hex")}`);
});
