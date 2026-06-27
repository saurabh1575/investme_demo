const fs = require('fs');
let schema = fs.readFileSync('c:/Users/pc/Downloads/investme-fullstack/investme/backend/prisma/schema.prisma', 'utf8');

// Remove enums
schema = schema.replace(/enum Role {[\s\S]*?}/, '');
schema = schema.replace(/enum SessionType {[\s\S]*?}/, '');
schema = schema.replace(/enum PaymentStatus {[\s\S]*?}/, '');

// Replace enum usages with String
schema = schema.replace(/role\s+Role\s+@default\(FOUNDER\)/g, 'role String @default("FOUNDER")');
schema = schema.replace(/type\s+SessionType/g, 'type String');
schema = schema.replace(/status\s+PaymentStatus\s+@default\(CREATED\)/g, 'status String @default("CREATED")');

// Replace String[] with String (we'll just use simple text/JSON string later)
schema = schema.replace(/String\[\]/g, 'String');

// Remove Prisma Json type (SQLite doesn't support Json in Prisma natively, fallback to String)
schema = schema.replace(/Json/g, 'String');

fs.writeFileSync('c:/Users/pc/Downloads/investme-fullstack/investme/backend/prisma/schema.prisma', schema);
console.log('Schema fixed for SQLite!');
