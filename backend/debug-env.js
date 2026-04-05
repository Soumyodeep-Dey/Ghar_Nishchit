import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';

// Try loading .env
const result = dotenv.config({ path: './.env' });
console.log('Dotenv Load Result:', result.error ? 'Error: ' + result.error.message : 'Success');
console.log('Parsed Env Keys:', result.parsed ? Object.keys(result.parsed) : 'None');

console.log('MONGODB_URI:', process.env.MONGODB_URI);

const uri = process.env.MONGODB_URI ? `${process.env.MONGODB_URI}/gharNishchit` : undefined;
console.log('Full Connection URI:', uri);

if (!uri) {
    console.error('❌ MONGODB_URI is undefined. Cannot attempt connection.');
    process.exit(1);
}

console.log('Attempting Mongoose Connection...');
try {
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host} `);
    await conn.disconnect();
} catch (error) {
    console.error('❌ Connection Failed:', error);
}
