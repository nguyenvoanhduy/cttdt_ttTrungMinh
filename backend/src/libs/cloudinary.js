import dotenv from 'dotenv';
import { v2 as cloudinary } from "cloudinary";

// Ensure dotenv is loaded
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Verify Cloudinary configuration
const config = cloudinary.config();
console.log('Cloudinary configured:', {
  cloud_name: config.cloud_name,
  api_key: config.api_key ? '***' + config.api_key.slice(-4) : 'NOT SET',
  api_secret: config.api_secret ? 'SET' : 'NOT SET'
});

export default cloudinary;
