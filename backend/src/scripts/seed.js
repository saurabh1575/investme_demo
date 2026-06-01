import { readDb, writeDb } from "../db/fileDb.js";

const db = await readDb();
await writeDb(db);
console.log("InvestMe database ready.");
