import express, { json } from 'express';
import { config } from 'dotenv';
import authRouter from './routes/authRouter.js';
import userRouter from './routes/userRouter.js'; 
import chatRouter from './routes/chatRouter.js';
import adminRouter from './routes/adminrouter.js';
import { connectDB } from './lib/db.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
config();
const app = express();
app.use(cors({
  origin: 'https://mahtab-madni.github.io/JamiaHub.github.io/', // Your exact frontend URL
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Set-Cookie']
}));
app.use(json());
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/chats', chatRouter);
app.use('/api/admin', adminRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on  http://localhost:${PORT}`);
    connectDB();
});

