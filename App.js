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
  origin: [
    'https://jamiahub.github.io',
    'http://localhost:3000',
    'http://localhost:5173' // Vite dev server
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Set-Cookie']
}));

app.use(json());
app.use(cookieParser());

// Connect to database once
let isConnected = false;

const dbMiddleware = async (req, res, next) => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
  next();
};

app.use(dbMiddleware);

app.use('/uploads', express.static('uploads'));
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/chats', chatRouter);
app.use('/api/admin', adminRouter);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

// Export for Vercel serverless
export default app;