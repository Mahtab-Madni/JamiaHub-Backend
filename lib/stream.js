import { StreamChat } from 'stream-chat';
import 'dotenv/config';

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

if (!apiKey || !apiSecret) {
  console.error("STREAM_API_KEY and STREAM_API_SECRET must be set in environment variables");
}

const streamClient = StreamChat.getInstance(apiKey, apiSecret);

export const upsertStreamUser = async (userData) => {
  try {
    await streamClient.upsertUser(userData);
    return userData;
  } catch (err) {
    console.error("Error upserting Stream user:", err);
    throw err; 
  }
}

export const generateStreamToken = (userId) => { 
  try {
    const token = streamClient.createToken(userId);
    return token;
  } catch (err) {
    console.error("Error generating Stream token:", err);
    throw err; 
  }
}