import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './libs/db.js';
import authRoute from './routes/authRoute.js';
import cookieParser from 'cookie-parser';
import userRoute from './routes/userRoute.js';
import { protectedRoute } from './middlewares/authMiddleware.js';
import eventRoute from './routes/eventRoute.js';
import templeRoute from './routes/templeRoute.js';
import personalRoute from './routes/personalRoute.js';
import departmentRoute from './routes/departmentRoute.js';
import songRoute from './routes/songRoute.js';
import bookRoute from './routes/bookRoute.js';



dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: 'http://localhost:5173', // Thay đổi thành địa chỉ frontend của bạn
    credentials: true, // Cho phép gửi cookie
}));
// Middleware để phân tích JSON
app.use(express.json());
app.use(cookieParser());

// public routes
app.use('/api/auth', authRoute);
app.use('/api/events', eventRoute);
app.use('/api/temples', templeRoute);
app.use('/api/personals', personalRoute);
app.use('/api/departments', departmentRoute);
app.use('/api/songs', songRoute);
app.use('/api/books', bookRoute);


//private routes
app.use(protectedRoute);
app.use('/api/users', userRoute); 
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server bắt đầu trên cổng ${PORT}`);
    });
});



